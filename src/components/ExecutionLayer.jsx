import { useState } from 'react';
import { DollarSign, TrendingUp, Target, Zap, Calendar, PlayCircle, AlertTriangle, GraduationCap, ChevronDown, ChevronUp, MessageCircle, Rocket, CheckCircle, ArrowRight, AlertCircle, FileText, Globe, Star, Lightbulb, Database, XCircle, Users } from 'lucide-react';
import { BUDGET_ALLOCATION, CONTENT_PILLARS } from '../data/mockData';
import { LAYER_CONFIG, CHANNELS_CONFIG } from '../data/config';
import { useHubSpotData } from '../hooks/useRealData';

// Display names and colors for HubSpot sources
const SOURCE_DISPLAY = {
  PAID_SEARCH: { name: 'Google Ads', color: 'bg-blue-100 text-blue-800' },
  PAID_SOCIAL: { name: 'Meta Ads', color: 'bg-purple-100 text-purple-800' },
  ORGANIC_SEARCH: { name: 'Orgánico', color: 'bg-green-100 text-green-800' },
  DIRECT_TRAFFIC: { name: 'Directo', color: 'bg-gray-100 text-gray-800' },
  OFFLINE: { name: 'Offline', color: 'bg-yellow-100 text-yellow-800' },
  REFERRALS: { name: 'Referidos', color: 'bg-indigo-100 text-indigo-800' },
  OTHER_CAMPAIGNS: { name: 'Otras', color: 'bg-orange-100 text-orange-800' },
  SOCIAL_MEDIA: { name: 'Redes', color: 'bg-pink-100 text-pink-800' },
};

// Friendly display names for pipelines
const PIPELINE_DISPLAY = {
  'Formación Continua': { short: 'Form. Continua', icon: 'book' },
  'Pregrado': { short: 'Pregrado', icon: 'graduation' },
  'Pregrado Matrículas': { short: 'Pregrado Matrículas', icon: 'clipboard' },
  'Postgrado Maestrías': { short: 'Maestrías', icon: 'award' },
  'Postgrado Diplomados': { short: 'Diplomados', icon: 'file' },
  'Postgrado PED': { short: 'PED (Prog. Ejecutivos)', icon: 'briefcase' },
  'Centro de Idiomas': { short: 'Idiomas', icon: 'globe' },
  'Pregrado Colegios': { short: 'Colegios', icon: 'school' },
  'CENDES': { short: 'CENDES', icon: 'building' },
};

/**
 * Calculate ganados/perdidos from stage_distribution (direct HubSpot data).
 * Same logic used in OptimizationLayer — scans stage names and definitions.
 */
function calcWonLost(hubspot, pipelineName) {
  const stages = hubspot?.deals?.stage_distribution?.[pipelineName];
  if (!stages) return { won: 0, lost: 0 };

  const pipelineDef = hubspot.pipelines?.find(p => p.name === pipelineName);
  let won = 0;
  let lost = 0;

  if (pipelineDef?.stages) {
    pipelineDef.stages.forEach(s => {
      const count = stages[s.name] || 0;
      const nameLower = s.name.toLowerCase();
      if (nameLower.includes('perdido')) {
        lost += count;
      } else if (
        (s.is_closed && s.probability > 0) ||
        nameLower.includes('ganado') ||
        nameLower.includes('matriculado')
      ) {
        won += count;
      }
    });
  } else {
    Object.entries(stages).forEach(([stageName, count]) => {
      const nameLower = stageName.toLowerCase();
      if (nameLower.includes('perdido')) {
        lost += count;
      } else if (
        nameLower.includes('ganado') ||
        nameLower.includes('matriculado') ||
        nameLower.includes('pagado')
      ) {
        won += count;
      }
    });
  }

  return { won, lost };
}

/**
 * Build pipeline performance data from HubSpot
 * Calculates ganados/perdidos from stage_distribution (same as OptimizationLayer).
 * Includes: total leads, won, lost, revenue, channel breakdown, estimated CPL
 */
