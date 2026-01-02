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

    // Tab width for header labels (From:, To:, etc.)
    const TAB = 45;

    // Font settings - Times New Roman, 12pt per SECNAV M-5216.5
    const fontName = 'times';
    const fontSize = 12;
    const LH = TextUtils.getLineHeight(fontSize);  // 1.17x line height

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
     * Render paragraph text on same line as label, wrapping to left margin
     * This matches NLG's renderFormattedText behavior
     */
    function renderParagraph(label, labelX, text, textIndent) {
      const processed = TextUtils.ensureDoubleSpaces(text);
      const labelWidth = pdf.getTextWidth(label);
      const textX = labelX + labelWidth + 4;  // 4pt gap after label
      const firstLineWidth = CW - (labelX - ML) - labelWidth - 4;

      // Draw the label
      pdf.text(label, labelX, y);

      // Split text to fit first line, then wrap to left margin
      const words = processed.split(' ');
      let currentLine = '';
      let isFirstLine = true;
      let currentX = textX;
      let currentMaxWidth = firstLineWidth;

      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const testLine = currentLine ? currentLine + ' ' + word : word;
        const testWidth = pdf.getTextWidth(testLine);

        if (testWidth > currentMaxWidth && currentLine) {
          // Draw current line
          pdf.text(currentLine, currentX, y);
          y += LH;
          pageBreak(LH);

          // Move to left margin for continuation
          currentLine = word;
          isFirstLine = false;
          currentX = ML;
          currentMaxWidth = CW;
        } else {
          currentLine = testLine;
        }
      }

      // Draw remaining text
      if (currentLine) {
        pdf.text(currentLine, currentX, y);
        y += LH;
      }
    }

    // ========================================
    // LETTERHEAD (centered, per SECNAV M-5216.5)
    // ========================================
    pdf.setFont(fontName, 'bold');
    pdf.setFontSize(fontSize - 2);  // 10pt
    pdf.text('UNITED STATES MARINE CORPS', PW / 2, y, { align: 'center' });
    y += 12;

    // Unit name - bold (organizational identification)
    if (data.unitName) {
      pdf.setFont(fontName, 'bold');
      pdf.setFontSize(fontSize - 4);  // 8pt
      pdf.text(data.unitName.toUpperCase(), PW / 2, y, { align: 'center' });
      y += 10;
    }

    // Unit address - normal weight
    pdf.setFont(fontName, 'normal');
    pdf.setFontSize(fontSize - 4);  // 8pt
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
    const refLines = pdf.splitTextToSize(
      '(a)  MCO 3504.1 Marine Corps Lessons Learned Program (MCLLP) and the Marine Corps Center for Lessons Learned (MCCLL)',
      CW - TAB
    );
    refLines.forEach((line) => {
      pdf.text(line, ML + TAB, y);
      y += LH;
    });

    // ========================================
    // PARAGRAPH 1: IMPROVE
    // ========================================
    y += LH;
    pageBreak(LH * 4);

    // "1.  Improve.  This paragraph..." - text continues on same line
    const improveIntro = 'Improve.  This paragraph discusses areas of the event that need to be improved.';
    renderParagraph('1.', ML, improveIntro, IM);

    // IMPROVE Topics
    if (data.improveTopics && data.improveTopics.length > 0) {
      data.improveTopics.forEach((topic, index) => {
        y += LH;  // Blank line before each topic
        pageBreak(LH * 6);

        const letter = TextUtils.getLetter(index) + '.';
        const topicText = topic.topic || '[Topic description]';

        // "a.  Topic text continues on same line..."
        renderParagraph(letter, ML + IM, topicText, IS);

        // (1)  Discussion.  Text continues on same line...
        if (topic.discussion) {
          pageBreak(LH * 2);
          const discText = 'Discussion.  ' + topic.discussion;
          renderParagraph('(1)', ML + IM + IS, discText, ISS);
        }

        // (2)  Recommendation.  Text continues on same line...
        if (topic.recommendation) {
          pageBreak(LH * 2);
          const recText = 'Recommendation.  ' + topic.recommendation;
          renderParagraph('(2)', ML + IM + IS, recText, ISS);
        }
      });
    } else {
      y += LH;
      renderParagraph('a.', ML + IM, 'None identified.', IS);
    }

    // ========================================
    // PARAGRAPH 2: SUSTAIN
    // ========================================
    y += LH;
    pageBreak(LH * 4);

    // "2.  Sustain.  This paragraph..." - text continues on same line
    const sustainIntro = 'Sustain.  This paragraph discusses areas of the event that should be sustained because they were effective.';
    renderParagraph('2.', ML, sustainIntro, IM);

    // SUSTAIN Topics
    if (data.sustainTopics && data.sustainTopics.length > 0) {
      data.sustainTopics.forEach((topic, index) => {
        y += LH;  // Blank line before each topic
        pageBreak(LH * 6);

        const letter = TextUtils.getLetter(index) + '.';
        const topicText = topic.topic || '[Topic description]';

        // "a.  Topic text continues on same line..."
        renderParagraph(letter, ML + IM, topicText, IS);

        // (1)  Discussion.  Text continues on same line...
        if (topic.discussion) {
          pageBreak(LH * 2);
          const discText = 'Discussion.  ' + topic.discussion;
          renderParagraph('(1)', ML + IM + IS, discText, ISS);
        }

        // (2)  Recommendation.  Text continues on same line...
        if (topic.recommendation) {
          pageBreak(LH * 2);
          const recText = 'Recommendation.  ' + topic.recommendation;
          renderParagraph('(2)', ML + IM + IS, recText, ISS);
        }
      });
    } else {
      y += LH;
      renderParagraph('a.', ML + IM, 'None identified.', IS);
    }

    // ========================================
    // PARAGRAPH 3: POC
    // ========================================
    y += LH;
    pageBreak(LH * 3);
    const pocText = AARBuilder.buildPOCLine(data);
    renderParagraph('3.', ML, pocText, IM);

    // ========================================
    // SIGNATURE BLOCK
    // ========================================
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
   */
  generateBlob(data) {
    const doc = this.generate(data);
    return doc.output('blob');
  },

  /**
   * Export PDF to file
   */
  exportPDF(data) {
    const doc = this.generate(data);
    const filename = this.generateFilename(data);
    doc.save(filename);
  },

  /**
   * Generate filename based on event name and date
   */
  generateFilename(data) {
    const date = DateUtils.formatNumeric(data.documentDate || new Date());
    const eventName = (data.eventName || 'AAR')
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 30);
    return `AAR_${eventName}_${date}.pdf`;
  }
};
