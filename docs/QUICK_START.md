# Quick Start Guide - ProColors Plugin

This guide provides quick references for common tasks when working with the ProColors plugin.

## 🚀 Getting Started

### First Time Setup

```bash
# Install dependencies
npm install

# Build the plugin
npm run build

# Start development mode (auto-rebuild on changes)
npm run dev
```

### Load Plugin in Figma

1. Open Figma Desktop
2. Go to **Plugins** → **Development** → **Import plugin from manifest...**
3. Select `manifest.json` from the project root
4. Run the plugin: **Plugins** → **Development** → **ProColors**

---

## 📝 Common Tasks

### 1. Change Plugin Window Size

**File**: `src/code/main.ts` (line 3)

```typescript
figma.showUI(__html__, { 
  width: 1000,   // Change this
  height: 700,   // Change this
  themeColors: true 
});
```

---

### 2. Add a New Navigation Item

**Step 1**: Edit `src/ui/components/Sidebar.tsx`

```typescript
import { MyIcon } from 'lucide-react'; // Add icon import

const NAV_GROUPS = [
  // ... existing groups
  {
    title: "My Section",
    items: [
      { id: 'my-feature', label: 'My Feature', icon: MyIcon }
    ]
  }
];
```

**Step 2**: Add route in `src/ui/App.tsx`

```typescript
import { MyFeature } from "./features/MyFeature"; // Import component

// In renderContent() function:
case 'my-feature':
  return <MyFeature palettes={allPalettes} />;
```

---

### 3. Change Primary Brand Color

**File**: `src/ui/App.tsx` (line 35)

```typescript
const [brands, setBrands] = useState<Brand[]>([
  { id: 'default', name: 'Default Brand', primaryColor: '#YOUR_COLOR' }
]);
```

---

### 4. Modify Shade Scale

**Option 1**: Change default scale globally

**File**: `src/utils/tokens.ts` (line 9)

```typescript
export const SHADE_Scale = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
// Modify the numbers as needed
```

**Option 2**: Change in UI (already supported in ManualGenerator)

---

### 5. Change UI Colors

**File**: `src/ui/styles.css`

```css
:root {
  --color-primary: #YOUR_COLOR;           /* Primary blue */
  --color-bg-app: #YOUR_BACKGROUND;       /* App background */
  --color-text-primary: #YOUR_TEXT;       /* Main text color */
  /* ... modify other variables */
}
```

---

### 6. Create Variables with Different Types

**Variable Creation Flow:**

1. **Base Tokens** (New Variable Collection):
   ```typescript
   parent.postMessage({
     pluginMessage: {
       type: 'create-color-variables',
       palettes: allPalettes,
       action: 'create',
       variableType: 'collection',
       brandName: 'MyBrand'
     }
   }, '*');
   ```

2. **Alias Variables** (New Alias Collection):
   ```typescript
   // First, show collection selection modal
   // Then send:
   parent.postMessage({
     pluginMessage: {
       type: 'create-color-variables',
       palettes: allPalettes,
       action: 'create',
       variableType: 'alias',
       collectionId: selectedCollectionId,
       brandName: 'MyBrand',
       namingConvention: 'kebab-capital'
     }
   }, '*');
   ```

3. **Component Tokens** (New Component Token):
   ```typescript
   parent.postMessage({
     pluginMessage: {
       type: 'create-color-variables',
       palettes: allPalettes,
       action: 'create',
       variableType: 'component',
       collectionId: selectedCollectionId,
       brandName: 'MyBrand'
     }
   }, '*');
   ```

**Variable Naming:**
- Base Tokens: `Base Tokens/{group}/{shade}` (e.g., `Base Tokens/primary/100`)
- Alias: `Alias/{group}/{formattedShade}` (e.g., `Alias/primary/Primary-100`)
- Component: `Component/{group}/{semanticName}` (e.g., `Component/primary/Primary`)

### 7. Add a New Export Format

