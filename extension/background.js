chrome.runtime.onInstalled.addListener(() => {
  console.log("Job Portal Auto Apply Extension Installed.");
});

// The Background service worker easily bypasses CORS to hit the Next.js API!
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "FETCH_ANSWERS") {
    fetch('http://localhost:9002/api/extension/get-answers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request.payload)
    })
    .then(res => res.json())
    .then(data => sendResponse({ data }))
    .catch(err => sendResponse({ error: err.message }));
    
    return true; // Keep message channel open for async response
  }
});
