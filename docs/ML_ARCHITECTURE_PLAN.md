# Plan de Arquitectura ML - UCSP Algorithm

## Resumen Ejecutivo

Este documento presenta el plan completo de Machine Learning para transformar el UCSP Algorithm de un sistema basado en reglas estáticas a una plataforma de inteligencia predictiva.

---

## 1. ESTADO ACTUAL

### 1.1 Cálculo de Scores Actual (Sin ML)

| Score | Fuente | Fórmula Actual | Problema |
|-------|--------|----------------|----------|
| **Search** | Google Trends | `avg(interest) / 10` | Promedio simple, sin predicción |
| **Trend** | TikTok | `avg(relevance) / 10` | Data vacía para Perú |
| **Social** | Meta | `avg(engagement)` | Data placeholder (todo 5) |
| **Intent** | GA4 | `conversionRate * 150` | Data mock, sin ML |
| **Overall** | Todos | `(S+T+So+I) / 4` | Pesos iguales, no optimizados |

### 1.2 Generación de Insights Actual

```
Insight actual = Reglas IF-THEN estáticas
- IF topKeyword.growth > 20% THEN "keyword está en auge"
- IF engagement_score > 7 THEN "alto engagement"
```

**Problema**: No hay aprendizaje, no hay predicción, no hay personalización.

### 1.3 Gaps Identificados

1. **TikTok**: Perú no tiene hashtags trending (limitación de API)
2. **Meta**: Data es placeholder, no hay social listening real
3. **GA4**: Data mock, pendiente integración API
4. **Scores**: Pesos arbitrarios (25% cada uno)
5. **Insights**: Generados con reglas, no ML

---

## 2. ARQUITECTURA ML PROPUESTA

### 2.1 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           DATA SOURCES                                   │
├─────────────┬─────────────┬─────────────┬─────────────┬────────────────┤
│ Google      │ TikTok      │ Meta/FB     │ GA4         │ HubSpot        │
│ Trends API  │ Trends API  │ Graph API   │ Data API    │ CRM API        │
└──────┬──────┴──────┬──────┴──────┬──────┴──────┬──────┴───────┬────────┘
       │             │             │             │              │
       ▼             ▼             ▼             ▼              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        DATA INGESTION LAYER                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │ Apify       │ │ Apify       │ │ Custom      │ │ GA4 API     │       │
│  │ Scraper     │ │ Scraper     │ │ Actor       │ │ Connector   │       │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘       │
└─────────┼──────────────┼──────────────┼──────────────┼─────────────────┘
          │              │              │              │
          ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         FEATURE STORE                                    │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Raw Features                                                      │   │
│  │ - keyword_interest_daily[]                                        │   │
│  │ - hashtag_views_daily[]                                          │   │
│  │ - topic_mentions_daily[]                                         │   │
│  │ - session_data_daily[]                                           │   │
│  │ - lead_data_daily[]                                              │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Computed Features (ML Pipeline)                                   │   │
│  │ - trend_momentum_7d, trend_momentum_30d                          │   │
│  │ - sentiment_score (NLP model)                                    │   │
│  │ - engagement_velocity                                            │   │
│  │ - conversion_probability                                         │   │
│  │ - lead_quality_score                                             │   │
│  │ - channel_effectiveness_score                                    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          ML MODELS LAYER                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │ TREND PREDICTOR │  │ SENTIMENT       │  │ LEAD QUALITY    │         │
│  │ (Time Series)   │  │ ANALYZER (NLP)  │  │ PREDICTOR       │         │
│  │                 │  │                 │  │                 │         │
│  │ - Prophet/ARIMA │  │ - BERT Spanish  │  │ - XGBoost       │         │
│  │ - 7-day forecast│  │ - 5 categories  │  │ - Random Forest │         │
│  │ - Confidence %  │  │ - Topic extract │  │ - 0-100 score   │         │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘         │
│           │                    │                    │                   │
│  ┌────────▼────────┐  ┌────────▼────────┐  ┌────────▼────────┐         │
│  │ BUDGET          │  │ ATTRIBUTION     │  │ AUDIENCE        │         │
│  │ OPTIMIZER       │  │ MODEL           │  │ PROPENSITY      │         │
│  │                 │  │                 │  │                 │         │
│  │ - Multi-Armed   │  │ - Markov Chain  │  │ - Logistic Reg  │         │
│  │   Bandit        │  │ - Shapley Value │  │ - Segment-level │         │
│  │ - Thompson      │  │ - Last-touch    │  │ - LTV prediction│         │
│  │   Sampling      │  │   fallback      │  │                 │         │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘         │
│           │                    │                    │                   │
└───────────┼────────────────────┼────────────────────┼───────────────────┘
            │                    │                    │
            ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       INTELLIGENCE ENGINE                                │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Score Calculator (ML-Powered)                                     │   │
