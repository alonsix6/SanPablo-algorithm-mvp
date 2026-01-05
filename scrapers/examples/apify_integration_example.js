#!/usr/bin/env node
/**
 * UCSP Algorithm - Ejemplo de Integración con Apify
 *
 * Este archivo muestra cómo integrar los scrapers con Apify
 * para obtener datos reales de TikTok, Facebook e Instagram.
 *
 * INSTRUCCIONES:
 * 1. Crear cuenta en https://apify.com/
 * 2. Obtener API token desde Settings > Integrations
 * 3. Agregar APIFY_TOKEN al archivo .env
 * 4. npm install apify-client
 * 5. Ejecutar: node examples/apify_integration_example.js
 */

import { ApifyClient } from 'apify-client';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración
const APIFY_TOKEN = process.env.APIFY_TOKEN;

if (!APIFY_TOKEN) {
  console.error('ERROR: APIFY_TOKEN no está configurado');
  console.error('Agrega APIFY_TOKEN=tu_token al archivo .env');
  process.exit(1);
}

const client = new ApifyClient({ token: APIFY_TOKEN });

// ===========================================================================
// TIKTOK SCRAPER CON APIFY
// Actor: clockworks/tiktok-scraper
// Docs: https://apify.com/clockworks/tiktok-scraper
// ===========================================================================
async function scrapeTikTokWithApify() {
  console.log('🎵 Iniciando scraping de TikTok con Apify...');

  const hashtags = [
    'ucsp',
    'admision2026',
    'universidad',
    'vidauniversitaria',
    'arequipa',
    'estudiaenperu',
    'ingenieria',
    'medicina',
    'derecho',
    'becas'
  ];

  try {
    // Ejecutar el actor de TikTok
    const run = await client.actor('clockworks/tiktok-scraper').call({
      hashtags: hashtags,
      resultsPerPage: 30,           // Posts por hashtag
      maxRequestsPerCrawl: 100,     // Límite total de requests
      proxy: {
        useApifyProxy: true,
        apifyProxyGroups: ['RESIDENTIAL']  // Proxies residenciales para evitar bloqueos
      }
    });

    console.log(`✅ Actor ejecutado. Run ID: ${run.id}`);

    // Obtener resultados del dataset
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    console.log(`📊 Resultados obtenidos: ${items.length} posts`);

    // Transformar datos al formato esperado por el frontend
    const transformedData = transformTikTokData(items, hashtags);

    return transformedData;

  } catch (error) {
    console.error('❌ Error en TikTok scraper:', error.message);
    throw error;
  }
}

function transformTikTokData(items, hashtags) {
  // Agrupar por hashtag y calcular métricas
  const hashtagStats = {};

  items.forEach(post => {
    const postHashtags = post.hashtags || [];
    postHashtags.forEach(tag => {
      const normalizedTag = `#${tag.toLowerCase()}`;
      if (!hashtagStats[normalizedTag]) {
        hashtagStats[normalizedTag] = {
          hashtag: normalizedTag,
          views: 0,
          posts: 0,
          totalLikes: 0,
          totalShares: 0,
          region: 'Peru'
        };
      }
      hashtagStats[normalizedTag].views += post.playCount || 0;
      hashtagStats[normalizedTag].posts += 1;
      hashtagStats[normalizedTag].totalLikes += post.diggCount || 0;
      hashtagStats[normalizedTag].totalShares += post.shareCount || 0;
    });
  });

  // Convertir a formato del frontend
  const hashtagsArray = Object.values(hashtagStats)
    .map(stat => ({
      hashtag: stat.hashtag,
      views: formatNumber(stat.views),
      posts: formatNumber(stat.posts),
      growth: '+N/A%',  // Requiere histórico para calcular
      relevanceScore: calculateRelevanceScore(stat),
      region: stat.region,
      category: categorizeHashtag(stat.hashtag)
    }))
    .sort((a, b) => b.relevanceScore - a.relevanceScore);

  return {
    timestamp: new Date().toISOString(),
    source: 'TikTok via Apify',
    region: 'PE',
    category: 'Education',
    client: 'UCSP - Universidad Católica San Pablo',
    trends: {
      hashtags: hashtagsArray,
      sounds: [],
      creators: []
    },
    metadata: {
      method: 'Apify clockworks/tiktok-scraper',
      updateFrequency: 'Weekly',
      lastUpdate: new Date().toISOString().split('T')[0],
      totalPostsAnalyzed: items.length
    }
  };
}

