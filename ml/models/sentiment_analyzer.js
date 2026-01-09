/**
 * Sentiment Analyzer - Spanish Language
 *
 * Rule-based sentiment analysis for Spanish text.
 * Used for social listening data from Meta/Facebook.
 *
 * Future: Replace with BERT-based model for better accuracy.
 */

// Spanish positive words with weights
const POSITIVE_WORDS = {
  // Very positive (weight 2)
  'excelente': 2, 'increíble': 2, 'extraordinario': 2, 'fantástico': 2,
  'maravilloso': 2, 'perfecto': 2, 'excepcional': 2, 'brillante': 2,
  'espectacular': 2, 'impresionante': 2,

  // Positive (weight 1)
  'bueno': 1, 'genial': 1, 'mejor': 1, 'feliz': 1, 'gracias': 1,
  'recomiendo': 1, 'éxito': 1, 'orgullo': 1, 'encanta': 1, 'amor': 1,
  'hermoso': 1, 'interesante': 1, 'útil': 1, 'profesional': 1,
  'calidad': 1, 'satisfecho': 1, 'contento': 1, 'agradecido': 1,
  'logro': 1, 'avance': 1, 'progreso': 1, 'innovador': 1,

  // Education specific
  'acreditada': 1.5, 'licenciada': 1.5, 'prestigio': 1.5, 'ranking': 1,
  'beca': 1, 'oportunidad': 1, 'futuro': 1, 'carrera': 0.5
};

// Spanish negative words with weights
const NEGATIVE_WORDS = {
  // Very negative (weight 2)
  'terrible': 2, 'horrible': 2, 'pésimo': 2, 'asqueroso': 2,
  'desastroso': 2, 'estafa': 2, 'fraude': 2, 'robo': 2,

  // Negative (weight 1)
  'malo': 1, 'peor': 1, 'odio': 1, 'decepción': 1, 'triste': 1,
  'enojado': 1, 'frustrado': 1, 'problema': 1, 'queja': 1,
  'falla': 1, 'error': 1, 'lento': 1, 'caro': 1, 'costoso': 1,
  'difícil': 0.5, 'complicado': 0.5, 'confuso': 0.5,

  // Education specific
  'corrupto': 1.5, 'irregular': 1, 'desorganizado': 1, 'incumplimiento': 1.5
};

// Negation words that flip sentiment
const NEGATION_WORDS = ['no', 'nunca', 'jamás', 'sin', 'nada', 'nadie', 'ni'];

// Intensifiers that amplify sentiment
const INTENSIFIERS = {
  'muy': 1.5, 'super': 1.5, 'demasiado': 1.3, 'bastante': 1.2,
  'realmente': 1.3, 'totalmente': 1.4, 'absolutamente': 1.5
};

class SentimentAnalyzer {
  constructor(config = {}) {
    this.positiveWords = { ...POSITIVE_WORDS, ...(config.customPositive || {}) };
    this.negativeWords = { ...NEGATIVE_WORDS, ...(config.customNegative || {}) };
    this.negationWords = NEGATION_WORDS;
    this.intensifiers = INTENSIFIERS;
  }

  /**
   * Analyze sentiment of a text
   * @param {string} text - Text to analyze
   * @returns {Object} Sentiment analysis result
   */
  analyze(text) {
    if (!text || typeof text !== 'string') {
      return this.createResult(0.5, 'neutral', 0, 0);
    }

    const cleanText = this.preprocess(text);
    const tokens = this.tokenize(cleanText);

    let positiveScore = 0;
    let negativeScore = 0;
    let positiveCount = 0;
    let negativeCount = 0;
    let isNegated = false;
    let intensifier = 1;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      // Check for negation
      if (this.negationWords.includes(token)) {
        isNegated = true;
        continue;
      }

      // Check for intensifier
      if (this.intensifiers[token]) {
        intensifier = this.intensifiers[token];
        continue;
      }

      // Check positive words
      if (this.positiveWords[token]) {
        const weight = this.positiveWords[token] * intensifier;
        if (isNegated) {
          negativeScore += weight;
          negativeCount++;
        } else {
          positiveScore += weight;
          positiveCount++;
        }
        isNegated = false;
        intensifier = 1;
      }

      // Check negative words
      if (this.negativeWords[token]) {
        const weight = this.negativeWords[token] * intensifier;
        if (isNegated) {
          positiveScore += weight * 0.5; // Negated negative = weak positive
          positiveCount++;
        } else {
          negativeScore += weight;
          negativeCount++;
        }
        isNegated = false;
        intensifier = 1;
      }

      // Reset negation after 3 words
      if (isNegated && i > 0 && (i - tokens.indexOf(tokens.find(t => this.negationWords.includes(t)))) > 3) {
        isNegated = false;
      }
    }

