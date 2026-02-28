# LinkedIn Resume Reviser

A Chrome extension that helps you revise your resume and cover letter based on LinkedIn job descriptions using Claude AI.

## Features

- **Auto-fill Job Descriptions**: The extension automatically extracts job title, company, and description from LinkedIn job pages
- **Resume & Cover Letter Upload**: Upload PDF or DOCX files, or paste text directly
- **AI-Powered Revisions**: Claude analyzes your resume against the job description and provides:
  - Bullet-point list of key changes made
  - Fully rewritten resume tailored to the job
  - Revised cover letter (if provided)
- **Easy Copy-to-Clipboard**: Copy revised text directly from the extension

## Architecture

```
LinkedIn Job Page → content.js (DOM scrape) → popup.js (auto-fill)
                                                    ↓ fetch
                                          Express server :3001
                                                    ↓
                                          Anthropic SDK → Claude
```

## Setup Instructions

### Prerequisites

- Node.js 18+
- npm
- Chrome browser
- Anthropic API key (from https://console.anthropic.com)

### 1. Backend Setup

```bash
cd server

# Create .env file with your Anthropic API key
cp .env.example .env
# Edit .env and add: ANTHROPIC_API_KEY=sk-ant-your-key-here

# Install dependencies
npm install

# Start the server (runs on http://localhost:3001)
npm start
```

The server needs to be running while using the extension.

### 2. Chrome Extension Setup

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Navigate to `/Users/zelong/Desktop/resume/extension/` and select it
5. The extension should now appear in your Chrome toolbar

### 3. Using the Extension

1. Navigate to a LinkedIn job page (linkedin.com/jobs/view/...)
2. Click the **Resume Reviser** extension icon
3. The job description should auto-fill—edit if needed
4. Upload or paste your resume text in the **Resume** tab
5. (Optional) Add a cover letter in the **Cover Letter** tab
6. Click **Analyze & Revise**
7. View the results in the **Results** tab
8. Copy the revised resume and cover letter to use in your application

## File Structure

```
resume/
├── extension/
│   ├── manifest.json           # Extension configuration (Manifest V3)
│   ├── background.js           # Service worker
│   ├── content.js              # LinkedIn DOM scraper
│   ├── popup/
│   │   ├── popup.html          # Extension UI
│   │   ├── popup.css           # Styling
│   │   └── popup.js            # Popup logic & API calls
│   └── icons/                  # Extension icons
└── server/
    ├── package.json
    ├── .env                    # API key (add your own)
    ├── .env.example
    ├── server.js               # Express app
    ├── routes/
    │   ├── analyze.js          # Claude analysis endpoint
    │   └── parseFile.js        # PDF/DOCX parsing
    └── lib/
        ├── anthropic.js        # Anthropic client
        └── prompts.js          # Prompt templates
```

## API Endpoints

### POST /api/analyze

Analyzes a resume against a job description and returns revisions.

**Request:**
```json
{
  "jobDescription": "Job description text...",
  "resumeText": "Your resume text...",
  "coverLetterText": "Optional cover letter text..."
}
```

**Response:**
```json
{
  "success": true,
  "bulletPoints": ["Change 1: ...", "Change 2: ..."],
  "revisedResume": "Full revised resume text...",
  "revisedCoverLetter": "Revised cover letter text (if provided)...",
  "usage": {
    "inputTokens": 1234,
    "outputTokens": 5678
  }
}
```

### POST /api/parse-file

Parses PDF or DOCX files and returns extracted text.

**Request:** Form data with `file` field (PDF or DOCX)

**Response:**
```json
{
  "text": "Extracted text from file...",
  "charCount": 1234
}
```

### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "apiKey": "configured"
}
```

## Troubleshooting

### "Could not auto-fill job description"
- Make sure you're on a LinkedIn job page (linkedin.com/jobs/view/...)
- Try clicking the "Re-fetch from page" button
- Manually paste the job description if auto-fill doesn't work

### "Server error" when analyzing
- Check that the backend server is running (`npm start` in the `server/` directory)
- Verify your `ANTHROPIC_API_KEY` is set in `server/.env`
- Check the server logs for more details

### "Failed to parse file"
- Ensure the file is a valid PDF or DOCX
- Scanned image PDFs won't work—paste the text instead
- File size should be under 10MB

### Extension doesn't load
- Try clicking "Load unpacked" again and select the `extension/` folder
- Clear Chrome cache and restart the browser
- Check that `manifest.json` is in the root of the `extension/` folder

## Development Notes

### LinkedIn DOM Selectors

The extension uses multiple CSS selector fallbacks to handle LinkedIn's A/B testing and DOM changes:
- Job title
- Company name
- Job description

If the auto-fill stops working, check the browser console on a LinkedIn job page to identify the current DOM selectors.

### Prompt Engineering

The Claude prompt is designed to:
1. Mirror job description keywords where truthful
2. Quantify achievements with placeholders
3. Reorder experience to highlight relevance
4. Maintain factual accuracy (no invented credentials)
5. Provide specific, actionable changes

See `server/lib/prompts.js` for the full prompt templates.

## Security Notes

- Your Anthropic API key is stored locally in `server/.env` (never in the extension)
- The backend runs locally on your machine—no data is sent to external servers except Anthropic API
- Chrome extension CORS allows `chrome-extension://` origins to communicate with `localhost:3001`
- File uploads are only parsed locally; binary data is never sent to the API

## Future Improvements

- Support for more file formats (DOCX with styles, rich text)
- LinkedIn job title/company extraction from page HTML (not just visible text)
- Batch analysis of multiple job descriptions
- Export revisions as PDF
- History of previous analyses
- Integration with other job sites (Indeed, Glassdoor, etc.)
- User authentication and cloud sync (optional)

## License

MIT

## Support

For issues or feature requests, please check the troubleshooting section above or open an issue in the repository.
# LinkedinJobExtension
