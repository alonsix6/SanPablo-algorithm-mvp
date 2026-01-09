/**
 * ML-Powered Insight Generator
 *
 * Generates actionable insights from data and ML predictions.
 * Prioritizes insights by impact score and confidence.
 */

import SentimentAnalyzer from '../models/sentiment_analyzer.js';
import BudgetOptimizer from '../models/budget_optimizer.js';

class InsightGenerator {
  constructor(config = {}) {
    this.sentimentAnalyzer = new SentimentAnalyzer();
    this.budgetOptimizer = new BudgetOptimizer();
    this.config = {
      maxInsights: config.maxInsights || 10,
      minConfidence: config.minConfidence || 0.6,
      ...config
    };
  }

  /**
   * Generate all insights from available data
   * @param {Object} data - All data sources
   * @returns {Object[]} Prioritized insights
   */
  generate(data) {
    const insights = [];

    // 1. Trend Insights (Google Trends)
    if (data.trends?.keywords) {
      insights.push(...this.generateTrendInsights(data.trends));
    }

    // 2. Social Insights (Meta)
    if (data.meta?.aggregatedTopics) {
      insights.push(...this.generateSocialInsights(data.meta));
    }

    // 3. TikTok Insights
    if (data.tiktok?.trends?.hashtags) {
      insights.push(...this.generateTikTokInsights(data.tiktok));
    }

    // 4. GA4 Insights (cuando esté disponible)
    if (data.ga4?.overview) {
      insights.push(...this.generateGA4Insights(data.ga4));
    }

    // 5. Cross-Source Insights
    insights.push(...this.generateCrossSourceInsights(data));

    // 6. Budget Optimization Insights
    if (data.budget) {
      insights.push(...this.generateBudgetInsights(data.budget));
    }

    // Filter and sort by impact
    return insights
      .filter(i => i.confidence >= this.config.minConfidence)
      .sort((a, b) => b.impact_score - a.impact_score)
      .slice(0, this.config.maxInsights);
  }

  /**
   * Generate insights from Google Trends data
   */
  generateTrendInsights(trendsData) {
    const insights = [];
    const keywords = trendsData.keywords || [];

    if (keywords.length === 0) return insights;

    // Top performing keyword
    const topKeyword = keywords[0];
    insights.push({
      id: 'trend_top_keyword',
      type: 'trend',
      priority: 'high',
      title: `"${topKeyword.keyword}" lidera las búsquedas`,
      description: `Con un interés de ${topKeyword.average_interest}/100 y ${topKeyword.growth_3m} de crecimiento`,
      action: 'Aumentar inversión en este keyword en Google Ads',
      metric: topKeyword.average_interest,
      change: topKeyword.growth_3m,
      confidence: 0.85,
      impact_score: topKeyword.average_interest * 0.1,
      source: 'Google Trends'
    });

    // Rising keywords
    const risingKeywords = keywords.filter(k =>
      k.trend === 'rising' && k.growth_3m && parseInt(k.growth_3m) > 20
    );

    if (risingKeywords.length > 0) {
      const avgGrowth = risingKeywords.reduce((sum, k) => {
        const growth = parseInt(k.growth_3m.replace(/[^-\d]/g, '')) || 0;
        return sum + growth;
      }, 0) / risingKeywords.length;

      insights.push({
        id: 'trend_rising',
        type: 'trend',
        priority: avgGrowth > 30 ? 'high' : 'medium',
        title: `${risingKeywords.length} keywords en tendencia alcista`,
        description: `Crecimiento promedio de +${avgGrowth.toFixed(0)}% en los últimos 3 meses`,
        action: 'Crear contenido targeting estos keywords emergentes',
        keywords: risingKeywords.map(k => k.keyword).slice(0, 3),
        confidence: 0.80,
        impact_score: avgGrowth * 0.2,
        source: 'Google Trends'
      });
    }

    // Regional concentration
    if (topKeyword.top_regions) {
      const regions = Object.entries(topKeyword.top_regions)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

      if (regions.length > 0 && regions[0][1] > 70) {
        insights.push({
          id: 'trend_regional',
          type: 'trend',
          priority: 'medium',
          title: `Concentración regional en ${regions[0][0]}`,
          description: `${regions[0][1]}% del interés viene de ${regions[0][0]}`,
          action: 'Considerar campañas geo-segmentadas',
          regions: regions.map(r => ({ region: r[0], score: r[1] })),
          confidence: 0.75,
          impact_score: 6,
          source: 'Google Trends'
        });
      }
    }

    return insights;
  }

