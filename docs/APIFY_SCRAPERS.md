# Guía de Scrapers Apify - Social Intelligence

Esta guía documenta cómo configurar y modificar los scrapers de Apify para diferentes clientes.

## Índice

1. [Configuración General](#configuración-general)
2. [Google Trends Scraper](#1-google-trends-scraper)
3. [TikTok Trends Scraper](#2-tiktok-trends-scraper)
4. [Facebook/Meta Scraper](#3-facebookmeta-scraper)
5. [Crear Nuevo Cliente](#crear-nuevo-cliente)
6. [Troubleshooting](#troubleshooting)

---

## Configuración General

### Token de Apify

Todos los scrapers usan el mismo token de Apify:

```bash
# En .env local
APIFY_TOKEN=apify_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# En GitHub Secrets
Settings → Secrets → Actions → APIFY_TOKEN
```

### Estructura de Archivos

```
scrapers/
├── google_trends_apify.js   # Scraper de Google Trends
├── tiktok_apify.js          # Scraper de TikTok
├── meta_apify.js            # Scraper de Facebook
└── config/
    ├── ucsp.json            # Config cliente UCSP
    └── [cliente].json       # Config otros clientes
```

### Endpoints API de Apify

```
# Ejecutar actor
POST https://api.apify.com/v2/acts/{actorId}/runs?token={token}

# Ejecutar y esperar resultado
POST https://api.apify.com/v2/acts/{actorId}/run-sync?token={token}

# Ejecutar y obtener dataset directamente
POST https://api.apify.com/v2/acts/{actorId}/run-sync-get-dataset-items?token={token}

# Información del actor
GET https://api.apify.com/v2/acts/{actorId}?token={token}
```

---

## 1. Google Trends Scraper

### Actor
- **ID**: `apify/google-trends-scraper`
- **URL**: https://apify.com/apify/google-trends-scraper

### Archivo
`scrapers/google_trends_apify.js`

### Input del Actor

```json
{
  "searchTerms": ["keyword1", "keyword2"],
  "geo": "PE",
  "timeRange": "today 1-m",
  "maxItems": 100,
  "isPublic": true
}
```

### Parámetros Configurables

| Parámetro | Descripción | Valores | Default |
|-----------|-------------|---------|---------|
| `searchTerms` | Keywords a buscar | Array de strings | Requerido |
| `geo` | Código de país | `PE`, `US`, `MX`, etc. | `PE` |
| `timeRange` | Rango temporal | Ver tabla abajo | `today 1-m` |
| `maxItems` | Máximo de resultados | 1-500 | 100 |

### Valores de timeRange

| Valor | Significado |
|-------|-------------|
| `now 1-H` | Última hora |
| `now 4-H` | Últimas 4 horas |
| `now 1-d` | Último día |
| `now 7-d` | Últimos 7 días |
| `today 1-m` | Último mes |
| `today 3-m` | Últimos 3 meses |
| `today 12-m` | Último año |
| `today 5-y` | Últimos 5 años |

### Configuración en config/[cliente].json

```json
{
  "keywords": [
    "universidad arequipa",
    "carreras universitarias peru"
  ],
  "region": "PE",
  "timeRange": "today 1-m"
}
```

### Output Esperado

```json
{
  "searchTerm": "universidad arequipa",
  "interestOverTime_timelineData": [...],
  "interestBySubregion": [...],
  "relatedTopics_top": [...],
  "relatedTopics_rising": [...],
  "relatedQueries_top": [...],
  "relatedQueries_rising": [...]
}
```

---

## 2. TikTok Trends Scraper

### Actor
- **ID**: `clockworks/tiktok-trends-scraper`
- **URL**: https://apify.com/clockworks/tiktok-trends-scraper

### Archivo
`scrapers/tiktok_apify.js`

### Input del Actor

```json
{
  "adsCountryCode": "PE",
  "adsTimeRange": "30",
  "resultsPerPage": 20,
  "adsScrapeHashtags": true,
  "adsScrapeSounds": true,
  "adsScrapeCreators": false,
  "adsScrapeVideos": false,
  "adsHashtagIndustry": "Education",
  "adsSoundsCountryCode": "PE",
  "adsCreatorsCountryCode": "PE",
  "adsVideosCountryCode": "PE",
  "adsRankType": "popular",
  "adsSortCreatorsBy": "follower",
  "adsSortVideosBy": "vv",
  "adsApprovedForBusinessUse": false,
  "adsNewOnBoard": false
}
```

### Parámetros Principales

| Parámetro | Descripción | Valores |
|-----------|-------------|---------|
| `adsCountryCode` | País para hashtags | Código ISO (PE, US, MX...) |
| `adsTimeRange` | Rango de días | `7`, `30`, `120` |
| `resultsPerPage` | Resultados por página | 10-50 |
| `adsHashtagIndustry` | Filtro de industria | Ver lista completa abajo |
| `adsScrapeHashtags` | Obtener hashtags | true/false |
| `adsScrapeSounds` | Obtener sonidos | true/false |
| `adsScrapeCreators` | Obtener creadores | true/false |
| `adsScrapeVideos` | Obtener videos | true/false |

### Lista Completa de adsHashtagIndustry

| Industria | Para usar en |
|-----------|--------------|
| `Apparel & Accessories` | Moda, ropa, accesorios |
| `Baby, Kids & Maternity` | Productos bebé, niños |
| `Beauty & Personal Care` | Belleza, cuidado personal |
| `Business Services` | Servicios B2B |
| `Education` | **Educación, universidades** |
| `Financial Services` | Finanzas, bancos |
| `Food & Beverage` | Alimentos, bebidas, restaurantes |
| `Games` | Videojuegos, gaming |
| `Household Products` | Productos del hogar |
| `Life Services` | Servicios de vida |
| `News & Entertainment` | Noticias, entretenimiento |
| `Pets` | Mascotas |
| `Sports & Outdoor` | Deportes, outdoor |
| `Tech & Electronics` | Tecnología, electrónica |
| `Travel` | Viajes, turismo |
| `Vehicle & Transportation` | Vehículos, transporte |

### Configuración en config/[cliente].json

```json
{
  "tiktok": {
    "industry": "Education",
    "timeRange": "30",
    "resultsPerPage": 20
  }
}
```

### Para Otros Tipos de Cliente

```json
// Restaurante
{
  "tiktok": {
    "industry": "Food & Beverage",
    "timeRange": "7",
    "resultsPerPage": 30
  }
}

// Tienda de ropa
{
  "tiktok": {
    "industry": "Apparel & Accessories",
    "timeRange": "30",
    "resultsPerPage": 20
  }
}

// Agencia de viajes
{
  "tiktok": {
    "industry": "Travel",
    "timeRange": "30",
    "resultsPerPage": 20
  }
}
```

### Output Esperado

```json
{
  "hashtagName": "universidad",
  "videoViews": 15200000000,
  "publishCnt": 2800000,
  "industry": "Education",
  "rank": 1,
  "isPromoted": false
}
```

---

## 3. Facebook/Meta Social Listening Scraper

### Actor Custom (Recomendado)
- **ID**: `TU_USERNAME/social-listening-meta`
- **Ubicación**: `apify-actors/social-listening-meta/`
- **Funcionalidad**: Social listening completo con topics, sentimiento, engagement

### Actor Genérico (Fallback)
- **ID**: `apify/facebook-posts-scraper`
- **URL**: https://apify.com/apify/facebook-posts-scraper

### Archivo
`scrapers/meta_apify.js`

---

### Opción A: Usar Actor Custom (Social Listening Completo)

El actor custom proporciona análisis avanzado de social listening:
- Análisis por topics configurables
- Engagement score (0-10)
- Análisis de sentimiento en español
- Cálculo de crecimiento
- Top brands por topic

#### Paso 1: Subir el actor a Apify

```bash
# Instalar Apify CLI
npm install -g apify-cli

# Login
apify login

# Subir actor
cd apify-actors/social-listening-meta
apify push
```

#### Paso 2: Configurar variable de entorno

```bash
# En .env
APIFY_ACTOR_META=tu-username/social-listening-meta

# En GitHub Secrets
APIFY_ACTOR_META=tu-username/social-listening-meta
```

#### Input del Actor Custom

```json
{
  "clientName": "UCSP",
  "clientFullName": "Universidad Católica San Pablo",
  "facebookPages": [
    "https://www.facebook.com/UCSPoficial"
  ],
  "topics": [
    {
      "name": "Admisión 2026",
      "keywords": ["admisión", "postular", "examen de admisión"],
      "brands": ["UCSP", "UNSA", "UCSM"]
    },
    {
      "name": "Becas",
      "keywords": ["beca", "becas", "descuento"],
      "brands": ["PRONABEC", "Beca 18"]
    }
  ],
  "maxPostsPerPage": 50,
  "includeComments": true,
  "maxCommentsPerPost": 20,
  "timeframeDays": 30,
  "language": "es"
}
```

#### Configuración en config/[cliente].json

```json
{
  "facebook_pages": [
    "https://www.facebook.com/UCSPoficial"
  ],

  "social_listening_topics": [
    {
      "name": "Admisión 2026",
      "keywords": ["admisión", "admision", "postular", "examen de admisión"],
      "brands": ["UCSP", "UNSA", "UCSM"]
    },
    {
      "name": "Becas y Financiamiento",
      "keywords": ["beca", "becas", "descuento", "financiamiento"],
      "brands": ["PRONABEC", "Beca 18"]
    }
  ],

  "meta": {
    "maxPostsPerPage": 50,
    "includeComments": true,
    "maxCommentsPerPost": 20,
    "timeframeDays": 30,
    "language": "es"
  }
}
```

#### Output del Actor Custom

```json
{
  "timestamp": "2026-01-05T10:00:00.000Z",
  "source": "Meta/Facebook Social Listening",
  "region": "LATAM",
  "category": "Social Listening",
  "client": "UCSP - Universidad Católica San Pablo",
  "aggregatedTopics": [
    {
      "topic": "Admisión 2026",
      "mentions": 45,
      "engagement_score": 8.5,
      "growth": "+25%",
      "sentiment": "muy_positivo",
      "top_brands": ["UCSP", "UNSA"],
      "avg_reactions": 120,
      "avg_comments": 15,
      "avg_shares": 8
    }
  ],
  "metadata": {
    "method": "Apify Social Listening Actor",
    "posts_analyzed": 150,
    "comments_analyzed": 500
  }
}
```

---

### Opción B: Usar Actor Genérico (Facebook Posts)

Si no tienes el actor custom, el scraper usa automáticamente el actor genérico de Apify.

#### Input del Actor Genérico

```json
{
  "startUrls": [
    { "url": "https://www.facebook.com/UCSPoficial" }
  ],
  "maxPosts": 30,
  "maxComments": 10,
  "commentsMode": "RANKED_UNFILTERED"
}
```

#### Parámetros del Actor Genérico

| Parámetro | Descripción | Valores |
|-----------|-------------|---------|
| `startUrls` | URLs de páginas | Array de objetos con URL |
| `maxPosts` | Posts por página | 1-100 |
| `maxComments` | Comentarios por post | 0-50 |
| `commentsMode` | Modo de comentarios | `RANKED_UNFILTERED`, `RANKED_FILTERED` |

#### Output del Actor Genérico

```json
{
  "pageName": "Universidad Católica San Pablo",
  "text": "Contenido del post...",
  "time": "2026-01-05T10:00:00Z",
  "reactions": 150,
  "comments": 25,
  "shares": 10
}
```

---

### Análisis de Sentimiento (Actor Custom)

El actor custom analiza sentimiento en español:

**Muy Positivo**: palabras positivas > palabras negativas × 2
**Positivo**: palabras positivas > palabras negativas
**Neutral**: balance entre ambas
**Negativo**: palabras negativas > palabras positivas
**Muy Negativo**: palabras negativas > palabras positivas × 2

**Palabras Positivas**: excelente, increíble, genial, fantástico, bueno, mejor, feliz, gracias, recomiendo, etc.
**Palabras Negativas**: malo, terrible, horrible, pésimo, odio, decepción, frustrado, problema, queja, estafa, etc.

---

### Engagement Score (Actor Custom)

```
totalEngagement = reactions + (comments × 2) + (shares × 3)
avgEngagement = totalEngagement / mentions
engagementScore = min(10, round(avgEngagement / 100 × 10))
```

---

## Crear Nuevo Cliente

### Paso 1: Crear archivo de configuración

Crea `scrapers/config/[nombre-cliente].json`:

```json
{
  "client": "NOMBRE_CORTO",
  "clientFullName": "Nombre Completo del Cliente",
  "region": "PE",
  "geo": "PE",
  "category": "Industry",
  "timeRange": "today 1-m",
  "outputDir": "nombre-cliente",

  "keywords": [
    "keyword1 relevante",
    "keyword2 relevante",
    "keyword3 relevante"
  ],

  "tiktok": {
    "industry": "Education",
    "timeRange": "30",
    "resultsPerPage": 20
  },

  "facebook_pages": [
    "https://www.facebook.com/pagina-cliente"
  ],

  "metadata": {
    "market": "Descripción del mercado",
    "product": "Producto o servicio principal"
  }
}
```

### Paso 2: Ejecutar scrapers

```bash
cd scrapers

# Todos los scrapers
npm run scrape:all

# O individualmente
node google_trends_apify.js --client=nombre-cliente
node tiktok_apify.js --client=nombre-cliente
node meta_apify.js --client=nombre-cliente
```

### Paso 3: Agregar al workflow (opcional)

Si quieres ejecución automática para el nuevo cliente, duplica los steps en `.github/workflows/scrape-data.yml`.

---

## Códigos de País (ISO 3166-1 alpha-2)

| Código | País |
|--------|------|
| `PE` | Perú |
| `MX` | México |
| `CO` | Colombia |
| `AR` | Argentina |
| `CL` | Chile |
| `EC` | Ecuador |
| `US` | Estados Unidos |
| `ES` | España |
| `BR` | Brasil |

---

## Troubleshooting

### Error: "Actor terminó con estado: RUNNING"

El actor tardó más del timeout configurado. Soluciones:
- Aumentar `waitSecs` en el código
- Reducir `resultsPerPage` o `maxPosts`
- Reducir cantidad de keywords

### Error: "No se obtuvieron resultados"

- Verificar que las URLs de Facebook son válidas y públicas
- Verificar que los keywords tienen volumen de búsqueda
- Probar con keywords más genéricos

### Error: "401 Unauthorized"

- Verificar que `APIFY_TOKEN` está configurado correctamente
- Verificar que el token no ha expirado

### Error: "402 Payment Required"

- Se acabaron los créditos de Apify
- Verificar plan y uso en https://console.apify.com/billing

### Rate Limiting de Google Trends

Google Trends tiene rate limiting agresivo. Soluciones:
- Usar menos keywords (máx 6-8)
- Usar keywords más genéricos
- Ejecutar en horarios de bajo tráfico
- Considerar Apify Pro para mejores proxies

---

## Costos Estimados de Apify

| Actor | Costo aprox. por ejecución |
|-------|---------------------------|
| Google Trends | $0.05 - $0.15 |
| TikTok Trends | $0.02 - $0.05 |
| Facebook Posts | $0.03 - $0.10 |

Con el plan gratuito de Apify ($5/mes en créditos) puedes ejecutar ~50-100 ejecuciones mensuales.

---

## URLs de Referencia

- **Apify Console**: https://console.apify.com
- **Google Trends Actor**: https://apify.com/apify/google-trends-scraper
- **TikTok Trends Actor**: https://apify.com/clockworks/tiktok-trends-scraper
- **Facebook Posts Actor**: https://apify.com/apify/facebook-posts-scraper
- **Documentación API**: https://docs.apify.com/api/v2

---

## Ejemplo Completo: Config para Universidad

```json
{
  "client": "UNIVERSIDAD_X",
  "clientFullName": "Universidad X de Lima",
  "region": "PE",
  "geo": "PE",
  "category": "Education",
  "timeRange": "today 1-m",
  "outputDir": "universidad-x",

  "keywords": [
    "universidad lima",
    "estudiar en lima",
    "carreras universitarias",
    "admision universidad",
    "becas universitarias"
  ],

  "tiktok": {
    "industry": "Education",
    "timeRange": "30",
    "resultsPerPage": 20
  },

  "facebook_pages": [
    "https://www.facebook.com/UniversidadX",
    "https://www.facebook.com/AdmisionUniversidadX"
  ],

  "metadata": {
    "market": "Lima Metropolitana",
    "product": "Pregrado 2026"
  }
}
```

## Ejemplo Completo: Config para Restaurante

```json
{
  "client": "RESTAURANTE_Y",
  "clientFullName": "Restaurante Gourmet Y",
  "region": "PE",
  "geo": "PE",
  "category": "Food & Beverage",
  "timeRange": "today 1-m",
  "outputDir": "restaurante-y",

  "keywords": [
    "restaurantes lima",
    "comida peruana",
    "ceviche lima",
    "donde comer lima"
  ],

  "tiktok": {
    "industry": "Food & Beverage",
    "timeRange": "7",
    "resultsPerPage": 30
  },

  "facebook_pages": [
    "https://www.facebook.com/RestauranteY"
  ],

  "metadata": {
    "market": "Lima - Miraflores",
    "product": "Gastronomía peruana gourmet"
  }
}
```
