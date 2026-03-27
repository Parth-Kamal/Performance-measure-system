const negativeKeywords = ['bad', 'poor', 'terrible', 'worst', 'failure', 'hate', 'issue', 'problem', 'conflict', 'unhappy', 'difficult', 'struggle'];

/**
 * Basic sentiment analysis to detect negative feedback.
 * @param {Object} openText - JSON object with open-ended responses
 * @returns {boolean} - True if negative sentiment detected
 */
const hasNegativeSentiment = (openText) => {
  if (!openText) return false;
  const values = Object.values(openText).join(' ').toLowerCase();
  return negativeKeywords.some(keyword => values.includes(keyword));
};

module.exports = { hasNegativeSentiment };