  /**
   * Generate insights from Meta social data
   */
  generateSocialInsights(metaData) {
    const insights = [];
    const topics = metaData.aggregatedTopics || [];

    if (topics.length === 0) return insights;

    // Top topic by engagement
    const topTopic = topics
      .filter(t => t.engagement_score > 0)
      .sort((a, b) => b.engagement_score - a.engagement_score)[0];

    if (topTopic && topTopic.engagement_score > 5) {
      insights.push({
        id: 'social_top_topic',
        type: 'social',
        priority: topTopic.engagement_score > 7 ? 'high' : 'medium',
        title: `"${topTopic.topic}" genera alto engagement`,
        description: `Score de ${topTopic.engagement_score}/10 con ${topTopic.mentions} menciones`,
        action: 'Amplificar contenido relacionado con este tema',
        sentiment: topTopic.sentiment,
        confidence: 0.75,
        impact_score: topTopic.engagement_score,
        source: 'Meta Social Listening'
      });
    }

    // Sentiment analysis
    const sentiments = topics.map(t => t.sentiment);
    const positiveSentiments = sentiments.filter(s =>
      s === 'muy_positivo' || s === 'positivo' || s === 'very positive' || s === 'positive'
    ).length;
    const sentimentRatio = positiveSentiments / (sentiments.length || 1);

    if (sentimentRatio < 0.5 && topics.length > 3) {
      insights.push({
        id: 'social_sentiment_warning',
        type: 'social',
        priority: 'high',
        title: 'Sentimiento social requiere atención',
        description: `Solo ${(sentimentRatio * 100).toFixed(0)}% de los topics tienen sentimiento positivo`,
        action: 'Investigar causas de percepción negativa y activar PR',
        confidence: 0.70,
        impact_score: 8,
        source: 'Meta Social Listening'
      });
    } else if (sentimentRatio > 0.7) {
      insights.push({
        id: 'social_sentiment_positive',
        type: 'social',
        priority: 'medium',
        title: 'Sentimiento social favorable',
        description: `${(sentimentRatio * 100).toFixed(0)}% de los topics muestran sentimiento positivo`,
        action: 'Capitalizar el momento con testimoniales y UGC',
        confidence: 0.75,
        impact_score: 6,
        source: 'Meta Social Listening'
      });
    }

    // Brand presence
    const brandTopics = topics.filter(t =>
      t.top_brands?.some(b => b.toLowerCase().includes('ucsp'))
    );

    if (brandTopics.length > 0) {
      insights.push({
        id: 'social_brand_presence',
        type: 'social',
        priority: 'medium',
        title: `UCSP presente en ${brandTopics.length}/${topics.length} conversaciones`,
        description: `La marca aparece en ${(brandTopics.length / topics.length * 100).toFixed(0)}% de los temas monitoreados`,
        action: brandTopics.length < topics.length / 2 ?
          'Aumentar share of voice en temas donde no aparece UCSP' :
          'Mantener presencia y monitorear competencia',
        confidence: 0.80,
        impact_score: 5,
        source: 'Meta Social Listening'
      });
    }

    return insights;
  }

  /**
   * Generate insights from TikTok data
   */
  generateTikTokInsights(tiktokData) {
    const insights = [];
    const hashtags = tiktokData.trends?.hashtags || [];

    if (hashtags.length === 0) {
      insights.push({
        id: 'tiktok_no_data',
        type: 'tiktok',
        priority: 'low',
        title: 'Sin datos de TikTok para la región',
        description: 'TikTok Creative Center no tiene hashtags trending para Perú',
        action: 'Considerar análisis de tendencias LATAM o crear contenido basado en trends globales',
        confidence: 0.90,
        impact_score: 3,
        source: 'TikTok Trends'
      });
      return insights;
    }

    // Top hashtag
    const topHashtag = hashtags[0];
    insights.push({
      id: 'tiktok_top_hashtag',
      type: 'tiktok',
      priority: 'medium',
      title: `${topHashtag.hashtag} lidera en TikTok`,
      description: `${topHashtag.views} visualizaciones y ${topHashtag.posts} posts`,
      action: 'Crear contenido usando este hashtag trending',
      growth: topHashtag.growth,
      confidence: 0.75,
      impact_score: (topHashtag.relevanceScore || 50) / 10,
      source: 'TikTok Trends'
    });

    return insights;
  }

