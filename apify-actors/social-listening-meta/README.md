# Social Listening Meta - Apify Actor

Actor de Apify para análisis de social listening en Facebook/Meta.

## Funcionalidades

- **Scraping de páginas públicas de Facebook**
- **Análisis por topics configurables** con keywords personalizados
- **Engagement score** calculado (0-10)
- **Análisis de sentimiento** en español (Muy Positivo, Positivo, Neutral, Negativo, Muy Negativo)
- **Cálculo de crecimiento** basado en engagement
- **Extracción de comentarios** opcional
- **100% configurable** para cualquier cliente

## Output Format

El actor genera datos en el formato esperado por el frontend:

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "source": "Meta/Facebook Social Listening",
  "region": "LATAM",
  "category": "Social Listening",
  "client": "UCSP - Universidad Católica San Pablo",
  "aggregatedTopics": [
    {
      "topic": "Admisión 2024",
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

## Cómo subir a Apify

### 1. Instalar Apify CLI

```bash
npm install -g apify-cli
```

### 2. Login a tu cuenta

```bash
apify login
# Ingresa tu API token cuando te lo pida
```

### 3. Subir el actor

Desde la carpeta del actor:

```bash
cd apify-actors/social-listening-meta
apify push
```

Esto creará el actor en tu cuenta de Apify con el nombre `social-listening-meta`.

### 4. Verificar en Apify Console

1. Ve a [console.apify.com](https://console.apify.com)
2. Navega a "Actors" → "My actors"
3. Deberías ver `social-listening-meta`

## Input Schema

| Campo | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| clientName | string | "Cliente" | Nombre corto del cliente |
| clientFullName | string | "Cliente Full Name" | Nombre completo |
| facebookPages | array | [] | URLs de páginas de Facebook a analizar |
| topics | array | [] | Topics con keywords para analizar |
| maxPostsPerPage | integer | 50 | Máximo posts por página |
| includeComments | boolean | true | Extraer comentarios |
| maxCommentsPerPost | integer | 20 | Máximo comentarios por post |
| timeframeDays | integer | 30 | Días hacia atrás |
| language | string | "es" | Idioma para sentimiento |

### Ejemplo de topics

```json
{
  "topics": [
    {
      "name": "Admisión 2024",
      "keywords": ["admisión", "admision", "postular", "examen de admisión", "ingreso"],
      "brands": ["UCSP", "UNSA", "UCSM"]
    },
    {
      "name": "Becas",
      "keywords": ["beca", "becas", "descuento", "apoyo económico"],
      "brands": ["PRONABEC", "Beca 18"]
    }
  ]
}
```

## Uso desde Node.js

```javascript
import { ApifyClient } from 'apify-client';

const client = new ApifyClient({ token: process.env.APIFY_TOKEN });

const input = {
  clientName: "UCSP",
  clientFullName: "Universidad Católica San Pablo",
  facebookPages: [
    "https://www.facebook.com/UCSPoficial"
  ],
  topics: [
    {
      name: "Admisión",
      keywords: ["admisión", "admision", "postular", "examen"],
      brands: ["UCSP", "UNSA"]
    }
  ],
  maxPostsPerPage: 50,
  includeComments: true,
  timeframeDays: 30
};

// Usar tu username de Apify + nombre del actor
const run = await client.actor("TU_USERNAME/social-listening-meta").call(input);
const { items } = await client.dataset(run.defaultDatasetId).listItems();
console.log(items[0]); // Output del actor
```

## Configuración por Cliente

### UCSP (Universidad)

```json
{
  "clientName": "UCSP",
  "clientFullName": "Universidad Católica San Pablo",
  "facebookPages": [
    "https://www.facebook.com/UCSPoficial"
  ],
  "topics": [
    {
      "name": "Admisión 2024",
      "keywords": ["admisión", "postular", "examen de admisión"],
      "brands": ["UCSP", "UNSA", "UCSM"]
    },
    {
      "name": "Becas y Financiamiento",
      "keywords": ["beca", "becas", "descuento", "financiamiento"],
      "brands": ["PRONABEC", "Beca 18"]
    },
    {
      "name": "Carreras",
      "keywords": ["carrera", "ingeniería", "medicina", "derecho"],
      "brands": []
    }
  ]
}
```

### Restaurante

```json
{
  "clientName": "MiRestaurante",
  "clientFullName": "Restaurante Ejemplo SAC",
  "facebookPages": [
    "https://www.facebook.com/mirestaurante"
  ],
  "topics": [
    {
      "name": "Delivery",
      "keywords": ["delivery", "pedido", "envío", "rappi", "pedidosya"],
      "brands": ["Rappi", "PedidosYa", "Uber Eats"]
    },
    {
      "name": "Calidad",
      "keywords": ["delicioso", "rico", "sabor", "fresco", "calidad"],
      "brands": []
    }
  ]
}
```

## Análisis de Sentimiento

El actor usa análisis de sentimiento basado en keywords en español:

**Palabras Positivas:**
- excelente, increíble, genial, fantástico, maravilloso, perfecto
- bueno, mejor, feliz, gracias, recomiendo, éxito, orgullo
- me encanta, lo mejor, amor, hermoso, interesante, útil

**Palabras Negativas:**
- malo, terrible, horrible, pésimo, peor, odio
- decepción, triste, enojado, frustrado, problema, queja
- falla, error, lento, caro, estafa, no recomiendo

**Clasificación:**
- `muy_positivo`: positivas > negativas × 2
- `positivo`: positivas > negativas
- `neutral`: balance entre ambas
- `negativo`: negativas > positivas
- `muy_negativo`: negativas > positivas × 2

## Engagement Score

Calculado como:

```
totalEngagement = reactions + (comments × 2) + (shares × 3)
avgEngagement = totalEngagement / mentions
engagementScore = min(10, round(avgEngagement / 100 × 10))
```

## Limitaciones

- **Solo páginas públicas**: No puede acceder a grupos privados o perfiles personales
- **Rate limiting**: Facebook puede limitar requests agresivos
- **Contenido dinámico**: Algunos posts pueden no cargarse si Facebook cambia su estructura

## Troubleshooting

### "No posts extracted"

1. Verifica que las URLs sean de páginas públicas válidas
2. Aumenta `maxPostsPerPage`
3. Revisa si Facebook está bloqueando el scraping

### "Actor timeout"

1. Reduce `maxPostsPerPage`
2. Reduce número de páginas
3. Desactiva `includeComments`

### "Sentiment always neutral"

1. Verifica que el contenido esté en español
2. Los posts muy cortos pueden no tener suficientes keywords

## Estructura del Proyecto

```
social-listening-meta/
├── .actor/
│   └── actor.json      # Metadata del actor
├── src/
│   └── main.js         # Lógica principal
├── Dockerfile          # Imagen Docker
├── INPUT_SCHEMA.json   # Schema de inputs
├── package.json        # Dependencias
└── README.md           # Esta documentación
```

## Desarrollo Local

```bash
# Instalar dependencias
npm install

# Ejecutar localmente (requiere archivo input.json)
echo '{"facebookPages":["https://www.facebook.com/test"]}' > input.json
npm start
```

## Licencia

MIT - Reset Agency
