#!/usr/bin/env node
/**
 * HubSpot CRM Data Connector
 *
 * Obtiene datos REALES de HubSpot CRM via API:
 * - Contactos: lifecycle stage, fuente de tráfico, atribución
 * - Deals: pipeline stages, montos, tasas de conversión
 * - Campañas: presupuestos, UTMs, estados
 *
 * Dos modos de ejecución:
 *   --mode=full          Full rebuild, 730 días (semanal, ~35 min)
 *   --mode=incremental   Solo últimos 7 días, merge con data existente (diario, ~3 min)
 *
 * Uso:
 *   node hubspot_api.js --client=ucsp --mode=full
 *   node hubspot_api.js --client=ucsp --mode=incremental
 *
 * Requiere:
 *   HUBSPOT_ACCESS_TOKEN en .env o variable de entorno
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import axios from 'axios';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HUBSPOT_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const BASE_URL = 'https://api.hubapi.com';

// ============================================================================
// ARGUMENTOS
// ============================================================================
function parseArgs() {
  const args = process.argv.slice(2);
  const options = { client: 'ucsp', mode: 'full' };
  args.forEach(arg => {
    if (arg.startsWith('--client=')) options.client = arg.split('=')[1];
    if (arg.startsWith('--mode=')) options.mode = arg.split('=')[1];
  });
  return options;
}

// ============================================================================
// CARGAR CONFIG
// ============================================================================
async function loadClientConfig(clientName) {
  const configPath = path.join(__dirname, 'config', `${clientName}.json`);
  try {
    const content = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Config no encontrada: ${configPath}`);
    process.exit(1);
  }
}

// ============================================================================
// HTTP HELPER — with automatic retry on 429 rate limit
// ============================================================================
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function hubspotFetch(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const maxRetries = 5;

  const axiosConfig = {
    method: options.method || 'GET',
    url,
    headers: {
      'Authorization': `Bearer ${HUBSPOT_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers
    },
    timeout: 30000
  };

  if (options.body) {
    axiosConfig.data = options.body;
  }

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios(axiosConfig);
      return response.data;
    } catch (error) {
      const status = error.response?.status;
      if (status === 429 && attempt < maxRetries) {
        // Rate limited — wait with exponential backoff (1s, 2s, 4s, 8s, 16s)
        const waitMs = Math.pow(2, attempt) * 1000;
        console.log(`     [Rate limit] Esperando ${waitMs / 1000}s antes de reintentar...`);
        await sleep(waitMs);
        continue;
      }
      if (error.response) {
        throw new Error(`HubSpot API ${status}: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }
}

// Paginated fetch - retrieves all results
async function hubspotFetchAll(endpoint, options = {}) {
  const allResults = [];
  let after = undefined;
  const limit = options.limit || 100;

  do {
    const separator = endpoint.includes('?') ? '&' : '?';
    const paginatedEndpoint = after
      ? `${endpoint}${separator}limit=${limit}&after=${after}`
      : `${endpoint}${separator}limit=${limit}`;

    const data = await hubspotFetch(paginatedEndpoint, options);
    allResults.push(...(data.results || []));
    after = data.paging?.next?.after || null;
  } while (after);

  return allResults;
}

// ============================================================================
// DATA FETCHERS
// ============================================================================

/**
 * Fetch contacts created in the last N days with key properties
 */
async function fetchRecentContacts(days = 90) {
  console.log(`\n   Obteniendo contactos (ultimos ${days} dias)...`);

  const properties = [
    'firstname', 'lastname', 'email', 'lifecyclestage',
    'hs_analytics_source', 'hs_analytics_source_data_1',
    'hs_analytics_source_data_2',
    'hs_lead_status', 'num_conversion_events',
    'first_conversion_event_name', 'recent_conversion_event_name',
    'hs_analytics_num_page_views', 'hs_analytics_num_visits',
    'createdate'
  ];

  // Batch by time windows to avoid HubSpot's 10000-result search limit
  const allContacts = [];
  const windowDays = 30; // fetch 30 days at a time
  const now = new Date();

  for (let offset = 0; offset < days; offset += windowDays) {
    const windowEnd = new Date(now);
    windowEnd.setDate(windowEnd.getDate() - offset);
    const windowStart = new Date(now);
    windowStart.setDate(windowStart.getDate() - Math.min(offset + windowDays, days));

    try {
      let after = undefined;
      let windowCount = 0;
      do {
        const body = {
          filterGroups: [{
            filters: [
              { propertyName: 'createdate', operator: 'GTE', value: windowStart.getTime().toString() },
              { propertyName: 'createdate', operator: 'LT', value: windowEnd.getTime().toString() }
            ]
          }],
          properties,
          limit: 100,
          ...(after ? { after } : {})
        };

        const data = await hubspotFetch('/crm/v3/objects/contacts/search', {
          method: 'POST',
          body
        });

        const results = data.results || [];
        allContacts.push(...results);
        windowCount += results.length;
        after = data.paging?.next?.after || null;
      } while (after);

      if (windowCount > 0) {
        console.log(`     Ventana ${windowStart.toISOString().split('T')[0]} → ${windowEnd.toISOString().split('T')[0]}: ${windowCount} contactos`);
      }
    } catch (err) {
      console.log(`     [WARN] Ventana ${windowStart.toISOString().split('T')[0]} → ${windowEnd.toISOString().split('T')[0]} falló: ${err.message}`);
      // Continue with next window instead of crashing
    }
  }

  console.log(`   Contactos totales: ${allContacts.length}`);
  return allContacts;
}

