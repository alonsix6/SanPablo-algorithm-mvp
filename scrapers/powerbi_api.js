#!/usr/bin/env node
/**
 * Power BI Data Connector
 *
 * Obtiene datos de Power BI via REST API:
 * - Datasets: métricas de reportes publicados
 * - Reports: datos exportados de dashboards
 * - DAX Queries: consultas directas a modelos semánticos
 *
 * Dos modos de ejecución:
 *   --mode=full          Full fetch de todos los datasets configurados (semanal)
 *   --mode=incremental   Solo últimos 7 días, merge con data existente (diario)
 *
 * Uso:
 *   node powerbi_api.js --client=ucsp --mode=full
 *   node powerbi_api.js --client=ucsp --mode=incremental
 *
 * Requiere:
 *   POWERBI_CLIENT_ID en .env o variable de entorno (Azure AD App Registration)
 *   POWERBI_CLIENT_SECRET en .env o variable de entorno
 *   POWERBI_TENANT_ID en .env o variable de entorno
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import axios from 'axios';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Azure AD / Power BI API Configuration
const POWERBI_CLIENT_ID = process.env.POWERBI_CLIENT_ID;
const POWERBI_CLIENT_SECRET = process.env.POWERBI_CLIENT_SECRET;
const POWERBI_TENANT_ID = process.env.POWERBI_TENANT_ID;
const AZURE_TOKEN_URL = `https://login.microsoftonline.com/${POWERBI_TENANT_ID}/oauth2/v2.0/token`;
const POWERBI_BASE_URL = 'https://api.powerbi.com/v1.0/myorg';

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
// AUTHENTICATION — Azure AD OAuth2 Client Credentials
// ============================================================================
let accessToken = null;
let tokenExpiry = 0;

async function getAccessToken() {
  // Return cached token if still valid (with 5 min buffer)
  if (accessToken && Date.now() < tokenExpiry - 300000) {
    return accessToken;
  }

  console.log('   Obteniendo token de Azure AD...');

  try {
    const response = await axios.post(AZURE_TOKEN_URL, new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: POWERBI_CLIENT_ID,
      client_secret: POWERBI_CLIENT_SECRET,
      scope: 'https://analysis.windows.net/powerbi/api/.default'
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    accessToken = response.data.access_token;
    tokenExpiry = Date.now() + (response.data.expires_in * 1000);
    console.log('   Token obtenido exitosamente');
    return accessToken;
  } catch (error) {
    const msg = error.response?.data?.error_description || error.message;
    throw new Error(`Error de autenticación Azure AD: ${msg}`);
  }
}

// ============================================================================
// HTTP HELPER — with automatic retry on rate limit
// ============================================================================
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function powerBIFetch(endpoint, options = {}) {
  const token = await getAccessToken();
  const url = endpoint.startsWith('http') ? endpoint : `${POWERBI_BASE_URL}${endpoint}`;
  const maxRetries = 5;

  const axiosConfig = {
    method: options.method || 'GET',
    url,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    },
    timeout: 60000
  };

  if (options.body) {
    axiosConfig.data = options.body;
  }

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios(axiosConfig);
      return response.data;
    } catch (error) {
      const status = error.response?.status;
      if (status === 429 && attempt < maxRetries) {
        // Rate limited — use Retry-After header or exponential backoff
        const retryAfter = error.response?.headers?.['retry-after'];
        const waitMs = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, attempt) * 1000;
        console.log(`     [Rate limit] Esperando ${waitMs / 1000}s antes de reintentar...`);
        await sleep(waitMs);
        continue;
      }
      if (error.response) {
        throw new Error(`Power BI API ${status}: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }
}

// ============================================================================
// DATA FETCHERS
// ============================================================================

/**
 * List all workspaces (groups) accessible to the service principal
 */
async function fetchWorkspaces() {
  console.log('\n   Obteniendo workspaces...');
  const data = await powerBIFetch('/groups');
  const workspaces = data.value || [];
  console.log(`   Workspaces: ${workspaces.length}`);
  return workspaces;
}

/**
 * List datasets in a workspace
 */
async function fetchDatasets(workspaceId) {
  console.log(`\n   Obteniendo datasets del workspace ${workspaceId}...`);
  const data = await powerBIFetch(`/groups/${workspaceId}/datasets`);
  const datasets = data.value || [];
  console.log(`   Datasets: ${datasets.length}`);
  return datasets;
}