  /**
   * Generate insights from GA4 data
   */
  generateGA4Insights(ga4Data) {
    const insights = [];
    const overview = ga4Data.overview || {};

    // Conversion rate insight
    if (overview.conversionRate) {
      const convRate = overview.conversionRate * 100;
      insights.push({
        id: 'ga4_conversion_rate',
        type: 'intent',
        priority: convRate > 5 ? 'medium' : 'high',
        title: `Tasa de conversión: ${convRate.toFixed(1)}%`,
        description: `${overview.conversions?.toLocaleString() || 0} conversiones de ${overview.totalUsers?.toLocaleString() || 0} usuarios`,
        action: convRate < 5 ?
          'Optimizar landing pages y CTAs para mejorar conversión' :
          'Mantener estrategia actual y escalar tráfico',
        metric: convRate,
        confidence: 0.85,
        impact_score: convRate > 5 ? 7 : 9,
        source: 'Google Analytics 4'
      });
    }

    // Top pages insight
    const topPages = ga4Data.topPages || [];
    if (topPages.length > 0) {
      const topPage = topPages[0];
      insights.push({
        id: 'ga4_top_page',
        type: 'intent',
        priority: 'medium',
        title: `${topPage.page} es la página más visitada`,
        description: `${topPage.views?.toLocaleString() || 0} vistas con ${((topPage.conversionRate || 0) * 100).toFixed(1)}% conversión`,
        action: 'Analizar qué hace exitosa esta página y replicar',
        confidence: 0.80,
        impact_score: 6,
        source: 'Google Analytics 4'
      });
    }

    return insights;
  }

  /**
   * Generate cross-source insights
   */
  generateCrossSourceInsights(data) {
    const insights = [];

    // Check if trends keywords appear in social topics
    const trendKeywords = (data.trends?.keywords || []).map(k => k.keyword.toLowerCase());
    const socialTopics = (data.meta?.aggregatedTopics || []).map(t => t.topic.toLowerCase());

    const overlapping = trendKeywords.filter(kw =>
      socialTopics.some(topic => topic.includes(kw.split(' ')[0]))
    );

    if (overlapping.length > 0) {
      insights.push({
        id: 'cross_source_alignment',
        type: 'multi_source',
        priority: 'high',
        title: 'Alineación entre búsquedas y conversación social',
        description: `${overlapping.length} temas aparecen tanto en Google Trends como en redes sociales`,
        action: 'Priorizar estos temas en la estrategia de contenido',
        keywords: overlapping.slice(0, 3),
        confidence: 0.85,
        impact_score: 8,
        source: 'Multi-Source Analysis'
      });
    }

    return insights;
  }

  /**
   * Generate budget optimization insights
   */
  generateBudgetInsights(budgetData) {
    const insights = [];

    // Load historical data into optimizer
    if (budgetData.historical) {
      this.budgetOptimizer.batchUpdate(budgetData.historical);
    }

    // Get recommendations
    const current = budgetData.current || {
      google_search: 35,
      meta_ads: 35,
      youtube: 20,
      display: 10
    };

    const recommendations = this.budgetOptimizer.getRecommendations(current, budgetData.total || 23000);

    if (recommendations.length > 0) {
      const topRec = recommendations[0];
      insights.push({
        id: 'budget_optimization',
        type: 'budget',
        priority: Math.abs(topRec.change) > 5 ? 'high' : 'medium',
        title: `Optimización detectada: ${topRec.channel}`,
        description: `${topRec.type === 'increase' ? 'Aumentar' : 'Reducir'} de ${topRec.from}% a ${topRec.to}%`,
        action: topRec.reason,
        recommendations: recommendations.slice(0, 3),
        confidence: topRec.confidence === 'high' ? 0.85 : 0.70,
        impact_score: Math.abs(parseFloat(topRec.change)) / 2,
        source: 'ML Budget Optimizer'
      });
    }

    return insights;
  }

  /**
   * Format insights for display
   */
  formatForDisplay(insights) {
    return insights.map(insight => ({
      ...insight,
      icon: this.getIcon(insight.type),
      color: this.getColor(insight.priority),
      badge: insight.priority.toUpperCase()
    }));
  }

  getIcon(type) {
    const icons = {
      trend: 'TrendingUp',
      social: 'Users',
      tiktok: 'Music',
      intent: 'Target',
      budget: 'DollarSign',
      multi_source: 'Layers'
    };
    return icons[type] || 'Lightbulb';
  }

  getColor(priority) {
    const colors = {
      high: 'red',
      medium: 'yellow',
      low: 'gray'
    };
    return colors[priority] || 'blue';
  }
}

export default InsightGenerator;
export { InsightGenerator };
