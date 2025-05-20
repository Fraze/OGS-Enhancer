// --- Global State ---
let firstBloodHappenedThisGame = false;
let gameOverEffectsShownThisGame = false;
let captureObserver = null;
let gameOverObserver = null;
let gameOverCheckTimeout = null; 
const GAME_OVER_DEBOUNCE_MS = 1000; 

// Stores user preferences loaded from storage
let userPreferences = {
    ogsEnableFirstBlood: true,
    ogsEnableWinCelebration: true,
    ogsEnableAudio: true
};

// Function to load preferences from chrome.storage.sync
function loadUserPreferences(callback) {
    chrome.storage.sync.get({
        ogsEnableFirstBlood: true,
        ogsEnableWinCelebration: true,
        ogsEnableAudio: true
    }, function(items) {
        userPreferences = items;
        console.log('OGS Enhancer: User preferences loaded', userPreferences);
        if (callback) callback();
    });
}


// --- Sound & Animation (First Blood - uses video file) ---
function showFirstBloodEffect() { 
    // Check if First Blood effect is enabled
    if (!userPreferences.ogsEnableFirstBlood) {
        console.log("OGS Enhancer: First Blood effect disabled by user.");
        return;
    }

    const videoContainer = document.createElement('div');
    videoContainer.className = 'first-blood-video-container';
    
    const video = document.createElement('video');
    video.src = chrome.runtime.getURL('first_blood.webm'); 
    video.autoplay = false; 
    video.playsInline = true; 
    video.muted = !userPreferences.ogsEnableAudio; // Mute video if global audio is off

    video.oncanplaythrough = () => {
        console.log("OGS Enhancer: First Blood video can play through. Audio muted:", video.muted);
        video.play().then(() => {
            console.log("OGS Enhancer: First Blood video playing.");
        }).catch(error => {
            console.error("OGS Enhancer: Error playing First Blood video:", error);
        });
    };

    video.onerror = (e) => {
        console.error("OGS Enhancer: Error loading First Blood video.", e);
        if (videoContainer.parentNode) {
            videoContainer.parentNode.removeChild(videoContainer);
        }
    };

    video.onended = () => {
        console.log("OGS Enhancer: First Blood video ended.");
    };

    videoContainer.appendChild(video);
    document.body.appendChild(videoContainer);
    
    setTimeout(() => {
        if (videoContainer.parentNode) {
            videoContainer.parentNode.removeChild(videoContainer);
        }
    }, 7000); 
}


// --- Game Over Effects ---
function launchConfetti() {
    // This part of win celebration is visual, not affected by global audio toggle directly
    // but controlled by ogsEnableWinCelebration
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti-container';
    document.body.appendChild(confettiContainer);

    const colors = ['#FFD700', '#FF4500', '#ADFF2F', '#1E90FF', '#FF69B4', '#7FFF00'];
    const numConfetti = 100;

    for (let i = 0; i < numConfetti; i++) {
        const particle = document.createElement('div');
        particle.className = 'confetti-particle';
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.animationDelay = Math.random() * 2 + 's';
        const size = Math.random() * 8 + 5;
        particle.style.width = size + 'px';
        particle.style.height = (Math.random() > 0.5 ? size : size * 1.5) + 'px';
        particle.style.transform = `translateY(-20px) rotate(${Math.random() * 360}deg)`;
        confettiContainer.appendChild(particle);
    }

    setTimeout(() => {
        if (confettiContainer.parentNode) {
            confettiContainer.parentNode.removeChild(confettiContainer);
        }
    }, 5000); 
}

function playWinSound(winner) {
    // Check if global audio is enabled
    if (!userPreferences.ogsEnableAudio) {
        console.log("OGS Enhancer: Global audio disabled, win sound suppressed.");
        return;
    }

    let soundFile = '';
    if (winner === 'Black') {
        soundFile = 'black_wins.mp3';
    } else if (winner === 'White') {
        soundFile = 'white_wins.mp3';
    }

    if (soundFile) {
        try {
            const audioUrl = chrome.runtime.getURL(soundFile);
            const audio = new Audio(audioUrl);
            audio.play().catch(error => {
                console.error(`OGS Enhancer: Error playing ${soundFile}:`, error);
            });
            console.log(`OGS Enhancer: Playing ${soundFile}.`);
        } catch (e) {
            console.error(`OGS Enhancer: Exception trying to play ${soundFile}:`, e);
        }
    }
}

