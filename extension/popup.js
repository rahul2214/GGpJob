document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('start-btn');
  const statusLog = document.getElementById('status-log');
  const userIdInput = document.getElementById('user-id-input');

  // Load saved User ID
  chrome.storage.local.get(['jobPortalUserId'], (result) => {
    if (result.jobPortalUserId) {
      userIdInput.value = result.jobPortalUserId;
    }
  });

  userIdInput.addEventListener('input', (e) => {
    chrome.storage.local.set({ jobPortalUserId: e.target.value.trim() });
  });
  
  startBtn.addEventListener('click', () => {
    const userId = userIdInput.value.trim();
    if (!userId) {
        statusLog.textContent = 'Please enter your User ID!';
        return;
    }

    statusLog.textContent = 'Contacting active tab...';
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab && activeTab.url.includes("linkedin.com")) {
        chrome.tabs.sendMessage(activeTab.id, { action: "START_APPLY", userId: userId }, (response) => {
          if (chrome.runtime.lastError) {
             statusLog.textContent = 'Please refresh the LinkedIn page first.';
          } else {
             statusLog.textContent = 'Automation started! Watch the page.';
             startBtn.disabled = true;
          }
        });
      } else {
        statusLog.textContent = 'Please open a LinkedIn job post!';
      }
    });
  });
});
