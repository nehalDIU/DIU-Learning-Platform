# File Tabs Feature Documentation

## Overview

The File Tabs feature allows users to have multiple files open simultaneously in tabs above the content view. This provides a professional, browser-like experience for managing multiple learning materials.

## Features

### ✅ Core Functionality
- **Multiple File Tabs**: Open multiple files (slides, videos, documents, etc.) in separate tabs
- **Tab Switching**: Click on tabs to switch between different files
- **Tab Closing**: Close individual tabs with the X button
- **Active Tab Indicator**: Visual indication of the currently active tab

### ✅ Professional Design
- **File Type Icons**: Different icons for slides, videos, documents, syllabus, and study tools
- **Responsive Layout**: Optimized for mobile, tablet, and desktop screens
- **Smooth Animations**: Hover effects and transitions for better UX
- **Professional Styling**: Clean, modern design that matches the platform theme

### ✅ Advanced Features
- **State Persistence**: Maintains video playback position, scroll position, and other states when switching between tabs
- **Keyboard Shortcuts**:
  - `Ctrl+Tab` / `Cmd+Tab`: Switch between tabs
  - `Ctrl+W` / `Cmd+W`: Close current tab
  - `Ctrl+1-9` / `Cmd+1-9`: Jump to specific tab by number
- **Tab Count Indicator**: Shows number of open tabs
- **Context Menu**: Right-click on tabs for additional options
- **Expand/Minimize**: Toggle between normal and expanded view

### ✅ Responsive Design
- **Mobile (< 640px)**: Compact tabs with essential information
- **Tablet (641px - 1024px)**: Medium-sized tabs with more details
- **Desktop (> 1024px)**: Full-featured tabs with all information

## Usage

### Opening Files in Tabs
```javascript
// Access the multi-course manager
const manager = window.multiCourseManager

// Add content to tabs
manager.addContent({
  id: "unique-file-id",
  title: "File Title",
  type: "slide", // "slide" | "video" | "document" | "syllabus" | "study-tool"
  url: "file-url",
  courseTitle: "Course Name",
  courseCode: "CSE 4108",
  topicTitle: "Topic Name (optional)",
  description: "File description (optional)"
})
```

### Managing Tabs
```javascript
// Switch to a specific tab
manager.switchTab("file-id")

// Close a specific tab
manager.removeTab("file-id")

// Close all other tabs except one
manager.closeOtherTabs("keep-this-tab-id")

// Close all tabs
manager.closeAllTabs()

// Get information
const tabs = manager.getTabs()
const activeTab = manager.getActiveTab()
const tabCount = manager.getTabCount()
```

## File Types and Icons

| Type | Icon | Description |
|------|------|-------------|
| `slide` | 📄 FileText | Presentation slides |
| `video` | 🎥 Video | Video lectures |
| `document` | 📄 FileText | PDF documents, notes |
| `syllabus` | 📚 BookOpen | Course syllabus |
| `study-tool` | 🎓 GraduationCap | Practice problems, quizzes |

## Responsive Breakpoints

### Mobile (< 640px)
- Tab width: 120px - 160px
- Title max width: 80px
- Compact controls
- Essential information only

### Tablet (641px - 1024px)
- Tab width: 140px - 180px
- Title max width: 100px
- Medium controls
- Course code visible

### Desktop (> 1024px)
- Tab width: 160px - 220px
- Title max width: 120px
- Full controls
- All information visible
- Keyboard shortcuts hint

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Tab` | Switch to next tab |
| `Ctrl+Shift+Tab` | Switch to previous tab |
| `Ctrl+W` | Close current tab |
| `Ctrl+1` to `Ctrl+9` | Jump to tab 1-9 |

## Styling Classes

### CSS Classes Used
- `.file-tabs-container`: Main tabs container
- `.file-tab`: Individual tab styling
- `.file-tab-active`: Active tab indicator
- `.file-tab-title`: Tab title text
- `.file-tab-close`: Close button
- `.file-tabs-controls`: Control buttons area

### Custom CSS
The feature includes custom CSS in `components/multi-course-content-manager.css` for:
- Responsive breakpoints
- Hover animations
- Focus styles for accessibility
- Smooth transitions

## Integration

The File Tabs feature is integrated into the `MultiCourseContentManager` component and works seamlessly with:
- Sidebar content selection
- Content viewer
- Course enrollment system
- Theme system (dark/light mode)

## Accessibility

- **Keyboard Navigation**: Full keyboard support
- **Focus Indicators**: Clear focus styles
- **Screen Reader Support**: Proper ARIA labels and titles
- **High Contrast**: Works with dark/light themes

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## State Persistence

### Video State Management
- **Playback Position**: Automatically saves and restores video current time
- **Playback Rate**: Maintains custom playback speed settings
- **Play/Pause State**: Remembers if video was playing when switched away
- **Auto-Resume**: Continues playing from saved position if video was playing

### Document State Management
- **Scroll Position**: Maintains scroll position for slides and documents
- **Zoom Level**: Preserves zoom settings per tab
- **View State**: Remembers user's viewing preferences

### Implementation Details
- State is saved every 5 seconds for videos
- Scroll position is saved on scroll events
- State is restored when switching back to a tab
- Uses YouTube API for video state management
- Graceful fallback if state restoration fails

## Performance

- **Lazy Loading**: Content is loaded only when tabs are active
- **Memory Management**: Closed tabs are properly cleaned up
- **State Persistence**: Efficient state storage with minimal memory footprint
- **Smooth Animations**: Hardware-accelerated CSS transitions
- **Responsive Images**: Optimized for different screen sizes
