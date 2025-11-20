import { TrendingUp, BarChart3, RefreshCw, Award, Target, Users, Heart, Zap, AlertCircle, GraduationCap, Bell } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { PERFORMANCE_KPIS, ALERTS, COMPETITOR_INSIGHTS, HUBSPOT_MOCKUP } from '../data/mockData';
import { LAYER_CONFIG, METRIC_CARDS_CONFIG, HUBSPOT_CONFIG } from '../data/config';

export default function OptimizationLayer() {
  // Performance últimos 7 días - UCSP Admisiones
  const performanceData = [
    { date: '14 Nov', leads: 95, reach: 105000, engagement: 15200, spent: 5950 },
    { date: '15 Nov', leads: 142, reach: 118000, engagement: 18500, spent: 6480 },
    { date: '16 Nov', leads: 118, reach: 110000, engagement: 16800, spent: 6120 },
    { date: '17 Nov', leads: 88, reach: 98000, engagement: 14200, spent: 5680 },
    { date: '18 Nov', leads: 156, reach: 128000, engagement: 20100, spent: 6850 },
    { date: '19 Nov', leads: 135, reach: 122000, engagement: 18900, spent: 6590 },
    { date: '20 Nov', leads: 108, reach: 115000, engagement: 17400, spent: 6250 }
  ];

  // Channel performance distribution (sin TikTok ni LinkedIn)
  const channelData = [
    { name: 'Google Search', value: 35, leads: 291, color: '#003B7A' }, // UCSP Blue
    { name: 'Meta Ads', value: 35, leads: 291, color: '#6B1B3D' }, // UCSP Burgundy
    { name: 'YouTube', value: 20, leads: 166, color: '#EF4444' }, // Rojo YouTube
    { name: 'Display', value: 10, leads: 83, color: '#C5A572' } // UCSP Gold
  ];

  // Funnel de conversión UCSP - Datos sinceros basados en GA4 y Performance real
  const funnelSteps = [
    {
      stage: 'Alcance',
      value: 540000, // Reach único de campaigns (sincronizado con PERFORMANCE_KPIS)
      conversionRate: 7.8,
      conversionLabel: 'a Landing',
      icon: '👥',
      color: 'from-ucsp-blue to-ucsp-lightBlue'
    },
    {
      stage: 'Visitas Landing',
      value: 42200, // Sessions de GA4
      conversionRate: 2.3,
      conversionLabel: 'a Formulario',
      icon: '🌐',
      color: 'from-ucsp-lightBlue to-ucsp-skyBlue'
    },
    {
      stage: 'Formularios',
      value: 980, // Total leads generados (sincronizado con PERFORMANCE_KPIS)
      conversionRate: 79.6,
      conversionLabel: 'a Postulación',
      icon: '📝',
      color: 'from-ucsp-burgundy to-ucsp-wine'
    },
    {
      stage: 'Postulaciones',
      value: 780, // Leads calificados (sincronizado con PERFORMANCE_KPIS)
      conversionRate: 23.0,
      conversionLabel: 'a Matrícula',
      icon: '🎓',
      color: 'from-ucsp-gold to-ucsp-burgundy'
    },
    {
      stage: 'Matriculados',
      value: 179, // ~23% de postulaciones (tasa realista de conversión final)
      conversionRate: null,
      conversionLabel: null,
      icon: '✅',
      color: 'from-green-500 to-green-600'
    }
  ];

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
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-ucsp-blue text-white rounded-full text-sm font-medium flex items-center gap-1">
              <RefreshCw className="w-4 h-4" />
              Auto-optimización activa
            </span>
          </div>
        </div>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Postulaciones */}
        <div className="bg-gradient-to-br from-ucsp-burgundy to-ucsp-darkBurgundy text-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <GraduationCap className="w-8 h-8" />
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              PERFORMANCE_KPIS.leads.trend_value > 0 ? 'bg-green-400' : 'bg-red-400'
            }`}>
              {PERFORMANCE_KPIS.leads.trend}
            </span>
          </div>
          <h3 className="text-sm font-medium text-white/80 mb-1">Leads Generados (Formularios)</h3>
          <p className="text-2xl font-bold mb-2">{PERFORMANCE_KPIS.leads.total.toLocaleString()}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-white/70">{PERFORMANCE_KPIS.leads.qualified.toLocaleString()} postulaciones</span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded">{PERFORMANCE_KPIS.leads.qualification_rate}% conversión</span>
          </div>
          <div className="mt-3 pt-3 border-t border-white/20">
            <div className="flex justify-between text-xs">
              <span className="text-white/70">CPL</span>
              <span className="font-bold">${PERFORMANCE_KPIS.leads.cost_per_lead}</span>
            </div>
          </div>
        </div>

        {/* Alcance */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <Users className="w-8 h-8" />
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              PERFORMANCE_KPIS.reach.trend_value > 0 ? 'bg-green-400' : 'bg-red-400'
            }`}>
              {PERFORMANCE_KPIS.reach.trend}
            </span>
          </div>
          <h3 className="text-sm font-medium text-white/80 mb-1">Alcance Único</h3>
          <p className="text-2xl font-bold mb-2">{(PERFORMANCE_KPIS.reach.unique_reach / 1000000).toFixed(1)}M</p>
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-white/70">Impresiones: {(PERFORMANCE_KPIS.reach.impressions / 1000000).toFixed(1)}M</span>
          </div>
          <div className="mt-3 pt-3 border-t border-white/20">
            <div className="flex justify-between text-xs">
              <span className="text-white/70">Frecuencia</span>
              <span className="font-bold">{PERFORMANCE_KPIS.reach.frequency}</span>
            </div>
          </div>
        </div>

        {/* Engagement */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <Heart className="w-8 h-8" />
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              PERFORMANCE_KPIS.engagement.trend_value > 0 ? 'bg-green-400' : 'bg-red-400'
            }`}>
              {PERFORMANCE_KPIS.engagement.trend}
            </span>
          </div>
          <h3 className="text-sm font-medium text-white/80 mb-1">Interacciones Totales</h3>
          <p className="text-2xl font-bold mb-2">{(PERFORMANCE_KPIS.engagement.total_interactions / 1000).toFixed(1)}K</p>
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-white/70">Engagement Rate</span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded">{PERFORMANCE_KPIS.engagement.engagement_rate}%</span>
          </div>
          <div className="mt-3 pt-3 border-t border-white/20">
            <div className="flex justify-between text-xs">
              <span className="text-white/70">Shares</span>
              <span className="font-bold">{(PERFORMANCE_KPIS.engagement.shares / 1000).toFixed(1)}K</span>
            </div>
          </div>
        </div>

        {/* Budget */}
        <div className="bg-gradient-to-br from-ucsp-blue to-success text-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <Award className="w-8 h-8" />
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-400">
              {PERFORMANCE_KPIS.budget.spent_percentage.toFixed(0)}%
            </span>
          </div>
          <h3 className="text-sm font-medium text-white/80 mb-1">Presupuesto Ejecutado</h3>
          <p className="text-2xl font-bold mb-2">${(PERFORMANCE_KPIS.budget.total_spent / 1000).toFixed(1)}K</p>
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-white/70">de ${(PERFORMANCE_KPIS.budget.total_budget / 1000).toFixed(0)}K total</span>
          </div>
          <div className="mt-3 pt-3 border-t border-white/20">
            <div className="flex justify-between text-xs">
              <span className="text-white/70">CPC</span>
              <span className="font-bold">${PERFORMANCE_KPIS.budget.cost_per_click}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Trends */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-gray-900">Performance Últimos 7 Días</h3>
            <p className="text-sm text-gray-600">Evolución de métricas clave</p>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-ucsp-burgundy"></div>
              <span>Leads</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-ucsp-blue"></div>
              <span>Engagement (K)</span>
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
            <YAxis yAxisId="left" stroke="#6b7280" style={{ fontSize: '12px' }} />
            <YAxis yAxisId="right" orientation="right" stroke="#6b7280" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              labelStyle={{ fontWeight: 'bold', marginBottom: '8px' }}
            />
            <Line yAxisId="left" type="monotone" dataKey="leads" stroke="#6B1B3D" strokeWidth={3} dot={{ r: 5 }} />
            <Line yAxisId="right" type="monotone" dataKey="engagement" stroke="#003B7A" strokeWidth={3} dot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Channel Distribution */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <h3 className="text-base font-bold text-gray-900 mb-8 text-center md:text-left">Distribución de Leads por Canal</h3>

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

          {/* Divider - only visible on desktop */}
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
                  <span className="text-sm font-bold text-gray-900">{channel.leads}</span>
                  <span className="text-sm font-bold text-gray-700 bg-gray-200 px-2.5 py-1 rounded-md min-w-[48px] text-center">
                    {channel.value}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Funnel de Conversión - Horizontal */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-base font-bold text-gray-900 mb-6">Funnel de Conversión</h3>

        {/* Horizontal Flow */}
        <div className="flex items-center justify-between gap-3 overflow-x-auto pb-4">
          {funnelSteps.map((step, idx) => (
            <div key={idx} className="flex items-center gap-3 flex-shrink-0">
              {/* Step Card */}
              <div className={`bg-gradient-to-br ${step.color} rounded-xl p-4 text-white shadow-md min-w-[140px]`}>
                <div className="text-center">
                  <div className="text-3xl mb-2">{step.icon}</div>
                  <p className="text-xs font-medium text-white/80 uppercase tracking-wide mb-1">{step.stage}</p>
                  <p className="text-lg font-bold">{step.value.toLocaleString()}</p>
                </div>
              </div>

              {/* Arrow with conversion rate */}
              {idx < funnelSteps.length - 1 && (
                <div className="flex flex-col items-center justify-center min-w-[60px]">
                  <div className="text-sm font-bold text-gray-900 mb-1">{step.conversionRate}%</div>
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-ucsp-blue/10 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Conversión Global</p>
              <p className="text-xl font-bold text-ucsp-blue">0.027%</p>
              <p className="text-xs text-gray-500">Alcance → Matriculados</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Etapa Crítica</p>
              <p className="text-xl font-bold text-orange-600">22.9%</p>
              <p className="text-xs text-gray-500">Postulaciones → Matrícula</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Tasa Conversión Web</p>
              <p className="text-xl font-bold text-green-600">25.0%</p>
              <p className="text-xs text-gray-500">Landing → Formulario</p>
            </div>
          </div>
        </div>
      </div>

      {/* HubSpot Monitoring */}
      <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell className="w-8 h-8" />
            <div>
              <h3 className="text-lg font-bold">HubSpot - Monitoreo CPL</h3>
              <p className="text-sm text-white/90">Alertas automáticas de costo por lead</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">
            {HUBSPOT_CONFIG.enabled ? 'ACTIVO' : 'MONITOREO'}
          </span>
        </div>

        {/* CPL Thresholds */}
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
              <div className="flex justify-between text-sm">
                <span>Pausar en</span>
                <span className="font-bold text-red-300">${HUBSPOT_CONFIG.cpl_thresholds.pregrado.pause_at}</span>
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
              <div className="flex justify-between text-sm">
                <span>Pausar en</span>
                <span className="font-bold text-red-300">${HUBSPOT_CONFIG.cpl_thresholds.posgrado.pause_at}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alertas Recientes */}
        {HUBSPOT_MOCKUP && HUBSPOT_MOCKUP.alerts && HUBSPOT_MOCKUP.alerts.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-bold text-sm mb-2">Alertas Recientes:</h4>
            {HUBSPOT_MOCKUP.alerts.slice(0, 2).map((alert, idx) => (
              <div key={idx} className={`p-3 rounded-lg ${
                alert.type === 'critical' ? 'bg-red-500/30 border border-red-300' :
                alert.type === 'warning' ? 'bg-yellow-500/30 border border-yellow-300' :
                'bg-blue-500/30 border border-blue-300'
              }`}>
                <p className="text-sm font-medium">{alert.message}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 p-3 bg-white/20 backdrop-blur-sm rounded-lg">
          <p className="text-xs">
            💡 <strong>Nota:</strong> Sistema de monitoreo de HubSpot configurado y listo para activación.
          </p>
        </div>
      </div>

      {/* Alertas Automáticas */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-ucsp-burgundy" />
          <h3 className="text-base font-bold text-gray-900">Alertas Automáticas</h3>
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
        <h3 className="text-base font-bold text-gray-900 mb-4">Análisis de Competencia Universitaria</h3>
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
