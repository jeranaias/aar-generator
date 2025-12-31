/**
 * AAR Generator - Main Application
 * Handles form interactions, topic management, and exports
 */
const AARApp = {
  STORAGE_KEY: 'aar-generator-draft',
  topicIdCounter: 0,

  /**
   * Initialize the application
   */
  init() {
    this.cacheElements();
    this.bindEvents();
    this.addInitialTopics();
    this.setDefaultDates();
    this.loadDraft();
    this.updateSubjectPreview();
  },

  /**
   * Cache DOM elements for performance
   */
  cacheElements() {
    this.form = document.getElementById('aar-form');
    this.improveContainer = document.getElementById('improveTopics');
    this.sustainContainer = document.getElementById('sustainTopics');
    this.topicTemplate = document.getElementById('topicTemplate');
    this.subjectPreview = document.getElementById('subjectPreview');
    this.previewModal = document.getElementById('previewModal');
    this.previewContent = document.getElementById('previewContent');
    this.toast = document.getElementById('toast');
    this.toastMessage = document.getElementById('toastMessage');
  },

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => ThemeManager.toggle());
    }

    // Add topic buttons
    document.getElementById('addImprove').addEventListener('click', () => {
      this.addTopic('improve');
    });

    document.getElementById('addSustain').addEventListener('click', () => {
      this.addTopic('sustain');
    });

    // Action buttons
    document.getElementById('previewBtn').addEventListener('click', () => this.showPreview());
    document.getElementById('copyBtn').addEventListener('click', () => this.copyToClipboard());
    document.getElementById('exportDocxBtn').addEventListener('click', () => this.exportDocx());
    document.getElementById('saveDraftBtn').addEventListener('click', () => this.saveDraft());
    document.getElementById('loadDraftBtn').addEventListener('click', () => this.loadDraftPrompt());
    document.getElementById('clearAllBtn').addEventListener('click', () => this.clearAll());

    // Preview modal
    document.getElementById('closePreview').addEventListener('click', () => this.closePreview());
    document.getElementById('copyFromPreview').addEventListener('click', () => this.copyToClipboard());
    document.getElementById('printPreview').addEventListener('click', () => this.printAAR());

    // Close modal on overlay click
    this.previewModal.addEventListener('click', (e) => {
      if (e.target === this.previewModal) {
        this.closePreview();
      }
    });

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.previewModal.classList.contains('modal-overlay--active')) {
        this.closePreview();
      }
    });

    // Subject preview updates
    ['eventName', 'eventStartDate', 'eventEndDate'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => this.updateSubjectPreview());
        el.addEventListener('change', () => this.updateSubjectPreview());
      }
    });

    // Phone number formatting
    const pocPhone = document.getElementById('pocPhone');
    if (pocPhone) {
      pocPhone.addEventListener('input', (e) => this.formatPhoneNumber(e.target));
    }

    // Auto-save on input
    this.form.addEventListener('input', () => this.autoSave());
  },

  /**
   * Add initial topics (one of each type)
   */
  addInitialTopics() {
    this.addTopic('improve');
    this.addTopic('sustain');
  },

  /**
   * Set default dates (today for document date)
   */
  setDefaultDates() {
    const today = DateUtils.today();
    const docDate = document.getElementById('documentDate');
    if (docDate && !docDate.value) {
      docDate.value = today;
    }
  },

  /**
   * Add a new topic card
   * @param {string} type - 'improve' or 'sustain'
   * @param {Object} data - Optional data to populate
   * @returns {HTMLElement} The created topic card
   */
  addTopic(type, data = null) {
    const container = type === 'improve' ? this.improveContainer : this.sustainContainer;
    const template = this.topicTemplate.content.cloneNode(true);
    const card = template.querySelector('.topic-card');

    // Set unique ID
    const id = ++this.topicIdCounter;
    card.dataset.topicId = id;
    card.dataset.topicType = type;

    // Set letter label
    const existingTopics = container.querySelectorAll('.topic-card');
    const letter = String.fromCharCode(65 + existingTopics.length); // A, B, C...
    card.querySelector('.topic-letter').textContent = letter;

    // Bind remove button
    card.querySelector('.remove-topic').addEventListener('click', () => {
      this.removeTopic(card, type);
    });

    // Bind character counter
    const titleInput = card.querySelector('.topic-title');
    const charCounter = card.querySelector('.char-counter');
    titleInput.addEventListener('input', () => {
      this.updateCharCounter(titleInput, charCounter, 60);
    });

    // Populate data if provided
    if (data) {
      titleInput.value = data.topic || '';
      card.querySelector('.topic-discussion').value = data.discussion || '';
      card.querySelector('.topic-recommendation').value = data.recommendation || '';
      this.updateCharCounter(titleInput, charCounter, 60);
    }

    container.appendChild(card);
    return card;
  },

  /**
   * Remove a topic card
   * @param {HTMLElement} card - Topic card element
   * @param {string} type - 'improve' or 'sustain'
   */
  removeTopic(card, type) {
    const container = type === 'improve' ? this.improveContainer : this.sustainContainer;
    const topics = container.querySelectorAll('.topic-card');

    // Require at least one topic
    if (topics.length <= 1) {
      this.showToast('At least one topic is required', 'error');
      return;
    }

    card.remove();
    this.updateTopicLetters(type);
    this.autoSave();
  },

  /**
   * Update topic letters after removal
   * @param {string} type - 'improve' or 'sustain'
   */
  updateTopicLetters(type) {
    const container = type === 'improve' ? this.improveContainer : this.sustainContainer;
    const topics = container.querySelectorAll('.topic-card');

    topics.forEach((card, index) => {
      const letter = String.fromCharCode(65 + index);
      card.querySelector('.topic-letter').textContent = letter;
    });
  },

  /**
   * Update character counter
   * @param {HTMLInputElement} input - Input element
   * @param {HTMLElement} counter - Counter element
   * @param {number} max - Max characters
   */
  updateCharCounter(input, counter, max) {
    const count = input.value.length;
    counter.querySelector('.char-count').textContent = count;

    counter.classList.remove('char-counter--warning', 'char-counter--error');
    if (count > max) {
      counter.classList.add('char-counter--error');
    } else if (count > max * 0.8) {
      counter.classList.add('char-counter--warning');
    }
  },

  /**
   * Format phone number as (XXX) XXX-XXXX
   * @param {HTMLInputElement} input - Phone input element
   */
  formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, '');

    if (value.length > 10) {
      value = value.substring(0, 10);
    }

    if (value.length >= 6) {
      value = `(${value.substring(0, 3)}) ${value.substring(3, 6)}-${value.substring(6)}`;
    } else if (value.length >= 3) {
      value = `(${value.substring(0, 3)}) ${value.substring(3)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }

    input.value = value;
  },

  /**
   * Update subject line preview
   */
  updateSubjectPreview() {
    const data = {
      eventName: document.getElementById('eventName').value,
      eventStartDate: document.getElementById('eventStartDate').value,
      eventEndDate: document.getElementById('eventEndDate').value
    };

    this.subjectPreview.textContent = AARBuilder.getSubjectPreview(data);
  },

  /**
   * Gather all form data
   * @returns {Object} Form data object
   */
  gatherFormData() {
    const data = {
      unitName: document.getElementById('unitName').value,
      unitAddress1: document.getElementById('unitAddress1').value,
      unitAddress2: document.getElementById('unitAddress2').value,
      ssic: document.getElementById('ssic').value,
      officeCode: document.getElementById('officeCode').value,
      documentDate: document.getElementById('documentDate').value,
      fromRank: document.getElementById('fromRank').value,
      fromName: document.getElementById('fromName').value,
      fromBillet: document.getElementById('fromBillet').value,
      toTitle: document.getElementById('toTitle').value,
      eventName: document.getElementById('eventName').value,
      eventStartDate: document.getElementById('eventStartDate').value,
      eventEndDate: document.getElementById('eventEndDate').value,
      pocRank: document.getElementById('pocRank').value,
      pocName: document.getElementById('pocName').value,
      pocPhone: document.getElementById('pocPhone').value,
      pocEmail: document.getElementById('pocEmail').value,
      signatureName: document.getElementById('signatureName').value,
      improveTopics: this.gatherTopics('improve'),
      sustainTopics: this.gatherTopics('sustain')
    };

    return data;
  },

  /**
   * Gather topics from a container
   * @param {string} type - 'improve' or 'sustain'
   * @returns {Array} Array of topic objects
   */
  gatherTopics(type) {
    const container = type === 'improve' ? this.improveContainer : this.sustainContainer;
    const cards = container.querySelectorAll('.topic-card');
    const topics = [];

    cards.forEach((card) => {
      topics.push({
        id: card.dataset.topicId,
        topic: card.querySelector('.topic-title').value,
        discussion: card.querySelector('.topic-discussion').value,
        recommendation: card.querySelector('.topic-recommendation').value
      });
    });

    return topics;
  },

  /**
   * Show preview modal
   */
  showPreview() {
    const data = this.gatherFormData();
    const content = AARBuilder.generate(data);
    this.previewContent.textContent = content;
    this.previewModal.classList.add('modal-overlay--active');
    document.body.style.overflow = 'hidden';
  },

  /**
   * Close preview modal
   */
  closePreview() {
    this.previewModal.classList.remove('modal-overlay--active');
    document.body.style.overflow = '';
  },

  /**
   * Copy AAR to clipboard
   */
  async copyToClipboard() {
    const data = this.gatherFormData();
    const content = AARBuilder.generate(data);

    const success = await AARExport.copyToClipboard(content);
    if (success) {
      this.showToast('Copied to clipboard!', 'success');
    } else {
      this.showToast('Failed to copy to clipboard', 'error');
    }
  },

  /**
   * Export AAR as DOCX
   */
  exportDocx() {
    const data = this.gatherFormData();
    const validation = AARBuilder.validate(data);

    if (!validation.valid) {
      this.showToast('Please fill in all required fields', 'error');
      console.log('Validation errors:', validation.errors);
      return;
    }

    const content = AARBuilder.generate(data);
    AARExport.exportDocx(data, content);
    this.showToast('DOCX exported!', 'success');
  },

  /**
   * Print the AAR
   */
  printAAR() {
    const content = this.previewContent.textContent;
    AARExport.print(content);
  },

  /**
   * Save draft to localStorage
   */
  saveDraft() {
    const data = this.gatherFormData();
    const success = Storage.save(this.STORAGE_KEY, data);

    if (success) {
      this.showToast('Draft saved!', 'success');
    } else {
      this.showToast('Failed to save draft', 'error');
    }
  },

  /**
   * Auto-save (debounced)
   */
  autoSave: (function() {
    let timeout;
    return function() {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const data = this.gatherFormData();
        Storage.save(this.STORAGE_KEY, data);
      }, 1000);
    };
  })(),

  /**
   * Prompt before loading draft
   */
  loadDraftPrompt() {
    const draft = Storage.load(this.STORAGE_KEY);
    if (!draft) {
      this.showToast('No saved draft found', 'error');
      return;
    }

    if (confirm('Load saved draft? This will replace current form data.')) {
      this.populateForm(draft);
      this.showToast('Draft loaded!', 'success');
    }
  },

  /**
   * Load draft on page load (silent)
   */
  loadDraft() {
    const draft = Storage.load(this.STORAGE_KEY);
    if (draft) {
      this.populateForm(draft);
    }
  },

  /**
   * Populate form with data
   * @param {Object} data - Form data
   */
  populateForm(data) {
    // Simple fields
    const simpleFields = [
      'unitName', 'unitAddress1', 'unitAddress2', 'ssic', 'officeCode',
      'documentDate', 'fromRank', 'fromName', 'fromBillet', 'toTitle',
      'eventName', 'eventStartDate', 'eventEndDate',
      'pocRank', 'pocName', 'pocPhone', 'pocEmail', 'signatureName'
    ];

    simpleFields.forEach(field => {
      const el = document.getElementById(field);
      if (el && data[field] !== undefined) {
        el.value = data[field];
      }
    });

    // Clear existing topics
    this.improveContainer.innerHTML = '';
    this.sustainContainer.innerHTML = '';

    // Add improve topics
    if (data.improveTopics && data.improveTopics.length > 0) {
      data.improveTopics.forEach(topic => {
        this.addTopic('improve', topic);
      });
    } else {
      this.addTopic('improve');
    }

    // Add sustain topics
    if (data.sustainTopics && data.sustainTopics.length > 0) {
      data.sustainTopics.forEach(topic => {
        this.addTopic('sustain', topic);
      });
    } else {
      this.addTopic('sustain');
    }

    // Update preview
    this.updateSubjectPreview();
  },

  /**
   * Clear all form data
   */
  clearAll() {
    if (!confirm('Clear all form data? This cannot be undone.')) {
      return;
    }

    this.form.reset();

    // Clear topics and add fresh ones
    this.improveContainer.innerHTML = '';
    this.sustainContainer.innerHTML = '';
    this.addTopic('improve');
    this.addTopic('sustain');

    // Reset defaults
    this.setDefaultDates();
    document.getElementById('ssic').value = '3504';
    document.getElementById('toTitle').value = 'Operations Officer';

    // Clear storage
    Storage.remove(this.STORAGE_KEY);

    this.updateSubjectPreview();
    this.showToast('Form cleared', 'success');
  },

  /**
   * Show toast notification
   * @param {string} message - Message to display
   * @param {string} type - 'success' or 'error'
   */
  showToast(message, type = 'success') {
    this.toastMessage.textContent = message;
    this.toast.classList.remove('toast--success', 'toast--error');
    this.toast.classList.add(`toast--${type}`);
    this.toast.classList.add('toast--visible');

    setTimeout(() => {
      this.toast.classList.remove('toast--visible');
    }, 3000);
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => AARApp.init());