/**
 * Fetch deals with pipeline and stage info
 */
async function fetchRecentDeals(days = 90) {
  console.log(`\n   Obteniendo deals (ultimos ${days} dias)...`);

  const properties = [
    'dealname', 'amount', 'dealstage', 'pipeline',
    'closedate', 'createdate', 'hs_lastmodifieddate'
  ];

  // Batch by time windows to avoid HubSpot's 10000-result search limit
  const allDeals = [];
  const windowDays = 30;
  const now = new Date();

  for (let offset = 0; offset < days; offset += windowDays) {
    const windowEnd = new Date(now);
    windowEnd.setDate(windowEnd.getDate() - offset);
    const windowStart = new Date(now);
    windowStart.setDate(windowStart.getDate() - Math.min(offset + windowDays, days));

    try {
      let after = undefined;
      let windowCount = 0;
      do {
        const body = {
          filterGroups: [{
            filters: [
              { propertyName: 'createdate', operator: 'GTE', value: windowStart.getTime().toString() },
              { propertyName: 'createdate', operator: 'LT', value: windowEnd.getTime().toString() }
            ]
          }],
          properties,
          limit: 100,
          ...(after ? { after } : {})
        };

        const data = await hubspotFetch('/crm/v3/objects/deals/search', {
          method: 'POST',
          body
        });

        const results = data.results || [];
        allDeals.push(...results);
        windowCount += results.length;
        after = data.paging?.next?.after || null;
      } while (after);

      if (windowCount > 0) {
        console.log(`     Ventana ${windowStart.toISOString().split('T')[0]} → ${windowEnd.toISOString().split('T')[0]}: ${windowCount} deals`);
      }
    } catch (err) {
      console.log(`     [WARN] Ventana ${windowStart.toISOString().split('T')[0]} → ${windowEnd.toISOString().split('T')[0]} falló: ${err.message}`);
    }
  }

  console.log(`   Deals totales: ${allDeals.length}`);
  return allDeals;
}

/**
 * Fetch deal-to-contact associations and contact sources in batches.
 * Returns a Map: dealId → source (hs_analytics_source)
 */
