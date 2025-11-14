import { Target, Users, MessageSquare, TrendingUp, Lightbulb, Zap, AlertCircle, Car } from 'lucide-react';
import { OPPORTUNITY_SCORE, TARGET_AUDIENCES } from '../data/mockData';
import { LAYER_CONFIG, KEY_MESSAGES } from '../data/config';

export default function DecisionLayer() {
  const recommendations = [
    {
      priority: 'high',
      category: 'Google Search',
      action: 'Aumentar bid para "SUV híbrida precio" +45% de búsquedas en 48h',
      impact: '+50 leads calificados estimados',
      confidence: 94
    },
    {
      priority: 'high',
      category: 'Meta Ads',
      action: 'Redistribuir 15% de budget a Instagram Stories - 3x mejor engagement',
      impact: '+12K interacciones estimadas',
      confidence: 91
    },
    {
      priority: 'medium',
      category: 'Contenido',
      action: 'Escalar mensaje de tecnología híbrida - A/B test mostró +22% CTR',
      impact: '+185 clics/semana proyectados',
      confidence: 89
    },
    {
      priority: 'medium',
      category: 'Audiencias',
      action: 'Expandir "Familias Jóvenes" - engagement 11.8% vs 8.2% promedio',
      impact: '+342 leads adicionales/mes',
      confidence: 86
    },
    {
      priority: 'low',
      category: 'TikTok',
      action: 'Revisar creatividades - 36% por debajo del target mensual',
      impact: 'Ajuste de estrategia necesario',
      confidence: 78
    }
  ];

  const audiences = [
    {
      name: 'Familias Jóvenes 30-45',
      size: '450K',
      engagement: '11.8%',
      status: 'active',
      description: 'Profesionales con hijos, interés en seguridad y espacio familiar',
      message: KEY_MESSAGES.family.message
    },
    {
      name: 'Profesionales Eco-conscious',
      size: '280K',
      engagement: '9.4%',
      status: 'active',
      description: 'Búsquedas de híbridos, sostenibilidad, eficiencia energética',
      message: KEY_MESSAGES.hybrid.message
    },
    {
      name: 'Aventureros Urbanos',
      size: '320K',
      engagement: '8.7%',
      status: 'active',
      description: 'Interés en 4x4, outdoor, viajes de fin de semana',
      message: KEY_MESSAGES.adventure.message
    },
    {
      name: 'Upgrade de Sedán',
      size: '190K',
      engagement: '7.2%',
      status: 'testing',
      description: 'Propietarios de sedanes buscando más espacio y versatilidad',
      message: 'Es hora de crecer - más espacio, misma confiabilidad'
    }
  ];

  // Calcular color del score
  const getScoreColor = (score) => {
    if (score >= 85) return 'from-green-500 to-green-600';
    if (score >= 70) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  const getScoreGrade = (score) => {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'B+';
    if (score >= 70) return 'B';
    return 'C';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              {LAYER_CONFIG.decision.name}
            </h2>
            <p className="text-gray-600">
              {LAYER_CONFIG.decision.subtitle}
            </p>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-honda-blue text-white rounded-full text-sm font-medium">
              IA Activa
            </span>
          </div>
        </div>
      </div>

      {/* Honda Opportunity Score */}
      <div className="bg-gradient-to-br from-honda-red to-honda-darkRed text-white rounded-2xl shadow-honda-lg p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Zap className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Honda Opportunity Score</h3>
              <p className="text-white/90 mt-1 text-sm">Índice de oportunidad para inversión publicitaria</p>
            </div>
          </div>

          <div className="text-center lg:text-right">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">{OPPORTUNITY_SCORE.current_score}</span>
              <span className="text-xl text-white/80">/100</span>
            </div>
            <div className="flex items-center justify-center lg:justify-end gap-3 mt-2">
              <span className={`px-4 py-2 rounded-lg text-base font-bold ${
                OPPORTUNITY_SCORE.current_score >= 85 ? 'bg-green-500' :
                OPPORTUNITY_SCORE.current_score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
              }`}>
                Grado {getScoreGrade(OPPORTUNITY_SCORE.current_score)}
              </span>
              <span className="text-green-300 font-semibold text-sm">
                {OPPORTUNITY_SCORE.trend} vs período anterior
              </span>
            </div>
          </div>
        </div>

        {/* Componentes del Score */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(OPPORTUNITY_SCORE.components).map(([key, component]) => (
            <div key={key} className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm text-white/80">
                  {key === 'trending_topics' ? 'Temas Trending' :
                   key === 'intention_to_buy' ? 'Intención Compra' :
                   key === 'engagement' ? 'Engagement' : 'Alcance'}
                </h4>
                <span className="text-xs bg-white/20 px-2 py-1 rounded">
                  {(component.weight * 100).toFixed(0)}% peso
                </span>
              </div>
              <div className="text-2xl font-bold mb-2">{component.score}</div>
              <div className="text-xs text-white/70">
                Contribución: {component.contribution.toFixed(1)} pts
              </div>
            </div>
          ))}
        </div>

        {/* Recomendación principal */}
        <div className="mt-6 p-5 bg-white/20 backdrop-blur-sm rounded-xl border-2 border-white/30">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-6 h-6 flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold mb-2 text-sm">Recomendación automática:</p>
              <p className="text-base">{OPPORTUNITY_SCORE.recommendation.message}</p>
              <p className="text-sm text-white/80 mt-2">
                Confianza: {OPPORTUNITY_SCORE.recommendation.confidence} |
                Prioridad: {OPPORTUNITY_SCORE.recommendation.priority.toUpperCase()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recomendaciones Estratégicas */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-honda-red to-honda-darkRed rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Recomendaciones Estratégicas</h3>
            <p className="text-sm text-gray-600">Acciones prioritarias basadas en signals de mercado</p>
          </div>
        </div>

        <div className="space-y-4">
          {recommendations.map((rec, idx) => (
            <div key={idx} className={`p-5 rounded-xl border-2 ${
              rec.priority === 'high'
                ? 'bg-red-50 border-red-200'
                : rec.priority === 'medium'
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    rec.priority === 'high'
                      ? 'bg-red-200 text-red-800'
                      : rec.priority === 'medium'
                      ? 'bg-yellow-200 text-yellow-800'
                      : 'bg-blue-200 text-blue-800'
                  }`}>
                    {rec.priority === 'high' ? '🔥 ALTA' :
                     rec.priority === 'medium' ? '⚡ MEDIA' : '📊 BAJA'}
                  </span>
                  <span className="text-xs font-semibold text-gray-600 uppercase">{rec.category}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Confianza</p>
                  <p className="text-base font-bold text-gray-900">{rec.confidence}%</p>
                </div>
              </div>

              <p className="text-gray-900 font-medium mb-2">{rec.action}</p>
              <p className="text-sm text-green-700 font-semibold flex items-center gap-1">
                <Target className="w-4 h-4" />
                {rec.impact}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Audiencias CR-V */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-honda-blue to-success rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Audiencias Objetivo CR-V</h3>
            <p className="text-sm text-gray-600">Segmentación inteligente para lanzamiento</p>
          </div>
        </div>

        <div className="grid gap-4">
          {audiences.map((aud, idx) => (
            <div key={idx} className="p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 hover:border-honda-red transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold text-gray-900 text-base">{aud.name}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      aud.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {aud.status === 'active' ? '✓ ACTIVA' : '🧪 TESTING'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{aud.description}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-6 mt-4 pb-4 border-b border-gray-300">
                <div>
                  <p className="text-xs text-gray-500">Tamaño Potencial</p>
                  <p className="text-xl font-bold text-gray-900">{aud.size}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Engagement Rate</p>
                  <p className="text-xl font-bold text-honda-blue">{aud.engagement}</p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-white rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Mensaje recomendado:</p>
                <p className="text-sm font-semibold text-gray-800">{aud.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pilares de Contenido */}
      <div className="bg-gradient-to-br from-honda-gray to-honda-black text-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="w-8 h-8" />
          <h3 className="text-lg font-bold">Pilares de Contenido Sugeridos</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-honda-blue" />
              <p className="text-white/80 text-sm font-semibold">Pilar 1: Tecnología Híbrida</p>
            </div>
            <p className="text-base font-bold mb-2">"{KEY_MESSAGES.hybrid.message}"</p>
            <p className="text-white/70 text-sm mb-3">{KEY_MESSAGES.hybrid.description}</p>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-white/20 rounded text-xs">Videos explicativos</span>
              <span className="px-2 py-1 bg-white/20 rounded text-xs">Infografías</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-honda-blue" />
              <p className="text-white/80 text-sm font-semibold">Pilar 2: Seguridad Familiar</p>
            </div>
            <p className="text-base font-bold mb-2">"{KEY_MESSAGES.family.message}"</p>
            <p className="text-white/70 text-sm mb-3">{KEY_MESSAGES.family.description}</p>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-white/20 rounded text-xs">Testimoniales</span>
              <span className="px-2 py-1 bg-white/20 rounded text-xs">Video emocional</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Car className="w-5 h-5 text-honda-blue" />
              <p className="text-white/80 text-sm font-semibold">Pilar 3: Aventura 4x4</p>
            </div>
            <p className="text-base font-bold mb-2">"{KEY_MESSAGES.adventure.message}"</p>
            <p className="text-white/70 text-sm mb-3">{KEY_MESSAGES.adventure.description}</p>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-white/20 rounded text-xs">Videos de ruta</span>
              <span className="px-2 py-1 bg-white/20 rounded text-xs">UGC</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-honda-blue" />
              <p className="text-white/80 text-sm font-semibold">Pilar 4: Sostenibilidad</p>
            </div>
            <p className="text-base font-bold mb-2">"{KEY_MESSAGES.sustainability.message}"</p>
            <p className="text-white/70 text-sm mb-3">{KEY_MESSAGES.sustainability.description}</p>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-white/20 rounded text-xs">Data viz</span>
              <span className="px-2 py-1 bg-white/20 rounded text-xs">Educativo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