function buildPipelinePerformance(hubspot) {
  if (!hubspot?.deals) return null;

  const { pipeline_distribution, source_by_pipeline, revenue } = hubspot.deals;
  if (!pipeline_distribution) return null;

  const totalSpend = hubspot.campaigns?.total_spend || 0;
  const totalLeadsAllPipelines = Object.values(pipeline_distribution).reduce((s, v) => s + v, 0) || 1;

  return Object.entries(pipeline_distribution)
    .sort((a, b) => b[1] - a[1])
    .map(([name, totalLeads]) => {
      const wonLost = calcWonLost(hubspot, name);
      const sources = source_by_pipeline?.[name] || {};
      const pipelineRevenue = revenue?.by_pipeline?.[name] || 0;

      // Estimated spend proportional to lead volume
      const estimatedSpend = totalSpend * (totalLeads / totalLeadsAllPipelines);
      const cpl = totalLeads > 0 ? estimatedSpend / totalLeads : 0;
      const costPerWon = wonLost.won > 0 ? estimatedSpend / wonLost.won : 0;
      const conversionRate = totalLeads > 0 ? (wonLost.won / totalLeads * 100) : 0;

      // Top 4 channels
      const topChannels = Object.entries(sources)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([src, count]) => ({
          source: src,
          name: SOURCE_DISPLAY[src]?.name || src,
          color: SOURCE_DISPLAY[src]?.color || 'bg-gray-100 text-gray-800',
          count,
          pct: totalLeads > 0 ? parseFloat((count / totalLeads * 100).toFixed(1)) : 0,
        }));

      return {
        name,
        displayName: PIPELINE_DISPLAY[name]?.short || name,
        totalLeads,
        won: wonLost.won,
        lost: wonLost.lost,
        revenue: pipelineRevenue,
        estimatedSpend,
        cpl,
        costPerWon,
        conversionRate: parseFloat(conversionRate.toFixed(1)),
        topChannels,
      };
    });
}

