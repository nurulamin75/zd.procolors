# Component Tree & Visual Structure Guide

This document provides a visual representation of the component hierarchy and data flow in the ProColors plugin.

## Complete Component Hierarchy

```
App.tsx (Root)
│
├── Sidebar.tsx
│   └── Navigation Items (from NAV_GROUPS)
│
└── main-content
    ├── Header
    │   ├── Title & Description
    │   └── Action Buttons
    │       ├── Figma Icon (Add to Canvas)
    │       ├── DropdownButton (Style Export)
    │       └── DropdownButton (Variable Export)
    │
    └── content-scroll-area
        └── [Active Feature Module based on activeModule state]
            │
            ├── generator → GeneratorPage.tsx (Generate Shades)
            │   ├── Tab Selector (Manual / Color Harmony / Extract from Image)
            │   ├── ManualGenerator.tsx
            │   │   ├── ColorInput components
            │   │   ├── PaletteDisplay components
            │   │   └── ExportSection
            │   ├── HarmonyPanel.tsx
            │   │   ├── ColorWheel.tsx
            │   │   ├── Harmony dropdown selector
            │   │   └── GeneratedPalette.tsx
            │   └── ImageExtractor.tsx (from flow/extractor)
            │       ├── Image upload area
            │       └── "Apply to Manual Input" button
            │
            ├── transfer → TransferPage.tsx
            │   ├── ExportCard.tsx
            │   ├── SavedTransfersList.tsx
            │   └── PreviewModal.tsx
            │
            ├── brands → MultiBrand.tsx
            │   └── Brand management UI
            │
            ├── themes → ThemeGenerator.tsx
            │   ├── Theme selector (Light / Dark / Dim / AMOLED)
            │   ├── Theme preview
            │   └── "Add Theme to Variable" button
            │       └── Collection selection modal
            │
            ├── gradients → GradientModule (index.tsx)
            │   ├── GradientSettings.tsx
            │   ├── GradientCard.tsx
            │   └── CustomGradientModal.tsx
            │
            ├── preview → LivePreview.tsx
            │   └── preview/ (preview components)
            │       ├── Buttons.tsx
            │       ├── Alerts.tsx
            │       ├── Cards.tsx
            │       ├── Inputs.tsx
            │       ├── Navigation.tsx
            │       ├── DataDisplay.tsx
            │       └── Misc.tsx
            │
            ├── contrast → ContrastPage.tsx
            │   ├── ColorInput.tsx
            │   ├── ScoreCard.tsx
            │   ├── PreviewCard.tsx
            │   ├── HistoryList.tsx
            │   ├── SimulationThumbnails.tsx
            │   └── SuggestedFixCard.tsx
            │
            ├── blindness → ColorBlindness.tsx
            │   └── Color blindness simulation UI
            │
            ├── heatmap → HeatmapPage.tsx
            │   ├── SummaryCards.tsx
            │   ├── FamilySection.tsx
            │   ├── HeatmapBlock.tsx
            │   ├── ScoreCard.tsx
            │   └── DetailsPopover.tsx
            │
            ├── replacer → Replacer.tsx
            │   └── Color replacement UI
            │
            └── export → AdvancedExport.tsx
                └── Advanced export options
```

## Shared Components

These components are used across multiple features:

