/**
 * Date Utilities for USMC Tools
 * Military date formatting and conversions
 */
const DateUtils = {
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  monthsFull: ['January', 'February', 'March', 'April', 'May', 'June',
               'July', 'August', 'September', 'October', 'November', 'December'],

  /**
   * Format date as DD MMM YY (military style)
   * @param {string|Date} date - Date to format
   * @returns {string} Formatted date (e.g., "15 Dec 24")
   */
  formatMilitaryShort(date) {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const day = String(d.getDate()).padStart(2, '0');
    const month = this.months[d.getMonth()];
    const year = String(d.getFullYear()).slice(-2);
    return `${day} ${month} ${year}`;
  },

  /**
   * Format date as DD Month YYYY (military style, full)
   * @param {string|Date} date - Date to format
   * @returns {string} Formatted date (e.g., "15 December 2024")
   */
  formatMilitaryFull(date) {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const day = String(d.getDate()).padStart(2, '0');
    const month = this.monthsFull[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  },

  /**
   * Format date as DD MONTH YYYY (uppercase, for subject lines)
   * @param {string|Date} date - Date to format
   * @returns {string} Formatted date (e.g., "15 DECEMBER 2024")
   */
  formatSubjectLine(date) {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const day = String(d.getDate()).padStart(2, '0');
    const month = this.monthsFull[d.getMonth()].toUpperCase();
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  },

  /**
   * Format date as YYYYMMDD (numeric)
   * @param {string|Date} date - Date to format
   * @returns {string} Formatted date (e.g., "20241215")
   */
  formatNumeric(date) {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  },

  /**
   * Get today's date as YYYY-MM-DD (for input fields)
   * @returns {string} Today's date in ISO format
   */
  today() {
    return new Date().toISOString().split('T')[0];
  },

  /**
   * Validate that end date is >= start date
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @returns {boolean} True if valid
   */
  validateDateRange(startDate, endDate) {
    if (!startDate || !endDate) return false;
    return new Date(endDate) >= new Date(startDate);
  }
};
