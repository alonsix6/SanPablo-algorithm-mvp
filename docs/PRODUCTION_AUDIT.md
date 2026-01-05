# UCSP Algorithm - Auditoría para Producción

**Fecha:** 2026-01-05
**Versión analizada:** 1.0.0
**Objetivo:** Preparar el sistema para producción con datos reales de Apify

---

## RESUMEN EJECUTIVO

### Estado Actual: MVP con Datos Simulados

El sistema UCSP Algorithm es un **dashboard de Social Intelligence** bien estructurado pero que actualmente funciona con **datos hardcodeados/curados**. Para producción con datos reales de Apify, se requieren cambios significativos en la capa de scraping.

### Hallazgos Críticos

| Componente | Estado | Prioridad |
|------------|--------|-----------|
| Frontend React | Listo para producción | Bajo |
| Scrapers de datos | **REQUIERE REESCRITURA** | Crítico |
| Integración Apify | **NO IMPLEMENTADA** | Crítico |
| Variables de entorno | Parcialmente configuradas | Alto |
| Manejo de errores | Básico | Alto |
| Logging | Mínimo (console.log) | Medio |
| CI/CD | Configurado pero incompleto | Medio |

---

## 1. ARQUITECTURA ACTUAL

### 1.1 Estructura de 4 Capas (Funcional)

```
┌─────────────────────────────────────────────────────────────┐
│  CAPA 1: Captura de Señales (DataLayer.jsx - 740 líneas)    │
│  - Carga datos de archivos JSON estáticos                    │
│  - Calcula scores de búsqueda, tendencia, social, intención │
│  - Genera insights automáticos                               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  CAPA 2: Inteligencia de Mercado (DecisionLayer.jsx)        │
│  - Análisis de audiencias (Pregrado/Posgrado)               │
│  - Recomendaciones automáticas                               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  CAPA 3: Activación Estratégica (ExecutionLayer.jsx)        │
│  - Distribución de presupuesto ($23,000 USD/mes)            │
│  - Configuración de canales de pauta                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  CAPA 4: Performance & Optimización (OptimizationLayer.jsx) │
│  - KPIs y funnels de conversión                              │
│  - Alertas de CPL (preparado para HubSpot)                   │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Flujo de Datos Actual (PROBLEMA)

```
Scrapers (datos hardcodeados) → JSON files → Frontend React
```

**El problema:** Los scrapers NO extraen datos reales:
- `tiktok_scraper.js`: Retorna datos hardcodeados (líneas 46-155)
- `meta_scraper.js`: Retorna datos hardcodeados (líneas 78-198)
- `google_trends.py`: Intenta pytrends pero fallback a datos curados (líneas 34-109)

---

## 2. ANÁLISIS DE SCRAPERS ACTUALES

### 2.1 TikTok Scraper (`scrapers/tiktok_scraper.js`)

**Estado:** Solo datos hardcodeados

```javascript
// Líneas 46-155: Datos completamente estáticos
results.trends.hashtags = [
  {
    hashtag: '#universidad',
    views: '15.2B',        // ← Valor fijo, no real
    posts: '2.8M',
    growth: '+45%',
    relevanceScore: 92,
    // ...
  }
];
```

**Para producción:** Necesita integración con Apify TikTok Scraper

### 2.2 Meta Scraper (`scrapers/meta_scraper.js`)

**Estado:** Solo datos hardcodeados

```javascript
// Líneas 78-198: Función generatePublicTrendsData() retorna datos fijos
return [
  {
    name: 'UCSP Official Pages - Public',
    topics: [
      { topic: 'Admisión UCSP 2026', mentions: 2850, ... }  // ← Valor fijo
    ]
  }
];
```

**Para producción:** Necesita Meta Graph API o Apify Facebook Scraper

### 2.3 Google Trends Scraper (`scrapers/google_trends.py`)

**Estado:** Intenta pytrends pero tiene fallback extensivo

```python
# Línea 133-134: Fallback cuando pytrends falla
if not PYTRENDS_AVAILABLE:
    raise ImportError("pytrends not installed")

# Líneas 226-228: Usa datos curados si falla
if len(results['keywords']) == 0:
    results['keywords'] = generate_curated_trends_data()
```

**Para producción:** pytrends funciona pero es inestable (rate limits de Google)

---

## 3. CAMBIOS REQUERIDOS PARA PRODUCCIÓN

### 3.1 CRÍTICO: Implementar Integración Real con Apify

#### Opción A: Usar Apify Actors (Recomendado)

**Actors de Apify recomendados:**

| Fuente | Actor de Apify | Costo aproximado |
|--------|----------------|------------------|
| TikTok | `clockworks/tiktok-scraper` | $0.50/1000 resultados |
| Facebook | `apify/facebook-pages-scraper` | $0.25/1000 resultados |
| Instagram | `apify/instagram-scraper` | $0.35/1000 resultados |
| Google Trends | `emastra/google-trends-scraper` | $0.10/1000 resultados |

**Nuevo archivo requerido:** `scrapers/apify_client.js`

```javascript
// Ejemplo de estructura necesaria
import { ApifyClient } from 'apify-client';

