# Testing Guide

## Verification Checklist

### Backend

- [ ] **Server starts without errors**
  ```bash
  cd server && npm start
  # Should see: "Resume Reviser API running on http://localhost:3001"
  ```

- [ ] **Health endpoint responds**
  ```bash
  curl http://localhost:3001/api/health
  # Should return: {"status":"ok","apiKey":"configured"}
  ```

- [ ] **File parsing works (PDF)**
  ```bash
  # Create a test PDF or use an existing one
  curl -F "file=@/path/to/test.pdf" http://localhost:3001/api/parse-file
  # Should return: {"text":"extracted content...","charCount":123}
  ```

- [ ] **File parsing works (DOCX)**
  ```bash
  curl -F "file=@/path/to/test.docx" http://localhost:3001/api/parse-file
  # Should return: {"text":"extracted content...","charCount":123}
  ```

- [ ] **Analyze endpoint accepts requests**
  ```bash
  curl -X POST http://localhost:3001/api/analyze \
    -H "Content-Type: application/json" \
    -d '{
      "jobDescription": "We are looking for a senior software engineer with 5+ years of experience in JavaScript and React.",
      "resumeText": "Jane Doe\nSoftware Engineer at Tech Company\n- Built responsive web applications using React\n- Led team of 3 developers",
      "coverLetterText": ""
    }'
  # Should return JSON with bulletPoints[], revisedResume, usage
  ```

### Extension

- [ ] **Manifest loads without errors**
  - Go to `chrome://extensions`
  - Look for "LinkedIn Resume Reviser" in the list
  - Should show version 1.0.0 with no errors

- [ ] **Popup opens and displays correctly**
  - Click the extension icon
  - Popup should show 4 tabs: Job, Resume, Cover Letter, Results
  - Popup should be 480px wide and properly styled

- [ ] **Content script runs on LinkedIn**
  - Open a LinkedIn job page: `https://www.linkedin.com/jobs/view/[any-job-id]/`
  - Open browser DevTools (F12) → Console
  - You should NOT see errors about the content script
  - The extension icon should be clickable

- [ ] **Auto-fill works on LinkedIn**
  - Go to a LinkedIn job page
  - Click the extension icon
  - The Job Description textarea should auto-populate with the job description from the page
  - Job Title field should show the role and company name

- [ ] **Manual paste works**
  - If auto-fill doesn't work, manually paste a job description in the Job Description field
  - Paste your resume text in the Resume tab

- [ ] **File upload works**
  - In the Resume tab, drag-and-drop a PDF or DOCX file onto the upload zone
  - OR click the upload zone to browse and select a file
  - The textarea should auto-populate with the extracted text
  - A checkmark should appear showing the filename

- [ ] **Analyze button works**
  - Fill in Job Description and Resume tabs
  - Click "Analyze & Revise" in the Cover Letter tab
  - You should see a loading spinner
  - After a few seconds, the Results tab should unlock and become active
  - Results should show:
    - Bullet points of key changes
    - Revised resume text
    - Revised cover letter (if you provided one)

- [ ] **Copy buttons work**
  - In the Results tab, click "Copy" under Revised Resume
  - Paste somewhere to verify the text was copied
  - Repeat for cover letter

- [ ] **Resume text persists**
  - Fill in the Resume tab with some text
  - Close the popup (click elsewhere)
  - Open the popup again
  - Your resume text should still be there

### Integration Test (End-to-End)

1. **Start backend server** (in one terminal window)
   ```bash
   cd server && npm start
   ```

2. **Load extension in Chrome**
   - Go to `chrome://extensions`
   - Load unpacked → select `/resume/extension` folder

3. **Visit a real LinkedIn job page**
   - Example: Any job from linkedin.com/jobs

4. **Full workflow test**
   - Click extension icon
   - Job description auto-fills
   - Open Resume tab
   - Paste your real resume or upload a PDF/DOCX
   - Open Cover Letter tab
   - (Optional) Paste or upload a cover letter
   - Click "Analyze & Revise"
   - Wait for results (should be 5-15 seconds)
   - Check that Results tab shows:
     - At least 5-10 bullet points
     - Full revised resume text
     - Full revised cover letter (if provided)
   - Copy revised resume to clipboard
   - Verify you can paste it elsewhere

## Debugging Tips

### Extension Not Loading
- Check that `manifest.json` is in the root of the `extension/` folder
- Make sure all JavaScript files are syntactically valid
- Check `chrome://extensions` for error messages (click "Details" → "Errors")

### Auto-fill Not Working
- Open DevTools on a LinkedIn job page (F12)
- Go to Console tab
- You should not see red errors
- Manually navigate the DOM to find current selectors:
  ```javascript
  document.querySelector('h1.job-details-jobs-unified-top-card__job-title')
  // If this returns null, the selector has changed
  ```
- Update the `SELECTORS` object in `content.js` if needed

### Server Not Responding
- Check that the server is running: `npm start` should show the startup message
- Verify the port is correct: `curl http://localhost:3001/api/health`
- Check firewall settings if running on different machine
- Verify API key is set correctly in `.env`

### Analysis Failing
- Check the server logs (terminal window) for error messages
- Verify API key is valid: test with `curl` if needed
- Check that request body is valid JSON
- Job description should be at least 50 characters
- Resume should be at least 100 characters

### File Upload Failing
- File should be PDF or DOCX, not other formats
- File size should be less than 10MB
- PDF must be text-based, not scanned images
- Check server logs for specific error message

## Performance Notes

- **Analyze request time**: Usually 5-15 seconds depending on input length
- **File parsing time**: Usually < 1 second
- **Token usage**: Varies, expect 1000-3000 input tokens, 2000-4000 output tokens

## Example Test Inputs

### Job Description (Short)
```
Senior Software Engineer

We're looking for a Senior Software Engineer to join our team. Required skills:
- 5+ years of software development experience
- Expert knowledge of JavaScript and TypeScript
- Experience with React or Vue.js
- REST API design and implementation
- SQL and NoSQL databases
- Git version control

Nice to have:
- AWS cloud experience
- DevOps/CI-CD knowledge
- Agile development experience
```

### Resume (Short)
```
John Smith
Email: john@example.com | Phone: (555) 123-4567

PROFESSIONAL EXPERIENCE
Software Engineer at TechCorp (2020-Present)
- Developed React web applications for 50+ enterprise clients
- Implemented REST APIs using Node.js and Express
- Managed databases using PostgreSQL and MongoDB
- Reduced app load time by 40% through optimization

Developer at StartupXYZ (2018-2020)
- Built full-stack JavaScript applications
- Implemented CI/CD pipelines using GitHub Actions
- Collaborated with product team on feature development

SKILLS
JavaScript, TypeScript, React, Node.js, Express, PostgreSQL, MongoDB, AWS, Docker, Git
```

## Reporting Issues

If something doesn't work:
1. Check the browser console (F12 → Console tab)
2. Check the server logs (terminal window)
3. Verify all configuration steps were followed
4. Try the test inputs above
5. Check the TROUBLESHOOTING section in README.md