│  │                                                                   │   │
│  │ search_score = trend_predictor.predict(7d) * weight_search       │   │
│  │ social_score = sentiment_analyzer.score() * weight_social        │   │
│  │ intent_score = lead_quality_predictor.score() * weight_intent    │   │
│  │                                                                   │   │
│  │ overall_score = weighted_ensemble(all_scores, learned_weights)   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Insight Generator (NLG)                                          │   │
│  │                                                                   │   │
│  │ - Template-based with dynamic values                             │   │
│  │ - Priority ranking by impact score                               │   │
│  │ - Actionable recommendations                                     │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Decision Engine                                                   │   │
│  │                                                                   │   │
│  │ - Budget reallocation recommendations                            │   │
│  │ - Audience expansion/contraction                                 │   │
│  │ - Creative optimization signals                                  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                              │
├─────────────┬─────────────┬─────────────┬─────────────────────────────┤
│ DataLayer   │ Decision    │ Execution   │ Optimization                │
│ (Scores +   │ Layer       │ Layer       │ Layer                       │
│  Insights)  │ (Strategy)  │ (Channels)  │ (Performance)               │
└─────────────┴─────────────┴─────────────┴─────────────────────────────┘
```

---

## 3. MODELOS ML ESPECÍFICOS

### 3.1 Trend Predictor (Predicción de Tendencias)

**Objetivo**: Predecir el interés de búsqueda para los próximos 7 días.

**Modelo**: Facebook Prophet + ARIMA ensemble

**Features de entrada**:
```python
features = {
    'keyword_interest_history': [7, 14, 30, 90 days],
    'day_of_week': one_hot_encoded,
    'month': one_hot_encoded,
    'is_campaign_period': boolean,
    'competitor_activity': float,
    'seasonality_index': float
}
```

**Output**:
```json
{
  "keyword": "universidad arequipa",
  "current_interest": 78,
  "predicted_7d": 85,
  "confidence": 0.82,
  "trend_direction": "rising",
  "recommended_action": "increase_bid"
}
```

**Implementación**:
```javascript
// ml/models/trend_predictor.js
class TrendPredictor {
  constructor() {
    this.model = null;
    this.history = [];
  }

  async train(historicalData) {
    // Usar Prophet.js o llamar a Python service
    const prophet = new Prophet();
    prophet.fit(historicalData);
    this.model = prophet;
  }

  predict(keyword, days = 7) {
    const forecast = this.model.predict(days);
    return {
      keyword,
      predictions: forecast.map(f => ({
        date: f.ds,
        predicted: f.yhat,
        lower: f.yhat_lower,
        upper: f.yhat_upper
      })),
      confidence: this.calculateConfidence(forecast)
    };
  }
}
```

---

### 3.2 Sentiment Analyzer (Análisis de Sentimiento)

**Objetivo**: Clasificar el sentimiento de menciones en redes sociales.

**Modelo**: BERT multilingual fine-tuned para español

**Categorías**:
- `muy_positivo` (0.8-1.0)
- `positivo` (0.6-0.8)
- `neutral` (0.4-0.6)
- `negativo` (0.2-0.4)
- `muy_negativo` (0.0-0.2)

**Implementación simplificada (rule-based inicial)**:
```javascript
// ml/models/sentiment_analyzer.js
class SentimentAnalyzer {
  constructor() {
    this.positiveWords = [
      'excelente', 'genial', 'increíble', 'mejor', 'recomiendo',
      'feliz', 'gracias', 'perfecto', 'amor', 'orgullo', 'éxito'
    ];
    this.negativeWords = [
      'malo', 'terrible', 'horrible', 'pésimo', 'odio',
      'decepción', 'problema', 'queja', 'estafa', 'lento'
    ];
  }

