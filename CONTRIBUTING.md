# Contributing to Tab Limiter

Thank you for your interest in contributing to Tab Limiter! This document provides guidelines and instructions for contributing.

## 🤝 How to Contribute

### Reporting Bugs

1. **Check existing issues** to avoid duplicates
2. **Create a new issue** with:
   - Clear, descriptive title
   - Steps to reproduce
   - Expected vs. actual behavior
   - Chrome version
   - Screenshots (if applicable)

### Suggesting Features

1. **Check existing issues/discussions**
2. **Open a feature request** with:
   - Clear description of the feature
   - Use case/problem it solves
   - Mockups or examples (if applicable)

### Code Contributions

#### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/yourusername/tab_limiter.git
cd tab_limiter

# Generate icons (optional)
python3 tools/quick-icons.py

# Load in Chrome
# 1. Go to chrome://extensions/
# 2. Enable Developer Mode
# 3. Click "Load unpacked"
# 4. Select the tab_limiter folder
```

#### Making Changes

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow existing code style
   - Keep changes focused and atomic
   - Test thoroughly

4. **Test your changes**
   - Load extension in Chrome
   - Test all behaviors (block, warn, auto-close)
   - Verify on different tab counts
   - Check notifications work
   - Ensure badge updates correctly

5. **Commit with clear messages**
   ```bash
   git commit -m "Add feature: description"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request**
   - Describe your changes
   - Reference any related issues
   - Add screenshots if UI changed

## 📝 Code Style

### JavaScript
- Use modern ES6+ syntax
- Use `const` and `let`, avoid `var`
- Use async/await over callbacks
- Add comments for complex logic
- Keep functions small and focused

### HTML/CSS
- Use semantic HTML5
- Follow BEM naming for CSS classes
- Keep styles modular
- Maintain consistent spacing

### Example:
```javascript
// Good
async function updateTabCount() {
  const tabs = await chrome.tabs.query({});
  const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  // ... rest of function
}

// Avoid
function updateTabCount() {
  chrome.tabs.query({}, function(tabs) {
    chrome.storage.sync.get(DEFAULT_SETTINGS, function(settings) {
      // ... nested callbacks
    });
  });
}
```

## 🧪 Testing Checklist

Before submitting a PR, verify:

- [ ] Extension loads without errors
- [ ] All three behaviors work (block, warn, auto-close)
- [ ] Settings persist after browser restart
- [ ] Badge updates in real-time
- [ ] Notifications appear correctly
- [ ] Popup UI is responsive
- [ ] Options page works correctly
- [ ] No console errors
- [ ] Works on different Chrome versions

## 📁 Project Structure

```
tab_limiter/
├── manifest.json          # Extension manifest (MV3)
├── background.js          # Service worker (core logic)
├── popup.html/css/js      # Extension popup UI
├── options.html/css/js    # Settings page
├── icons/                 # Extension icons
├── tools/                 # Development tools
│   ├── quick-icons.py    # Python icon generator
│   ├── generate-icons.js # Node icon generator
│   └── icon-converter.html # Browser-based converter
└── docs/                  # Documentation
    ├── README.md
    ├── INSTALL.md
    ├── QUICKSTART.md
    └── CONTRIBUTING.md
```

## 🎯 Areas for Contribution

### Good First Issues
- Documentation improvements
- UI/UX enhancements
- Icon design improvements
- Additional themes/color schemes

### Intermediate
- Tab grouping support
- Whitelist/blacklist functionality
- Statistics dashboard
- Import/export settings

### Advanced
- Time-based limits
- Per-window limits
- Machine learning for smart limits
- Integration with other productivity tools

## 💡 Feature Ideas

Looking for something to work on? Consider:

1. **Dark Mode**: Add dark theme support
2. **Keyboard Shortcuts**: Add hotkeys for quick actions
3. **Tab Session Manager**: Save/restore tab sessions
4. **Analytics**: Track tab usage patterns
5. **Sync Across Devices**: Better Chrome sync integration
6. **Whitelist**: Allow unlimited tabs for certain domains
7. **Smart Limits**: AI-based limit suggestions
8. **Themes**: Multiple color schemes

## 📦 Release Process

(For maintainers)

1. Update version in `manifest.json`
2. Update `CHANGELOG.md`
3. Test thoroughly
4. Create git tag: `git tag v1.x.x`
5. Push tag: `git push origin v1.x.x`
6. Create GitHub release
7. (Optional) Submit to Chrome Web Store

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You!

Your contributions make this project better for everyone. Whether it's a bug report, feature suggestion, or code contribution - thank you!

---

**Questions?** Open an issue or reach out to the maintainers.