async function fetchDealContactSources(dealIds) {
  console.log(`\n   Obteniendo fuentes de contacto para ${dealIds.length} deals...`);
  const dealSourceMap = new Map();
  const batchSize = 100;

  for (let i = 0; i < dealIds.length; i += batchSize) {
    const batch = dealIds.slice(i, i + batchSize);
    try {
      // Get deal→contact associations
      const body = {
        inputs: batch.map(id => ({ id }))
      };
      const assocData = await hubspotFetch('/crm/v3/associations/deals/contacts/batch/read', {
        method: 'POST',
        body
      });

      // Collect unique contact IDs
      const contactIds = new Set();
      const dealContactMap = new Map();
      (assocData.results || []).forEach(r => {
        const dealId = r.from?.id;
        const contactId = r.to?.[0]?.id;
        if (dealId && contactId) {
          dealContactMap.set(dealId, contactId);
          contactIds.add(contactId);
        }
      });

      // Fetch contact sources in batch
      if (contactIds.size > 0) {
        const contactBatchBody = {
          inputs: [...contactIds].map(id => ({ id })),
          properties: ['hs_analytics_source']
        };
        const contactData = await hubspotFetch('/crm/v3/objects/contacts/batch/read', {
          method: 'POST',
          body: contactBatchBody
        });

        const contactSourceMap = new Map();
        (contactData.results || []).forEach(c => {
          contactSourceMap.set(c.id, c.properties?.hs_analytics_source || 'unknown');
        });

        // Map deal → source
        dealContactMap.forEach((contactId, dealId) => {
          dealSourceMap.set(dealId, contactSourceMap.get(contactId) || 'unknown');
        });
      }
    } catch (e) {
      console.log(`   ⚠️ Batch ${i}-${i + batchSize}: ${e.message}`);
    }

    // Rate limit: small delay between batches
    if (i + batchSize < dealIds.length) {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  console.log(`   Fuentes obtenidas: ${dealSourceMap.size} de ${dealIds.length} deals`);
  return dealSourceMap;
}

/**
 * Fetch deal pipelines with stages
 */
async function fetchPipelines() {
  console.log('\n   Obteniendo pipelines...');
  const data = await hubspotFetch('/crm/v3/pipelines/deals');
  const pipelines = data.results || [];
  console.log(`   Pipelines: ${pipelines.length}`);
  return pipelines;
}

/**
 * Fetch marketing campaigns
 */
async function fetchCampaigns() {
  console.log('\n   Obteniendo campanas de marketing...');

  const properties = [
    'hs_name', 'hs_goal', 'hs_start_date', 'hs_end_date',
    'hs_campaign_status', 'hs_budget_items_sum_amount',
    'hs_spend_items_sum_amount', 'hs_utm'
  ].join(',');

  const allCampaigns = [];
  let after = undefined;

  do {
    const separator = '?';
    let endpoint = `/marketing/v3/campaigns?properties=${properties}&limit=100`;
    if (after) endpoint += `&after=${after}`;

    const data = await hubspotFetch(endpoint);
    allCampaigns.push(...(data.results || []));
    after = data.paging?.next?.after || null;
  } while (after);

  console.log(`   Campanas: ${allCampaigns.length}`);
  return allCampaigns;
}

// ============================================================================
// DATA ANALYSIS
// ============================================================================

function analyzeContacts(contacts) {
  console.log('\n   Analizando contactos...');

  // Lifecycle stage distribution
  const lifecycleDistribution = {};
  const sourceDistribution = {};
  const conversionEvents = { total: 0, withEvents: 0 };
  const monthlyCreation = {};
  const dailyCreation = {};
  const dailyBySource = {};

  contacts.forEach(c => {
    const props = c.properties || {};

    // Lifecycle
    const stage = props.lifecyclestage || 'unknown';
    lifecycleDistribution[stage] = (lifecycleDistribution[stage] || 0) + 1;

    // Source
    const source = props.hs_analytics_source || 'unknown';
    sourceDistribution[source] = (sourceDistribution[source] || 0) + 1;

    // Conversions
    const numConversions = parseInt(props.num_conversion_events || '0', 10);
    conversionEvents.total += numConversions;
    if (numConversions > 0) conversionEvents.withEvents++;

    // Monthly trend
    if (props.createdate) {
      const month = props.createdate.substring(0, 7); // YYYY-MM
      monthlyCreation[month] = (monthlyCreation[month] || 0) + 1;

      const day = props.createdate.substring(0, 10); // YYYY-MM-DD
      dailyCreation[day] = (dailyCreation[day] || 0) + 1;

      // Daily by source (for date-filtered channel distribution)
      if (!dailyBySource[day]) dailyBySource[day] = {};
      dailyBySource[day][source] = (dailyBySource[day][source] || 0) + 1;
    }
  });

  const conversionRate = contacts.length > 0
    ? (conversionEvents.withEvents / contacts.length * 100).toFixed(1)
    : 0;

  return {
    total: contacts.length,
    lifecycle_distribution: lifecycleDistribution,
    source_distribution: sourceDistribution,
    conversion_rate: parseFloat(conversionRate),
    avg_conversions_per_contact: contacts.length > 0
      ? parseFloat((conversionEvents.total / contacts.length).toFixed(2))
      : 0,
    monthly_creation: monthlyCreation,
    daily_creation: dailyCreation,
    daily_by_source: dailyBySource
  };
}

function analyzeDeals(deals, pipelines, dealSourceMap = new Map()) {
  console.log('\n   Analizando deals...');

  // Build stage label lookup
  const stageLabels = {};
  const pipelineLabels = {};
  pipelines.forEach(p => {
    pipelineLabels[p.id] = p.label;
    (p.stages || []).forEach(s => {
      stageLabels[s.id] = s.label;
    });
  });

  const pipelineDistribution = {};
  const stageDistribution = {};
  const revenueByPipeline = {};
  const monthlyDeals = {};
  const dailyDeals = {};
  const dailyByPipeline = {};
  const dailyByPipelineStage = {};  // { pipelineName: { day: { stageName: count } } }
  const dailyRevenue = {};           // { day: { pipelineName: amount } }
  let totalAmount = 0;
  let wonDeals = 0;
  let lostDeals = 0;

  deals.forEach(d => {
    const props = d.properties || {};
    const pipelineId = props.pipeline || 'default';
    const stageId = props.dealstage || 'unknown';
    const amount = parseFloat(props.amount || '0');
    const pipelineName = pipelineLabels[pipelineId] || pipelineId;
    const stageName = stageLabels[stageId] || stageId;

    // Pipeline distribution
    pipelineDistribution[pipelineName] = (pipelineDistribution[pipelineName] || 0) + 1;

    // Stage distribution per pipeline
    if (!stageDistribution[pipelineName]) stageDistribution[pipelineName] = {};
    stageDistribution[pipelineName][stageName] = (stageDistribution[pipelineName][stageName] || 0) + 1;

    // Revenue
    if (amount > 0) {
      revenueByPipeline[pipelineName] = (revenueByPipeline[pipelineName] || 0) + amount;
      totalAmount += amount;
    }

    // Win/loss tracking
    const stage = pipelines
      .flatMap(p => p.stages || [])
      .find(s => s.id === stageId);

    if (stage?.metadata?.isClosed === 'true') {
      if (parseFloat(stage.metadata.probability || '0') > 0) {
        wonDeals++;
      } else {
        lostDeals++;
      }
    }

    // Monthly trend
    if (props.createdate) {
      const month = props.createdate.substring(0, 7);
      monthlyDeals[month] = (monthlyDeals[month] || 0) + 1;

      // Daily trend
      const day = props.createdate.substring(0, 10); // YYYY-MM-DD
      dailyDeals[day] = (dailyDeals[day] || 0) + 1;

      // Daily by pipeline
      if (!dailyByPipeline[day]) dailyByPipeline[day] = {};
      dailyByPipeline[day][pipelineName] = (dailyByPipeline[day][pipelineName] || 0) + 1;

      // Daily by pipeline + stage (for date-filtered funnel & ganados/perdidos)
      if (!dailyByPipelineStage[pipelineName]) dailyByPipelineStage[pipelineName] = {};
      if (!dailyByPipelineStage[pipelineName][day]) dailyByPipelineStage[pipelineName][day] = {};
      dailyByPipelineStage[pipelineName][day][stageName] = (dailyByPipelineStage[pipelineName][day][stageName] || 0) + 1;

      // Daily revenue by pipeline
      if (amount > 0) {
        if (!dailyRevenue[day]) dailyRevenue[day] = {};
        dailyRevenue[day][pipelineName] = (dailyRevenue[day][pipelineName] || 0) + amount;
      }
    }
  });

  // Source attribution per pipeline (channel breakdown)
  const sourceByPipeline = {};
  const dailySourceByPipeline = {};  // { pipelineName: { day: { source: count } } }
  deals.forEach(d => {
    const props = d.properties || {};
    const pipelineId = props.pipeline || 'default';
    const pipelineName = pipelineLabels[pipelineId] || pipelineId;
    const source = dealSourceMap.get(d.id) || 'unknown';

    if (!sourceByPipeline[pipelineName]) sourceByPipeline[pipelineName] = {};
    sourceByPipeline[pipelineName][source] = (sourceByPipeline[pipelineName][source] || 0) + 1;

    // Daily source by pipeline (for date-filtered channel breakdown per program)
    const day = props.createdate?.substring(0, 10);
    if (day) {
      if (!dailySourceByPipeline[pipelineName]) dailySourceByPipeline[pipelineName] = {};
      if (!dailySourceByPipeline[pipelineName][day]) dailySourceByPipeline[pipelineName][day] = {};
      dailySourceByPipeline[pipelineName][day][source] = (dailySourceByPipeline[pipelineName][day][source] || 0) + 1;
    }
  });

  // Won/lost per pipeline
  const wonLostByPipeline = {};
  deals.forEach(d => {
    const props = d.properties || {};
    const pipelineId = props.pipeline || 'default';
    const stageId = props.dealstage || 'unknown';
    const pipelineName = pipelineLabels[pipelineId] || pipelineId;

    if (!wonLostByPipeline[pipelineName]) {
      wonLostByPipeline[pipelineName] = { won: 0, lost: 0, total: 0 };
    }
    wonLostByPipeline[pipelineName].total++;

    const stage = pipelines
      .flatMap(p => p.stages || [])
      .find(s => s.id === stageId);

    if (stage?.metadata?.isClosed === 'true') {
      if (parseFloat(stage.metadata.probability || '0') > 0) {
        wonLostByPipeline[pipelineName].won++;
      } else {
        wonLostByPipeline[pipelineName].lost++;
      }
    }
  });

  const closedDeals = wonDeals + lostDeals;
  const winRate = closedDeals > 0
    ? parseFloat((wonDeals / closedDeals * 100).toFixed(1))
    : 0;

  return {
    total: deals.length,
    pipeline_distribution: pipelineDistribution,
    stage_distribution: stageDistribution,
    won_lost_by_pipeline: wonLostByPipeline,
    source_by_pipeline: sourceByPipeline,
    revenue: {
      total: totalAmount,
      by_pipeline: revenueByPipeline,
      avg_deal_value: deals.length > 0
        ? parseFloat((totalAmount / deals.length).toFixed(2))
        : 0
    },
    win_rate: winRate,
    won_deals: wonDeals,
    lost_deals: lostDeals,
    monthly_deals: monthlyDeals,
    daily_deals: dailyDeals,
    daily_by_pipeline: dailyByPipeline,
    daily_by_pipeline_stage: dailyByPipelineStage,
    daily_source_by_pipeline: dailySourceByPipeline,
    daily_revenue: dailyRevenue
  };
}

function analyzeCampaigns(campaigns) {
  console.log('\n   Analizando campanas...');

  const activeCampaigns = [];
  let totalBudget = 0;
  let totalSpend = 0;

  campaigns.forEach(c => {
    const props = c.properties || {};
    const name = props.hs_name || 'Sin nombre';
    const status = props.hs_campaign_status || 'unknown';
    const budget = parseFloat(props.hs_budget_items_sum_amount || '0');
    const spend = parseFloat(props.hs_spend_items_sum_amount || '0');

    totalBudget += budget;
    totalSpend += spend;

    // Only include campaigns with some data
    if (name !== 'Sin nombre') {
      activeCampaigns.push({
        id: c.id,
        name,
        status,
        start_date: props.hs_start_date || null,
        end_date: props.hs_end_date || null,
        budget,
        spend,
        utm: props.hs_utm ? decodeURIComponent(props.hs_utm) : null
      });
    }
  });

  // Sort by start_date descending
  activeCampaigns.sort((a, b) => {
    if (!a.start_date) return 1;
    if (!b.start_date) return -1;
    return b.start_date.localeCompare(a.start_date);
  });

  const currentCampaigns = activeCampaigns.filter(c => c.status === 'in_progress');

  // Build daily_spend and daily_budget by distributing each campaign's
  // spend/budget evenly across its active date range (start_date → end_date).
  // This gives much more accurate date filtering than global proportional estimation.
  const dailySpend = {};
  const dailyBudget = {};
  let campaignsWithDates = 0;
  let spendWithoutDates = 0;
  let budgetWithoutDates = 0;

  activeCampaigns.forEach(camp => {
    if (camp.start_date && camp.spend > 0) {
      const start = new Date(camp.start_date);
      const end = camp.end_date ? new Date(camp.end_date) : new Date();
      const days = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);
      const dailyAmount = camp.spend / days;
      const dailyBudgetAmount = camp.budget / days;

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = d.toISOString().split('T')[0]; // YYYY-MM-DD
        dailySpend[key] = (dailySpend[key] || 0) + dailyAmount;
        if (camp.budget > 0) {
          dailyBudget[key] = (dailyBudget[key] || 0) + dailyBudgetAmount;
        }
      }
      campaignsWithDates++;
    } else if (camp.spend > 0) {
      spendWithoutDates += camp.spend;
      budgetWithoutDates += camp.budget;
    }
  });

  // Round daily values to 2 decimals
  Object.keys(dailySpend).forEach(k => {
    dailySpend[k] = parseFloat(dailySpend[k].toFixed(2));
  });
  Object.keys(dailyBudget).forEach(k => {
    dailyBudget[k] = parseFloat(dailyBudget[k].toFixed(2));
  });

  console.log(`   Campanas con fechas para daily_spend: ${campaignsWithDates}`);
  if (spendWithoutDates > 0) {
    console.log(`   Gasto sin fechas (no distribuido): $${spendWithoutDates.toFixed(0)}`);
  }

  return {
    total: campaigns.length,
    active_count: currentCampaigns.length,
    total_budget: totalBudget,
    total_spend: totalSpend,
    budget_utilization: totalBudget > 0
      ? parseFloat((totalSpend / totalBudget * 100).toFixed(1))
      : 0,
    daily_spend: dailySpend,
    daily_budget: dailyBudget,
    spend_without_dates: spendWithoutDates,
    budget_without_dates: budgetWithoutDates,
    current_campaigns: currentCampaigns.slice(0, 10),
    recent_campaigns: activeCampaigns.slice(0, 20)
  };
}