// ===========================================================================
// FACEBOOK/INSTAGRAM SCRAPER CON APIFY
// Actor: apify/facebook-pages-scraper
// Docs: https://apify.com/apify/facebook-pages-scraper
// ===========================================================================
async function scrapeMetaWithApify() {
  console.log('📘 Iniciando scraping de Facebook con Apify...');

  const pageUrls = [
    'https://www.facebook.com/UCatolicaSanPablo',    // Página oficial UCSP
    'https://www.facebook.com/admisionucsp',         // Admisión UCSP
    // Agregar más páginas relevantes
  ];

  try {
    const run = await client.actor('apify/facebook-pages-scraper').call({
      startUrls: pageUrls.map(url => ({ url })),
      maxPosts: 50,                    // Posts por página
      maxPostComments: 10,             // Comentarios por post
      maxReviews: 0,                   // No necesitamos reviews
      proxy: {
        useApifyProxy: true,
        apifyProxyGroups: ['RESIDENTIAL']
      }
    });

    console.log(`✅ Actor ejecutado. Run ID: ${run.id}`);

    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    console.log(`📊 Resultados obtenidos: ${items.length} posts`);

    const transformedData = transformMetaData(items);

    return transformedData;

  } catch (error) {
    console.error('❌ Error en Meta scraper:', error.message);
    throw error;
  }
}

function transformMetaData(items) {
  // Analizar posts y extraer temas
  const topicAnalysis = {};

  items.forEach(post => {
    const text = (post.text || '').toLowerCase();

    // Identificar temas basados en keywords
    const topicKeywords = {
      'Admisión UCSP 2026': ['admisión', 'admision', '2026', 'postula', 'inscripción'],
      'Carreras con mayor demanda': ['carrera', 'ingeniería', 'medicina', 'derecho'],
      'Becas y financiamiento': ['beca', 'financiamiento', 'descuento', 'ayuda'],
      'Vida universitaria UCSP': ['vida', 'campus', 'actividad', 'evento'],
      'Examen de admisión': ['examen', 'prueba', 'evaluación', 'fecha'],
    };

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(kw => text.includes(kw))) {
        if (!topicAnalysis[topic]) {
          topicAnalysis[topic] = {
            topic,
            mentions: 0,
            totalReactions: 0,
            totalComments: 0,
            totalShares: 0,
            sentiments: []
          };
        }
        topicAnalysis[topic].mentions += 1;
        topicAnalysis[topic].totalReactions += post.likes || 0;
        topicAnalysis[topic].totalComments += post.comments || 0;
        topicAnalysis[topic].totalShares += post.shares || 0;
      }
    });
  });

  // Convertir a formato del frontend
  const aggregatedTopics = Object.values(topicAnalysis)
    .map(topic => ({
      topic: topic.topic,
      mentions: topic.mentions,
      engagement_score: calculateEngagementScore(topic),
      growth: '+N/A%',
      sentiment: analyzeSentiment(topic),
      top_brands: ['UCSP'],
      avg_reactions: Math.round(topic.totalReactions / topic.mentions),
      avg_comments: Math.round(topic.totalComments / topic.mentions),
      avg_shares: Math.round(topic.totalShares / topic.mentions)
    }))
    .sort((a, b) => b.engagement_score - a.engagement_score);

  return {
    timestamp: new Date().toISOString(),
    source: 'Meta/Facebook via Apify',
    region: 'Peru',
    category: 'Education',
    client: 'UCSP - Universidad Católica San Pablo',
    pages: [],
    aggregatedTopics,
    metadata: {
      method: 'Apify apify/facebook-pages-scraper',
      dataType: 'Public page posts analysis',
      updateFrequency: 'Weekly',
      lastUpdate: new Date().toISOString().split('T')[0],
      totalPostsAnalyzed: items.length
    }
  };
}

