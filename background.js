// Background Service Worker - Tab Limiter
// Handles tab monitoring, limiting logic, and notifications

// Default settings
const DEFAULT_SETTINGS = {
  maxTabs: 10,
  enabled: true,
  behavior: 'block', // 'block' or 'autoclose'
};

// Store for recently closed tabs (max 5)
let recentlyClosedTabs = [];

// Store tab info for tracking closures
const tabInfoCache = new Map();

// Initialize extension on install
chrome.runtime.onInstalled.addListener(async () => {
  const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  if (!settings.maxTabs) {
    await chrome.storage.sync.set(DEFAULT_SETTINGS);
  }
  
  // Load recently closed tabs from storage
  const stored = await chrome.storage.local.get(['recentlyClosedTabs']);
  if (stored.recentlyClosedTabs) {
    recentlyClosedTabs = stored.recentlyClosedTabs;
  }
  
  updateBadge();
  
  // Initialize tab cache
  const tabs = await chrome.tabs.query({});
  tabs.forEach(tab => {
    if (tab.url && !tab.url.startsWith('chrome://')) {
      tabInfoCache.set(tab.id, {
        title: tab.title,
        url: tab.url,
        favIconUrl: tab.favIconUrl
      });
    }
  });
});

// Listen for new tabs being created
chrome.tabs.onCreated.addListener(async (tab) => {
  // Cache tab info
  if (tab.url && !tab.url.startsWith('chrome://')) {
    tabInfoCache.set(tab.id, {
      title: tab.title,
      url: tab.url,
      favIconUrl: tab.favIconUrl
    });
  }
  
  // Always update badge first to show accurate count
  updateBadge();
  
  // Check if this is the extension's settings page - always allow it
  // Check both url and pendingUrl (pendingUrl is set when tab is navigating)
  const optionsUrl = chrome.runtime.getURL('options.html');
  if ((tab.url && tab.url.startsWith(optionsUrl)) || 
      (tab.pendingUrl && tab.pendingUrl.startsWith(optionsUrl))) {
    return; // Don't enforce limits on settings page
  }
  
  const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  
  if (!settings.enabled) {
    return;
  }

  const tabs = await chrome.tabs.query({});
  const tabCount = tabs.length;

  // Check if we've exceeded the limit
  if (tabCount > settings.maxTabs) {
    handleLimitExceeded(tab, tabCount, settings);
  }
});

// Listen for tab updates to keep cache fresh
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url || changeInfo.title || changeInfo.favIconUrl) {
    if (tab.url && !tab.url.startsWith('chrome://')) {
      tabInfoCache.set(tabId, {
        title: tab.title,
        url: tab.url,
        favIconUrl: tab.favIconUrl
      });
    }
  }
});

// Listen for tabs being removed to update badge and track closed tabs
chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
  // Get tab info from cache
  const tabInfo = tabInfoCache.get(tabId);
  if (tabInfo && tabInfo.url && !tabInfo.url.startsWith('chrome://')) {
    trackClosedTab(tabInfo);
  }
  
  // Remove from cache
  tabInfoCache.delete(tabId);
  
  updateBadge();
});

// Listen for tab updates (e.g., when a tab becomes active)
chrome.tabs.onActivated.addListener(() => {
  updateBadge();
});

// Handle when limit is exceeded
async function handleLimitExceeded(newTab, currentCount, settings) {
  const optionsUrl = chrome.runtime.getURL('options.html');
  
  switch (settings.behavior) {
    case 'block':
      // Close the newly created tab
      if (newTab && newTab.id) {
        await chrome.tabs.remove(newTab.id);
      }
      break;

    case 'autoclose':
      // Close the oldest tab (first tab that's not pinned and not the settings page)
      const tabs = await chrome.tabs.query({ pinned: false });
      const closableTab = tabs.find(tab => !tab.url || !tab.url.startsWith(optionsUrl));
      if (closableTab) {
        await chrome.tabs.remove(closableTab.id);
      }
      break;
  }
}

// Update badge with current tab count
async function updateBadge() {
  try {
    const tabs = await chrome.tabs.query({});
    const tabCount = tabs.length;
    const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
    
    // Set badge text
    chrome.action.setBadgeText({ text: tabCount.toString() });
    
    // Set badge color based on status
    if (!settings.enabled) {
      chrome.action.setBadgeBackgroundColor({ color: '#9CA3AF' }); // Gray - disabled
    } else if (tabCount >= settings.maxTabs) {
      chrome.action.setBadgeBackgroundColor({ color: '#EF4444' }); // Red - at/over limit
    } else if (tabCount >= settings.maxTabs * 0.8) {
      chrome.action.setBadgeBackgroundColor({ color: '#F59E0B' }); // Orange - warning
    } else {
      chrome.action.setBadgeBackgroundColor({ color: '#10B981' }); // Green - safe
    }
  } catch (error) {
    console.error('Error updating badge:', error);
  }
}

