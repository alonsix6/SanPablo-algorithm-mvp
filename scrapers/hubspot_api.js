#!/usr/bin/env node
/**
 * HubSpot CRM Data Connector
 *
 * Obtiene datos REALES de HubSpot CRM via API:
 * - Contactos: lifecycle stage, fuente de tráfico, atribución
 * - Deals: pipeline stages, montos, tasas de conversión
 * - Campañas: presupuestos, UTMs, estados
 *
 * Se ejecuta semanalmente (Lunes 8am) via GitHub Actions.
 *
 * Uso:
 *   node hubspot_api.js --client=ucsp
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
  const options = { client: 'ucsp' };
  args.forEach(arg => {
    if (arg.startsWith('--client=')) options.client = arg.split('=')[1];
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
// HTTP HELPER
// ============================================================================
async function hubspotFetch(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;

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

  try {
    const response = await axios(axiosConfig);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`HubSpot API ${error.response.status}: ${JSON.stringify(error.response.data)}`);
    }
    throw error;
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

  const dateFrom = new Date();
  dateFrom.setDate(dateFrom.getDate() - days);

  const properties = [
    'firstname', 'lastname', 'email', 'lifecyclestage',
    'hs_analytics_source', 'hs_analytics_source_data_1',
    'hs_analytics_source_data_2',
    'hs_lead_status', 'num_conversion_events',
    'first_conversion_event_name', 'recent_conversion_event_name',
    'hs_analytics_num_page_views', 'hs_analytics_num_visits',
    'createdate'
  ];

  const propsQuery = properties.join(',');
  const allContacts = [];
  let after = undefined;

  do {
    const body = {
      filterGroups: [{
        filters: [{
          propertyName: 'createdate',
          operator: 'GTE',
          value: dateFrom.toISOString()
        }]
      }],
      properties,
      limit: 100,
      ...(after ? { after } : {})
    };

    const data = await hubspotFetch('/crm/v3/objects/contacts/search', {
      method: 'POST',
      body
    });

    allContacts.push(...(data.results || []));
    after = data.paging?.next?.after || null;

    // Safety limit - max 5000 contacts
    if (allContacts.length >= 5000) break;
  } while (after);

  console.log(`   Contactos obtenidos: ${allContacts.length}`);
  return allContacts;
}

/**
 * Fetch deals with pipeline and stage info
 */
async function fetchRecentDeals(days = 90) {
  console.log(`\n   Obteniendo deals (ultimos ${days} dias)...`);

  const dateFrom = new Date();
  dateFrom.setDate(dateFrom.getDate() - days);

  const properties = [
    'dealname', 'amount', 'dealstage', 'pipeline',
    'closedate', 'createdate', 'hs_lastmodifieddate'
  ];

  const allDeals = [];
  let after = undefined;

  do {
    const body = {
      filterGroups: [{
        filters: [{
          propertyName: 'createdate',
          operator: 'GTE',
          value: dateFrom.toISOString()
        }]
      }],
      properties,
      limit: 100,
      ...(after ? { after } : {})
    };

    const data = await hubspotFetch('/crm/v3/objects/deals/search', {
      method: 'POST',
      body
    });

    allDeals.push(...(data.results || []));
    after = data.paging?.next?.after || null;

    if (allDeals.length >= 10000) break;
  } while (after);

  console.log(`   Deals obtenidos: ${allDeals.length}`);
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
    monthly_creation: monthlyCreation
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
    }
  });

  // Source attribution per pipeline (channel breakdown)
  const sourceByPipeline = {};
  deals.forEach(d => {
    const props = d.properties || {};
    const pipelineId = props.pipeline || 'default';
    const pipelineName = pipelineLabels[pipelineId] || pipelineId;
    const source = dealSourceMap.get(d.id) || 'unknown';

    if (!sourceByPipeline[pipelineName]) sourceByPipeline[pipelineName] = {};
    sourceByPipeline[pipelineName][source] = (sourceByPipeline[pipelineName][source] || 0) + 1;
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
    monthly_deals: monthlyDeals
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

  return {
    total: campaigns.length,
    active_count: currentCampaigns.length,
    total_budget: totalBudget,
    total_spend: totalSpend,
    budget_utilization: totalBudget > 0
      ? parseFloat((totalSpend / totalBudget * 100).toFixed(1))
      : 0,
    current_campaigns: currentCampaigns.slice(0, 10),
    recent_campaigns: activeCampaigns.slice(0, 20)
  };
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
// MAIN CONNECTOR
// ============================================================================
async function fetchHubSpotData(clientConfig) {
  console.log(`\nHubSpot CRM Connector - ${clientConfig.client}`);
  console.log('='.repeat(50));

  if (!HUBSPOT_TOKEN) {
    console.error('\nERROR: HUBSPOT_ACCESS_TOKEN no configurado');
    console.error('   Configura HUBSPOT_ACCESS_TOKEN en .env o como variable de entorno');
    process.exit(1);
  }

  const hubspotConfig = clientConfig.hubspot || {};
  const lookbackDays = hubspotConfig.lookback_days || 90;

  console.log(`   Lookback: ${lookbackDays} dias`);
  console.log('='.repeat(50));

  try {
    // Fetch all data in parallel where possible
    const [contacts, deals, pipelines, campaigns] = await Promise.all([
      fetchRecentContacts(lookbackDays),
      fetchRecentDeals(lookbackDays),
      fetchPipelines(),
      fetchCampaigns()
    ]);

    // Fetch deal→contact source attributions
    const dealIds = deals.map(d => d.id);
    const dealSourceMap = await fetchDealContactSources(dealIds);

    // Analyze
    console.log('\nAnalizando datos...');
    const contactAnalysis = analyzeContacts(contacts);
    const dealAnalysis = analyzeDeals(deals, pipelines, dealSourceMap);
    const campaignAnalysis = analyzeCampaigns(campaigns);
    const pipelineAnalysis = analyzePipelines(pipelines);

    // Build output
    const data = {
      timestamp: new Date().toISOString(),
      source: 'HubSpot CRM API',
      region: clientConfig.region,
      category: 'CRM Data',
      client: `${clientConfig.client} - ${clientConfig.clientFullName}`,
      contacts: contactAnalysis,
      deals: dealAnalysis,
      campaigns: campaignAnalysis,
      pipelines: pipelineAnalysis,
      metadata: {
        method: 'HubSpot Private App API v3',
        lookback_days: lookbackDays,
        portal_id: hubspotConfig.portal_id || '9013951',
        note: 'Datos reales de HubSpot CRM'
      }
    };

    await saveResults(data);
    return data;

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
  console.log(`   Fecha: ${new Date().toLocaleString('es-PE')}`);

  try {
    const clientConfig = await loadClientConfig(options.client);
    await fetchHubSpotData(clientConfig);
    console.log('\nConexion completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error(`\nError fatal: ${error.message}`);
    process.exit(1);
  }
}

main();
