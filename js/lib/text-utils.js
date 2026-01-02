/**
 * Text Utilities for Naval Letter Format
 * Text formatting functions for SECNAV M-5216.5 compliance
 */
const TextUtils = {
  /**
   * Ensure double spaces after periods (military correspondence standard)
   * Per SECNAV M-5216.5, sentences are followed by two spaces
   * @param {string} str - Input string
   * @returns {string} - String with double spaces after periods
   */
  ensureDoubleSpaces(str) {
    if (!str) return '';
    // Replace period + single space (not at end) with period + double space
    return str.replace(/\.(\s)(?=\S)/g, '.  ');
  },

  /**
   * Calculate line height based on font size
   * Standard military correspondence uses ~1.17x font size
   * @param {number} fontSize - Font size in points
   * @returns {number} - Line height in points
   */
  getLineHeight(fontSize) {
    return Math.round(fontSize * 1.17);
  },

  /**
   * Get letter for index (a, b, c... aa, ab, etc.)
   * @param {number} index - Zero-based index
   * @returns {string} - Letter for that index
   */
  getLetter(index) {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    if (index < 26) {
      return letters[index];
    }
    const first = Math.floor(index / 26) - 1;
    const second = index % 26;
    return letters[first] + letters[second];
  }
};