// Track closed tabs
function trackClosedTab(tab) {
  const closedTabInfo = {
    title: tab.title || 'Untitled',
    url: tab.url,
    favIconUrl: tab.favIconUrl,
    closedAt: Date.now()
  };
  
  // Add to beginning of array
  recentlyClosedTabs.unshift(closedTabInfo);
  
  // Keep only last 5
  if (recentlyClosedTabs.length > 5) {
    recentlyClosedTabs = recentlyClosedTabs.slice(0, 5);
  }
  
  // Store in local storage
  chrome.storage.local.set({ recentlyClosedTabs });
}

// Find duplicate tabs
async function findDuplicateTabs() {
  const tabs = await chrome.tabs.query({});
  const urlMap = new Map();
  const duplicates = [];
  
  tabs.forEach(tab => {
    if (tab.url && !tab.url.startsWith('chrome://')) {
      if (urlMap.has(tab.url)) {
        duplicates.push({
          url: tab.url,
          title: tab.title,
          tabs: [...urlMap.get(tab.url), { id: tab.id, windowId: tab.windowId }]
        });
        urlMap.get(tab.url).push({ id: tab.id, windowId: tab.windowId });
      } else {
        urlMap.set(tab.url, [{ id: tab.id, windowId: tab.windowId }]);
      }
    }
  });
  
  return duplicates.filter(dup => dup.tabs.length > 1);
}

// Get memory-intensive tabs
async function getMemoryIntensiveTabs() {
  // Check if processes API is available (only in Dev/Canary channels)
  // Use typeof to safely check without throwing errors
  if (typeof chrome.processes === 'undefined') {
    // Silently return empty array - processes API not available in stable Chrome
    return [];
  }
  
  try {
    if (typeof chrome.processes.getProcessInfo !== 'function') {
      return [];
    }
    
    const processes = await chrome.processes.getProcessInfo([], true);
    const tabs = await chrome.tabs.query({});
    const memoryTabs = [];
    
    // Map process info to tabs
    for (const tab of tabs) {
      if (tab.url && !tab.url.startsWith('chrome://')) {
        // Find process for this tab
        for (const [processId, process] of Object.entries(processes)) {
          if (process.tabs && process.tabs.includes(tab.id)) {
            if (process.privateMemory) {
              const memoryMB = Math.round(process.privateMemory / 1024 / 1024);
              // Only include tabs using more than 100MB
              if (memoryMB > 100) {
                memoryTabs.push({
                  id: tab.id,
                  title: tab.title,
                  url: tab.url,
                  memoryMB: memoryMB,
                  cpu: process.cpu || 0
                });
              }
            }
          }
        }
      }
    }
    
    // Sort by memory usage (highest first)
    return memoryTabs.sort((a, b) => b.memoryMB - a.memoryMB);
  } catch (error) {
    // Silently handle errors - API might not be fully available
    return [];
  }
}

// Listen for messages from popup/options
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateBadge') {
    updateBadge();
    sendResponse({ success: true });
  } else if (request.action === 'getTabCount') {
    chrome.tabs.query({}).then(tabs => {
      sendResponse({ count: tabs.length });
    });
    return true; // Will respond asynchronously
  } else if (request.action === 'getClosedTabs') {
    chrome.storage.local.get(['recentlyClosedTabs']).then(result => {
      sendResponse({ closedTabs: result.recentlyClosedTabs || [] });
    });
    return true;
  } else if (request.action === 'reopenTab') {
    if (request.url) {
      chrome.tabs.create({ url: request.url });
      sendResponse({ success: true });
    }
    return true;
  } else if (request.action === 'getDuplicateTabs') {
    findDuplicateTabs().then(duplicates => {
      sendResponse({ duplicates });
    });
    return true;
  } else if (request.action === 'closeDuplicateTabs') {
    if (request.tabIds && Array.isArray(request.tabIds)) {
      chrome.tabs.remove(request.tabIds).then(() => {
        sendResponse({ success: true });
      });
    }
    return true;
  } else if (request.action === 'getMemoryTabs') {
    getMemoryIntensiveTabs().then(memoryTabs => {
      sendResponse({ memoryTabs });
    });
    return true;
  } else if (request.action === 'closeTab') {
    if (request.tabId) {
      chrome.tabs.remove(request.tabId).then(() => {
        sendResponse({ success: true });
      });
    }
    return true;
  }
});

// Initialize on startup
async function initializeExtension() {
  // Load recently closed tabs from storage
  const stored = await chrome.storage.local.get(['recentlyClosedTabs']);
  if (stored.recentlyClosedTabs) {
    recentlyClosedTabs = stored.recentlyClosedTabs;
  }
  
  // Initialize tab cache
  const tabs = await chrome.tabs.query({});
  tabs.forEach(tab => {
    if (tab.url && !tab.url.startsWith('chrome://')) {
      tabInfoCache.set(tab.id, {
        title: tab.title,
        url: tab.url,
        favIconUrl: tab.favIconUrl
      });
    }
  });
  
  updateBadge();
}

// Initialize on startup
initializeExtension();

