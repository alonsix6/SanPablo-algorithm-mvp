#!/usr/bin/env node
/**
 * Weekly ML Pipeline
 *
 * Runs all ML models and generates predictions/insights.
 * Called by GitHub Actions after data scraping.
 *
 * Usage:
 *   node ml/pipeline/weekly_pipeline.js
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Import ML models
import SentimentAnalyzer from '../models/sentiment_analyzer.js';
import BudgetOptimizer from '../models/budget_optimizer.js';
import InsightGenerator from '../insights/generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../../public/data');
const ML_OUTPUT_DIR = path.join(__dirname, '../../public/data/ml');

// ============================================================================
// DATA LOADING
// ============================================================================

async function loadAllData() {
  console.log('\n📂 Cargando datos...');

  const data = {};

  try {
    // Load Google Trends
    const trendsPath = path.join(DATA_DIR, 'trends/latest.json');
    data.trends = JSON.parse(await fs.readFile(trendsPath, 'utf-8'));
    console.log(`   ✅ Google Trends: ${data.trends.keywords?.length || 0} keywords`);
  } catch (e) {
    console.log('   ⚠️ Google Trends: No disponible');
    data.trends = null;
  }

  try {
    // Load TikTok
    const tiktokPath = path.join(DATA_DIR, 'tiktok/latest.json');
    data.tiktok = JSON.parse(await fs.readFile(tiktokPath, 'utf-8'));
    console.log(`   ✅ TikTok: ${data.tiktok.trends?.hashtags?.length || 0} hashtags`);
  } catch (e) {
    console.log('   ⚠️ TikTok: No disponible');
    data.tiktok = null;
  }

  try {
    // Load Meta
    const metaPath = path.join(DATA_DIR, 'meta/latest.json');
    data.meta = JSON.parse(await fs.readFile(metaPath, 'utf-8'));
    console.log(`   ✅ Meta: ${data.meta.aggregatedTopics?.length || 0} topics`);
  } catch (e) {
    console.log('   ⚠️ Meta: No disponible');
    data.meta = null;
  }

  try {
    // Load GA4 (mock or real)
    const ga4Path = path.join(DATA_DIR, 'mock/ga4_data.json');
    data.ga4 = JSON.parse(await fs.readFile(ga4Path, 'utf-8'));
    console.log(`   ✅ GA4: ${data.ga4.overview?.totalUsers?.toLocaleString() || 0} usuarios`);
  } catch (e) {
    console.log('   ⚠️ GA4: No disponible');
    data.ga4 = null;
  }

  return data;
}

// ============================================================================
// SENTIMENT ANALYSIS
// ============================================================================

function runSentimentAnalysis(metaData) {
  console.log('\n🧠 Ejecutando análisis de sentimiento...');

  const analyzer = new SentimentAnalyzer();
  const results = {
    overall: null,
    by_topic: {},
    timestamp: new Date().toISOString()
  };

  if (!metaData?.aggregatedTopics) {
    console.log('   ⚠️ Sin datos de Meta para análisis');
    return results;
  }

  // Analyze each topic
  const topics = metaData.aggregatedTopics;
  let totalScore = 0;
  let topicCount = 0;

  topics.forEach(topic => {
    // Use existing sentiment if available, or analyze topic name
    let sentimentScore;

    if (topic.sentiment) {
      // Convert category to score
      const categoryToScore = {
        'muy_positivo': 0.9,
        'very positive': 0.9,
        'positivo': 0.7,
        'positive': 0.7,
        'neutral': 0.5,
        'negativo': 0.3,
        'negative': 0.3,
        'muy_negativo': 0.1,
        'very negative': 0.1
      };
      sentimentScore = categoryToScore[topic.sentiment.toLowerCase()] || 0.5;
    } else {
      // Analyze topic name
      const analysis = analyzer.analyze(topic.topic);
      sentimentScore = analysis.score;
    }

    results.by_topic[topic.topic] = {
      score: sentimentScore,
      category: analyzer.categorize(sentimentScore),
      mentions: topic.mentions || 0,
      engagement: topic.engagement_score || 0
    };

    totalScore += sentimentScore;
    topicCount++;
  });

  // Calculate overall
  results.overall = {
    score: topicCount > 0 ? totalScore / topicCount : 0.5,
    category: analyzer.categorize(topicCount > 0 ? totalScore / topicCount : 0.5),
    topics_analyzed: topicCount
  };

  console.log(`   ✅ Sentimiento overall: ${results.overall.category} (${(results.overall.score * 10).toFixed(1)}/10)`);

  return results;
}

// ============================================================================
// SCORE CALCULATION (ML-Enhanced)
// ============================================================================

function calculateMLScores(data, sentimentResults) {
  console.log('\n📊 Calculando scores ML-enhanced...');

  const scores = {
    timestamp: new Date().toISOString(),
    individual: {},
    overall: 0,
    weights: {
      search: 0.28,
      trend: 0.15,
      social: 0.22,
      intent: 0.35
    }
  };

  // Search Score (Google Trends)
  if (data.trends?.keywords?.length > 0) {
    const avgInterest = data.trends.keywords.reduce((sum, k) =>
      sum + (k.average_interest || 0), 0) / data.trends.keywords.length;

    // Add trend momentum factor
    const risingCount = data.trends.keywords.filter(k => k.trend === 'rising').length;
    const trendMomentum = risingCount / data.trends.keywords.length;

    scores.individual.search = {
      base: avgInterest / 10,
      momentum: trendMomentum,
      final: Math.min(10, (avgInterest / 10) * (1 + trendMomentum * 0.2))
    };
    console.log(`   Search: ${scores.individual.search.final.toFixed(1)}/10`);
  } else {
    scores.individual.search = { base: 5, momentum: 0, final: 5 };
  }

  // Trend Score (TikTok)
  if (data.tiktok?.trends?.hashtags?.length > 0) {
    const avgRelevance = data.tiktok.trends.hashtags.reduce((sum, h) =>
      sum + (h.relevanceScore || 50), 0) / data.tiktok.trends.hashtags.length;
    scores.individual.trend = {
      base: avgRelevance / 10,
      final: avgRelevance / 10
    };
  } else {
    // Default when no TikTok data (Peru limitation)
    scores.individual.trend = { base: 5, final: 5 };
  }
  console.log(`   Trend: ${scores.individual.trend.final.toFixed(1)}/10`);

  // Social Score (Meta + Sentiment ML)
  if (sentimentResults?.overall) {
    const sentimentScore = sentimentResults.overall.score * 10;

    // Combine with engagement if available
    let engagementScore = 5;
    if (data.meta?.aggregatedTopics?.length > 0) {
      engagementScore = data.meta.aggregatedTopics.reduce((sum, t) =>
        sum + (t.engagement_score || 5), 0) / data.meta.aggregatedTopics.length;
    }

    scores.individual.social = {
      sentiment: sentimentScore,
      engagement: engagementScore,
      final: (sentimentScore * 0.6 + engagementScore * 0.4)
    };
  } else {
    scores.individual.social = { sentiment: 5, engagement: 5, final: 5 };
  }
  console.log(`   Social: ${scores.individual.social.final.toFixed(1)}/10`);

  // Intent Score (GA4)
  if (data.ga4?.overview?.conversionRate) {
    const convRate = data.ga4.overview.conversionRate;
    scores.individual.intent = {
      conversion_rate: convRate,
      final: Math.min(10, convRate * 150)
    };
  } else {
    scores.individual.intent = { conversion_rate: 0.05, final: 7.5 };
  }
  console.log(`   Intent: ${scores.individual.intent.final.toFixed(1)}/10`);

  // Calculate weighted overall
  scores.overall = (
    scores.individual.search.final * scores.weights.search +
    scores.individual.trend.final * scores.weights.trend +
    scores.individual.social.final * scores.weights.social +
    scores.individual.intent.final * scores.weights.intent
  );

  console.log(`   📈 Overall Score: ${scores.overall.toFixed(1)}/10`);

  return scores;
}

// ============================================================================
// BUDGET OPTIMIZATION
// ============================================================================

function runBudgetOptimization(historicalData = null) {
  console.log('\n💰 Ejecutando optimización de presupuesto...');

  const optimizer = new BudgetOptimizer();

  // Load historical performance if available
  if (historicalData) {
    optimizer.batchUpdate(historicalData);
  } else {
    // Use default priors based on typical education marketing
    optimizer.batchUpdate([
      { channel: 'google_search', conversions: 35, spend: 8050 },
      { channel: 'meta_ads', conversions: 30, spend: 8050 },
      { channel: 'youtube', conversions: 15, spend: 4600 },
      { channel: 'display', conversions: 8, spend: 2300 }
    ]);
  }

  const currentAllocation = {
    google_search: 35,
    meta_ads: 35,
    youtube: 20,
    display: 10
  };

  const recommended = optimizer.getRecommendedAllocation(23000);
  const recommendations = optimizer.getRecommendations(currentAllocation, 23000);
  const simulation = optimizer.simulateScenarios(1000);

  console.log('   Recomendaciones:');
  recommendations.forEach(r => {
    console.log(`   - ${r.channel}: ${r.from}% → ${r.to}% (${r.change})`);
  });

  return {
    current: currentAllocation,
    recommended,
    recommendations,
    simulation,
    timestamp: new Date().toISOString()
  };
}

// ============================================================================
// INSIGHT GENERATION
// ============================================================================

function generateInsights(data, sentimentResults, scores, budgetResults) {
  console.log('\n💡 Generando insights...');

  const generator = new InsightGenerator();

  // Prepare data for generator
  const enrichedData = {
    ...data,
    budget: {
      current: budgetResults.current,
      total: 23000
    }
  };

  const insights = generator.generate(enrichedData);

  // Add ML-specific insights
  if (scores.individual.search.momentum > 0.5) {
    insights.push({
      id: 'ml_trend_momentum',
      type: 'multi_source',
      priority: 'high',
      title: 'Alto momentum en tendencias de búsqueda',
      description: `${(scores.individual.search.momentum * 100).toFixed(0)}% de keywords están en tendencia alcista`,
      action: 'Aprovechar momento para escalar inversión en Search',
      confidence: 0.85,
      impact_score: 8.5,
      source: 'ML Trend Analysis'
    });
  }

  // Sort by impact
  const sortedInsights = insights
    .sort((a, b) => b.impact_score - a.impact_score)
    .slice(0, 10);

  console.log(`   ✅ ${sortedInsights.length} insights generados`);
  sortedInsights.slice(0, 3).forEach((i, idx) => {
    console.log(`   ${idx + 1}. [${i.priority.toUpperCase()}] ${i.title}`);
  });

  return sortedInsights;
}

// ============================================================================
// SAVE RESULTS
// ============================================================================

async function saveResults(results) {
  console.log('\n💾 Guardando resultados...');

  await fs.mkdir(ML_OUTPUT_DIR, { recursive: true });

  // Save predictions
  const predictionsPath = path.join(ML_OUTPUT_DIR, 'predictions.json');
  await fs.writeFile(predictionsPath, JSON.stringify({
    generated_at: new Date().toISOString(),
    model_versions: {
      sentiment_analyzer: '1.0.0',
      budget_optimizer: '1.0.0',
      insight_generator: '1.0.0'
    },
    sentiment_analysis: results.sentiment,
    scores: results.scores,
    budget_optimization: results.budget
  }, null, 2));
  console.log(`   📁 ${predictionsPath}`);

  // Save insights separately
  const insightsPath = path.join(ML_OUTPUT_DIR, 'insights.json');
  await fs.writeFile(insightsPath, JSON.stringify({
    generated_at: new Date().toISOString(),
    insights: results.insights,
    total_count: results.insights.length
  }, null, 2));
  console.log(`   📁 ${insightsPath}`);

  // Save scores
  const scoresPath = path.join(ML_OUTPUT_DIR, 'scores.json');
  await fs.writeFile(scoresPath, JSON.stringify(results.scores, null, 2));
  console.log(`   📁 ${scoresPath}`);

  // Save recommendations
  const recommendationsPath = path.join(ML_OUTPUT_DIR, 'recommendations.json');
  await fs.writeFile(recommendationsPath, JSON.stringify({
    generated_at: new Date().toISOString(),
    budget: results.budget.recommendations,
    actions: results.insights
      .filter(i => i.action)
      .map(i => ({
        priority: i.priority,
        action: i.action,
        source: i.source
      }))
  }, null, 2));
  console.log(`   📁 ${recommendationsPath}`);
}

// ============================================================================
// MAIN PIPELINE
// ============================================================================

async function runPipeline() {
  console.log('🚀 ML Pipeline - UCSP Algorithm');
  console.log('================================');
  console.log(`📅 Fecha: ${new Date().toLocaleString('es-PE')}`);

  try {
    // 1. Load data
    const data = await loadAllData();

    // 2. Run sentiment analysis
    const sentimentResults = runSentimentAnalysis(data.meta);

    // 3. Calculate ML-enhanced scores
    const scores = calculateMLScores(data, sentimentResults);

    // 4. Run budget optimization
    const budgetResults = runBudgetOptimization();

    // 5. Generate insights
    const insights = generateInsights(data, sentimentResults, scores, budgetResults);

    // 6. Save all results
    await saveResults({
      sentiment: sentimentResults,
      scores,
      budget: budgetResults,
      insights
    });

    console.log('\n✅ Pipeline completado exitosamente');
    console.log('================================');

    // Summary
    console.log('\n📊 RESUMEN:');
    console.log(`   Overall Score: ${scores.overall.toFixed(1)}/10`);
    console.log(`   Sentimiento: ${sentimentResults.overall?.category || 'N/A'}`);
    console.log(`   Insights: ${insights.length} generados`);
    console.log(`   Top Insight: ${insights[0]?.title || 'N/A'}`);

    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Error en pipeline: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
runPipeline();
