#!/usr/bin/env node
/**
 * TikTok Trends Scraper - Apify
 *
 * Obtiene tendencias reales de TikTok via Apify.
 * Actor: clockworks/tiktok-trends-scraper
 *
 * Uso:
 *   node tiktok_apify.js --client=ucsp
 *
 * Documentación completa: docs/APIFY_SCRAPERS.md
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
const ACTOR_ID = 'clockworks/tiktok-trends-scraper';

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
async function scrapeTikTokTrends(clientConfig) {
  console.log(`\n🎵 TikTok Trends Scraper - ${clientConfig.client}`);
  console.log('='.repeat(50));
  console.log(`📍 País: ${clientConfig.region}`);
  console.log(`📊 Industria: ${clientConfig.tiktok?.industry || 'Education'}`);
  console.log('='.repeat(50));

  if (!APIFY_TOKEN) {
    console.error('\n❌ ERROR: APIFY_TOKEN no configurado');
    process.exit(1);
  }

  const client = new ApifyClient({ token: APIFY_TOKEN });

  // Input para TikTok Trends Scraper (formato correcto del actor)
  const input = {
    // Configuración general
    adsCountryCode: clientConfig.region || 'PE',
    adsTimeRange: clientConfig.tiktok?.timeRange || '30',  // 7, 30, 120 días
    resultsPerPage: clientConfig.tiktok?.resultsPerPage || 20,

    // Qué scrapear
    adsScrapeHashtags: true,
    adsScrapeSounds: true,
    adsScrapeCreators: false,
    adsScrapeVideos: false,

    // Filtros de industria (para hashtags)
    adsHashtagIndustry: clientConfig.tiktok?.industry || 'Education',

    // Configuración de países para cada tipo
    adsSoundsCountryCode: clientConfig.region || 'PE',
    adsCreatorsCountryCode: clientConfig.region || 'PE',
    adsVideosCountryCode: clientConfig.region || 'PE',

    // Ordenamiento
    adsRankType: 'popular',
    adsSortCreatorsBy: 'follower',
    adsSortVideosBy: 'vv',

    // Otros
    adsApprovedForBusinessUse: false,
    adsNewOnBoard: false
  };

  console.log(`\n📤 Input para Apify:`);
  console.log(JSON.stringify(input, null, 2));

  try {
    console.log('\n🚀 Iniciando actor de Apify...');
    const run = await client.actor(ACTOR_ID).start(input);
    console.log(`   Run ID: ${run.id}`);

    console.log('\n⏳ Esperando que termine (máx 5 min)...');
    const finishedRun = await client.run(run.id).waitForFinish({
      waitSecs: 300
    });

    if (finishedRun.status !== 'SUCCEEDED') {
      throw new Error(`Actor terminó con estado: ${finishedRun.status}`);
    }

    console.log(`\n✅ Actor completado`);

    const { items } = await client.dataset(finishedRun.defaultDatasetId).listItems();
    console.log(`📊 Items obtenidos: ${items.length}`);

    const data = transformData(items, clientConfig);
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
function transformData(items, clientConfig) {
  console.log('\n🔄 Transformando datos...');

  const trends = {
    hashtags: [],
    sounds: [],
    creators: []
  };

  items.forEach(item => {
    // El actor retorna items con un campo "type" o estructura específica

    // Hashtags (tienen hashtagName o similar)
    if (item.hashtagName || item.hashtag || (item.type === 'hashtag')) {
      trends.hashtags.push({
        hashtag: `#${(item.hashtagName || item.hashtag || item.name || '').replace(/^#/, '')}`,
        views: formatNumber(item.videoViews || item.views || 0),
        posts: formatNumber(item.publishCnt || item.posts || item.videoCount || 0),
        growth: item.trend || '+0%',
        relevanceScore: item.rank ? Math.max(100 - item.rank * 2, 50) : 85,
        region: clientConfig.region,
        category: item.industry || clientConfig.tiktok?.industry || 'Education',
        isPromoted: item.isPromoted || false
      });
    }

    // Sonidos/Música (tienen soundName o musicTitle)
    if (item.soundName || item.musicTitle || item.title || (item.type === 'sound')) {
      // Solo agregar si parece ser un sonido (no un hashtag)
      if (!item.hashtagName && !item.hashtag) {
        trends.sounds.push({
          soundName: item.soundName || item.musicTitle || item.title || 'Unknown',
          author: item.authorName || item.artist || item.author || 'Unknown',
          usage: formatNumber(item.useCnt || item.videoCount || item.usage || 0),
          growth: item.trend || '+0%',
          duration: item.duration || 0,
          category: 'Music'
        });
      }
    }

    // Creadores (tienen uniqueId o creatorName)
    if (item.uniqueId || item.creatorName || (item.type === 'creator')) {
      trends.creators.push({
        username: `@${(item.uniqueId || item.creatorName || item.name || '').replace(/^@/, '')}`,
        followers: formatNumber(item.followerCnt || item.followers || 0),
        likes: formatNumber(item.likeCnt || item.likes || 0),
        engagement: item.engagementRate || '0%',
        category: item.industry || 'General'
      });
    }
  });

  // Si no se categorizaron bien, intentar inferir del contenido
  if (trends.hashtags.length === 0 && trends.sounds.length === 0 && items.length > 0) {
    console.log('   ⚠️ Intentando inferir tipos de items...');
    items.forEach((item, idx) => {
      // Si tiene videoViews alto, probablemente es hashtag
      if (item.videoViews || item.publishCnt) {
        trends.hashtags.push({
          hashtag: `#${(item.hashtagName || item.name || `trend${idx}`).replace(/^#/, '')}`,
          views: formatNumber(item.videoViews || 0),
          posts: formatNumber(item.publishCnt || 0),
          growth: '+0%',
          relevanceScore: 100 - idx * 5,
          region: clientConfig.region,
          category: 'Education'
        });
      }
      // Si tiene useCnt, probablemente es sonido
      else if (item.useCnt || item.duration) {
        trends.sounds.push({
          soundName: item.soundName || item.title || `Sound ${idx}`,
          author: item.authorName || 'Unknown',
          usage: formatNumber(item.useCnt || 0),
          growth: '+0%',
          category: 'Music'
        });
      }
    });
  }

  console.log(`   ✅ Hashtags: ${trends.hashtags.length}`);
  console.log(`   ✅ Sounds: ${trends.sounds.length}`);
  console.log(`   ✅ Creators: ${trends.creators.length}`);

  return {
    timestamp: new Date().toISOString(),
    source: 'TikTok Trends via Apify',
    region: clientConfig.region,
    category: clientConfig.tiktok?.industry || 'Education',
    client: `${clientConfig.client} - ${clientConfig.clientFullName}`,
    trends,
    metadata: {
      method: 'Apify clockworks/tiktok-trends-scraper',
      note: 'Datos reales de TikTok Creative Center',
      timeframe: `Last ${clientConfig.tiktok?.timeRange || 30} days`,
      industry: clientConfig.tiktok?.industry || 'Education',
      items_fetched: items.length
    }
  };
}

function formatNumber(num) {
  if (!num) return '0';
  if (typeof num === 'string') return num;

  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toString();
}

// ============================================================================
// GUARDAR RESULTADOS
// ============================================================================
async function saveResults(data) {
  const dataDir = path.join(__dirname, '../data/tiktok');
  const publicDir = path.join(__dirname, '../public/data/tiktok');

  await fs.mkdir(dataDir, { recursive: true });
  await fs.mkdir(publicDir, { recursive: true });

  const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const jsonData = JSON.stringify(data, null, 2);

  await fs.writeFile(path.join(dataDir, `tiktok_${timestamp}.json`), jsonData);
  await fs.writeFile(path.join(dataDir, 'latest.json'), jsonData);
  await fs.writeFile(path.join(publicDir, 'latest.json'), jsonData);

  console.log('\n💾 Archivos guardados:');
  console.log(`   📁 data/tiktok/tiktok_${timestamp}.json`);
  console.log(`   📁 data/tiktok/latest.json`);
  console.log(`   📁 public/data/tiktok/latest.json`);

  // Top hashtags
  if (data.trends.hashtags.length > 0) {
    console.log('\n🔥 Top Hashtags:');
    data.trends.hashtags.slice(0, 5).forEach((h, i) => {
      console.log(`   ${i + 1}. ${h.hashtag}: ${h.views} views`);
    });
  }

  // Top sounds
  if (data.trends.sounds.length > 0) {
    console.log('\n🎵 Top Sounds:');
    data.trends.sounds.slice(0, 3).forEach((s, i) => {
      console.log(`   ${i + 1}. ${s.soundName}: ${s.usage} uses`);
    });
  }
}

// ============================================================================
// MAIN
// ============================================================================
async function main() {
  const options = parseArgs();

  console.log('🎵 TikTok Trends Scraper (Apify)');
  console.log(`   Cliente: ${options.client}`);

  try {
    const clientConfig = await loadClientConfig(options.client);
    await scrapeTikTokTrends(clientConfig);
    console.log('\n✅ Scraping completado');
    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Error fatal: ${error.message}`);
    process.exit(1);
  }
}

main();
