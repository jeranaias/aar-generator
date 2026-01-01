/**
 * AAR Generator - Main Application
 * Handles form interactions, drag-drop, live preview, and exports
 */
const AARApp = {
  STORAGE_KEY: 'aar-generator-draft',
  PREVIEW_KEY: 'aar-generator-preview-enabled',
  topicIdCounter: 0,
  previewDebounceTimer: null,
  previewEnabled: false,
  currentBlobUrl: null,
  draggedElement: null,

  /**
   * Initialize the application
   */
  init() {
    this.cacheElements();
    this.bindEvents();
    this.addInitialTopics();
    this.setDefaultDates();
    this.loadDraft();
    this.loadPreviewPreference();
  },

  /**
   * Cache DOM elements
   */
  cacheElements() {
    this.form = document.getElementById('aar-form');
    this.improveContainer = document.getElementById('improveTopics');
    this.sustainContainer = document.getElementById('sustainTopics');
    this.topicTemplate = document.getElementById('topicTemplate');
    this.mainContent = document.querySelector('.main-content');
    this.previewPane = document.getElementById('livePreviewPane');
    this.previewFrame = document.getElementById('previewFrame');
    this.previewLoading = document.getElementById('previewLoading');
    this.previewToggleBtn = document.getElementById('previewToggle');
    this.previewCloseBtn = document.getElementById('previewClose');
    this.toast = document.getElementById('toast');
    this.toastMessage = document.getElementById('toastMessage');
  },

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Theme toggle
    document.getElementById('theme-toggle')?.addEventListener('click', () => ThemeManager.toggle());

    // Preview toggle buttons
    this.previewToggleBtn?.addEventListener('click', () => this.toggleLivePreview());
    this.previewCloseBtn?.addEventListener('click', () => this.toggleLivePreview(false));

    // Add topic buttons
    document.getElementById('addImprove').addEventListener('click', () => this.addTopic('improve'));
    document.getElementById('addSustain').addEventListener('click', () => this.addTopic('sustain'));

    // Export buttons
    document.getElementById('exportPdfBtn')?.addEventListener('click', () => this.exportPDF());
    document.getElementById('exportWordBtn')?.addEventListener('click', () => this.exportWord());
    document.getElementById('copyBtn')?.addEventListener('click', () => this.copyToClipboard());

    // Draft buttons
    document.getElementById('saveDraftBtn')?.addEventListener('click', () => this.saveDraft());
    document.getElementById('loadDraftBtn')?.addEventListener('click', () => this.loadDraftPrompt());
    document.getElementById('clearAllBtn')?.addEventListener('click', () => this.clearAll());

    // Phone formatting
    document.getElementById('pocPhone')?.addEventListener('input', (e) => this.formatPhoneNumber(e.target));

    // Live preview updates - listen to all form inputs
    this.form.addEventListener('input', () => this.schedulePreviewUpdate());
    this.form.addEventListener('change', () => this.schedulePreviewUpdate());

    // Drag and drop for topic containers
    this.setupDragDrop(this.improveContainer, 'improve');
    this.setupDragDrop(this.sustainContainer, 'sustain');
  },

  /**
   * Setup drag and drop for a container
   */
  setupDragDrop(container, type) {
    container.addEventListener('dragstart', (e) => this.handleDragStart(e));
    container.addEventListener('dragend', (e) => this.handleDragEnd(e));
    container.addEventListener('dragover', (e) => this.handleDragOver(e));
    container.addEventListener('dragenter', (e) => this.handleDragEnter(e));
    container.addEventListener('dragleave', (e) => this.handleDragLeave(e));
    container.addEventListener('drop', (e) => this.handleDrop(e, type));
  },

  /**
   * Handle drag start
   */
  handleDragStart(e) {
    if (!e.target.classList.contains('topic-card')) return;

    this.draggedElement = e.target;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', e.target.dataset.topicId);
  },

  /**
   * Handle drag end
   */
  handleDragEnd(e) {
    if (!e.target.classList.contains('topic-card')) return;

    e.target.classList.remove('dragging');
    this.draggedElement = null;

    // Remove all drag-over classes
    document.querySelectorAll('.topic-card.drag-over').forEach(el => {
      el.classList.remove('drag-over');
    });
  },

  /**
   * Handle drag over
   */
  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  },

  /**
   * Handle drag enter
   */
  handleDragEnter(e) {
    const target = e.target.closest('.topic-card');
    if (target && target !== this.draggedElement) {
      target.classList.add('drag-over');
    }
  },

  /**
   * Handle drag leave
   */
  handleDragLeave(e) {
    const target = e.target.closest('.topic-card');
    if (target) {
      target.classList.remove('drag-over');
    }
  },

  /**
   * Handle drop
   */
  handleDrop(e, type) {
    e.preventDefault();

    const target = e.target.closest('.topic-card');
    if (!target || !this.draggedElement || target === this.draggedElement) return;

    target.classList.remove('drag-over');

    const container = type === 'improve' ? this.improveContainer : this.sustainContainer;
    const cards = Array.from(container.querySelectorAll('.topic-card'));
    const draggedIndex = cards.indexOf(this.draggedElement);
    const targetIndex = cards.indexOf(target);

    if (draggedIndex < targetIndex) {
      target.parentNode.insertBefore(this.draggedElement, target.nextSibling);
    } else {
      target.parentNode.insertBefore(this.draggedElement, target);
    }

    this.updateTopicLetters(type);
    this.schedulePreviewUpdate();
    this.showToast('Topic reordered', 'info');
  },

  /**
   * Load preview preference from localStorage
   */
  loadPreviewPreference() {
    const saved = localStorage.getItem(this.PREVIEW_KEY);
    if (saved === 'true') {
      this.toggleLivePreview(true);
    }
  },

  /**
   * Toggle live preview pane
   */
  toggleLivePreview(forceState = null) {
    this.previewEnabled = forceState !== null ? forceState : !this.previewEnabled;

    if (this.previewEnabled) {
      this.previewPane.classList.add('show');
      this.mainContent.classList.add('preview-active');
      this.previewToggleBtn.classList.add('active');
      this.previewToggleBtn.setAttribute('aria-pressed', 'true');
      this.updateLivePreview();
    } else {
      this.previewPane.classList.remove('show');
      this.mainContent.classList.remove('preview-active');
      this.previewToggleBtn.classList.remove('active');
      this.previewToggleBtn.setAttribute('aria-pressed', 'false');
      // Clean up blob URL when closing
      if (this.currentBlobUrl) {
        URL.revokeObjectURL(this.currentBlobUrl);
        this.currentBlobUrl = null;
      }
    }

    // Save preference
    localStorage.setItem(this.PREVIEW_KEY, this.previewEnabled.toString());
  },

  /**
   * Schedule preview update (debounced)
   */
  schedulePreviewUpdate() {
    clearTimeout(this.previewDebounceTimer);
    this.previewDebounceTimer = setTimeout(() => {
      this.updateLivePreview();
      this.autoSave();
    }, 750);
  },

  /**
   * Update live preview with PDF blob
   */
  updateLivePreview() {
    if (!this.previewEnabled) return;

    try {
      // Show loading spinner
      if (this.previewLoading) {
        this.previewLoading.classList.add('show');
      }

      const data = this.gatherFormData();
      const pdfBlob = PDFGenerator.generateBlob(data);

      if (pdfBlob) {
        // Revoke old blob URL to prevent memory leaks
        if (this.currentBlobUrl) {
          URL.revokeObjectURL(this.currentBlobUrl);
        }

        // Create new blob URL and set iframe src
        this.currentBlobUrl = URL.createObjectURL(pdfBlob);
        this.previewFrame.src = this.currentBlobUrl;
      }
    } catch (err) {
      console.error('Preview generation error:', err);
    } finally {
      // Hide loading spinner after a short delay
      setTimeout(() => {
        if (this.previewLoading) {
          this.previewLoading.classList.remove('show');
        }
      }, 200);
    }
  },

  /**
   * Add initial topics
   */
  addInitialTopics() {
    this.addTopic('improve');
    this.addTopic('sustain');
  },

  /**
   * Set default dates
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
   */
  addTopic(type, data = null) {
    const container = type === 'improve' ? this.improveContainer : this.sustainContainer;
    const template = this.topicTemplate.content.cloneNode(true);
    const card = template.querySelector('.topic-card');

    const id = ++this.topicIdCounter;
    card.dataset.topicId = id;
    card.dataset.topicType = type;

    const existingTopics = container.querySelectorAll('.topic-card');
    const letter = String.fromCharCode(65 + existingTopics.length);
    card.querySelector('.topic-letter').textContent = letter;

    // Remove button
    card.querySelector('.remove-topic').addEventListener('click', () => {
      this.removeTopic(card, type);
    });

    // Character counter for title
    const titleInput = card.querySelector('.topic-title');
    const charCounter = card.querySelector('.char-counter');
    titleInput.addEventListener('input', () => {
      this.updateCharCounter(titleInput, charCounter, 100);
      this.schedulePreviewUpdate();
    });

    // Bind other inputs for live preview
    card.querySelector('.topic-discussion').addEventListener('input', () => this.schedulePreviewUpdate());
    card.querySelector('.topic-recommendation').addEventListener('input', () => this.schedulePreviewUpdate());

    // Populate with data if provided
    if (data) {
      titleInput.value = data.topic || '';
      card.querySelector('.topic-discussion').value = data.discussion || '';
      card.querySelector('.topic-recommendation').value = data.recommendation || '';
      this.updateCharCounter(titleInput, charCounter, 100);
    }

    container.appendChild(card);
    this.schedulePreviewUpdate();
    return card;
  },

  /**
   * Remove a topic card
   */
  removeTopic(card, type) {
    const container = type === 'improve' ? this.improveContainer : this.sustainContainer;
    const topics = container.querySelectorAll('.topic-card');

    if (topics.length <= 1) {
      this.showToast('At least one topic is required', 'error');
      return;
    }

    card.remove();
    this.updateTopicLetters(type);
    this.schedulePreviewUpdate();
  },

  /**
   * Update topic letters after reorder or removal
   */
  updateTopicLetters(type) {
    const container = type === 'improve' ? this.improveContainer : this.sustainContainer;
    const topics = container.querySelectorAll('.topic-card');
    topics.forEach((card, index) => {
      card.querySelector('.topic-letter').textContent = String.fromCharCode(65 + index);
    });
  },

  /**
   * Update character counter
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
   * Format phone number as user types
   */
  formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 10) value = value.substring(0, 10);

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
   * Gather all form data
   */
  gatherFormData() {
    return {
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
  },

  /**
   * Gather topics from a container
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
   * Export to PDF
   */
  exportPDF() {
    try {
      const data = this.gatherFormData();
      PDFGenerator.exportPDF(data);
      this.showToast('PDF exported successfully!', 'success');
    } catch (err) {
      console.error('PDF export error:', err);
      this.showToast('Failed to export PDF', 'error');
    }
  },

  /**
   * Export to Word
   */
  async exportWord() {
    try {
      const data = this.gatherFormData();
      await DOCXGenerator.exportDOCX(data);
      this.showToast('Word document exported!', 'success');
    } catch (err) {
      console.error('Word export error:', err);
      this.showToast('Failed to export Word document', 'error');
    }
  },

  /**
   * Copy plain text to clipboard
   */
  async copyToClipboard() {
    const data = this.gatherFormData();
    const content = AARBuilder.generate(data);
    const success = await AARExport.copyToClipboard(content);
    if (success) {
      this.showToast('Copied to clipboard!', 'success');
    } else {
      this.showToast('Failed to copy', 'error');
    }
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
   * Auto-save (silent)
   */
  autoSave() {
    const data = this.gatherFormData();
    Storage.save(this.STORAGE_KEY, data);
  },

  /**
   * Prompt user to load draft
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
   * Load draft on initialization
   */
  loadDraft() {
    const draft = Storage.load(this.STORAGE_KEY);
    if (draft) {
      this.populateForm(draft);
    }
  },

  /**
   * Populate form with saved data
   */
  populateForm(data) {
    const fields = [
      'unitName', 'unitAddress1', 'unitAddress2', 'ssic', 'officeCode',
      'documentDate', 'fromRank', 'fromName', 'fromBillet', 'toTitle',
      'eventName', 'eventStartDate', 'eventEndDate',
      'pocRank', 'pocName', 'pocPhone', 'pocEmail', 'signatureName'
    ];

    fields.forEach(field => {
      const el = document.getElementById(field);
      if (el && data[field] !== undefined) {
        el.value = data[field];
      }
    });

    // Clear and rebuild topics
    this.improveContainer.innerHTML = '';
    this.sustainContainer.innerHTML = '';

    if (data.improveTopics?.length > 0) {
      data.improveTopics.forEach(topic => this.addTopic('improve', topic));
    } else {
      this.addTopic('improve');
    }

    if (data.sustainTopics?.length > 0) {
      data.sustainTopics.forEach(topic => this.addTopic('sustain', topic));
    } else {
      this.addTopic('sustain');
    }

    this.schedulePreviewUpdate();
  },

  /**
   * Clear all form data
   */
  clearAll() {
    if (!confirm('Clear all form data? This cannot be undone.')) return;

    this.form.reset();
    this.improveContainer.innerHTML = '';
    this.sustainContainer.innerHTML = '';
    this.addTopic('improve');
    this.addTopic('sustain');
    this.setDefaultDates();
    document.getElementById('ssic').value = '3504';
    document.getElementById('toTitle').value = 'Operations Officer';
    Storage.remove(this.STORAGE_KEY);
    this.schedulePreviewUpdate();
    this.showToast('Form cleared', 'success');
  },

  /**
   * Show toast notification
   */
  showToast(message, type = 'success') {
    this.toastMessage.textContent = message;
    this.toast.classList.remove('toast--success', 'toast--error', 'toast--info');
    this.toast.classList.add(`toast--${type}`);
    this.toast.classList.add('toast--visible');
    setTimeout(() => this.toast.classList.remove('toast--visible'), 3000);
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => AARApp.init());
