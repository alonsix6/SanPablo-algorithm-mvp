# 🎓 UCSP Algorithm

**Social Intelligence para Universidad Católica San Pablo - Admisiones 2026**

![Version](https://img.shields.io/badge/version-1.0.0-003B7A)
![Status](https://img.shields.io/badge/status-MVP-0056A3)
![License](https://img.shields.io/badge/license-Proprietary-002453)

---

## 📋 Descripción

El **UCSP Algorithm** es una plataforma de Social Intelligence que unifica datos de diversas fuentes digitales para optimizar la estrategia de **admisiones de pregrado y posgrado** de la Universidad Católica San Pablo.

Identifica microcomportamientos, emociones e intenciones de postulación en el ecosistema digital educativo del sur del Perú, optimizando la inversión publicitaria mediante decisiones automatizadas basadas en señales de data en tiempo real.

### 🎯 Propuesta de Valor

- **Cliente**: Universidad Católica San Pablo (UCSP)
- **Mercado**: Sur del Perú (Arequipa, Puno, Cusco, Moquegua, Tacna)
- **Objetivo**: Sistema automatizado de Social Intelligence para optimizar campañas de admisión 2026-I
- **Enfoque**: Postulaciones calificadas, alcance geográfico e interacciones (lead ads, WhatsApp, landing pages)

---

## 🏗️ Las 4 Capas del Algorithm

### 1. **📊 Capa de Datos (Data Layer)**
Monitoreo en tiempo real del ecosistema digital educativo:
- **Google Trends**: Búsquedas de carreras universitarias en zonas objetivo
- **TikTok**: Hashtags y contenido viral educativo
- **Meta Platforms**: Insights de Facebook e Instagram
- **YouTube**: Testimoniales y tours virtuales
- **Portales Educativos**: Ponte en Carrera, Estudia Perú, SUNEDU

**Métricas**: Búsqueda, Tendencia, Intención, Engagement

**Geografías monitoreadas**: Arequipa (70%), Puno (18%), Cusco (10%), Moquegua (1%), Tacna (1%)

### 2. **🎯 Capa de Decisión (Decision Layer)**
Inteligencia de mercado y estrategia automática:
- **UCSP Opportunity Score**: Índice de oportunidad 0-100
- **Audiencias objetivo**:
  - Postulantes Pregrado (17-25 años, ~10,500 personas)
  - Postulantes Posgrado (25-45 años, ~3,000 personas)
- **Mensajes clave**: Primera universidad licenciada del sur, formación integral, acreditación internacional
- **Recomendaciones automáticas** basadas en signals de mercado

**Output**: Qué mensaje activar, en qué momento y en qué plataforma

### 3. **⚡ Capa de Ejecución (Execution Layer)**
Distribución inteligente de presupuesto y contenidos:
- **Budget Allocation Pregrado**: Meta Ads (35%), Google Search (30%), YouTube (20%), Display (15%)
- **Budget Allocation Posgrado**: Google Search (40%), Meta Ads (35%), YouTube (15%), Display (10%)
- **Carreras monitoreadas**: 13 carreras (top 5: Ing. Industrial, Derecho, Medicina, Administración, Arquitectura)
- **Timing Óptimo**: Mañana (7-9 AM), Tarde (18-21 PM)
- **KPIs por canal**: Postulaciones, CPP (Costo por Postulación), Alcance, Engagement

**Canales de conversión**:
- Lead Ads (Meta): Formularios de contacto instantáneos
- Conversaciones WhatsApp: Objetivo de conversación en Meta Ads
- Visitas a Landing Page: Desde Google Ads y Meta Ads

**Output**: Implementación en tiempo real de campañas optimizadas

### 4. **📈 Capa de Optimización (Optimization Layer)**
Performance y ajustes automáticos:
- **KPIs principales**: Postulaciones completadas, Alcance total, Interacciones, Charlas asistidas
- **Funnel de conversión**: Alcance → Visitas Landing → Formularios → Postulaciones → Matriculados
- **Análisis de competencia**: UNSA, UCSM, UNSAAC (Cusco), UTP, UAC (Cusco), ULASALLE
- **Integración HubSpot**: Sistema de alertas automáticas cuando CPL supera límites establecidos
  - Pregrado: Alerta en $10, Pausa en $14 (máximo $12)
  - Posgrado: Alerta en $13, Pausa en $17 (máximo $15)

**Output**: Evaluación continua y redistribución de inversión

---

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** + **Vite**
- **Tailwind CSS** (branding UCSP: azul #003B7A, burdeos #6B1B3D, dorado #C5A572)
- **Recharts** para visualizaciones de datos
- **Lucide React** para iconografía

### Scrapers & Data
- **Node.js 20** con **Apify Client** para scraping automatizado
- **Google Trends**: Via Apify `apify/google-trends-scraper`
- **TikTok**: Via Apify scrapers
- **Meta/Facebook**: Via Apify scrapers
- **Mock Data GA4** para demostración (pendiente integración API real)

### Machine Learning
- **Budget Optimizer**: Multi-Armed Bandit con Thompson Sampling
- **Sentiment Analyzer**: Análisis de sentimiento en español (rule-based)
- **Insight Generator**: Generación automática de insights priorizados
- **Weekly Pipeline**: Pipeline ML automatizado en GitHub Actions

### Infraestructura
- **GitHub** (repositorio + versionado)
- **GitHub Actions** (CI/CD automático - scrapers + ML pipeline semanales)
- **Netlify** (hosting + deploy continuo)

---

## 📦 Instalación Rápida

### 1. Clonar repositorio

```bash
git clone https://github.com/alonsix6/SanPablo-algorithm-mvp.git
cd SanPablo-algorithm-mvp
```

### 2. Instalar dependencias

```bash
# Frontend
npm install

# Scrapers (opcional)
cd scrapers
npm install
pip install -r requirements.txt
```

### 3. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

### 4. Build para producción

```bash
npm run build
npm run preview
```

---

## 🎨 Paleta de Colores UCSP

La paleta está basada en los colores institucionales del logo (#002453 y #4d102c):

```javascript
ucsp: {
  // Azules (basados en #002453)
  darkBlue: '#002453',     // Azul oscuro del logo
  blue: '#003B7A',         // Azul principal (más claro)
  lightBlue: '#0056A3',    // Azul claro para interacciones
  skyBlue: '#4A90E2',      // Azul cielo para acentos/tech

  // Burgundy/Vino (basados en #4d102c)
  darkBurgundy: '#4d102c', // Burdeos oscuro del logo
  burgundy: '#6B1B3D',     // Burdeos principal
  wine: '#8B2449',         // Vino para acentos

  // Complementarios
  gold: '#C5A572',         // Dorado académico
  gray: '#54565A',         // Gris corporativo
}
```

---

## 📊 Datos y Configuración

### Keywords y Hashtags

Archivo: `src/data/keywords.js`

- **Marca UCSP**: 10 keywords principales
- **Carreras**: 10 keywords de las carreras más demandadas
- **Intención**: 10 keywords de alta conversión
- **Hashtags**: 40+ hashtags categorizados por tema

### Audiencias Objetivo

Archivo: `src/data/config.js`

**2 audiencias principales:**

1. **Pregrado** (17-25 años, ~10,500 personas)
   - Escolares 5to Secundaria (17-18 años)
   - Bachilleres y Trabajadores (19-25 años)

2. **Posgrado** (25-45 años, ~3,000 personas)
   - Profesionales Jóvenes (25-32 años)
   - Profesionales Establecidos (33-45 años)

### Carreras Monitoreadas

13 carreras de pregrado:
1. Ingeniería Industrial ⭐
2. Derecho ⭐
3. Medicina Humana ⭐
4. Administración ⭐
5. Arquitectura y Urbanismo ⭐
6. Psicología
7. Ingeniería Civil
8. Contabilidad
9. Ciencia de la Computación
10. Ciencia de Datos
11. Ingeniería Electrónica y Telecomunicaciones
12. Ingeniería Mecatrónica
13. Ingeniería Ambiental

⭐ = Top 5 con mayor demanda

---

## 🗂️ Arquitectura de Datos - Guía Completa

### ⚠️ IMPORTANTE: Cómo funcionan los datos en este sistema

El sistema usa **2 estrategias diferentes** para cargar datos según el componente:

#### 📂 Estrategia 1: Imports estáticos (Build time)
Componentes que cargan datos desde archivos JavaScript:
- **DecisionLayer** → `src/data/mockData.js` + `src/data/config.js`
- **ExecutionLayer** → `src/data/mockData.js` + `src/data/config.js`
- **OptimizationLayer** → `src/data/mockData.js` + `src/data/config.js`
- **Dashboard** → `src/data/config.js`

#### 📡 Estrategia 2: Fetch dinámico (Runtime)
Componentes que cargan datos desde archivos JSON:
- **DataLayer** → `public/data/*.json` (cargados con fetch al montar)

### 📁 Mapa Completo de Archivos de Datos

```
SanPablo-algorithm-mvp/
├── src/data/                    # Datos importados (build time)
│   ├── config.js               # Configuración global del sistema
│   │   ├── BRAND_CONFIG        # Colores, logo, nombre UCSP
│   │   ├── LAYER_CONFIG        # Nombres y descripciones de capas
│   │   ├── KEY_MESSAGES        # 5 mensajes clave (licenciamiento, formación, etc.)
│   │   ├── TARGET_AUDIENCES    # Pregrado y Posgrado (audiencias + CPL targets)
│   │   ├── CHANNELS_CONFIG     # Google Search, Meta Ads, YouTube, Display
│   │   ├── HUBSPOT_CONFIG      # Thresholds de CPL, API keys
│   │   └── METRIC_CARDS_CONFIG # Cards de KPIs principales
│   │
│   └── mockData.js             # Datos de rendimiento (mockup)
│       ├── OPPORTUNITY_SCORE   # Score 0-100 + componentes + recomendación
│       ├── BUDGET_ALLOCATION   # Presupuesto mensual por canal
│       ├── PERFORMANCE_KPIS    # Leads, conversión, CPL, budget
│       ├── CARRERAS_PERFORMANCE# 13 carreras con CPL/CPP/conversión
│       ├── CONTENT_PILLARS     # Pilares de contenido + rendimiento
│       ├── ALERTS              # Alertas automáticas
│       ├── COMPETITOR_INSIGHTS # UNSA, UCSM, UNSAAC, UTP, UAC, ULASALLE
│       └── HUBSPOT_MOCKUP      # Alertas de HubSpot (mockup)
│
├── public/data/                # Datos JSON dinámicos (runtime)
│   ├── trends/
│   │   └── latest.json         # Google Trends - keywords educativas
│   ├── tiktok/
│   │   └── latest.json         # TikTok - hashtags educativos
│   ├── meta/
│   │   └── latest.json         # Meta - temas con engagement
│   ├── ml/                     # Outputs del ML Pipeline (generado automáticamente)
│   │   ├── predictions.json    # Predicciones de tendencias y sentimiento
│   │   ├── scores.json         # Scores ML-calculados (overall, por fuente)
│   │   ├── insights.json       # Insights generados priorizados
│   │   └── recommendations.json # Recomendaciones de presupuesto
│   └── mock/
│       └── ga4_data.json       # Google Analytics 4 - métricas web
│
├── ml/                         # Machine Learning Models
│   ├── models/
│   │   ├── budget_optimizer.js # Multi-Armed Bandit (Thompson Sampling)
│   │   └── sentiment_analyzer.js # Análisis de sentimiento español
│   ├── insights/
│   │   └── generator.js        # Generador de insights priorizados
│   ├── pipeline/
│   │   └── weekly_pipeline.js  # Pipeline semanal (ejecutado por GitHub Actions)
│   └── config/
│       └── model_config.json   # Configuración de modelos
│
├── scrapers/                   # Scrapers de datos (Apify)
│   ├── google_trends_apify.js  # Google Trends via Apify
│   ├── tiktok_apify.js         # TikTok via Apify
│   ├── meta_apify.js           # Meta/Facebook via Apify
│   ├── validate_data.js        # Validación de datos scrapeados
│   ├── config/
│   │   └── ucsp.json           # Configuración del cliente UCSP
│   └── package.json            # Dependencias de scrapers
│
└── docs/                       # Documentación adicional
    ├── ML_ARCHITECTURE_PLAN.md # Plan completo de ML (850 líneas)
    ├── PRODUCTION_AUDIT.md     # Auditoría para producción
    ├── API_SETUP_GUIDE.md      # Guía paso a paso de APIs
    ├── API_REQUIREMENTS.md     # Requisitos de APIs
    ├── APIFY_SCRAPERS.md       # Documentación de Apify
    └── SCRAPERS_GUIDE.md       # Guía de scrapers
```

### 🔧 Cómo Editar Datos Mockup

#### ¿Qué necesitas cambiar?

| **Quiero cambiar...**                  | **Archivo a editar**            | **Ruta**                        |
|----------------------------------------|---------------------------------|---------------------------------|
| Presupuesto mensual                    | `BUDGET_ALLOCATION`             | `src/data/mockData.js`          |
| CPL/CPP de las 13 carreras             | `CARRERAS_PERFORMANCE`          | `src/data/mockData.js`          |
| Opportunity Score (82/100)             | `OPPORTUNITY_SCORE`             | `src/data/mockData.js`          |
| KPIs principales (leads, alcance, etc.)| `PERFORMANCE_KPIS`              | `src/data/mockData.js`          |
| Thresholds CPL (Pregrado $12, Posgrado $15) | `HUBSPOT_CONFIG.cpl_thresholds` | `src/data/config.js`     |
| CPL target de audiencias               | `TARGET_AUDIENCES[].cpl_target` | `src/data/config.js`            |
| Mensajes clave institucionales         | `KEY_MESSAGES`                  | `src/data/config.js`            |
| Colores del branding                   | `BRAND_CONFIG.colors`           | `src/data/config.js`            |
| Keywords de Google Trends              | `trends/latest.json`            | `public/data/trends/`           |
| Hashtags de TikTok                     | `tiktok/latest.json`            | `public/data/tiktok/`           |
| Temas de Meta (Facebook/Instagram)     | `meta/latest.json`              | `public/data/meta/`             |
| Métricas de Google Analytics           | `ga4_data.json`                 | `public/data/mock/`             |
| Predicciones ML (auto-generado)        | `predictions.json`              | `public/data/ml/`               |
| Scores ML (auto-generado)              | `scores.json`                   | `public/data/ml/`               |
| Insights ML (auto-generado)            | `insights.json`                 | `public/data/ml/`               |
| Configuración de scrapers              | `ucsp.json`                     | `scrapers/config/`              |

### ⚙️ Reglas de Edición (CRÍTICO)

#### 1. **Moneda: TODO en USD ($)**
Todos los valores monetarios deben estar en **dólares estadounidenses**:
- ✅ `cpl: 10.40` = $10.40
- ✅ `total_budget: 23000` = $23,000
- ❌ ~~`cpl: 38.50`~~ = S/38.50 (INCORRECTO)

#### 2. **CPL Targets por audiencia**
- **Pregrado**: `cpl_target: 9.5` ($9.50 USD)
- **Posgrado**: `cpl_target: 17.5` ($17.50 USD)

#### 3. **CPL Thresholds HubSpot**
```javascript
// src/data/config.js - HUBSPOT_CONFIG
pregrado: {
  max_cpl: 12,    // USD máximo
  alert_at: 10,   // Alerta en $10
  pause_at: 14,   // Pausar en $14
},
posgrado: {
  max_cpl: 15,    // USD máximo
  alert_at: 13,   // Alerta en $13
  pause_at: 17,   // Pausar en $17
}
```

#### 4. **Estructura de OPPORTUNITY_SCORE**
⚠️ **IMPORTANTE**: Esta estructura es crítica para DecisionLayer. No alterar:

```javascript
export const OPPORTUNITY_SCORE = {
  current_score: 82,        // ✅ Debe ser "current_score" (no "total")
  trend: '+5.2%',           // ✅ Debe existir
  components: {             // ✅ Debe ser objeto (no array)
    search_interest: {
      score: 85,
      weight: 0.25,         // ✅ Decimal (no porcentaje)
      contribution: 21.25,  // ✅ Debe existir
    },
    // ... otros componentes
  },
  recommendation: {         // ✅ Debe existir
    message: '...',
    confidence: '95%',
    priority: 'high',
  },
};
```

### 🚀 Migración de Mockup a Producción (Paso a Paso)

#### **Fase 1: Activar Scrapers Automáticos (OBLIGATORIO)**

1. **Configurar GitHub Actions** (ya existe en `.github/workflows/`):
   ```yaml
   # .github/workflows/scrapers.yml
   name: Update Social Data
   on:
     schedule:
       - cron: '0 6 * * 1'  # Lunes 6 AM
   jobs:
     scrape:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - run: cd scrapers && npm install && npm run scrape:all
         - run: git add public/data/ && git commit -m "Update data" && git push
   ```

2. **Activar GitHub Actions**:
   - GitHub → Settings → Actions → Allow all actions

3. **Configurar secretos** (si usas APIs pagadas):
   - GitHub → Settings → Secrets → New repository secret
   - Agregar: `APIFY_API_KEY`, `RAPIDAPI_KEY`, etc.

#### **Fase 2: Conectar Google Analytics 4 Real (OPCIONAL)**

> Solo si el cliente tiene GA4 configurado y quiere métricas web reales.

1. **Crear Service Account en Google Cloud**:
   - Google Cloud Console → IAM & Admin → Service Accounts
   - Crear nueva cuenta → Descargar JSON key

2. **Dar acceso a GA4**:
   - Google Analytics → Admin → Property Access Management
   - Agregar email del service account con rol "Viewer"

3. **Crear función serverless**:
   ```javascript
   // netlify/functions/ga4-data.js
   const { BetaAnalyticsDataClient } = require('@google-analytics/data');

   exports.handler = async () => {
     const analyticsDataClient = new BetaAnalyticsDataClient({
       credentials: JSON.parse(process.env.GA4_CREDENTIALS)
     });

     const [response] = await analyticsDataClient.runReport({
       property: `properties/${process.env.GA4_PROPERTY_ID}`,
       dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
       dimensions: [{ name: 'pagePath' }],
       metrics: [{ name: 'screenPageViews' }, { name: 'conversions' }],
     });

     return { statusCode: 200, body: JSON.stringify(response) };
   };
   ```

4. **Reemplazar mockData con datos reales**:
   ```javascript
   // src/components/DataLayer.jsx
   const basePath = HUBSPOT_CONFIG.enabled
     ? '/.netlify/functions'  // API real
     : '/data';               // Mockup
   ```

#### **Fase 3: Integrar Meta Ads API y Google Ads API (OPCIONAL)**

> Solo si el cliente quiere pausado automático de campañas basado en CPL.

1. **Meta Ads API** (pausado automático):
   ```javascript
   // netlify/functions/meta-pause-campaign.js
   const axios = require('axios');

   exports.handler = async (event) => {
     const { campaign_id, cpl } = JSON.parse(event.body);

     if (cpl > 12) {  // CPL Pregrado threshold
       await axios.post(
         `https://graph.facebook.com/v18.0/${campaign_id}`,
         { status: 'PAUSED' },
         { params: { access_token: process.env.META_ACCESS_TOKEN }}
       );
     }

     return { statusCode: 200, body: JSON.stringify({ paused: true }) };
   };
   ```

2. **Google Ads API** (ajuste de bids):
   ```javascript
   // netlify/functions/google-adjust-bids.js
   const { GoogleAdsApi } = require('google-ads-api');

   exports.handler = async (event) => {
     const client = new GoogleAdsApi({
       client_id: process.env.GOOGLE_ADS_CLIENT_ID,
       client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
       developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
     });

     // Ajustar bids según OPPORTUNITY_SCORE
     // ...
   };
   ```

#### **Fase 4: Integración HubSpot (OPCIONAL - Solo UCSP)**

> Esta integración fue solicitada específicamente por UCSP para monitoreo de CPL en tiempo real. Otros clientes pueden no necesitarla.

1. **Obtener credenciales HubSpot**:
   - Ir a HubSpot → Settings → Integrations → API Key
   - Copiar Private App Access Token

2. **Configurar en el sistema**:
   ```javascript
   // src/data/config.js
   export const HUBSPOT_CONFIG = {
     enabled: true,  // Cambiar a true solo si se usa
     api_key: 'pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
   };
   ```

3. **Crear endpoint backend** (Netlify Functions):
   ```javascript
   // netlify/functions/hubspot-cpl.js
   const axios = require('axios');

   exports.handler = async (event) => {
     const response = await axios.get('https://api.hubapi.com/crm/v3/objects/deals', {
       headers: { 'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}` }
     });
     return { statusCode: 200, body: JSON.stringify(response.data) };
   };
   ```

### 🧪 Testing Antes de Producción

```bash
# 1. Test local con datos mockup
npm run dev

# 2. Test build
npm run build
npm run preview

# 3. Test scrapers
cd scrapers
npm run scrape:test

# 4. Verificar estructura de datos
node -e "const data = require('./src/data/mockData.js'); console.log(data.OPPORTUNITY_SCORE)"
```

### 📝 Checklist de Producción

**Obligatorio:**
- [ ] Todos los valores en USD ($)
- [ ] CPL targets actualizados (Pregrado $9.5, Posgrado $17.5)
- [ ] OPPORTUNITY_SCORE con estructura correcta
- [ ] Scrapers testeados localmente
- [ ] GitHub Actions activadas
- [ ] APIFY_TOKEN configurado en GitHub Secrets
- [ ] Build exitoso sin errores

**Opcional (según necesidad del cliente):**
- [ ] GA4 Service Account creada
- [ ] Variables de entorno en Netlify
- [ ] Meta Ads API token válido
- [ ] Google Ads API configurada
- [ ] HubSpot API key configurada *(Solo UCSP)*

---

## 🔄 Integración HubSpot (Opcional - Solo UCSP)

> ⚠️ **Nota**: Esta integración fue solicitada específicamente por UCSP. Otros clientes pueden no necesitarla y pueden ignorar esta sección.

El sistema incluye espacio para integración con HubSpot API:

### Configuración de Alertas CPL

```javascript
cpl_thresholds: {
  pregrado: {
    max_cpl: 12,      // USD máximo por lead pregrado
    alert_at: 10,     // Alerta cuando se acerca al límite
    pause_at: 14,     // Pausar si supera este valor
  },
  posgrado: {
    max_cpl: 15,      // USD máximo por lead posgrado
    alert_at: 13,
    pause_at: 17,
  },
}
```

### Tracking de Conversiones

- ✅ Lead Ads (Meta)
- ✅ Conversaciones WhatsApp (Meta Ads objetivo)
- ✅ Visitas a Landing Page
- ✅ Formularios completados

**Nota**: La integración HubSpot actualmente es mockup. Para activarla, configurar `enabled: true` y agregar API key en `src/data/config.js`.

---

## 📈 UCSP Opportunity Score

Score propietario 0-100 que evalúa 5 componentes:

1. **Interés de Búsqueda** (25%) - Google Trends en zonas objetivo
2. **Engagement Social** (20%) - TikTok + Instagram + Facebook
3. **Intención de Conversión** (30%) - Lead Ads + WhatsApp
4. **Calidad de Leads** (15%) - HubSpot Lead Score
5. **Competitividad** (10%) - Share of Voice vs UNSA/UCSM

**Score actual**: 82/100 (Grado A)

---

## 🤖 Machine Learning Pipeline

El sistema incluye un pipeline ML completo que se ejecuta semanalmente después del scraping de datos.

### Componentes ML

| Modelo | Descripción | Ubicación |
|--------|-------------|-----------|
| **Sentiment Analyzer** | Análisis de sentimiento en español (rule-based) | `ml/models/sentiment_analyzer.js` |
| **Budget Optimizer** | Multi-Armed Bandit con Thompson Sampling | `ml/models/budget_optimizer.js` |
| **Insight Generator** | Generación automática de insights priorizados | `ml/insights/generator.js` |
| **Weekly Pipeline** | Orquestador del pipeline ML | `ml/pipeline/weekly_pipeline.js` |

### Outputs del ML Pipeline

Los resultados se guardan en `public/data/ml/`:

```json
// predictions.json - Scores calculados por ML
{
  "scores": {
    "overall": 7.34,
    "individual": {
      "search": { "base": 7.7, "momentum": 0.67, "final": 8.74 },
      "trend": { "final": 5 },
      "social": { "sentiment": 5, "engagement": 5, "final": 5 },
      "intent": { "conversion_rate": 0.058, "final": 8.7 }
    }
  },
  "budget_optimization": {
    "recommendations": [
      { "channel": "display", "from": 10, "to": 23.9, "change": "+13.9%" }
    ]
  }
}
```

### Ejecución del Pipeline

```bash
# El pipeline se ejecuta automáticamente cada lunes via GitHub Actions
# Para ejecutar manualmente:
node ml/pipeline/weekly_pipeline.js
```

Para más detalles técnicos, consulta `docs/ML_ARCHITECTURE_PLAN.md`.

---

## 🎯 KPIs Principales

### Métricas de Éxito

- **Postulaciones Completadas**: 1,256 (+15.0%)
- **Alcance Total**: 875,000 usuarios únicos (+21.9%)
- **Interacciones**: 142,500 (+8.1%)
- **Costo por Postulación (CPP)**: $10.40 (-7.9%)
- **Charlas Asistidas**: 485 (+17.7%)
- **Conversaciones WhatsApp**: 1,420 (+28.2%)

### Funnel de Conversión

```
Alcance (850,000)
      ↓ 1.4%
Visitas Landing (12,000)
      ↓ 25%
Formularios (3,000)
      ↓ 35%
Postulaciones Válidas (1,050)
      ↓ 23%
Matriculados (240)
```

---

## 🏆 Competencia

Principales universidades competidoras en el sur del Perú (Arequipa y Cusco):

### **Alta Amenaza**
1. **UNSA** - Universidad Nacional de San Agustín (Arequipa)
   - 38% share of voice, 72% sentiment
   - 2da en ranking público nacional Sunedu 2025, posición 14 general
   - Principal universidad pública del sur

2. **UCSM** - Universidad Católica Santa María (Arequipa)
   - 22% share of voice, 68% sentiment
   - Principal competidor privado en Arequipa, fuerte en medicina

3. **UNSAAC** - Universidad Nacional de San Antonio Abad del Cusco (Cusco)
   - 12% share of voice, 70% sentiment
   - 6,000+ postulantes por ciclo, 41 carreras
   - Segunda universidad nacional más grande del sur, posición 9 ranking público Sunedu

### **Amenaza Media**
4. **UTP** - Universidad Tecnológica del Perú (Arequipa)
   - 10% share of voice, 70% sentiment
   - Enfoque en tecnología y empleabilidad

5. **UAC** - Universidad Andina del Cusco (Cusco)
   - 8% share of voice, 66% sentiment
   - 4 campus: Cusco, Sicuani, Quillabamba, Puerto Maldonado
   - Fuerte cobertura regional Cusco

### **Amenaza Baja**
6. **ULASALLE** - Universidad La Salle (Arequipa)
   - 3% share of voice, 74% sentiment
   - Pequeña pero de calidad, enfoque lasallista, licenciada 2018

### **Nuestra Posición**
**UCSP** - Universidad Católica San Pablo (Arequipa)
- 13% share of voice, 78% sentiment
- Primera universidad licenciada del sur del Perú
- Posición 19 en ranking QS 2024

---

## 📝 Notas Importantes

### Estado Actual del Sistema

El sistema cuenta con:

✅ **Scrapers funcionales** (Apify):
- `scrapers/google_trends_apify.js` - Google Trends via Apify
- `scrapers/tiktok_apify.js` - TikTok via Apify
- `scrapers/meta_apify.js` - Meta/Facebook via Apify

✅ **Pipeline ML funcional**:
- Análisis de sentimiento (español)
- Optimización de presupuesto (Multi-Armed Bandit)
- Generación automática de insights
- Ejecutado semanalmente por GitHub Actions

✅ **GitHub Actions configurado**:
- Scraping semanal (Lunes 8 AM Perú)
- ML Pipeline post-scraping
- Commit automático de datos

⚠️ **Pendiente**:
- Integración GA4 API (actualmente usa datos mock)
- Integración HubSpot (opcional)

### Próximos Pasos

Para implementación completa en producción:

1. **Configurar APIFY_TOKEN** en GitHub Secrets
2. **(Opcional)** Conectar con GA4 real si el cliente tiene GA4
3. **(Opcional - Solo UCSP)** Configurar API keys de HubSpot para monitoreo CPL

> **Nota**: HubSpot fue solicitado específicamente por UCSP. Otros clientes pueden no necesitar esta integración.

### Documentación Adicional

Para información más detallada, consulta los documentos en `/docs/`:
- `ML_ARCHITECTURE_PLAN.md` - Plan completo de arquitectura ML
- `PRODUCTION_AUDIT.md` - Auditoría de producción
- `API_SETUP_GUIDE.md` - Guía paso a paso para configurar APIs
- `SCRAPERS_GUIDE.md` - Guía detallada de scrapers

---

## 🚀 GUÍA DE PRODUCCIÓN: Apify + Multi-Cliente

Esta sección documenta cómo llevar el sistema a **producción 100% funcional** con datos reales automatizados usando **Apify**.

### ¿Por qué Apify?

| Problema | Solución con Apify |
|----------|-------------------|
| pytrends falla constantemente | Apify tiene Actors estables para Google Trends |
| TikTok bloquea scrapers | Apify maneja proxies y anti-bot automáticamente |
| Meta API tokens expiran | Apify Actors manejan autenticación |
| Necesitas mantener servidores | Apify es serverless, solo pagas por uso |
| Múltiples clientes | Una cuenta Apify, múltiples configuraciones |

**Costo**: ~$49/mes para múltiples clientes (modelo basado en créditos)

### Arquitectura Actual

```
┌─────────────────────────────────────────────────────────────────┐
│  Tu Repositorio (GitHub)                                        │
│                                                                 │
│  scrapers/config/           scrapers/                           │
│  └── ucsp.json      ───────▶ google_trends_apify.js ───┐        │
│                              tiktok_apify.js     ──────┤        │
│                              meta_apify.js       ──────┘        │
│                                                  │              │
│  .github/workflows/                              │              │
│  └── scrape-data.yml  ◀──────────────────────────┘              │
│       (Lunes 8 AM Perú)                                         │
│                                                                 │
│  ml/pipeline/                                                   │
│  └── weekly_pipeline.js  ◀── Ejecutado post-scraping            │
└──────────────────────────────────────────────────│──────────────┘
                                                   │
                          API call con parámetros  │
                                                   ▼
                      ┌─────────────────────────────────────────┐
                      │  Apify Cloud                            │
                      │  ┌─────────────────────────────────┐    │
                      │  │ Actors (scrapers pre-hechos):   │    │
                      │  │ • apify/google-trends-scraper   │    │
                      │  │ • TikTok scraper                │    │
                      │  │ • Meta/Facebook scraper         │    │
                      │  └─────────────────────────────────┘    │
                      └─────────────────────────────────────────┘
                                                   │
                                Resultados JSON    │
                                                   ▼
                      ┌─────────────────────────────────────────┐
                      │  GitHub Actions:                        │
                      │  1. Recibe datos de Apify               │
                      │  2. Ejecuta ML Pipeline                 │
                      │  3. Guarda en public/data/ + data/      │
                      │  4. Commit + Push automático            │
                      │  5. Netlify detecta cambio → Deploy     │
                      └─────────────────────────────────────────┘
```

### Paso 1: Crear cuenta Apify

1. Ir a [apify.com](https://apify.com) y crear cuenta
2. Ir a **Settings → Integrations → API**
3. Copiar tu **API Token**
4. Guardarlo como secreto en GitHub:
   - GitHub → Settings → Secrets and variables → Actions
   - New repository secret: `APIFY_TOKEN`

### Paso 2: Configuración de cliente

La configuración del cliente está en `scrapers/config/ucsp.json`:

```json
// scrapers/config/ucsp.json
{
  "client": "UCSP",
  "clientFullName": "Universidad Católica San Pablo",
  "region": "PE",
  "geo": "PE",
  "category": "Education",
  "timeRange": "today 1-m",

  "keywords": [
    "universidad arequipa",
    "estudiar en arequipa",
    "carreras universitarias peru",
    "ingenieria industrial peru",
    "medicina peru",
    "derecho peru"
  ],

  "tiktok": {
    "industry": "Education",
    "timeRange": "30",
    "resultsPerPage": 20
  },

  "facebook_pages": [
    "https://www.facebook.com/UCSPoficial"
  ],

  "social_listening_topics": [
    {
      "name": "Admisión 2026",
      "keywords": ["admisión", "postular", "examen de admisión", "vacantes"],
      "brands": ["UCSP", "UNSA", "UCSM", "UTP"]
    }
  ],

  "meta": {
    "maxPostsPerPage": 50,
    "includeComments": true,
    "language": "es"
  },

  "metadata": {
    "market": "Sur del Perú (Arequipa, Puno, Cusco, Moquegua, Tacna)",
    "product": "Pregrado y Posgrado 2026-I"
  }
}
```

### Paso 3: Scrapers implementados

Los scrapers reales están en la carpeta `scrapers/`:

| Archivo | Fuente | Uso |
|---------|--------|-----|
| `google_trends_apify.js` | Google Trends | `node google_trends_apify.js --client=ucsp` |
| `tiktok_apify.js` | TikTok | `node tiktok_apify.js --client=ucsp` |
| `meta_apify.js` | Meta/Facebook | `node meta_apify.js --client=ucsp` |
| `validate_data.js` | Validación | `node validate_data.js` |

Ejemplo de uso del scraper de Google Trends:

```bash
# Ejecutar manualmente
cd scrapers
APIFY_TOKEN=tu_token node google_trends_apify.js --client=ucsp
```

Para más detalles sobre los scrapers, consulta `docs/SCRAPERS_GUIDE.md`.

### Paso 4: GitHub Actions (ya configurado)

El workflow actual (`.github/workflows/scrape-data.yml`) incluye:

1. **Scrapers Apify** - Google Trends, TikTok, Meta
2. **ML Pipeline** - Análisis de sentimiento, optimización, insights
3. **Auto-commit** - Guarda datos y hace deploy automático

```yaml
# Resumen del workflow (ver archivo completo en .github/workflows/)
name: UCSP Algorithm - Weekly Data Scrape

on:
  schedule:
    - cron: '0 13 * * 1'  # Lunes 8 AM Perú
  workflow_dispatch:       # Ejecución manual

jobs:
  scrape-and-commit:
    steps:
      - Checkout repository
      - Setup Node.js 20
      - Install dependencies
      - Run Google Trends Scraper (Apify)
      - Run TikTok Trends Scraper (Apify)
      - Run Meta/Facebook Scraper (Apify)
      - Run ML Pipeline              # ← Ejecuta ml/pipeline/weekly_pipeline.js
      - Commit and push data
```

### Paso 5: Duplicar repo para nuevo cliente

Para crear un nuevo Algorithm para otro cliente:

```bash
# 1. Clonar el repo base
git clone https://github.com/alonsix6/SanPablo-algorithm-mvp.git NuevoCliente-algorithm-mvp
cd NuevoCliente-algorithm-mvp

# 2. Cambiar remote a nuevo repo
git remote set-url origin https://github.com/tu-usuario/NuevoCliente-algorithm-mvp.git

# 3. Crear archivo de configuración del nuevo cliente
cp scrapers/config/ucsp.json scrapers/config/nuevocliente.json

# 4. Editar la configuración
# Cambiar: client, clientFullName, keywords, facebook_pages, etc.

# 5. Actualizar branding
# Editar: src/data/config.js → BRAND_CONFIG

# 6. Limpiar datos del cliente anterior
rm -rf public/data/*/latest.json
rm -rf data/*/

# 7. Configurar secretos en GitHub
# GitHub → Settings → Secrets → APIFY_TOKEN

# 8. Commit inicial
git add .
git commit -m "Configuración inicial para NuevoCliente"
git push -u origin main
```

### Checklist de nuevo cliente

**Obligatorio:**
- [ ] Repo clonado y remote actualizado
- [ ] `scrapers/config/[cliente].json` creado con keywords y páginas
- [ ] `src/data/config.js` actualizado (BRAND_CONFIG)
- [ ] `APIFY_TOKEN` configurado en GitHub Secrets
- [ ] GitHub Actions habilitado
- [ ] Primer scraping manual ejecutado (workflow_dispatch)

**Opcional:**
- [ ] HUBSPOT_CONFIG para monitoreo CPL
- [ ] GA4 API para métricas web reales

### Costos estimados por cliente

| Servicio | Costo mensual | Notas |
|----------|--------------|-------|
| Apify | ~$10-15 | Depende del volumen de scraping |
| GitHub | $0 | Actions gratuito para repos públicos |
| Netlify | $0 | Tier gratuito suficiente |
| **Total** | **~$10-15/cliente** | Con una cuenta Apify de $49 puedes manejar 3-5 clientes |

### Troubleshooting común

**Error: "APIFY_TOKEN not found"**
```bash
# Verificar que el secreto esté configurado
# GitHub → Settings → Secrets → Actions → APIFY_TOKEN
```

**Error: "Actor not found"**
```bash
# Los actors de Apify pueden cambiar de nombre
# Verificar en apify.com/store los nombres actuales
```

**Error: "Rate limit exceeded"**
```bash
# Apify tiene límites por plan
# Reducir maxResults o espaciar ejecuciones
```

**Datos no se actualizan en Netlify**
```bash
# Verificar que el commit se haya hecho
git log -1

# Verificar que Netlify detectó el cambio
# Netlify Dashboard → Deploys
```

---

## 📄 Licencia

Este proyecto es propiedad de Universidad Católica San Pablo. Todos los derechos reservados.

---

## 👥 Contacto

Para consultas sobre el proyecto:
- **Universidad**: Universidad Católica San Pablo
- **Repositorio**: https://github.com/alonsix6/SanPablo-algorithm-mvp

---

**© 2026 UCSP Algorithm - Universidad Católica San Pablo**
