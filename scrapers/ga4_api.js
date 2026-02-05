#!/usr/bin/env node
/**
 * Google Analytics 4 Data Connector
 *
 * Obtiene datos REALES de GA4 via Google Analytics Data API:
 * - Métricas: usuarios, sesiones, nuevos usuarios, conversiones
 * - Tráfico: fuentes, medios, campañas
 * - Contenido: páginas más visitadas, landing pages
 * - Comportamiento: bounce rate, duración de sesión
 * - Conversiones: eventos de conversión, tasas
 *
 * Dos modos de ejecución:
 *   --mode=full          Full rebuild, 90 días (semanal)
 *   --mode=incremental   Solo últimos 7 días, merge con data existente (diario)
 *
 * Uso:
 *   node ga4_api.js --client=ucsp --mode=full
 *   node ga4_api.js --client=ucsp --mode=incremental
 *
 * Requiere:
 *   GA4_PROPERTY_ID en .env o variable de entorno
 *   GA4_CREDENTIALS_JSON en variable de entorno (JSON string) o
 *   GA4_CREDENTIALS_PATH apuntando al archivo JSON
 */

import fs from 'fs/promises';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// CONFIGURATION
// ============================================================================
const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID || '310975508';

// Initialize credentials from env var (JSON string) or file path
function getCredentials() {
  // Option 1: JSON string in environment variable (for GitHub Actions)
  if (process.env.GA4_CREDENTIALS_JSON) {
    try {
      return JSON.parse(process.env.GA4_CREDENTIALS_JSON);
    } catch (e) {
      console.error('Error parsing GA4_CREDENTIALS_JSON:', e.message);
    }
  }

  // Option 2: File path (synchronous read)
  const credPath = process.env.GA4_CREDENTIALS_PATH ||
                   path.join(__dirname, '../secrets/ga4-credentials.json');

  try {
    const content = readFileSync(credPath, 'utf-8');
    return JSON.parse(content);
  } catch (e) {
    console.error(`Error reading credentials file: ${credPath}`);
    console.error(e.message);
    return null;
  }
}

// ============================================================================
// ARGUMENTOS
// ============================================================================
function parseArgs() {
  const args = process.argv.slice(2);
  const options = { client: 'ucsp', mode: 'full' };
  args.forEach(arg => {
    if (arg.startsWith('--client=')) options.client = arg.split('=')[1];
    if (arg.startsWith('--mode=')) options.mode = arg.split('=')[1];
  });
  return options;
}