```
components/
├── Sidebar.tsx              → Navigation sidebar
├── ColorInput.tsx           → Color input with picker
├── DropdownButton.tsx       → Dropdown menu component
├── ExportSection.tsx        → Export UI section
├── LivePreview.tsx          → Live preview wrapper
└── PaletteDisplay.tsx       → Color palette display
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                      User Input                         │
│  (Color picker, text input, file upload, etc.)         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    React Components                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │  App.tsx State Management                        │  │
│  │  - activeModule                                  │  │
│  │  - brands[]                                      │  │
│  │  - activeBrandId                                 │  │
│  │  - shadeScale[]                                  │  │
│  │  - overrides{}                                   │  │
│  └──────────────────────────────────────────────────┘  │
│                     │                                    │
│                     ▼                                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Computed Values (useMemo)                       │  │
│  │  - semanticColors{}                              │  │
│  │  - allPalettes{}                                 │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Utility Functions                      │
│  src/utils/                                             │
│  ├── tokens.ts        → generateShades()               │
│  ├── color.ts         → isValidColor()                 │
│  ├── contrast.ts      → checkAccessibility()           │
│  ├── harmony.ts       → Color harmony algorithms       │
│  └── export.ts        → formatJSON/CSS/Tailwind()      │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌──────────────────────┐
│  UI Display     │    │  Export Actions      │
│  - PaletteDisplay│    │  - Copy to clipboard│
│  - Preview      │    │  - Download file     │
│  - Live preview │    │  - Send to Figma     │
└─────────────────┘    └──────────┬───────────┘
                                  │
                                  ▼
                  ┌───────────────────────────────┐
                  │   parent.postMessage()        │
                  │   { pluginMessage: {...} }    │
                  └───────────┬───────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│              Plugin Code (src/code/main.ts)             │
│  ┌──────────────────────────────────────────────────┐  │
│  │  figma.ui.onmessage = async (msg) => {...}      │  │
│  │                                                   │  │
│  │  Message Handlers:                               │  │
│  │  - create-color-styles                           │  │
│  │  - create-color-variables                        │  │
│  │  - add-palette-to-canvas                         │  │
│  │  - export-all-data                               │  │
│  │  - import-data                                   │  │
│  │  - ... (more)                                    │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Figma API Calls                        │
│  - figma.createPaintStyle()                            │
│  - figma.variables.createVariable()                    │
│  - figma.createFrame()                                 │
│  - figma.notify()                                      │
│  - figma.ui.postMessage()                              │
└─────────────────────────────────────────────────────────┘
```

## Feature Module Structure

Each feature module follows a similar pattern:

```
feature-name/
├── [FeatureName].tsx           → Main feature component
├── components/                  → Feature-specific components
│   ├── Component1.tsx
│   └── Component2.tsx
└── utils/                       → Feature-specific utilities
    └── helper.ts
```

## Component Props Flow

### App.tsx → Feature Components

Most features receive these props:
- `palettes: Record<string, ColorToken[]>` - All generated palettes
- `allPalettes: Record<string, ColorToken[]>` - Same as palettes
- Feature-specific props as needed

### Generator Feature (Most Complex)

```
GeneratorPage
  ├── activeTab: 'manual' | 'harmony' | 'extract'
  ├── ManualGenerator
  │   ├── primaryColor: string
  │   ├── semanticColors: Record<string, string>
  │   ├── allPalettes: Record<string, ColorToken[]>
  │   ├── onColorChange: (name, val) => void
  │   ├── onExport: (format, action?, targetId?) => void
  │   ├── shadeScale: number[]
  │   └── onUpdateScale: (scale) => void
  │
  ├── HarmonyPanel
  │   ├── selectedHarmony: string
  │   ├── onApply: (colors: string[]) => void
  │   └── GeneratedPalette
  │
  └── ImageExtractor
      ├── extractedColors: string[]
      ├── onColorSelect: (color: string) => void
      └── onApplyColors: (colors: string[]) => void
```

## State Management Flow

```
Global State (App.tsx)
│
├── activeModule: string
│   └── Controls which feature is shown
│
├── brands: Brand[]
│   ├── id: string
│   ├── name: string
│   └── primaryColor: string
│
├── activeBrandId: string
│   └── Currently selected brand
│
├── shadeScale: number[]
│   └── Custom shade scale (default: [50,100,200...950])
│
└── overrides: Record<string, string>
    └── Manual color overrides for semantic colors

Computed State (Derived from above)
│
├── semanticColors: Record<string, string>
│   └── Base semantic colors (primary, secondary, etc.)
│       = generateSemanticPalette(activeBrand.primaryColor) + overrides
│
└── allPalettes: Record<string, ColorToken[]>
    └── Full palettes with all shades
        = generateShades() for each semantic color
```

## Message Flow Pattern

### Example: Creating Figma Styles

```
1. User clicks "Create Styles" button
   │
   ▼
2. handleExport('figma', 'create', undefined)
   │
   ▼
3. parent.postMessage({
     pluginMessage: {
       type: 'create-color-styles',
       palettes: allPalettes,
       action: 'create',
       targetId: undefined
     }
   })
   │
   ▼
4. Plugin code receives message
   figma.ui.onmessage = async (msg) => {
     if (msg.type === 'create-color-styles') {
       // Process and create styles
     }
   }
   │
   ▼
5. figma.createPaintStyle() calls
   │
   ▼
6. figma.notify("Success! Created X styles.")
```