/**
 * Fetch revenue attribution + ad campaign assets for each marketing campaign.
 * Requires scope: marketing.campaigns.revenue.read
 */
async function fetchCampaignRevenueAndAds(campaigns) {
  console.log('\n   Obteniendo revenue y ads de campanas...');

  const results = [];

  for (const c of campaigns) {
    const props = c.properties || {};
    const name = props.hs_name || 'Sin nombre';
    if (name === 'Sin nombre') continue;

    const entry = {
      id: c.id,
      name,
      status: props.hs_campaign_status || 'unknown',
      start_date: props.hs_start_date || null,
      end_date: props.hs_end_date || null,
      spend: parseFloat(props.hs_spend_items_sum_amount || '0'),
      budget: parseFloat(props.hs_budget_items_sum_amount || '0'),
      revenue: null,
      contacts_attributed: 0,
      deals_attributed: 0,
      revenue_attributed: 0,
      ad_campaigns: []
    };

    // Fetch revenue report
    try {
      const revData = await hubspotFetch(
        `/marketing/v3/campaigns/${c.id}/reports/revenue?attributionModel=LINEAR`
      );
      entry.contacts_attributed = revData.contactsNumber || 0;
      entry.deals_attributed = revData.dealsNumber || 0;
      entry.revenue_attributed = revData.revenueAmount || 0;
    } catch (err) {
      // Scope might not be available — skip silently
      if (!err.message.includes('403')) {
        console.log(`     Revenue error for ${name}: ${err.message.substring(0, 80)}`);
      }
    }

    // Fetch AD_CAMPAIGN assets
    try {
      const adsData = await hubspotFetch(
        `/marketing/v3/campaigns/${c.id}/assets/AD_CAMPAIGN?limit=50`
      );
      entry.ad_campaigns = (adsData.results || []).map(a => ({
        id: a.id,
        name: a.name || a.id
      }));
    } catch (err) {
      // No ads associated or not available
    }

    results.push(entry);
  }

  // Sort by revenue_attributed descending, then by contacts
  results.sort((a, b) => {
    if (b.revenue_attributed !== a.revenue_attributed) return b.revenue_attributed - a.revenue_attributed;
    return b.contacts_attributed - a.contacts_attributed;
  });

  console.log(`   Campanas con revenue data: ${results.filter(r => r.revenue_attributed > 0 || r.contacts_attributed > 0).length}`);
  console.log(`   Campanas con ads asociados: ${results.filter(r => r.ad_campaigns.length > 0).length}`);

  return results;
}

