/**
 * PDF Generator for AAR
 * Uses jsPDF to create properly formatted PDF documents
 */
const PDFGenerator = {
  // Page settings (Letter size, 1 inch margins)
  PAGE: {
    width: 8.5,
    height: 11,
    marginTop: 1,
    marginBottom: 1,
    marginLeft: 1,
    marginRight: 1
  },

  // Font settings
  FONT: {
    family: 'courier',
    size: 12,
    lineHeight: 1.15
  },

  /**
   * Generate PDF from AAR data
   * @param {Object} data - AAR form data
   * @returns {jsPDF} PDF document
   */
  generate(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      unit: 'in',
      format: 'letter'
    });

    // Set font
    doc.setFont(this.FONT.family, 'normal');
    doc.setFontSize(this.FONT.size);

    const lineHeight = this.FONT.size * this.FONT.lineHeight / 72; // Convert points to inches
    const pageWidth = this.PAGE.width - this.PAGE.marginLeft - this.PAGE.marginRight;
    const charsPerLine = Math.floor(pageWidth * 10); // Approximate chars per line

    let y = this.PAGE.marginTop;
    const x = this.PAGE.marginLeft;

    // Helper to add line and handle page breaks
    const addLine = (text, indent = 0) => {
      if (y > this.PAGE.height - this.PAGE.marginBottom - lineHeight) {
        doc.addPage();
        y = this.PAGE.marginTop;
      }
      doc.text(text, x + indent, y);
      y += lineHeight;
    };

    // Helper to wrap and add text
    const addWrappedText = (text, indent = 0, firstLineIndent = 0) => {
      const maxWidth = pageWidth - indent;
      const lines = doc.splitTextToSize(text, maxWidth);
      lines.forEach((line, i) => {
        const lineIndent = i === 0 ? firstLineIndent : indent;
        addLine(line, lineIndent);
      });
    };

    // Header
    addLine('UNITED STATES MARINE CORPS');
    addLine(data.unitName || '[UNIT NAME]');
    if (data.unitAddress1) addLine(data.unitAddress1);
    if (data.unitAddress2) addLine(data.unitAddress2);
    addLine('');

    // Reply Refer To (right-aligned)
    const rightX = this.PAGE.width - this.PAGE.marginRight;
    doc.text('IN REPLY REFER TO:', rightX, y, { align: 'right' });
    y += lineHeight;
    doc.text(data.ssic || '3504', rightX, y, { align: 'right' });
    y += lineHeight;
    if (data.officeCode) {
      doc.text(data.officeCode, rightX, y, { align: 'right' });
      y += lineHeight;
    }
    doc.text(DateUtils.formatMilitaryShort(data.documentDate) || '[DATE]', rightX, y, { align: 'right' });
    y += lineHeight;
    addLine('');

    // From / To
    const fromLine = this.buildFromLine(data);
    addLine(`From:  ${fromLine}`);
    addLine(`To:    ${data.toTitle || 'Operations Officer'}`);
    addLine('');

    // Subject
    const subjectLine = AARBuilder.buildSubjectLine(data);
    addWrappedText(`Subj:  ${subjectLine}`);
    addLine('');

    // Reference
    addLine('Ref:   (a) MCO 3504.1 Marine Corps Lessons Learned Program (MCLLP) and the');
    addLine('           Marine Corps Center for Lessons Learned (MCCLL)', 0.5);
    addLine('');

    // IMPROVE Section
    addLine('1.  IMPROVE.  This paragraph is used to discuss areas of the event that occurred');
    addLine('during any of the phases that needs to be improved.');
    addLine('');

    if (data.improveTopics && data.improveTopics.length > 0) {
      data.improveTopics.forEach((topic, index) => {
        const letter = String.fromCharCode(97 + index);
        this.addTopic(doc, addLine, addWrappedText, letter, topic, lineHeight);
      });
    } else {
      addLine('    a.  None identified.');
      addLine('');
    }

    // SUSTAIN Section
    addLine('2.  SUSTAIN.  This paragraph is used to discuss areas of the event that occurred');
    addLine('during any of the phases that should be sustained because they were effective.');
    addLine('');

    if (data.sustainTopics && data.sustainTopics.length > 0) {
      data.sustainTopics.forEach((topic, index) => {
        const letter = String.fromCharCode(97 + index);
        this.addTopic(doc, addLine, addWrappedText, letter, topic, lineHeight);
      });
    } else {
      addLine('    a.  None identified.');
      addLine('');
    }

    // POC
    const pocLine = AARBuilder.buildPOCLine(data);
    addWrappedText(`3.  ${pocLine}`);
    addLine('');
    addLine('');

    // Signature (right-aligned area)
    const sigX = this.PAGE.marginLeft + 3.5;
    doc.text(data.signatureName || '[SIGNATURE]', sigX, y);

    return doc;
  },

  /**
   * Add a topic section to the PDF
   */
  addTopic(doc, addLine, addWrappedText, letter, topic, lineHeight) {
    addLine(`    ${letter}.  ${topic.topic || '[Topic description]'}`);
    addLine('');

    // Discussion
    addLine('        (1) Discussion.');
    if (topic.discussion) {
      addWrappedText(topic.discussion, 0.9);
    }
    addLine('');

    // Recommendation
    addLine('        (2) Recommendation.');
    if (topic.recommendation) {
      addWrappedText(topic.recommendation, 0.9);
    }
    addLine('');
  },

  /**
   * Build From line
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
   * Export PDF to file
   * @param {Object} data - AAR form data
   */
  exportPDF(data) {
    const doc = this.generate(data);
    const filename = this.generateFilename(data);
    doc.save(filename);
  },

  /**
   * Generate filename
   */
  generateFilename(data) {
    const date = DateUtils.formatNumeric(data.documentDate || new Date());
    const eventName = (data.eventName || 'AAR')
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 30);
    return `AAR_${eventName}_${date}.pdf`;
  }
};
