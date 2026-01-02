/**
 * AAR Generator - Data Manager
 * Handles SSIC, Unit, and Office Code database loading and searching
 * Ported from Naval Letter Generator
 */
const DataManager = {
  SSIC_DATABASE: [],
  UNIT_DATABASE: [],
  OFFICE_CODE_DATABASE: [],
  dataLoaded: false,

  SERVICE_NAMES: {
    'USMC': 'UNITED STATES MARINE CORPS',
    'USN': 'UNITED STATES NAVY',
    'DOD': 'DEPARTMENT OF DEFENSE',
    'DON': 'DEPARTMENT OF THE NAVY'
  },

  /**
   * Load data from JSON files
   */
  async load() {
    try {
      const [ssicRes, unitsRes, officeRes] = await Promise.all([
        fetch('data/ssic.json'),
        fetch('data/units.json'),
        fetch('data/office-codes.json')
      ]);

      if (ssicRes.ok) {
        const data = await ssicRes.json();
        this.SSIC_DATABASE = data.codes.map(c => ({
          code: c.code,
          desc: c.title
        }));
      }

      if (unitsRes.ok) {
        const data = await unitsRes.json();
        this.UNIT_DATABASE = data.units.map(u => ({
          name: u.name,
          address: u.address,
          service: u.service
        }));
      }

      if (officeRes.ok) {
        const data = await officeRes.json();
        this.OFFICE_CODE_DATABASE = data.codes;
      }

      this.dataLoaded = true;
    } catch (err) {
      console.warn('Could not load data files:', err);
    }
  },

  /**
   * Search SSIC database
   */
  searchSSIC(query) {
    if (!query || query.length < 1) return [];
    const q = query.toLowerCase().trim();
    return this.SSIC_DATABASE.filter(s =>
      s.code.includes(q) || s.desc.toLowerCase().includes(q)
    ).slice(0, 12);
  },

  /**
   * Search unit database
   */
  searchUnits(query) {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase().trim();
    return this.UNIT_DATABASE.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.address.toLowerCase().includes(q)
    ).slice(0, 10);
  },

  /**
   * Search office codes database
   */
  searchOfficeCodes(query) {
    if (!query) return this.OFFICE_CODE_DATABASE.slice(0, 10);
    const q = query.toLowerCase();
    return this.OFFICE_CODE_DATABASE.filter(oc =>
      oc.code.toLowerCase().includes(q) ||
      oc.title.toLowerCase().includes(q) ||
      oc.category.toLowerCase().includes(q)
    ).slice(0, 12);
  },

  /**
   * Initialize search functionality
   */
  init() {
    this.load();
    this.bindEvents();
  },

  /**
   * Bind search event listeners
   */
  bindEvents() {
    // SSIC Search
    const ssicInput = document.getElementById('ssic');
    const ssicResults = document.getElementById('ssicResults');
    if (ssicInput && ssicResults) {
      ssicInput.addEventListener('input', () => this.handleSSICSearch());
      ssicInput.addEventListener('focus', () => this.handleSSICSearch());
    }

    // Unit Search
    const unitInput = document.getElementById('unitSearch');
    const unitResults = document.getElementById('unitResults');
    if (unitInput && unitResults) {
      unitInput.addEventListener('input', () => this.handleUnitSearch());
      unitInput.addEventListener('focus', () => this.handleUnitSearch());
    }

    // Office Code Search
    const officeInput = document.getElementById('officeCode');
    const officeResults = document.getElementById('officeCodeResults');
    if (officeInput && officeResults) {
      officeInput.addEventListener('input', () => this.handleOfficeCodeSearch());
      officeInput.addEventListener('focus', () => this.handleOfficeCodeSearch());
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (ssicResults && !e.target.closest('#ssic') && !e.target.closest('#ssicResults')) {
        ssicResults.classList.remove('show');
      }
      if (unitResults && !e.target.closest('#unitSearch') && !e.target.closest('#unitResults')) {
        unitResults.classList.remove('show');
      }
      if (officeResults && !e.target.closest('#officeCode') && !e.target.closest('#officeCodeResults')) {
        officeResults.classList.remove('show');
      }
    });
  },

  /**
   * Handle SSIC search
   */
  handleSSICSearch() {
    const input = document.getElementById('ssic');
    const results = document.getElementById('ssicResults');
    const query = input.value.trim();

    if (query.length < 1) {
      results.classList.remove('show');
      return;
    }

    const matches = this.searchSSIC(query);
    if (matches.length > 0) {
      results.innerHTML = matches.map(s => `
        <div class="search-result-item" data-code="${s.code}">
          <span class="result-code">${s.code}</span>
          <span class="result-desc">${s.desc}</span>
        </div>
      `).join('');
      results.classList.add('show');

      // Bind click handlers
      results.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('mousedown', (e) => {
          e.preventDefault();
          input.value = item.dataset.code;
          results.classList.remove('show');
          input.dispatchEvent(new Event('input', { bubbles: true }));
        });
      });
    } else {
      results.innerHTML = '<div class="search-result-item no-results">No matches found</div>';
      results.classList.add('show');
    }
  },

  /**
   * Handle unit search
   */
  handleUnitSearch() {
    const input = document.getElementById('unitSearch');
    const results = document.getElementById('unitResults');
    const query = input.value.trim();

    if (query.length < 2) {
      results.classList.remove('show');
      return;
    }

    const matches = this.searchUnits(query);
    if (matches.length > 0) {
      results.innerHTML = matches.map((u, i) => `
        <div class="search-result-item" data-index="${i}">
          <span class="result-code">${u.name}</span>
          <span class="result-desc">${u.address.replace(/\n/g, ' · ')}</span>
        </div>
      `).join('');
      results.classList.add('show');

      // Bind click handlers
      results.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('mousedown', (e) => {
          e.preventDefault();
          const unit = matches[parseInt(item.dataset.index)];
          this.selectUnit(unit);
          results.classList.remove('show');
        });
      });
    } else {
      results.classList.remove('show');
    }
  },

  /**
   * Select a unit and populate fields
   */
  selectUnit(unit) {
    const serviceName = this.SERVICE_NAMES[unit.service] || unit.service;
    document.getElementById('unitName').value = unit.name;

    // Split address into lines
    const addressLines = unit.address.split('\n');
    document.getElementById('unitAddress1').value = addressLines[0] || '';
    document.getElementById('unitAddress2').value = addressLines.slice(1).join(', ') || '';

    // Clear search
    document.getElementById('unitSearch').value = '';

    // Trigger preview update
    document.getElementById('unitName').dispatchEvent(new Event('input', { bubbles: true }));
  },

  /**
   * Handle office code search
   */
  handleOfficeCodeSearch() {
    const input = document.getElementById('officeCode');
    const results = document.getElementById('officeCodeResults');
    const query = input.value.trim();

    if (query.length < 1) {
      results.classList.remove('show');
      return;
    }

    const matches = this.searchOfficeCodes(query);
    if (matches.length > 0) {
      results.innerHTML = matches.map(oc => `
        <div class="search-result-item" data-code="${oc.code}">
          <span class="result-code">${oc.code}</span>
          <span class="result-desc">${oc.title}</span>
        </div>
      `).join('');
      results.classList.add('show');

      // Bind click handlers
      results.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('mousedown', (e) => {
          e.preventDefault();
          input.value = item.dataset.code;
          results.classList.remove('show');
          input.dispatchEvent(new Event('input', { bubbles: true }));
        });
      });
    } else {
      results.classList.remove('show');
    }
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => DataManager.init());