/**
 * List reports in a workspace
 */
async function fetchReports(workspaceId) {
  console.log(`\n   Obteniendo reportes del workspace ${workspaceId}...`);
  const data = await powerBIFetch(`/groups/${workspaceId}/reports`);
  const reports = data.value || [];
  console.log(`   Reportes: ${reports.length}`);
  return reports;
}

/**
 * Execute a DAX query against a dataset
 * This is the primary method for extracting structured data from Power BI
 */
async function executeDaxQuery(workspaceId, datasetId, daxQuery) {
  console.log(`   Ejecutando DAX query...`);

  const data = await powerBIFetch(`/groups/${workspaceId}/datasets/${datasetId}/executeQueries`, {
    method: 'POST',
    body: {
      queries: [{ query: daxQuery }],
      serializerSettings: {
        includeNulls: true
      }
    }
  });

  const results = data.results?.[0]?.tables?.[0]?.rows || [];
  console.log(`   Filas obtenidas: ${results.length}`);
  return results;
}

/**
 * Fetch refresh history for a dataset
 */
async function fetchRefreshHistory(workspaceId, datasetId) {
  console.log(`   Obteniendo historial de refresh...`);
  try {
    const data = await powerBIFetch(`/groups/${workspaceId}/datasets/${datasetId}/refreshes?$top=10`);
    return data.value || [];
  } catch (e) {
    console.log(`   [WARN] No se pudo obtener historial de refresh: ${e.message}`);
    return [];
  }
}

// ============================================================================
// DAX QUERIES — Configurable per client
// ============================================================================

/**
 * Build DAX queries from client configuration.
 * Each query maps to a metric category.
 */
function buildDaxQueries(powerbiConfig) {
  const queries = {};
  const customQueries = powerbiConfig.dax_queries || {};

  // Default queries for education/admissions metrics
  queries.enrollment_summary = customQueries.enrollment_summary ||
    `EVALUATE
    SUMMARIZECOLUMNS(
      'Calendario'[Mes],
      "Postulaciones", COUNTROWS('Postulaciones'),
      "Matriculados", CALCULATE(COUNTROWS('Postulaciones'), 'Postulaciones'[Estado] = "Matriculado"),
      "Tasa_Conversion", DIVIDE(
        CALCULATE(COUNTROWS('Postulaciones'), 'Postulaciones'[Estado] = "Matriculado"),
        COUNTROWS('Postulaciones'),
        0
      )
    )
    ORDER BY 'Calendario'[Mes]`;

  queries.channel_performance = customQueries.channel_performance ||
    `EVALUATE
    SUMMARIZECOLUMNS(
      'Campanas'[Canal],
      "Inversion", SUM('Campanas'[Inversion]),
      "Leads", SUM('Campanas'[Leads]),
      "Matriculados", SUM('Campanas'[Matriculados]),
      "CPL", DIVIDE(SUM('Campanas'[Inversion]), SUM('Campanas'[Leads]), 0),
      "CPA", DIVIDE(SUM('Campanas'[Inversion]), SUM('Campanas'[Matriculados]), 0),
      "ROI", DIVIDE(SUM('Campanas'[Ingresos]) - SUM('Campanas'[Inversion]), SUM('Campanas'[Inversion]), 0)
    )`;

  queries.program_performance = customQueries.program_performance ||
    `EVALUATE
    SUMMARIZECOLUMNS(
      'Programas'[Nombre],
      'Programas'[Tipo],
      "Postulaciones", COUNTROWS('Postulaciones'),
      "Matriculados", CALCULATE(COUNTROWS('Postulaciones'), 'Postulaciones'[Estado] = "Matriculado"),
      "Ingresos", SUM('Postulaciones'[Monto]),
      "Meta_Matricula", MAX('Programas'[Meta_Matricula]),
      "Avance_Pct", DIVIDE(
        CALCULATE(COUNTROWS('Postulaciones'), 'Postulaciones'[Estado] = "Matriculado"),
        MAX('Programas'[Meta_Matricula]),
        0
      )
    )`;

  queries.daily_kpis = customQueries.daily_kpis ||
    `EVALUATE
    SUMMARIZECOLUMNS(
      'Calendario'[Fecha],
      "Sesiones_Web", SUM('WebAnalytics'[Sesiones]),
      "Leads", SUM('WebAnalytics'[Leads]),
      "Postulaciones", COUNTROWS('Postulaciones'),
      "Inversion", SUM('Campanas'[Inversion_Diaria])
    )
    ORDER BY 'Calendario'[Fecha]`;

  queries.geographic_distribution = customQueries.geographic_distribution ||
    `EVALUATE
    SUMMARIZECOLUMNS(
      'Postulantes'[Departamento],
      'Postulantes'[Provincia],
      "Total", COUNTROWS('Postulantes'),
      "Matriculados", CALCULATE(COUNTROWS('Postulantes'), 'Postulantes'[Estado] = "Matriculado")
    )
    ORDER BY COUNTROWS('Postulantes') DESC`;

  return queries;
}