export default function ExecutionLayer({ dateFilter = 'all' }) {
  const { data: hubspot } = useHubSpotData();
  const [showAllPipelines, setShowAllPipelines] = useState(false);
  const [expandedPipeline, setExpandedPipeline] = useState(null);

  const pipelinePerformance = buildPipelinePerformance(hubspot);
  const hasPipelineData = pipelinePerformance && pipelinePerformance.length > 0;

  // Calcular status color
  const getStatusColor = (status) => {
    if (status === 'overperforming') return { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700', badge: 'bg-green-100' };
    if (status === 'performing') return { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700', badge: 'bg-blue-100' };
    if (status === 'ontrack') return { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', badge: 'bg-amber-100' };
    return { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700', badge: 'bg-red-100' };
  };

  const getStatusIcon = (status) => {
    if (status === 'overperforming') return <Rocket className="w-3 h-3" />;
    if (status === 'performing') return <CheckCircle className="w-3 h-3" />;
    if (status === 'ontrack') return <ArrowRight className="w-3 h-3" />;
    return <AlertCircle className="w-3 h-3" />;
  };

  // Performance status based on conversion rate
  const getConversionStatus = (rate) => {
    if (rate >= 10) return 'overperforming';
    if (rate >= 7) return 'performing';
    if (rate >= 4) return 'ontrack';
    return 'underperforming';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              {LAYER_CONFIG.execution.name}
            </h2>
            <p className="text-gray-600">
              {LAYER_CONFIG.execution.subtitle}
            </p>
          </div>
          <div className="flex gap-2">
            {hasPipelineData && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center gap-1">
                <Database className="w-3 h-3" />
                HubSpot conectado
              </span>
            )}
            <span className="px-3 py-1 bg-ucsp-blue text-white rounded-full text-sm font-medium flex items-center gap-1">
              <PlayCircle className="w-4 h-4" />
              Live
            </span>
          </div>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="bg-gradient-to-br from-ucsp-burgundy to-ucsp-darkBurgundy text-white rounded-2xl shadow-ucsp-lg p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <DollarSign className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Presupuesto Mensual Admisiones</h3>
              <p className="text-white/90 mt-1 text-sm">Distribución inteligente por canal digital</p>
            </div>
          </div>

          <div className="text-center lg:text-right">
            <div className="flex items-baseline gap-2">
              <span className="text-xl text-white/80">$</span>
              <span className="text-4xl font-bold">{(BUDGET_ALLOCATION.total_budget / 1000).toFixed(0)}K</span>
            </div>
            <p className="text-white/80 mt-2">Total presupuesto mensual</p>
          </div>
        </div>

        {/* Budget Progress */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium">Ejecución del mes</span>
            <span className="text-xl font-bold">
              ${(Object.values(BUDGET_ALLOCATION.distribution).reduce((sum, ch) => sum + ch.amount, 0)).toLocaleString()}
            </span>
          </div>
          <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full" style={{ width: '100%' }}></div>
          </div>
          <p className="text-xs text-white/70 mt-2">100% del presupuesto asignado</p>
        </div>
      </div>

      {/* Budget Allocation by Channel */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-ucsp-blue to-ucsp-lightBlue rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Distribución por Canal Digital</h3>
            <p className="text-sm text-gray-600">Performance y asignación para Admisiones 2026-I</p>
          </div>
        </div>

        <div className="grid gap-4">
          {Object.entries(BUDGET_ALLOCATION.distribution)
            .filter(([key]) => key !== 'tiktok' && key !== 'linkedin')
            .map(([key, channel]) => {
            const colors = getStatusColor(channel.status);
            return (
              <div key={key} className={`p-5 rounded-xl border-2 ${colors.bg} ${colors.border}`}>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-bold text-gray-900 text-base">
                        {key === 'google_search' ? 'Google Search' :
                         key === 'social_media' ? 'Meta Ads (FB + IG)' :
                         key === 'youtube' ? 'YouTube Ads' :
                         key === 'display' ? 'Display Network' : key}
                      </h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${colors.badge} ${colors.text}`}>
                        {getStatusIcon(channel.status)} {channel.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      <strong>KPI Principal:</strong> {channel.kpi}
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500">Target</p>
                        <p className="font-semibold text-gray-900">{channel.target}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Performance Actual</p>
                        <p className={`font-semibold ${colors.text}`}>{channel.current_performance}</p>
                      </div>
                    </div>

                    {/* WhatsApp Metrics for Meta Ads */}
                    {key === 'social_media' && channel.whatsapp_metrics && (
                      <div className="mt-4 pt-3 border-t border-gray-300">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageCircle className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-semibold text-gray-700">Conversaciones WhatsApp</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="text-gray-500">Iniciadas</p>
                            <p className="font-semibold text-gray-900">{channel.whatsapp_metrics.conversations}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Tasa Respuesta</p>
                            <p className="font-semibold text-green-600">{channel.whatsapp_metrics.response_rate}%</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-center lg:text-right lg:min-w-[200px]">
                    <div className="mb-2">
                      <span className="text-2xl font-bold text-gray-900">{channel.percentage}%</span>
                    </div>
                    <div className="text-xl font-bold text-gray-800 mb-1">
                      ${channel.amount.toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-500">del presupuesto total</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        channel.status === 'overperforming' ? 'bg-green-500' :
                        channel.status === 'performing' ? 'bg-blue-500' :
                        channel.status === 'ontrack' ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${channel.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recomendaciones de Redistribución */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Recomendaciones de Optimización</h3>
            <p className="text-sm text-gray-600">Ajustes sugeridos basados en performance</p>
          </div>
        </div>

        <div className="space-y-4">
          {BUDGET_ALLOCATION.recommendations.map((rec, idx) => (
            <div key={idx} className={`p-5 rounded-xl border-2 ${
              rec.type === 'increase' ? 'bg-green-50 border-green-200' :
              rec.type === 'decrease' ? 'bg-red-50 border-red-200' :
              'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    rec.type === 'increase' ? 'bg-green-200 text-green-800' :
                    rec.type === 'decrease' ? 'bg-red-200 text-red-800' :
                    'bg-blue-200 text-blue-800'
                  }`}>
                    {rec.type === 'increase' ? '↑ AUMENTAR' :
                     rec.type === 'decrease' ? '↓ REDUCIR' : '→ MANTENER'}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 uppercase">
                    {rec.channel === 'google_search' ? 'Google Search' :
                     rec.channel === 'social_media' ? 'Meta Ads' :
                     rec.channel === 'youtube' ? 'YouTube' : rec.channel}
                  </span>
                </div>
                {rec.from && rec.to && (
                  <div className="text-right">
                    <span className="text-xs text-gray-500">Cambio</span>
                    <p className="font-bold text-gray-900">{rec.from}% → {rec.to}%</p>
                  </div>
                )}
              </div>

              <p className="text-gray-900 font-medium mb-2">{rec.reason}</p>
              {rec.impact && (
                <p className="text-sm text-green-700 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  Impacto: {rec.impact}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Performance por Programa - REAL DATA */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-ucsp-burgundy to-ucsp-darkBurgundy rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-900">Performance por Programa</h3>
                {hasPipelineData && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800">REAL</span>}
              </div>
              <p className="text-sm text-gray-600">Leads, conversiones y CPL estimado por programa</p>
            </div>
          </div>
          {hasPipelineData && (
            <button
              onClick={() => setShowAllPipelines(!showAllPipelines)}
              className="flex items-center gap-2 px-4 py-2 bg-ucsp-blue text-white rounded-lg hover:bg-ucsp-darkBlue transition-colors text-sm font-medium"
            >
              {showAllPipelines ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Mostrar top 5
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Mostrar todos ({pipelinePerformance?.length || 0})
                </>
              )}
            </button>
          )}
        </div>

        {hasPipelineData ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pipelinePerformance
                .slice(0, showAllPipelines ? pipelinePerformance.length : 5)
                .map((pipeline, idx) => {
                  const status = getConversionStatus(pipeline.conversionRate);
                  const colors = getStatusColor(status);
                  const isExpanded = expandedPipeline === pipeline.name;

                  return (
                    <div key={pipeline.name} className={`p-5 rounded-xl border-2 ${colors.bg} ${colors.border} transition-all`}>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-gray-900 text-base">{pipeline.displayName}</h4>
                        <div className="flex items-center gap-2">
                          {idx < 3 && (
                            <span className="px-2 py-1 rounded-full text-xs font-bold bg-ucsp-gold/20 text-ucsp-burgundy flex items-center gap-1">
                              <Star className="w-3 h-3" /> TOP {idx + 1}
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${colors.badge} ${colors.text}`}>
                            {getStatusIcon(status)} {pipeline.conversionRate}%
                          </span>
                        </div>
                      </div>

                      {/* Key Metrics */}
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div>
                          <p className="text-xs text-gray-500">Total Leads</p>
                          <p className="text-lg font-bold text-gray-900">{pipeline.totalLeads.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-green-600" /> Ganados
                          </p>
                          <p className="text-lg font-bold text-green-700">{pipeline.won.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-red-500" /> Perdidos
                          </p>
                          <p className="text-lg font-bold text-red-600">{pipeline.lost.toLocaleString()}</p>
                        </div>
                      </div>

                      {/* CPL & Cost per Won */}
                      <div className="pt-3 border-t border-gray-300 mb-3">
                        <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                          <DollarSign className="w-3 h-3" /> Costos Estimados
                          <span className="ml-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[9px] font-bold">ESTIMADO</span>
                        </p>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <p className="text-gray-500">CPL</p>
                            <p className="font-bold text-gray-900">${pipeline.cpl.toFixed(1)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Costo/Ganado</p>
                            <p className="font-bold text-ucsp-burgundy">${pipeline.costPerWon.toFixed(0)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Revenue</p>
                            <p className="font-bold text-green-700">${(pipeline.revenue / 1000).toFixed(0)}K</p>
                          </div>
                        </div>
                      </div>

                      {/* Channel Breakdown */}
                      <div className="pt-3 border-t border-gray-300">
                        <button
                          onClick={() => setExpandedPipeline(isExpanded ? null : pipeline.name)}
                          className="flex items-center justify-between w-full text-xs font-semibold text-gray-700 mb-2"
                        >
                          <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3" /> Desglose por Canal
                          </span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                        {isExpanded && (
                          <div className="space-y-2 mt-2">
                            {pipeline.topChannels.map(ch => (
                              <div key={ch.source} className="flex items-center justify-between">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${ch.color}`}>
                                  {ch.name}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-700 font-semibold">{ch.count.toLocaleString()}</span>
                                  <span className="text-xs text-gray-500">({ch.pct}%)</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            {!showAllPipelines && pipelinePerformance.length > 5 && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Mostrando top 5 programas. Haz clic en "Mostrar todos" para ver los {pipelinePerformance.length} programas.
                </p>
              </div>
            )}

            {/* CPL Note */}
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-800 flex items-center gap-1">
                <Lightbulb className="w-4 h-4 flex-shrink-0" />
                <strong>Nota:</strong> Los CPL son estimados, calculados distribuyendo proporcionalmente el gasto total de campañas (${(hubspot?.campaigns?.total_spend || 0).toLocaleString()}) entre programas según volumen de leads.
                Para CPL exactos por canal se requiere Google Ads API y Meta Marketing API.
              </p>
            </div>
          </>
        ) : (
          /* Fallback: Mock data loading message */
          <div className="text-center py-8 text-gray-500">
            <Database className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>Conectando con HubSpot para datos por programa...</p>
          </div>
        )}
      </div>

      {/* Timing Recommendations */}
      <div className="bg-gradient-to-br from-ucsp-blue to-ucsp-lightBlue text-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-8 h-8" />
          <h3 className="text-lg font-bold">Timing Óptimo de Campaña</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
            <h4 className="font-bold text-base mb-3">Mejores horarios del día</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white/90">7:00 - 9:00 AM</span>
                <span className="px-2 py-1 bg-white/20 rounded text-sm font-bold">+30%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/90">6:00 - 9:00 PM</span>
                <span className="px-2 py-1 bg-white/20 rounded text-sm font-bold">+40%</span>
              </div>
            </div>
            <p className="text-xs text-white/70 mt-3">Estudiantes activos antes/después de clases</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
            <h4 className="font-bold text-base mb-3">Mejores días de la semana</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white/90">Lunes</span>
                <span className="px-2 py-1 bg-green-500 rounded text-sm font-bold">Alta</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/90">Martes</span>
                <span className="px-2 py-1 bg-green-500 rounded text-sm font-bold">Alta</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/90">Jueves</span>
                <span className="px-2 py-1 bg-green-500 rounded text-sm font-bold">Alta</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-white/20 backdrop-blur-sm rounded-xl">
          <p className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" /> Eventos clave admisiones:
          </p>
          <p className="text-sm">Inicio campaña (Ene-Feb), Exámenes (Mar-Abr), Fiestas Patrias (Jul), Campaña II (Ago-Sep), Charlas vocacionales (continuo)</p>
        </div>
      </div>
    </div>
  );
}
