# Guía Paso a Paso: Configuración de APIs

Esta guía detalla los pasos exactos para obtener acceso a cada API requerida para el sistema UCSP Algorithm.

---

## 1. Google Analytics 4 (GA4) API

**Tiempo estimado:** 30-60 minutos
**Requisitos:** Acceso admin a GA4 property de UCSP

### Paso 1: Crear Proyecto en Google Cloud

1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Click en el selector de proyectos (arriba a la izquierda)
3. Click **"+ CREATE PROJECT"**
4. Nombre: `ucsp-algorithm-api`
5. Click **"CREATE"**

### Paso 2: Habilitar las APIs Necesarias

1. En el menú lateral, ir a **APIs & Services > Library**
2. Buscar y habilitar:
   - **Google Analytics Data API** (para reportes)
   - **Google Analytics Admin API** (para configuración)
3. Click **"ENABLE"** en cada una

### Paso 3: Crear Service Account

1. Ir a [Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Click **"+ CREATE SERVICE ACCOUNT"**
3. Llenar:
   - **Service account name:** `ucsp-ga4-reader`
   - **Service account ID:** se genera automáticamente
   - **Description:** `Service account para leer datos GA4 de UCSP`
4. Click **"CREATE AND CONTINUE"**
5. En "Grant this service account access to project":
   - Rol: **Viewer** (básico)
6. Click **"DONE"**

### Paso 4: Generar y Descargar Key JSON

1. Click en el email del service account recién creado
2. Ir a pestaña **"KEYS"**
3. Click **"ADD KEY" > "Create new key"**
4. Seleccionar **JSON**
5. Click **"CREATE"**
6. El archivo se descarga automáticamente (guardarlo de forma segura)
7. Renombrar a: `ga4-service-account.json`

### Paso 5: Agregar Service Account a GA4

1. Ir a [Google Analytics](https://analytics.google.com/)
2. Seleccionar la propiedad de UCSP
3. Click **Admin** (engranaje abajo a la izquierda)
4. En la columna "Property", click **"Property Access Management"**
5. Click **"+"** > **"Add users"**
6. Pegar el email del service account (ej: `ucsp-ga4-reader@ucsp-algorithm-api.iam.gserviceaccount.com`)
7. Rol: **Viewer**
8. Click **"Add"**

### Paso 6: Obtener Property ID

1. En GA4 Admin, click **"Property Settings"**
2. El **Property ID** está en la esquina superior derecha (número como `123456789`)
3. Copiarlo

### Paso 7: Configurar en el Proyecto

```bash
# Crear directorio para secrets
mkdir -p secrets

# Mover el archivo JSON descargado
mv ~/Downloads/ucsp-algorithm-api-xxxxx.json secrets/ga4-service-account.json

# Agregar a .env
echo "GA4_PROPERTY_ID=TU_PROPERTY_ID" >> .env
echo "GA4_CREDENTIALS_PATH=./secrets/ga4-service-account.json" >> .env
```

### Verificación

```javascript
// Test rápido con Node.js
const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const client = new BetaAnalyticsDataClient({
  keyFilename: './secrets/ga4-service-account.json'
});

// Si no hay error, la conexión funciona
```

**Fuentes:**
- [Google Analytics API Quickstart](https://developers.google.com/analytics/devguides/config/admin/v1/quickstart)
- [Service Account Setup - Contentful](https://www.contentful.com/help/apps/google-analytics-4/google-analytics-service-account-setup/)

---

## 2. Google Ads API

**Tiempo estimado:** 2-4 semanas (incluye aprobación)
**Requisitos:** Cuenta Manager de Google Ads

### Paso 1: Crear Manager Account (si no existe)

1. Ir a [Google Ads](https://ads.google.com/)
2. Si no tienes Manager Account:
   - Click **"Tools & Settings"** > **"Switch to manager account"**
   - O crear una en [ads.google.com/home/tools/manager-accounts](https://ads.google.com/home/tools/manager-accounts/)

### Paso 2: Solicitar Developer Token

1. Ir a [API Center](https://ads.google.com/aw/apicenter)
2. Iniciar sesión con la Manager Account
3. Completar el formulario:
   - **Company name:** Universidad Católica San Pablo
   - **Company website:** https://ucsp.edu.pe (debe estar activo)
   - **API contact email:** email monitoreado regularmente
   - **Describe your use case:** "Internal marketing analytics dashboard for tracking campaign performance, CPL metrics, and budget optimization for university admissions"
4. Aceptar Terms and Conditions
5. Click **"Submit"**

### Paso 3: Mientras Esperas Aprobación

Recibirás un **Test Account Access** inmediatamente. Úsalo para:
- Probar la integración con cuentas de prueba
- Desarrollar el código de conexión

### Paso 4: Crear OAuth Credentials

1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Usar el mismo proyecto de GA4 o crear uno nuevo
3. Ir a **APIs & Services > Credentials**
4. Click **"+ CREATE CREDENTIALS" > "OAuth client ID"**
5. Tipo: **Web application** o **Desktop app**
6. Nombre: `UCSP Ads API Client`
7. Click **"CREATE"**
8. Descargar el JSON con Client ID y Client Secret

### Paso 5: Generar Refresh Token

```bash
# Instalar google-ads-api o usar OAuth Playground
# https://developers.google.com/oauthplayground/

# 1. Ir a OAuth Playground
# 2. Configurar tu Client ID/Secret (engranaje arriba derecha)
# 3. En Step 1, seleccionar: Google Ads API v17
# 4. Autorizar y obtener refresh_token
```

### Paso 6: Configurar en el Proyecto

```bash
# Agregar a .env
GOOGLE_ADS_DEVELOPER_TOKEN=xxxxx  # Del API Center
GOOGLE_ADS_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_ADS_CLIENT_SECRET=xxxxx
GOOGLE_ADS_REFRESH_TOKEN=xxxxx  # Del OAuth Playground
GOOGLE_ADS_CUSTOMER_ID=123-456-7890  # Tu cuenta de cliente
GOOGLE_ADS_LOGIN_CUSTOMER_ID=123-456-7890  # Manager account
```

### Niveles de Acceso

| Nivel | Cuentas | Operaciones/día | Requisitos |
|-------|---------|-----------------|------------|
| Test Account | Solo test | 15,000 | Automático |
| Basic | Producción + Test | 15,000 | Aprobación |
| Standard | Producción + Test | Ilimitado | Aprobación + RMF |

**Fuentes:**
- [Developer Token - Google Ads API](https://developers.google.com/google-ads/api/docs/api-policy/developer-token)
- [Access Levels](https://developers.google.com/google-ads/api/docs/api-policy/access-levels)
- [Getting Started Guide](https://www.milapchavda.com/google-ads-api/)

---

## 3. Meta Marketing API (Facebook/Instagram Ads)

**Tiempo estimado:** 1-3 días
**Requisitos:** Admin de Business Manager de UCSP

### Paso 1: Crear App en Meta for Developers

1. Ir a [Meta for Developers](https://developers.facebook.com/)
2. Click **"My Apps"** > **"Create App"**
3. Tipo: **Business**
4. Nombre: `UCSP Marketing Analytics`
5. Business Manager: Seleccionar el de UCSP
6. Click **"Create App"**

### Paso 2: Agregar Marketing API

1. En el Dashboard de la app, click **"Add Products"**
2. Buscar **"Marketing API"**
3. Click **"Set Up"**

### Paso 3: Crear System User

1. Ir a [Business Settings](https://business.facebook.com/settings)
2. En el menú izquierdo: **Users > System Users**
3. Click **"Add"**
4. Configurar:
   - **System Username:** `ucsp-api-user`
   - **Role:** Admin
5. Click **"Create System User"**

### Paso 4: Asignar Assets al System User

1. Después de crear, click en el System User
2. Click **"Add Assets"**
3. Seleccionar:
   - **Ad Accounts:** La cuenta de ads de UCSP
   - **Pages:** Páginas de Facebook de UCSP (opcional)
   - **Pixels:** El pixel de UCSP
4. Dar **Full Control** a cada asset
5. Click **"Save Changes"**

### Paso 5: Generar Access Token

1. En el System User, click **"Generate Token"**
2. Seleccionar la App creada
3. Seleccionar permisos:
   - `ads_read` - Leer datos de campañas
   - `ads_management` - Gestionar campañas (opcional)
   - `read_insights` - Métricas de performance
   - `business_management` - Acceso al Business Manager
4. **Token Expiration:** "Never" para producción
5. Click **"Generate Token"**
6. **IMPORTANTE:** Copiar y guardar el token inmediatamente (solo se muestra una vez)

### Paso 6: Obtener Ad Account ID

1. En Business Settings > **Accounts > Ad Accounts**
2. El ID aparece como `act_123456789`
3. Copiar el número sin el prefijo `act_`

### Paso 7: Poner App en Live Mode

1. Volver al Dashboard de la App
2. En el menú izquierdo: **App Settings > Basic**
3. Completar:
   - Privacy Policy URL
   - Terms of Service URL (puede ser de UCSP)
4. Toggle **"App Mode"** de Development a **Live**

### Paso 8: Configurar en el Proyecto

```bash
# Agregar a .env
META_ACCESS_TOKEN=EAAxxxxx...  # Token largo del System User
META_AD_ACCOUNT_ID=123456789  # Sin el prefijo act_
META_BUSINESS_ID=123456789
META_APP_ID=xxxxx
META_APP_SECRET=xxxxx
```

### Verificación

```bash
# Test con curl
curl -G \
  -d "access_token=TU_TOKEN" \
  "https://graph.facebook.com/v18.0/act_TU_AD_ACCOUNT_ID/insights"
```

**Fuentes:**
- [System User Access Token - InfoSum](https://support.infosum.com/hc/en-us/articles/21987155916306-Obtaining-a-System-User-Access-Token-in-Meta)
- [Meta Marketing API Token Guide](https://digital-expanse.com/tutorials/facebook-marketing-api-access-token/)
- [Intelitics Guide](https://intelitics.com/help-center/en/articles/11107797-how-to-generate-a-meta-system-user-access-token)

---

## 4. HubSpot CRM API

**Tiempo estimado:** 30 minutos
**Requisitos:** Super Admin en HubSpot de UCSP

### Importante: API Keys Deprecadas

Las API keys tradicionales de HubSpot fueron deprecadas. Ahora se usan **Private Apps**.

### Paso 1: Acceder a Private Apps

1. Ir a [HubSpot](https://app.hubspot.com/)
2. Click en **Settings** (engranaje)
3. En el menú izquierdo: **Integrations > Private Apps**
   - Si no aparece, buscar en **Development > Legacy apps**

### Paso 2: Crear Private App

1. Click **"Create a private app"**
2. En **Basic Info:**
   - **Name:** `UCSP Algorithm Integration`
   - **Description:** `API access for marketing analytics dashboard`
3. Click **"Next"**

### Paso 3: Configurar Scopes (Permisos)

En la pestaña **Scopes**, habilitar:

**CRM:**
- `crm.objects.contacts.read` - Leer contactos
- `crm.objects.deals.read` - Leer deals/oportunidades
- `crm.lists.read` - Leer listas

**Marketing (opcional):**
- `forms` - Acceso a formularios
- `marketing-email` - Métricas de email

**Analytics:**
- `analytics.read` - Reportes de analytics

### Paso 4: Crear y Obtener Token

1. Click **"Create app"**
2. Revisar el resumen de permisos
3. Click **"Continue creating"**
4. El **Access Token** se muestra una vez
5. Click **"Copy"** y guardar de forma segura

### Paso 5: Configurar en el Proyecto

```bash
# Agregar a .env
HUBSPOT_ACCESS_TOKEN=pat-na1-xxxxx...
HUBSPOT_PORTAL_ID=123456  # Tu portal ID (visible en la URL de HubSpot)
```

### Paso 6: Verificación

```bash
# Test con curl
curl -X GET \
  -H "Authorization: Bearer TU_TOKEN" \
  "https://api.hubapi.com/crm/v3/objects/contacts?limit=1"
```

### Rotación de Token (Seguridad)

HubSpot recomienda rotar tokens cada 6 meses:
1. Ir a la Private App
2. Click **"Rotate token"**
3. Actualizar en `.env` y re-deployar

**Fuentes:**
- [HubSpot Private Apps Documentation](https://developers.hubspot.com/docs/apps/legacy-apps/private-apps/overview)
- [Private Apps Guide - ICX](https://blog.icx.co/en/hubspot/hubspot/step-by-step-guide-how-to-create-and-use-private-apps-in-hubspot)
- [Finding HubSpot API Access](https://mpiresolutions.com/blog/how-to-find-hubspot-api-key/)

---

## Checklist Final

### Archivos a Crear

```
secrets/
├── ga4-service-account.json    # Google Analytics
└── (tokens en .env, no archivos)

.env
├── GA4_PROPERTY_ID=
├── GA4_CREDENTIALS_PATH=
├── GOOGLE_ADS_DEVELOPER_TOKEN=
├── GOOGLE_ADS_CLIENT_ID=
├── GOOGLE_ADS_CLIENT_SECRET=
├── GOOGLE_ADS_REFRESH_TOKEN=
├── GOOGLE_ADS_CUSTOMER_ID=
├── GOOGLE_ADS_LOGIN_CUSTOMER_ID=
├── META_ACCESS_TOKEN=
├── META_AD_ACCOUNT_ID=
├── META_BUSINESS_ID=
├── META_APP_ID=
├── META_APP_SECRET=
├── HUBSPOT_ACCESS_TOKEN=
└── HUBSPOT_PORTAL_ID=
```

### Seguridad

```bash
# Agregar a .gitignore
echo "secrets/" >> .gitignore
echo ".env" >> .gitignore
```

### Orden de Implementación Recomendado

1. **GA4** - Más rápido, sin aprobación
2. **HubSpot** - Rápido, sin aprobación
3. **Meta Ads** - 1-3 días para Business Verification
4. **Google Ads** - 2-4 semanas para aprobación

---

## Información de Contacto Necesaria

Para que yo pueda ayudarte a configurar cada API, necesito:

| API | Información Requerida |
|-----|----------------------|
| GA4 | Acceso como admin a la propiedad GA4 de UCSP |
| Google Ads | Acceso a Manager Account de Google Ads |
| Meta | Acceso como admin a Business Manager de UCSP |
| HubSpot | Acceso como Super Admin al portal HubSpot |

---

*Documento creado: 2026-01-09*
*Versión: 1.0*
