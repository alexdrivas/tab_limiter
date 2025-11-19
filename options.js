// Options Page Script - Tab Limiter

const DEFAULT_SETTINGS = {
  maxTabs: 10,
  enabled: true,
  behavior: 'block',
};

// DOM Elements
const enabledToggle = document.getElementById('enabledToggle');
const maxTabsInput = document.getElementById('maxTabsInput');
const behaviorBlock = document.getElementById('behaviorBlock');
const behaviorAutoclose = document.getElementById('behaviorAutoclose');
const currentTabCount = document.getElementById('currentTabCount');

// Toggle is now a button, not a checkbox
let isEnabled = true;

// Initialize options page
async function init() {
  await loadSettings();
  await updateStats();
  setupEventListeners();
  setupNavigation();
  
  // Load insights if on insights section
  if (document.getElementById('insights-section').classList.contains('active')) {
    await loadInsights();
  }
}

// Load settings from storage
async function loadSettings() {
  const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  
  // Update toggle button state
  isEnabled = settings.enabled;
  enabledToggle.setAttribute('aria-checked', settings.enabled.toString());
  
  maxTabsInput.value = settings.maxTabs;
  
  // Set behavior radio buttons
  if (settings.behavior === 'block') {
    behaviorBlock.checked = true;
  } else if (settings.behavior === 'autoclose') {
    behaviorAutoclose.checked = true;
  }
}

// Update statistics
async function updateStats() {
  const tabs = await chrome.tabs.query({});
  const tabCount = tabs.length;
  
  currentTabCount.textContent = tabCount;
}

// Setup event listeners
function setupEventListeners() {
  // Toggle button - auto-save on change
  enabledToggle.addEventListener('click', async () => {
    isEnabled = !isEnabled;
    enabledToggle.setAttribute('aria-checked', isEnabled.toString());
    await autoSave();
  });

  // Max tabs input - auto-save on change
  maxTabsInput.addEventListener('change', async () => {
    await autoSave();
  });

  // Behavior radio buttons - auto-save on change
  behaviorBlock.addEventListener('change', async () => {
    if (behaviorBlock.checked) await autoSave();
  });
  
  behaviorAutoclose.addEventListener('change', async () => {
    if (behaviorAutoclose.checked) await autoSave();
  });

  // Auto-update stats when tabs change
  chrome.tabs.onCreated.addListener(updateStats);
  chrome.tabs.onRemoved.addListener(updateStats);
}

// Auto-save settings
async function autoSave() {
  const maxTabs = parseInt(maxTabsInput.value);
  
  // Validation
  if (isNaN(maxTabs) || maxTabs < 1 || maxTabs > 100) {
    return;
  }
  
  // Get selected behavior
  let behavior = 'block';
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
  
  // Update stats
  await updateStats();
}

// Setup navigation
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.section-content');
  
  navItems.forEach(item => {
    item.addEventListener('click', async () => {
      const targetSection = item.getAttribute('data-section');
      
      // Update active nav item
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      
      // Update active section
      sections.forEach(section => section.classList.remove('active'));
      document.getElementById(`${targetSection}-section`).classList.add('active');
      
      // Load insights if switching to insights
      if (targetSection === 'insights') {
        await loadInsights();
      }
    });
  });
}

// Load all insights
async function loadInsights() {
  await loadClosedTabs();
  await loadMemoryTabs();
  await loadDuplicateTabs();
  
  // Auto-refresh every 5 seconds while on insights
  if (window.insightsInterval) {
    clearInterval(window.insightsInterval);
  }
  
  window.insightsInterval = setInterval(async () => {
    const insightsSection = document.getElementById('insights-section');
    if (insightsSection && insightsSection.classList.contains('active')) {
      await loadMemoryTabs();
      await loadDuplicateTabs();
    } else {
      clearInterval(window.insightsInterval);
    }
  }, 5000);
}

