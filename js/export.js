/**
 * Export utilities for AAR Generator
 * Handles clipboard copy and DOCX export
 */
const AARExport = {
  /**
   * Copy text to clipboard
   * @param {string} text - Text to copy
   * @returns {Promise<boolean>} Success status
   */
  async copyToClipboard(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }

      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '-9999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();

      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    } catch (err) {
      console.error('Copy to clipboard failed:', err);
      return false;
    }
  },

  /**
   * Export AAR as DOCX file
   * Uses HTML-based DOCX format that Word can open
   * @param {Object} data - AAR form data
   * @param {string} plainText - Plain text AAR content
   */
  exportDocx(data, plainText) {
    const htmlContent = this.generateDocxHtml(data, plainText);
    const blob = new Blob([htmlContent], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

    const filename = this.generateFilename(data);
    this.downloadBlob(blob, filename);
  },

  /**
   * Generate HTML content for DOCX
   * Word can open HTML files saved as .doc
   * @param {Object} data - AAR form data
   * @param {string} plainText - Plain text content
   * @returns {string} HTML content
   */
  generateDocxHtml(data, plainText) {
    // Convert plain text to HTML, preserving formatting
    const htmlBody = this.textToHtml(plainText);

    return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="UTF-8">
  <title>After Action Report</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page {
      size: 8.5in 11in;
      margin: 1in;
    }
    body {
      font-family: "Times New Roman", Times, serif;
      font-size: 12pt;
      line-height: 1.15;
    }
    pre {
      font-family: "Courier New", Courier, monospace;
      font-size: 12pt;
      white-space: pre-wrap;
      word-wrap: break-word;
      margin: 0;
    }
    .header-block {
      text-align: left;
    }
    .right-align {
      text-align: right;
    }
  </style>
</head>
<body>
<pre>${htmlBody}</pre>
</body>
</html>`;
  },

  /**
   * Convert plain text to HTML-safe content
   * @param {string} text - Plain text
   * @returns {string} HTML-escaped text
   */
  textToHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  /**
   * Generate filename for export
   * @param {Object} data - AAR form data
   * @returns {string} Filename with .doc extension
   */
  generateFilename(data) {
    const date = DateUtils.formatNumeric(data.documentDate || new Date());
    const eventName = (data.eventName || 'AAR')
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 30);

    return `AAR_${eventName}_${date}.doc`;
  },

  /**
   * Download a blob as a file
   * @param {Blob} blob - Blob to download
   * @param {string} filename - Filename
   */
  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  },

  /**
   * Print the AAR content
   * @param {string} content - Content to print
   */
  print(content) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print the AAR.');
      return;
    }

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>After Action Report</title>
  <style>
    body {
      font-family: "Courier New", Courier, monospace;
      font-size: 12pt;
      line-height: 1.5;
      padding: 1in;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    @page {
      size: letter;
      margin: 1in;
    }
    @media print {
      body {
        padding: 0;
      }
    }
  </style>
</head>
<body>${this.textToHtml(content)}</body>
</html>`);

    printWindow.document.close();
    printWindow.focus();

    // Wait for content to load before printing
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  }
};
