# Magic Color Harmonizer

Magic Color Harmonizer is a Figma plugin that helps designers generate accessible, harmonious color systems from a single brand color or a full palette.

## Features

- **Core Inputs**: Support for Hex, RGB, and HSL.
- **Automatic Generation**: Generates full semantic token sets (Primary, Secondary, Neutral, Success, Warning, Error, Info).
- **Shades & Tints**: Creates a complete 50–950 scale for each color.
- **Accessibility First**:
  - Real-time WCAG contrast checking.
  - "AA" badges for accessible combinations.
  - Tooltips showing exact contrast ratios.
- **Export Options**:
  - JSON (Design Tokens)
  - CSS Variables
  - Tailwind CSS Config
  - **Figma Styles**: One-click generation of local paint styles.

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd magic-color
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the plugin**:
   ```bash
   npm run build
   ```
   This generates a `dist/` folder containing `index.html` and `code.js`.

## Usage in Figma

1. Open **Figma**.
2. Go to **Plugins** > **Development** > **Import plugin from manifest...**
3. Select the `manifest.json` file located in the root of this project.
4. Run the plugin **Magic Color Harmonizer**.

## Development

- **Run in Watch Mode**:
  ```bash
  npm run dev
  ```
  This will watch for changes in `src/ui` and `src/code` and rebuild automatically.

## Project Structure

- `src/ui`: React application for the plugin interface.
- `src/code`: Main thread logic that interacts with the Figma API.
- `src/utils`: Helper functions for color generation (`chroma-js`) and export formatting.
- `dist`: Compiled output files.

## Tech Stack

- **React**: UI Framework
- **TypeScript**: Type safety
- **Vite**: Build tool for UI
- **esbuild**: Bundler for plugin code
- **chroma-js**: Color manipulation and accessibility calculations

## Documentation

Comprehensive documentation is available for developers:

- **[DOCUMENTATION.md](./DOCUMENTATION.md)** - Complete documentation covering:
  - Architecture and project structure
  - Communication flow between UI and plugin code
  - UI components guide
  - Features overview
  - How to update UI and add new features
  - Figma API integration
  - Development workflow

- **[COMPONENT_TREE.md](./COMPONENT_TREE.md)** - Visual component hierarchy and data flow diagrams

- **[QUICK_START.md](./QUICK_START.md)** - Quick reference guide for common tasks:
  - Adding navigation items
  - Changing colors and styles
  - Adding export formats
  - Creating new features
  - Debugging tips

## License

MIT

# zd.procolors
