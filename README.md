# After Action Report Generator

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-success)](https://jeranaias.github.io/aar-generator/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-blueviolet)](https://jeranaias.github.io/aar-generator/)

> **Live Demo:** [https://jeranaias.github.io/aar-generator/](https://jeranaias.github.io/aar-generator/)

A free, browser-based tool for generating properly formatted After Action Reports following USMC TECOM format with MCCLL-compatible structure. No installation required - works entirely in your browser, even offline.

---

## Features

### Core Capabilities
- **TECOM Format Compliant** - Follows HQBN Enclosure 12 AAR template exactly
- **MCO 3504.1 Compliant** - Marine Corps Lessons Learned Program format
- **Naval Letter Format** - Proper header with SSIC, office code, and correspondence blocks
- **Dynamic Topics** - Add, remove, and drag-to-reorder IMPROVE and SUSTAIN topics
- **Live Preview** - Real-time PDF preview as you type (iframe-based)
- **Smart Date Formatting** - Automatic conversion to military date format (DD MMM YY)

### Export Options
- **Export PDF** - Download as properly formatted PDF document
- **Export Word (.docx)** - Microsoft Word compatible format with Times New Roman 12pt
- **Copy to Clipboard** - Plain text ready to paste into any application

### Data Management
- **Auto-Save** - Drafts saved automatically to browser storage
- **Load/Save Drafts** - Never lose your work between sessions
- **Load Example** - One-click sample data for testing
- **Clear All** - Reset form to start fresh

### User Experience
- **Dark/Light/Night Modes** - Three theme options including tactical red
- **Offline Capable** - Full PWA support, works without internet
- **Mobile Friendly** - Responsive design works on any device
- **Keyboard Accessible** - Full keyboard navigation support

---

## Quick Start

1. Visit [https://jeranaias.github.io/aar-generator/](https://jeranaias.github.io/aar-generator/)
2. Click **Load Example** to see sample data
3. Click **Live Preview** to see the formatted output
4. Modify fields as needed
5. Export as **PDF** or **Word**

---

## Usage Guide

### Step 1: Unit Information
Enter your unit name, address lines, SSIC (default: 3504), office code, and document date.

### Step 2: From / To
Select rank from dropdown, enter name, billet, and addressee.

### Step 3: Event Details
Enter the event name and date range for the training/operation.

### Step 4: IMPROVE Topics
Add topics that need improvement. Each topic requires:
- **Topic Title** - Brief one-line description
- **Discussion** - Background and details
- **Recommendation** - Specific actionable recommendations

Use the drag handles to reorder topics. Click "Writing Prompts" for guidance.

### Step 5: SUSTAIN Topics
Add topics that worked well and should continue. Same format as IMPROVE.

### Step 6: POC & Signature
Enter point of contact information and signature block name.

### Step 7: Export
- **Live Preview** - Toggle real-time PDF preview
- **Export PDF** - Download formatted PDF
- **Export Word** - Download .docx file
- **Copy Text** - Copy plain text to clipboard

---

## Standards Compliance

This tool implements specifications from:

| Reference | Description |
|-----------|-------------|
| **TECOM HQBN Enclosure 12** | After Action Report Template |
| **MCO 3504.1** | Marine Corps Lessons Learned Program (MCLLP) |
| **MCRP 7-20A.4** | Evaluations and Assessments |
| **MCRP 3-0B / MCTP 8-10B** | How to Conduct Training (Appendix F - AAR) |

---

## Installation

### Web (Recommended)
Visit [https://jeranaias.github.io/aar-generator/](https://jeranaias.github.io/aar-generator/)

### Install as App (PWA)

**Desktop (Chrome/Edge):**
Click the install icon in the address bar or use browser menu.

**iPhone/iPad:**
Tap Share, then "Add to Home Screen"

**Android:**
Tap menu (3 dots), then "Add to Home Screen" or "Install App"

Once installed, the app works fully offline.

### Self-Hosted
```bash
git clone https://github.com/jeranaias/aar-generator.git
cd aar-generator
# Serve with any static file server
python -m http.server 8000
```

---

## Technology

| Component | Technology |
|-----------|------------|
| **Frontend** | Pure JavaScript, no frameworks |
| **PDF Generation** | jsPDF library |
| **Word Export** | docx library |
| **Styling** | CSS custom properties, responsive design |
| **Offline** | Service Worker + Cache API |
| **Storage** | LocalStorage for drafts |

---

## Security & Privacy

- **Client-Side Only** - All data stays in your browser
- **No Server Communication** - Nothing transmitted externally
- **No Tracking** - No analytics or telemetry
- **No Login Required** - Works immediately
- **UNCLASSIFIED Use Only** - Do not enter classified information

---

## Theme Support

| Theme | Description |
|-------|-------------|
| **Dark** | Default theme - dark background, light text |
| **Light** | Traditional light background |
| **Night** | Tactical red-only mode for low-light conditions |

Click the theme toggle button in the header to cycle through modes.

---

## Part of USMC Tools Suite

This is part of the [USMC Admin Tools](https://jeranaias.github.io/usmc-tools/) suite - free, open-source tools built for Marines.

**Other Tools:**
- [Naval Letter Format Generator](https://jeranaias.github.io/navalletterformat/)
- [OSMEAC Generator](https://jeranaias.github.io/osmeac-generator/)
- [Award Write-Up Generator](https://jeranaias.github.io/award-writeup-generator/)

---

## Community Attribution

This tool was inspired by feedback from the r/USMC community:

| Contributor | Platform | Contribution |
|-------------|----------|--------------|
| **BigEarn86** | r/USMC | Requested AAR generator, mentioned MCCLL format |

*This tool exists because Marines took the time to share their pain points. Thank you.*

---

## License

MIT License - Free to use, modify, and distribute.

## Contributing

Issues and pull requests welcome at [GitHub](https://github.com/jeranaias/aar-generator).