// ============================================================================
// CARGAR CONFIG
// ============================================================================
async function loadClientConfig(clientName) {
  const configPath = path.join(__dirname, 'config', `${clientName}.json`);
  try {
    const content = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Config no encontrada: ${configPath}`);
    process.exit(1);
  }
}

// ============================================================================
// GA4 CLIENT
// ============================================================================
let analyticsClient = null;

function getClient() {
  if (!analyticsClient) {
    const credentials = getCredentials();
    if (!credentials) {
      throw new Error('No se pudieron obtener credenciales de GA4');
    }
    analyticsClient = new BetaAnalyticsDataClient({ credentials });
  }
  return analyticsClient;
}

// ============================================================================
// DATE HELPERS
// ============================================================================
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function getDateRange(days) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return {
    startDate: formatDate(start),
    endDate: formatDate(end)
  };
}

// ============================================================================
// GA4 API CALLS
// ============================================================================

/**
 * Fetch overview metrics: users, sessions, conversions
 */
async function fetchOverviewMetrics(propertyId, dateRange) {
  console.log('\n   Obteniendo métricas generales...');

  const client = getClient();
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [dateRange],
    metrics: [
      { name: 'totalUsers' },
      { name: 'newUsers' },
      { name: 'sessions' },
      { name: 'screenPageViews' },
      { name: 'averageSessionDuration' },
      { name: 'bounceRate' },
      { name: 'engagedSessions' },
      { name: 'engagementRate' },
      { name: 'conversions' },
      { name: 'eventCount' }
    ]
  });

  const metrics = {};
  if (response.rows && response.rows[0]) {
    response.metricHeaders.forEach((header, i) => {
      const value = response.rows[0].metricValues[i].value;
      metrics[header.name] = parseFloat(value) || 0;
    });
  }

  console.log(`   Usuarios totales: ${metrics.totalUsers?.toLocaleString() || 0}`);
  console.log(`   Sesiones: ${metrics.sessions?.toLocaleString() || 0}`);
  console.log(`   Conversiones: ${metrics.conversions?.toLocaleString() || 0}`);

  return metrics;
}

/**
 * Fetch daily metrics for time series
 */
async function fetchDailyMetrics(propertyId, dateRange) {
  console.log('\n   Obteniendo métricas diarias...');

  const client = getClient();
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [dateRange],
    dimensions: [{ name: 'date' }],
    metrics: [
      { name: 'totalUsers' },
      { name: 'newUsers' },
      { name: 'sessions' },
      { name: 'conversions' },
      { name: 'engagedSessions' }
    ],
    orderBys: [{ dimension: { dimensionName: 'date' } }]
  });

  const dailyData = {};
  (response.rows || []).forEach(row => {
    const dateStr = row.dimensionValues[0].value; // YYYYMMDD
    const date = `${dateStr.slice(0,4)}-${dateStr.slice(4,6)}-${dateStr.slice(6,8)}`;
    dailyData[date] = {
      users: parseInt(row.metricValues[0].value) || 0,
      newUsers: parseInt(row.metricValues[1].value) || 0,
      sessions: parseInt(row.metricValues[2].value) || 0,
      conversions: parseInt(row.metricValues[3].value) || 0,
      engagedSessions: parseInt(row.metricValues[4].value) || 0
    };
  });

  console.log(`   Días con datos: ${Object.keys(dailyData).length}`);
  return dailyData;
}

/**
 * Fetch traffic sources
 */
async function fetchTrafficSources(propertyId, dateRange) {
  console.log('\n   Obteniendo fuentes de tráfico...');

  const client = getClient();
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [dateRange],
    dimensions: [
      { name: 'sessionSource' },
      { name: 'sessionMedium' }
    ],
    metrics: [
      { name: 'sessions' },
      { name: 'totalUsers' },
      { name: 'conversions' },
      { name: 'engagementRate' }
    ],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 20
  });

  const sources = (response.rows || []).map(row => ({
    source: row.dimensionValues[0].value || '(direct)',
    medium: row.dimensionValues[1].value || '(none)',
    sessions: parseInt(row.metricValues[0].value) || 0,
    users: parseInt(row.metricValues[1].value) || 0,
    conversions: parseInt(row.metricValues[2].value) || 0,
    engagementRate: parseFloat(row.metricValues[3].value) || 0
  }));

  console.log(`   Fuentes encontradas: ${sources.length}`);
  return sources;
}

/**
 * Fetch traffic by channel grouping
 */
async function fetchChannelGrouping(propertyId, dateRange) {
  console.log('\n   Obteniendo canales de tráfico...');

  const client = getClient();
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [dateRange],
    dimensions: [{ name: 'sessionDefaultChannelGroup' }],
    metrics: [
      { name: 'sessions' },
      { name: 'totalUsers' },
      { name: 'newUsers' },
      { name: 'conversions' },
      { name: 'engagementRate' }
    ],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }]
  });

  const channels = (response.rows || []).map(row => ({
    channel: row.dimensionValues[0].value,
    sessions: parseInt(row.metricValues[0].value) || 0,
    users: parseInt(row.metricValues[1].value) || 0,
    newUsers: parseInt(row.metricValues[2].value) || 0,
    conversions: parseInt(row.metricValues[3].value) || 0,
    engagementRate: parseFloat(row.metricValues[4].value) || 0
  }));

  console.log(`   Canales: ${channels.map(c => c.channel).join(', ')}`);
  return channels;
}

/**
 * Fetch top pages
 */
async function fetchTopPages(propertyId, dateRange) {
  console.log('\n   Obteniendo páginas más visitadas...');

  const client = getClient();
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [dateRange],
    dimensions: [
      { name: 'pagePath' },
      { name: 'pageTitle' }
    ],
    metrics: [
      { name: 'screenPageViews' },
      { name: 'totalUsers' },
      { name: 'averageSessionDuration' },
      { name: 'bounceRate' }
    ],
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    limit: 30
  });

  const pages = (response.rows || []).map(row => ({
    path: row.dimensionValues[0].value,
    title: row.dimensionValues[1].value || 'Sin título',
    pageViews: parseInt(row.metricValues[0].value) || 0,
    users: parseInt(row.metricValues[1].value) || 0,
    avgSessionDuration: parseFloat(row.metricValues[2].value) || 0,
    bounceRate: parseFloat(row.metricValues[3].value) || 0
  }));

  console.log(`   Páginas analizadas: ${pages.length}`);
  return pages;
}

/**
 * Fetch landing pages
 */
async function fetchLandingPages(propertyId, dateRange) {
  console.log('\n   Obteniendo landing pages...');

  const client = getClient();
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [dateRange],
    dimensions: [{ name: 'landingPage' }],
    metrics: [
      { name: 'sessions' },
      { name: 'totalUsers' },
      { name: 'conversions' },
      { name: 'bounceRate' },
      { name: 'engagementRate' }
    ],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 20
  });

  const landingPages = (response.rows || []).map(row => ({
    page: row.dimensionValues[0].value,
    sessions: parseInt(row.metricValues[0].value) || 0,
    users: parseInt(row.metricValues[1].value) || 0,
    conversions: parseInt(row.metricValues[2].value) || 0,
    bounceRate: parseFloat(row.metricValues[3].value) || 0,
    engagementRate: parseFloat(row.metricValues[4].value) || 0
  }));

  console.log(`   Landing pages: ${landingPages.length}`);
  return landingPages;
}

/**
 * Fetch geographic data
 */
async function fetchGeographicData(propertyId, dateRange) {
  console.log('\n   Obteniendo datos geográficos...');

  const client = getClient();
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [dateRange],
    dimensions: [
      { name: 'city' },
      { name: 'region' }
    ],
    metrics: [
      { name: 'totalUsers' },
      { name: 'sessions' },
      { name: 'conversions' }
    ],
    orderBys: [{ metric: { metricName: 'totalUsers' }, desc: true }],
    limit: 30
  });

  const geoData = (response.rows || []).map(row => ({
    city: row.dimensionValues[0].value || '(not set)',
    region: row.dimensionValues[1].value || '(not set)',
    users: parseInt(row.metricValues[0].value) || 0,
    sessions: parseInt(row.metricValues[1].value) || 0,
    conversions: parseInt(row.metricValues[2].value) || 0
  }));

  // Filter for Peru regions of interest
  const peruRegions = ['Arequipa', 'Puno', 'Cusco', 'Moquegua', 'Tacna', 'Lima'];
  const filteredGeo = geoData.filter(g =>
    peruRegions.some(r => g.region.includes(r) || g.city.includes(r))
  );

  console.log(`   Ciudades/regiones (Perú): ${filteredGeo.length}`);
  return { all: geoData.slice(0, 20), peru: filteredGeo };
}

/**
 * Fetch device categories
 */
async function fetchDeviceData(propertyId, dateRange) {
  console.log('\n   Obteniendo datos de dispositivos...');

  const client = getClient();
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [dateRange],
    dimensions: [{ name: 'deviceCategory' }],
    metrics: [
      { name: 'totalUsers' },
      { name: 'sessions' },
      { name: 'conversions' },
      { name: 'engagementRate' }
    ],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }]
  });

  const devices = (response.rows || []).map(row => ({
    device: row.dimensionValues[0].value,
    users: parseInt(row.metricValues[0].value) || 0,
    sessions: parseInt(row.metricValues[1].value) || 0,
    conversions: parseInt(row.metricValues[2].value) || 0,
    engagementRate: parseFloat(row.metricValues[3].value) || 0
  }));

  console.log(`   Dispositivos: ${devices.map(d => d.device).join(', ')}`);
  return devices;
}

/**
 * Fetch campaign data
 */
async function fetchCampaignData(propertyId, dateRange) {
  console.log('\n   Obteniendo datos de campañas...');

  const client = getClient();
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [dateRange],
    dimensions: [
      { name: 'sessionCampaignName' },
      { name: 'sessionSource' },
      { name: 'sessionMedium' }
    ],
    metrics: [
      { name: 'sessions' },
      { name: 'totalUsers' },
      { name: 'conversions' },
      { name: 'engagementRate' }
    ],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 30
  });

  const campaigns = (response.rows || [])
    .filter(row => row.dimensionValues[0].value !== '(not set)')
    .map(row => ({
      campaign: row.dimensionValues[0].value,
      source: row.dimensionValues[1].value,
      medium: row.dimensionValues[2].value,
      sessions: parseInt(row.metricValues[0].value) || 0,
      users: parseInt(row.metricValues[1].value) || 0,
      conversions: parseInt(row.metricValues[2].value) || 0,
      engagementRate: parseFloat(row.metricValues[3].value) || 0
    }));

  console.log(`   Campañas activas: ${campaigns.length}`);
  return campaigns;
}

/**
 * Fetch conversion events
 */
async function fetchConversionEvents(propertyId, dateRange) {
  console.log('\n   Obteniendo eventos de conversión...');

  const client = getClient();
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [dateRange],
    dimensions: [{ name: 'eventName' }],
    metrics: [
      { name: 'eventCount' },
      { name: 'totalUsers' },
      { name: 'conversions' }
    ],
    orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
    limit: 30
  });

  const events = (response.rows || []).map(row => ({
    event: row.dimensionValues[0].value,
    count: parseInt(row.metricValues[0].value) || 0,
    users: parseInt(row.metricValues[1].value) || 0,
    conversions: parseInt(row.metricValues[2].value) || 0
  }));

  // Filter key conversion events
  const conversionKeywords = ['form', 'submit', 'lead', 'contact', 'apply', 'register', 'inscri', 'postul'];
  const conversionEvents = events.filter(e =>
    conversionKeywords.some(k => e.event.toLowerCase().includes(k)) ||
    e.conversions > 0
  );

  console.log(`   Eventos totales: ${events.length}, Conversiones: ${conversionEvents.length}`);
  return { all: events.slice(0, 20), conversions: conversionEvents };
}

/**
 * Fetch daily data by channel for date-filtered dashboards
 */
async function fetchDailyByChannel(propertyId, dateRange) {
  console.log('\n   Obteniendo métricas diarias por canal...');

  const client = getClient();
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [dateRange],
    dimensions: [
      { name: 'date' },
      { name: 'sessionDefaultChannelGroup' }
    ],
    metrics: [
      { name: 'sessions' },
      { name: 'totalUsers' },
      { name: 'conversions' }
    ],
    orderBys: [{ dimension: { dimensionName: 'date' } }],
    limit: 10000
  });

  const dailyByChannel = {};
  (response.rows || []).forEach(row => {
    const dateStr = row.dimensionValues[0].value;
    const date = `${dateStr.slice(0,4)}-${dateStr.slice(4,6)}-${dateStr.slice(6,8)}`;
    const channel = row.dimensionValues[1].value;

    if (!dailyByChannel[date]) dailyByChannel[date] = {};
    dailyByChannel[date][channel] = {
      sessions: parseInt(row.metricValues[0].value) || 0,
      users: parseInt(row.metricValues[1].value) || 0,
      conversions: parseInt(row.metricValues[2].value) || 0
    };
  });

  console.log(`   Días con datos por canal: ${Object.keys(dailyByChannel).length}`);
  return dailyByChannel;
}

// ============================================================================
// INCREMENTAL MERGE
// ============================================================================

async function loadExistingData() {
  const filePath = path.join(__dirname, '../data/ga4/latest.json');
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);
    if (data.overview && data.daily) {
      console.log(`   Datos existentes cargados (${data.timestamp})`);
      return data;
    }
    return null;
  } catch {
    console.log('   No hay datos existentes, se hará fetch completo');
    return null;
  }
}

function mergeDailyData(existing, fresh) {
  return { ...(existing || {}), ...(fresh || {}) };
}

function mergeNestedDaily(existing, fresh) {
  const merged = { ...(existing || {}) };
  Object.entries(fresh || {}).forEach(([date, data]) => {
    merged[date] = data;
  });
  return merged;
}

function mergeGA4Data(existing, fresh) {
  console.log('\n   Mergeando datos incrementales...');

  const merged = JSON.parse(JSON.stringify(existing));

  // Merge daily data (overwrites fresh days)
  merged.daily = mergeDailyData(existing.daily, fresh.daily);
  merged.dailyByChannel = mergeNestedDaily(existing.dailyByChannel, fresh.dailyByChannel);

  // Recalculate overview from merged daily
  let totalUsers = 0, totalSessions = 0, totalConversions = 0;
  Object.values(merged.daily).forEach(d => {
    totalUsers += d.users || 0;
    totalSessions += d.sessions || 0;
    totalConversions += d.conversions || 0;
  });

  merged.overview = {
    ...fresh.overview, // Keep latest calculated rates
    totalUsers,
    sessions: totalSessions,
    conversions: totalConversions
  };

  // Use fresh data for other sections (always current)
  merged.trafficSources = fresh.trafficSources;
  merged.channels = fresh.channels;
  merged.topPages = fresh.topPages;
  merged.landingPages = fresh.landingPages;
  merged.geography = fresh.geography;
  merged.devices = fresh.devices;
  merged.campaigns = fresh.campaigns;
  merged.events = fresh.events;

  // Metadata
  merged.timestamp = fresh.timestamp;
  merged.metadata = {
    ...merged.metadata,
    ...fresh.metadata,
    mode: 'incremental',
    last_full_run: existing.metadata?.last_full_run || existing.timestamp
  };

  const freshDays = Object.keys(fresh.daily).length;
  const totalDays = Object.keys(merged.daily).length;
  console.log(`   Merge completado: ${freshDays} días frescos → ${totalDays} días totales`);

  return merged;
}

// ============================================================================
// MAIN CONNECTOR
// ============================================================================
async function fetchGA4Data(clientConfig, mode = 'full') {
  const isIncremental = mode === 'incremental';
  const propertyId = GA4_PROPERTY_ID;

  console.log(`\nGA4 Data Connector - ${clientConfig.client}`);
  console.log(`   Property ID: ${propertyId}`);
  console.log(`   Modo: ${isIncremental ? 'INCREMENTAL (7 días)' : 'FULL (90 días)'}`);
  console.log('='.repeat(50));

  // Determine date range
  let lookbackDays;
  let existingData = null;

  if (isIncremental) {
    existingData = await loadExistingData();
    if (!existingData) {
      console.log('   [INFO] Sin datos existentes — cambiando a modo FULL');
    }
    lookbackDays = existingData ? 7 : 90;
  } else {
    lookbackDays = 90;
  }

  const dateRange = getDateRange(lookbackDays);
  console.log(`   Rango: ${dateRange.startDate} → ${dateRange.endDate}`);
  console.log('='.repeat(50));

  try {
    // Fetch all data
    const overview = await fetchOverviewMetrics(propertyId, dateRange);
    const daily = await fetchDailyMetrics(propertyId, dateRange);
    const trafficSources = await fetchTrafficSources(propertyId, dateRange);
    const channels = await fetchChannelGrouping(propertyId, dateRange);
    const topPages = await fetchTopPages(propertyId, dateRange);
    const landingPages = await fetchLandingPages(propertyId, dateRange);
    const geography = await fetchGeographicData(propertyId, dateRange);
    const devices = await fetchDeviceData(propertyId, dateRange);
    const campaigns = await fetchCampaignData(propertyId, dateRange);
    const events = await fetchConversionEvents(propertyId, dateRange);
    const dailyByChannel = await fetchDailyByChannel(propertyId, dateRange);

    // Build fresh data object
    const freshData = {
      timestamp: new Date().toISOString(),
      source: 'Google Analytics 4 API',
      property_id: propertyId,
      client: `${clientConfig.client} - ${clientConfig.clientFullName}`,
      dateRange,
      overview,
      daily,
      dailyByChannel,
      trafficSources,
      channels,
      topPages,
      landingPages,
      geography,
      devices,
      campaigns,
      events,
      metadata: {
        method: 'Google Analytics Data API v1beta',
        lookback_days: lookbackDays,
        mode: isIncremental && existingData ? 'incremental' : 'full',
        last_full_run: isIncremental ? undefined : new Date().toISOString()
      }
    };

    // Merge or use fresh
    let finalData;
    if (isIncremental && existingData) {
      finalData = mergeGA4Data(existingData, freshData);
    } else {
      finalData = freshData;
    }

    await saveResults(finalData);
    return finalData;

  } catch (error) {
    console.error(`\nError: ${error.message}`);
    if (error.code === 7 || error.message.includes('PERMISSION_DENIED')) {
      console.error('\n¿El Service Account tiene acceso a esta propiedad GA4?');
      console.error('Agrega el email del service account como Viewer en GA4 Admin.');
    }
    throw error;
  }
}

// ============================================================================
// GUARDAR RESULTADOS
// ============================================================================
async function saveResults(data) {
  const dataDir = path.join(__dirname, '../data/ga4');
  const publicDir = path.join(__dirname, '../public/data/ga4');

  await fs.mkdir(dataDir, { recursive: true });
  await fs.mkdir(publicDir, { recursive: true });

  const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const jsonData = JSON.stringify(data, null, 2);

  // Save with timestamp (backup)
  await fs.writeFile(path.join(dataDir, `ga4_${timestamp}.json`), jsonData);

  // Save as latest (frontend reads this)
  await fs.writeFile(path.join(dataDir, 'latest.json'), jsonData);
  await fs.writeFile(path.join(publicDir, 'latest.json'), jsonData);

  console.log('\nArchivos guardados:');
  console.log(`   data/ga4/ga4_${timestamp}.json`);
  console.log(`   data/ga4/latest.json`);
  console.log(`   public/data/ga4/latest.json <-- Frontend lee este`);

  // Summary
  console.log('\nResumen:');
  console.log(`   Usuarios totales: ${data.overview?.totalUsers?.toLocaleString() || 0}`);
  console.log(`   Sesiones: ${data.overview?.sessions?.toLocaleString() || 0}`);
  console.log(`   Nuevos usuarios: ${data.overview?.newUsers?.toLocaleString() || 0}`);
  console.log(`   Conversiones: ${data.overview?.conversions?.toLocaleString() || 0}`);
  console.log(`   Tasa engagement: ${((data.overview?.engagementRate || 0) * 100).toFixed(1)}%`);
  console.log(`   Bounce rate: ${((data.overview?.bounceRate || 0) * 100).toFixed(1)}%`);

  // Top channels
  console.log('\n   Top canales:');
  (data.channels || []).slice(0, 5).forEach(c => {
    console.log(`     ${c.channel}: ${c.sessions.toLocaleString()} sesiones`);
  });

  // Top pages
  console.log('\n   Top páginas:');
  (data.topPages || []).slice(0, 5).forEach(p => {
    console.log(`     ${p.path}: ${p.pageViews.toLocaleString()} vistas`);
  });
}

// ============================================================================
// MAIN
// ============================================================================
async function main() {
  const options = parseArgs();

  console.log('GA4 Data Connector');
  console.log(`   Cliente: ${options.client}`);
  console.log(`   Modo: ${options.mode}`);
  console.log(`   Fecha: ${new Date().toLocaleString('es-PE')}`);

  try {
    const clientConfig = await loadClientConfig(options.client);
    await fetchGA4Data(clientConfig, options.mode);
    console.log('\nConexión completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error(`\nError fatal: ${error.message}`);
    process.exit(1);
  }
}

main();
