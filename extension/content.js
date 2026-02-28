(function() {
  function scrapeJobData() {
    try {
      // Find main job details container (role="main" is most reliable)
      const mainContent = document.querySelector('[role="main"]') ||
                          document.querySelector('main');

      if (!mainContent) {
        return { title: '', company: '', description: '' };
      }

      const fullText = mainContent.innerText;
      const lines = fullText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

      // Extract job title and company from top of page
      // Pattern: Company name is usually first, followed by job title
      let title = '';
      let company = '';
      let description = '';

      if (lines.length > 1) {
        // Company is typically the first line
        company = lines[0];
        // Job title is typically the second line
        title = lines[1];
      }

      // Find description: it starts after salary, location info
      // Look for "About the job" section or content after initial metadata
      const descStart = fullText.indexOf('About the job') !== -1
        ? fullText.indexOf('About the job') + 'About the job'.length
        : fullText.indexOf('Promoted by') !== -1
        ? fullText.substring(0, fullText.indexOf('Promoted by'))
        : '';

      if (descStart) {
        description = fullText.substring(descStart).trim();
      } else {
        // Fallback: take everything after the first 5 lines (which are metadata)
        description = lines.slice(5).join('\n').trim();
      }

      return {
        title: title,
        company: company,
        description: description || fullText,
        url: window.location.href,
        scrapedAt: Date.now(),
      };
    } catch (err) {
      return {
        title: '',
        company: '',
        description: '',
        error: err.message
      };
    }
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'GET_JOB_DATA') {
      try {
        const data = scrapeJobData();
        sendResponse({ success: true, data });
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
    }
    return true;
  });
})();