// Load and display recently closed tabs
async function loadClosedTabs() {
  const response = await chrome.runtime.sendMessage({ action: 'getClosedTabs' });
  const closedTabs = response.closedTabs || [];
  
  const listEl = document.getElementById('closedTabsList');
  
  if (closedTabs.length === 0) {
    listEl.innerHTML = '<p class="empty-state">No recently closed tabs</p>';
    return;
  }
  
  listEl.innerHTML = '';
  closedTabs.forEach(tab => {
    const item = document.createElement('div');
    item.className = 'insights-item';
    
    const timeAgo = getTimeAgo(tab.closedAt);
    
    item.innerHTML = `
      <div class="tab-info-insights">
        <img src="${tab.favIconUrl || 'icons/icon16.png'}" class="tab-favicon-insights" onerror="this.src='icons/icon16.png'">
        <div class="tab-details-insights">
          <div class="tab-title-insights">${escapeHtml(tab.title)}</div>
          <div class="tab-url-insights">${escapeHtml(truncateUrl(tab.url))}</div>
          <div class="tab-meta-insights">${timeAgo}</div>
        </div>
      </div>
      <button class="btn-icon-insights reopen-btn" title="Reopen tab">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z" stroke="currentColor" stroke-width="1.5"/>
          <path d="M6 8l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
    `;
    
    const reopenBtn = item.querySelector('.reopen-btn');
    reopenBtn.addEventListener('click', async () => {
      await chrome.runtime.sendMessage({ action: 'reopenTab', url: tab.url });
    });
    
    listEl.appendChild(item);
  });
}

// Load and display memory-intensive tabs
async function loadMemoryTabs() {
  const response = await chrome.runtime.sendMessage({ action: 'getMemoryTabs' });
  const memoryTabs = response.memoryTabs || [];
  
  const listEl = document.getElementById('memoryTabsList');
  
  if (memoryTabs.length === 0) {
    listEl.innerHTML = '<p class="empty-state">No high memory tabs detected</p>';
    return;
  }
  
  listEl.innerHTML = '';
  
  memoryTabs.forEach(tab => {
    const item = document.createElement('div');
    item.className = 'insights-item';
    
    let memoryClass = 'memory-high';
    if (tab.memoryMB > 500) memoryClass = 'memory-critical';
    else if (tab.memoryMB > 300) memoryClass = 'memory-moderate';
    
    item.innerHTML = `
      <div class="tab-info-insights">
        <div class="tab-details-insights">
          <div class="tab-title-insights">${escapeHtml(tab.title)}</div>
          <div class="tab-url-insights">${escapeHtml(truncateUrl(tab.url))}</div>
        </div>
        <span class="tab-memory-warning ${memoryClass}">${tab.memoryMB} MB</span>
      </div>
      <button class="btn-icon-insights close-btn" title="Close tab">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
    `;
    
    const closeBtn = item.querySelector('.close-btn');
    closeBtn.addEventListener('click', async () => {
      await chrome.runtime.sendMessage({ action: 'closeTab', tabId: tab.id });
      await loadMemoryTabs();
    });
    
    listEl.appendChild(item);
  });
}

// Load and display duplicate tabs
async function loadDuplicateTabs() {
  const response = await chrome.runtime.sendMessage({ action: 'getDuplicateTabs' });
  const duplicates = response.duplicates || [];
  
  const listEl = document.getElementById('duplicateTabsList');
  
  if (duplicates.length === 0) {
    listEl.innerHTML = '<p class="empty-state">No duplicate tabs found</p>';
    return;
  }
  
  listEl.innerHTML = '';
  
  duplicates.forEach(duplicate => {
    const item = document.createElement('div');
    item.className = 'insights-item duplicate-group';
    
    item.innerHTML = `
      <div class="tab-info-insights">
        <div class="tab-details-insights">
          <div class="tab-title-insights">${escapeHtml(duplicate.title)}</div>
          <div class="tab-url-insights">${escapeHtml(truncateUrl(duplicate.url))}</div>
          <div class="tab-meta-insights">${duplicate.tabs.length} duplicates</div>
        </div>
      </div>
      <button class="btn-icon-insights close-btn" title="Close duplicates">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
    `;
    
    const closeBtn = item.querySelector('.close-btn');
    closeBtn.addEventListener('click', async () => {
      // Keep the first tab, close the rest
      const tabIdsToClose = duplicate.tabs.slice(1).map(t => t.id);
      await chrome.runtime.sendMessage({ action: 'closeDuplicateTabs', tabIds: tabIdsToClose });
      await loadDuplicateTabs();
    });
    
    listEl.appendChild(item);
  });
}

// Helper function to get time ago
function getTimeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// Helper function to truncate URL
function truncateUrl(url) {
  try {
    const urlObj = new URL(url);
    let display = urlObj.hostname + urlObj.pathname;
    if (display.length > 60) {
      return display.substring(0, 57) + '...';
    }
    return display;
  } catch (e) {
    return url.substring(0, 60);
  }
}

// Helper function to escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Listen for messages to switch tabs
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openInsightsTab') {
    // Switch to insights tab
    const insightsNav = document.querySelector('[data-section="insights"]');
    if (insightsNav) {
      insightsNav.click();
    }
  }
});

// Initialize on load
init();