function displayWinnerMessage(winner) {
    // This part of win celebration is visual
    const messageDiv = document.createElement('div');
    messageDiv.className = 'game-winner-message';
    messageDiv.textContent = `${winner} Wins!`;
    document.body.appendChild(messageDiv);
    
    playWinSound(winner); // Play the win sound (will check audio preference inside)

    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 4500); 
}

function processFinalGameOverState(gameStateText) {
    if (gameOverEffectsShownThisGame) { 
        return;
    }
     // Check if Win Celebration is enabled
    if (!userPreferences.ogsEnableWinCelebration) {
        console.log("OGS Enhancer: Win celebration disabled by user.");
        return;
    }

    console.log("OGS Enhancer: Processing final game over state. Text:", gameStateText);

    let winner = null;
    if (gameStateText.toLowerCase().includes("black wins")) {
        winner = "Black";
    } else if (gameStateText.toLowerCase().includes("white wins")) {
        winner = "White";
    }

    if (winner) {
        console.log(`OGS Enhancer: ${winner} confirmed as winner.`);
        gameOverEffectsShownThisGame = true;
        displayWinnerMessage(winner); 
        launchConfetti();
    } else {
        console.log("OGS Enhancer: Winner not clearly determined from final game state text:", gameStateText);
    }
}

function handlePotentialGameOver(gameStateElement) {
    if (!gameStateElement || gameOverEffectsShownThisGame) {
        return;
    }
    // Also check preference early to avoid unnecessary debouncing if feature is off
    if (!userPreferences.ogsEnableWinCelebration && !userPreferences.ogsEnableFirstBlood) { // If both major features are off, less reason to churn
        return;
    }

    const currentText = gameStateElement.textContent.trim();
    if (currentText === "") { return; }

    const style = window.getComputedStyle(gameStateElement);
    if (style.display === 'none' || style.visibility === 'hidden' || gameStateElement.offsetParent === null) {
        // console.log("OGS Enhancer: Game state element found but not visible. Text:", currentText); // Can be noisy
        return; 
    }
    
    console.log("OGS Enhancer: Potential game over detected. Debouncing... Text:", currentText);

    if (gameOverCheckTimeout) { clearTimeout(gameOverCheckTimeout); }

    gameOverCheckTimeout = setTimeout(() => {
        const finalGameStateElement = document.querySelector('.MainGobanView .game-state');
        if (finalGameStateElement && finalGameStateElement.textContent.trim() === currentText) {
            const finalStyle = window.getComputedStyle(finalGameStateElement);
            if (finalStyle.display !== 'none' && finalStyle.visibility !== 'hidden' && finalGameStateElement.offsetParent !== null) {
                 processFinalGameOverState(currentText);
            } else {
                // console.log("OGS Enhancer: Game state changed or became invisible during debounce. Text was:", currentText); // Can be noisy
            }
        } else {
            // console.log("OGS Enhancer: Game state text changed during debounce. Initial:", currentText, "New:", finalGameStateElement ? finalGameStateElement.textContent.trim() : "null"); // Can be noisy
        }
    }, GAME_OVER_DEBOUNCE_MS);
}

// --- Game State Management ---
function resetGameSpecificStates() {
    console.log("OGS Enhancer: Resetting game-specific states (First Blood, Game Over).");
    firstBloodHappenedThisGame = false;
    gameOverEffectsShownThisGame = false;
    if (gameOverCheckTimeout) { 
        clearTimeout(gameOverCheckTimeout);
        gameOverCheckTimeout = null;
    }
    // Re-load preferences in case they changed, then setup observers
    loadUserPreferences(() => {
        setupCaptureDetectionLogic();
        setupGameOverDetectionLogic();
    });
}

