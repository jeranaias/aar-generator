/**
 * AAR Builder - Core logic for generating After Action Reports
 * Formats AAR according to TECOM format (HQBN Enclosure 12)
 */
const AARBuilder = {
  /**
   * Generate complete AAR text from form data
   * @param {Object} data - AAR form data
   * @returns {string} Formatted AAR text
   */
  generate(data) {
    const lines = [];

    // Header - Unit Information
    lines.push('UNITED STATES MARINE CORPS');
    lines.push(data.unitName || '[UNIT NAME]');
    if (data.unitAddress1) lines.push(data.unitAddress1);
    if (data.unitAddress2) lines.push(data.unitAddress2);
    lines.push('');

    // Reply Refer To block (right-aligned in actual document)
    lines.push('                                                        IN REPLY REFER TO:');
    lines.push(`                                                        ${data.ssic || '3504'}`);
    if (data.officeCode) {
      lines.push(`                                                        ${data.officeCode}`);
    }
    lines.push(`                                                        ${DateUtils.formatMilitaryShort(data.documentDate) || '[DATE]'}`);
    lines.push('');

    // From/To
    const fromLine = this.buildFromLine(data);
    lines.push(`From:  ${fromLine}`);
    lines.push(`To:    ${data.toTitle || 'Operations Officer'}`);
    lines.push('');

    // Subject
    const subjectLine = this.buildSubjectLine(data);
    lines.push(`Subj:  ${subjectLine}`);
    lines.push('');

    // Reference
    lines.push('Ref:   (a) MCO 3504.1 Marine Corps Lessons Learned Program (MCLLP) and the');
    lines.push('           Marine Corps Center for Lessons Learned (MCCLL)');
    lines.push('');

    // IMPROVE Section
    lines.push('1.  IMPROVE.  This paragraph is used to discuss areas of the event that occurred');
    lines.push('during any of the phases that needs to be improved.');
    lines.push('');

    if (data.improveTopics && data.improveTopics.length > 0) {
      data.improveTopics.forEach((topic, index) => {
        const letter = this.indexToLetter(index);
        lines.push(...this.formatTopic(letter, topic));
      });
    } else {
      lines.push('    a.  None identified.');
      lines.push('');
    }

    // SUSTAIN Section
    lines.push('2.  SUSTAIN.  This paragraph is used to discuss areas of the event that occurred');
    lines.push('during any of the phases that should be sustained because they were effective.');
    lines.push('');

    if (data.sustainTopics && data.sustainTopics.length > 0) {
      data.sustainTopics.forEach((topic, index) => {
        const letter = this.indexToLetter(index);
        lines.push(...this.formatTopic(letter, topic));
      });
    } else {
      lines.push('    a.  None identified.');
      lines.push('');
    }

    // POC
    const pocLine = this.buildPOCLine(data);
    lines.push(`3.  ${pocLine}`);
    lines.push('');
    lines.push('');

    // Signature
    lines.push(`                                        ${data.signatureName || '[SIGNATURE]'}`);

    return lines.join('\n');
  },

  /**
   * Build the From line
   * @param {Object} data - Form data
   * @returns {string} Formatted From line
   */
  buildFromLine(data) {
    const parts = [];
    if (data.fromRank) parts.push(data.fromRank);
    if (data.fromName) parts.push(data.fromName);
    if (data.fromBillet) {
      if (parts.length > 0) {
        return `${parts.join(' ')}, ${data.fromBillet}`;
      }
      return data.fromBillet;
    }
    return parts.join(' ') || '[FROM]';
  },

  /**
   * Build the Subject line
   * @param {Object} data - Form data
   * @returns {string} Formatted subject line
   */
  buildSubjectLine(data) {
    const eventName = (data.eventName || '[EVENT]').toUpperCase();
    const startDate = DateUtils.formatSubjectLine(data.eventStartDate) || '[START DATE]';
    const endDate = DateUtils.formatSubjectLine(data.eventEndDate) || '[END DATE]';

    return `AFTER ACTION REPORT FOR ${eventName} CONDUCTED FROM ${startDate} TO ${endDate}`;
  },

  /**
   * Build the POC paragraph
   * @param {Object} data - Form data
   * @returns {string} Formatted POC paragraph
   */
  buildPOCLine(data) {
    const parts = [];
    if (data.pocRank) parts.push(data.pocRank);
    if (data.pocName) parts.push(data.pocName);

    const name = parts.join(' ') || '[POC NAME]';
    const phone = data.pocPhone || '(XXX) XXX-XXXX';
    const email = data.pocEmail || 'email@usmc.mil';

    return `The point of contact regarding this report is ${name} at ${phone} or ${email}.`;
  },

  /**
   * Format a single topic with proper indentation
   * @param {string} letter - Topic letter (a, b, c, etc.)
   * @param {Object} topic - Topic data
   * @returns {string[]} Array of formatted lines
   */
  formatTopic(letter, topic) {
    const lines = [];

    // Topic line
    lines.push(`    ${letter}.  ${topic.topic || '[Topic description]'}`);
    lines.push('');

    // Discussion
    lines.push('        (1) Discussion.  ' + this.wrapText(topic.discussion || '[Discussion text]', 72, '            '));
    lines.push('');

    // Recommendation
    lines.push('        (2) Recommendation.  ' + this.wrapText(topic.recommendation || '[Recommendation text]', 72, '            '));
    lines.push('');

    return lines;
  },

  /**
   * Convert index to lowercase letter (0=a, 1=b, etc.)
   * @param {number} index - Zero-based index
   * @returns {string} Lowercase letter
   */
  indexToLetter(index) {
    return String.fromCharCode(97 + index);
  },

  /**
   * Wrap text at specified width with proper indentation
   * @param {string} text - Text to wrap
   * @param {number} width - Max line width
   * @param {string} indent - Indentation for continuation lines
   * @returns {string} Wrapped text (first line only, continuation handled separately)
   */
  wrapText(text, width, indent) {
    if (!text) return '';

    // For simplicity, return the text as-is
    // Full word wrapping could be implemented for a more polished output
    return text.replace(/\n/g, '\n' + indent);
  },

  /**
   * Get subject line preview
   * @param {Object} data - Form data
   * @returns {string} Subject line preview
   */
  getSubjectPreview(data) {
    const eventName = (data.eventName || '[EVENT]').toUpperCase();
    const startDate = data.eventStartDate
      ? DateUtils.formatSubjectLine(data.eventStartDate)
      : '[START DATE]';
    const endDate = data.eventEndDate
      ? DateUtils.formatSubjectLine(data.eventEndDate)
      : '[END DATE]';

    return `AFTER ACTION REPORT FOR ${eventName} CONDUCTED FROM ${startDate} TO ${endDate}`;
  },

  /**
   * Validate AAR data
   * @param {Object} data - Form data
   * @returns {Object} Validation result { valid: boolean, errors: string[] }
   */
  validate(data) {
    const errors = [];

    // Required fields
    if (!data.unitName?.trim()) errors.push('Unit Name is required');
    if (!data.documentDate) errors.push('Document Date is required');
    if (!data.fromRank) errors.push('From Rank is required');
    if (!data.fromName?.trim()) errors.push('From Name is required');
    if (!data.fromBillet?.trim()) errors.push('From Billet is required');
    if (!data.toTitle?.trim()) errors.push('To field is required');
    if (!data.eventName?.trim()) errors.push('Event Name is required');
    if (!data.eventStartDate) errors.push('Event Start Date is required');
    if (!data.eventEndDate) errors.push('Event End Date is required');
    if (!data.pocRank) errors.push('POC Rank is required');
    if (!data.pocName?.trim()) errors.push('POC Name is required');
    if (!data.pocPhone?.trim()) errors.push('POC Phone is required');
    if (!data.pocEmail?.trim()) errors.push('POC Email is required');
    if (!data.signatureName?.trim()) errors.push('Signature Name is required');

    // Date validation
    if (data.eventStartDate && data.eventEndDate) {
      if (!DateUtils.validateDateRange(data.eventStartDate, data.eventEndDate)) {
        errors.push('End Date must be on or after Start Date');
      }
    }

    // Phone format
    if (data.pocPhone && !/^\(\d{3}\) \d{3}-\d{4}$/.test(data.pocPhone)) {
      errors.push('Phone should be in format (XXX) XXX-XXXX');
    }

    // Email format
    if (data.pocEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.pocEmail)) {
      errors.push('Invalid email format');
    }

    // Topic validation
    if (!data.improveTopics || data.improveTopics.length === 0) {
      errors.push('At least one IMPROVE topic is required');
    } else {
      data.improveTopics.forEach((topic, i) => {
        if (!topic.topic?.trim()) errors.push(`IMPROVE Topic ${i + 1}: Topic is required`);
        if (!topic.discussion?.trim()) errors.push(`IMPROVE Topic ${i + 1}: Discussion is required`);
        if (!topic.recommendation?.trim()) errors.push(`IMPROVE Topic ${i + 1}: Recommendation is required`);
      });
    }

    if (!data.sustainTopics || data.sustainTopics.length === 0) {
      errors.push('At least one SUSTAIN topic is required');
    } else {
      data.sustainTopics.forEach((topic, i) => {
        if (!topic.topic?.trim()) errors.push(`SUSTAIN Topic ${i + 1}: Topic is required`);
        if (!topic.discussion?.trim()) errors.push(`SUSTAIN Topic ${i + 1}: Discussion is required`);
        if (!topic.recommendation?.trim()) errors.push(`SUSTAIN Topic ${i + 1}: Recommendation is required`);
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
};