const client = new ApifyClient({
  token: process.env.APIFY_TOKEN,
});

export async function runTikTokScraper(hashtags) {
  const run = await client.actor('clockworks/tiktok-scraper').call({
    hashtags,
    resultsPerPage: 100,
    maxRequestsPerCrawl: 50,
  });

  return await client.dataset(run.defaultDatasetId).listItems();
}
```

#### Dependencias a agregar (`scrapers/package.json`):

```json
{
  "dependencies": {
    "apify-client": "^2.9.0",
    "axios": "^1.6.2",
    "cheerio": "^1.0.0-rc.12",
    "dotenv": "^17.2.3",
    "winston": "^3.11.0",
    "p-retry": "^6.2.0"
  }
}
```

### 3.2 ALTO: Variables de Entorno para Producción

**Archivo `.env` requerido (crear desde `.env.example`):**

```env
# === APIFY (REQUERIDO para producción) ===
APIFY_TOKEN=apify_api_xxxxxxxxxxxxx

# === META GRAPH API (Opcional pero recomendado) ===
META_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxx
META_PAGE_ID=123456789

# === GOOGLE (Opcional) ===
GOOGLE_TRENDS_PROXY=http://proxy:port

# === CONFIGURACIÓN REGIONAL ===
REGION=PE
TIMEZONE=America/Lima

# === HUBSPOT (Fase 2) ===
HUBSPOT_API_KEY=
HUBSPOT_PORTAL_ID=

# === KEYWORDS UCSP ===
UCSP_KEYWORDS=UCSP,admisión UCSP 2026,universidad arequipa,becas UCSP

# === LOGGING ===
LOG_LEVEL=info
```

### 3.3 ALTO: Mejorar Manejo de Errores

**Problema actual:** Solo `console.log` y `console.error`

**Solución:** Implementar logging estructurado con Winston

```javascript
// scrapers/utils/logger.js (nuevo archivo)
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

export default logger;
```

### 3.4 MEDIO: Implementar Retry Logic

```javascript
// scrapers/utils/retry.js (nuevo archivo)
import pRetry from 'p-retry';

export async function withRetry(fn, options = {}) {
  return pRetry(fn, {
    retries: options.retries || 3,
    minTimeout: options.minTimeout || 2000,
    maxTimeout: options.maxTimeout || 10000,
    onFailedAttempt: (error) => {
      console.log(`Intento ${error.attemptNumber} falló. Quedan ${error.retriesLeft} reintentos.`);
    }
  });
}
```

### 3.5 MEDIO: Actualizar GitHub Actions

**Archivo:** `.github/workflows/scrape-data.yml`

Cambios necesarios:

```yaml
# Agregar secretos de GitHub
env:
  APIFY_TOKEN: ${{ secrets.APIFY_TOKEN }}
  META_ACCESS_TOKEN: ${{ secrets.META_ACCESS_TOKEN }}
  LOG_LEVEL: info

# Agregar step de validación de datos
- name: Validate scraped data
  run: |
    node scrapers/validate_data.js
