# ProColors Figma Plugin - Complete Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Project Structure](#project-structure)
4. [Build System](#build-system)
5. [Communication Flow](#communication-flow)
6. [Core Concepts](#core-concepts)
7. [UI Components Guide](#ui-components-guide)
8. [Features Overview](#features-overview)
9. [Styling System](#styling-system)
10. [State Management](#state-management)
11. [Figma API Integration](#figma-api-integration)
12. [How to Update UI](#how-to-update-ui)
13. [Adding New Features](#adding-new-features)
14. [Development Workflow](#development-workflow)

---

## Overview

**ProColors** (formerly Magic Color Harmonizer) is a Figma plugin that helps designers generate accessible, harmonious color systems from a single brand color or a full palette. It creates comprehensive design token systems with full shade scales, semantic color palettes, and accessibility checking.

### Key Features
- Color palette generation from a single brand color
- Full shade/tint scale generation (50-950)
- Semantic color token generation (Primary, Secondary, Neutral, Success, Warning, Error, Info)
- **Unified Variable Collection System** with Base Tokens, Alias, and Component groups
- **Material Design 3 semantic naming** for component tokens
- **Customizable naming conventions** (Kebab Case, Dot Notation, Abbreviated, Custom)
- **Brand-based collection naming** for multi-brand workflows
- Real-time WCAG contrast checking
- Multiple export formats (JSON, CSS, Tailwind, Figma Styles, Figma Variables)
- Color harmony generator with color wheel
- Gradient generator
- Color blindness simulator
- Contrast heatmap visualization
- Multi-brand support
- Design token transfer between files
- Image color extraction (integrated into Shades page)

---

## Architecture

ProColors is built as a **Figma plugin** with a clear separation between UI and plugin code:

### Two-Thread Architecture

```
┌─────────────────────────────────────────────┐
│          Figma Plugin Window                │
│  ┌───────────────────────────────────────┐  │
│  │  UI Thread (React + Vite)            │  │
│  │  - React components                   │  │
│  │  - User interactions                  │  │
│  │  - State management                   │  │
│  │  - Sends messages via postMessage     │  │
│  └───────────────────────────────────────┘  │
│              ↕ postMessage API              │
│  ┌───────────────────────────────────────┐  │
│  │  Plugin Code Thread (TypeScript)      │  │
│  │  - Figma API access                   │  │
│  │  - Creates styles/variables           │  │
│  │  - Canvas manipulation                │  │
│  │  - Receives messages from UI          │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### Technology Stack

- **UI Framework**: React 18.2.0
- **Language**: TypeScript
- **Build Tools**: 
  - Vite (for UI bundle)
  - esbuild (for plugin code)
- **Styling**: CSS with CSS Variables
- **Color Library**: chroma-js
- **Icons**: lucide-react
- **Color Picker**: react-colorful

---

## Project Structure

```
magic-color/
├── dist/                          # Compiled output (auto-generated)
│   ├── index.html                # UI bundle
│   └── code.js                   # Plugin code bundle
│
├── src/
│   ├── code/                     # Plugin code (runs in Figma)
│   │   └── main.ts              # Main plugin entry point, handles all Figma API calls
│   │
│   ├── ui/                       # React UI application
│   │   ├── App.tsx              # Main React component, router for modules
│   │   ├── main.tsx             # React entry point
│   │   ├── index.html           # HTML template
│   │   ├── styles.css           # Global styles and CSS variables
│   │   ├── logo.png / logo.svg  # Plugin logo
│   │   │
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Sidebar.tsx              # Navigation sidebar
│   │   │   ├── ColorInput.tsx           # Color input component
│   │   │   ├── DropdownButton.tsx       # Dropdown menu component
│   │   │   ├── ExportSection.tsx        # Export UI component
│   │   │   ├── LivePreview.tsx          # Live preview component
│   │   │   ├── PaletteDisplay.tsx       # Color palette display
│   │   │   └── preview/                 # Preview components
│   │   │       ├── Alerts.tsx
│   │   │       ├── Buttons.tsx
│   │   │       ├── Cards.tsx
│   │   │       ├── DataDisplay.tsx
│   │   │       ├── Inputs.tsx
│   │   │       ├── Misc.tsx
│   │   │       └── Navigation.tsx
│   │   │
│   │   └── features/            # Feature modules
│   │       ├── GeneratorPage.tsx         # Main generator page
│   │       ├── ManualGenerator.tsx       # Manual color input
│   │       ├── ThemeGenerator.tsx        # Theme generator
│   │       ├── ImageExtractor.tsx        # Extract colors from images
│   │       ├── ColorBlindness.tsx        # Color blindness simulator
│   │       ├── Replacer.tsx              # Color replacer tool
│   │       ├── MultiBrand.tsx            # Multi-brand management
│   │       ├── AdvancedExport.tsx        # Advanced export options
│   │       ├── generator/
│   │       │   └── harmony/              # Color harmony generator
│   │       ├── gradients/                # Gradient generator
│   │       ├── contrast/                 # Contrast checker
│   │       ├── heatmap/                  # Contrast heatmap
│   │       └── transfer/                 # Token transfer tool
│   │
│   ├── utils/                    # Utility functions
│   │   ├── color.ts             # Color utilities (exports from others)
│   │   ├── tokens.ts            # Token generation logic
│   │   ├── contrast.ts          # Contrast checking
│   │   ├── export.ts            # Export formatting
│   │   ├── harmony.ts           # Color harmony algorithms
│   │   ├── gradients.ts         # Gradient utilities
│   │   ├── color-blindness.ts   # Color blindness simulation
│   │   └── scoring.ts           # Scoring utilities
│   │
│   └── accessibility/            # Accessibility utilities (if any)
│
├── scripts/
│   └── build-code.ts            # Build script for plugin code
│
├── manifest.json                 # Figma plugin manifest
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── vite.config.ts               # Vite configuration
└── README.md                     # Basic readme
```

---

## Build System

### Build Process

The plugin uses **two separate build processes**:

1. **UI Build** (Vite):
   - Entry: `src/ui/main.tsx`
   - Output: `dist/index.html` (single-file bundle)
   - Builds React app into a single HTML file

2. **Plugin Code Build** (esbuild):
   - Entry: `src/code/main.ts`
   - Output: `dist/code.js`
   - Bundles plugin code that runs in Figma context

### Build Scripts

```json
{
  "build-ui": "vite build",                    // Build UI only
  "build-code": "esbuild src/code/main.ts...", // Build plugin code only
  "build": "npm run build-ui && npm run build-code", // Build both
  "dev": "npm run build -- --watch"           // Watch mode for development
}
```

### Build Configuration

**vite.config.ts**:
- Uses React plugin
- Uses `vite-plugin-singlefile` to bundle everything into one HTML file
- Outputs to `dist/` directory
- Root is `src/ui`

**esbuild** (via scripts/build-code.ts):
- Bundles `src/code/main.ts`
- Targets ES6
- Minifies output
- Outputs to `dist/code.js`

---

## Communication Flow

The UI and plugin code communicate via the **postMessage API**.

### Message Flow Pattern

```
UI Component (React)
    ↓
parent.postMessage({ pluginMessage: { type: 'action-type', ...data } })
    ↓
Plugin Code (src/code/main.ts)
    ↓
figma.ui.onmessage = async (msg) => { ... }
    ↓
Process action using Figma API
    ↓
figma.ui.postMessage({ type: 'response-type', ...data })
    ↓
UI listens via window.addEventListener('message', ...)
```

### Message Types

#### UI → Plugin Code

| Message Type | Purpose | Data Structure |
|-------------|---------|---------------|
| `create-color-styles` | Create/update Figma paint styles | `{ palettes, action, targetId }` |
| `create-color-variables` | Create/update Figma variables | `{ palettes, action, targetId, variableType?, collectionId?, brandName?, namingConvention?, customNamingPattern? }` |
| `create-theme-variable` | Add theme as mode to existing collection | `{ collectionId, theme, palettes }` |
| `get-collections-for-theme` | Fetch collections for theme selection | `{}` |
| `create-gradient-style` | Create gradient paint style | `{ gradient }` |
| `create-gradient-variables` | Create gradient variables | `{ gradient }` |
| `get-target-options` | Fetch available collections/styles | `{ targetType }` |
| `get-export-options` | Fetch export options | `{}` |
| `export-all-data` | Export design tokens | `{ selectedCollectionIds, selectedStyleGroups }` |
| `import-data` | Import design tokens | `{ data }` |
| `add-palette-to-canvas` | Create palette on canvas | `{ palettes }` |
| `replace-colors` | Replace colors in selection | `{ scope, target }` |
| `notify` | Show notification | `{ message }` |
| `close` | Close plugin | `{}` |

#### Plugin Code → UI

| Message Type | Purpose | Data Structure |
|-------------|---------|---------------|
| `target-options-response` | Return available targets | `{ targetType, options }` |
| `collections-response` | Return available collections | `{ collections: [{ id, name }] }` |
| `export-options-response` | Return export options | `{ collections, styleGroups }` |
| `export-data-success` | Export completed | `{ data, fileName }` |
| `import-data-finished` | Import completed | `{}` |

### Example: Creating Styles

**UI Side** (`App.tsx`):
```typescript
const handleExport = (format, action, targetId) => {
  if (format === 'figma') {
    parent.postMessage({ 
      pluginMessage: { 
        type: 'create-color-styles', 
        palettes: allPalettes, 
        action: action || 'create', 
        targetId 
      } 
    }, '*');
  }
};
```

**Plugin Code Side** (`src/code/main.ts`):
```typescript
if (msg.type === 'create-color-styles') {
  const { palettes, action, targetId } = msg;
  // ... create styles using Figma API
  figma.notify(`Success! Created ${count} color styles.`);
}
```

---

## Core Concepts

### Color Tokens

A **ColorToken** is the basic unit representing a color:

```typescript
interface ColorToken {
  name: string;      // e.g., "primary-500"
  value: string;     // Hex color, e.g., "#3b82f6"
  shade: number;     // Shade value, e.g., 500
}
```

### Palettes Structure

Palettes are organized as:

```typescript
Record<string, ColorToken[]>
// Example:
{
  primary: [
    { name: "primary-50", value: "#eff6ff", shade: 50 },
    { name: "primary-100", value: "#dbeafe", shade: 100 },
    // ... more shades
  ],
  secondary: [...],
  neutral: [...]
}
```

### Shade Scale

Default shade scale: `[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]`

- **500** = base color
- **< 500** = lighter tints (mixed with white)
- **> 500** = darker shades (mixed with black)

### Semantic Colors

The plugin generates these semantic color groups:
- `primary` - Main brand color
- `secondary` - Secondary brand color (hue-shifted from primary)
- `neutral` - Grays (mixed with primary)
- `success` - Green (#22c55e)
- `warning` - Yellow (#eab308)
- `error` - Red (#ef4444)
- `info` - Blue (#3b82f6)

### Variable Collection Structure

Variables are organized in a **single collection** with three distinct groups:

1. **Base Tokens** (`Base Tokens/{groupName}/{shade}`)
   - Core color variables with numeric shades
   - Example: `Base Tokens/primary/100`, `Base Tokens/primary/500`

2. **Alias** (`Alias/{groupName}/{formattedShade}`)
   - Alias variables that reference Base Tokens
   - Use naming convention from settings (e.g., `Primary-100`, `primary.lightest`)
   - Example: `Alias/primary/Primary-100` → references `Base Tokens/primary/100`

3. **Component** (`Component/{groupName}/{semanticName}`)
   - Component tokens with Material Design 3-style semantic names
   - Also alias to Base Tokens
   - Examples:
     - `Component/primary/Primary` → references `Base Tokens/primary/500`
     - `Component/primary/On Primary` → references `Base Tokens/primary/700`
     - `Component/neutral/Surface` → references `Base Tokens/neutral/50`

### Naming Conventions

The plugin supports multiple naming conventions for alias variables:

- **Kebab Case (Capital)**: `Primary-100`, `Secondary-500`
- **Dot Notation (Lowercase)**: `primary.lightest`, `secondary.base`
- **Abbreviated**: `p1 / 100`, `s5 / 500`
- **Custom**: User-defined pattern with `{group}` and `{shade}` placeholders

Naming conventions are configured in Settings and applied to:
- Alias variable names
- Shade labels in the UI (via `formatShadeName` utility)

### Material Design 3 Semantic Naming

Component tokens use Material Design 3-style semantic names based on shade and color group:

**Primary/Secondary Colors:**
- `Primary`, `On Primary`
- `Primary Container`, `On Primary Container`
- `Primary Fixed`, `On Primary Fixed`
- `Inverse Primary`

**Neutral Colors:**
- `Surface`, `On Surface`
- `Surface Container`, `On Surface Container`
- `Surface Variant`, `On Surface Variant`
- `Inverse Surface`, `Inverse On Surface`

**Semantic Colors (Error, Success, etc.):**
- `Error`, `On Error`
- `Error Container`, `On Error Container`
- Similar patterns for Success, Warning, Info

---

## UI Components Guide

### Main App Component (`App.tsx`)

**Purpose**: Root component that manages routing between different feature modules.

**Key Responsibilities**:
- Module routing (switches between features)
- Brand management (multi-brand support)
- Palette generation state
- Export handlers
- Color change handlers

**State**:
```typescript
- activeModule: string              // Current feature module
- brands: Brand[]                   // Multiple brand configurations
- activeBrandId: string             // Currently active brand
- shadeScale: number[]              // Custom shade scale
- overrides: Record<string, string> // Manual color overrides
```

**Computed Values**:
```typescript
- semanticColors: Record<string, string>      // Base semantic colors
- allPalettes: Record<string, ColorToken[]>   // Generated palettes with shades
```

### Sidebar Component (`components/Sidebar.tsx`)

**Purpose**: Navigation sidebar with feature modules.

**Structure**:
- Logo at top
- Navigation groups:
  - **Core**: Generator, Transfer, Multi Brand, Extract
  - **Design System**: Themes, Gradients, Preview
  - **Accessibility**: Checker, Simulator, Heatmap
  - **Tools**: Color Replacer, Export

**How to Update Navigation**:
Edit the `NAV_GROUPS` array in `Sidebar.tsx`:

```typescript
const NAV_GROUPS = [
  {
    title: "Core",
    items: [
      { id: 'generator', label: 'Generator', icon: LayoutGrid },
      // Add new items here
    ]
  },
  // Add new groups
];
```

### PaletteDisplay Component (`components/PaletteDisplay.tsx`)

**Purpose**: Displays a single color palette with all shades.

**Features**:
- Visual color swatches
- Copy color value on click
- Add/remove shades
- Contrast indicators
- Shade labels

**Props**:
```typescript
interface PaletteDisplayProps {
  paletteName: string;
  tokens: ColorToken[];
  onAddShade?: (position: 'start' | 'end') => void;
  onRemoveShade?: (position: 'start' | 'end') => void;
}
```

### ColorInput Component (`components/ColorInput.tsx`)

**Purpose**: Color input with picker support.

**Features**:
- Hex input
- RGB/HSL support
- Color picker integration
- Validation

### DropdownButton Component (`components/DropdownButton.tsx`)

**Purpose**: Dropdown menu with submenu support (used for export options).

**Features**:
- Primary/secondary variants
- Dynamic submenu loading
- Async data fetching from plugin code

**Usage**:
```typescript
<DropdownButton 
  label="Variable" 
  variant="primary"
  targetType="variables"
  options={[
    { label: 'Create New Variables', action: 'create' },
    { label: 'Update Existing Variables', action: 'update' }
  ]}
  onSelect={(action, targetId) => handleExport('figma-variables', action, targetId)}
/>
```

### Preview Components (`components/preview/`)

Preview components show how colors look in real UI contexts:
- `Buttons.tsx` - Button previews
- `Alerts.tsx` - Alert/notification previews
- `Cards.tsx` - Card components
- `Inputs.tsx` - Form inputs
- `Navigation.tsx` - Navigation bars
- `DataDisplay.tsx` - Tables, lists
- `Misc.tsx` - Other components

---

## Features Overview

### 1. Generator Module (Generate Shades)

**Location**: `src/ui/features/create/shades/GeneratorPage.tsx`

**Features**:
- Manual color input
- Color harmony generator (color wheel)
- **Image color extraction** (moved from Flow section)
- Real-time palette preview
- Shade scale customization
- Export options

**Tabs**:
- **Manual Input**: Direct color entry for each semantic color
- **Color Harmony**: Visual harmony generation with color wheel
- **Extract from Image**: Upload image and extract dominant colors

### 2. Transfer Module

**Location**: `src/ui/features/transfer/TransferPage.tsx`

**Purpose**: Migrate design tokens between Figma files.

**Features**:
- Export tokens from current file
- Import tokens to current file
- Preview before import
- Save transfer configurations

### 3. Multi-Brand Module

**Location**: `src/ui/features/MultiBrand.tsx`

**Purpose**: Manage multiple brand configurations.

**Features**:
- Add/remove brands
- Switch between brands
- Each brand has its own primary color

### 4. Image Extractor (Integrated into Shades Page)

**Location**: `src/ui/features/flow/extractor/ImageExtractor.tsx`

**Purpose**: Extract dominant colors from images.

**Features**:
- Upload image
- Extract color palette
- **Apply to Manual Input** button to apply extracted colors to semantic color slots
- Integrated as a tab in the Generate Shades page

### 5. Theme Generator

**Location**: `src/ui/features/create/themes/ThemeGenerator.tsx`

**Purpose**: Preview and export color palettes in different themes.

**Features**:
- Preview palettes in Light, Dark, Dim, and AMOLED themes
- **Add Theme to Variable** button to add theme as mode to existing collection
- Theme-specific color adjustments (inverted shades for dark themes)
- Real-time theme preview

**Theme Color Logic**:
- **Light theme**: Uses lighter shades or base color
- **Dark/Dim/AMOLED themes**: Uses inverted shades (e.g., base 50 → theme 950) with additional saturation/brightness adjustments

### 6. Gradients Module

**Location**: `src/ui/features/gradients/index.tsx`

**Purpose**: Generate gradient palettes.

**Features**:
- Generate gradients from color palettes
- Custom gradient creation
- Export as styles/variables

### 7. Contrast Checker

**Location**: `src/ui/features/contrast/ContrastPage.tsx`

**Purpose**: Check WCAG contrast compliance.

**Features**:
- Real-time contrast checking
- WCAG AA/AAA indicators
- Suggested fixes
- History of checked combinations

### 8. Color Blindness Simulator

**Location**: `src/ui/features/ColorBlindness.tsx`

**Purpose**: Simulate color vision deficiencies.

**Features**:
- Multiple color blindness types
- Side-by-side comparison
- Accessibility insights

### 9. Heatmap Module

**Location**: `src/ui/features/heatmap/index.tsx`

**Purpose**: Visualize contrast ratios across all color combinations.

**Features**:
- Grid visualization
- Color-coded contrast scores
- Detailed popover information

### 10. Color Replacer

**Location**: `src/ui/features/Replacer.tsx`

**Purpose**: Replace colors in selected Figma elements.

**Features**:
- Select scope (selection/page)
- Color mapping
- Batch replacement

### 11. Advanced Export

**Location**: `src/ui/features/AdvancedExport.tsx`

**Purpose**: Advanced export options with filtering.

**Features**:
- Filter by collections/groups
- Multiple format options
- Bulk export

---

## Styling System

### CSS Variables

All styling uses CSS variables defined in `src/ui/styles.css`:

```css
:root {
  /* Colors */
  --color-bg-app: #f7f9fc;
  --color-bg-sidebar: #ffffff;
  --color-bg-card: #ffffff;
  --color-bg-hover: #f3f4f6;
  
  --color-text-primary: #1e1e1e;
  --color-text-secondary: #64748b;
  --color-text-tertiary: #94a3b8;
  
  --color-border: #e2e8f0;
  --color-border-light: #f1f5f9;
  
  --color-primary: #3b82f6;
  --color-primary-light: #eff6ff;
  --color-primary-hover: #2563eb;
  
  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.06), 0 2px 4px -1px rgba(0,0,0,0.03);
  
  /* Radii */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  
  /* Spacing */
  --spacing-xs: 8px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
}
```

### Figma Theme Colors

The plugin also uses Figma's built-in theme colors:

```css
background-color: var(--figma-color-bg);
color: var(--figma-color-text);
```

These automatically adapt to Figma's light/dark theme.

### Utility Classes

Common utility classes available:

- `.app-container` - Main app wrapper
- `.sidebar` - Sidebar container
- `.main-content` - Main content area
- `.content-scroll-area` - Scrollable content
- `.section-card` - Card component
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-icon` - Buttons
- `.animate-fade-in` - Fade-in animation

### How to Update Styles

1. **Change Colors**: Edit CSS variables in `src/ui/styles.css`
2. **Add New Utility Classes**: Add to `styles.css`
3. **Component-Specific Styles**: Use inline styles in components (common pattern)
4. **Theme Support**: Modify CSS variables or add theme switching logic

---

## State Management

The plugin uses **React's built-in state management** (useState, useMemo, useEffect).

### Global State (App.tsx)

```typescript
// Module routing
const [activeModule, setActiveModule] = useState('generator');

// Brand management
const [brands, setBrands] = useState<Brand[]>([...]);
const [activeBrandId, setActiveBrandId] = useState('default');

// Shade scale
const [shadeScale, setShadeScale] = useState<number[]>(SHADE_Scale);

// Color overrides
const [overrides, setOverrides] = useState<Record<string, string>>({});
```

### Computed State (useMemo)

```typescript
// Semantic colors (base colors)
const semanticColors = useMemo(() => {
  const generated = generateSemanticPalette(activeBrand.primaryColor);
  return { ...generated, ...overrides };
}, [activeBrand.primaryColor, overrides]);

// All palettes (with shades)
const allPalettes = useMemo(() => {
  const palettes: Record<string, ColorToken[]> = {};
  Object.entries(semanticColors).forEach(([name, baseValue]) => {
    if (isValidColor(baseValue)) {
      palettes[name] = generateShades(baseValue, name, shadeScale);
    }
  });
  return palettes;
}, [semanticColors, shadeScale]);
```

### Local State

Each feature module manages its own local state for UI interactions.

---

## Figma API Integration

### Plugin Code Entry Point

`src/code/main.ts` is the plugin code entry point that runs in the Figma context.

### Key Figma API Functions Used

#### 1. Creating Paint Styles

```typescript
const style = figma.createPaintStyle();
style.name = "primary/500";
style.paints = [{
  type: 'SOLID',
  color: { r: 0.231, g: 0.51, b: 0.965 } // RGB values 0-1
}];
style.description = "Generated by ProColors";
```

#### 2. Creating Variables

**Basic Variable Creation:**
```typescript
if (figma.variables) {
  const collection = figma.variables.createVariableCollection("MyCollection");
  const variable = figma.variables.createVariable("primary/500", collection, "COLOR");
  variable.setValueForMode(collection.modes[0].modeId, { r, g, b, a: 1 });
}
```

**Creating Alias Variables:**
```typescript
// Create alias that references another variable
const sourceVariable = // ... get source variable
const aliasVariable = figma.variables.createVariable("Alias/primary/Primary-100", collection, "COLOR");
aliasVariable.setValueForMode(modeId, { 
  type: "VARIABLE_ALIAS", 
  id: sourceVariable.id 
});
```

**Adding Modes (Themes) to Collections:**
```typescript
// Add a new mode (theme) to an existing collection
const newMode = collection.addMode("dark");
const darkModeId = newMode.modeId;

// Set variable value for specific mode
variable.setValueForMode(darkModeId, { r, g, b, a: 1 });
```

#### 3. Creating Canvas Elements

```typescript
const frame = figma.createFrame();
frame.name = "Color Palette";
frame.layoutMode = "VERTICAL";
frame.fills = [];

// Add color rectangles
const rect = figma.createRectangle();
rect.fills = [{ type: 'SOLID', color: { r, g, b } }];
frame.appendChild(rect);
```

#### 4. Font Loading

```typescript
await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
```

#### 5. Notifications

```typescript
figma.notify("Success! Created 50 color styles.");
```

#### 6. Getting Existing Styles/Variables

```typescript
const styles = await figma.getLocalPaintStylesAsync();
const collections = await figma.variables.getLocalVariableCollectionsAsync();
const variables = await figma.variables.getLocalVariablesAsync();
```

### Message Handlers

All message handlers are in `src/code/main.ts` under `figma.ui.onmessage`:

- `create-color-styles` - Creates/updates paint styles
- `create-color-variables` - Creates/updates variables with support for:
  - `variableType`: `'collection'` | `'alias'` | `'component'`
  - `collectionId`: For alias/component types, the source collection ID
  - `brandName`: Brand name for collection naming
  - `namingConvention`: Naming convention for alias variables
  - `customNamingPattern`: Custom pattern if convention is 'custom'
- `create-theme-variable` - Adds theme as mode to existing collection
- `get-collections-for-theme` - Fetches collections for theme selection
- `add-palette-to-canvas` - Creates visual palette on canvas
- `get-target-options` - Fetches existing collections/styles
- `export-all-data` - Exports tokens from file
- `import-data` - Imports tokens to file
- And more...

---

## How to Update UI

### Adding a New Navigation Item

1. **Edit Sidebar.tsx**:
   ```typescript
   // In NAV_GROUPS array
   {
     id: 'my-feature',
     label: 'My Feature',
     icon: MyIcon // Import from lucide-react
   }
   ```

2. **Add Route in App.tsx**:
   ```typescript
   case 'my-feature':
     return <MyFeatureComponent palettes={allPalettes} />;
   ```

3. **Create Feature Component** (if needed):
   ```
   src/ui/features/MyFeature.tsx
   ```

### Updating Component Styles

**Option 1: Inline Styles** (most common):
```typescript
<div style={{
  padding: '16px',
  backgroundColor: 'var(--color-bg-card)',
  borderRadius: 'var(--radius-md)'
}}>
```

**Option 2: CSS Classes**:
```typescript
// In styles.css
.my-component {
  padding: var(--spacing-md);
  background: var(--color-bg-card);
}

// In component
<div className="my-component">
```

**Option 3: Update CSS Variables**:
```css
/* In styles.css */
:root {
  --color-primary: #your-color;
}
```

### Changing Layout

**Main Layout Structure**:
```
App.tsx
├── Sidebar (fixed width: 180px)
└── main-content
    ├── Header (with export buttons)
    └── content-scroll-area
        └── Feature Module Content
```

**To Modify Layout**:
1. Edit `App.tsx` for main structure
2. Edit `styles.css` for spacing/sizing
3. Edit individual feature components for their layouts

### Updating Colors

1. **Change Primary Color**:
   Edit `--color-primary` in `styles.css`

2. **Change Background Colors**:
   Edit `--color-bg-*` variables

3. **Change Text Colors**:
   Edit `--color-text-*` variables

### Adding New Export Format

1. **Create Formatter Function** (`src/utils/export.ts`):
   ```typescript
   export const formatMyFormat = (palettes: Record<string, ColorToken[]>): string => {
     // Format logic
     return formattedString;
   };
   ```

2. **Add to Export Handler** (`App.tsx`):
   ```typescript
   if (format === 'my-format') {
     content = formatMyFormat(allPalettes);
   }
   ```

3. **Add UI Option** (in ExportSection or similar):
   ```typescript
   <button onClick={() => handleExport('my-format')}>
     Export as My Format
   </button>
   ```

### Modifying Palette Display

Edit `components/PaletteDisplay.tsx`:

- **Change Swatch Size**: Modify swatch dimensions
- **Change Layout**: Modify flex/grid layout
- **Add Features**: Add new buttons/actions
- **Change Colors**: Update color values

---

## Variable Creation System

### Variable Types

The plugin supports three types of variable creation:

#### 1. New Variable Collection (Base Tokens)
Creates a new collection with base color variables:
- **Name Pattern**: `Base Tokens/{groupName}/{shade}`
- **Example**: `Base Tokens/primary/100`
- **Value**: Direct color value (RGB)

#### 2. New Alias Collection
Creates alias variables that reference Base Tokens:
- **Name Pattern**: `Alias/{groupName}/{formattedShade}`
- **Example**: `Alias/primary/Primary-100` (using kebab-capital convention)
- **Value**: Variable alias to `Base Tokens/primary/100`
- **Requires**: Selection of source collection containing Base Tokens

#### 3. New Component Token
Creates component tokens with semantic Material Design 3 names:
- **Name Pattern**: `Component/{groupName}/{semanticName}`
- **Example**: `Component/primary/Primary`, `Component/neutral/Surface`
- **Value**: Variable alias to appropriate Base Token
- **Requires**: Selection of source collection containing Base Tokens

### Variable Creation Flow

**UI Side** (`App.tsx`):
```typescript
// User selects variable type
const handleVariableTypeSelect = (type: 'collection' | 'alias' | 'component') => {
  if (type === 'collection') {
    // Direct creation
    parent.postMessage({
      pluginMessage: {
        type: 'create-color-variables',
        palettes: allPalettes,
        action: 'create',
        variableType: 'collection',
        brandName: activeBrand?.name,
        namingConvention: settings.namingConvention,
        customNamingPattern: settings.customNamingPattern
      }
    }, '*');
  } else {
    // Show collection selection modal
    setSelectedVariableType(type);
    setShowCollectionSelectModal(true);
  }
};

// After collection selection
const handleCollectionSelect = (collectionId: string) => {
  parent.postMessage({
    pluginMessage: {
      type: 'create-color-variables',
      palettes: allPalettes,
      action: 'create',
      variableType: selectedVariableType,
      collectionId: collectionId,
      brandName: activeBrand?.name,
      namingConvention: settings.namingConvention,
      customNamingPattern: settings.customNamingPattern
    }
  }, '*');
};
```

**Plugin Code Side** (`src/code/main.ts`):
```typescript
if (msg.type === 'create-color-variables') {
  const { 
    palettes, 
    variableType, 
    collectionId, 
    brandName, 
    namingConvention, 
    customNamingPattern 
  } = msg;
  
  // Determine collection
  if (variableType === 'collection') {
    // Create new collection
    collection = figma.variables.createVariableCollection(`${brandName} Token`);
  } else {
    // Use existing collection
    collection = collections.find(c => c.id === collectionId);
  }
  
  // Create variables based on type
  for (const [groupName, tokens] of Object.entries(palettes)) {
    for (const token of tokens) {
      let name: string;
      
      if (variableType === 'component') {
        name = `Component/${groupName}/${getComponentTokenName(groupName, token.shade)}`;
      } else if (variableType === 'alias') {
        name = `Alias/${groupName}/${formatShadeName(groupName, token.shade, namingConvention, customNamingPattern)}`;
      } else {
        name = `Base Tokens/${groupName}/${token.shade}`;
      }
      
      // Create variable and set value/alias
      // ...
    }
  }
}
```

### Theme Variable Creation

**Adding themes as modes to existing collections:**

```typescript
// UI sends theme data
parent.postMessage({
  pluginMessage: {
    type: 'create-theme-variable',
    collectionId: selectedCollectionId,
    theme: 'dark',
    palettes: themePalettes
  }
}, '*');

// Plugin code adds mode and sets values
const collection = collections.find(c => c.id === collectionId);
const newMode = collection.addMode(theme);
const modeId = newMode.modeId;

// For each token, adjust color for theme and set value
const adjustedColor = getColorForTheme(token.value, theme, groupName, palettes);
variable.setValueForMode(modeId, hexToRgb(adjustedColor));
```

## Adding New Features

### Step-by-Step Guide

#### 1. Create Feature Component

Create file: `src/ui/features/MyNewFeature.tsx`

```typescript
import React from 'react';
import { ColorToken } from '../../utils/tokens';

interface MyNewFeatureProps {
  palettes?: Record<string, ColorToken[]>;
  // Add other props as needed
}

export const MyNewFeature: React.FC<MyNewFeatureProps> = ({ palettes }) => {
  return (
    <div className="section-card">
      <h2>My New Feature</h2>
      {/* Feature implementation */}
    </div>
  );
};
```

#### 2. Add Navigation Item

Edit `src/ui/components/Sidebar.tsx`:

```typescript
import { MyIcon } from 'lucide-react';

const NAV_GROUPS = [
  // ...
  {
    title: "My Section",
    items: [
      { id: 'my-feature', label: 'My Feature', icon: MyIcon }
    ]
  }
];
```

#### 3. Add Route in App.tsx

```typescript
import { MyNewFeature } from "./features/MyNewFeature";

// In renderContent():
case 'my-feature':
  return <MyNewFeature palettes={allPalettes} />;
```

#### 4. Add Figma API Integration (if needed)

If your feature needs to interact with Figma:

**In `src/code/main.ts`**:
```typescript
if (msg.type === 'my-feature-action') {
  const { data } = msg;
  // Use Figma API
  figma.notify("Action completed!");
}
```

**In your component**:
```typescript
const handleAction = () => {
  parent.postMessage({ 
    pluginMessage: { 
      type: 'my-feature-action', 
      data: {...} 
    } 
  }, '*');
};
```

#### 5. Listen for Responses (if needed)

```typescript
useEffect(() => {
  const messageHandler = (event: MessageEvent) => {
    const data = event.data.pluginMessage || event.data;
    if (data?.type === 'my-feature-response') {
      // Handle response
    }
  };
  
  window.addEventListener('message', messageHandler);
  return () => window.removeEventListener('message', messageHandler);
}, []);
```

---

## Development Workflow

### Initial Setup

```bash
# Install dependencies
npm install

# Build the plugin
npm run build
```

### Development Mode

```bash
# Watch mode - rebuilds on file changes
npm run dev
```

**Note**: After building, you need to reload the plugin in Figma:
1. Open Figma
2. Go to Plugins → Development → [Your Plugin]
3. Or use Cmd/Ctrl + Option + P to reload

### Development Tips

1. **Check Console**: 
   - Open DevTools in the plugin UI (right-click in plugin window)
   - Check Figma's console for plugin code errors

2. **Hot Reload**: 
   - Watch mode rebuilds automatically
   - Reload plugin in Figma to see changes

3. **Testing Messages**:
   - Use `console.log` in both UI and plugin code
   - Check browser console for UI logs
   - Check Figma console for plugin code logs

4. **Type Checking**:
   ```bash
   npm run typecheck
   ```

### File Change Detection

The watch mode (`npm run dev`) monitors:
- `src/ui/**` - Triggers UI rebuild
- `src/code/**` - Triggers plugin code rebuild

### Debugging

1. **UI Debugging**:
   - Right-click in plugin window → Inspect
   - Use React DevTools extension
   - Console logs work normally

2. **Plugin Code Debugging**:
   - Open Figma DevTools (View → Developer → Console)
   - Use `console.log` in `src/code/main.ts`
   - Check for Figma API errors

3. **Message Debugging**:
   ```typescript
   // In UI
   console.log('Sending message:', { type: '...', data });
   parent.postMessage({ pluginMessage: {...} }, '*');
   
   // In plugin code
   console.log('Received message:', msg);
   ```

### Building for Production

```bash
npm run build
```

This creates optimized bundles in `dist/`:
- `dist/index.html` - UI bundle (minified, single file)
- `dist/code.js` - Plugin code bundle (minified)

### Testing in Figma

1. **Import Plugin**:
   - Plugins → Development → Import plugin from manifest...
   - Select `manifest.json`

2. **Run Plugin**:
   - Plugins → Development → ProColors
   - Or use keyboard shortcut

3. **Test Features**:
   - Test each module
   - Check console for errors
   - Verify Figma API calls work

---

## Utility Functions Reference

### Naming Utilities (`src/utils/naming.ts`)

**`formatShadeName(groupName, shade, namingConvention?, customPattern?)`**
- Formats shade names according to naming convention
- Used for alias variable names and UI display
- Returns formatted string (e.g., `"Primary-100"`, `"primary.lightest"`)

**Usage:**
```typescript
import { formatShadeName } from '../utils/naming';

const formatted = formatShadeName('primary', 100, 'kebab-capital');
// Returns: "Primary-100"
```

### Component Token Naming (`src/code/main.ts`)

**`getComponentTokenName(groupName, shade)`**
- Returns Material Design 3-style semantic name for component tokens
- Based on color group and shade value
- Used when creating component token variables

**Examples:**
- `getComponentTokenName('primary', 500)` → `"Primary"`
- `getComponentTokenName('neutral', 50)` → `"Surface"`
- `getComponentTokenName('error', 700)` → `"On Error"`

### Theme Color Adjustment (`src/code/main.ts`)

**`getColorForTheme(baseColor, theme, groupName, palettes)`**
- Adjusts color for specific theme (light, dark, dim, amoled)
- For dark themes, uses inverted shades from palette
- Applies additional saturation/brightness adjustments

**`invertShade(shade)`**
- Inverts shade number (e.g., 50 → 950, 100 → 900)
- Used for dark theme color selection

## Common Tasks

### How to Change Plugin Name

1. **manifest.json**:
   ```json
   {
     "name": "Your New Name"
   }
   ```

2. **package.json**:
   ```json
   {
     "name": "your-plugin-name",
     "description": "Your description"
   }
   ```

3. **UI Title** (if shown):
   - Check `index.html` title tag
   - Check any hardcoded titles in components

### How to Change Plugin Window Size

Edit `src/code/main.ts`:
```typescript
figma.showUI(__html__, { 
  width: 1000,  // Change width
  height: 700,  // Change height
  themeColors: true 
});
```

### How to Add New Color Formats

1. **Add Parser** (`src/utils/color.ts`):
   ```typescript
   export const parseColorFormat = (input: string): string => {
     // Parse logic
     return hexColor;
   };
   ```

2. **Update isValidColor** if needed

3. **Update ColorInput component** to accept new format

### How to Customize Shade Generation

Edit `src/utils/tokens.ts`:

```typescript
export const generateShades = (baseColor: string, name: string, scale: number[]): ColorToken[] => {
  // Modify the mixing algorithm
  // Change how lighter/darker shades are generated
};
```

### How to Add New Semantic Colors

1. **Update generateSemanticPalette** (`src/utils/tokens.ts`):
   ```typescript
   return {
     primary,
     secondary,
     // ... existing
     myNewColor: '#hexvalue'
   };
   ```

2. **Update UI** to show new color:
   - Add to palette display
   - Add input in ManualGenerator
   - Update preview components if needed

3. **Update Component Token Naming** (if needed):
   - Add mapping in `getComponentTokenName()` in `src/code/main.ts`
   - Define semantic names for your new color group

### How to Customize Naming Conventions

1. **Add New Convention** (`src/utils/naming.ts`):
   ```typescript
   case 'my-convention':
     // Your formatting logic
     return `${groupName}_${shade}`;
   ```

2. **Update Settings UI** (`src/ui/features/settings/SettingsPage.tsx`):
   - Add radio button option
   - Update settings state

3. **Update Format Function**:
   - The `formatShadeName` function will automatically use the new convention

### How to Modify Component Token Names

Edit `getComponentTokenName()` in `src/code/main.ts`:

```typescript
function getComponentTokenName(groupName: string, shade: number): string {
  const groupLower = groupName.toLowerCase();
  
  // Add your custom logic here
  if (groupLower === 'mycolor') {
    if (shade === 500) return 'My Color';
    if (shade === 700) return 'My Color Dark';
    // ...
  }
  
  // Default fallback
  return `${groupName} ${shade}`;
}
```

---

## Troubleshooting

### Plugin Not Loading

1. Check `dist/` folder exists with `index.html` and `code.js`
2. Verify manifest.json points to correct files
3. Check Figma console for errors
4. Try rebuilding: `npm run build`

### UI Not Updating

1. Reload plugin in Figma
2. Check if watch mode is running
3. Clear browser cache (if applicable)
4. Check console for build errors

### Messages Not Working

1. Verify message type matches in both UI and plugin code
2. Check console for message sending/receiving
3. Ensure `parent.postMessage` is used correctly
4. Check plugin code console for errors

### Styles Not Creating

1. Check Figma console for API errors
2. Verify color format (must be valid hex)
3. Check permissions in manifest.json
4. Verify palette structure is correct

### Build Errors

1. Run `npm run typecheck` to check TypeScript errors
2. Check for missing imports
3. Verify all dependencies are installed
4. Check Node.js version compatibility

---

## Best Practices

### Code Organization

1. **Keep features modular**: Each feature in its own folder
2. **Reuse components**: Use shared components from `components/`
3. **Utility functions**: Put reusable logic in `utils/`
4. **Type safety**: Use TypeScript interfaces for all props

### Performance

1. **Memoization**: Use `useMemo` for expensive computations
2. **Lazy loading**: Consider code splitting for large features
3. **Debounce**: Debounce expensive operations (color generation, etc.)

### User Experience

1. **Loading states**: Show loading indicators for async operations
2. **Error handling**: Handle errors gracefully with user-friendly messages
3. **Feedback**: Use `figma.notify()` for user feedback
4. **Accessibility**: Use semantic HTML and ARIA attributes

### Maintenance

1. **Documentation**: Comment complex logic
2. **Consistent naming**: Follow existing naming conventions
3. **Version control**: Commit changes frequently
4. **Testing**: Test each feature after changes

---

## Additional Resources

### Figma API Documentation
- [Figma Plugin API](https://www.figma.com/plugin-docs/)
- [Plugin API Reference](https://www.figma.com/plugin-docs/api/api-reference/)

### Libraries Used
- [chroma-js](https://gka.github.io/chroma.js/) - Color manipulation
- [React](https://react.dev/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool
- [esbuild](https://esbuild.github.io/) - Bundler

### File References

- `manifest.json` - Plugin configuration
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite build configuration

---

## Conclusion

This documentation covers the complete structure and workings of the ProColors Figma plugin. Use it as a reference when:

- Understanding how the plugin works
- Making UI updates
- Adding new features
- Debugging issues
- Modifying existing functionality

For specific implementation details, refer to the source code files mentioned in each section.

**Happy coding!** 🎨

