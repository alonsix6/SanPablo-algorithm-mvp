import { useState } from 'react';
import { TrendingUp, BarChart3, RefreshCw, Award, Target, Users, Heart, Zap, AlertCircle, GraduationCap, Bell, Globe, FileText, CheckCircle, Lightbulb, Database, XCircle, ChevronDown, ChevronUp, Megaphone, ExternalLink, DollarSign } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { PERFORMANCE_KPIS, ALERTS, COMPETITOR_INSIGHTS } from '../data/mockData';
import { LAYER_CONFIG, HUBSPOT_CONFIG } from '../data/config';
import { useHubSpotData, useMLData } from '../hooks/useRealData';
import { filterMonthlyData, aggregateForChart, sumFilteredData, sumFilteredObjectData, hasActiveDateFilter } from './Dashboard';

// Map HubSpot sources to display names and colors
const SOURCE_CONFIG = {
  PAID_SEARCH: { name: 'Google Search', color: '#003B7A' },
  PAID_SOCIAL: { name: 'Meta Ads', color: '#6B1B3D' },
  ORGANIC_SEARCH: { name: 'Orgánico', color: '#059669' },
  DIRECT_TRAFFIC: { name: 'Directo', color: '#C5A572' },
  OFFLINE: { name: 'Offline', color: '#6B7280' },
  REFERRALS: { name: 'Referidos', color: '#7C3AED' },
  OTHER_CAMPAIGNS: { name: 'Otras Campañas', color: '#F59E0B' },
  SOCIAL_MEDIA: { name: 'Redes Sociales', color: '#EC4899' },
};

// Funnel stage icons and colors
const FUNNEL_COLORS = [
  'from-ucsp-blue to-ucsp-lightBlue',
  'from-ucsp-lightBlue to-ucsp-skyBlue',
  'from-ucsp-burgundy to-ucsp-wine',
  'from-ucsp-gold to-ucsp-burgundy',
  'from-amber-500 to-orange-500',
  'from-green-500 to-green-600',
  'from-emerald-500 to-emerald-600',
];

const FUNNEL_ICONS = [Users, FileText, Globe, Target, GraduationCap, CheckCircle, CheckCircle];

/**
 * Extract a single key's values from a daily-keyed object structure.
 * Input:  { "YYYY-MM-DD": { key1: count, key2: count, ... } }
 * Output: { "YYYY-MM-DD": count }  (for the specified key only)
 */
function extractKeyFromDaily(dailyObjData, key) {
  if (!dailyObjData || !key) return null;
  const result = {};
  Object.entries(dailyObjData).forEach(([day, obj]) => {
    if (obj && obj[key] != null) result[day] = obj[key];
  });
  return Object.keys(result).length > 0 ? result : null;
}

/**
 * Build channel distribution from real HubSpot source data.
 * When selectedProgram is set, shows deal sources for that program.
 * When dateRange is active, recalculates from daily data.
 */
function buildChannelData(hubspot, dateRange, selectedProgram) {
  const filtering = hasActiveDateFilter(dateRange);

  let sources;
  if (selectedProgram) {
    // Per-program: use deal source attribution for that program
    if (filtering && hubspot?.deals?.daily_source_by_pipeline?.[selectedProgram]) {
      sources = sumFilteredObjectData(hubspot.deals.daily_source_by_pipeline[selectedProgram], dateRange);
    } else {
      sources = hubspot?.deals?.source_by_pipeline?.[selectedProgram];
    }
  } else {
    // All programs: use contact source distribution
    if (filtering && hubspot?.contacts?.daily_by_source) {
      sources = sumFilteredObjectData(hubspot.contacts.daily_by_source, dateRange);
    } else {
      sources = hubspot?.contacts?.source_distribution;
    }
  }

  if (!sources || Object.keys(sources).length === 0) return null;
  const total = Object.values(sources).reduce((sum, v) => sum + v, 0) || 1;

  return Object.entries(sources)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([key, count]) => ({
      name: SOURCE_CONFIG[key]?.name || key,
      value: Math.round(count / total * 100),
      leads: count,
      color: SOURCE_CONFIG[key]?.color || '#9CA3AF',
    }));
}

/**
 * Build funnel from real HubSpot pipeline stage_distribution data.
 * Excludes "Cierre perdido" from the funnel flow and returns it separately.
 * When dateRange is active, recalculates from daily_by_pipeline_stage.
 */
function buildFunnelSteps(hubspot, pipelineName, dateRange) {
  if (!hubspot?.deals?.stage_distribution?.[pipelineName]) return null;

  let stages;
  if (hasActiveDateFilter(dateRange) && hubspot.deals.daily_by_pipeline_stage?.[pipelineName]) {
    stages = sumFilteredObjectData(hubspot.deals.daily_by_pipeline_stage[pipelineName], dateRange);
    if (Object.keys(stages).length === 0) return null;
  } else {
    stages = hubspot.deals.stage_distribution[pipelineName];
  }

  // Find matching pipeline definition for stage ordering
  const pipelineDef = hubspot.pipelines?.find(p => p.name === pipelineName);

  let orderedStages;
  if (pipelineDef?.stages) {
    orderedStages = pipelineDef.stages
      .filter(s => stages[s.name] != null)
      .map(s => ({ name: s.name, value: stages[s.name] || 0 }));
  } else {
    orderedStages = Object.entries(stages)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));
  }

  // Separate "Cierre perdido" from the funnel flow
  const lostStage = orderedStages.find(s => s.name.toLowerCase().includes('perdido'));
  const activeStages = orderedStages.filter(s => !s.name.toLowerCase().includes('perdido'));

  const steps = activeStages.map((stage, idx) => {
    const nextStage = activeStages[idx + 1];
    const conversionRate = nextStage && stage.value > 0
      ? parseFloat((nextStage.value / stage.value * 100).toFixed(1))
      : null;

    return {
      stage: stage.name,
      value: stage.value,
      conversionRate,
      conversionLabel: nextStage ? `a ${nextStage.name.split(' ')[0]}` : null,
      IconComponent: FUNNEL_ICONS[idx] || CheckCircle,
      color: FUNNEL_COLORS[idx] || 'from-gray-500 to-gray-600',
    };
  });

  return {
    steps,
    lost: lostStage ? { name: lostStage.name, value: lostStage.value } : null,
  };
}

