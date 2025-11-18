# Changelog

All notable changes to Tab Limiter will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-17

### Added
- Initial release of Tab Limiter
- Custom tab limits (1-100 tabs)
- Three behavior modes: Block, Warn, Auto-close
- Color-coded badge counter (green/orange/red)
- Real-time tab count display
- Quick enable/disable toggle
- Settings page with comprehensive options
- Progress bar visualization
- Settings persistence via Chrome sync storage

### Technical
- Manifest V3 compliance
- Vanilla JavaScript (zero dependencies)
- Service worker architecture
- Chrome APIs: tabs, storage, action, runtime

## [1.1.0] - 2025-11-18

### Added
- **Warning Banner**: Prominent visual alert in popup when at/over limit
  - Yellow warning when exactly at limit
  - Red alert when over limit with count of excess tabs
  - Replaces dismissible system notifications
- **Settings Insights Tab**: New dedicated section for tab analysis
  - Recently Closed Tabs: View and reopen last 5 closed tabs
  - Memory Monitor: Identify tabs consuming >100MB (Dev/Canary only)
  - Duplicate Detection: Find and close duplicate URLs
- **Navigation Sidebar**: Clean two-tab layout in Settings (General/Insights)
- **Tab Info Caching**: Reliable tracking of closed tabs with titles and favicons

### Changed
- Streamlined popup to focus on core limiter controls
- Moved analytics features from popup to Settings → Insights
- Reduced visual clutter in Settings with cleaner section titles
- Simplified Settings General page copy

### Removed
- Chrome system notifications (replaced with popup banner)
- `notifications` permission (no longer needed)
- `processes` permission (gracefully degrades on stable Chrome)

### Technical
- Implemented tab lifecycle caching for closed tab history
- Added graceful fallback for memory monitoring on stable Chrome
- Added `chrome.storage.local` for closed tabs persistence
- Auto-refresh insights every 5 seconds when viewing
- Reduced popup load time by removing heavy data queries

## [Unreleased]

### Planned
- Dark mode support
- Keyboard shortcuts
- Statistics and analytics dashboard
- Multiple color themes
- Whitelist/blacklist for specific domains
- Tab grouping support
- Time-based limits
- Tab session save/restore
- Export/import settings
- Multi-language support

---

## Version History

**[1.0.0]** - Initial Release (2025-11-17)
- First public version
- Core tab limiting functionality
- Complete UI and settings

---

## Release Notes Format

### Added
For new features.

### Changed
For changes in existing functionality.

### Deprecated
For soon-to-be removed features.

### Removed
For now removed features.

### Fixed
For any bug fixes.

### Security
In case of vulnerabilities.

