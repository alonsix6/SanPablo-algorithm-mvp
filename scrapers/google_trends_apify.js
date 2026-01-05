#!/usr/bin/env node
/**
 * Google Trends Scraper - Apify Only
 *
 * Obtiene datos REALES de Google Trends via Apify.
 * Se ejecuta semanalmente (Lunes 8am) via GitHub Actions.
 *
 * Uso:
 *   node google_trends_apify.js --client=ucsp
 *
 * Requiere:
 *   APIFY_TOKEN en .env o variable de entorno
 */

import { ApifyClient } from 'apify-client';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APIFY_TOKEN = process.env.APIFY_TOKEN;
const ACTOR_ID = 'apify/google-trends-scraper';

// ============================================================================
// ARGUMENTOS
// ============================================================================
function parseArgs() {
  const args = process.argv.slice(2);
  const options = { client: 'ucsp' };
  args.forEach(arg => {
    if (arg.startsWith('--client=')) options.client = arg.split('=')[1];
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
    console.error(`❌ Config no encontrada: ${configPath}`);
    process.exit(1);
  }
}

// ============================================================================
// SCRAPER PRINCIPAL
// ============================================================================
async function scrapeGoogleTrends(clientConfig) {
  console.log(`\n🔍 Google Trends Scraper - ${clientConfig.client}`);
  console.log('='.repeat(50));
  console.log(`📍 Región: ${clientConfig.region}`);
  console.log(`📊 Keywords: ${clientConfig.keywords.length}`);
  console.log(`⏰ Rango: ${clientConfig.timeRange}`);
  console.log('='.repeat(50));

  if (!APIFY_TOKEN) {
    console.error('\n❌ ERROR: APIFY_TOKEN no configurado');
    console.error('   Configura APIFY_TOKEN en .env o como variable de entorno');
    process.exit(1);
  }

  const client = new ApifyClient({ token: APIFY_TOKEN });

  const input = {
    searchTerms: clientConfig.keywords,
    geo: clientConfig.geo || clientConfig.region,
    timeRange: clientConfig.timeRange || 'today 1-m',  // Últimos 30 días
    maxItems: 100,
    isPublic: true
  };

  console.log(`\n📤 Input para Apify:`);
  console.log(JSON.stringify(input, null, 2));

  try {
    // Iniciar el actor
    console.log('\n🚀 Iniciando actor de Apify...');
    const run = await client.actor(ACTOR_ID).start(input);
    console.log(`   Run ID: ${run.id}`);

    // Esperar a que termine (máximo 10 minutos para dar tiempo suficiente)
    console.log('\n⏳ Esperando que termine (máx 10 min)...');
    console.log('   Esto puede tardar varios minutos debido a rate limiting de Google...');

    const finishedRun = await client.run(run.id).waitForFinish({
      waitSecs: 600  // 10 minutos
    });

    if (finishedRun.status !== 'SUCCEEDED') {
      throw new Error(`Actor terminó con estado: ${finishedRun.status}`);
    }

    console.log(`\n✅ Actor completado exitosamente`);

    // Obtener resultados
    const { items } = await client.dataset(finishedRun.defaultDatasetId).listItems();
    console.log(`📊 Items obtenidos: ${items.length}`);

    if (items.length === 0) {
      throw new Error('No se obtuvieron resultados de Apify');
    }

    // Transformar al formato del frontend
    const data = transformToFrontendFormat(items, clientConfig);

    // Guardar
    await saveResults(data);

    return data;

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    throw error;
  }
}

// ============================================================================
// TRANSFORMAR DATOS
// ============================================================================
function transformToFrontendFormat(items, clientConfig) {
  console.log('\n🔄 Transformando datos...');

  const keywords = items.map(item => {
    const keyword = item.searchTerm || item.inputUrlOrTerm || 'unknown';

    // Datos de timeline (si existen)
    const timelineData = item.interestOverTime_timelineData || [];

    // Topics relacionados
    const topTopics = item.relatedTopics_top || [];
    const risingTopics = item.relatedTopics_rising || [];

    // Calcular métricas
    let avgInterest = 0;
    let peakScore = 0;
    let trend = 'stable';
    let growth = '+0%';

    // Preferir timeline data si existe
    if (timelineData.length > 0) {
      const values = timelineData
        .map(dp => dp.value?.[0] || dp.value || 0)
        .filter(v => typeof v === 'number');

      if (values.length > 0) {
        avgInterest = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
        peakScore = Math.max(...values);

        // Tendencia basada en últimos días vs anteriores
        if (values.length >= 14) {
          const recent = values.slice(-7);
          const older = values.slice(-14, -7);
          const recentAvg = recent.reduce((a, b) => a + b, 0) / 7;
          const olderAvg = older.reduce((a, b) => a + b, 0) / 7;

          if (recentAvg > olderAvg * 1.1) trend = 'rising';
          else if (recentAvg < olderAvg * 0.9) trend = 'falling';

          if (olderAvg > 0) {
            const growthVal = ((recentAvg - olderAvg) / olderAvg) * 100;
            growth = `${growthVal >= 0 ? '+' : ''}${Math.round(growthVal)}%`;
          }
        }
      }
    } else if (topTopics.length > 0) {
      // Usar topics como fallback
      const topValues = topTopics.slice(0, 5).map(t => t.value || 0);
      avgInterest = Math.round(topValues.reduce((a, b) => a + b, 0) / topValues.length);
      peakScore = topValues[0] || avgInterest;

      // Tendencia desde rising topics
      if (risingTopics.length > 0) {
        const hasBreakout = risingTopics.some(t =>
          t.formattedValue === 'Breakout' || (t.value && t.value > 1000)
        );
        if (hasBreakout) {
          trend = 'rising';
          growth = '+200%';
        } else {
          const avgRising = risingTopics
            .filter(t => typeof t.value === 'number' && t.value < 1000)
            .reduce((sum, t, _, arr) => sum + t.value / arr.length, 0);
          if (avgRising > 50) {
            trend = 'rising';
            growth = `+${Math.round(avgRising)}%`;
          }
        }
      }
    }

    // Regiones
    const topRegions = {};
    const subregions = item.interestBySubregion || [];
    const cities = item.interestByCity || [];

    if (subregions.length > 0) {
      subregions.slice(0, 5).forEach(r => {
        topRegions[r.geoName || r.name || 'Unknown'] = r.value?.[0] || r.value || 0;
      });
    } else if (cities.length > 0) {
      cities.slice(0, 5).forEach(c => {
        topRegions[c.geoName || c.name || 'Unknown'] = c.value?.[0] || c.value || 0;
      });
    }

    // Rising queries
    const risingQueries = [];
    if (item.relatedQueries_rising?.length > 0) {
      risingQueries.push(...item.relatedQueries_rising.slice(0, 5).map(q => q.query));
    } else if (risingTopics.length > 0) {
      risingQueries.push(...risingTopics.slice(0, 5).map(t => t.topic?.title).filter(Boolean));
    }

    // Related topics formateados
    const relatedTopics = topTopics.slice(0, 5).map(t => ({
      title: t.topic?.title || '',
      type: t.topic?.type || '',
      value: t.value || 0
    }));

    return {
      keyword,
      average_interest: avgInterest,
      trend,
      peak_score: peakScore,
      growth_3m: growth,
      top_regions: topRegions,
      rising_queries: risingQueries,
      related_topics: relatedTopics
    };
  });

  // Ordenar por interés
  keywords.sort((a, b) => b.average_interest - a.average_interest);

  console.log(`   ✅ ${keywords.length} keywords procesados`);

  return {
    timestamp: new Date().toISOString(),
    region: clientConfig.region,
    category: clientConfig.category,
    source: 'Google Trends via Apify',
    client: `${clientConfig.client} - ${clientConfig.clientFullName}`,
    keywords,
    metadata: {
      method: 'Apify apify/google-trends-scraper',
      note: 'Datos reales de Google Trends - Últimos 30 días',
      timeframe: clientConfig.timeRange,
      keywords_requested: clientConfig.keywords.length,
      keywords_received: keywords.length,
      ...clientConfig.metadata
    }
  };
}

// ============================================================================
// GUARDAR RESULTADOS
// ============================================================================
async function saveResults(data) {
  const dataDir = path.join(__dirname, '../data/trends');
  const publicDir = path.join(__dirname, '../public/data/trends');

  await fs.mkdir(dataDir, { recursive: true });
  await fs.mkdir(publicDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const jsonData = JSON.stringify(data, null, 2);

  // Guardar con timestamp (backup)
  await fs.writeFile(path.join(dataDir, `trends_${timestamp}.json`), jsonData);

  // Guardar como latest (el que lee el frontend)
  await fs.writeFile(path.join(dataDir, 'latest.json'), jsonData);
  await fs.writeFile(path.join(publicDir, 'latest.json'), jsonData);

  console.log('\n💾 Archivos guardados:');
  console.log(`   📁 data/trends/trends_${timestamp}.json`);
  console.log(`   📁 data/trends/latest.json`);
  console.log(`   📁 public/data/trends/latest.json ◄── Frontend lee este`);

  // Resumen
  console.log('\n📊 Resumen:');
  data.keywords.forEach(kw => {
    const icon = kw.trend === 'rising' ? '↑' : kw.trend === 'falling' ? '↓' : '→';
    console.log(`   ${icon} ${kw.keyword}: ${kw.average_interest}/100 (${kw.growth_3m})`);
  });
}

// ============================================================================
// MAIN
// ============================================================================
async function main() {
  const options = parseArgs();

  console.log('🚀 Google Trends Scraper (Solo Apify)');
  console.log(`   Cliente: ${options.client}`);
  console.log(`   Fecha: ${new Date().toLocaleString('es-PE')}`);

  try {
    const clientConfig = await loadClientConfig(options.client);
    await scrapeGoogleTrends(clientConfig);
    console.log('\n✅ Scraping completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Error fatal: ${error.message}`);
    process.exit(1);
  }
}

main();
