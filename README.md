# When Dear? - Tag Cloud Plugin for Obsidian

A time-filtered tag cloud plugin for Obsidian that helps you visualize and navigate your most relevant tags based on recent activity.

## Features

- **Time-filtered Tag Cloud**: View tags from files modified in the last N days
- **Frequency Filtering**: Hide infrequent tags by setting a minimum occurrence threshold
- **Visual Word Cloud**: Tag size reflects frequency - more common tags appear larger
- **Interactive Navigation**: Click any tag to search for it in your vault
- **Live Controls**: Adjust the time filter directly in the panel with a slider
- **Compact Interface**: Minimal design that fits perfectly in your sidebar

## How It Works

When Dear? collects tags from your vault and displays them as a word cloud, with powerful filtering options to help you focus on what matters:

- **Recent work**: See what you've been tagging lately by filtering by modification date
- **Significant tags**: Hide infrequent tags to focus on your most-used ones
- **Active projects**: Identify tags from files you're currently working on
- **Trending topics**: Discover patterns in your recent note-taking

## Installation

1. Copy the built files to your vault:
   ```
   VaultFolder/.obsidian/plugins/when-dear/
   ├── main.js
   ├── manifest.json
   └── styles.css
   ```

2. Enable the plugin in Settings → Community Plugins

3. Open the panel using:
   - The tag icon in the ribbon
   - Command Palette: "Open When Dear?"

## Usage

### Opening the Panel
- **Ribbon Icon**: Click the tag icon in the left toolbar
- **Command**: Use "Open When Dear?" from the Command Palette
- **View Menu**: Select "When Dear?" from the View menu

### Time Filter
- Use the slider at the top of the panel to adjust the time range
- Set to "All" for all-time tags, or select 1-365 days
- The tag cloud updates immediately when you change the filter

### Navigation
- Click any tag to search for it in your vault
- Hover over tags to see their occurrence count
- Larger tags indicate more frequent usage

## Settings

Access settings via Settings → Plugin Options → When Dear?

- **Days back**: Default time filter (0-365 days, 0 = all time)
- **Minimum occurrences**: Hide tags that appear fewer than N times (1-20, default: 5)
- **Font size range**: Customize minimum and maximum tag sizes
- **Color scheme**: Choose your preferred color theme (future feature)

## Development

Built with TypeScript for Obsidian. Key files:

- `main.ts`: Core plugin logic and tag cloud view
- `styles.css`: Visual styling and layout
- `manifest.json`: Plugin metadata

### Building

```bash
npm install
npm run build
```

### Development Mode

```bash
npm run dev
```

## Why "When Dear?"

The name reflects the plugin's core purpose - answering "when" you were working on topics by showing tags filtered by time. It helps you understand the temporal context of your knowledge work.

## License

MIT License - see the repository for details.