# Privacy Policy for Tab Limiter

**Last Updated: November 19, 2025**

## Overview
Tab Limiter is committed to protecting your privacy. This extension does not collect, transmit, or share any personal information.

## Data Collection
Tab Limiter **does not collect any user data**. The extension:
- Does not track your browsing history
- Does not collect personal information
- Does not use analytics or tracking services
- Does not transmit any data to external servers

## Data Storage
The extension stores the following data **locally on your device only**:

### User Preferences (synced via Chrome Sync):
- Maximum tab limit setting (number, 1-100)
- Enabled/disabled state (boolean)
- Behavior mode preference (block or auto-close)

### Local Tab History (not synced):
- Recently closed tabs (last 5 only) including:
  - Tab title
  - Tab URL
  - Tab favicon URL
  - Timestamp of when tab was closed

This information is stored temporarily to enable the "Recently Closed Tabs" feature in the Insights section, allowing you to quickly reopen tabs you may have accidentally closed.

**Important Privacy Notes:**
- All data is stored using Chrome's `chrome.storage.sync` and `chrome.storage.local` APIs
- Data may sync across your Chrome browsers if you have Chrome Sync enabled
- Data never leaves Google's infrastructure
- Data is not accessible to the extension developer or any third parties
- You can clear this data at any time by removing the extension

## Data Access
The extension accesses the following information about your tabs:
- **Tab count**: To enforce your set limit
- **Tab URLs and titles**: Only for Insights features (Recently Closed, Duplicate Detection)
- **Tab favicon URLs**: To display icons in the Recently Closed list
- **Tab IDs**: To identify and close tabs when necessary

This information is:
- ✅ Used only for local functionality
- ✅ Never transmitted to external servers
- ✅ Never shared with third parties
- ✅ Stored temporarily and locally only

## Permissions Used
- **tabs**: Required to count tabs, access tab URLs/titles for Insights features (Recently Closed Tabs, Duplicate Detection), and close tabs when limits are exceeded
- **storage**: Required to save your preferences locally using `chrome.storage.sync` and store recently closed tabs history using `chrome.storage.local`

## Third-Party Services
Tab Limiter does not use any third-party services, analytics, or advertising networks.

## Changes to This Policy
Any changes to this privacy policy will be posted in this document and updated in the Chrome Web Store listing.

## Contact
For questions about this privacy policy, please open an issue at:
https://github.com/alexdrivas/tab_limiter/issues

## Your Consent
By using Tab Limiter, you consent to this privacy policy.