## File Reference Map

### Navigation & Routing
- **Sidebar navigation**: `src/ui/components/Sidebar.tsx`
- **Route switching**: `src/ui/App.tsx` → `renderContent()`
- **Module IDs**: Defined in `Sidebar.tsx` → `NAV_GROUPS`

### Core Generation Logic
- **Shade generation**: `src/utils/tokens.ts` → `generateShades()`
- **Semantic palette**: `src/utils/tokens.ts` → `generateSemanticPalette()`
- **Color validation**: `src/utils/color.ts` → `isValidColor()`
- **Naming conventions**: `src/utils/naming.ts` → `formatShadeName()`
- **Component token naming**: `src/code/main.ts` → `getComponentTokenName()`

### Export Logic
- **Export formatters**: `src/utils/export.ts`
- **Export handlers**: `src/ui/App.tsx` → `handleExport()`
- **Figma API calls**: `src/code/main.ts` → message handlers

### Styling
- **CSS Variables**: `src/ui/styles.css` → `:root`
- **Component styles**: Inline styles (common pattern)
- **Utility classes**: `src/ui/styles.css`

## Component Communication Patterns

### Parent → Child (Props)
```typescript
<FeatureComponent 
  palettes={allPalettes}
  onAction={handleAction}
/>
```

### Child → Parent (Callbacks)
```typescript
// Child
<button onClick={() => onColorChange('primary', '#ff0000')}>

// Parent
const handleColorChange = (name: string, val: string) => {
  // Update state
};
```

### UI → Plugin Code (postMessage)
```typescript
parent.postMessage({
  pluginMessage: {
    type: 'action-type',
    data: {...}
  }
}, '*');
```

### Plugin Code → UI (postMessage)
```typescript
// In plugin code
figma.ui.postMessage({
  type: 'response-type',
  data: {...}
});

// In UI component
useEffect(() => {
  const handler = (event: MessageEvent) => {
    if (event.data.pluginMessage?.type === 'response-type') {
      // Handle response
    }
  };
  window.addEventListener('message', handler);
  return () => window.removeEventListener('message', handler);
}, []);
```

## Quick Component Lookup

| Component | Location | Purpose |
|-----------|----------|---------|
| App | `src/ui/App.tsx` | Root component, routing, state |
| Sidebar | `src/ui/components/Sidebar.tsx` | Navigation |
| PaletteDisplay | `src/ui/components/PaletteDisplay.tsx` | Show color swatches |
| ColorInput | `src/ui/components/ColorInput.tsx` | Color input field |
| DropdownButton | `src/ui/components/DropdownButton.tsx` | Export dropdown |
| GeneratorPage | `src/ui/features/generator/GeneratorPage.tsx` | Main generator |
| ContrastPage | `src/ui/features/contrast/ContrastPage.tsx` | Contrast checker |
| HeatmapPage | `src/ui/features/heatmap/index.tsx` | Contrast heatmap |

## Module IDs Reference

| ID | Module | File |
|----|--------|------|
| `generator` | Generate Shades | `features/create/shades/GeneratorPage.tsx` |
| `transfer` | Transfer | `features/transfer/TransferPage.tsx` |
| `brands` | Multi Brand | `features/MultiBrand.tsx` |
| `extractor` | Extract | `features/flow/extractor/ImageExtractor.tsx` (integrated into GeneratorPage) |
| `themes` | Themes | `features/create/themes/ThemeGenerator.tsx` |
| `gradients` | Gradients | `features/gradients/index.tsx` |
| `preview` | Preview | `components/LivePreview.tsx` |
| `contrast` | Checker | `features/contrast/ContrastPage.tsx` |
| `blindness` | Simulator | `features/ColorBlindness.tsx` |
| `heatmap` | Heatmap | `features/heatmap/index.tsx` |
| `replacer` | Color Replacer | `features/Replacer.tsx` |
| `export` | Export | `features/AdvancedExport.tsx` |

