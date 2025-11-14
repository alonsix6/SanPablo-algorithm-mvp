import { TrendingUp, BarChart3, RefreshCw, Award, Target, Users, Heart, Zap, AlertCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { PERFORMANCE_KPIS, ALERTS, AB_TESTS, COMPETITOR_INSIGHTS } from '../data/mockData';
import { LAYER_CONFIG, METRIC_CARDS_CONFIG } from '../data/config';

export default function OptimizationLayer() {
  // Performance últimos 7 días - Honda CR-V
  const performanceData = [
    { date: '28 Oct', leads: 156, reach: 420000, engagement: 11200, spent: 2100 },
    { date: '29 Oct', leads: 168, reach: 435000, engagement: 12500, spent: 2250 },
    { date: '30 Oct', leads: 174, reach: 468000, engagement: 13800, spent: 2180 },
    { date: '31 Oct', leads: 182, reach: 492000, engagement: 14200, spent: 2320 },
    { date: '01 Nov', leads: 195, reach: 515000, engagement: 15100, spent: 2280 },
    { date: '02 Nov', leads: 189, reach: 498000, engagement: 14700, spent: 2350 },
    { date: '03 Nov', leads: 203, reach: 528000, engagement: 16200, spent: 2290 }
  ];

  // Channel performance distribution
  const channelData = [
    { name: 'Google Search', value: 35, leads: 425, color: '#3B82F6' }, // Azul consistente
    { name: 'Meta Ads', value: 30, leads: 364, color: '#1D4ED8' }, // Azul más oscuro para diferenciar
    { name: 'YouTube', value: 20, leads: 242, color: '#EF4444' }, // Rojo
    { name: 'Display', value: 10, leads: 121, color: '#10B981' }, // Verde
    { name: 'TikTok', value: 5, leads: 95, color: '#06B6D4' } // Turquesa TikTok
  ];

  // Funnel de conversión - rediseñado como steps con conversión entre etapas
  const funnelSteps = [
    {
      stage: 'Impresiones',
      value: 3500000,
      conversionRate: 3.0,
      conversionLabel: 'CTR',
      icon: '👁️',
      color: 'from-blue-500 to-blue-600'
    },
    {
      stage: 'Clics',
      value: 105000,
      conversionRate: 85.0,
      conversionLabel: 'a Landing',
      icon: '👆',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      stage: 'Visitas Landing',
      value: 89250,
      conversionRate: 1.4,
      conversionLabel: 'a Formulario',
      icon: '📄',
      color: 'from-green-500 to-green-600'
    },
    {
      stage: 'Formularios',
      value: 1247,
      conversionRate: 27.4,
      conversionLabel: 'a Test Drive',
      icon: '📝',
      color: 'from-amber-500 to-orange-500'
    },
    {
      stage: 'Test Drives',
      value: 342,
      conversionRate: null,
      conversionLabel: null,
      icon: '🚗',
      color: 'from-honda-red to-honda-darkRed'
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
            <span className="px-3 py-1 bg-honda-blue text-white rounded-full text-sm font-medium flex items-center gap-1">
              <RefreshCw className="w-4 h-4" />
              Auto-optimización activa
            </span>
          </div>
        </div>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Leads */}
        <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <Target className="w-8 h-8" />
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              PERFORMANCE_KPIS.leads.trend_value > 0 ? 'bg-green-400' : 'bg-red-400'
            }`}>
              {PERFORMANCE_KPIS.leads.trend}
            </span>
          </div>
          <h3 className="text-sm font-medium text-white/80 mb-1">Leads Calificados</h3>
          <p className="text-2xl font-bold mb-2">{PERFORMANCE_KPIS.leads.qualified.toLocaleString()}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-white/70">de {PERFORMANCE_KPIS.leads.total.toLocaleString()} total</span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded">{PERFORMANCE_KPIS.leads.qualification_rate}%</span>
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
        <div className="bg-gradient-to-br from-honda-blue to-success text-white rounded-2xl p-6 shadow-lg">
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
              <div className="w-3 h-3 rounded-full bg-honda-red"></div>
              <span>Leads</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-honda-blue"></div>
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
            <Line yAxisId="left" type="monotone" dataKey="leads" stroke="#EB0A1E" strokeWidth={3} dot={{ r: 5 }} />
            <Line yAxisId="right" type="monotone" dataKey="engagement" stroke="#00A650" strokeWidth={3} dot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Channel Distribution */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-base font-bold text-gray-900 mb-4">Distribución de Leads por Canal</h3>

        <div className="flex items-center gap-6">
          {/* Pie Chart */}
          <div className="flex-shrink-0">
            <ResponsiveContainer width={220} height={220}>
              <PieChart>
                <Pie
                  data={channelData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={false}
                  outerRadius={90}
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

          {/* Legend - Right side */}
          <div className="flex-1 space-y-2">
            {channelData.map((channel, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: channel.color }}></div>
                  <span className="text-sm font-medium text-gray-700">{channel.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-900">{channel.leads} leads</span>
                  <span className="text-xs font-bold text-gray-600 bg-gray-200 px-2 py-1 rounded">{channel.value}%</span>
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
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Conversión Global</p>
              <p className="text-xl font-bold text-gray-900">0.01%</p>
              <p className="text-xs text-gray-500">Impresiones → Test Drives</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Etapa Crítica</p>
              <p className="text-xl font-bold text-orange-600">1.4%</p>
              <p className="text-xs text-gray-500">Landing → Formulario</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas y A/B Tests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertas Automáticas */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-honda-red" />
            <h3 className="text-base font-bold text-gray-900">Alertas Automáticas</h3>
          </div>
          <div className="space-y-3">
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
                <p className="text-xs font-semibold text-honda-blue">
                  Acción: {alert.action}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* A/B Tests */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-6 h-6 text-honda-blue" />
            <h3 className="text-base font-bold text-gray-900">A/B Tests Activos</h3>
          </div>
          <div className="space-y-4">
            {AB_TESTS.map((test) => (
              <div key={test.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-gray-900 text-sm">{test.name}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    test.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {test.status === 'completed' ? 'COMPLETADO' : 'EN CURSO'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="p-2 bg-white rounded">
                    <p className="text-xs text-gray-500 mb-1">Variante A</p>
                    <p className="text-xs font-semibold">{test.variant_a.name}</p>
                    <p className="text-base font-bold text-gray-900">{test.variant_a.ctr || test.variant_a.view_rate}%</p>
                  </div>
                  <div className="p-2 bg-white rounded">
                    <p className="text-xs text-gray-500 mb-1">Variante B</p>
                    <p className="text-xs font-semibold">{test.variant_b.name}</p>
                    <p className="text-base font-bold text-gray-900">{test.variant_b.ctr || test.variant_b.view_rate}%</p>
                  </div>
                </div>

                {test.recommendation && (
                  <p className="text-xs font-semibold text-honda-blue bg-green-50 p-2 rounded">
                    ✓ {test.recommendation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Competitor Analysis */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-base font-bold text-gray-900 mb-4">Análisis de Competencia</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {COMPETITOR_INSIGHTS.filter(c => c.brand !== 'Honda CR-V').map((comp, idx) => (
            <div key={idx} className="p-4 border-2 border-gray-200 rounded-lg hover:border-honda-red transition-colors">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-gray-900">{comp.brand}</h4>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  comp.threat_level === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {comp.threat_level === 'high' ? 'Alta amenaza' : 'Media amenaza'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-xs text-gray-500">Share of Voice</p>
                  <p className="text-base font-bold text-gray-900">{comp.share_of_voice}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Sentimiento</p>
                  <p className="text-base font-bold text-honda-blue">{comp.sentiment}%</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Temas Trending</p>
                <div className="flex flex-wrap gap-1">
                  {comp.trending_topics.map((topic, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Honda Comparison */}
        <div className="mt-4 p-5 bg-gradient-to-br from-honda-red to-honda-darkRed text-white rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-base mb-1">Honda CR-V</h4>
              <div className="flex gap-6">
                <div>
                  <p className="text-xs text-white/70">Share of Voice</p>
                  <p className="text-xl font-bold">17%</p>
                </div>
                <div>
                  <p className="text-xs text-white/70">Sentimiento</p>
                  <p className="text-xl font-bold">85%</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="px-3 py-2 bg-white/20 rounded-lg text-sm font-bold">
                🏆 Líder en Sentimiento
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
