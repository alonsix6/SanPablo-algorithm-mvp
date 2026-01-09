/**
 * Budget Optimizer - Multi-Armed Bandit
 *
 * Uses Thompson Sampling to optimize budget allocation
 * across marketing channels based on conversion performance.
 *
 * Each channel is treated as an "arm" of the bandit.
 * The algorithm learns which channels have better ROI
 * and allocates more budget to winners over time.
 */

class BudgetOptimizer {
  constructor(channels = ['google_search', 'meta_ads', 'youtube', 'display']) {
    this.channels = channels;

    // Beta distribution parameters for each channel
    // alpha = successes (conversions)
    // beta = failures (spend without conversion)
    this.alpha = {};
    this.beta = {};

    // Initialize with prior (1, 1) = uniform distribution
    channels.forEach(ch => {
      this.alpha[ch] = 1;
      this.beta[ch] = 1;
    });

    // History for analysis
    this.history = [];
  }

  /**
   * Sample from Beta distribution using the Jöhnk algorithm
   */
  betaSample(alpha, beta) {
    const gammaA = this.gammaSample(alpha);
    const gammaB = this.gammaSample(beta);
    return gammaA / (gammaA + gammaB);
  }

  /**
   * Sample from Gamma distribution using Marsaglia-Tsang
   */
  gammaSample(shape) {
    if (shape < 1) {
      return this.gammaSample(shape + 1) * Math.pow(Math.random(), 1 / shape);
    }

    const d = shape - 1/3;
    const c = 1 / Math.sqrt(9 * d);

    while (true) {
      let x, v;
      do {
        x = this.normalSample();
        v = 1 + c * x;
      } while (v <= 0);

      v = v * v * v;
      const u = Math.random();

      if (u < 1 - 0.0331 * x * x * x * x) return d * v;
      if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
    }
  }

  /**
   * Sample from standard normal distribution (Box-Muller)
   */
  normalSample() {
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }

  /**
   * Thompson Sampling: Select best channel based on posterior samples
   */
  selectChannel() {
    const samples = {};

    this.channels.forEach(ch => {
      samples[ch] = this.betaSample(this.alpha[ch], this.beta[ch]);
    });

    // Return channel with highest sampled value
    return Object.entries(samples)
      .sort((a, b) => b[1] - a[1])[0][0];
  }

  /**
   * Update posterior based on observed reward
   * @param {string} channel - Channel that received budget
   * @param {boolean} converted - Whether it led to conversion
   * @param {number} spend - Amount spent (for penalization)
   */
  updateReward(channel, converted, spend = 100) {
    if (!this.channels.includes(channel)) return;

    if (converted) {
      // Success: increase alpha
      this.alpha[channel] += 1;
    } else {
      // Failure: increase beta (proportional to spend)
      this.beta[channel] += spend / 100;
    }

    // Record history
    this.history.push({
      timestamp: new Date().toISOString(),
      channel,
      converted,
      spend,
      alpha: this.alpha[channel],
      beta: this.beta[channel]
    });
  }

  /**
   * Batch update with multiple observations
   * @param {Object[]} observations - Array of {channel, conversions, spend}
   */
  batchUpdate(observations) {
    observations.forEach(obs => {
      // Each conversion is a success
      this.alpha[obs.channel] += obs.conversions || 0;
      // Spend without conversions is failure
      const failures = (obs.spend / 100) - (obs.conversions || 0);
      this.beta[obs.channel] += Math.max(0, failures);
    });
  }

  /**
   * Get recommended budget allocation based on learned parameters
   * @param {number} totalBudget - Total budget to allocate
   * @returns {Object} Allocation by channel
   */
  getRecommendedAllocation(totalBudget = 23000) {
    // Calculate expected value for each channel
    const expectedValues = {};
    let totalExpected = 0;

    this.channels.forEach(ch => {
      // Expected value of Beta distribution = alpha / (alpha + beta)
      expectedValues[ch] = this.alpha[ch] / (this.alpha[ch] + this.beta[ch]);
      totalExpected += expectedValues[ch];
    });

    // Allocate proportionally to expected values
    const allocation = {};

    this.channels.forEach(ch => {
      const percentage = (expectedValues[ch] / totalExpected) * 100;
      allocation[ch] = {
        percentage: Math.round(percentage * 10) / 10,
        amount: Math.round(totalBudget * expectedValues[ch] / totalExpected),
        expected_roi: (expectedValues[ch] * 100).toFixed(1) + '%',
        confidence: this.getConfidence(ch)
      };
    });

    return allocation;
  }

