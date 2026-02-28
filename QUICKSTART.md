# Quick Start Guide

## 1. Get Your Anthropic API Key

1. Go to https://console.anthropic.com
2. Sign in or create an account
3. Go to API Keys section
4. Create a new API key
5. Copy it (you'll need this in step 3)

## 2. Start the Backend Server

```bash
# Navigate to the server directory
cd /Users/zelong/Desktop/resume/server

# Create .env file with your API key
cat > .env << EOF
ANTHROPIC_API_KEY=sk-ant-YOUR-KEY-HERE
PORT=3001
EOF

# Install dependencies (if not done already)
npm install

# Start the server
npm start
```

You should see:
```
Resume Reviser API running on http://localhost:3001
```

**Keep this terminal window open while using the extension.**

## 3. Load the Chrome Extension

1. Open Chrome and go to `chrome://extensions/`
2. In the top right, toggle on **Developer mode**
3. Click the **Load unpacked** button
4. Navigate to `/Users/zelong/Desktop/resume/extension/`
5. Click **Open** to load it

You should see the "LinkedIn Resume Reviser" extension appear in the list.

## 4. Try It Out

1. Go to any LinkedIn job page: `https://www.linkedin.com/jobs/view/[job-id]/`
2. Click the extension icon (should be in your toolbar)
3. The job description should auto-fill—if it doesn't, paste it manually
4. Upload or paste your resume in the **Resume** tab
5. (Optional) Add a cover letter in the **Cover Letter** tab
6. Click **Analyze & Revise**
7. View your tailored resume and cover letter in the **Results** tab
8. Copy the revised text and use it in your application

## Common Issues

### "Could not auto-fill job description"
- Make sure you're on a LinkedIn job page (URL should contain `/jobs/view/`)
- Try clicking **Re-fetch from page**
- Or manually paste the job description

### "Server error" when analyzing
- Check that the backend server is still running
- Verify your API key is correct in `server/.env`
- Look at the server terminal for error messages

### "Failed to parse file"
- Make sure the file is a valid PDF or DOCX (not a scanned image)
- File size should be less than 10MB
- If it's a scanned PDF, paste the text instead

### Extension icon doesn't appear
- Try refreshing the page
- Go to `chrome://extensions/` and toggle the extension off and on
- Restart Chrome

## Next Steps

- See [README.md](README.md) for detailed documentation
- Check [TROUBLESHOOTING.md](README.md#troubleshooting) for more help
- Review the prompt template in `server/lib/prompts.js` to customize the analysis

## Stopping the Server

When you're done:
1. Go to the terminal window where you ran `npm start`
2. Press `Ctrl+C` to stop the server
3. The extension will still be loaded in Chrome (it just won't work without the server)