  analyze(text) {
    const tokens = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;

    tokens.forEach(token => {
      if (this.positiveWords.some(w => token.includes(w))) positiveCount++;
      if (this.negativeWords.some(w => token.includes(w))) negativeCount++;
    });

    const total = positiveCount + negativeCount || 1;
    const score = (positiveCount - negativeCount + total) / (2 * total);

    return {
      score: Math.max(0, Math.min(1, score)),
      category: this.categorize(score),
      positive_count: positiveCount,
      negative_count: negativeCount
    };
  }

  categorize(score) {
    if (score >= 0.8) return 'muy_positivo';
    if (score >= 0.6) return 'positivo';
    if (score >= 0.4) return 'neutral';
    if (score >= 0.2) return 'negativo';
    return 'muy_negativo';
  }
}
```

---

### 3.3 Lead Quality Predictor

**Objetivo**: Predecir la probabilidad de que un lead se convierta en postulante.

**Modelo**: XGBoost / Random Forest

**Features**:
```python
features = {
    # Demográficos
    'age_group': categorical,  # 17-19, 20-22, 23-25, 25+
    'region': categorical,     # Arequipa, Puno, Cusco, etc.

    # Comportamiento
    'pages_visited': int,
    'time_on_site': float,
    'form_completion_rate': float,
    'previous_visits': int,

    # Fuente
    'acquisition_channel': categorical,
    'campaign_id': categorical,
    'device_type': categorical,

    # Engagement
    'email_opened': boolean,
    'whatsapp_responded': boolean,
    'event_attended': boolean
}
```

**Output**:
```json
{
  "lead_id": "L-12345",
  "quality_score": 78,
  "conversion_probability": 0.32,
  "recommended_priority": "high",
  "next_best_action": "call_within_24h"
}
```

---

### 3.4 Budget Optimizer (Multi-Armed Bandit)

**Objetivo**: Optimizar distribución de presupuesto entre canales en tiempo real.

**Modelo**: Thompson Sampling

**Concepto**:
```
Cada canal es un "brazo" del bandit
- Google Search: reward = conversions / spend
- Meta Ads: reward = conversions / spend
- YouTube: reward = conversions / spend
- Display: reward = conversions / spend

El algoritmo aprende qué canal tiene mejor ROI
y distribuye más presupuesto a los ganadores.
```

**Implementación**:
```javascript
// ml/models/budget_optimizer.js
class BudgetOptimizer {
  constructor(channels) {
    this.channels = channels;
    this.alpha = {};  // Successes (conversions)
    this.beta = {};   // Failures (spend without conversion)

    channels.forEach(ch => {
      this.alpha[ch] = 1;
      this.beta[ch] = 1;
    });
  }

  // Thompson Sampling
  selectChannel() {
    const samples = {};
    this.channels.forEach(ch => {
      // Sample from Beta distribution
      samples[ch] = this.betaSample(this.alpha[ch], this.beta[ch]);
    });

    // Return channel with highest sample
    return Object.entries(samples)
      .sort((a, b) => b[1] - a[1])[0][0];
  }

  updateReward(channel, converted, spend) {
    if (converted) {
      this.alpha[channel] += 1;
    } else {
      this.beta[channel] += spend / 100; // Penalize by spend
    }
  }

  getRecommendedAllocation(totalBudget) {
    const totalAlpha = Object.values(this.alpha).reduce((a, b) => a + b, 0);
    const allocation = {};

    this.channels.forEach(ch => {
      allocation[ch] = {
        percentage: (this.alpha[ch] / totalAlpha * 100).toFixed(1),
        amount: Math.round(totalBudget * this.alpha[ch] / totalAlpha)
      };
    });

    return allocation;
  }

  betaSample(alpha, beta) {
    // Simplified beta sampling using gamma
    const x = this.gammaSample(alpha);
    const y = this.gammaSample(beta);
    return x / (x + y);
  }

