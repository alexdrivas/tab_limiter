// Background Service Worker - Tab Limiter
// Handles tab monitoring, limiting logic, and notifications

// Default settings
const DEFAULT_SETTINGS = {
  maxTabs: 10,
  enabled: true,
  behavior: 'block', // 'block', 'warn', or 'autoclose'
};

// Initialize extension on install
chrome.runtime.onInstalled.addListener(async () => {
  const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  if (!settings.maxTabs) {
    await chrome.storage.sync.set(DEFAULT_SETTINGS);
  }
  updateBadge();
});

// Listen for new tabs being created
chrome.tabs.onCreated.addListener(async (tab) => {
  const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  
  if (!settings.enabled) {
    updateBadge();
    return;
  }

  const tabs = await chrome.tabs.query({});
  const tabCount = tabs.length;
  
  updateBadge();

  // Check if we've exceeded the limit
  if (tabCount > settings.maxTabs) {
    handleLimitExceeded(tab, tabCount, settings);
  }
});

// Listen for tabs being removed to update badge
chrome.tabs.onRemoved.addListener(() => {
  updateBadge();
});

// Listen for tab updates (e.g., when a tab becomes active)
chrome.tabs.onActivated.addListener(() => {
  updateBadge();
});

// Handle when limit is exceeded
async function handleLimitExceeded(newTab, currentCount, settings) {
  const message = `Tab limit reached! You have ${currentCount} tabs open (limit: ${settings.maxTabs})`;

  switch (settings.behavior) {
    case 'block':
      // Close the newly created tab
      if (newTab && newTab.id) {
        await chrome.tabs.remove(newTab.id);
      }
      showNotification('Tab Blocked', message);
      break;

    case 'warn':
      // Just show a warning, don't close
      showNotification('Tab Limit Warning', message);
      break;

    case 'autoclose':
      // Close the oldest tab (first tab that's not pinned)
      const tabs = await chrome.tabs.query({ pinned: false });
      if (tabs.length > 0) {
        await chrome.tabs.remove(tabs[0].id);
        showNotification('Oldest Tab Closed', `Automatically closed oldest tab to maintain limit of ${settings.maxTabs}`);
      }
      break;
  }
}

// Show Chrome notification
function showNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: title,
    message: message,
    priority: 2
  });
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
  }
});

// Update badge when extension starts
updateBadge();