// ============================================================================
// DATA PROCESSING
// ============================================================================

function processEnrollmentData(rows) {
  console.log('\n   Procesando datos de matrícula...');

  const monthlyData = {};
  let totalPostulaciones = 0;
  let totalMatriculados = 0;

  rows.forEach(row => {
    const month = row['Calendario[Mes]'] || row['[Mes]'] || 'unknown';
    const postulaciones = parseInt(row['[Postulaciones]'] || row['Postulaciones'] || 0);
    const matriculados = parseInt(row['[Matriculados]'] || row['Matriculados'] || 0);
    const tasaConversion = parseFloat(row['[Tasa_Conversion]'] || row['Tasa_Conversion'] || 0);

    monthlyData[month] = {
      postulaciones,
      matriculados,
      tasa_conversion: tasaConversion
    };

    totalPostulaciones += postulaciones;
    totalMatriculados += matriculados;
  });

  return {
    total_postulaciones: totalPostulaciones,
    total_matriculados: totalMatriculados,
    tasa_conversion_global: totalPostulaciones > 0
      ? parseFloat((totalMatriculados / totalPostulaciones * 100).toFixed(1))
      : 0,
    monthly: monthlyData
  };
}

function processChannelData(rows) {
  console.log('\n   Procesando datos de canales...');

  const channels = [];
  let totalInversion = 0;
  let totalLeads = 0;
  let totalMatriculados = 0;

  rows.forEach(row => {
    const canal = row['Campanas[Canal]'] || row['[Canal]'] || 'unknown';
    const inversion = parseFloat(row['[Inversion]'] || row['Inversion'] || 0);
    const leads = parseInt(row['[Leads]'] || row['Leads'] || 0);
    const matriculados = parseInt(row['[Matriculados]'] || row['Matriculados'] || 0);
    const cpl = parseFloat(row['[CPL]'] || row['CPL'] || 0);
    const cpa = parseFloat(row['[CPA]'] || row['CPA'] || 0);
    const roi = parseFloat(row['[ROI]'] || row['ROI'] || 0);

    channels.push({
      canal,
      inversion: parseFloat(inversion.toFixed(2)),
      leads,
      matriculados,
      cpl: parseFloat(cpl.toFixed(2)),
      cpa: parseFloat(cpa.toFixed(2)),
      roi: parseFloat((roi * 100).toFixed(1))
    });

    totalInversion += inversion;
    totalLeads += leads;
    totalMatriculados += matriculados;
  });

  // Sort by investment descending
  channels.sort((a, b) => b.inversion - a.inversion);

  return {
    channels,
    totals: {
      inversion: parseFloat(totalInversion.toFixed(2)),
      leads: totalLeads,
      matriculados: totalMatriculados,
      cpl_promedio: totalLeads > 0 ? parseFloat((totalInversion / totalLeads).toFixed(2)) : 0,
      cpa_promedio: totalMatriculados > 0 ? parseFloat((totalInversion / totalMatriculados).toFixed(2)) : 0
    }
  };
}