  gammaSample(shape) {
    // Marsaglia and Tsang's method
    if (shape < 1) return this.gammaSample(shape + 1) * Math.pow(Math.random(), 1 / shape);
    const d = shape - 1/3;
    const c = 1 / Math.sqrt(9 * d);
    while (true) {
      let x, v;
      do {
        x = this.normalSample();
        v = 1 + c * x;
      } while (v <= 0);
      v = v * v * v;
      const u = Math.random();
      if (u < 1 - 0.0331 * x * x * x * x) return d * v;
      if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
    }
  }

  normalSample() {
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }
}
```

---

### 3.5 Attribution Model

**Objetivo**: Determinar qué touchpoints contribuyen más a las conversiones.

**Modelo**: Markov Chain Attribution

**Concepto**:
```
User Journey: Google Search → Meta Ad → YouTube → Landing → Conversion

Calcular probabilidad de transición entre estados:
P(Meta | Google) = 0.35
P(YouTube | Meta) = 0.28
P(Conversion | YouTube) = 0.15

Removal Effect: ¿Qué pasa si quitamos Meta?
- Sin Meta: 12% menos conversiones
- Meta attribution: 12% del crédito total
```

---

## 4. PIPELINE DE DATOS

### 4.1 Flujo de Datos

```
┌─────────────────────────────────────────────────────────────────┐
│                    WEEKLY PIPELINE                               │
│  (Ejecutado por GitHub Actions - Lunes 8am Peru)                │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ 1. EXTRACT    │   │ 2. TRANSFORM  │   │ 3. LOAD       │
├───────────────┤   ├───────────────┤   ├───────────────┤
│ Google Trends │   │ Normalize     │   │ public/data/  │
│ TikTok        │   │ Calculate     │   │ trends/       │
│ Meta          │   │ features      │   │ tiktok/       │
│ GA4 (futuro)  │   │ Run ML models │   │ meta/         │
└───────────────┘   └───────────────┘   │ ga4/          │
                                        │ ml/           │
                                        └───────────────┘
```

### 4.2 Estructura de Archivos ML

```
public/data/
├── trends/
│   └── latest.json
├── tiktok/
│   └── latest.json
├── meta/
│   └── latest.json
├── ga4/
│   └── latest.json          # Cuando se integre GA4 API
└── ml/
    ├── predictions.json     # Predicciones de tendencias
    ├── scores.json          # Scores ML-calculados
    ├── insights.json        # Insights generados
    └── recommendations.json # Recomendaciones
```

### 4.3 Schema de ML Output

```json
// public/data/ml/predictions.json
{
  "generated_at": "2026-01-05T08:00:00Z",
  "model_versions": {
    "trend_predictor": "1.0.0",
    "sentiment_analyzer": "1.0.0",
    "lead_quality": "1.0.0"
  },
  "keyword_predictions": [
    {
      "keyword": "universidad arequipa",
      "current": 78,
      "predicted_7d": 85,
      "predicted_30d": 92,
      "confidence": 0.82,
      "trend": "accelerating"
    }
  ],
  "sentiment_analysis": {
    "overall": 0.72,
    "category": "positivo",
    "topics": {
      "admision": { "score": 0.78, "mentions": 45 },
      "becas": { "score": 0.65, "mentions": 32 }
    }
  },
  "budget_recommendation": {
    "google_search": { "current": 35, "recommended": 40 },
    "meta_ads": { "current": 35, "recommended": 32 },
    "youtube": { "current": 20, "recommended": 20 },
    "display": { "current": 10, "recommended": 8 }
  }
}
```

---

## 5. SCORES ML-POWERED

### 5.1 Nueva Fórmula de Scores

```javascript
// Antes (estático):
searchScore = avg(interest) / 10

// Después (ML):
searchScore = (
  current_interest * 0.3 +
  predicted_7d_interest * 0.4 +
  trend_momentum * 0.2 +
  competitive_position * 0.1
) / 10

// Los pesos se aprenden del histórico de conversiones
```

### 5.2 Pesos Aprendidos

En lugar de 25% fijo para cada fuente, los pesos se optimizan:

```javascript
// ml/models/weight_optimizer.js
class WeightOptimizer {
  constructor() {
    // Pesos iniciales (basados en dominio)
    this.weights = {
      search: 0.28,
      trend: 0.15,
      social: 0.22,
      intent: 0.35
    };
  }

  // Gradient descent para optimizar pesos
  // basado en correlación con conversiones reales
  optimize(historicalData) {
    // historicalData = [{scores, actual_conversions}, ...]
    // Minimizar MSE entre predicted y actual
  }

