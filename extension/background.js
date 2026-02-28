chrome.runtime.onInstalled.addListener(() => {
  console.log('LinkedIn Resume Reviser installed');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'RELAY_TO_CONTENT') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) {
        sendResponse({ success: false, error: 'No active tab' });
        return;
      }
      chrome.tabs.sendMessage(tabs[0].id, request.payload, (response) => {
        if (chrome.runtime.lastError) {
          sendResponse({ success: false, error: 'Content script not available on this page' });
        } else {
          sendResponse({ success: true, data: response });
        }
      });
    });
    return true;
  }
});
