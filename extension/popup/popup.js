const BACKEND = 'http://localhost:3001';

const state = {
  jobDescription: '',
  jobTitle: '',
  resumeText: '',
  coverText: '',
  resumeFile: null,
  coverFile: null,
  results: null,
  isLoading: false,
};

// ============= TAB MANAGEMENT =============
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('disabled')) return;

      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));

      btn.classList.add('active');
      document.getElementById(`tab-${btn.dataset.tab}`).classList.remove('hidden');
    });
  });
}

function switchToTab(tabId) {
  const btn = document.querySelector(`[data-tab="${tabId}"]`);
  if (btn) btn.click();
}

// ============= STATUS MESSAGES =============
function showStatus(message, type = 'info') {
  const banner = document.getElementById('status-banner');
  banner.textContent = message;
  banner.className = `status-banner status-${type}`;
  banner.classList.remove('hidden');

  if (type !== 'error') {
    setTimeout(() => banner.classList.add('hidden'), 3000);
  }
}

// ============= AUTO-FILL JOB DESCRIPTION =============
async function autoFillJobDescription() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.url || !tab.url.includes('linkedin.com/jobs/view/')) {
      showStatus('Open a LinkedIn job page to auto-fill the job description.', 'info');
      return;
    }

    const response = await chrome.tabs.sendMessage(tab.id, { action: 'GET_JOB_DATA' });

    if (response && response.success && response.data.description) {
      document.getElementById('job-description').value = response.data.description;
      document.getElementById('job-title').value =
        `${response.data.title} at ${response.data.company}`;
      showStatus('Job description auto-filled from LinkedIn.', 'success');
    }
  } catch (err) {
    showStatus('Could not auto-fill. Paste the job description manually.', 'warning');
  }
}

// ============= FILE UPLOAD HANDLING =============
async function parseAndFillFile(file, type) {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const resp = await fetch(`${BACKEND}/api/parse-file`, {
      method: 'POST',
      body: formData,
    });

    if (!resp.ok) {
      throw new Error(`Failed to parse file: ${resp.statusText}`);
    }

    const { text } = await resp.json();

    if (type === 'resume') {
      document.getElementById('resume-text').value = text;
      showStatus('Resume text extracted and populated.', 'success');
    } else if (type === 'cover') {
      document.getElementById('cover-text').value = text;
      showStatus('Cover letter text extracted and populated.', 'success');
    }
  } catch (err) {
    showStatus(`Error parsing file: ${err.message}`, 'error');
  }
}

function setupFileUpload(uploadZoneId, fileInputId, type) {
  const fileInput = document.getElementById(fileInputId);
  const uploadZone = document.getElementById(uploadZoneId);
  const fileChosen = uploadZone.querySelector('.file-chosen');

  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    fileChosen.textContent = `✓ ${file.name}`;
    fileChosen.classList.remove('hidden');

    await parseAndFillFile(file, type);
  });

  // Drag and drop
  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('drag-over');
  });

  uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('drag-over');
  });

  uploadZone.addEventListener('drop', async (e) => {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');

    const file = e.dataTransfer.files[0];
    if (file) {
      fileInput.files = e.dataTransfer.files;
      fileChosen.textContent = `✓ ${file.name}`;
      fileChosen.classList.remove('hidden');
      await parseAndFillFile(file, type);
    }
  });
}

// ============= ANALYZE & REVISE =============
async function handleAnalyze() {
  const jobDesc = document.getElementById('job-description').value.trim();
  const resumeText = document.getElementById('resume-text').value.trim();
  const coverText = document.getElementById('cover-text').value.trim();

  if (!jobDesc) {
    showStatus('Please provide a job description.', 'error');
    switchToTab('job');
    return;
  }

  if (!resumeText) {
    showStatus('Please provide your resume.', 'error');
    switchToTab('resume');
    return;
  }

  if (jobDesc.length < 50) {
    showStatus('Job description must be at least 50 characters.', 'error');
    return;
  }

  if (resumeText.length < 100) {
    showStatus('Resume must be at least 100 characters.', 'error');
    return;
  }

  setLoading(true);

  try {
    const resp = await fetch(`${BACKEND}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobDescription: jobDesc,
        resumeText,
        coverLetterText: coverText,
      }),
    });

    if (!resp.ok) {
      const err = await resp.json();
      throw new Error(err.error || 'Server error');
    }

    const data = await resp.json();
    renderResults(data);

    document.getElementById('results-tab').classList.remove('disabled');
    switchToTab('results');
    showStatus('Analysis complete!', 'success');

  } catch (err) {
    showStatus(`Error: ${err.message}`, 'error');
  } finally {
    setLoading(false);
  }
}

function setLoading(isLoading) {
  state.isLoading = isLoading;
  const btn = document.getElementById('analyze-btn');
  btn.disabled = isLoading;

  if (isLoading) {
    btn.innerHTML = '<span class="loading-spinner"></span> Analyzing...';
  } else {
    btn.textContent = 'Analyze & Revise';
  }
}

// ============= RENDER RESULTS =============
function renderResults(data) {
  const ul = document.getElementById('bullet-points');
  ul.innerHTML = '';

  if (data.bulletPoints && data.bulletPoints.length > 0) {
    data.bulletPoints.forEach(point => {
      const li = document.createElement('li');
      li.textContent = point;
      ul.appendChild(li);
    });
  } else {
    const li = document.createElement('li');
    li.textContent = 'No specific changes identified.';
    li.style.color = '#6b7280';
    ul.appendChild(li);
  }

  document.getElementById('revised-resume').textContent = data.revisedResume || '';

  if (data.revisedCoverLetter && data.revisedCoverLetter.trim()) {
    document.getElementById('revised-cover').textContent = data.revisedCoverLetter;
    document.getElementById('cover-result-section').style.display = '';
  } else {
    document.getElementById('cover-result-section').style.display = 'none';
  }

  state.results = data;
}

// ============= COPY TO CLIPBOARD =============
function setupCopyButtons() {
  document.getElementById('copy-resume-btn').addEventListener('click', () => {
    const text = document.getElementById('revised-resume').textContent;
    navigator.clipboard.writeText(text).then(() => {
      showStatus('Resume copied to clipboard!', 'success');
    }).catch(err => {
      showStatus('Failed to copy', 'error');
    });
  });

  document.getElementById('copy-cover-btn').addEventListener('click', () => {
    const text = document.getElementById('revised-cover').textContent;
    navigator.clipboard.writeText(text).then(() => {
      showStatus('Cover letter copied to clipboard!', 'success');
    }).catch(err => {
      showStatus('Failed to copy', 'error');
    });
  });
}

// ============= PERSISTENCE =============
function setupPersistence() {
  const resumeArea = document.getElementById('resume-text');

  chrome.storage.local.get(['savedResume'], (result) => {
    if (result.savedResume) {
      resumeArea.value = result.savedResume;
    }
  });

  let saveTimer;
  resumeArea.addEventListener('input', () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      chrome.storage.local.set({ savedResume: resumeArea.value });
    }, 1000);
  });
}

// ============= INITIALIZATION =============
document.addEventListener('DOMContentLoaded', async () => {
  initTabs();
  setupCopyButtons();
  setupPersistence();

  setupFileUpload('resume-upload-zone', 'resume-file', 'resume');
  setupFileUpload('cover-upload-zone', 'cover-file', 'cover');

  document.getElementById('analyze-btn').addEventListener('click', handleAnalyze);
  document.getElementById('refetch-btn').addEventListener('click', autoFillJobDescription);

  await autoFillJobDescription();
});