  getOverallScore(scores) {
    return (
      scores.search * this.weights.search +
      scores.trend * this.weights.trend +
      scores.social * this.weights.social +
      scores.intent * this.weights.intent
    );
  }
}
```

---

## 6. GENERACIÓN DE INSIGHTS ML

### 6.1 Template-Based NLG con Priorización

```javascript
// ml/insights/generator.js
class InsightGenerator {
  constructor(predictions, currentData) {
    this.predictions = predictions;
    this.currentData = currentData;
  }

  generate() {
    const insights = [];

    // 1. Trend Acceleration Insight
    const accelerating = this.predictions.keyword_predictions
      .filter(k => k.predicted_7d > k.current * 1.1);

    if (accelerating.length > 0) {
      insights.push({
        type: 'trend_acceleration',
        priority: 'high',
        title: `${accelerating.length} keywords en aceleración`,
        description: `"${accelerating[0].keyword}" aumentará ${
          ((accelerating[0].predicted_7d / accelerating[0].current - 1) * 100).toFixed(0)
        }% en 7 días`,
        action: 'Aumentar bids en estos keywords',
        confidence: accelerating[0].confidence,
        impact_score: 8.5
      });
    }

    // 2. Sentiment Shift Insight
    const sentimentChange = this.detectSentimentShift();
    if (sentimentChange) {
      insights.push(sentimentChange);
    }

    // 3. Budget Reallocation Insight
    const budgetInsight = this.generateBudgetInsight();
    insights.push(budgetInsight);

    // Ordenar por impact_score
    return insights.sort((a, b) => b.impact_score - a.impact_score);
  }

  detectSentimentShift() {
    const current = this.predictions.sentiment_analysis.overall;
    const previous = this.currentData.previous_sentiment || current;
    const change = current - previous;

    if (Math.abs(change) > 0.1) {
      return {
        type: 'sentiment_shift',
        priority: change > 0 ? 'medium' : 'high',
        title: `Sentimiento ${change > 0 ? 'mejorando' : 'deteriorando'}`,
        description: `El sentimiento cambió de ${(previous * 10).toFixed(1)} a ${(current * 10).toFixed(1)}`,
        action: change > 0 ?
          'Capitalizar el momento positivo' :
          'Investigar causa de percepción negativa',
        confidence: 0.75,
        impact_score: change > 0 ? 6 : 9
      };
    }
    return null;
  }

  generateBudgetInsight() {
    const rec = this.predictions.budget_recommendation;
    const biggestChange = Object.entries(rec)
      .map(([ch, v]) => ({ channel: ch, change: v.recommended - v.current }))
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))[0];

    return {
      type: 'budget_optimization',
      priority: Math.abs(biggestChange.change) > 5 ? 'high' : 'medium',
      title: `Optimización de presupuesto detectada`,
      description: `${biggestChange.channel}: ${biggestChange.change > 0 ? '+' : ''}${biggestChange.change}% recomendado`,
      action: `Reasignar ${Math.abs(biggestChange.change)}% ${biggestChange.change > 0 ? 'a' : 'de'} ${biggestChange.channel}`,
      confidence: 0.80,
      impact_score: 7
    };
  }
}
```

---

## 7. ROADMAP DE IMPLEMENTACIÓN

### Fase 1: Foundation (Semanas 1-2)
- [ ] Crear estructura de carpetas `ml/`
- [ ] Implementar Feature Store básico
- [ ] Sentiment Analyzer (rule-based)
- [ ] Actualizar scrapers para guardar histórico

### Fase 2: Core Models (Semanas 3-4)
- [ ] Trend Predictor (Prophet.js o servicio Python)
- [ ] Lead Quality Predictor básico
- [ ] Weight Optimizer inicial
- [ ] Integración con DataLayer.jsx

### Fase 3: Optimization (Semanas 5-6)
- [ ] Budget Optimizer (Multi-Armed Bandit)
- [ ] Attribution Model básico
- [ ] Insight Generator mejorado
- [ ] Dashboard ML metrics

### Fase 4: Advanced (Semanas 7-8)
- [ ] BERT Sentiment (si hay recursos)
- [ ] Audience Propensity Model
- [ ] Real-time predictions
- [ ] A/B Testing framework

### Fase 5: Production (Semana 9+)
- [ ] Monitoring & Logging
- [ ] Model versioning
- [ ] Automated retraining
- [ ] Performance benchmarks

---

## 8. INTEGRACIÓN GA4 API

### 8.1 Configuración Pendiente

```javascript
// scrapers/ga4_apify.js (cuando esté disponible la cuenta)
import { BetaAnalyticsDataClient } from '@google-analytics/data';