function analyzePipelines(pipelines) {
  return pipelines
    .filter(p => !p.label.includes('NO USAR'))
    .map(p => ({
      id: p.id,
      name: p.label,
      stages: (p.stages || []).map(s => ({
        id: s.id,
        name: s.label,
        probability: parseFloat(s.metadata?.probability || '0'),
        is_closed: s.metadata?.isClosed === 'true'
      }))
    }));
}

// ============================================================================
// INCREMENTAL MERGE
// ============================================================================

/**
 * Load existing latest.json for incremental merge.
 * Returns null if file doesn't exist or is invalid.
 */
async function loadExistingData() {
  const filePath = path.join(__dirname, '../data/hubspot/latest.json');
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);
    // Validate basic structure
    if (data.contacts && data.deals && data.campaigns) {
      console.log(`   Datos existentes cargados (${data.timestamp})`);
      return data;
    }
    console.log('   [WARN] Datos existentes con estructura incompleta, ignorando');
    return null;
  } catch {
    console.log('   No hay datos existentes, se hará fetch completo');
    return null;
  }
}

/**
 * Aggregate a daily object { "YYYY-MM-DD": number } into monthly { "YYYY-MM": number }
 */
function dailyToMonthly(dailyData) {
  const monthly = {};
  Object.entries(dailyData || {}).forEach(([day, count]) => {
    const month = day.substring(0, 7);
    monthly[month] = (monthly[month] || 0) + count;
  });
  return monthly;
}