```

---

## 4. NUEVA ESTRUCTURA DE SCRAPERS PROPUESTA

```
scrapers/
├── index.js                    # Orquestador principal
├── apify_client.js             # Cliente de Apify (NUEVO)
├── tiktok_scraper.js           # Refactorizado con Apify
├── meta_scraper.js             # Refactorizado con Apify/Graph API
├── google_trends.py            # Mejorado con proxy/retry
├── utils/
│   ├── logger.js               # Winston logger (NUEVO)
│   ├── retry.js                # Retry logic (NUEVO)
│   ├── validator.js            # Validación de datos (NUEVO)
│   └── transformer.js          # Transformar datos a formato esperado (NUEVO)
├── package.json                # Actualizado con nuevas deps
├── requirements.txt            # Sin cambios
└── .env.example                # Actualizado
```

---

## 5. ESTRUCTURA DE DATOS ESPERADA

### 5.1 Google Trends (`data/trends/latest.json`)

```json
{
  "timestamp": "ISO8601",
  "source": "Google Trends",
  "region": "PE",
  "keywords": [
    {
      "keyword": "string",
      "average_interest": 0-100,
      "trend": "rising|stable|falling",
      "peak_score": 0-100,
      "growth_3m": "+XX%",
      "top_regions": {
        "Arequipa": 100,
        "Puno": 0-100,
        ...
      }
    }
  ],
  "metadata": {
    "method": "apify|pytrends|curated",
    "timeframe": "string"
  }
}
```

### 5.2 TikTok (`data/tiktok/latest.json`)

```json
{
  "timestamp": "ISO8601",
  "source": "TikTok Creative Center",
  "region": "PE",
  "trends": {
    "hashtags": [
      {
        "hashtag": "#string",
        "views": "string (e.g., 15.2B)",
        "posts": "string (e.g., 2.8M)",
        "growth": "+XX%",
        "relevanceScore": 0-100,
        "region": "Peru|LATAM|Global",
        "category": "string"
      }
    ],
    "sounds": [...],
    "creators": [...]
  },
  "metadata": {...}
}
```

### 5.3 Meta (`data/meta/latest.json`)

```json
{
  "timestamp": "ISO8601",
  "source": "Meta/Facebook",
  "pages": [...],
  "aggregatedTopics": [
    {
      "topic": "string",
      "mentions": number,
      "engagement_score": 0-10,
      "growth": "+XX%",
      "sentiment": "very positive|positive|neutral|negative",
      "top_brands": ["string"]
    }
  ],
  "metadata": {...}
}
```

---

## 6. SEGURIDAD

### 6.1 Problemas Identificados

| Problema | Severidad | Ubicación |
|----------|-----------|-----------|
| Token de Meta expuesto en `.env.example` | Alta | `.env.example:3` |
| No hay validación de entrada en scrapers | Media | Todos los scrapers |
| No hay sanitización de datos scrapeados | Media | Todos los scrapers |

### 6.2 Acciones Requeridas

1. **Regenerar token de Meta** (el actual en `.env.example` está expuesto)
2. **Agregar `.env` a `.gitignore`** (verificar que ya esté)
3. **Usar GitHub Secrets** para tokens en CI/CD
4. **Validar y sanitizar** todos los datos entrantes

---

## 7. PLAN DE IMPLEMENTACIÓN

### Fase 1: Scrapers con Apify (Semana 1-2)

1. [ ] Crear cuenta de Apify y obtener token
2. [ ] Instalar `apify-client` y dependencias
3. [ ] Implementar `apify_client.js`
4. [ ] Refactorizar `tiktok_scraper.js` con Apify
5. [ ] Refactorizar `meta_scraper.js` con Apify
6. [ ] Mejorar `google_trends.py` con retry logic
7. [ ] Implementar logging con Winston
8. [ ] Agregar validación de datos

### Fase 2: CI/CD y Monitoreo (Semana 2-3)

1. [ ] Configurar GitHub Secrets
2. [ ] Actualizar workflow de GitHub Actions
3. [ ] Implementar notificaciones de error
4. [ ] Agregar health checks

### Fase 3: HubSpot Integration (Semana 3-4)

1. [ ] Implementar alertas de CPL
2. [ ] Sincronización de leads
3. [ ] Dashboard de alertas

---

## 8. COSTOS ESTIMADOS (Apify)

| Actor | Uso mensual estimado | Costo |
|-------|---------------------|-------|
| TikTok Scraper | 5,000 resultados | $2.50 |
| Facebook Scraper | 3,000 resultados | $0.75 |
| Instagram Scraper | 2,000 resultados | $0.70 |
| Google Trends | 10,000 resultados | $1.00 |
| **TOTAL** | | **~$5/mes** |

**Nota:** Apify tiene plan gratuito con $5 de crédito mensual, suficiente para este uso.

---

## 9. ARCHIVOS A CREAR/MODIFICAR

### Nuevos archivos:

```
scrapers/apify_client.js        # Cliente de Apify
scrapers/utils/logger.js        # Winston logger
scrapers/utils/retry.js         # Retry logic
scrapers/utils/validator.js     # Validación de datos
scrapers/validate_data.js       # Script de validación post-scrape
logs/.gitkeep                   # Directorio de logs
```

### Archivos a modificar:

```
scrapers/tiktok_scraper.js      # Integrar Apify
scrapers/meta_scraper.js        # Integrar Apify/Graph API
scrapers/google_trends.py       # Mejorar retry logic
scrapers/package.json           # Agregar dependencias
.env.example                    # Actualizar variables
.github/workflows/scrape-data.yml  # Agregar secretos
```

---

## 10. CHECKLIST FINAL PARA PRODUCCIÓN

### Pre-lanzamiento

- [ ] Token de Apify configurado y probado
- [ ] Token de Meta regenerado (el actual está comprometido)
- [ ] Variables de entorno en GitHub Secrets
- [ ] Scrapers probados con datos reales
- [ ] Validación de estructura JSON implementada
- [ ] Logging funcionando
- [ ] CI/CD ejecutando correctamente

### Post-lanzamiento

- [ ] Monitoreo de errores activo
- [ ] Alertas de fallo configuradas
- [ ] Backup de datos históricos
- [ ] Documentación actualizada

---

## CONCLUSIÓN

El frontend está **listo para producción**. El trabajo principal está en:

1. **Implementar scrapers reales con Apify** (crítico)
2. **Configurar variables de entorno seguras** (alto)
3. **Agregar logging y manejo de errores robusto** (medio)

Con estos cambios, el sistema podrá consumir datos reales y funcionar en producción.