/**
 * Build HubSpot CRM summary KPIs from real data.
 * When selectedProgram is set, shows KPIs for that program only.
 * When dateRange is active, recalculates totals from daily data.
 */
function buildCRMKpis(hubspot, dateRange, selectedProgram) {
  if (!hubspot) return null;

  const filtering = hasActiveDateFilter(dateRange);
  const pipelineDefs = hubspot.pipelines || [];

  // Contacts: always global (contacts aren't pipeline-specific)
  const totalContacts = filtering && hubspot.contacts?.daily_creation
    ? sumFilteredData(hubspot.contacts.daily_creation, dateRange)
    : hubspot.contacts?.total || 0;

  // Leads: per-program when selected
  let totalLeads;
  if (selectedProgram) {
    if (filtering && hubspot.deals?.daily_by_pipeline) {
      const pipelineDaily = extractKeyFromDaily(hubspot.deals.daily_by_pipeline, selectedProgram);
      totalLeads = pipelineDaily ? sumFilteredData(pipelineDaily, dateRange) : 0;
    } else {
      totalLeads = hubspot.deals?.pipeline_distribution?.[selectedProgram] || 0;
    }
  } else {
    totalLeads = filtering && hubspot.deals?.daily_deals
      ? sumFilteredData(hubspot.deals.daily_deals, dateRange)
      : hubspot.deals?.total || 0;
  }

  // Revenue: per-program when selected
  let revenue;
  if (selectedProgram) {
    if (filtering && hubspot.deals?.daily_revenue) {
      const revDaily = extractKeyFromDaily(hubspot.deals.daily_revenue, selectedProgram);
      revenue = revDaily ? sumFilteredData(revDaily, dateRange) : 0;
    } else {
      revenue = hubspot.deals?.revenue?.by_pipeline?.[selectedProgram] || 0;
    }
  } else {
    revenue = hubspot.deals?.revenue?.total || 0;
    if (filtering && hubspot.deals?.daily_revenue) {
      const dailyRev = sumFilteredObjectData(hubspot.deals.daily_revenue, dateRange);
      revenue = Object.values(dailyRev).reduce((s, v) => s + v, 0);
    }
  }

  // Won/Lost: per-program or all
  let wonLeads = 0;
  let lostLeads = 0;

  function classifyStages(stages, pName) {
    const pDef = pipelineDefs.find(p => p.name === pName);
    let w = 0, l = 0;
    Object.entries(stages).forEach(([stageName, count]) => {
      const nameLower = stageName.toLowerCase();
      if (nameLower.includes('perdido')) {
        l += count;
      } else {
        const sDef = pDef?.stages?.find(s => s.name === stageName);
        if (sDef) {
          if ((sDef.is_closed && sDef.probability > 0) || nameLower.includes('ganado') || nameLower.includes('matriculado')) w += count;
        } else if (nameLower.includes('ganado') || nameLower.includes('matriculado') || nameLower.includes('pagado')) {
          w += count;
        }
      }
    });
    return { w, l };
  }

  if (selectedProgram) {
    let stages;
    if (filtering && hubspot.deals?.daily_by_pipeline_stage?.[selectedProgram]) {
      stages = sumFilteredObjectData(hubspot.deals.daily_by_pipeline_stage[selectedProgram], dateRange);
    } else {
      stages = hubspot.deals?.stage_distribution?.[selectedProgram] || {};
    }
    const { w, l } = classifyStages(stages, selectedProgram);
    wonLeads = w;
    lostLeads = l;
  } else {
    if (filtering && hubspot.deals?.daily_by_pipeline_stage) {
      Object.keys(hubspot.deals.daily_by_pipeline_stage).forEach(pName => {
        const filteredStages = sumFilteredObjectData(hubspot.deals.daily_by_pipeline_stage[pName], dateRange);
        const { w, l } = classifyStages(filteredStages, pName);
        wonLeads += w;
        lostLeads += l;
      });
    } else {
      wonLeads = hubspot.deals?.won_deals || 0;
      lostLeads = hubspot.deals?.lost_deals || 0;
    }
  }

  const closedDeals = wonLeads + lostLeads;
  const winRate = closedDeals > 0
    ? parseFloat((wonLeads / closedDeals * 100).toFixed(1))
    : (selectedProgram ? 0 : (hubspot.deals?.win_rate || 0));
  const avgDealValue = totalLeads > 0 ? parseFloat((revenue / totalLeads).toFixed(2)) : (hubspot.deals?.revenue?.avg_deal_value || 0);

  // Campaign spend: use daily_spend/daily_budget for exact date filtering
  // Each campaign's spend is distributed across its active date range (start → end)
  let totalSpend = hubspot.campaigns?.total_spend || 0;
  let totalBudget = hubspot.campaigns?.total_budget || 0;
  let budgetUtilization = hubspot.campaigns?.budget_utilization || 0;
  if (filtering) {
    if (hubspot.campaigns?.daily_spend) {
      totalSpend = sumFilteredData(hubspot.campaigns.daily_spend, dateRange);
      totalSpend = Math.round(totalSpend);
    }
    if (hubspot.campaigns?.daily_budget) {
      totalBudget = sumFilteredData(hubspot.campaigns.daily_budget, dateRange);
      totalBudget = Math.round(totalBudget);
    }
    // Add any spend/budget from campaigns without dates (shown as-is since we can't filter)
    const spendNoDate = hubspot.campaigns?.spend_without_dates || 0;
    const budgetNoDate = hubspot.campaigns?.budget_without_dates || 0;
    totalSpend += spendNoDate;
    totalBudget += budgetNoDate;
    budgetUtilization = totalBudget > 0 ? parseFloat((totalSpend / totalBudget * 100).toFixed(1)) : 0;
  }

  return {
    totalContacts,
    totalLeads,
    winRate,
    wonLeads,
    lostLeads,
    revenue,
    avgDealValue,
    activeCampaigns: hubspot.campaigns?.active_count || 0,
    totalCampaigns: hubspot.campaigns?.total || 0,
    totalBudget,
    totalSpend,
    budgetUtilization,
    conversionRate: hubspot.contacts?.conversion_rate || 0,
    timestamp: hubspot.timestamp,
  };
}

/**
 * Build pipeline summary showing ganados/perdidos for ALL pipelines.
 * Calculates from stage_distribution (direct HubSpot data) — identifies:
 *   "won" stages: is_closed=true & probability>0, or name contains "ganado"/"matriculado"
 *   "lost" stages: name contains "perdido"
 * When dateRange is active, recalculates from daily_by_pipeline_stage and daily_by_pipeline.
 */
