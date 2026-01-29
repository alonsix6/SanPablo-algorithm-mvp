import { Target, Users, MessageSquare, TrendingUp, Lightbulb, Zap, AlertCircle, GraduationCap, Flame, BarChart3, CheckCircle, FlaskConical } from 'lucide-react';
import { OPPORTUNITY_SCORE } from '../data/mockData';
import { LAYER_CONFIG, KEY_MESSAGES, TARGET_AUDIENCES } from '../data/config';

export default function DecisionLayer({ dateFilter = 'all' }) {
  const recommendations = [
    {
      priority: 'high',
      category: 'Google Search',
      action: 'Aumentar bid para "ingeniería industrial Arequipa" +52% de búsquedas en 48h',
      impact: '+85 postulaciones calificadas estimadas',
      confidence: 93
    },
    {
      priority: 'high',
      category: 'Meta Ads',
      action: 'Redistribuir 20% de budget a Instagram Stories - engagement 3.5x superior en Pregrado',
      impact: '+18K interacciones estimadas',
      confidence: 91
    },
    {
      priority: 'medium',
      category: 'Contenido',
      action: 'Escalar mensaje de acreditación internacional - A/B test mostró +28% CTR',
      impact: '+240 clics/semana proyectados',
      confidence: 88
    },
    {
      priority: 'medium',
      category: 'Audiencias',
      action: 'Expandir "Escolares 5to Secundaria" - engagement 12.5% vs 8.5% promedio',
      impact: '+420 leads adicionales/mes',
      confidence: 85
    },
    {
      priority: 'low',
      category: 'WhatsApp',
      action: 'Optimizar respuestas automáticas - tasa de conversación actual 54% vs 70% objetivo',
      impact: 'Mejora en cualificación de leads',
      confidence: 76
    }
  ];

  // Usar audiencias de config.js con formato adaptado
  const audiences = TARGET_AUDIENCES.map(aud => ({
    name: aud.name,
    size: aud.size,
    engagement: `${aud.engagement_rate}%`,
    status: 'active',
    description: aud.description + ` - ${aud.interests.slice(0, 3).join(', ')}`,
    message: aud.message,
    age_range: aud.age_range,
    cpl_target: aud.cpl_target
  }));

  // Calcular color del score
  const getScoreColor = (score) => {
    if (score >= 85) return 'from-green-500 to-green-600';
    if (score >= 70) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  const getScoreGrade = (score) => {
    if (score >= 85) return 'A+';
    if (score >= 75) return 'A';
    if (score >= 65) return 'B+';
    if (score >= 55) return 'B';
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
            <span className="px-3 py-1 bg-ucsp-blue text-white rounded-full text-sm font-medium">
              IA Activa
            </span>
          </div>
        </div>
      </div>

      {/* UCSP Opportunity Score */}
      <div className="bg-gradient-to-br from-ucsp-burgundy to-ucsp-darkBurgundy text-white rounded-2xl shadow-ucsp-lg p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Zap className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-bold">UCSP Opportunity Score</h3>
              <p className="text-white/90 mt-1 text-sm">Índice de oportunidad para inversión en admisiones</p>
            </div>
          </div>

          <div className="text-center lg:text-right">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">{OPPORTUNITY_SCORE.current_score}</span>
              <span className="text-xl text-white/80">/100</span>
            </div>
            <div className="flex items-center justify-center lg:justify-end gap-3 mt-2">
              <span className={`px-4 py-2 rounded-lg text-base font-bold ${
                OPPORTUNITY_SCORE.current_score >= 75 ? 'bg-green-500' :
                OPPORTUNITY_SCORE.current_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
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
                   key === 'search_interest' ? 'Interés Búsqueda' :
                   key === 'social_engagement' ? 'Engagement Social' :
                   key === 'conversion_intent' ? 'Intención Conversión' :
                   key === 'lead_quality' ? 'Calidad Leads' :
                   key === 'competitiveness' ? 'Competitividad' : key}
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
          <div className="w-12 h-12 bg-gradient-to-br from-ucsp-burgundy to-ucsp-darkBurgundy rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Recomendaciones Estratégicas</h3>
            <p className="text-sm text-gray-600">Acciones prioritarias basadas en signals de mercado educativo</p>
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
                  <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                    rec.priority === 'high'
                      ? 'bg-red-200 text-red-800'
                      : rec.priority === 'medium'
                      ? 'bg-yellow-200 text-yellow-800'
                      : 'bg-blue-200 text-blue-800'
                  }`}>
                    {rec.priority === 'high' ? <><Flame className="w-3 h-3" /> ALTA</> :
                     rec.priority === 'medium' ? <><Zap className="w-3 h-3" /> MEDIA</> : <><BarChart3 className="w-3 h-3" /> BAJA</>}
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

      {/* Audiencias UCSP */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-ucsp-blue to-ucsp-lightBlue rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Audiencias Objetivo UCSP</h3>
            <p className="text-sm text-gray-600">Segmentación inteligente para Admisiones 2026-I</p>
          </div>
        </div>

        <div className="grid gap-4">
          {audiences.map((aud, idx) => (
            <div key={idx} className="p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 hover:border-ucsp-burgundy transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold text-gray-900 text-base">{aud.name}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                      aud.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {aud.status === 'active' ? <><CheckCircle className="w-3 h-3" /> ACTIVA</> : <><FlaskConical className="w-3 h-3" /> TESTING</>}
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
                  <p className="text-xl font-bold text-ucsp-blue">{aud.engagement}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">CPL Target</p>
                  <p className="text-xl font-bold text-ucsp-burgundy">${aud.cpl_target}</p>
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
      <div className="bg-gradient-to-br from-ucsp-darkBlue to-ucsp-blue text-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="w-8 h-8" />
          <h3 className="text-lg font-bold">Pilares de Contenido Sugeridos</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="w-5 h-5 text-ucsp-gold" />
              <p className="text-white/80 text-sm font-semibold">Pilar 1: {KEY_MESSAGES.licenciamiento.title}</p>
            </div>
            <p className="text-base font-bold mb-2">"{KEY_MESSAGES.licenciamiento.message}"</p>
            <p className="text-white/70 text-sm mb-3">{KEY_MESSAGES.licenciamiento.description}</p>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-white/20 rounded text-xs">Videos institucionales</span>
              <span className="px-2 py-1 bg-white/20 rounded text-xs">Infografías</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-ucsp-gold" />
              <p className="text-white/80 text-sm font-semibold">Pilar 2: {KEY_MESSAGES.formacion.title}</p>
            </div>
            <p className="text-base font-bold mb-2">"{KEY_MESSAGES.formacion.message}"</p>
            <p className="text-white/70 text-sm mb-3">{KEY_MESSAGES.formacion.description}</p>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-white/20 rounded text-xs">Testimoniales</span>
              <span className="px-2 py-1 bg-white/20 rounded text-xs">Video emocional</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-ucsp-gold" />
              <p className="text-white/80 text-sm font-semibold">Pilar 3: {KEY_MESSAGES.acreditacion.title}</p>
            </div>
            <p className="text-base font-bold mb-2">"{KEY_MESSAGES.acreditacion.message}"</p>
            <p className="text-white/70 text-sm mb-3">{KEY_MESSAGES.acreditacion.description}</p>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-white/20 rounded text-xs">Reconocimientos</span>
              <span className="px-2 py-1 bg-white/20 rounded text-xs">Casos de éxito</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-ucsp-gold" />
              <p className="text-white/80 text-sm font-semibold">Pilar 4: {KEY_MESSAGES.tecnologia.title}</p>
            </div>
            <p className="text-base font-bold mb-2">"{KEY_MESSAGES.tecnologia.message}"</p>
            <p className="text-white/70 text-sm mb-3">{KEY_MESSAGES.tecnologia.description}</p>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-white/20 rounded text-xs">Innovación</span>
              <span className="px-2 py-1 bg-white/20 rounded text-xs">Carreras tech</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-ucsp-gold" />
              <p className="text-white/80 text-sm font-semibold">Pilar 5: {KEY_MESSAGES.valores.title}</p>
            </div>
            <p className="text-base font-bold mb-2">"{KEY_MESSAGES.valores.message}"</p>
            <p className="text-white/70 text-sm mb-3">{KEY_MESSAGES.valores.description}</p>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-white/20 rounded text-xs">Valores</span>
              <span className="px-2 py-1 bg-white/20 rounded text-xs">Comunidad</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
