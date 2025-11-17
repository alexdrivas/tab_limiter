// Options Page Script - Tab Limiter

const DEFAULT_SETTINGS = {
  maxTabs: 10,
  enabled: true,
  behavior: 'block',
};

// DOM Elements
const enabledToggle = document.getElementById('enabledToggle');
const maxTabsInput = document.getElementById('maxTabsInput');
const maxTabsSlider = document.getElementById('maxTabsSlider');
const behaviorBlock = document.getElementById('behaviorBlock');
const behaviorWarn = document.getElementById('behaviorWarn');
const behaviorAutoclose = document.getElementById('behaviorAutoclose');
const currentTabCount = document.getElementById('currentTabCount');
const statusBadge = document.getElementById('statusBadge');
const saveBtn = document.getElementById('saveBtn');
const saveBtnText = document.getElementById('saveBtnText');
const saveStatus = document.getElementById('saveStatus');

// Toggle is now a button, not a checkbox
let isEnabled = true;

// Initialize options page
async function init() {
  await loadSettings();
  await updateStats();
  setupEventListeners();
}

// Load settings from storage
async function loadSettings() {
  const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  
  // Update toggle button state
  isEnabled = settings.enabled;
  enabledToggle.setAttribute('aria-checked', settings.enabled.toString());
  
  maxTabsInput.value = settings.maxTabs;
  maxTabsSlider.value = settings.maxTabs;
  
  // Set behavior radio buttons
  if (settings.behavior === 'block') {
    behaviorBlock.checked = true;
  } else if (settings.behavior === 'warn') {
    behaviorWarn.checked = true;
  } else if (settings.behavior === 'autoclose') {
    behaviorAutoclose.checked = true;
  }
}

// Update statistics
async function updateStats() {
  const tabs = await chrome.tabs.query({});
  const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  
  const tabCount = tabs.length;
  const maxTabs = settings.maxTabs;
  
  currentTabCount.textContent = tabCount;
  
  // Update status badge
  if (!settings.enabled) {
    statusBadge.textContent = '⚪ Disabled';
    statusBadge.style.color = '#9ca3af';
  } else if (tabCount >= maxTabs) {
    statusBadge.textContent = '🔴 At Limit';
    statusBadge.style.color = '#ef4444';
  } else if (tabCount >= maxTabs * 0.8) {
    statusBadge.textContent = '🟡 Near Limit';
    statusBadge.style.color = '#f59e0b';
  } else {
    statusBadge.textContent = '🟢 Safe';
    statusBadge.style.color = '#10b981';
  }
}

// Setup event listeners
function setupEventListeners() {
  // Toggle button (now a button element, not checkbox)
  enabledToggle.addEventListener('click', () => {
    isEnabled = !isEnabled;
    enabledToggle.setAttribute('aria-checked', isEnabled.toString());
  });

  // Sync input and slider
  maxTabsInput.addEventListener('input', () => {
    const value = parseInt(maxTabsInput.value);
    if (!isNaN(value) && value >= 1 && value <= 100) {
      maxTabsSlider.value = value;
    }
  });

  maxTabsSlider.addEventListener('input', () => {
    maxTabsInput.value = maxTabsSlider.value;
  });

  // Save button
  saveBtn.addEventListener('click', saveSettings);

  // Auto-update stats when tabs change
  chrome.tabs.onCreated.addListener(updateStats);
  chrome.tabs.onRemoved.addListener(updateStats);
}

// Save settings
async function saveSettings() {
  const maxTabs = parseInt(maxTabsInput.value);
  
  // Validation
  if (isNaN(maxTabs) || maxTabs < 1 || maxTabs > 100) {
    showSaveStatus('Please enter a valid number between 1 and 100', true);
    return;
  }
  
  // Get selected behavior
  let behavior = 'block';
  if (behaviorWarn.checked) behavior = 'warn';
  if (behaviorAutoclose.checked) behavior = 'autoclose';
  
  // Save to storage
  const settings = {
    maxTabs: maxTabs,
    enabled: isEnabled,
    behavior: behavior,
  };
  
  await chrome.storage.sync.set(settings);
  
  // Update badge
  chrome.runtime.sendMessage({ action: 'updateBadge' });
  
  // Show success feedback
  showSaveStatus('✅ Settings saved successfully!');
  
  // Update button appearance
  saveBtn.classList.add('saved');
  saveBtnText.textContent = 'Saved!';
  
  setTimeout(() => {
    saveBtn.classList.remove('saved');
    saveBtnText.textContent = 'Save Changes';
  }, 2000);
  
  // Update stats
  await updateStats();
}

// Show save status message
function showSaveStatus(message, isError = false) {
  saveStatus.textContent = message;
  saveStatus.style.color = isError ? '#ef4444' : '#10b981';
  
  setTimeout(() => {
    saveStatus.textContent = '';
  }, 3000);
}

// Initialize on load
init();