/**
 * Sum all values from a { day: { key: count } } structure into { key: totalCount }
 */
function aggregateObjectDaily(dailyObjData) {
  const result = {};
  Object.values(dailyObjData || {}).forEach(obj => {
    if (obj && typeof obj === 'object') {
      Object.entries(obj).forEach(([key, count]) => {
        result[key] = (result[key] || 0) + count;
      });
    }
  });
  return result;
}

/**
 * For nested daily structures like { pipeline: { day: { stage: count } } },
 * aggregate into { pipeline: { stage: totalCount } }
 */
function aggregateNestedDaily(nestedDailyData) {
  const result = {};
  Object.entries(nestedDailyData || {}).forEach(([outerKey, dailyObj]) => {
    result[outerKey] = aggregateObjectDaily(dailyObj);
  });
  return result;
}

/**
 * Deep merge daily data: for simple { day: count }, overwrite days from fresh.
 * Returns merged object.
 */
function mergeDailySimple(existing, fresh) {
  return { ...(existing || {}), ...(fresh || {}) };
}

/**
 * Deep merge daily object data: { day: { key: count } }
 * Overwrites entire day entry from fresh.
 */
function mergeDailyObject(existing, fresh) {
  const merged = { ...(existing || {}) };
  Object.entries(fresh || {}).forEach(([day, obj]) => {
    merged[day] = obj; // replace entire day
  });
  return merged;
}

/**
 * Deep merge nested daily data: { pipeline: { day: { stage: count } } }
 * For each pipeline in fresh, merge its daily entries.
 */
function mergeNestedDaily(existing, fresh) {
  const merged = {};
  // Start with all existing pipelines
  Object.entries(existing || {}).forEach(([key, dailyObj]) => {
    merged[key] = { ...dailyObj };
  });
  // Merge fresh pipelines
  Object.entries(fresh || {}).forEach(([key, dailyObj]) => {
    if (!merged[key]) merged[key] = {};
    Object.entries(dailyObj).forEach(([day, val]) => {
      merged[key][day] = val; // replace entire day for this pipeline
    });
  });
  return merged;
}

/**
 * Calculate won/lost deals from stage_distribution using pipeline definitions.
 */
function calcWonLostFromStages(stageDistribution, pipelineAnalysis) {
  let won = 0;
  let lost = 0;

  Object.entries(stageDistribution || {}).forEach(([pipelineName, stages]) => {
    const pDef = pipelineAnalysis.find(p => p.name === pipelineName);
    Object.entries(stages || {}).forEach(([stageName, count]) => {
      const nameLower = stageName.toLowerCase();
      if (nameLower.includes('perdido')) {
        lost += count;
      } else if (pDef) {
        const sDef = pDef.stages?.find(s => s.name === stageName);
        if (sDef?.is_closed && sDef.probability > 0) {
          won += count;
        } else if (nameLower.includes('ganado') || nameLower.includes('matriculado')) {
          won += count;
        }
      } else if (nameLower.includes('ganado') || nameLower.includes('matriculado') || nameLower.includes('pagado')) {
        won += count;
      }
    });
  });

  return { won, lost };
}

/**
 * Merge fresh incremental data into existing full data.
 * - Daily breakdowns: fresh days overwrite existing days
 * - Aggregates: recalculated from merged daily data
 * - Campaigns, pipelines: always taken from fresh (small, always full fetch)
 */
