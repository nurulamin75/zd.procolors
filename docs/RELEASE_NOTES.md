# Release Notes

## Version 2.1.0 - Design System Improvements & Material Design 3 Integration

### 🎨 Major Features

#### Unified Variable Collection Structure
- **Single Collection Organization**: All variables (Base Tokens, Alias, and Component) are now organized in a single collection with three distinct groups:
  - **Base Tokens**: Core color variables with numeric shades (e.g., `Base Tokens/primary/100`)
  - **Alias**: Alias variables following your naming convention (e.g., `Alias/primary/Primary-100`)
  - **Component**: Semantic component tokens with Material Design 3 naming (e.g., `Component/primary/Primary`, `Component/primary/On Primary`)
- All component and alias tokens are properly linked to their source variables in the Base Tokens group

#### Material Design 3 Semantic Naming
- Component tokens now use Material Design 3-style semantic names:
  - `Primary`, `On Primary`, `Primary Container`, `On Primary Container`
  - `Surface`, `On Surface`, `Surface Container`, `Inverse Surface`
  - `Error`, `On Error`, `Error Container`
  - And more semantic naming patterns for all color groups

#### Brand-Based Collection Naming
- Variable collections are now named based on your active brand (e.g., "Acme Corp Token" instead of "ProColors Token")
- Collections automatically use the brand name from your Multi Brand settings

### 🔧 Improvements

#### Color Extraction Workflow
- **Moved to Shades Page**: Color extraction is now integrated into the Generate Shades page as a dedicated tab
- **Simplified Interface**: Removed "From URL" option, focusing on image upload
- **Quick Apply**: Added "Apply to Manual Input" button to instantly apply extracted colors to your palette

#### Color Wheel & Harmony Generator
- **Improved Layout**: Color wheel and harmony controls are now contained in a clean, bordered box
- **Dropdown Selection**: Replaced harmony rule buttons with a dropdown menu for cleaner UI
- **Better Organization**: Generated palette is positioned directly under the Color Harmony dropdown

#### Naming Conventions
- Variable names now respect your selected naming convention from Settings:
  - Kebab Case (Capital): `Primary-100`
  - Dot Notation (Lowercase): `primary.lightest`
  - Abbreviated: `p1 / 100`
  - Custom: Your custom pattern
- Applies to both alias variables and component tokens

#### UI Refinements
- Removed subtitle from Generator page header
- Changed page title from "Generator" to "Generate Shades"
- Reduced top padding on all cards for a more compact layout
- Removed background from generated palette display

### 🐛 Bug Fixes
- Fixed variable aliasing to ensure component and alias tokens properly reference source variables
- Improved source variable lookup when creating aliases and component tokens

### 📝 Technical Details
- All variables are created in a single collection for better organization
- Component tokens use semantic Material Design 3 naming patterns
- Alias and component variables are properly linked to Base Tokens
- Brand name is automatically included in collection names

**Note**: When creating new variables, you'll now see three options:
1. **New Variable Collection** - Creates Base Tokens
2. **New Alias Collection** - Adds Alias group to an existing collection
3. **New Component Token** - Adds Component group to an existing collection

All three types will be organized in the same collection with clear group separation.

---

## Version 2.0.0

## 🎨 UI Polish & Enhancements

### Sidebar Improvements
- **Default State Optimization**: Only the "Create" group is now expanded by default, providing a cleaner and more focused initial experience
- Improved navigation hierarchy for better user orientation

### Visual Refinements
- **Hidden Scrollbars**: Removed visible scrollbars while maintaining full scrolling functionality for a cleaner interface
- **Modern Color Picker**: Completely redesigned color picker with:
  - Rounded corners and modern styling
  - Fixed z-index issues ensuring it always appears above other elements
  - Portal-based rendering for better layering
  - Enhanced user experience with smooth interactions

### Layout Improvements
- **Consistent Grid Layout**: Standardized color selector grid to display 4 items per row
- **Gradient Display**: Updated gradient cards to show 2 per row, matching the palette grid layout for visual consistency

## ✨ Brand New Feature: Custom Color Palette

### Custom Color Management
- **Add Custom Colors**: New custom color input box allows users to add their own color palettes
- **Automatic Shade Generation**: Custom colors automatically generate full shade scales just like semantic colors
- **Smart Layout**: Custom colors integrate seamlessly with existing color groups in a 4-column grid
- **Delete Functionality**: Hover over custom colors to reveal a delete option for easy management
- **Real-time Preview**: See your custom color preview as you type the hex code

### Enhanced Color Workflow
- Custom colors are fully integrated with all export features
- Custom color palettes appear in the palette display section
- Supports the same shade scale adjustments as standard colors

## 🐛 Bug Fixes

### Filter System
- **Fixed Filter Button**: Resolved issue where the filter button in the Explore Palettes section was not functioning correctly
- Improved filter state management and UI responsiveness

### Color Picker
- **Z-Index Resolution**: Fixed color picker appearing behind other elements by implementing React Portal rendering
- Ensures color picker always displays on top regardless of parent container stacking contexts

### Sidebar State
- Fixed sidebar group expansion state persistence issues
- Improved default state initialization

## 🎯 Figma Canvas Export Enhancements

### Improved Palette Display
- **Group Labels**: Each color group (Primary, Secondary, Neutral, etc.) now displays with clear labels on the Figma canvas
- **Background Styling**: Added light gray background to the entire palette frame for better visual organization
- Enhanced readability and professional presentation of exported palettes

## 📦 Technical Improvements

- Improved component state management
- Enhanced type safety across components
- Better error handling and user feedback
- Optimized rendering performance

---

**Thank you for using ProColors!** We're continuously working to improve your color design workflow. If you have any feedback or suggestions, please let us know.