function processProgramData(rows) {
  console.log('\n   Procesando datos de programas...');

  const programs = [];

  rows.forEach(row => {
    const nombre = row['Programas[Nombre]'] || row['[Nombre]'] || 'unknown';
    const tipo = row['Programas[Tipo]'] || row['[Tipo]'] || 'unknown';
    const postulaciones = parseInt(row['[Postulaciones]'] || row['Postulaciones'] || 0);
    const matriculados = parseInt(row['[Matriculados]'] || row['Matriculados'] || 0);
    const ingresos = parseFloat(row['[Ingresos]'] || row['Ingresos'] || 0);
    const metaMatricula = parseInt(row['[Meta_Matricula]'] || row['Meta_Matricula'] || 0);
    const avancePct = parseFloat(row['[Avance_Pct]'] || row['Avance_Pct'] || 0);

    programs.push({
      nombre,
      tipo,
      postulaciones,
      matriculados,
      ingresos: parseFloat(ingresos.toFixed(2)),
      meta_matricula: metaMatricula,
      avance_pct: parseFloat((avancePct * 100).toFixed(1))
    });
  });

  // Sort by matriculados descending
  programs.sort((a, b) => b.matriculados - a.matriculados);

  // Group by tipo
  const byType = {};
  programs.forEach(p => {
    if (!byType[p.tipo]) byType[p.tipo] = [];
    byType[p.tipo].push(p);
  });

  return {
    programs,
    by_type: byType,
    total_programs: programs.length
  };
}

function processDailyKPIs(rows) {
  console.log('\n   Procesando KPIs diarios...');

  const daily = {};

  rows.forEach(row => {
    const fecha = row['Calendario[Fecha]'] || row['[Fecha]'] || 'unknown';
    // Normalize date to YYYY-MM-DD format
    const dateStr = fecha.substring(0, 10);

    daily[dateStr] = {
      sesiones_web: parseInt(row['[Sesiones_Web]'] || row['Sesiones_Web'] || 0),
      leads: parseInt(row['[Leads]'] || row['Leads'] || 0),
      postulaciones: parseInt(row['[Postulaciones]'] || row['Postulaciones'] || 0),
      inversion: parseFloat(row['[Inversion]'] || row['Inversion'] || 0)
    };
  });

  return daily;
}

function processGeographicData(rows) {
  console.log('\n   Procesando datos geográficos...');

  const regions = [];

  rows.forEach(row => {
    const departamento = row['Postulantes[Departamento]'] || row['[Departamento]'] || 'unknown';
    const provincia = row['Postulantes[Provincia]'] || row['[Provincia]'] || 'unknown';
    const total = parseInt(row['[Total]'] || row['Total'] || 0);
    const matriculados = parseInt(row['[Matriculados]'] || row['Matriculados'] || 0);

    regions.push({
      departamento,
      provincia,
      total,
      matriculados,
      tasa_conversion: total > 0 ? parseFloat((matriculados / total * 100).toFixed(1)) : 0
    });
  });

  // Aggregate by departamento
  const byDepartamento = {};
  regions.forEach(r => {
    if (!byDepartamento[r.departamento]) {
      byDepartamento[r.departamento] = { total: 0, matriculados: 0, provincias: [] };
    }
    byDepartamento[r.departamento].total += r.total;
    byDepartamento[r.departamento].matriculados += r.matriculados;
    byDepartamento[r.departamento].provincias.push(r);
  });

  return {
    regions: regions.slice(0, 30),
    by_departamento: byDepartamento
  };
}

// ============================================================================
// INCREMENTAL MERGE
// ============================================================================

async function loadExistingData() {
  const filePath = path.join(__dirname, '../data/powerbi/latest.json');
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);
    if (data.enrollment && data.channels) {
      console.log(`   Datos existentes cargados (${data.timestamp})`);
      return data;
    }
    console.log('   [WARN] Datos existentes con estructura incompleta, ignorando');
    return null;
  } catch {
    console.log('   No hay datos existentes, se hará fetch completo');
    return null;
  }
}