function mergeHubSpotData(existing, fresh, pipelineAnalysis) {
  console.log('\n   Mergeando datos incrementales con existentes...');

  const merged = JSON.parse(JSON.stringify(existing)); // deep clone

  // === CONTACTS ===
  merged.contacts.daily_creation = mergeDailySimple(
    existing.contacts.daily_creation, fresh.contacts.daily_creation
  );
  merged.contacts.daily_by_source = mergeDailyObject(
    existing.contacts.daily_by_source, fresh.contacts.daily_by_source
  );

  // Recalculate aggregates from merged daily data
  merged.contacts.total = Object.values(merged.contacts.daily_creation).reduce((s, v) => s + v, 0);
  merged.contacts.monthly_creation = dailyToMonthly(merged.contacts.daily_creation);
  merged.contacts.source_distribution = aggregateObjectDaily(merged.contacts.daily_by_source);
  // lifecycle_distribution, conversion_rate: keep from existing (need full raw data)

  // === DEALS ===
  merged.deals.daily_deals = mergeDailySimple(
    existing.deals.daily_deals, fresh.deals.daily_deals
  );
  merged.deals.daily_by_pipeline = mergeDailyObject(
    existing.deals.daily_by_pipeline, fresh.deals.daily_by_pipeline
  );
  merged.deals.daily_by_pipeline_stage = mergeNestedDaily(
    existing.deals.daily_by_pipeline_stage, fresh.deals.daily_by_pipeline_stage
  );
  merged.deals.daily_revenue = mergeDailyObject(
    existing.deals.daily_revenue, fresh.deals.daily_revenue
  );
  merged.deals.daily_source_by_pipeline = mergeNestedDaily(
    existing.deals.daily_source_by_pipeline, fresh.deals.daily_source_by_pipeline
  );

  // Recalculate all deal aggregates from merged daily data
  merged.deals.total = Object.values(merged.deals.daily_deals).reduce((s, v) => s + v, 0);
  merged.deals.monthly_deals = dailyToMonthly(merged.deals.daily_deals);
  merged.deals.pipeline_distribution = aggregateObjectDaily(merged.deals.daily_by_pipeline);
  merged.deals.stage_distribution = aggregateNestedDaily(merged.deals.daily_by_pipeline_stage);
  merged.deals.source_by_pipeline = aggregateNestedDaily(merged.deals.daily_source_by_pipeline);

  // Revenue aggregates
  const revByPipeline = aggregateObjectDaily(merged.deals.daily_revenue);
  const totalRevenue = Object.values(revByPipeline).reduce((s, v) => s + v, 0);
  merged.deals.revenue = {
    total: totalRevenue,
    by_pipeline: revByPipeline,
    avg_deal_value: merged.deals.total > 0
      ? parseFloat((totalRevenue / merged.deals.total).toFixed(2))
      : 0
  };

  // Won/lost from merged stage_distribution + pipeline definitions
  const { won, lost } = calcWonLostFromStages(merged.deals.stage_distribution, pipelineAnalysis);
  merged.deals.won_deals = won;
  merged.deals.lost_deals = lost;
  merged.deals.win_rate = (won + lost) > 0
    ? parseFloat((won / (won + lost) * 100).toFixed(1))
    : 0;

  // Won/lost by pipeline
  const wonLostByPipeline = {};
  Object.entries(merged.deals.pipeline_distribution).forEach(([name, total]) => {
    const stages = merged.deals.stage_distribution[name] || {};
    const pDef = pipelineAnalysis.find(p => p.name === name);
    let w = 0, l = 0;
    Object.entries(stages).forEach(([stageName, count]) => {
      const nameLower = stageName.toLowerCase();
      if (nameLower.includes('perdido')) {
        l += count;
      } else if (pDef) {
        const sDef = pDef.stages?.find(s => s.name === stageName);
        if (sDef?.is_closed && sDef.probability > 0) w += count;
        else if (nameLower.includes('ganado') || nameLower.includes('matriculado')) w += count;
      } else if (nameLower.includes('ganado') || nameLower.includes('matriculado') || nameLower.includes('pagado')) {
        w += count;
      }
    });
    wonLostByPipeline[name] = { won: w, lost: l, total };
  });
  merged.deals.won_lost_by_pipeline = wonLostByPipeline;

  // === CAMPAIGNS, PIPELINES, CAMPAIGN_PERFORMANCE: always fresh ===
  merged.campaigns = fresh.campaigns;
  merged.campaign_performance = fresh.campaign_performance;
  merged.pipelines = fresh.pipelines || pipelineAnalysis;

  // === METADATA ===
  merged.timestamp = fresh.timestamp;
  merged.metadata = {
    ...merged.metadata,
    ...fresh.metadata,
    mode: 'incremental',
    incremental_days: 7,
    last_full_run: existing.metadata?.last_full_run || existing.timestamp
  };

  // Summary
  const freshContactDays = Object.keys(fresh.contacts.daily_creation).length;
  const freshDealDays = Object.keys(fresh.deals.daily_deals).length;
  const totalContactDays = Object.keys(merged.contacts.daily_creation).length;
  const totalDealDays = Object.keys(merged.deals.daily_deals).length;

  console.log(`   Merge completado:`);
  console.log(`     Contactos: ${freshContactDays} días frescos → ${totalContactDays} días totales (${merged.contacts.total} contactos)`);
  console.log(`     Deals: ${freshDealDays} días frescos → ${totalDealDays} días totales (${merged.deals.total} deals)`);

  return merged;
}

