/**
 * DOCX Generator for AAR
 * Uses docx library to create properly formatted Word documents
 */
const DOCXGenerator = {
  /**
   * Export AAR to Word document
   * @param {Object} data - AAR form data
   */
  async exportDOCX(data) {
    const { Document, Packer, Paragraph, TextRun, AlignmentType, TabStopType, TabStopPosition, convertInchesToTwip } = docx;

    // Document styles
    const FONT = 'Times New Roman';
    const FONT_SIZE = 24; // Half-points (12pt = 24)
    const LINE_SPACING = 276; // ~1.15 line spacing

    // Helper to create a paragraph
    const createPara = (text, options = {}) => {
      const defaultOptions = {
        spacing: { after: 0, line: LINE_SPACING },
        children: [
          new TextRun({
            text: text,
            font: FONT,
            size: FONT_SIZE,
            ...options.textOptions
          })
        ]
      };
      return new Paragraph({ ...defaultOptions, ...options });
    };

    // Build document sections
    const children = [];

    // Header - Unit Info
    children.push(createPara('UNITED STATES MARINE CORPS'));
    children.push(createPara(data.unitName || '[UNIT NAME]'));
    if (data.unitAddress1) children.push(createPara(data.unitAddress1));
    if (data.unitAddress2) children.push(createPara(data.unitAddress2));
    children.push(createPara('')); // Blank line

    // Reply Refer To block (right-aligned)
    children.push(new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 0, line: LINE_SPACING },
      children: [new TextRun({ text: 'IN REPLY REFER TO:', font: FONT, size: FONT_SIZE })]
    }));
    children.push(new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 0, line: LINE_SPACING },
      children: [new TextRun({ text: data.ssic || '3504', font: FONT, size: FONT_SIZE })]
    }));
    if (data.officeCode) {
      children.push(new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { after: 0, line: LINE_SPACING },
        children: [new TextRun({ text: data.officeCode, font: FONT, size: FONT_SIZE })]
      }));
    }
    children.push(new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 0, line: LINE_SPACING },
      children: [new TextRun({ text: DateUtils.formatMilitaryShort(data.documentDate) || '[DATE]', font: FONT, size: FONT_SIZE })]
    }));
    children.push(createPara('')); // Blank line

    // From / To / Subj
    const fromLine = this.buildFromLine(data);
    children.push(new Paragraph({
      spacing: { after: 0, line: LINE_SPACING },
      tabStops: [{ type: TabStopType.LEFT, position: convertInchesToTwip(0.625) }],
      children: [
        new TextRun({ text: 'From:', font: FONT, size: FONT_SIZE }),
        new TextRun({ text: '\t' }),
        new TextRun({ text: fromLine, font: FONT, size: FONT_SIZE })
      ]
    }));

    children.push(new Paragraph({
      spacing: { after: 0, line: LINE_SPACING },
      tabStops: [{ type: TabStopType.LEFT, position: convertInchesToTwip(0.625) }],
      children: [
        new TextRun({ text: 'To:', font: FONT, size: FONT_SIZE }),
        new TextRun({ text: '\t' }),
        new TextRun({ text: data.toTitle || 'Operations Officer', font: FONT, size: FONT_SIZE })
      ]
    }));
    children.push(createPara('')); // Blank line

    // Subject
    const subjectLine = AARBuilder.buildSubjectLine(data);
    children.push(new Paragraph({
      spacing: { after: 0, line: LINE_SPACING },
      tabStops: [{ type: TabStopType.LEFT, position: convertInchesToTwip(0.625) }],
      children: [
        new TextRun({ text: 'Subj:', font: FONT, size: FONT_SIZE }),
        new TextRun({ text: '\t' }),
        new TextRun({ text: subjectLine, font: FONT, size: FONT_SIZE })
      ]
    }));
    children.push(createPara('')); // Blank line

    // Reference
    children.push(new Paragraph({
      spacing: { after: 0, line: LINE_SPACING },
      tabStops: [{ type: TabStopType.LEFT, position: convertInchesToTwip(0.625) }],
      children: [
        new TextRun({ text: 'Ref:', font: FONT, size: FONT_SIZE }),
        new TextRun({ text: '\t' }),
        new TextRun({ text: '(a) MCO 3504.1 Marine Corps Lessons Learned Program (MCLLP) and the', font: FONT, size: FONT_SIZE })
      ]
    }));
    children.push(new Paragraph({
      spacing: { after: 0, line: LINE_SPACING },
      indent: { left: convertInchesToTwip(0.625) },
      children: [new TextRun({ text: '    Marine Corps Center for Lessons Learned (MCCLL)', font: FONT, size: FONT_SIZE })]
    }));
    children.push(createPara('')); // Blank line

    // IMPROVE Section
    children.push(new Paragraph({
      spacing: { after: 0, line: LINE_SPACING },
      children: [
        new TextRun({ text: '1.  ', font: FONT, size: FONT_SIZE }),
        new TextRun({ text: 'IMPROVE', font: FONT, size: FONT_SIZE, bold: true })
      ]
    }));
    children.push(createPara('')); // Blank line

    if (data.improveTopics && data.improveTopics.length > 0) {
      data.improveTopics.forEach((topic, index) => {
        const letter = String.fromCharCode(97 + index);
        this.addTopicToDoc(children, letter, topic, FONT, FONT_SIZE, LINE_SPACING);
      });
    } else {
      children.push(createPara('    a.  None identified.'));
      children.push(createPara(''));
    }

    // SUSTAIN Section
    children.push(new Paragraph({
      spacing: { after: 0, line: LINE_SPACING },
      children: [
        new TextRun({ text: '2.  ', font: FONT, size: FONT_SIZE }),
        new TextRun({ text: 'SUSTAIN', font: FONT, size: FONT_SIZE, bold: true })
      ]
    }));
    children.push(createPara('')); // Blank line

    if (data.sustainTopics && data.sustainTopics.length > 0) {
      data.sustainTopics.forEach((topic, index) => {
        const letter = String.fromCharCode(97 + index);
        this.addTopicToDoc(children, letter, topic, FONT, FONT_SIZE, LINE_SPACING);
      });
    } else {
      children.push(createPara('    a.  None identified.'));
      children.push(createPara(''));
    }

    // POC
    const pocLine = AARBuilder.buildPOCLine(data);
    children.push(createPara(`3.  ${pocLine}`));
    children.push(createPara('')); // Blank line
    children.push(createPara('')); // Blank line

    // Signature
    children.push(new Paragraph({
      spacing: { after: 0, line: LINE_SPACING },
      indent: { left: convertInchesToTwip(3.5) },
      children: [new TextRun({ text: data.signatureName || '[SIGNATURE]', font: FONT, size: FONT_SIZE })]
    }));

    // Create document
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1)
            }
          }
        },
        children: children
      }]
    });

    // Generate and download
    const blob = await Packer.toBlob(doc);
    const filename = this.generateFilename(data);
    this.downloadBlob(blob, filename);
  },

  /**
   * Add a topic section to the document
   */
  addTopicToDoc(children, letter, topic, FONT, FONT_SIZE, LINE_SPACING) {
    const { Paragraph, TextRun, convertInchesToTwip } = docx;

    // Topic title
    children.push(new Paragraph({
      spacing: { after: 0, line: LINE_SPACING },
      children: [new TextRun({ text: `    ${letter}.  ${topic.topic || '[Topic description]'}`, font: FONT, size: FONT_SIZE })]
    }));
    children.push(new Paragraph({ spacing: { after: 0, line: LINE_SPACING }, children: [] }));

    // Discussion
    children.push(new Paragraph({
      spacing: { after: 0, line: LINE_SPACING },
      children: [
        new TextRun({ text: '        (1) ', font: FONT, size: FONT_SIZE }),
        new TextRun({ text: 'Discussion.', font: FONT, size: FONT_SIZE, bold: true }),
        new TextRun({ text: topic.discussion ? `  ${topic.discussion}` : '', font: FONT, size: FONT_SIZE })
      ]
    }));
    children.push(new Paragraph({ spacing: { after: 0, line: LINE_SPACING }, children: [] }));

    // Recommendation
    children.push(new Paragraph({
      spacing: { after: 0, line: LINE_SPACING },
      children: [
        new TextRun({ text: '        (2) ', font: FONT, size: FONT_SIZE }),
        new TextRun({ text: 'Recommendation.', font: FONT, size: FONT_SIZE, bold: true }),
        new TextRun({ text: topic.recommendation ? `  ${topic.recommendation}` : '', font: FONT, size: FONT_SIZE })
      ]
    }));
    children.push(new Paragraph({ spacing: { after: 0, line: LINE_SPACING }, children: [] }));
  },

  /**
   * Build From line (organizational billet per naval letter format)
   */
  buildFromLine(data) {
    return data.fromBillet?.trim() || '[FROM]';
  },

  /**
   * Generate filename
   */
  generateFilename(data) {
    const date = DateUtils.formatNumeric(data.documentDate || new Date());
    const eventName = (data.eventName || 'AAR')
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 30);
    return `AAR_${eventName}_${date}.docx`;
  },

  /**
   * Download blob as file
   */
  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};