function buildPipelineSummary(hubspot, dateRange, selectedProgram) {
  if (!hubspot?.deals?.pipeline_distribution || !hubspot?.deals?.stage_distribution) return null;

  const filtering = hasActiveDateFilter(dateRange);
  const pipelineDefs = hubspot.pipelines || [];

  // Pipeline totals: from daily_by_pipeline when filtering
  let pipelines;
  if (filtering && hubspot.deals.daily_by_pipeline) {
    pipelines = sumFilteredObjectData(hubspot.deals.daily_by_pipeline, dateRange);
  } else {
    pipelines = hubspot.deals.pipeline_distribution;
  }

  // Filter to single program when selected
  let pipelineEntries = Object.entries(pipelines);
  if (selectedProgram) {
    pipelineEntries = pipelineEntries.filter(([name]) => name === selectedProgram);
  }

  return pipelineEntries
    .sort((a, b) => b[1] - a[1])
    .map(([name, total]) => {
      // Stage distribution: from daily_by_pipeline_stage when filtering
      let stages;
      if (filtering && hubspot.deals.daily_by_pipeline_stage?.[name]) {
        stages = sumFilteredObjectData(hubspot.deals.daily_by_pipeline_stage[name], dateRange);
      } else {
        stages = hubspot.deals.stage_distribution[name] || {};
      }

      const pipelineDef = pipelineDefs.find(p => p.name === name);

      let ganados = 0;
      let perdidos = 0;

      if (pipelineDef?.stages) {
        pipelineDef.stages.forEach(s => {
          const count = stages[s.name] || 0;
          const nameLower = s.name.toLowerCase();
          if (nameLower.includes('perdido')) {
            perdidos += count;
          } else if (
            (s.is_closed && s.probability > 0) ||
            nameLower.includes('ganado') ||
            nameLower.includes('matriculado')
          ) {
            ganados += count;
          }
        });
      } else {
        Object.entries(stages).forEach(([stageName, count]) => {
          const nameLower = stageName.toLowerCase();
          if (nameLower.includes('perdido')) {
            perdidos += count;
          } else if (
            nameLower.includes('ganado') ||
            nameLower.includes('matriculado') ||
            nameLower.includes('pagado')
          ) {
            ganados += count;
          }
        });
      }

      const conversionRate = total > 0 ? parseFloat((ganados / total * 100).toFixed(1)) : 0;

      return { name, total, ganados, perdidos, conversionRate };
    });
}

/**
 * Filter campaign_performance by dateRange and selectedProgram.
 * - dateRange: show only campaigns whose active period overlaps with the range
 * - selectedProgram: show campaigns whose name contains the program name
 *   (e.g. "Formación Continua Q1 2025" matches program "Formación Continua").
 *   General "Admision" campaigns are always shown (they span all programs).
 */
function filterCampaignPerformance(campaigns, dateRange, selectedProgram) {
  if (!campaigns || campaigns.length === 0) return [];

  let filtered = campaigns;

  // Date filter — keep campaigns that overlap with the selected date range
  if (hasActiveDateFilter(dateRange)) {
    const rangeStart = dateRange.start ? new Date(dateRange.start) : null;
    const rangeEnd = dateRange.end ? new Date(dateRange.end) : null;

    filtered = filtered.filter(c => {
      if (!c.start_date && !c.end_date) return true; // no dates = always show
      const campStart = c.start_date ? new Date(c.start_date) : new Date('2000-01-01');
      const campEnd = c.end_date ? new Date(c.end_date) : new Date('2099-12-31');
      // Overlap check: campStart <= rangeEnd AND campEnd >= rangeStart
      if (rangeEnd && campStart > rangeEnd) return false;
      if (rangeStart && campEnd < rangeStart) return false;
      return true;
    });
  }

  // Program filter — keep campaigns matching the selected program name
  if (selectedProgram) {
    const progLower = selectedProgram.toLowerCase();
    filtered = filtered.filter(c => {
      const nameLower = c.name.toLowerCase();
      // Direct match: campaign name contains program name
      if (nameLower.includes(progLower)) return true;
      // "Admision" or general campaigns: match if program is Pregrado-related
      if (nameLower.includes('admisi')) {
        return progLower.includes('pregrado');
      }
      return false;
    });
  }

  return filtered;
}