const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID;

async function fetchGA4Data() {
  const client = new BetaAnalyticsDataClient();

  // Métricas principales
  const [response] = await client.runReport({
    property: `properties/${GA4_PROPERTY_ID}`,
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    dimensions: [
      { name: 'date' },
      { name: 'sessionDefaultChannelGroup' },
      { name: 'landingPage' }
    ],
    metrics: [
      { name: 'sessions' },
      { name: 'conversions' },
      { name: 'engagementRate' },
      { name: 'averageSessionDuration' }
    ]
  });

  return transformGA4Response(response);
}
```

### 8.2 Datos Requeridos de GA4

| Métrica | Uso en ML |
|---------|-----------|
| `sessions` | Volume signal |
| `conversions` | Target variable |
| `engagementRate` | Quality signal |
| `averageSessionDuration` | Intent signal |
| `bounceRate` | Content quality |
| `landingPage` | Attribution |
| `sessionDefaultChannelGroup` | Channel performance |

---

## 9. MÉTRICAS DE ÉXITO

### 9.1 KPIs del Sistema ML

| Métrica | Baseline | Target | Medición |
|---------|----------|--------|----------|
| Prediction Accuracy | N/A | >80% | MAPE trends |
| Sentiment Accuracy | N/A | >75% | F1-score |
| Budget ROI | 100% | +15% | Incrementalidad |
| Lead Quality Lift | 79.6% | 85% | Qualification rate |
| Insight Actionability | N/A | >70% | User surveys |

### 9.2 Monitoreo

```javascript
// ml/monitoring/metrics.js
const METRICS = {
  // Accuracy metrics
  trend_prediction_mape: [],
  sentiment_f1_score: [],
  lead_quality_auc: [],

  // Business metrics
  conversion_lift: [],
  cpl_reduction: [],

  // System metrics
  model_latency_ms: [],
  prediction_freshness_hours: []
};
```

---

## 10. CONSIDERACIONES TÉCNICAS

### 10.1 Stack Tecnológico

| Componente | Opción 1 (Simple) | Opción 2 (Avanzado) |
|------------|-------------------|---------------------|
| Time Series | Prophet.js | Python Prophet API |
| NLP Sentiment | Rule-based | HuggingFace BERT |
| Classification | ml.js | TensorFlow.js |
| Feature Store | JSON files | Redis/PostgreSQL |
| Pipeline | GitHub Actions | Airflow |

### 10.2 Costos Estimados

| Servicio | Costo Mensual |
|----------|---------------|
| Apify (scrapers) | $50-100 |
| GA4 API | $0 (incluido) |
| ML Hosting (si Python) | $20-50 |
| Feature Store (Redis) | $15-30 |
| **Total** | **$85-180/mes** |

---

## 11. PRÓXIMOS PASOS INMEDIATOS

1. **Crear carpeta `ml/`** con estructura base
2. **Implementar SentimentAnalyzer** (rule-based)
3. **Actualizar scrapers** para guardar histórico
4. **Modificar DataLayer.jsx** para leer ML predictions
5. **Documentar API de integración**

---

## Apéndice A: Estructura de Carpetas Propuesta

```
ml/
├── models/
│   ├── trend_predictor.js
│   ├── sentiment_analyzer.js
│   ├── lead_quality.js
│   ├── budget_optimizer.js
│   └── attribution.js
├── features/
│   ├── feature_store.js
│   └── feature_engineering.js
├── insights/
│   └── generator.js
├── utils/
│   ├── statistics.js
│   └── validation.js
├── pipeline/
│   └── weekly_pipeline.js
└── config/
    └── model_config.json
```

---

*Documento preparado para UCSP Algorithm MVP*
*Versión 1.0 - Enero 2026*
