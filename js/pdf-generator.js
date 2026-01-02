/**
 * AAR Generator - PDF Generator
 * Generates SECNAV M-5216.5 compliant naval letter format PDF
 * Based on Naval Letter Generator formatting engine
 */
const PDFGenerator = {
  /**
   * Generate PDF from AAR data in proper naval letter format
   * @param {Object} data - AAR form data
   * @returns {jsPDF} PDF document
   */
  generate(data) {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });

    // Page dimensions (in points) - SECNAV M-5216.5 standard
    const PW = 612;       // Page width (8.5")
    const PH = 792;       // Page height (11")
    const ML = 72;        // Margin left (1")
    const MR = 72;        // Margin right (1")
    const MT = 72;        // Margin top (1")
    const MB = 72;        // Margin bottom (1")
    const CW = PW - ML - MR;  // Content width
    const TAB = 45;       // Tab width for labels (From:, To:, etc.)

    // Font settings - Times New Roman, 12pt per SECNAV M-5216.5
    const fontName = 'times';
    const fontSize = 12;
    const LH = TextUtils.getLineHeight(fontSize);  // Proper 1.17x line height

    // Paragraph indentation per SECNAV M-5216.5
    const IM = 15;        // Main paragraph text indent (after "1.")
    const IS = 16;        // Sub-paragraph indent (after "a.")
    const ISS = 18;       // Sub-sub indent (after "(1)")

    let y = 54;           // Start position (letterhead area)
    let pageNum = 1;

    // Build subject line for continuation headers
    const subjText = AARBuilder.buildSubjectLine(data).toUpperCase();

    /**
     * Handle page break with continuation header
     */
    function pageBreak(need) {
      if (y + need > PH - MB) {
        pdf.addPage();
        pageNum++;
        y = MT;

        // Continuation header - subject line
        pdf.setFont(fontName, 'normal');
        pdf.setFontSize(fontSize);
        pdf.text('Subj:', ML, y);
        const subjLines = pdf.splitTextToSize(subjText, CW - TAB);
        subjLines.forEach((line) => {
          pdf.text(line, ML + TAB, y);
          y += LH;
        });
        y += LH;
      }
    }

    /**
     * Add wrapped text with double spacing after periods
     */
    function addText(text, x, maxWidth) {
      if (!text) return;
      const processed = TextUtils.ensureDoubleSpaces(text);
      const lines = pdf.splitTextToSize(processed, maxWidth);
      lines.forEach((line) => {
        pageBreak(LH);
        pdf.text(line, x, y);
        y += LH;
      });
    }

    // ========================================
    // LETTERHEAD (centered, smaller font)
    // ========================================
    pdf.setFont(fontName, 'bold');
    pdf.setFontSize(10);
    pdf.text('UNITED STATES MARINE CORPS', PW / 2, y, { align: 'center' });
    y += 12;

    pdf.setFont(fontName, 'normal');
    pdf.setFontSize(8);
    if (data.unitName) {
      pdf.text(data.unitName.toUpperCase(), PW / 2, y, { align: 'center' });
      y += 10;
    }
    if (data.unitAddress1) {
      pdf.text(data.unitAddress1.toUpperCase(), PW / 2, y, { align: 'center' });
      y += 10;
    }
    if (data.unitAddress2) {
      pdf.text(data.unitAddress2.toUpperCase(), PW / 2, y, { align: 'center' });
      y += 10;
    }
    y = Math.max(y, 130);

    // ========================================
    // HEADER BLOCK (right-aligned sender info)
    // ========================================
    pdf.setFont(fontName, 'normal');
    pdf.setFontSize(fontSize);
    const senderX = PW - MR - 72;

    // "IN REPLY REFER TO:" label (6pt, positioned above SSIC)
    pdf.setFontSize(6);
    pdf.text('IN REPLY REFER TO:', senderX, y - 11);
    pdf.setFontSize(fontSize);

    // SSIC
    pdf.text(data.ssic || '3504', senderX, y);
    y += LH;

    // Office code (if provided)
    if (data.officeCode) {
      pdf.text(data.officeCode, senderX, y);
      y += LH;
    }

    // Date
    pdf.text(DateUtils.formatMilitaryShort(data.documentDate) || '[DATE]', senderX, y);
    y += LH * 2;

    // ========================================
    // FROM / TO
    // ========================================
    pdf.text('From:', ML, y);
    const fromLine = AARBuilder.buildFromLine(data);
    pdf.splitTextToSize(fromLine, CW - TAB).forEach(line => {
      pdf.text(line, ML + TAB, y);
      y += LH;
    });

    pdf.text('To:', ML, y);
    pdf.text(data.toTitle || 'Operations Officer', ML + TAB, y);
    y += LH;

    // ========================================
    // SUBJECT
    // ========================================
    y += LH;
    pageBreak(LH * 2);
    pdf.text('Subj:', ML, y);
    pdf.splitTextToSize(subjText, CW - TAB).forEach(line => {
      pdf.text(line, ML + TAB, y);
      y += LH;
    });

    // ========================================
    // REFERENCE
    // ========================================
    y += LH;
    pageBreak(LH * 3);
    pdf.text('Ref:', ML, y);
    const refText = '(a)  MCO 3504.1 Marine Corps Lessons Learned Program (MCLLP)';
    pdf.text(refText, ML + TAB, y);
    y += LH;
    pdf.text('     and the Marine Corps Center for Lessons Learned (MCCLL)', ML + TAB, y);
    y += LH;

    // ========================================
    // PARAGRAPH 1: IMPROVE
    // ========================================
    y += LH;
    pageBreak(LH * 4);
    pdf.text('1.', ML, y);
    pdf.setFont(fontName, 'bold');
    pdf.text('IMPROVE', ML + IM, y);
    pdf.setFont(fontName, 'normal');
    y += LH;

    // IMPROVE Topics
    if (data.improveTopics && data.improveTopics.length > 0) {
      data.improveTopics.forEach((topic, index) => {
        y += LH;
        pageBreak(LH * 6);
        const letter = TextUtils.getLetter(index) + '.';

        // Topic title
        pdf.text(letter, ML + IM, y);
        const topicText = TextUtils.ensureDoubleSpaces(topic.topic || '[Topic description]');
        const topicX = ML + IM + pdf.getTextWidth(letter) + 4;
        const topicWidth = CW - IM - pdf.getTextWidth(letter) - 4;
        const topicLines = pdf.splitTextToSize(topicText, topicWidth);
        topicLines.forEach((line, i) => {
          if (i > 0) pageBreak(LH);
          pdf.text(line, i === 0 ? topicX : ML, y);
          y += LH;
        });

        // (1) Discussion
        pageBreak(LH * 3);
        pdf.text('(1)', ML + IM + IS, y);
        pdf.setFont(fontName, 'bold');
        pdf.text('Discussion.', ML + IM + IS + pdf.getTextWidth('(1)') + 4, y);
        pdf.setFont(fontName, 'normal');
        y += LH;

        if (topic.discussion) {
          const discText = TextUtils.ensureDoubleSpaces(topic.discussion);
          const discLines = pdf.splitTextToSize(discText, CW);
          discLines.forEach(line => {
            pageBreak(LH);
            pdf.text(line, ML, y);
            y += LH;
          });
        }

        // (2) Recommendation
        pageBreak(LH * 3);
        pdf.text('(2)', ML + IM + IS, y);
        pdf.setFont(fontName, 'bold');
        pdf.text('Recommendation.', ML + IM + IS + pdf.getTextWidth('(2)') + 4, y);
        pdf.setFont(fontName, 'normal');
        y += LH;

        if (topic.recommendation) {
          const recText = TextUtils.ensureDoubleSpaces(topic.recommendation);
          const recLines = pdf.splitTextToSize(recText, CW);
          recLines.forEach(line => {
            pageBreak(LH);
            pdf.text(line, ML, y);
            y += LH;
          });
        }
      });
    } else {
      y += LH;
      pdf.text('a.', ML + IM, y);
      pdf.text('None identified.', ML + IM + pdf.getTextWidth('a.') + 4, y);
      y += LH;
    }

    // ========================================
    // PARAGRAPH 2: SUSTAIN
    // ========================================
    y += LH;
    pageBreak(LH * 4);
    pdf.text('2.', ML, y);
    pdf.setFont(fontName, 'bold');
    pdf.text('SUSTAIN', ML + IM, y);
    pdf.setFont(fontName, 'normal');
    y += LH;

    // SUSTAIN Topics
    if (data.sustainTopics && data.sustainTopics.length > 0) {
      data.sustainTopics.forEach((topic, index) => {
        y += LH;
        pageBreak(LH * 6);
        const letter = TextUtils.getLetter(index) + '.';

        // Topic title
        pdf.text(letter, ML + IM, y);
        const topicText = TextUtils.ensureDoubleSpaces(topic.topic || '[Topic description]');
        const topicX = ML + IM + pdf.getTextWidth(letter) + 4;
        const topicWidth = CW - IM - pdf.getTextWidth(letter) - 4;
        const topicLines = pdf.splitTextToSize(topicText, topicWidth);
        topicLines.forEach((line, i) => {
          if (i > 0) pageBreak(LH);
          pdf.text(line, i === 0 ? topicX : ML, y);
          y += LH;
        });

        // (1) Discussion
        pageBreak(LH * 3);
        pdf.text('(1)', ML + IM + IS, y);
        pdf.setFont(fontName, 'bold');
        pdf.text('Discussion.', ML + IM + IS + pdf.getTextWidth('(1)') + 4, y);
        pdf.setFont(fontName, 'normal');
        y += LH;

        if (topic.discussion) {
          const discText = TextUtils.ensureDoubleSpaces(topic.discussion);
          const discLines = pdf.splitTextToSize(discText, CW);
          discLines.forEach(line => {
            pageBreak(LH);
            pdf.text(line, ML, y);
            y += LH;
          });
        }

        // (2) Recommendation
        pageBreak(LH * 3);
        pdf.text('(2)', ML + IM + IS, y);
        pdf.setFont(fontName, 'bold');
        pdf.text('Recommendation.', ML + IM + IS + pdf.getTextWidth('(2)') + 4, y);
        pdf.setFont(fontName, 'normal');
        y += LH;

        if (topic.recommendation) {
          const recText = TextUtils.ensureDoubleSpaces(topic.recommendation);
          const recLines = pdf.splitTextToSize(recText, CW);
          recLines.forEach(line => {
            pageBreak(LH);
            pdf.text(line, ML, y);
            y += LH;
          });
        }
      });
    } else {
      y += LH;
      pdf.text('a.', ML + IM, y);
      pdf.text('None identified.', ML + IM + pdf.getTextWidth('a.') + 4, y);
      y += LH;
    }

    // ========================================
    // PARAGRAPH 3: POC
    // ========================================
    y += LH;
    pageBreak(LH * 3);
    pdf.text('3.', ML, y);
    const pocLine = TextUtils.ensureDoubleSpaces(AARBuilder.buildPOCLine(data));
    const pocLines = pdf.splitTextToSize(pocLine, CW - IM);
    pocLines.forEach((line, i) => {
      pdf.text(line, i === 0 ? ML + IM : ML, y);
      y += LH;
    });

    // ========================================
    // SIGNATURE BLOCK
    // ========================================
    // Ensure signature block doesn't orphan
    const sigHeight = LH * 5;
    if (y + sigHeight > PH - MB) {
      pageBreak(sigHeight);
    }

    y += LH * 4;
    const sigX = PW / 2;
    pdf.setFont(fontName, 'normal');
    pdf.text((data.signatureName || '[SIGNATURE]').toUpperCase(), sigX, y);

    // ========================================
    // PAGE NUMBERS (page 2+)
    // ========================================
    if (pdf.getNumberOfPages() > 1) {
      for (let i = 2; i <= pdf.getNumberOfPages(); i++) {
        pdf.setPage(i);
        pdf.setFont(fontName, 'normal');
        pdf.setFontSize(fontSize);
        pdf.text(String(i), PW / 2, PH - 36, { align: 'center' });
      }
    }

    return pdf;
  },

  /**
   * Generate PDF as Blob for preview
   * @param {Object} data - AAR form data
   * @returns {Blob} PDF blob
   */
  generateBlob(data) {
    const doc = this.generate(data);
    return doc.output('blob');
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
   * Generate filename based on event name and date
   * @param {Object} data - AAR form data
   * @returns {string} Filename
   */
  generateFilename(data) {
    const date = DateUtils.formatNumeric(data.documentDate || new Date());
    const eventName = (data.eventName || 'AAR')
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 30);
    return `AAR_${eventName}_${date}.pdf`;
  }
};
