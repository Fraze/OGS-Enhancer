// Listen for when the user clicks on the browser action (extension icon).
chrome.action.onClicked.addListener(function(tab) {
  // Check if an options page is already open. If so, focus it.
  // Otherwise, open a new options page.
  const optionsUrl = chrome.runtime.getURL('options.html');
  chrome.tabs.query({ url: optionsUrl }, function(tabs) {
    if (tabs.length) {
      chrome.tabs.update(tabs[0].id, { active: true });
      // If the window is minimized, you might want to update the window state too.
      if (tabs[0].windowId) {
        chrome.windows.update(tabs[0].windowId, { focused: true });
      }
    } else {
      chrome.runtime.openOptionsPage();
    }
  });
});

// Listen for when the extension is installed or updated.
chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason === "install") {
    console.log("OGS Enhancer: First install. Opening options page.");
    chrome.runtime.openOptionsPage();
    
    // Set default options (options.js also handles defaults on load, 
    // but setting them here ensures they exist immediately if needed by background script or other components before options page is first opened)
    chrome.storage.sync.set({
        ogsEnableFirstBlood: true,
        ogsEnableWinCelebration: true,
        ogsEnableAudio: true
    }, function() {
        console.log("OGS Enhancer: Default options set on install.");
    });

  } else if (details.reason === "update") {
    const previousVersion = details.previousVersion;
    console.log(`OGS Enhancer: Updated from version ${previousVersion}. Opening options page.`);
    chrome.runtime.openOptionsPage();
    // You might want to check for new options and set defaults for them here if necessary,
    // especially if the new version introduces settings not covered by options.js defaults.
  }
});