// ===========================================================================
// UTILIDADES
// ===========================================================================
function formatNumber(num) {
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toString();
}

function calculateRelevanceScore(stat) {
  // Score basado en views, posts y engagement
  const viewScore = Math.min(stat.views / 1e6, 50);
  const postScore = Math.min(stat.posts * 2, 30);
  const engagementScore = Math.min((stat.totalLikes + stat.totalShares) / stat.posts / 100, 20);
  return Math.round(viewScore + postScore + engagementScore);
}

function calculateEngagementScore(topic) {
  const avgEngagement = (topic.totalReactions + topic.totalComments * 2 + topic.totalShares * 3) / topic.mentions;
  return Math.min(Math.round(avgEngagement / 100), 10);
}

function categorizeHashtag(hashtag) {
  const categories = {
    Education: ['universidad', 'admision', 'estudia', 'postulantes', 'becas'],
    Career: ['ingenieria', 'medicina', 'derecho', 'arquitectura'],
    Location: ['arequipa', 'peru', 'puno', 'cusco'],
    UCSP: ['ucsp', 'sanpablo']
  };

  const tag = hashtag.toLowerCase();
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(kw => tag.includes(kw))) {
      return category;
    }
  }
  return 'General';
}

function analyzeSentiment(topic) {
  // Análisis simple basado en engagement rate
  const engagementRate = (topic.totalReactions + topic.totalComments) / topic.mentions;
  if (engagementRate > 500) return 'very positive';
  if (engagementRate > 200) return 'positive';
  if (engagementRate > 50) return 'neutral';
  return 'low engagement';
}

// ===========================================================================
// GUARDAR RESULTADOS
// ===========================================================================
async function saveResults(data, type) {
  const outputDir = path.join(__dirname, '../../data', type);
  await fs.mkdir(outputDir, { recursive: true });

  const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const outputFile = path.join(outputDir, `${type}_${timestamp}.json`);

  await fs.writeFile(outputFile, JSON.stringify(data, null, 2));
  await fs.writeFile(
    path.join(outputDir, 'latest.json'),
    JSON.stringify(data, null, 2)
  );

  // También copiar a public/data
  const publicDir = path.join(__dirname, '../../public/data', type);
  await fs.mkdir(publicDir, { recursive: true });
  await fs.writeFile(
    path.join(publicDir, 'latest.json'),
    JSON.stringify(data, null, 2)
  );

  console.log(`✅ Datos guardados en ${outputFile}`);
}

// ===========================================================================
// EJECUCIÓN PRINCIPAL
// ===========================================================================
async function main() {
  console.log('🚀 UCSP Algorithm - Scraping con Apify\n');
  console.log('='.repeat(50));

  try {
    // TikTok
    console.log('\n📱 Ejecutando TikTok Scraper...');
    const tiktokData = await scrapeTikTokWithApify();
    await saveResults(tiktokData, 'tiktok');
    console.log(`   ✅ ${tiktokData.trends.hashtags.length} hashtags procesados\n`);

    // Meta/Facebook
    console.log('\n📘 Ejecutando Meta Scraper...');
    const metaData = await scrapeMetaWithApify();
    await saveResults(metaData, 'meta');
    console.log(`   ✅ ${metaData.aggregatedTopics.length} temas procesados\n`);

    console.log('='.repeat(50));
    console.log('✅ Scraping completado exitosamente');

  } catch (error) {
    console.error('\n❌ Error durante el scraping:', error.message);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
main();