  /**
   * Get confidence interval for a channel
   */
  getConfidence(channel) {
    const total = this.alpha[channel] + this.beta[channel];
    if (total < 5) return 'low';
    if (total < 20) return 'medium';
    return 'high';
  }

  /**
   * Compare current allocation with recommended
   * @param {Object} current - Current allocation {channel: percentage}
   * @returns {Object[]} Recommendations
   */
  getRecommendations(current, totalBudget = 23000) {
    const recommended = this.getRecommendedAllocation(totalBudget);
    const recommendations = [];

    this.channels.forEach(ch => {
      const currentPct = current[ch] || 0;
      const recommendedPct = recommended[ch].percentage;
      const diff = recommendedPct - currentPct;

      if (Math.abs(diff) >= 3) { // Only recommend if difference is significant
        recommendations.push({
          channel: ch,
          type: diff > 0 ? 'increase' : 'decrease',
          from: currentPct,
          to: recommendedPct,
          change: diff > 0 ? `+${diff.toFixed(1)}%` : `${diff.toFixed(1)}%`,
          impact: Math.abs(diff * totalBudget / 100),
          confidence: recommended[ch].confidence,
          reason: diff > 0 ?
            `${ch} muestra ROI superior (${recommended[ch].expected_roi})` :
            `${ch} muestra menor efectividad`
        });
      }
    });

    // Sort by absolute impact
    return recommendations.sort((a, b) => b.impact - a.impact);
  }

  /**
   * Run Monte Carlo simulation for budget scenarios
   * @param {number} simulations - Number of simulations
   * @param {number} budget - Total budget
   * @returns {Object} Simulation results
   */
  simulateScenarios(simulations = 1000, budget = 23000) {
    const results = {
      allocations: [],
      best_channel_wins: {}
    };

    this.channels.forEach(ch => results.best_channel_wins[ch] = 0);

    for (let i = 0; i < simulations; i++) {
      const samples = {};
      let maxSample = -1;
      let bestChannel = null;

      this.channels.forEach(ch => {
        samples[ch] = this.betaSample(this.alpha[ch], this.beta[ch]);
        if (samples[ch] > maxSample) {
          maxSample = samples[ch];
          bestChannel = ch;
        }
      });

      results.best_channel_wins[bestChannel]++;
    }

    // Convert to probabilities
    this.channels.forEach(ch => {
      results.best_channel_wins[ch] = (results.best_channel_wins[ch] / simulations * 100).toFixed(1) + '%';
    });

    return results;
  }

  /**
   * Export model state for persistence
   */
  exportState() {
    return {
      channels: this.channels,
      alpha: { ...this.alpha },
      beta: { ...this.beta },
      history_length: this.history.length,
      exported_at: new Date().toISOString()
    };
  }

  /**
   * Import model state from persistence
   */
  importState(state) {
    if (state.channels) this.channels = state.channels;
    if (state.alpha) this.alpha = { ...state.alpha };
    if (state.beta) this.beta = { ...state.beta };
  }

  /**
   * Get summary statistics
   */
  getSummary() {
    const summary = {};

    this.channels.forEach(ch => {
      const mean = this.alpha[ch] / (this.alpha[ch] + this.beta[ch]);
      const variance = (this.alpha[ch] * this.beta[ch]) /
        (Math.pow(this.alpha[ch] + this.beta[ch], 2) * (this.alpha[ch] + this.beta[ch] + 1));

      summary[ch] = {
        alpha: this.alpha[ch],
        beta: this.beta[ch],
        expected_roi: (mean * 100).toFixed(2) + '%',
        uncertainty: Math.sqrt(variance).toFixed(4),
        confidence: this.getConfidence(ch),
        total_observations: this.alpha[ch] + this.beta[ch] - 2 // Subtract initial prior
      };
    });

    return summary;
  }
}

export default BudgetOptimizer;
export { BudgetOptimizer };
