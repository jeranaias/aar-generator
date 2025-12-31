/**
 * LocalStorage Helper for USMC Tools
 * Provides safe JSON serialization and error handling
 */
const Storage = {
  /**
   * Save data to localStorage
   * @param {string} key - Storage key
   * @param {*} data - Data to store (will be JSON serialized)
   * @returns {boolean} Success status
   */
  save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Storage save error:', e);
      return false;
    }
  },

  /**
   * Load data from localStorage
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if key not found
   * @returns {*} Parsed data or default value
   */
  load(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.error('Storage load error:', e);
      return defaultValue;
    }
  },

  /**
   * Remove a key from localStorage
   * @param {string} key - Storage key to remove
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Storage remove error:', e);
    }
  },

  /**
   * Clear localStorage entries
   * @param {string} prefix - Optional prefix to filter keys
   */
  clear(prefix) {
    try {
      if (prefix) {
        Object.keys(localStorage)
          .filter(k => k.startsWith(prefix))
          .forEach(k => localStorage.removeItem(k));
      } else {
        localStorage.clear();
      }
    } catch (e) {
      console.error('Storage clear error:', e);
    }
  },

  /**
   * Check if localStorage is available
   * @returns {boolean} Availability status
   */
  isAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }
};