// ============================================================================
// MAIN CONNECTOR
// ============================================================================
async function fetchHubSpotData(clientConfig, mode = 'full') {
  const isIncremental = mode === 'incremental';

  console.log(`\nHubSpot CRM Connector - ${clientConfig.client}`);
  console.log(`   Modo: ${isIncremental ? 'INCREMENTAL (7 días)' : 'FULL REBUILD'}`);
  console.log('='.repeat(50));

  if (!HUBSPOT_TOKEN) {
    console.error('\nERROR: HUBSPOT_ACCESS_TOKEN no configurado');
    console.error('   Configura HUBSPOT_ACCESS_TOKEN en .env o como variable de entorno');
    process.exit(1);
  }

  const hubspotConfig = clientConfig.hubspot || {};

  // Incremental: only 7 days. Full: use config lookback_days.
  let lookbackDays;
  let existingData = null;

  if (isIncremental) {
    existingData = await loadExistingData();
    if (!existingData) {
      console.log('   [INFO] Sin datos existentes — cambiando a modo FULL');
    }
    lookbackDays = existingData ? 7 : (hubspotConfig.lookback_days || 730);
  } else {
    lookbackDays = hubspotConfig.lookback_days || 730;
  }

  console.log(`   Lookback: ${lookbackDays} dias`);
  console.log('='.repeat(50));

  try {
    // Fetch data sequentially to avoid HubSpot 429 rate limits
    const contacts = await fetchRecentContacts(lookbackDays);
    const deals = await fetchRecentDeals(lookbackDays);
    const pipelines = await fetchPipelines();
    const campaigns = await fetchCampaigns();

    // Fetch deal→contact source attributions
    const dealIds = deals.map(d => d.id);
    const dealSourceMap = await fetchDealContactSources(dealIds);

    // Analyze
    console.log('\nAnalizando datos...');
    const contactAnalysis = analyzeContacts(contacts);
    const dealAnalysis = analyzeDeals(deals, pipelines, dealSourceMap);
    const campaignAnalysis = analyzeCampaigns(campaigns);
    const pipelineAnalysis = analyzePipelines(pipelines);

    // Fetch campaign revenue attribution & ad assets
    const campaignPerformance = await fetchCampaignRevenueAndAds(campaigns);

    // Build fresh output
    const freshData = {
      timestamp: new Date().toISOString(),
      source: 'HubSpot CRM API',
      region: clientConfig.region,
      category: 'CRM Data',
      client: `${clientConfig.client} - ${clientConfig.clientFullName}`,
      contacts: contactAnalysis,
      deals: dealAnalysis,
      campaigns: campaignAnalysis,
      campaign_performance: campaignPerformance,
      pipelines: pipelineAnalysis,
      metadata: {
        method: 'HubSpot Private App API v3',
        lookback_days: lookbackDays,
        portal_id: hubspotConfig.portal_id || '9013951',
        note: 'Datos reales de HubSpot CRM',
        mode: isIncremental && existingData ? 'incremental' : 'full',
        last_full_run: isIncremental ? undefined : new Date().toISOString()
      }
    };

    // Incremental: merge with existing; Full: use fresh as-is
    let finalData;
    if (isIncremental && existingData) {
      finalData = mergeHubSpotData(existingData, freshData, pipelineAnalysis);
    } else {
      finalData = freshData;
    }

    await saveResults(finalData);
    return finalData;

  } catch (error) {
    console.error(`\nError: ${error.message}`);
    throw error;
  }
}

// ============================================================================
// GUARDAR RESULTADOS
// ============================================================================
async function saveResults(data) {
  const dataDir = path.join(__dirname, '../data/hubspot');
  const publicDir = path.join(__dirname, '../public/data/hubspot');

  await fs.mkdir(dataDir, { recursive: true });
  await fs.mkdir(publicDir, { recursive: true });

  const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const jsonData = JSON.stringify(data, null, 2);

  // Save with timestamp (backup)
  await fs.writeFile(path.join(dataDir, `hubspot_${timestamp}.json`), jsonData);

  // Save as latest (frontend reads this)
  await fs.writeFile(path.join(dataDir, 'latest.json'), jsonData);
  await fs.writeFile(path.join(publicDir, 'latest.json'), jsonData);

  console.log('\nArchivos guardados:');
  console.log(`   data/hubspot/hubspot_${timestamp}.json`);
  console.log(`   data/hubspot/latest.json`);
  console.log(`   public/data/hubspot/latest.json <-- Frontend lee este`);

  // Summary
  console.log('\nResumen:');
  console.log(`   Contactos: ${data.contacts.total}`);
  console.log(`   Deals: ${data.deals.total}`);
  console.log(`   Win Rate: ${data.deals.win_rate}%`);
  console.log(`   Revenue Total: $${data.deals.revenue.total.toLocaleString()}`);
  console.log(`   Campanas activas: ${data.campaigns.active_count}`);
  console.log(`   Presupuesto total: $${data.campaigns.total_budget.toLocaleString()}`);

  // Pipeline summary
  console.log('\n   Deals por pipeline:');
  Object.entries(data.deals.pipeline_distribution).forEach(([name, count]) => {
    console.log(`     ${name}: ${count}`);
  });

  // Source summary
  console.log('\n   Contactos por fuente:');
  Object.entries(data.contacts.source_distribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([source, count]) => {
      console.log(`     ${source}: ${count}`);
    });
}

// ============================================================================
// MAIN
// ============================================================================
async function main() {
  const options = parseArgs();

  console.log('HubSpot CRM Data Connector');
  console.log(`   Cliente: ${options.client}`);
  console.log(`   Modo: ${options.mode}`);
  console.log(`   Fecha: ${new Date().toLocaleString('es-PE')}`);

  try {
    const clientConfig = await loadClientConfig(options.client);
    await fetchHubSpotData(clientConfig, options.mode);
    console.log('\nConexion completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error(`\nError fatal: ${error.message}`);
    process.exit(1);
  }
}

main();
