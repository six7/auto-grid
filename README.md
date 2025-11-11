# AutoGrid for Figma

A powerful Figma plugin that automatically creates and manages responsive grid layouts from your selected elements. Perfect for creating repeated UI patterns, galleries, and organized content structures.

## Features

- **Smart Grid Creation** - Convert any selected elements into organized grid layouts with a single click
- **Flexible Configuration** - Customize rows (1-50), columns (1-50), and cell padding (0-5000px)
- **Auto-Update Mode** - Automatically reflows your grid as you make changes to the layout
- **Grid Detection** - Intelligently detects and manages existing AutoGrids in your design
- **Quick Navigation** - Jump to parent grids from any child element
- **Relaunch Support** - Quick access to grid controls via Figma's relaunch menu
- **Responsive Layout** - Uses Figma's auto-layout for flexible, responsive grid structures

## Installation

### From Figma Community
1. Search for "AutoGrid" in the Figma Community plugins
2. Click "Install" to add it to your Figma account

### Development Installation
1. Clone this repository
```bash
git clone https://github.com/yourusername/auto-grid.git
cd auto-grid
```

2. Install dependencies
```bash
npm install
```

3. Build the plugin
```bash
npm run build
```

4. In Figma:
   - Go to **Plugins** → **Development** → **Import plugin from manifest**
   - Select `public/manifest.json` from the project directory

_Note: You'll need [Node.js](https://nodejs.org/) installed to build the plugin._

## Usage

### Creating a New Grid

1. **Select Elements** - Select one or more elements in your Figma file that you want to arrange in a grid
2. **Open AutoGrid** - Run the AutoGrid plugin from the Plugins menu
3. **Configure Grid**:
   - Set the number of **Rows** (1-50)
   - Set the number of **Columns** (1-50)
   - Adjust **Cell Padding** for spacing between elements (0-5000px)
4. **Create** - Click "Create new Grid"

The plugin will create a hierarchical structure:
- **Grid Container** (vertical auto-layout frame)
  - **Row 1** (horizontal auto-layout frame)
    - Cell elements...
  - **Row 2** (horizontal auto-layout frame)
    - Cell elements...
  - And so on...

### Editing an Existing Grid

1. **Select any child element** within an existing AutoGrid
2. The plugin will detect the parent grid and show "Found existing AutoGrid"
3. Use the **"Go to"** button to navigate to the parent grid if needed
4. Modify the grid parameters
5. **With Auto-Update enabled**: Changes apply automatically
6. **With Auto-Update disabled**: Click "Update" to apply changes

### Auto-Update Mode

- **Enabled (default)**: The grid automatically reflows when you change parameters or modify child elements
- **Disabled**: You have manual control; click "Update" to apply changes

Toggle this option based on your workflow preference.

## Configuration Options

| Option | Range | Description |
|--------|-------|-------------|
| **Rows** | 1-50 | Number of horizontal rows in the grid |
| **Columns** | 1-50 | Number of vertical columns in the grid |
| **Cell Padding** | 0-5000px | Space between grid elements |
| **Auto-Update** | On/Off | Toggle automatic grid reflow on changes |

## How It Works

AutoGrid creates a two-level hierarchical structure using Figma's auto-layout:

1. **Grid Container** - A vertical auto-layout frame that holds all rows
2. **Row Frames** - Horizontal auto-layout frames, one per row
3. **Cell Elements** - Your actual content, distributed across rows and columns

When you create or update a grid, AutoGrid:
- Clones selected elements to fill the grid dimensions
- Distributes elements evenly across rows and columns
- Applies consistent padding between cells and rows
- Stores grid settings as plugin data for future edits
- Adds relaunch buttons for quick access

## Development

### Commands

```bash
# Install dependencies
npm install

# Build plugin (production)
npm run build

# Watch mode for development
npm run dev

# Start local server (for testing)
npm start
```

### Project Structure

```
auto-grid/
├── src/
│   ├── code.ts           # Main plugin logic
│   ├── PluginUI.svelte   # User interface
│   └── Input.svelte      # Custom input component
├── public/
│   └── manifest.json     # Plugin configuration
├── rollup.config.js      # Build configuration
└── package.json          # Dependencies
```

### Technology Stack

- **Frontend**: Svelte with [figma-plugin-ds-svelte](https://github.com/thomas-lowry/figma-plugin-ds-svelte)
- **Build Tool**: Rollup
- **Language**: TypeScript
- **API**: Figma Plugin API

## Credits

This plugin is built on [Figsvelte](https://github.com/thomas-lowry/figsvelte), a Svelte boilerplate for creating Figma plugins by [Thomas Lowry](https://github.com/thomas-lowry).

## License

See [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have feature requests, please open an issue on the [GitHub repository](https://github.com/yourusername/auto-grid/issues).

---

Made with ❤️ for the Figma community