function mergePowerBIData(existing, fresh) {
  console.log('\n   Mergeando datos incrementales...');

  const merged = JSON.parse(JSON.stringify(existing));

  // Merge daily KPIs (fresh days overwrite existing)
  merged.daily_kpis = { ...(existing.daily_kpis || {}), ...(fresh.daily_kpis || {}) };

  // For other metrics, always use fresh (they represent current state)
  merged.enrollment = fresh.enrollment;
  merged.channels = fresh.channels;
  merged.programs = fresh.programs;
  merged.geographic = fresh.geographic;

  // Metadata
  merged.timestamp = fresh.timestamp;
  merged.metadata = {
    ...merged.metadata,
    ...fresh.metadata,
    mode: 'incremental',
    last_full_run: existing.metadata?.last_full_run || existing.timestamp
  };

  const freshDays = Object.keys(fresh.daily_kpis || {}).length;
  const totalDays = Object.keys(merged.daily_kpis || {}).length;
  console.log(`   Merge completado: ${freshDays} días frescos -> ${totalDays} días totales`);

  return merged;
}

// ============================================================================
// MAIN CONNECTOR
// ============================================================================
async function fetchPowerBIData(clientConfig, mode = 'full') {
  const isIncremental = mode === 'incremental';
  const powerbiConfig = clientConfig.powerbi || {};

  console.log(`\nPower BI Data Connector - ${clientConfig.client}`);
  console.log(`   Modo: ${isIncremental ? 'INCREMENTAL (7 días)' : 'FULL REBUILD'}`);
  console.log('='.repeat(50));

  if (!POWERBI_CLIENT_ID || !POWERBI_CLIENT_SECRET || !POWERBI_TENANT_ID) {
    console.error('\nERROR: Credenciales de Power BI no configuradas');
    console.error('   Configura POWERBI_CLIENT_ID, POWERBI_CLIENT_SECRET y POWERBI_TENANT_ID');
    console.error('   en .env o como variables de entorno');
    process.exit(1);
  }

  const workspaceId = powerbiConfig.workspace_id;
  const datasetId = powerbiConfig.dataset_id;

  if (!workspaceId || !datasetId) {
    console.error('\nERROR: workspace_id y dataset_id son requeridos en la configuración de Power BI');
    process.exit(1);
  }

  // Load existing data for incremental mode
  let existingData = null;
  if (isIncremental) {
    existingData = await loadExistingData();
    if (!existingData) {
      console.log('   [INFO] Sin datos existentes — cambiando a modo FULL');
    }
  }

  try {
    // Authenticate
    await getAccessToken();

    // List available resources
    const workspaces = await fetchWorkspaces();
    const targetWorkspace = workspaces.find(w => w.id === workspaceId);
    if (targetWorkspace) {
      console.log(`   Workspace: ${targetWorkspace.name}`);
    }

    const datasets = await fetchDatasets(workspaceId);
    const targetDataset = datasets.find(d => d.id === datasetId);
    if (targetDataset) {
      console.log(`   Dataset: ${targetDataset.name}`);
    }

    const reports = await fetchReports(workspaceId);
    console.log(`   Reportes disponibles: ${reports.map(r => r.name).join(', ')}`);

    // Get refresh history
    const refreshHistory = await fetchRefreshHistory(workspaceId, datasetId);

    // Build and execute DAX queries
    const daxQueries = buildDaxQueries(powerbiConfig);
    console.log('\nEjecutando DAX queries...');

    const enrollmentRows = await executeDaxQuery(workspaceId, datasetId, daxQueries.enrollment_summary);
    const channelRows = await executeDaxQuery(workspaceId, datasetId, daxQueries.channel_performance);
    const programRows = await executeDaxQuery(workspaceId, datasetId, daxQueries.program_performance);
    const dailyRows = await executeDaxQuery(workspaceId, datasetId, daxQueries.daily_kpis);
    const geoRows = await executeDaxQuery(workspaceId, datasetId, daxQueries.geographic_distribution);

    // Process data
    console.log('\nProcesando datos...');
    const enrollment = processEnrollmentData(enrollmentRows);
    const channels = processChannelData(channelRows);
    const programs = processProgramData(programRows);
    const dailyKPIs = processDailyKPIs(dailyRows);
    const geographic = processGeographicData(geoRows);

    // Build fresh data
    const freshData = {
      timestamp: new Date().toISOString(),
      source: 'Power BI REST API',
      region: clientConfig.region,
      category: 'Business Intelligence',
      client: `${clientConfig.client} - ${clientConfig.clientFullName}`,
      workspace: {
        id: workspaceId,
        name: targetWorkspace?.name || workspaceId
      },
      dataset: {
        id: datasetId,
        name: targetDataset?.name || datasetId,
        last_refresh: refreshHistory[0]?.endTime || null,
        refresh_status: refreshHistory[0]?.status || 'unknown'
      },
      reports: reports.map(r => ({ id: r.id, name: r.name, webUrl: r.webUrl })),
      enrollment,
      channels,
      programs,
      daily_kpis: dailyKPIs,
      geographic,
      metadata: {
        method: 'Power BI REST API v1.0 + DAX Queries',
        workspace_id: workspaceId,
        dataset_id: datasetId,
        queries_executed: Object.keys(daxQueries).length,
        mode: isIncremental && existingData ? 'incremental' : 'full',
        last_full_run: isIncremental ? undefined : new Date().toISOString(),
        note: 'Datos extraídos de Power BI via DAX queries'
      }
    };

    // Merge or use fresh
    let finalData;
    if (isIncremental && existingData) {
      finalData = mergePowerBIData(existingData, freshData);
    } else {
      finalData = freshData;
    }

    await saveResults(finalData);
    return finalData;

  } catch (error) {
    console.error(`\nError: ${error.message}`);
    if (error.message.includes('autenticación') || error.message.includes('401')) {
      console.error('\nVerifica que el Service Principal tenga acceso al workspace de Power BI.');
      console.error('En Power BI Admin Portal: Settings > Admin Portal > Tenant Settings > API Settings');
    }
    throw error;
  }
}

