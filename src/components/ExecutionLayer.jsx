import { DollarSign, TrendingUp, Target, Zap, Calendar, PlayCircle, AlertTriangle } from 'lucide-react';
import { BUDGET_ALLOCATION, CONTENT_PILLARS } from '../data/mockData';
import { LAYER_CONFIG, CHANNELS_CONFIG } from '../data/config';

export default function ExecutionLayer() {
  // Calcular status color
  const getStatusColor = (status) => {
    if (status === 'overperforming') return { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700', badge: 'bg-green-100' };
    if (status === 'performing') return { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700', badge: 'bg-blue-100' };
    if (status === 'ontrack') return { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', badge: 'bg-amber-100' };
    return { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700', badge: 'bg-red-100' };
  };

  const getStatusIcon = (status) => {
    if (status === 'overperforming') return '🚀';
    if (status === 'performing') return '✓';
    if (status === 'ontrack') return '→';
    return '⚠';
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
            <span className="px-3 py-1 bg-honda-blue text-white rounded-full text-sm font-medium flex items-center gap-1">
              <PlayCircle className="w-4 h-4" />
              Live
            </span>
          </div>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="bg-gradient-to-br from-honda-red to-honda-darkRed text-white rounded-2xl shadow-honda-lg p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <DollarSign className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Presupuesto Mensual</h3>
              <p className="text-white/90 mt-1 text-sm">Distribución inteligente por canal</p>
            </div>
          </div>

          <div className="text-center lg:text-right">
            <div className="flex items-baseline gap-2">
              <span className="text-xl text-white/80">USD</span>
              <span className="text-4xl font-bold">${(BUDGET_ALLOCATION.total_budget / 1000).toFixed(0)}K</span>
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
          <div className="w-12 h-12 bg-gradient-to-br from-honda-blue to-success rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Distribución por Canal</h3>
            <p className="text-sm text-gray-600">Performance y asignación actual</p>
          </div>
        </div>

        <div className="grid gap-4">
          {Object.entries(BUDGET_ALLOCATION.distribution).map(([key, channel]) => {
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
                         key === 'display' ? 'Display Network' : 'TikTok Ads'}
                      </h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors.badge} ${colors.text}`}>
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

      {/* Content Pillars */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-honda-gray to-honda-black rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Pilares de Contenido CR-V</h3>
            <p className="text-sm text-gray-600">Performance y distribución recomendada</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CONTENT_PILLARS.map((pillar, idx) => {
            const colors = getStatusColor(pillar.status);
            return (
              <div key={pillar.id} className={`p-5 rounded-xl border-2 ${colors.bg} ${colors.border}`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-gray-900 text-base">{pillar.title}</h4>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors.badge} ${colors.text}`}>
                    {getStatusIcon(pillar.status)}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-4">{pillar.description}</p>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Engagement Rate</span>
                    <span className="font-semibold text-gray-900">{pillar.performance.engagement_rate}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Alcance</span>
                    <span className="font-semibold text-gray-900">{(pillar.performance.reach / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Conversiones</span>
                    <span className="font-semibold text-honda-blue">{pillar.performance.conversions}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-300">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Budget Recomendado</span>
                    <span className="text-base font-bold text-gray-900">{(pillar.recommended_budget * 100).toFixed(0)}%</span>
                  </div>
                </div>

                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-1">Formatos:</p>
                  <div className="flex flex-wrap gap-1">
                    {pillar.formats.map((format, idx) => (
                      <span key={idx} className="px-2 py-1 bg-white rounded text-xs font-medium text-gray-700">
                        {format}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timing Recommendations */}
      <div className="bg-gradient-to-br from-honda-blue to-success text-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-8 h-8" />
          <h3 className="text-lg font-bold">Timing Óptimo de Pauta</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
            <h4 className="font-bold text-base mb-3">Mejores horarios del día</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white/90">7:00 - 9:00 AM</span>
                <span className="px-2 py-1 bg-white/20 rounded text-sm font-bold">+20%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/90">6:00 - 9:00 PM</span>
                <span className="px-2 py-1 bg-white/20 rounded text-sm font-bold">+30%</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
            <h4 className="font-bold text-base mb-3">Mejores días de la semana</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white/90">Lunes</span>
                <span className="px-2 py-1 bg-green-500 rounded text-sm font-bold">Alta</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/90">Miércoles</span>
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
          <p className="text-sm font-semibold mb-2">💡 Eventos clave:</p>
          <p className="text-sm">Fines de semana largos, Temporada de bonos (Jul-Dic), Fiestas Patrias</p>
        </div>
      </div>
    </div>
  );
}
