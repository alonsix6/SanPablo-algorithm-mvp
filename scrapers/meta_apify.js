#!/usr/bin/env node
/**
 * Meta/Facebook Social Listening Scraper - Apify
 *
 * Ejecuta el actor custom social-listening-meta para obtener:
 * - Menciones por topic
 * - Engagement scores
 * - Sentimiento
 * - Crecimiento
 *
 * Uso:
 *   node meta_apify.js --client=ucsp
 *
 * Requisitos:
 *   1. Subir el actor a Apify: cd apify-actors/social-listening-meta && apify push
 *   2. Configurar APIFY_ACTOR_META en .env con tu username/actor-name
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

// Actor ID - Custom social listening actor
// Formato: "username/actor-name"
const ACTOR_ID = process.env.APIFY_ACTOR_META || 'globular_cinema/my-actor';

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
async function scrapeMetaSocialListening(clientConfig) {
  console.log(`\n📘 Meta/Facebook Social Listening - ${clientConfig.client}`);
  console.log('='.repeat(50));

  if (!APIFY_TOKEN) {
    console.error('\n❌ ERROR: APIFY_TOKEN no configurado');
    process.exit(1);
  }

  // Verificar si estamos usando el actor custom o el genérico
  // El actor custom puede ser social-listening-meta o globular_cinema/my-actor
  const isCustomActor = ACTOR_ID.includes('social-listening-meta') ||
                        ACTOR_ID.includes('globular_cinema/my-actor') ||
                        ACTOR_ID.includes('globular_cinema~my-actor');
  console.log(`🎯 Actor: ${ACTOR_ID}`);
  console.log(`   Tipo: ${isCustomActor ? 'Custom Social Listening' : 'Facebook Posts Scraper'}`);

  // Páginas de Facebook del config
  const facebookPages = clientConfig.facebook_pages || [];

  if (facebookPages.length === 0) {
    console.log('\n⚠️ No hay páginas de Facebook configuradas');
    console.log('   Agrega "facebook_pages" al config del cliente');
    const emptyData = createEmptyData(clientConfig);
    await saveResults(emptyData);
    return emptyData;
  }

  console.log(`📍 Páginas a analizar: ${facebookPages.length}`);
  facebookPages.forEach(p => console.log(`   - ${p}`));

  const client = new ApifyClient({ token: APIFY_TOKEN });

  // Input dependiendo del tipo de actor
  let input;

  if (isCustomActor) {
    // Input para actor custom social-listening-meta
    input = {
      clientName: clientConfig.client,
      clientFullName: clientConfig.clientFullName,
      facebookPages: facebookPages,
      topics: clientConfig.social_listening_topics || getDefaultTopics(clientConfig),
      maxPostsPerPage: clientConfig.meta?.maxPostsPerPage || 50,
      includeComments: clientConfig.meta?.includeComments !== false,
      maxCommentsPerPost: clientConfig.meta?.maxCommentsPerPost || 20,
      timeframeDays: clientConfig.meta?.timeframeDays || 30,
      language: clientConfig.meta?.language || 'es'
    };
  } else {
    // Input para actor genérico apify/facebook-posts-scraper
    input = {
      startUrls: facebookPages.map(url => ({ url })),
      maxPosts: 30,
      maxComments: 10,
      commentsMode: 'RANKED_UNFILTERED'
    };
  }

  console.log(`\n📤 Input para Apify:`);
  console.log(JSON.stringify(input, null, 2));

  try {
    console.log('\n🚀 Iniciando actor de Apify...');
    const run = await client.actor(ACTOR_ID).start(input);
    console.log(`   Run ID: ${run.id}`);

    console.log('\n⏳ Esperando que termine (máx 10 min)...');
    const finishedRun = await client.run(run.id).waitForFinish({
      waitSecs: 600
    });

    if (finishedRun.status !== 'SUCCEEDED') {
      throw new Error(`Actor terminó con estado: ${finishedRun.status}`);
    }

    console.log(`\n✅ Actor completado`);

    const { items } = await client.dataset(finishedRun.defaultDatasetId).listItems();
    console.log(`📊 Items obtenidos: ${items.length}`);

    // El actor custom ya retorna el formato correcto
    let data;
    if (isCustomActor && items.length > 0) {
      // El actor custom retorna un solo objeto con toda la data
      data = items[0];
      console.log(`   Topics analizados: ${data.aggregatedTopics?.length || 0}`);
    } else {
      // Transformar datos del actor genérico
      data = transformGenericData(items, clientConfig);
    }

    await saveResults(data);
    return data;

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    throw error;
  }
}

// ============================================================================
// TOPICS DEFAULT PARA EDUCACIÓN
// ============================================================================
function getDefaultTopics(clientConfig) {
  // Topics default si no están configurados
  return [
    {
      name: "Admisión",
      keywords: ["admisión", "admision", "postular", "postulación", "examen de admisión", "ingreso", "vacantes"],
      brands: []
    },
    {
      name: "Becas y Financiamiento",
      keywords: ["beca", "becas", "descuento", "financiamiento", "apoyo económico", "pensión"],
      brands: ["PRONABEC", "Beca 18"]
    },
    {
      name: "Carreras",
      keywords: ["carrera", "carreras", "ingeniería", "medicina", "derecho", "arquitectura", "psicología"],
      brands: []
    },
    {
      name: "Vida Universitaria",
      keywords: ["campus", "estudiante", "universitario", "universidad", "clases", "semestre"],
      brands: []
    },
    {
      name: "Investigación",
      keywords: ["investigación", "proyecto", "tesis", "publicación", "congreso", "ciencia"],
      brands: []
    }
  ];
}

// ============================================================================
// TRANSFORMAR DATOS DEL ACTOR GENÉRICO
// ============================================================================
function transformGenericData(items, clientConfig) {
  console.log('\n🔄 Transformando datos del actor genérico...');

  const pages = [];
  const topicCounts = {};

  // Agrupar por página
  const postsByPage = {};

  items.forEach(post => {
    const pageName = post.pageName || post.authorName || 'Unknown Page';

    if (!postsByPage[pageName]) {
      postsByPage[pageName] = [];
    }
    postsByPage[pageName].push(post);

    // Extraer topics de los textos
    const text = (post.text || post.message || '').toLowerCase();
    const topics = extractTopicsFromText(text);
    topics.forEach(topic => {
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    });
  });

  // Construir datos por página
  Object.entries(postsByPage).forEach(([pageName, posts]) => {
    const totalReactions = posts.reduce((sum, p) => sum + (p.reactions || p.likesCount || 0), 0);
    const totalComments = posts.reduce((sum, p) => sum + (p.comments || p.commentsCount || 0), 0);
    const totalShares = posts.reduce((sum, p) => sum + (p.shares || p.sharesCount || 0), 0);

    pages.push({
      name: pageName,
      source: 'Facebook Public Page',
      posts_analyzed: posts.length,
      total_reactions: totalReactions,
      total_comments: totalComments,
      total_shares: totalShares,
      avg_engagement: posts.length > 0 ? Math.round((totalReactions + totalComments + totalShares) / posts.length) : 0,
      top_posts: posts.slice(0, 3).map(p => ({
        text: (p.text || p.message || '').substring(0, 100) + '...',
        reactions: p.reactions || p.likesCount || 0,
        comments: p.comments || p.commentsCount || 0,
        date: p.time || p.timestamp || 'Unknown'
      }))
    });
  });

  // Top topics agregados
  const aggregatedTopics = Object.entries(topicCounts)
    .map(([topic, count]) => ({
      topic,
      mentions: count,
      engagement_score: Math.min(10, count / 2),
      growth: '+0%',
      sentiment: 'neutral',
      top_brands: [],
      avg_reactions: 0,
      avg_comments: 0,
      avg_shares: 0
    }))
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 10);

  console.log(`   ✅ Páginas: ${pages.length}`);
  console.log(`   ✅ Topics: ${aggregatedTopics.length}`);

  return {
    timestamp: new Date().toISOString(),
    source: 'Meta/Facebook via Apify',
    region: clientConfig.region,
    category: 'Social Listening',
    client: `${clientConfig.client} - ${clientConfig.clientFullName}`,
    pages,
    aggregatedTopics,
    metadata: {
      method: `Apify ${ACTOR_ID}`,
      note: 'Datos de páginas públicas de Facebook',
      timeframe: 'Last 30 days',
      posts_fetched: items.length
    }
  };
}

function extractTopicsFromText(text) {
  const topics = [];
  const keywords = {
    'Admisión': ['admisión', 'admision', 'postular', 'examen'],
    'Becas': ['beca', 'becas', 'descuento'],
    'Carreras': ['carrera', 'ingeniería', 'medicina', 'derecho'],
    'Universidad': ['universidad', 'campus', 'estudiante'],
    'Matrícula': ['matricula', 'matrícula', 'pregrado', 'posgrado']
  };

  Object.entries(keywords).forEach(([topic, kws]) => {
    if (kws.some(kw => text.includes(kw))) {
      topics.push(topic);
    }
  });

  return topics;
}

function createEmptyData(clientConfig) {
  return {
    timestamp: new Date().toISOString(),
    source: 'Meta/Facebook Social Listening',
    region: clientConfig.region,
    category: 'Social Listening',
    client: `${clientConfig.client} - ${clientConfig.clientFullName}`,
    pages: [],
    aggregatedTopics: [],
    metadata: {
      method: `Apify ${ACTOR_ID}`,
      note: 'No hay páginas de Facebook configuradas. Agrega facebook_pages al config.',
      posts_fetched: 0
    }
  };
}

// ============================================================================
// GUARDAR RESULTADOS
// ============================================================================
async function saveResults(data) {
  const dataDir = path.join(__dirname, '../data/meta');
  const publicDir = path.join(__dirname, '../public/data/meta');

  await fs.mkdir(dataDir, { recursive: true });
  await fs.mkdir(publicDir, { recursive: true });

  const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const jsonData = JSON.stringify(data, null, 2);

  await fs.writeFile(path.join(dataDir, `meta_${timestamp}.json`), jsonData);
  await fs.writeFile(path.join(dataDir, 'latest.json'), jsonData);
  await fs.writeFile(path.join(publicDir, 'latest.json'), jsonData);

  console.log('\n💾 Archivos guardados:');
  console.log(`   📁 data/meta/meta_${timestamp}.json`);
  console.log(`   📁 data/meta/latest.json`);
  console.log(`   📁 public/data/meta/latest.json`);

  if (data.aggregatedTopics && data.aggregatedTopics.length > 0) {
    console.log('\n📊 Resultados por Topic:');
    data.aggregatedTopics.slice(0, 5).forEach((t, i) => {
      const sentiment = t.sentiment || 'neutral';
      console.log(`   ${i + 1}. ${t.topic}: ${t.mentions} menciones, ${t.engagement_score}/10 eng, ${sentiment}`);
    });
  }
}

// ============================================================================
// MAIN
// ============================================================================
async function main() {
  const options = parseArgs();

  console.log('📘 Meta/Facebook Social Listening (Apify)');
  console.log(`   Cliente: ${options.client}`);

  try {
    const clientConfig = await loadClientConfig(options.client);
    await scrapeMetaSocialListening(clientConfig);
    console.log('\n✅ Scraping completado');
    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Error fatal: ${error.message}`);
    process.exit(1);
  }
}

main();