    // Calculate normalized score (0-1)
    const totalScore = positiveScore + negativeScore || 1;
    const normalizedScore = (positiveScore / totalScore);

    // Adjust for text length (short texts are less confident)
    const confidenceAdjustment = Math.min(1, tokens.length / 20);
    const adjustedScore = 0.5 + (normalizedScore - 0.5) * confidenceAdjustment;

    return this.createResult(
      adjustedScore,
      this.categorize(adjustedScore),
      positiveCount,
      negativeCount
    );
  }

  /**
   * Analyze multiple texts and aggregate results
   * @param {string[]} texts - Array of texts
   * @returns {Object} Aggregated sentiment
   */
  analyzeMultiple(texts) {
    if (!texts || texts.length === 0) {
      return this.createResult(0.5, 'neutral', 0, 0);
    }

    const results = texts.map(t => this.analyze(t));
    const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    const totalPositive = results.reduce((sum, r) => sum + r.positive_count, 0);
    const totalNegative = results.reduce((sum, r) => sum + r.negative_count, 0);

    return {
      score: avgScore,
      category: this.categorize(avgScore),
      positive_count: totalPositive,
      negative_count: totalNegative,
      sample_size: texts.length,
      distribution: {
        muy_positivo: results.filter(r => r.category === 'muy_positivo').length,
        positivo: results.filter(r => r.category === 'positivo').length,
        neutral: results.filter(r => r.category === 'neutral').length,
        negativo: results.filter(r => r.category === 'negativo').length,
        muy_negativo: results.filter(r => r.category === 'muy_negativo').length
      }
    };
  }

  /**
   * Preprocess text for analysis
   */
  preprocess(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents for matching
      .replace(/[^\w\s]/g, ' ')        // Remove punctuation
      .replace(/\s+/g, ' ')            // Normalize whitespace
      .trim();
  }

  /**
   * Tokenize text into words
   */
  tokenize(text) {
    return text.split(' ').filter(t => t.length > 1);
  }

  /**
   * Categorize sentiment score
   */
  categorize(score) {
    if (score >= 0.75) return 'muy_positivo';
    if (score >= 0.55) return 'positivo';
    if (score >= 0.45) return 'neutral';
    if (score >= 0.25) return 'negativo';
    return 'muy_negativo';
  }

  /**
   * Create result object
   */
  createResult(score, category, positiveCount, negativeCount) {
    return {
      score: Math.round(score * 100) / 100,
      category,
      positive_count: positiveCount,
      negative_count: negativeCount,
      confidence: this.calculateConfidence(positiveCount, negativeCount)
    };
  }

  /**
   * Calculate confidence based on word matches
   */
  calculateConfidence(positiveCount, negativeCount) {
    const total = positiveCount + negativeCount;
    if (total === 0) return 0.5;
    if (total < 3) return 0.6;
    if (total < 5) return 0.7;
    if (total < 10) return 0.8;
    return 0.9;
  }

  /**
   * Get top sentiment words found in text
   */
  getTopWords(text, limit = 5) {
    const cleanText = this.preprocess(text);
    const tokens = this.tokenize(cleanText);
    const found = [];

    tokens.forEach(token => {
      if (this.positiveWords[token]) {
        found.push({ word: token, type: 'positive', weight: this.positiveWords[token] });
      }
      if (this.negativeWords[token]) {
        found.push({ word: token, type: 'negative', weight: this.negativeWords[token] });
      }
    });

    return found
      .sort((a, b) => b.weight - a.weight)
      .slice(0, limit);
  }
}

export default SentimentAnalyzer;
export { SentimentAnalyzer, POSITIVE_WORDS, NEGATIVE_WORDS };
