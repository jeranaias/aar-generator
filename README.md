# After Action Report Generator

> **Live Demo:** [https://jeranaias.github.io/aar-generator/](https://jeranaias.github.io/aar-generator/)

A free, browser-based tool for generating properly formatted After Action Reports following USMC TECOM format with MCCLL-compatible structure. No installation required - works entirely in your browser.

---

## Features

### Core Capabilities
- **TECOM Format Compliant** - Follows HQBN Enclosure 12 AAR template exactly
- **Naval Letter Format** - Proper header with SSIC, office code, and correspondence blocks
- **Dynamic Topics** - Add/remove unlimited IMPROVE and SUSTAIN topics
- **Live Preview** - See formatted AAR output before exporting
- **Smart Date Formatting** - Automatic conversion to military date format (DD MMM YY)

### Export Options
- **Copy to Clipboard** - Plain text ready to paste
- **Export as DOCX** - Microsoft Word compatible format
- **Print View** - Clean print-friendly output

### Data Management
- **Auto-Save** - Drafts saved every second to browser storage
- **Load/Save Drafts** - Never lose your work
- **Form Validation** - Required field checking before export

### User Experience
- **Offline Capable** - Works without internet connection (PWA)
- **Theme Support** - Light, dark, and tactical (night/red) modes
- **Mobile Friendly** - Responsive design works on any device
- **Keyboard Accessible** - Full keyboard navigation support

---

## Usage

1. **Unit Information** - Enter unit name, address, SSIC, and document date
2. **From/To** - Enter correspondence information
3. **Event Details** - Event name and date range
4. **IMPROVE Topics** - Add areas needing improvement with discussion and recommendations
5. **SUSTAIN Topics** - Add areas that worked well
6. **POC & Signature** - Enter point of contact information
7. **Export** - Preview, copy to clipboard, or export as DOCX

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

## Technology

- **Pure JavaScript** - No frameworks, minimal dependencies
- **Progressive Web App** - Installable to home screen
- **Service Worker** - Full offline functionality
- **LocalStorage** - Client-side draft persistence
- **Responsive CSS** - Mobile-first design

---

## Installation

### Web (Recommended)
Visit [https://jeranaias.github.io/aar-generator/](https://jeranaias.github.io/aar-generator/)

### Offline / PWA
1. Visit the site in Chrome, Edge, or Safari
2. Click "Install" or "Add to Home Screen"
3. App works fully offline once installed

### Self-Hosted
```bash
git clone https://github.com/jeranaias/aar-generator.git
cd aar-generator
# Serve with any static file server
python -m http.server 8000
```

---

## Security & Privacy

- **Client-Side Only** - All data stays in your browser
- **No Server Communication** - Nothing transmitted externally
- **No Tracking** - No analytics or telemetry
- **UNCLASSIFIED Use Only** - Do not enter classified information

---

## Community Attribution

This tool was inspired by feedback from the r/USMC community:

| Contributor | Platform | Contribution |
|-------------|----------|--------------|
| **BigEarn86** | r/USMC | Requested AAR generator, mentioned MCCLL format |

*This tool exists because Marines took the time to share their pain points. Thank you.*

---

## Part of USMC Tools Suite

This is part of the [USMC Admin Tools](https://jeranaias.github.io/usmc-tools/) suite - free, open-source tools built by Marines, for Marines.

**Other Tools:**
- [Naval Letter Format Generator](https://jeranaias.github.io/navalletterformat/) - Correspondence per SECNAV M-5216.5

---

## License

MIT License - Free to use, modify, and distribute.

## Contributing

Issues and pull requests welcome at [GitHub](https://github.com/jeranaias/aar-generator).
