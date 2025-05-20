// options.js

// Function to save options to chrome.storage.sync
function saveOptions() {
    const enableFirstBlood = document.getElementById('enableFirstBlood').checked;
    const enableWinCelebration = document.getElementById('enableWinCelebration').checked;
    const enableAudio = document.getElementById('enableAudio').checked;

    chrome.storage.sync.set({
        ogsEnableFirstBlood: enableFirstBlood,
        ogsEnableWinCelebration: enableWinCelebration,
        ogsEnableAudio: enableAudio
    }, function() {
        // Update status to let user know options were saved.
        const status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function() {
            status.textContent = '';
        }, 1500);
        console.log('OGS Enhancer: Options saved.');
    });
}

// Function to restore options from chrome.storage.sync
function restoreOptions() {
    // Default values
    chrome.storage.sync.get({
        ogsEnableFirstBlood: true,       // Default to true
        ogsEnableWinCelebration: true,   // Default to true
        ogsEnableAudio: true             // Default to true
    }, function(items) {
        document.getElementById('enableFirstBlood').checked = items.ogsEnableFirstBlood;
        document.getElementById('enableWinCelebration').checked = items.ogsEnableWinCelebration;
        document.getElementById('enableAudio').checked = items.ogsEnableAudio;
        console.log('OGS Enhancer: Options restored.');
    });
}

// Event listeners for when the options page DOM is loaded
document.addEventListener('DOMContentLoaded', restoreOptions);

// Add event listeners to checkboxes to save options when they change
document.getElementById('enableFirstBlood').addEventListener('change', saveOptions);
document.getElementById('enableWinCelebration').addEventListener('change', saveOptions);
document.getElementById('enableAudio').addEventListener('change', saveOptions);