export default function OptimizationLayer({ dateRange }) {
  const { data: hubspot, loading: hubspotLoading } = useHubSpotData();
  const { data: mlData } = useMLData();
  const [selectedProgram, setSelectedProgram] = useState('');
  const [showPipelineSummary, setShowPipelineSummary] = useState(false);

  const availablePipelines = hubspot?.deals?.stage_distribution
    ? Object.keys(hubspot.deals.stage_distribution)
    : [];

  // Build real data — all filtered by dateRange AND selectedProgram
  const channelData = buildChannelData(hubspot, dateRange, selectedProgram) || [
    { name: 'Google Search', value: 35, leads: 291, color: '#003B7A' },
    { name: 'Meta Ads', value: 35, leads: 291, color: '#6B1B3D' },
    { name: 'YouTube', value: 20, leads: 166, color: '#EF4444' },
    { name: 'Display', value: 10, leads: 83, color: '#C5A572' },
  ];

  // Funnel: use selected program, fallback to first available
  const funnelPipeline = selectedProgram || availablePipelines[0] || 'Pregrado';
  const funnelResult = buildFunnelSteps(hubspot, funnelPipeline, dateRange);
  const funnelSteps = funnelResult?.steps || null;
  const funnelLost = funnelResult?.lost || null;

  const crmKpis = buildCRMKpis(hubspot, dateRange, selectedProgram);
  const pipelineSummary = buildPipelineSummary(hubspot, dateRange, selectedProgram);
  const filteredCampaigns = filterCampaignPerformance(hubspot?.campaign_performance, dateRange, selectedProgram);

  // Data freshness
  const dataAge = crmKpis?.timestamp
    ? Math.floor((Date.now() - new Date(crmKpis.timestamp).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Performance últimos 7 días (mock - necesita Google Ads API)
  const performanceData = [
    { date: '14 Nov', leads: 95, reach: 105000, engagement: 15200, spent: 5950 },
    { date: '15 Nov', leads: 142, reach: 118000, engagement: 18500, spent: 6480 },
    { date: '16 Nov', leads: 118, reach: 110000, engagement: 16800, spent: 6120 },
    { date: '17 Nov', leads: 88, reach: 98000, engagement: 14200, spent: 5680 },
    { date: '18 Nov', leads: 156, reach: 128000, engagement: 20100, spent: 6850 },
    { date: '19 Nov', leads: 135, reach: 122000, engagement: 18900, spent: 6590 },
    { date: '20 Nov', leads: 108, reach: 115000, engagement: 17400, spent: 6250 },
  ];

  // Leads trend — when program is selected, show only that program's daily data
  let leadsSource;
  let leadsDataLabel;
  if (selectedProgram) {
    leadsSource = extractKeyFromDaily(hubspot?.deals?.daily_by_pipeline, selectedProgram);
    leadsDataLabel = `Datos diarios · ${selectedProgram}`;
  } else {
    const hasDailyDeals = !!hubspot?.deals?.daily_deals;
    leadsSource = hasDailyDeals ? hubspot.deals.daily_deals : hubspot?.deals?.monthly_deals;
    leadsDataLabel = (hubspot?.deals?.daily_deals ? 'Datos diarios' : 'Datos mensuales') + ' · HubSpot CRM';
  }
  const monthlyLeadsData = leadsSource
    ? aggregateForChart(filterMonthlyData(leadsSource, dateRange), 'leads')
    : null;

  // Contacts trend — always global (contacts aren't pipeline-specific)
  const hasDailyContacts = !!hubspot?.contacts?.daily_creation;
  const contactsSource = hasDailyContacts ? hubspot.contacts.daily_creation : hubspot?.contacts?.monthly_creation;
  const monthlyContactsData = contactsSource
    ? aggregateForChart(filterMonthlyData(contactsSource, dateRange), 'contacts')
    : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              {LAYER_CONFIG.optimization.name}
            </h2>
            <p className="text-gray-600">
              {LAYER_CONFIG.optimization.subtitle}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            {crmKpis && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center gap-1">
                <Database className="w-3 h-3" />
                HubSpot conectado
                {dataAge !== null && ` (hace ${dataAge}d)`}
              </span>
            )}
            <span className="px-3 py-1 bg-ucsp-blue text-white rounded-full text-sm font-medium flex items-center gap-1">
              <RefreshCw className="w-4 h-4" />
              Auto-optimización activa
            </span>
          </div>
        </div>

        {/* Program Filter */}
        {availablePipelines.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <GraduationCap className="w-4 h-4 text-ucsp-burgundy" />
              <span className="font-medium text-gray-700">Filtrar por programa:</span>
            </div>
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:border-ucsp-blue focus:ring-2 focus:ring-ucsp-blue focus:border-ucsp-blue transition-colors cursor-pointer shadow-sm"
            >
              <option value="">Todos los programas</option>
              {availablePipelines.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            {selectedProgram && (
              <button
                onClick={() => setSelectedProgram('')}
                className="px-3 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-medium hover:bg-gray-200 transition-colors flex items-center gap-1"
              >
                <XCircle className="w-3.5 h-3.5" /> Limpiar filtro
              </button>
            )}
            {selectedProgram && (
              <span className="ml-auto text-xs text-ucsp-burgundy font-semibold bg-ucsp-burgundy/10 px-3 py-1.5 rounded-lg">
                Mostrando: {selectedProgram}
              </span>
            )}
          </div>
        )}
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Contactos CRM (REAL) */}
        <div className="bg-gradient-to-br from-ucsp-burgundy to-ucsp-darkBurgundy text-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <GraduationCap className="w-8 h-8" />
            {crmKpis ? (
              <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-green-400 text-green-900">REAL</span>
            ) : (
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                PERFORMANCE_KPIS.leads.trend_value > 0 ? 'bg-green-400' : 'bg-red-400'
              }`}>{PERFORMANCE_KPIS.leads.trend}</span>
            )}
          </div>
          <h3 className="text-sm font-medium text-white/80 mb-1">
            {crmKpis ? 'Contactos CRM' : 'Leads Generados'}
          </h3>
          <p className="text-2xl font-bold mb-2">
            {crmKpis ? crmKpis.totalContacts.toLocaleString() : PERFORMANCE_KPIS.leads.total.toLocaleString()}
          </p>
          <div className="flex items-baseline gap-2">
            {crmKpis ? (
              <span className="text-sm text-white/70">Conversión: {crmKpis.conversionRate}%</span>
            ) : (
              <>
                <span className="text-sm text-white/70">{PERFORMANCE_KPIS.leads.qualified.toLocaleString()} postulaciones</span>
                <span className="text-xs bg-white/20 px-2 py-1 rounded">{PERFORMANCE_KPIS.leads.qualification_rate}% conversión</span>
              </>
            )}
          </div>
          {crmKpis && (
            <div className="mt-3 pt-3 border-t border-white/20">
              <div className="flex justify-between text-xs">
                <span className="text-white/70">Fuente principal</span>
                <span className="font-bold">{channelData[0]?.name}</span>
              </div>
            </div>
          )}
        </div>

        {/* Leads en Proceso (REAL) */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <Target className="w-8 h-8" />
            {crmKpis ? (
              <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-green-400 text-green-900">REAL</span>
            ) : (
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                PERFORMANCE_KPIS.reach.trend_value > 0 ? 'bg-green-400' : 'bg-red-400'
              }`}>{PERFORMANCE_KPIS.reach.trend}</span>
            )}
          </div>
          <h3 className="text-sm font-medium text-white/80 mb-1">
            {crmKpis ? (selectedProgram ? `Leads · ${selectedProgram}` : 'Leads en Proceso') : 'Alcance Único'}
          </h3>
          <p className="text-2xl font-bold mb-2">
            {crmKpis ? crmKpis.totalLeads.toLocaleString() : `${(PERFORMANCE_KPIS.reach.unique_reach / 1000000).toFixed(1)}M`}
          </p>
          <div className="flex items-baseline gap-2">
            {crmKpis ? (
              <span className="text-sm text-white/70">Tasa de cierre: {crmKpis.winRate}%</span>
            ) : (
              <span className="text-sm text-white/70">Impresiones: {(PERFORMANCE_KPIS.reach.impressions / 1000000).toFixed(1)}M</span>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-white/20">
            <div className="flex justify-between text-xs">
              {crmKpis ? (
                <>
                  <span className="text-white/70">Ganados / Perdidos</span>
                  <span className="font-bold">{crmKpis.wonLeads.toLocaleString()} / {crmKpis.lostLeads.toLocaleString()}</span>
                </>
              ) : (
                <>
                  <span className="text-white/70">Frecuencia</span>
                  <span className="font-bold">{PERFORMANCE_KPIS.reach.frequency}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Revenue (REAL) */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <Award className="w-8 h-8" />
            {crmKpis ? (
              <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-green-400 text-green-900">REAL</span>
            ) : (
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                PERFORMANCE_KPIS.engagement.trend_value > 0 ? 'bg-green-400' : 'bg-red-400'
              }`}>{PERFORMANCE_KPIS.engagement.trend}</span>
            )}
          </div>
          <h3 className="text-sm font-medium text-white/80 mb-1">
            {crmKpis ? (selectedProgram ? `Revenue · ${selectedProgram}` : 'Revenue CRM') : 'Interacciones Totales'}
          </h3>
          <p className="text-2xl font-bold mb-2">
            {crmKpis
              ? `$${(crmKpis.revenue / 1000000).toFixed(1)}M`
              : `${(PERFORMANCE_KPIS.engagement.total_interactions / 1000).toFixed(1)}K`}
          </p>
          <div className="flex items-baseline gap-2">
            {crmKpis ? (
              <span className="text-sm text-white/70">Ticket prom: ${crmKpis.avgDealValue.toFixed(0)}</span>
            ) : (
              <>
                <span className="text-sm text-white/70">Engagement Rate</span>
                <span className="text-xs bg-white/20 px-2 py-1 rounded">{PERFORMANCE_KPIS.engagement.engagement_rate}%</span>
              </>
            )}
          </div>
          {crmKpis && (
            <div className="mt-3 pt-3 border-t border-white/20">
              <div className="flex justify-between text-xs">
                <span className="text-white/70">Campañas</span>
                <span className="font-bold">{crmKpis.activeCampaigns} activas / {crmKpis.totalCampaigns} total</span>
              </div>
            </div>
          )}
        </div>

        {/* Presupuesto Campañas (REAL) */}
        <div className="bg-gradient-to-br from-ucsp-blue to-success text-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <BarChart3 className="w-8 h-8" />
            {crmKpis ? (
              <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-green-400 text-green-900">REAL</span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-400">
                {PERFORMANCE_KPIS.budget.spent_percentage.toFixed(0)}%
              </span>
            )}
          </div>
          <h3 className="text-sm font-medium text-white/80 mb-1">
            {crmKpis ? 'Presupuesto Campañas' : 'Presupuesto Ejecutado'}
          </h3>
          <p className="text-2xl font-bold mb-2">
            {crmKpis
              ? `$${(crmKpis.totalSpend / 1000).toFixed(1)}K`
              : `$${(PERFORMANCE_KPIS.budget.total_spent / 1000).toFixed(1)}K`}
          </p>
          <div className="flex items-baseline gap-2">
            {crmKpis ? (
              <span className="text-sm text-white/70">de ${(crmKpis.totalBudget / 1000).toFixed(0)}K budget</span>
            ) : (
              <span className="text-sm text-white/70">de ${(PERFORMANCE_KPIS.budget.total_budget / 1000).toFixed(0)}K total</span>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-white/20">
            <div className="flex justify-between text-xs">
              <span className="text-white/70">Ejecución</span>
              <span className="font-bold">
                {crmKpis ? `${crmKpis.budgetUtilization}%` : `${PERFORMANCE_KPIS.budget.spent_percentage.toFixed(0)}%`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Leads + Contacts Trends (REAL from HubSpot, filtered by date) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Leads Trend - REAL */}
        {monthlyLeadsData && monthlyLeadsData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-bold text-gray-900">Tendencia de Leads</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800">REAL</span>
                </div>
                <p className="text-sm text-gray-600">{leadsDataLabel}</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyLeadsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Bar dataKey="leads" fill="#003B7A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Monthly Contacts Trend - REAL */}
        {monthlyContactsData && monthlyContactsData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-bold text-gray-900">Tendencia de Contactos</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800">REAL</span>
                </div>
                <p className="text-sm text-gray-600">{hasDailyContacts ? 'Datos diarios · HubSpot CRM' : 'Datos mensuales · HubSpot CRM'}</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyContactsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Bar dataKey="contacts" fill="#6B1B3D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Performance 7 días - MOCK (only show if no contacts chart) */}
        {(!monthlyContactsData || monthlyContactsData.length === 0) && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-bold text-gray-900">Performance 7 Días</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500">MOCK</span>
              </div>
              <p className="text-sm text-gray-600">Pendiente: Google Ads API</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis yAxisId="left" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              <Line yAxisId="left" type="monotone" dataKey="leads" stroke="#6B1B3D" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        )}
      </div>

      {/* Channel Distribution - REAL from HubSpot */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="flex items-center gap-2 mb-8 text-center md:text-left">
          <h3 className="text-base font-bold text-gray-900">
            {selectedProgram ? `Distribución de Leads por Fuente · ${selectedProgram}` : 'Distribución de Contactos por Fuente'}
          </h3>
          {hubspot && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800">REAL</span>}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
          {/* Pie Chart */}
          <div className="flex-shrink-0">
            <ResponsiveContainer width={320} height={320}>
              <PieChart>
                <Pie
                  data={channelData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={false}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {channelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-64 bg-gray-200"></div>

          {/* Legend */}
          <div className="flex-1 max-w-md space-y-3">
            {channelData.map((channel, idx) => (
              <div key={idx} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:shadow-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: channel.color }}></div>
                  <span className="text-sm font-medium text-gray-900 truncate">{channel.name}</span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <span className="text-sm font-bold text-gray-900">{channel.leads.toLocaleString()}</span>
                  <span className="text-sm font-bold text-gray-700 bg-gray-200 px-2.5 py-1 rounded-md min-w-[48px] text-center">
                    {channel.value}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Funnel de Conversión - REAL from HubSpot */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-gray-900">Funnel de Conversión</h3>
            {funnelSteps && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800">REAL</span>}
          </div>
          <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
            {funnelPipeline}
          </span>
        </div>

        {funnelSteps ? (
          <>
            {/* Horizontal Flow */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-4">
              {funnelSteps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2 flex-shrink-0">
                  {/* Step Card */}
                  <div className={`bg-gradient-to-br ${step.color} rounded-xl p-3 text-white shadow-md min-w-[120px]`}>
                    <div className="text-center">
                      <div className="flex justify-center mb-1">
                        <step.IconComponent className="w-6 h-6" />
                      </div>
                      <p className="text-[10px] font-medium text-white/80 uppercase tracking-wide mb-1 leading-tight">{step.stage}</p>
                      <p className="text-lg font-bold">{step.value.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Arrow with conversion rate */}
                  {idx < funnelSteps.length - 1 && step.conversionRate !== null && (
                    <div className="flex flex-col items-center justify-center min-w-[50px]">
                      <div className="text-xs font-bold text-gray-900 mb-1">{step.conversionRate}%</div>
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Cierre Perdido - Separate Indicator */}
            {funnelLost && (
              <div className="mt-4 flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-sm font-bold text-red-700">{funnelLost.value.toLocaleString()} leads perdidos</span>
                  <span className="text-sm text-red-600 ml-2">
                    ({funnelSteps.length > 0 && funnelSteps[0].value > 0
                      ? (funnelLost.value / (funnelSteps[0].value + funnelLost.value) * 100).toFixed(1)
                      : 0}% del total del programa)
                  </span>
                </div>
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-bold flex-shrink-0">
                  {funnelLost.name}
                </span>
              </div>
            )}

            {/* Summary Stats */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-ucsp-blue/10 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Conversión Global</p>
                  <p className="text-xl font-bold text-ucsp-blue">
                    {funnelSteps.length >= 2 && funnelSteps[0].value > 0
                      ? `${(funnelSteps[funnelSteps.length - 1].value / funnelSteps[0].value * 100).toFixed(1)}%`
                      : 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500">{funnelSteps[0]?.stage} → {funnelSteps[funnelSteps.length - 1]?.stage}</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Total en Programa</p>
                  <p className="text-xl font-bold text-orange-600">
                    {(() => {
                      if (hasActiveDateFilter(dateRange) && hubspot?.deals?.daily_by_pipeline) {
                        const filtered = sumFilteredObjectData(hubspot.deals.daily_by_pipeline, dateRange);
                        return (filtered[funnelPipeline] || 0).toLocaleString();
                      }
                      return hubspot?.deals?.pipeline_distribution?.[funnelPipeline]?.toLocaleString() || 'N/A';
                    })()}
                  </p>
                  <p className="text-xs text-gray-500">{funnelPipeline}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Tasa de Cierre General</p>
                  <p className="text-xl font-bold text-green-600">{crmKpis?.winRate || 0}%</p>
                  <p className="text-xs text-gray-500">Todos los programas</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Fallback */
          <div className="text-center py-8 text-gray-500">
            <p>Cargando datos de HubSpot...</p>
          </div>
        )}
      </div>

      {/* Resumen por Programa - Ganados / Perdidos - Collapsible */}
      {pipelineSummary && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <button
            onClick={() => setShowPipelineSummary(!showPipelineSummary)}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors rounded-2xl"
          >
            <div className="flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-ucsp-burgundy" />
              <h3 className="text-base font-bold text-gray-900">Ganados y Perdidos por Programa</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800">REAL</span>
              <span className="ml-2 text-sm text-gray-500">
                ({pipelineSummary.reduce((s, r) => s + r.ganados, 0).toLocaleString()} ganados / {pipelineSummary.reduce((s, r) => s + r.perdidos, 0).toLocaleString()} perdidos)
              </span>
            </div>
            {showPipelineSummary
              ? <ChevronUp className="w-5 h-5 text-gray-400" />
              : <ChevronDown className="w-5 h-5 text-gray-400" />
            }
          </button>

          {showPipelineSummary && (
            <div className="px-6 pb-6">
              <p className="text-sm text-gray-500 mb-4">Matriculados, inscritos o cierres ganados vs. leads perdidos por cada programa.</p>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-3 font-bold text-gray-700">Programa</th>
                      <th className="text-right py-3 px-3 font-bold text-gray-700">Total Leads</th>
                      <th className="text-right py-3 px-3 font-bold text-green-700">Ganados</th>
                      <th className="text-right py-3 px-3 font-bold text-red-700">Perdidos</th>
                      <th className="text-right py-3 px-3 font-bold text-gray-700">Conversión</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pipelineSummary.map((row, idx) => (
                      <tr key={row.name} className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-gray-50/50' : ''} hover:bg-gray-100 transition-colors`}>
                        <td className="py-3 px-3 font-medium text-gray-900">{row.name}</td>
                        <td className="py-3 px-3 text-right text-gray-700 font-semibold">{row.total.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right">
                          <span className="inline-flex items-center gap-1 text-green-700 font-bold">
                            <CheckCircle className="w-3.5 h-3.5" />
                            {row.ganados.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="inline-flex items-center gap-1 text-red-600 font-bold">
                            <XCircle className="w-3.5 h-3.5" />
                            {row.perdidos.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            row.conversionRate >= 10 ? 'bg-green-100 text-green-800' :
                            row.conversionRate >= 5 ? 'bg-amber-100 text-amber-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {row.conversionRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-300 bg-gray-50 font-bold">
                      <td className="py-3 px-3 text-gray-900">TOTAL</td>
                      <td className="py-3 px-3 text-right text-gray-900">
                        {pipelineSummary.reduce((s, r) => s + r.total, 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right text-green-700">
                        {pipelineSummary.reduce((s, r) => s + r.ganados, 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right text-red-600">
                        {pipelineSummary.reduce((s, r) => s + r.perdidos, 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="px-2 py-1 rounded text-xs font-bold bg-ucsp-blue/10 text-ucsp-blue">
                          {(() => {
                            const totalLeads = pipelineSummary.reduce((s, r) => s + r.total, 0);
                            const totalGanados = pipelineSummary.reduce((s, r) => s + r.ganados, 0);
                            return totalLeads > 0 ? (totalGanados / totalLeads * 100).toFixed(1) : 0;
                          })()}%
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Top Campañas & Anuncios — Revenue Attribution (filtered by dateRange + selectedProgram) */}
      {filteredCampaigns && filteredCampaigns.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-ucsp-blue to-ucsp-lightBlue p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Megaphone className="w-7 h-7 text-white" />
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Top Campañas & Anuncios{selectedProgram ? ` · ${selectedProgram}` : ''}
                  </h3>
                  <p className="text-sm text-white/80">Revenue attribution desde HubSpot CRM</p>
                </div>
              </div>
              <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
                {filteredCampaigns.length} campañas
              </span>
            </div>
          </div>

          <div className="p-5">
            {/* Summary KPIs */}
            {(() => {
              const perf = filteredCampaigns;
              const totContacts = perf.reduce((s, c) => s + c.contacts_attributed, 0);
              const totDeals = perf.reduce((s, c) => s + c.deals_attributed, 0);
              const totRevenue = perf.reduce((s, c) => s + c.revenue_attributed, 0);
              const totSpend = perf.reduce((s, c) => s + c.spend, 0);
              const roas = totSpend > 0 ? (totRevenue / totSpend).toFixed(1) : '—';
              const totalAds = perf.reduce((s, c) => s + c.ad_campaigns.length, 0);
              return (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <p className="text-[11px] text-gray-500 font-medium">Contactos Atribuidos</p>
                    <p className="text-xl font-bold text-ucsp-blue">{totContacts.toLocaleString()}</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-3 text-center">
                    <p className="text-[11px] text-gray-500 font-medium">Deals Generados</p>
                    <p className="text-xl font-bold text-green-700">{totDeals.toLocaleString()}</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3 text-center">
                    <p className="text-[11px] text-gray-500 font-medium">Revenue Atribuido</p>
                    <p className="text-xl font-bold text-amber-700">${(totRevenue / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-3 text-center">
                    <p className="text-[11px] text-gray-500 font-medium">ROAS</p>
                    <p className="text-xl font-bold text-purple-700">{roas}x</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-[11px] text-gray-500 font-medium">Anuncios Activos</p>
                    <p className="text-xl font-bold text-gray-700">{totalAds}</p>
                  </div>
                </div>
              );
            })()}

            {/* Campaign table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-2 px-2 text-gray-600 font-semibold">Campaña</th>
                    <th className="text-center py-2 px-1 text-gray-600 font-semibold">Estado</th>
                    <th className="text-right py-2 px-1 text-gray-600 font-semibold">Spend</th>
                    <th className="text-right py-2 px-1 text-gray-600 font-semibold">Contactos</th>
                    <th className="text-right py-2 px-1 text-gray-600 font-semibold">Deals</th>
                    <th className="text-right py-2 px-1 text-gray-600 font-semibold">Revenue</th>
                    <th className="text-right py-2 px-1 text-gray-600 font-semibold">ROAS</th>
                    <th className="text-right py-2 px-1 text-gray-600 font-semibold">CPL</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCampaigns
                    .filter(c => c.contacts_attributed > 0 || c.revenue_attributed > 0 || c.spend > 0)
                    .map((camp, idx) => {
                      const roas = camp.spend > 0 ? (camp.revenue_attributed / camp.spend).toFixed(1) : '—';
                      const cpl = camp.contacts_attributed > 0 ? (camp.spend / camp.contacts_attributed).toFixed(0) : '—';
                      return (
                        <tr key={camp.id || idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-2.5 px-2">
                            <div className="font-medium text-gray-900 text-[13px]">{camp.name}</div>
                            {camp.start_date && (
                              <div className="text-[11px] text-gray-400">
                                {camp.start_date} → {camp.end_date || 'activa'}
                              </div>
                            )}
                          </td>
                          <td className="text-center py-2.5 px-1">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              camp.status === 'in_progress' ? 'bg-green-100 text-green-700' :
                              camp.status === 'completed' ? 'bg-gray-100 text-gray-500' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {camp.status === 'in_progress' ? 'Activa' : camp.status === 'completed' ? 'Finalizada' : camp.status}
                            </span>
                          </td>
                          <td className="text-right py-2.5 px-1 font-medium text-gray-700">${camp.spend.toLocaleString()}</td>
                          <td className="text-right py-2.5 px-1 font-medium text-ucsp-blue">{camp.contacts_attributed}</td>
                          <td className="text-right py-2.5 px-1 font-medium text-green-700">{camp.deals_attributed}</td>
                          <td className="text-right py-2.5 px-1 font-bold text-gray-900">${(camp.revenue_attributed / 1000).toFixed(0)}K</td>
                          <td className="text-right py-2.5 px-1">
                            <span className={`font-bold ${parseFloat(roas) >= 5 ? 'text-green-600' : parseFloat(roas) >= 2 ? 'text-amber-600' : 'text-red-500'}`}>
                              {roas}{roas !== '—' ? 'x' : ''}
                            </span>
                          </td>
                          <td className="text-right py-2.5 px-1 text-gray-600">{cpl !== '—' ? `$${cpl}` : '—'}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Ad campaigns breakdown */}
            {(() => {
              const allAds = [];
              filteredCampaigns.forEach(camp => {
                camp.ad_campaigns.forEach(ad => {
                  allAds.push({
                    ...ad,
                    campaign: camp.name,
                    campaignStatus: camp.status,
                    campaignSpend: camp.spend,
                    campaignContacts: camp.contacts_attributed,
                    campaignRevenue: camp.revenue_attributed
                  });
                });
              });
              if (allAds.length === 0) return null;
              return (
                <div className="mt-5 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Anuncios Asociados ({allAds.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {allAds.map((ad, idx) => {
                      const isGoogle = ad.name.toLowerCase().includes('google');
                      const isMeta = ad.name.toLowerCase().includes('meta') || ad.name.toLowerCase().includes('facebook') || ad.name.toLowerCase().includes('instagram');
                      const isLinkedIn = ad.name.toLowerCase().includes('linkedin');
                      const platformColor = isGoogle ? 'border-l-blue-500 bg-blue-50/50' :
                                           isMeta ? 'border-l-purple-500 bg-purple-50/50' :
                                           isLinkedIn ? 'border-l-sky-500 bg-sky-50/50' :
                                           'border-l-gray-400 bg-gray-50/50';
                      const platformLabel = isGoogle ? 'Google' : isMeta ? 'Meta' : isLinkedIn ? 'LinkedIn' : 'Otro';
                      return (
                        <div key={ad.id || idx} className={`border-l-4 ${platformColor} rounded-lg px-3 py-2`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-[12px] font-medium text-gray-800">{ad.name}</p>
                              <p className="text-[10px] text-gray-400">{ad.campaign}</p>
                            </div>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              isGoogle ? 'bg-blue-100 text-blue-700' :
                              isMeta ? 'bg-purple-100 text-purple-700' :
                              isLinkedIn ? 'bg-sky-100 text-sky-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {platformLabel}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* HubSpot CRM - Resumen */}
      <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell className="w-8 h-8" />
            <div>
              <h3 className="text-lg font-bold">HubSpot CRM - Resumen</h3>
              <p className="text-sm text-white/90">
                {crmKpis ? 'Datos reales del CRM' : 'Alertas automáticas de costo por lead'}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${crmKpis ? 'bg-green-400 text-green-900' : 'bg-white/20'}`}>
            {crmKpis ? 'CONECTADO' : 'MONITOREO'}
          </span>
        </div>

        {crmKpis ? (
          <>
            {/* Real CRM Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                <p className="text-xs text-white/70">Contactos</p>
                <p className="text-xl font-bold">{crmKpis.totalContacts.toLocaleString()}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                <p className="text-xs text-white/70">Leads en Proceso</p>
                <p className="text-xl font-bold">{crmKpis.totalLeads.toLocaleString()}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                <p className="text-xs text-white/70">Tasa de Cierre</p>
                <p className="text-xl font-bold">{crmKpis.winRate}%</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                <p className="text-xs text-white/70">Revenue</p>
                <p className="text-xl font-bold">${(crmKpis.revenue / 1000000).toFixed(1)}M</p>
              </div>
            </div>

            {/* Distribución por Programa */}
            {hubspot?.deals?.pipeline_distribution && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
                <h4 className="font-bold text-sm mb-3">Leads por Programa:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {(() => {
                    const pipelineDist = hasActiveDateFilter(dateRange) && hubspot.deals.daily_by_pipeline
                      ? sumFilteredObjectData(hubspot.deals.daily_by_pipeline, dateRange)
                      : hubspot.deals.pipeline_distribution;
                    return Object.entries(pipelineDist)
                      .sort((a, b) => b[1] - a[1])
                      .map(([name, count]) => (
                        <div key={name} className="flex justify-between text-sm bg-white/5 rounded-lg px-3 py-2">
                          <span className="text-white/80 truncate mr-2">{name}</span>
                          <span className="font-bold flex-shrink-0">{count.toLocaleString()}</span>
                        </div>
                      ));
                  })()}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Fallback: CPL Thresholds */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <h4 className="font-bold mb-3 flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Pregrado
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>CPL Máximo</span>
                  <span className="font-bold">${HUBSPOT_CONFIG.cpl_thresholds.pregrado.max_cpl}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Alerta en</span>
                  <span className="font-bold text-yellow-300">${HUBSPOT_CONFIG.cpl_thresholds.pregrado.alert_at}</span>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <h4 className="font-bold mb-3 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Posgrado
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>CPL Máximo</span>
                  <span className="font-bold">${HUBSPOT_CONFIG.cpl_thresholds.posgrado.max_cpl}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Alerta en</span>
                  <span className="font-bold text-yellow-300">${HUBSPOT_CONFIG.cpl_thresholds.posgrado.alert_at}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 p-3 bg-white/20 backdrop-blur-sm rounded-lg">
          <p className="text-xs flex items-center gap-1">
            <Lightbulb className="w-4 h-4" />
            <strong>Fuente:</strong> {crmKpis ? `HubSpot Portal ${hubspot?.metadata?.portal_id} | Datos actualizados semanalmente (Lunes 8am)` : 'Sistema de monitoreo de HubSpot configurado y listo para activación.'}
          </p>
        </div>
      </div>

      {/* Alertas Automáticas */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-ucsp-burgundy" />
          <h3 className="text-base font-bold text-gray-900">Alertas Automáticas</h3>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500">MOCK</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {ALERTS.slice(0, 3).map((alert) => (
            <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${
              alert.severity === 'high' ? 'bg-red-50 border-red-500' :
              alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-500' :
              'bg-blue-50 border-blue-500'
            }`}>
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-bold text-gray-900 text-sm">{alert.title}</h4>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  alert.severity === 'high' ? 'bg-red-200 text-red-800' :
                  alert.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                  'bg-blue-200 text-blue-800'
                }`}>
                  {alert.severity.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-gray-700 mb-2">{alert.message}</p>
              <p className="text-xs font-semibold text-ucsp-blue">
                Acción: {alert.action}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Competitor Analysis */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base font-bold text-gray-900">Análisis de Competencia Universitaria</h3>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500">MOCK</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {COMPETITOR_INSIGHTS.filter(c => c.brand !== 'UCSP').map((comp, idx) => (
            <div key={idx} className="p-4 border-2 border-gray-200 rounded-lg hover:border-ucsp-burgundy transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-bold text-gray-900">{comp.brand}</h4>
                  <p className="text-xs text-gray-500">{comp.location}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  comp.threat_level === 'high' ? 'bg-red-100 text-red-700' :
                  comp.threat_level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {comp.threat_level === 'high' ? 'Alta' : comp.threat_level === 'medium' ? 'Media' : 'Baja'}
                </span>
              </div>

              <p className="text-xs text-gray-600 mb-3 leading-relaxed">{comp.description}</p>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-xs text-gray-500">Share of Voice</p>
                  <p className="text-base font-bold text-gray-900">{comp.share_of_voice}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Sentimiento</p>
                  <p className="text-base font-bold text-ucsp-blue">{comp.sentiment}%</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Temas Trending</p>
                <div className="flex flex-wrap gap-1">
                  {comp.trending_topics.map((topic, topicIdx) => (
                    <span key={topicIdx} className="px-2 py-1 bg-gray-100 rounded text-xs">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* UCSP Comparison */}
        <div className="mt-4 p-5 bg-gradient-to-br from-ucsp-burgundy to-ucsp-darkBurgundy text-white rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-base mb-1 flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Universidad Católica San Pablo
              </h4>
              <p className="text-xs text-white/70 mb-2">Primera universidad licenciada del sur, posición 19 en ranking QS 2024</p>
              <div className="flex gap-6">
                <div>
                  <p className="text-xs text-white/70">Share of Voice</p>
                  <p className="text-xl font-bold">13%</p>
                </div>
                <div>
                  <p className="text-xs text-white/70">Sentimiento</p>
                  <p className="text-xl font-bold">78%</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="px-3 py-2 bg-white/20 rounded-lg text-sm font-bold">
                Nuestra Universidad
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