// ============================================================================
// GUARDAR RESULTADOS
// ============================================================================
async function saveResults(data) {
  const dataDir = path.join(__dirname, '../data/powerbi');
  const publicDir = path.join(__dirname, '../public/data/powerbi');

  await fs.mkdir(dataDir, { recursive: true });
  await fs.mkdir(publicDir, { recursive: true });

  const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const jsonData = JSON.stringify(data, null, 2);

  // Save with timestamp (backup)
  await fs.writeFile(path.join(dataDir, `powerbi_${timestamp}.json`), jsonData);

  // Save as latest (frontend reads this)
  await fs.writeFile(path.join(dataDir, 'latest.json'), jsonData);
  await fs.writeFile(path.join(publicDir, 'latest.json'), jsonData);

  console.log('\nArchivos guardados:');
  console.log(`   data/powerbi/powerbi_${timestamp}.json`);
  console.log(`   data/powerbi/latest.json`);
  console.log(`   public/data/powerbi/latest.json <-- Frontend lee este`);

  // Summary
  console.log('\nResumen:');
  console.log(`   Postulaciones: ${data.enrollment?.total_postulaciones || 0}`);
  console.log(`   Matriculados: ${data.enrollment?.total_matriculados || 0}`);
  console.log(`   Tasa conversión: ${data.enrollment?.tasa_conversion_global || 0}%`);
  console.log(`   Canales: ${data.channels?.channels?.length || 0}`);
  console.log(`   Programas: ${data.programs?.total_programs || 0}`);
  console.log(`   Inversión total: $${data.channels?.totals?.inversion?.toLocaleString() || 0}`);
  console.log(`   CPL promedio: $${data.channels?.totals?.cpl_promedio || 0}`);

  if (data.programs?.programs?.length > 0) {
    console.log('\n   Top programas por matrícula:');
    data.programs.programs.slice(0, 5).forEach(p => {
      console.log(`     ${p.nombre}: ${p.matriculados} (${p.avance_pct}% de meta)`);
    });
  }

  if (data.geographic?.by_departamento) {
    console.log('\n   Top departamentos:');
    Object.entries(data.geographic.by_departamento)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 5)
      .forEach(([dept, info]) => {
        console.log(`     ${dept}: ${info.total} postulantes (${info.matriculados} matriculados)`);
      });
  }
}

// ============================================================================
// MAIN
// ============================================================================
async function main() {
  const options = parseArgs();

  console.log('Power BI Data Connector');
  console.log(`   Cliente: ${options.client}`);
  console.log(`   Modo: ${options.mode}`);
  console.log(`   Fecha: ${new Date().toLocaleString('es-PE')}`);

  try {
    const clientConfig = await loadClientConfig(options.client);
    await fetchPowerBIData(clientConfig, options.mode);
    console.log('\nConexión completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error(`\nError fatal: ${error.message}`);
    process.exit(1);
  }
}

main();