**Step 1**: Create formatter in `src/utils/export.ts`

```typescript
export const formatMyFormat = (palettes: Record<string, ColorToken[]>): string => {
  // Your formatting logic here
  return formattedString;
};
```

**Step 2**: Add to export handler in `src/ui/App.tsx`

```typescript
const handleExport = (format, action, targetId) => {
  // ... existing code
  if (format === 'my-format') {
    content = formatMyFormat(allPalettes);
    // ... copy logic
  }
};
```

**Step 3**: Add UI button (in ExportSection or your feature)

```typescript
<button onClick={() => handleExport('my-format')}>
  Export as My Format
</button>
```

---

### 8. Add a New Feature Module

**Step 1**: Create feature file

```
src/ui/features/MyFeature.tsx
```

```typescript
import React from 'react';
import { ColorToken } from '../../utils/tokens';

interface MyFeatureProps {
  palettes?: Record<string, ColorToken[]>;
}

export const MyFeature: React.FC<MyFeatureProps> = ({ palettes }) => {
  return (
    <div className="section-card">
      <h2>My Feature</h2>
      {/* Your feature UI */}
    </div>
  );
};
```

**Step 2**: Add navigation item (see task #2)

**Step 3**: Add route in App.tsx (see task #2)

---

### 9. Create Figma Styles Programmatically

**Example**: Add a new message handler in `src/code/main.ts`

```typescript
if (msg.type === 'my-custom-action') {
  const { colorData } = msg;
  
  // Create style
  const style = figma.createPaintStyle();
  style.name = "My Custom Color";
  style.paints = [{
    type: 'SOLID',
    color: hexToRgb(colorData.hex)
  }];
  
  figma.notify("Created custom style!");
}
```

**Call from UI**:

```typescript
parent.postMessage({
  pluginMessage: {
    type: 'my-custom-action',
    colorData: { hex: '#ff0000' }
  }
}, '*');
```

---

### 10. Listen for Messages from Plugin Code

**In your React component**:

```typescript
useEffect(() => {
  const messageHandler = (event: MessageEvent) => {
    const data = event.data.pluginMessage || event.data;
    
    if (data?.type === 'my-response') {
      console.log('Received:', data);
      // Handle the response
    }
  };
  
  window.addEventListener('message', messageHandler);
  return () => window.removeEventListener('message', handler);
}, []);
```

---

### 11. Modify Color Generation Algorithm

**File**: `src/utils/tokens.ts`

```typescript
export const generateShades = (baseColor: string, name: string, scale: number[]): ColorToken[] => {
  // ... existing code
  
  // Modify the mixing algorithm here:
  if (shade < 500) {
    const factor = (500 - shade) / 500;
    // Change this line to adjust how light colors are generated:
    color = chroma.mix(base, 'white', factor * 0.9, 'rgb'); 
  } else {
    const factor = (shade - 500) / 500;
    // Change this line to adjust how dark colors are generated:
    color = chroma.mix(base, 'black', factor * 0.8, 'rgb');
  }
  
  // ... rest of code
};
```

---

## 🔧 Development Commands

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `npm run build` | Build plugin (UI + Code) |
| `npm run build-ui` | Build UI only |
| `npm run build-code` | Build plugin code only |
| `npm run dev` | Watch mode (auto-rebuild) |
| `npm run typecheck` | Check TypeScript errors |

---

## 📁 Key Files Quick Reference

| File | Purpose | When to Edit |
|------|---------|--------------|
| `src/ui/App.tsx` | Main app, routing, state | Add routes, change state logic |
| `src/ui/components/Sidebar.tsx` | Navigation sidebar | Add/remove nav items |
| `src/code/main.ts` | Plugin code, Figma API | Add Figma API functionality |
| `src/ui/styles.css` | Global styles | Change colors, spacing, etc. |
| `src/utils/tokens.ts` | Color generation | Modify shade generation |
| `src/utils/naming.ts` | Naming conventions | Modify naming logic |
| `src/utils/export.ts` | Export formatters | Add export formats |
| `src/code/main.ts` | Plugin code, Figma API | Variable creation, component token naming |
| `manifest.json` | Plugin config | Change plugin name, window size |

---

## 🎨 Common Component Patterns

### Creating a New Component

```typescript
import React from 'react';
import { ColorToken } from '../../utils/tokens';

interface MyComponentProps {
  palettes?: Record<string, ColorToken[]>;
  onAction?: (data: any) => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ 
  palettes, 
  onAction 
}) => {
  return (
    <div className="section-card">
      <h2>My Component</h2>
      {/* Component content */}
    </div>
  );
};
```

### Using CSS Variables

```typescript
<div style={{
  padding: 'var(--spacing-md)',
  backgroundColor: 'var(--color-bg-card)',
  color: 'var(--color-text-primary)',
  borderRadius: 'var(--radius-md)',
  boxShadow: 'var(--shadow-sm)'
}}>
```

### Button Styling

```typescript
// Primary button
<button className="btn btn-primary">Click me</button>

// Secondary button
<button className="btn btn-secondary">Click me</button>

// Icon button
<button className="btn-icon">
  <Icon size={16} />
</button>
```

---

## 🐛 Debugging Tips

### View UI Console

1. Right-click in the plugin window
2. Select "Inspect" or "Inspect Element"
3. Check Console tab for errors

### View Plugin Code Console

1. In Figma: **View** → **Developer** → **Console**
2. Check for plugin code errors/logs

### Check Build Output

```bash
# Verify dist folder has files
ls -la dist/

# Should see:
# - dist/index.html
# - dist/code.js
```

### Reload Plugin After Changes

After rebuilding, reload in Figma:
- **Plugins** → **Development** → **ProColors**
- Or press **Cmd/Ctrl + Option + P** to reload

---

## 📦 Adding New Dependencies

```bash
# Add a new npm package
npm install package-name

# Add dev dependency
npm install --save-dev package-name

# If it's for UI, it will be bundled by Vite
# If it's for plugin code, ensure it's compatible with Figma's environment
```

**Note**: Some Node.js packages won't work in Figma plugin code. Test thoroughly.

---

## 🔄 Reloading After Changes

1. **Build changes**: Run `npm run build` (or use `npm run dev` for watch mode)
2. **Reload plugin**: In Figma, run the plugin again
3. **Clear cache**: If issues persist, try:
   - Close and reopen Figma
   - Clear plugin cache in Figma settings

---

## 💡 Quick Tips

- **CSS Variables**: All colors/spacing use CSS variables - change in `styles.css`
- **Type Safety**: Use TypeScript interfaces for all props
- **State**: Global state in `App.tsx`, local state in feature components
- **Messages**: Always use `parent.postMessage()` for UI → Plugin communication
- **Notifications**: Use `figma.notify()` in plugin code for user feedback
- **Icons**: Use icons from `lucide-react` package

---

## 🚨 Common Issues & Solutions

### Plugin won't load
- ✅ Check `dist/` folder exists
- ✅ Verify `manifest.json` paths are correct
- ✅ Rebuild: `npm run build`

### Changes not appearing
- ✅ Rebuild the plugin
- ✅ Reload plugin in Figma
- ✅ Check console for errors

### Messages not working
- ✅ Check message type matches exactly
- ✅ Verify `parent.postMessage()` syntax
- ✅ Check plugin code console for errors

### Styles not creating
- ✅ Check color format (must be valid hex)
- ✅ Check Figma console for API errors
- ✅ Verify palette structure

---

## 📚 Next Steps

- Read [DOCUMENTATION.md](./DOCUMENTATION.md) for detailed explanations
- Check [COMPONENT_TREE.md](./COMPONENT_TREE.md) for component structure
- Review source code for implementation examples

---

**Happy coding!** 🎨

