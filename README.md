# Tab Limiter

Chrome extension for managing browser tabs by setting a maximum limit. Prevent tab overload and maintain focus.

## Features

### Core Limiting
- Set custom tab limits (1-100)
- Two behavior modes:
  - **Block**: Prevent new tabs when at limit
  - **Auto-Close**: Automatically close oldest tab
- Color-coded badge (🟢 green, 🟡 orange, 🔴 red)
- Real-time tab count and progress bar
- Quick enable/disable toggle

### Insights (Settings)
- **Recently Closed**: View and reopen last 5 closed tabs
- **Memory Monitor**: Identify high-memory tabs (>100MB)*
- **Duplicate Detection**: Find and close duplicate URLs

*Memory monitoring available in Chrome Dev/Canary only

### Other
- Settings sync across Chrome sessions
- Minimal permissions (tabs, storage only)
- Zero dependencies, client-side only

## Installation

### Development

```bash
git clone https://github.com/alexdrivas/tab_limiter.git
cd tab_limiter
```

1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `tab_limiter` folder

### Chrome Web Store

Coming soon.

## Usage

### Popup
1. Click extension icon
2. Set limit (1-100)
3. Enable toggle
4. Monitor badge color and count

### Settings
- **General**: Configure limit, behavior, and enable status
- **Insights**: View closed tabs, memory usage, and duplicates

## Technical

- **Manifest V3** compliant
- **Vanilla JavaScript** (zero dependencies)
- **Permissions**: `tabs`, `storage` only
- **APIs Used**: 
  - `chrome.tabs` - Tab monitoring and management
  - `chrome.storage.sync` - Settings persistence
  - `chrome.storage.local` - Closed tabs history
  - `chrome.action` - Badge and popup
  - `chrome.runtime` - Service worker messaging

### Architecture

```
tab_limiter/
├── manifest.json       # Extension config
├── background.js       # Service worker
├── popup.*            # Popup UI
├── options.*          # Settings page
└── icons/             # Extension icons
```

## License

MIT
