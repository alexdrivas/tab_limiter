// Popup Script - Tab Limiter

const DEFAULT_SETTINGS = {
  maxTabs: 10,
  enabled: true,
  behavior: 'block',
};

// DOM Elements
const currentTabsEl = document.getElementById('currentTabs');
const tabLimitEl = document.getElementById('tabLimit');
const progressBarEl = document.getElementById('progressBar');
const enableToggle = document.getElementById('enableToggle');
const quickLimitInput = document.getElementById('quickLimit');
const saveLimitBtn = document.getElementById('saveLimit');
const openOptionsBtn = document.getElementById('openOptions');

// Initialize popup
async function init() {
  await loadSettings();
  await updateTabCount();
  setupEventListeners();
}

// Load settings from storage
async function loadSettings() {
  const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  
  tabLimitEl.textContent = settings.maxTabs;
  enableToggle.checked = settings.enabled;
  quickLimitInput.value = settings.maxTabs;
  quickLimitInput.placeholder = settings.maxTabs;
}

// Update current tab count
async function updateTabCount() {
  const tabs = await chrome.tabs.query({});
  const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  
  const currentCount = tabs.length;
  const maxTabs = settings.maxTabs;
  
  currentTabsEl.textContent = currentCount;
  
  // Update progress bar
  const percentage = Math.min((currentCount / maxTabs) * 100, 100);
  progressBarEl.style.width = `${percentage}%`;
  
  // Update progress bar color
  progressBarEl.classList.remove('warning', 'danger');
  if (currentCount >= maxTabs) {
    progressBarEl.classList.add('danger');
  } else if (currentCount >= maxTabs * 0.8) {
    progressBarEl.classList.add('warning');
  }
}

// Setup event listeners
function setupEventListeners() {
  // Enable/disable toggle
  enableToggle.addEventListener('change', async () => {
    const enabled = enableToggle.checked;
    await chrome.storage.sync.set({ enabled });
    
    // Update badge
    chrome.runtime.sendMessage({ action: 'updateBadge' });
    
    showFeedback(enabled ? 'Limiter enabled' : 'Limiter disabled');
  });

  // Save limit button
  saveLimitBtn.addEventListener('click', async () => {
    const newLimit = parseInt(quickLimitInput.value);
    
    if (isNaN(newLimit) || newLimit < 1 || newLimit > 100) {
      showFeedback('Please enter a valid number (1-100)', true);
      return;
    }
    
    await chrome.storage.sync.set({ maxTabs: newLimit });
    tabLimitEl.textContent = newLimit;
    
    // Update badge and tab count
    chrome.runtime.sendMessage({ action: 'updateBadge' });
    await updateTabCount();
    
    showFeedback(`Limit set to ${newLimit} tabs`);
  });

  // Enter key in input
  quickLimitInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      saveLimitBtn.click();
    }
  });

  // Open options page
  openOptionsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // Listen for tab changes
  chrome.tabs.onCreated.addListener(updateTabCount);
  chrome.tabs.onRemoved.addListener(updateTabCount);
}

// Show feedback message
function showFeedback(message, isError = false) {
  // Create feedback element
  const feedback = document.createElement('div');
  feedback.textContent = message;
  feedback.style.cssText = `
    position: fixed;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    background: ${isError ? '#ef4444' : '#10b981'};
    color: white;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    z-index: 1000;
    animation: slideDown 0.3s ease;
  `;
  
  document.body.appendChild(feedback);
  
  // Remove after 2 seconds
  setTimeout(() => {
    feedback.style.animation = 'slideUp 0.3s ease';
    setTimeout(() => feedback.remove(), 300);
  }, 2000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
  
  @keyframes slideUp {
    from {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    to {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
  }
`;
document.head.appendChild(style);

// Initialize on load
init();