// --- Capture Detection Logic (First Blood) ---
function setupCaptureDetectionLogic() {
    if (captureObserver) { captureObserver.disconnect(); }
    // If First Blood is disabled, don't bother setting up the observer
    if (!userPreferences.ogsEnableFirstBlood) {
        console.log("OGS Enhancer: First Blood capture detection skipped as feature is disabled.");
        return;
    }
    const captureCountElements = document.querySelectorAll('.player-container .captures .num-captures-count');
    if (captureCountElements.length === 0) { return; }

    captureObserver = new MutationObserver((mutationsList) => {
        if (firstBloodHappenedThisGame) return;
        for (const mutation of mutationsList) {
            if (mutation.type === 'characterData' || mutation.type === 'childList') {
                const targetElement = mutation.target.nodeType === Node.TEXT_NODE ? mutation.target.parentNode : mutation.target;
                if (targetElement && targetElement.classList && targetElement.classList.contains('num-captures-count')) {
                    const currentCaptures = parseInt(targetElement.textContent.trim(), 10);
                    if (!isNaN(currentCaptures) && currentCaptures > 0) {
                        if (!firstBloodHappenedThisGame) {
                            console.log("OGS Enhancer: First Blood detected! Captures:", currentCaptures);
                            firstBloodHappenedThisGame = true;
                            showFirstBloodEffect(); 
                            break; 
                        }
                    }
                }
            }
        }
    });
    captureCountElements.forEach(element => {
        captureObserver.observe(element, { childList: true, characterData: true, subtree: true });
    });
    console.log("OGS Enhancer: First Blood capture observer is active.");
}

// --- Game Over Detection Logic ---
function setupGameOverDetectionLogic() {
    if (gameOverObserver) { gameOverObserver.disconnect(); }
    // If Win Celebration is disabled, don't bother setting up the observer
    if (!userPreferences.ogsEnableWinCelebration) {
        console.log("OGS Enhancer: Game Over detection skipped as Win Celebration feature is disabled.");
        return;
    }
    const gameViewContainer = document.querySelector('.MainGobanView');
    if (!gameViewContainer) {
        console.warn("OGS Enhancer: .MainGobanView container not found for game over detection.");
        return;
    }
    gameOverObserver = new MutationObserver((mutationsList, observer) => {
        if (gameOverEffectsShownThisGame) return; 
        const gameStateElement = gameViewContainer.querySelector('.game-state');
        if (gameStateElement) {
            handlePotentialGameOver(gameStateElement);
        }
    });
    gameOverObserver.observe(gameViewContainer, {
        childList: true, subtree: true, characterData: true, attributes: true 
    });
    console.log("OGS Enhancer: Game Over observer is active with debouncing.");
}

// --- Main Initialization ---
function initializeExtension() {
    console.log("OGS Enhancer: Content script loaded. Version 0.4.1"); // Updated version in log
    
    // Listen for storage changes to update preferences dynamically
    chrome.storage.onChanged.addListener(function(changes, namespace) {
        if (namespace === 'sync') {
            console.log('OGS Enhancer: Detected preference changes in chrome.storage.sync.');
            loadUserPreferences(() => {
                // Potentially re-initialize observers if settings that affect them changed
                // For example, if a feature was turned off and then on again.
                // Disconnect old observers before setting up new ones based on new prefs.
                if (captureObserver) captureObserver.disconnect();
                if (gameOverObserver) gameOverObserver.disconnect();
                setupCaptureDetectionLogic();
                setupGameOverDetectionLogic();
            });
        }
    });
    
    const tryInterval = setInterval(() => {
        const mainGobanView = document.querySelector('.MainGobanView'); 
        if (mainGobanView) {
            clearInterval(tryInterval);
            console.log("OGS Enhancer: MainGobanView found. Initializing all event detections.");
            // Load preferences first, then set up observers in the callback
            loadUserPreferences(() => {
                resetGameSpecificStates(); // This will also call setup for observers based on loaded prefs
            });
        } else {
            console.log("OGS Enhancer: Waiting for MainGobanView to appear...");
        }
    }, 1000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
    initializeExtension();
}