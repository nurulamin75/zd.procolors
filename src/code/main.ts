import chroma from 'chroma-js';
import { linkColorsInSelection, linkColorsInPage, undoLinking } from '../colorLinker';

figma.showUI(__html__, { width: 900, height: 650, themeColors: true });

function hexToRgb(hex: string) {
  const c = (chroma as any).default || chroma;
  const [r, g, b] = c(hex).rgb();
  return { r: r / 255, g: g / 255, b: b / 255 };
}

function rgbToHex(r: number, g: number, b: number) {
  const c = (chroma as any).default || chroma;
  return c(r * 255, g * 255, b * 255).hex();
}

// Map shade numbers to descriptive names for dot notation
const SHADE_NAME_MAP: Record<number, string> = {
  25: 'lightest',
  50: 'lighter',
  100: 'light',
  200: 'lighter-medium',
  300: 'medium-light',
  400: 'medium',
  500: 'base',
  600: 'medium-dark',
  700: 'dark',
  800: 'darker',
  900: 'darkest',
  950: 'darkest-plus',
  975: 'darkest-max'
};

// Format shade name based on naming convention
function formatShadeName(
  groupName: string,
  shade: number,
  namingConvention?: string,
  customPattern?: string
): string {
  const normalizedGroup = groupName || 'color';

  // Default to kebab-capital if not provided
  const convention = namingConvention || 'kebab-capital';

  switch (convention) {
    case 'kebab-capital':
      // Primary-100
      return `${normalizedGroup.charAt(0).toUpperCase() + normalizedGroup.slice(1)}-${shade}`;

    case 'dot-lowercase':
      // primary.lightest
      const shadeName = SHADE_NAME_MAP[shade] || shade.toString();
      return `${normalizedGroup.toLowerCase()}.${shadeName}`;

    case 'abbreviated':
      // p1 / 100
      const abbrev = normalizedGroup.charAt(0).toLowerCase();
      const firstDigit = shade.toString().charAt(0);
      return `${abbrev}${firstDigit} / ${shade}`;

    case 'custom':
      // Use custom pattern with {group} and {shade} placeholders
      const pattern = customPattern || '{group}-{shade}';
      return pattern
        .replace(/{group}/g, normalizedGroup)
        .replace(/{shade}/g, shade.toString());

    default:
      // Fallback to just the shade number
      return shade.toString();
  }
}

// Map shade numbers to meaningful component token names (Material Design style)
function getComponentTokenName(groupName: string, shade: number): string {
  const groupLower = groupName.toLowerCase();

  // Material Design 3 style semantic naming
  // Based on shade and color group purpose

  // For primary colors - used for buttons, links, interactive elements
  if (groupLower === 'primary') {
    if (shade <= 50) return 'Primary Container';
    if (shade <= 100) return 'On Primary Container';
    if (shade <= 200) return 'Primary Fixed';
    if (shade <= 300) return 'On Primary Fixed';
    if (shade <= 400) return 'Primary Fixed Dim';
    if (shade === 500) return 'Primary';
    if (shade === 600) return 'Primary';
    if (shade === 700) return 'On Primary';
    if (shade >= 800) return 'Inverse Primary';
  }

  // For secondary colors
  if (groupLower === 'secondary') {
    if (shade <= 50) return 'Secondary Container';
    if (shade <= 100) return 'On Secondary Container';
    if (shade <= 200) return 'Secondary Fixed';
    if (shade <= 300) return 'On Secondary Fixed';
    if (shade <= 400) return 'Secondary Fixed Dim';
    if (shade === 500) return 'Secondary';
    if (shade === 600) return 'Secondary';
    if (shade === 700) return 'On Secondary';
    if (shade >= 800) return 'Inverse Secondary';
  }

  // For neutral colors - used for surfaces, backgrounds, text
  if (groupLower === 'neutral') {
    if (shade <= 50) return 'Surface';
    if (shade <= 100) return 'On Surface';
    if (shade <= 200) return 'Surface Container';
    if (shade <= 300) return 'On Surface Container';
    if (shade <= 400) return 'Surface Container High';
    if (shade === 500) return 'Surface Container Highest';
    if (shade === 600) return 'Inverse Surface';
    if (shade === 700) return 'Inverse On Surface';
    if (shade >= 800) return 'Outline';
    if (shade >= 900) return 'Outline Variant';
  }

  // For error colors
  if (groupLower === 'error') {
    if (shade <= 100) return 'Error Container';
    if (shade <= 200) return 'On Error Container';
    if (shade === 500) return 'Error';
    if (shade >= 700) return 'On Error';
  }

  // For warning colors
  if (groupLower === 'warning') {
    if (shade <= 100) return 'Warning Container';
    if (shade <= 200) return 'On Warning Container';
    if (shade === 500) return 'Warning';
    if (shade >= 700) return 'On Warning';
  }

  // For success colors
  if (groupLower === 'success') {
    if (shade <= 100) return 'Success Container';
    if (shade <= 200) return 'On Success Container';
    if (shade === 500) return 'Success';
    if (shade >= 700) return 'On Success';
  }

  // For info colors
  if (groupLower === 'info') {
    if (shade <= 100) return 'Info Container';
    if (shade <= 200) return 'On Info Container';
    if (shade === 500) return 'Info';
    if (shade >= 700) return 'On Info';
  }

  // Fallback for other color groups - use generic semantic names
  if (shade <= 50) return 'Container';
  if (shade <= 100) return 'On Container';
  if (shade <= 200) return 'Fixed';
  if (shade <= 300) return 'On Fixed';
  if (shade <= 400) return 'Fixed Dim';
  if (shade === 500) return groupName.charAt(0).toUpperCase() + groupName.slice(1);
  if (shade === 600) return groupName.charAt(0).toUpperCase() + groupName.slice(1);
  if (shade === 700) return `On ${groupName.charAt(0).toUpperCase() + groupName.slice(1)}`;
  if (shade >= 800) return `Inverse ${groupName.charAt(0).toUpperCase() + groupName.slice(1)}`;

  return `Shade ${shade}`;
}

// Invert shade number: 50→950, 100→900, 200→800, etc.
function invertShade(shade: number): number {
  const shadeMap: Record<number, number> = {
    50: 950,
    100: 900,
    200: 800,
    300: 700,
    400: 600,
    500: 500, // Middle stays the same
    600: 400,
    700: 300,
    800: 200,
    900: 100,
    950: 50
  };
  return shadeMap[shade] || shade; // Return original if not in map
}

// Get color for theme by inverting shade and optionally adjusting
function getColorForTheme(
  palettes: Record<string, any[]>,
  groupName: string,
  baseShade: number,
  theme: string
): string | null {
  const tokens = palettes[groupName];
  if (!tokens || !Array.isArray(tokens)) {
    console.warn(`No tokens found for group ${groupName}`);
    return null;
  }

  // For light theme, use the original shade value
  if (theme === 'light') {
    const baseToken = tokens.find((t: any) => t.shade === baseShade);
    return baseToken?.value || null;
  }

  // For dark/dim/amoled themes, invert the shade mapping
  // This means: variable "primary/50" in dark mode gets the color from "primary/950"
  const invertedShade = invertShade(baseShade);
  const invertedToken = tokens.find((t: any) => t.shade === invertedShade);

  if (!invertedToken) {
    console.warn(`Could not find inverted shade ${invertedShade} for base shade ${baseShade} in ${groupName}. Available shades:`, tokens.map((t: any) => t.shade));
    // Fall back to base shade if inverted not found
    const baseToken = tokens.find((t: any) => t.shade === baseShade);
    return baseToken?.value || null;
  }

  let color = invertedToken.value;
  console.log(`Theme ${theme}: Using shade ${invertedShade} color (${color}) for variable with base shade ${baseShade}`);

  // Apply additional adjustments based on theme
  if (!chroma.valid(color)) {
    return color;
  }

  const original = chroma(color);
  let adjusted = original;

  switch (theme) {
    case 'dark':
      // For dark theme, slightly increase saturation for better contrast
      adjusted = original.saturate(0.1);
      break;
    case 'dim':
      // For dim theme, reduce saturation (muted colors)
      adjusted = original.desaturate(0.2);
      break;
    case 'amoled':
      // For amoled theme, make slightly darker and more saturated
      adjusted = original.darken(0.1).saturate(0.15);
      break;
    default:
      // No additional adjustment
      break;
  }

  return adjusted.hex();
}

figma.ui.onmessage = async (msg) => {
  // Debug: Log all incoming messages
  if (msg.type === 'create-variables-from-colors') {
    console.log('=== MESSAGE RECEIVED IN PLUGIN CODE ===');
    console.log('Message type:', msg.type);
    console.log('Message data:', {
      colorsCount: msg.colors?.length,
      collectionId: msg.collectionId,
      createNewCollection: msg.createNewCollection
    });
  }

  // Fetch available collections for variables
  if (msg.type === 'get-target-options') {
    if (msg.targetType === 'variables') {
      if (figma.variables) {
        try {
          const collections = await figma.variables.getLocalVariableCollectionsAsync();
          const options = collections.map(c => ({
            label: c.name,
            value: c.id
          }));
          figma.ui.postMessage({ type: 'target-options-response', targetType: 'variables', options });
        } catch (e) {
          figma.notify("Error fetching collections");
        }
      } else {
        figma.ui.postMessage({ type: 'target-options-response', targetType: 'variables', options: [] });
      }
    } else if (msg.targetType === 'styles') {
      try {
        const styles = await figma.getLocalPaintStylesAsync();
        // Extract unique folders (prefixes)
        const prefixes = new Set<string>();
        styles.forEach(s => {
          if (s.name.includes('/')) {
            const parts = s.name.split('/');
            // If 3 parts "Folder/Group/Shade", Folder is prefix? 
            // Or if 2 parts "Group/Shade", Group is prefix?
            // Our generator makes Group/Shade.
            // If created with folder: "Folder/Group/Shade".
            // Let's take the first part if depth > 2, or if it matches typical folders.
            // Simple heuristic: take everything before the last 2 segments if possible, else before last 1.
            // But we know our token structure is "Name/Shade". 
            // So anything before "Name/Shade" is the target folder.

            // Let's just list unique root folders.
            const root = parts[0];
            prefixes.add(root);
          }
        });

        const options = Array.from(prefixes).map(p => ({ label: p, value: p }));
        // Add option for Root
        options.unshift({ label: '(Root)', value: '' });

        figma.ui.postMessage({ type: 'target-options-response', targetType: 'styles', options });
      } catch (e) {
        figma.notify("Error fetching styles");
      }
    }
  }

  if (msg.type === 'create-color-styles') {
    const { palettes, action, targetId } = msg; // targetId is the folder prefix for styles if update/target selected
    let count = 0;

    try {
      const existingStyles = await figma.getLocalPaintStylesAsync();
      const styleMap = new Map(existingStyles.map(s => [s.name, s]));

      let folderPrefix = '';
      if (action === 'create') {
        const timestamp = new Date().toLocaleString('en-GB', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' });
        folderPrefix = `ProColors (${timestamp})/`;
      } else if (action === 'update') {
        folderPrefix = targetId ? (targetId.endsWith('/') ? targetId : `${targetId}/`) : '';
        if (targetId === '') folderPrefix = ''; // Root
      }

      for (const [groupName, tokens] of Object.entries(palettes)) {
        // @ts-ignore
        for (const token of tokens) {
          const baseName = `${groupName}/${token.shade}`;
          const finalName = folderPrefix + baseName;

          let style;

          // Try to find existing style by exact name
          style = styleMap.get(finalName);

          // If updating and not found, maybe user meant to create it in that folder?
          // Or maybe the folder structure is different. 
          // Let's strictly follow creation/update logic. 
          // If update mode: find exact style. If not found, create it in that location.

          if (!style) {
            style = figma.createPaintStyle();
            style.name = finalName;
            styleMap.set(finalName, style);
          }

          const { r, g, b } = hexToRgb(token.value);

          style.paints = [{
            type: 'SOLID',
            color: { r, g, b }
          }];

          style.description = `Generated by ProColors. Value: ${token.value}`;
          count++;
        }
      }

      figma.notify(`Success! ${action === 'create' ? 'Created new' : 'Updated'} ${count} color styles.`);
    } catch (err: any) {
      console.error("ProColors Error:", err);
      figma.notify(`Error creating styles: ${err.message}`);
    }
  }

  if (msg.type === 'create-color-variables') {
    if (!figma.variables) {
      figma.notify("Error: Variables API is not available in this file.");
      return;
    }

    const { palettes, action, targetId, variableType, collectionId, brandName, namingConvention, customNamingPattern } = msg;
    let count = 0;
    let errorCount = 0;

    try {
      const collections = await figma.variables.getLocalVariableCollectionsAsync();
      let collection;
      let sourceCollection; // For alias and component types

      // Use brand name if provided, otherwise fallback to "ProColors Token"
      const baseCollectionName = brandName && brandName.trim() ? `${brandName.trim()} Token` : "ProColors Token";

      if (action === 'create') {
        if (variableType === 'collection') {
          // Create new collection
          const timestamp = new Date().toLocaleString('en-GB', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' });
          collection = figma.variables.createVariableCollection(`${baseCollectionName} (${timestamp})`);
        } else if (variableType === 'alias' || variableType === 'component') {
          // For alias and component, add to the selected collection (same collection)
          if (!collectionId) {
            figma.notify("Error: No collection selected. Please select a collection to add variables to.");
            return;
          }
          // Use the selected collection (add alias/component variables to it)
          collection = collections.find(c => c.id === collectionId);
          if (!collection) {
            figma.notify("Error: Selected collection not found.");
            return;
          }
        } else {
          // Default: create new collection (backward compatibility)
          const timestamp = new Date().toLocaleString('en-GB', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' });
          collection = figma.variables.createVariableCollection(`${baseCollectionName} (${timestamp})`);
        }
      } else if (action === 'update') {
        if (targetId) {
          collection = collections.find(c => c.id === targetId);
        }

        // Fallback if not found or no target
        if (!collection) {
          collection = collections.find(c => c.name === baseCollectionName);
        }

        if (!collection) {
          const timestamp = new Date().toLocaleString('en-GB', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' });
          collection = figma.variables.createVariableCollection(`${baseCollectionName} (${timestamp})`);
        }
      }

      if (!collection) throw new Error("Could not determine variable collection.");

      const modeId = collection.modes[0].modeId;
      const allVariables = await figma.variables.getLocalVariablesAsync();
      const collectionVars = allVariables.filter(v => v.variableCollectionId === collection!.id);
      const varMap = new Map(collectionVars.map(v => [v.name, v]));

      // For alias and component, get source variables from the same collection
      // Source variables are the regular ones (groupName/shade format)
      let sourceVarMap = new Map();
      if (variableType === 'alias' || variableType === 'component') {
        // Source variables are in the same collection, using regular naming (groupName/shade)
        const collectionVars = allVariables.filter(v => v.variableCollectionId === collection!.id);
        sourceVarMap = new Map(collectionVars.map(v => [v.name, v]));
      }

      for (const [groupName, tokens] of Object.entries(palettes)) {
        // @ts-ignore
        for (const token of tokens) {
          let name: string;

          if (variableType === 'component') {
            // Component tokens use semantic names (Primary, On Primary, etc.)
            // Group them under Component: Component/primary/Primary
            const semanticName = getComponentTokenName(groupName, token.shade);
            name = `Component/${groupName}/${semanticName}`;
          } else if (variableType === 'alias') {
            // Alias variables use naming convention
            // Group them under Alias: Alias/primary/Primary-100
            const formattedShade = formatShadeName(groupName, token.shade, namingConvention, customNamingPattern);
            name = `Alias/${groupName}/${formattedShade}`;
          } else {
            // Regular variables use numeric shade
            // Group them under Base Tokens: Base Tokens/primary/100
            name = `Base Tokens/${groupName}/${token.shade}`;
          }

          try {
            let variable = varMap.get(name);

            if (variableType === 'alias') {
              // Create alias variable - source uses numeric shade from regular group
              const sourceVarName = `Base Tokens/${groupName}/${token.shade}`;
              const sourceVariable = sourceVarMap.get(sourceVarName);

              if (!sourceVariable) {
                console.warn(`Source variable ${sourceVarName} not found, creating new variable instead.`);
                const { r, g, b } = hexToRgb(token.value);
                const colorValue = { r, g, b, a: 1 };

                if (!variable) {
                  // @ts-ignore
                  variable = figma.variables.createVariable(name, collection, "COLOR");
                  varMap.set(name, variable);
                }
                variable.setValueForMode(modeId, colorValue);
              } else {
                // Create alias
                if (!variable) {
                  // @ts-ignore
                  variable = figma.variables.createVariable(name, collection, "COLOR");
                  varMap.set(name, variable);
                }
                // Set alias value
                variable.setValueForMode(modeId, { type: "VARIABLE_ALIAS", id: sourceVariable.id });
              }
            } else if (variableType === 'component') {
              // Create component token variable with semantic names (Primary, On Primary, etc.)
              // Source uses numeric shade from regular group like Base Tokens/primary/100
              const sourceVarName = `Base Tokens/${groupName}/${token.shade}`;
              const sourceVariable = sourceVarMap.get(sourceVarName);

              if (!sourceVariable) {
                console.warn(`Source variable ${sourceVarName} not found in collection. Creating new variable instead.`);
                const { r, g, b } = hexToRgb(token.value);
                const colorValue = { r, g, b, a: 1 };

                if (!variable) {
                  // @ts-ignore
                  variable = figma.variables.createVariable(name, collection, "COLOR");
                  varMap.set(name, variable);
                }
                variable.setValueForMode(modeId, colorValue);
              } else {
                // Create component token (alias to source)
                if (!variable) {
                  // @ts-ignore
                  variable = figma.variables.createVariable(name, collection, "COLOR");
                  varMap.set(name, variable);
                }
                // Set alias value
                variable.setValueForMode(modeId, { type: "VARIABLE_ALIAS", id: sourceVariable.id });
              }
            } else {
              // Regular variable creation
              const { r, g, b } = hexToRgb(token.value);
              const colorValue = { r, g, b, a: 1 };

              if (!variable) {
                // @ts-ignore
                variable = figma.variables.createVariable(name, collection, "COLOR");
                varMap.set(name, variable);
              }

              variable.setValueForMode(modeId, colorValue);
            }

            count++;
          } catch (innerErr) {
            console.error(`Failed to create variable ${name}:`, innerErr);
            errorCount++;
          }
        }
      }

      if (errorCount > 0) {
        figma.notify(`Processed ${count} variables. Failed: ${errorCount}. Check console.`);
      } else {
        const typeLabel = variableType === 'alias' ? 'alias' : variableType === 'component' ? 'component token' : '';
        figma.notify(`Success! ${action === 'create' ? 'Created new' : 'Updated'} ${count} ${typeLabel} variables in "${collection.name}".`);
      }
    } catch (err: any) {
      console.error("Magic Color Error:", err);
      figma.notify(`Error: ${err.message || "Unknown error"}`);
    }
  }

  if (msg.type === 'create-mesh-variables') {
    if (!figma.variables) {
      figma.notify("Error: Variables API not available.");
      return;
    }
    const { colors, name } = msg;
    try {
      const collections = await figma.variables.getLocalVariableCollectionsAsync();
      let collection = collections.find(c => c.name === "Mesh Studio Colors");
      if (!collection) collection = figma.variables.createVariableCollection("Mesh Studio Colors");

      const modeId = collection.modes[0].modeId;
      const allVars = await figma.variables.getLocalVariablesAsync();
      const collectionVars = allVars.filter(v => v.variableCollectionId === collection!.id);
      const varMap = new Map(collectionVars.map(v => [v.name, v]));

      for (let i = 0; i < colors.length; i++) {
        const varName = `${name || 'Mesh'}/Point ${i + 1}`;
        let variable = varMap.get(varName);
        if (!variable) {
          // @ts-ignore
          variable = figma.variables.createVariable(varName, collection, "COLOR");
        }

        const { r, g, b } = hexToRgb(colors[i]);
        variable.setValueForMode(modeId, { r, g, b, a: 1 });
      }
      figma.notify(`Success! Synced ${colors.length} mesh colors to "Mesh Studio Colors" collection.`);
    } catch (e: any) {
      figma.notify(`Error syncing variables: ${e.message}`);
    }
  }

  if (msg.type === 'get-collections-for-theme') {
    if (!figma.variables) {
      figma.ui.postMessage({ type: 'collections-response', collections: [] });
      return;
    }

    try {
      const collections = await figma.variables.getLocalVariableCollectionsAsync();
      const collectionList = collections.map(c => ({ id: c.id, name: c.name }));
      figma.ui.postMessage({ type: 'collections-response', collections: collectionList });
    } catch (err: any) {
      console.error('Error fetching collections:', err);
      figma.ui.postMessage({ type: 'collections-response', collections: [] });
    }
  }

  if (msg.type === 'create-theme-variable') {
    if (!figma.variables) {
      figma.notify("Error: Variables API is not available in this file.");
      return;
    }

    const { theme, palettes, collectionId } = msg;
    console.log('Creating theme variables for theme:', theme, 'collectionId:', collectionId);

    if (!palettes || Object.keys(palettes).length === 0) {
      figma.notify("Error: No palettes provided.");
      return;
    }

    if (!collectionId) {
      figma.notify("Error: No collection selected.");
      return;
    }

    let count = 0;
    let errorCount = 0;

    try {
      const collections = await figma.variables.getLocalVariableCollectionsAsync();
      const collection = collections.find(c => c.id === collectionId);

      if (!collection) {
        figma.notify("Error: Collection not found.");
        return;
      }

      // Check if mode with this theme name already exists
      console.log('Available modes before:', collection.modes.map(m => ({ name: m.name, id: m.modeId })));
      console.log('Looking for theme:', theme);

      // Find mode by exact name match (case-insensitive)
      let modeId = collection.modes.find(m => {
        const modeName = m.name.toLowerCase().trim();
        const themeName = theme.toLowerCase().trim();
        const match = modeName === themeName;
        console.log(`Comparing mode "${m.name}" (${modeName}) with theme "${theme}" (${themeName}): ${match}`);
        return match;
      })?.modeId;

      if (!modeId) {
        // Create new mode for this theme
        try {
          console.log(`Creating new mode: ${theme}`);
          // @ts-ignore - addMode might not be in types yet
          const newMode = collection.addMode(theme);
          modeId = newMode.modeId;
          console.log(`Created mode "${theme}" with ID: ${modeId}`);

          // Refresh collection to get updated modes list
          const updatedCollections = await figma.variables.getLocalVariableCollectionsAsync();
          const updatedCollection = updatedCollections.find(c => c.id === collectionId);
          if (updatedCollection) {
            console.log('Updated modes after creation:', updatedCollection.modes.map(m => ({ name: m.name, id: m.modeId })));
          }
        } catch (modeErr: any) {
          console.error('Error creating mode:', modeErr);
          figma.notify(`Error: Could not create new mode. ${modeErr.message}`);
          return;
        }
      } else {
        const foundMode = collection.modes.find(m => m.modeId === modeId);
        console.log(`Using existing mode "${foundMode?.name}" (ID: ${modeId}) for theme "${theme}"`);
      }

      console.log(`Final modeId for theme "${theme}": ${modeId}`);
      const allVariables = await figma.variables.getLocalVariablesAsync();
      const collectionVars = allVariables.filter(v => v.variableCollectionId === collection.id && v.resolvedType === 'COLOR');
      
      console.log(`Found ${collectionVars.length} color variables in collection "${collection.name}"`);
      console.log('Variable names:', collectionVars.map(v => v.name));

      // Build a map to find variables by their shade pattern
      // Variables could be named: "primary/500", "Base Tokens/primary/500", "colors/primary/500", etc.
      const findVariableForShade = (groupName: string, shade: number): Variable | null => {
        // Try exact match first
        const exactMatch = collectionVars.find(v => v.name === `${groupName}/${shade}`);
        if (exactMatch) return exactMatch;

        // Try to find by pattern: ends with "groupName/shade" or contains "/groupName/shade"
        const pattern1 = `${groupName}/${shade}`;
        const pattern2 = `/${groupName}/${shade}`;
        
        const partialMatch = collectionVars.find(v => 
          v.name.endsWith(pattern1) || v.name.includes(pattern2)
        );
        if (partialMatch) return partialMatch;

        // Try case-insensitive match
        const lowerGroup = groupName.toLowerCase();
        const caseInsensitiveMatch = collectionVars.find(v => {
          const lowerName = v.name.toLowerCase();
          return lowerName.endsWith(`${lowerGroup}/${shade}`) || 
                 lowerName.includes(`/${lowerGroup}/${shade}`);
        });
        
        return caseInsensitiveMatch || null;
      };

      // Only update existing variables - DO NOT create new ones
      for (const [groupName, tokens] of Object.entries(palettes)) {
        if (!Array.isArray(tokens)) {
          console.warn(`Skipping ${groupName}: not an array`, tokens);
          continue;
        }

        // @ts-ignore
        for (const token of tokens) {
          if (!token || !token.shade || !token.value) {
            console.warn(`Skipping invalid token in ${groupName}:`, token);
            continue;
          }

          try {
            // Find existing variable for this shade
            const variable = findVariableForShade(groupName, token.shade);

            if (!variable) {
              console.log(`No existing variable found for ${groupName}/${token.shade}, skipping (not creating new)`);
              continue;
            }

            // Get theme-appropriate color (inverted shade for dark themes)
            const themeColor = getColorForTheme(palettes, groupName, token.shade, theme);

            if (!themeColor) {
              console.warn(`Could not get theme color for ${variable.name} in theme ${theme}`);
              continue;
            }

            console.log(`Updating ${variable.name}: shade ${token.shade} -> Theme ${theme} color ${themeColor}`);
            const { r, g, b } = hexToRgb(themeColor);
            const colorValue = { r, g, b, a: 1 };

            // Set the value for this specific mode
            variable.setValueForMode(modeId, colorValue);
            count++;
          } catch (innerErr) {
            console.error(`Failed to update variable for ${groupName}/${token.shade}:`, innerErr);
            errorCount++;
          }
        }
      }

      if (count === 0) {
        figma.notify(`No matching variables found in "${collection.name}". Make sure variable names match your palette groups.`);
      } else if (errorCount > 0) {
        figma.notify(`Updated ${count} variables for "${theme}" theme. Failed: ${errorCount}. Check console.`);
      } else {
        figma.notify(`Success! Added "${theme}" theme mode with ${count} updated variables to "${collection.name}".`);
      }
    } catch (err: any) {
      console.error("Magic Color Error creating theme variables:", err);
      figma.notify(`Error: ${err.message || "Unknown error"}`);
    }
  }

  if (msg.type === 'create-gradient-style') {
    const { gradient } = msg;
    try {
      const name = `gradient/${gradient.type}/${gradient.name.toLowerCase().replace(/\s+/g, '-')}`;
      const existingStyles = await figma.getLocalPaintStylesAsync();
      let style = existingStyles.find(s => s.name === name);

      if (!style) {
        style = figma.createPaintStyle();
        style.name = name;
      }

      const gradientStops = gradient.stops.map((s: any) => {
        const { r, g, b } = hexToRgb(s.color);
        const c = (chroma as any).default || chroma;
        const alpha = c(s.color).alpha();

        return {
          color: { r, g, b, a: alpha },
          position: s.position / 100
        };
      });

      let transform: Transform = [[1, 0, 0], [0, 1, 0]];

      if (gradient.type === 'linear') {
        const rad = (gradient.angle || 180) * (Math.PI / 180);
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        transform = [
          [cos, sin, 0],
          [-sin, cos, 0]
        ];
      }

      style.paints = [{
        type: gradient.type === 'linear' ? 'GRADIENT_LINEAR' :
          gradient.type === 'radial' ? 'GRADIENT_RADIAL' :
            'GRADIENT_ANGULAR',
        gradientStops,
        gradientTransform: transform
      }];

      figma.notify(`Created gradient style: ${name}`);
    } catch (err: any) {
      console.error(err);
      figma.notify(`Error creating gradient: ${err.message}`);
    }
  }

  if (msg.type === 'create-gradient-variables') {
    if (!figma.variables) {
      figma.notify("Error: Variables API not available.");
      return;
    }

    const { gradient } = msg;
    const baseName = `gradient/${gradient.type}/${gradient.name.toLowerCase().replace(/\s+/g, '-')}`;

    try {
      const collections = await figma.variables.getLocalVariableCollectionsAsync();
      let collection = collections.find(c => c.name === "ProColorsGradients");
      if (!collection) collection = figma.variables.createVariableCollection("ProColorsGradients");

      const modeId = collection.modes[0].modeId;

      let count = 0;
      for (let i = 0; i < gradient.stops.length; i++) {
        const stop = gradient.stops[i];
        const varName = `${baseName}/stop-${i}-${stop.position}`;

        const allVars = await figma.variables.getLocalVariablesAsync();
        let variable = allVars.find(v => v.name === varName && v.variableCollectionId === collection!.id);

        if (!variable) {
          // @ts-ignore
          variable = figma.variables.createVariable(varName, collection, "COLOR");
        }

        const { r, g, b } = hexToRgb(stop.color);
        variable!.setValueForMode(modeId, { r, g, b, a: 1 });
        count++;
      }

      figma.notify(`Created ${count} variables for gradient stops.`);
    } catch (err: any) {
      console.error(err);
      figma.notify(`Error creating variables: ${err.message}`);
    }
  }

  // Fetch available collections and style groups for selection
  if (msg.type === 'get-export-options') {
    try {
      const styles = await figma.getLocalPaintStylesAsync();
      const collections = figma.variables ? await figma.variables.getLocalVariableCollectionsAsync() : [];

      // Extract style groups (root folders)
      const styleGroups = new Set<string>();
      styles.forEach(s => {
        if (s.name.includes('/')) {
          const parts = s.name.split('/');
          styleGroups.add(parts[0]);
        } else {
          styleGroups.add('(Root)');
        }
      });

      figma.ui.postMessage({
        type: 'export-options-response',
        collections: collections.map(c => ({ id: c.id, name: c.name })),
        styleGroups: Array.from(styleGroups)
      });
    } catch (err: any) {
      console.error(err);
      figma.ui.postMessage({
        type: 'export-options-response',
        collections: [],
        styleGroups: []
      });
    }
  }

  // === NEW: Export Data Handler ===
  if (msg.type === 'export-all-data') {
    try {
      const { selectedCollectionIds = [], selectedStyleGroups = [] } = msg;
      const styles = await figma.getLocalPaintStylesAsync();
      const variables = await figma.variables.getLocalVariablesAsync();
      const collections = await figma.variables.getLocalVariableCollectionsAsync();

      // Filter variables by selected collections
      let filteredVariables = variables;
      if (selectedCollectionIds.length > 0) {
        filteredVariables = variables.filter(v =>
          selectedCollectionIds.includes(v.variableCollectionId)
        );
      }

      // Filter styles by selected groups
      let filteredStyles = styles;
      if (selectedStyleGroups.length > 0) {
        filteredStyles = styles.filter(s => {
          if (s.name.includes('/')) {
            const rootGroup = s.name.split('/')[0];
            return selectedStyleGroups.includes(rootGroup);
          } else {
            return selectedStyleGroups.includes('(Root)');
          }
        });
      }

      const exportData = {
        variables: filteredVariables.map(v => {
          const col = collections.find(c => c.id === v.variableCollectionId);
          // Get value for first mode as a simplified export
          const modeId = col?.modes[0].modeId;
          const value = modeId ? v.valuesByMode[modeId] : null;
          let resolvedValue = value;

          // Convert RGB objects to hex strings for portability
          if (value && typeof value === 'object' && 'r' in value) {
            // @ts-ignore
            resolvedValue = rgbToHex(value.r, value.g, value.b);
          }

          return {
            name: v.name,
            type: v.resolvedType,
            collection: col?.name || 'Unknown',
            value: resolvedValue
          };
        }),
        styles: filteredStyles.map(s => {
          let paintValue = null;
          if (s.paints.length > 0 && s.paints[0].type === 'SOLID') {
            const { r, g, b } = s.paints[0].color;
            paintValue = rgbToHex(r, g, b);
          }
          return {
            name: s.name,
            description: s.description,
            type: s.paints[0]?.type || 'SOLID',
            value: paintValue
          };
        })
      };

      figma.ui.postMessage({
        type: 'export-data-success',
        data: exportData,
        fileName: figma.root.name
      });
    } catch (err: any) {
      console.error(err);
      figma.notify("Export failed: " + err.message);
    }
  }

  // === NEW: Import Data Handler ===
  if (msg.type === 'import-data') {
    const { data } = msg;
    try {
      let varCount = 0;
      let styleCount = 0;

      // Import Variables
      if (data.variables && data.variables.length > 0 && figma.variables) {
        const collections = await figma.variables.getLocalVariableCollectionsAsync();
        let collection = collections.find(c => c.name === "ProColors Imported");
        if (!collection) collection = figma.variables.createVariableCollection("ProColors Imported");
        const modeId = collection.modes[0].modeId;

        const existingVars = await figma.variables.getLocalVariablesAsync();

        for (const v of data.variables) {
          if (v.type === 'COLOR' && v.value) {
            let variable = existingVars.find(ev => ev.name === v.name && ev.variableCollectionId === collection!.id);
            if (!variable) {
              // @ts-ignore
              variable = figma.variables.createVariable(v.name, collection, "COLOR");
            }

            try {
              const { r, g, b } = hexToRgb(v.value);
              variable!.setValueForMode(modeId, { r, g, b, a: 1 });
              varCount++;
            } catch (e) {
              // Skip invalid colors
            }
          }
        }
      }

      // Import Styles
      if (data.styles && data.styles.length > 0) {
        const existingStyles = await figma.getLocalPaintStylesAsync();

        for (const s of data.styles) {
          if (s.type === 'SOLID' && s.value) {
            let style = existingStyles.find(es => es.name === s.name);
            if (!style) {
              style = figma.createPaintStyle();
              style.name = s.name;
            }

            const { r, g, b } = hexToRgb(s.value);
            style.paints = [{ type: 'SOLID', color: { r, g, b } }];
            style.description = s.description || 'Imported by ProColors';
            styleCount++;
          }
        }
      }

      figma.notify(`Imported: ${varCount} variables, ${styleCount} styles.`);
      figma.ui.postMessage({ type: 'import-data-finished' });

    } catch (err: any) {
      console.error(err);
      figma.notify("Import failed: " + err.message);
      figma.ui.postMessage({ type: 'import-data-finished' });
    }
  }

  if (msg.type === 'replace-colors') {
  }

  // --- MESH STUDIO VARIABLE IMPORT ---
  if (msg.type === 'get-mesh-variable-collections') {
    if (!figma.variables) {
      figma.ui.postMessage({ type: 'mesh-variable-collections-response', collections: [] });
      return;
    }
    try {
      const collections = await figma.variables.getLocalVariableCollectionsAsync();
      const collectionList = collections.map(c => ({ id: c.id, name: c.name }));
      figma.ui.postMessage({ type: 'mesh-variable-collections-response', collections: collectionList });
    } catch (err: any) {
      console.error('Error fetching collections for mesh:', err);
      figma.ui.postMessage({ type: 'mesh-variable-collections-response', collections: [] });
    }
  }

  if (msg.type === 'get-mesh-variables-from-collection') {
    if (!figma.variables) return;
    const { collectionId } = msg;
    try {
      const collection = await figma.variables.getVariableCollectionByIdAsync(collectionId);
      if (!collection) {
        figma.notify("Collection not found");
        return;
      }

      const modeId = collection.modes[0].modeId;
      const allVariables = await figma.variables.getLocalVariablesAsync();
      const collectionVars = allVariables.filter(v => v.variableCollectionId === collectionId && v.resolvedType === 'COLOR');

      const colors = collectionVars.map(v => {
        const value = v.valuesByMode[modeId];
        if (value && typeof value === 'object' && 'r' in value) {
          // @ts-ignore
          return rgbToHex(value.r, value.g, value.b);
        }
        return null;
      }).filter(c => c !== null) as string[];

      figma.ui.postMessage({ type: 'mesh-variables-response', colors });
    } catch (err: any) {
      console.error('Error fetching variables for mesh:', err);
      figma.notify("Error fetching variables");
    }
  }

  if (msg.type === 'replace-colors') {
    const { scope, target } = msg;

    let nodes: SceneNode[] = [];
    if (scope === 'selection') {
      nodes = [...figma.currentPage.selection];
    } else {
      nodes = [...figma.currentPage.children];
    }

    let count = 0;

    function traverse(node: SceneNode) {
      if ('fills' in node && (target === 'all' || target === 'solid')) {
        // Placeholder
      }

      if ('children' in node) {
        for (const child of node.children) {
          traverse(child);
        }
      }
      count++;
    }

    nodes.forEach(traverse);
    figma.notify(`Scanned ${count} nodes. Color replacement requires active palette mapping (Not fully implemented in MVP).`);
  }

  if (msg.type === 'link-colors') {
    try {
      const { scope, preference, threshold } = msg;
      const matchThreshold = threshold !== undefined ? threshold : 10; // Default to 10 if not provided

      if (scope === 'selection' || !scope) {
        const selection = figma.currentPage.selection;

        if (selection.length === 0) {
          figma.ui.postMessage({
            type: 'link-colors-error',
            error: 'Please select a frame or component to begin.'
          });
          return;
        }

        const result = await linkColorsInSelection(selection, preference, matchThreshold);

        // Log summary for debugging
        console.log(`Linking complete: ${result.totalReplaced} of ${result.totalScanned} colors replaced`);

        // Show notification with results
        if (result.totalReplaced > 0) {
          figma.notify(`✓ Successfully linked ${result.totalReplaced} colors to ${preference || 'variables/styles'}`);
        } else if (result.totalScanned > 0) {
          const failedResults = result.results.filter(r => !r.success);
          const errorCounts: Record<string, number> = {};
          failedResults.forEach(r => {
            const error = r.error || 'Unknown error';
            errorCounts[error] = (errorCounts[error] || 0) + 1;
          });
          const topError = Object.entries(errorCounts).sort((a, b) => b[1] - a[1])[0];
          const errorMsg = topError ? topError[0] : 'Unknown';

          // Provide more helpful error message
          let userMessage = `⚠ Linked 0 colors. Issue: ${errorMsg}`;
          if (errorMsg.includes('Failed to apply variable')) {
            userMessage += '. Make sure variables are local (not remote) and you have edit access.';
          }

          figma.notify(userMessage);
          console.error('Failed replacements:', failedResults.slice(0, 10));
          console.error('Error breakdown:', errorCounts);
        } else {
          figma.notify('No unlinked colors found in selection');
        }

        figma.ui.postMessage({
          type: 'link-colors-result',
          result
        });
      } else if (scope === 'page') {
        const matchThreshold = threshold !== undefined ? threshold : 10; // Default to 10 if not provided
        const result = await linkColorsInPage(figma.currentPage, preference, matchThreshold);

        figma.ui.postMessage({
          type: 'link-colors-result',
          result
        });
      }
    } catch (err: any) {
      console.error('Error linking colors:', err);
      figma.ui.postMessage({
        type: 'link-colors-error',
        error: err.message || 'Unknown error occurred'
      });
    }
  }

  if (msg.type === 'undo-linking') {
    try {
      const { undoStates } = msg;
      await undoLinking(undoStates);
      figma.notify('Changes undone successfully');
    } catch (err: any) {
      console.error('Error undoing linking:', err);
      figma.notify(`Error undoing: ${err.message || 'Unknown error'}`);
    }
  }

  if (msg.type === 'add-palette-to-canvas') {
    const { palettes } = msg;
    try {
      // Load fonts
      await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
      await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });

      const swatchSize = 80;
      const gap = 12;
      const rowGap = 16;

      // Create main container frame with vertical auto layout
      const mainFrame = figma.createFrame();
      mainFrame.name = "ProColorTokens";
      // Add light gray background color
      mainFrame.fills = [{ type: 'SOLID', color: { r: 0.97, g: 0.97, b: 0.98 } }]; // #F7F7FA
      mainFrame.layoutMode = "VERTICAL";
      mainFrame.primaryAxisSizingMode = "AUTO";
      mainFrame.counterAxisSizingMode = "AUTO";
      mainFrame.paddingLeft = 24;
      mainFrame.paddingRight = 24;
      mainFrame.paddingTop = 24;
      mainFrame.paddingBottom = 24;
      mainFrame.itemSpacing = 16;
      mainFrame.counterAxisAlignItems = "MIN";

      // Add title
      const titleText = figma.createText();
      titleText.characters = "ProColorTokens";
      titleText.fontSize = 24;
      titleText.fontName = { family: 'Inter', style: 'Bold' };
      titleText.resize(400, 32);
      mainFrame.appendChild(titleText);

      // Add subtitle
      const subtitleText = figma.createText();
      subtitleText.characters = "Color palette generate with ProColors plugin.";
      subtitleText.fontSize = 14;
      subtitleText.fontName = { family: 'Inter', style: 'Regular' };
      subtitleText.resize(400, 20);
      mainFrame.appendChild(subtitleText);

      // Create grid container for all color rows
      const gridFrame = figma.createFrame();
      gridFrame.name = "Color Grid";
      gridFrame.fills = [];
      gridFrame.layoutMode = "VERTICAL";
      gridFrame.primaryAxisSizingMode = "AUTO";
      gridFrame.counterAxisSizingMode = "AUTO";
      gridFrame.paddingLeft = 0;
      gridFrame.paddingRight = 0;
      gridFrame.paddingTop = 0;
      gridFrame.paddingBottom = 0;
      gridFrame.itemSpacing = rowGap;
      gridFrame.counterAxisAlignItems = "MIN";
      mainFrame.appendChild(gridFrame);

      // Sort palette entries to ensure consistent order
      const sortedPalettes = Object.entries(palettes).sort(([a], [b]) => {
        const order = ['primary', 'secondary', 'neutral', 'success', 'warning', 'error', 'info'];
        const indexA = order.indexOf(a.toLowerCase());
        const indexB = order.indexOf(b.toLowerCase());
        if (indexA === -1 && indexB === -1) return a.localeCompare(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });

      // Create a row for each color group
      for (const [groupName, tokens] of sortedPalettes) {
        // Create group container frame with vertical auto layout
        const groupFrame = figma.createFrame();
        groupFrame.name = `${groupName} Group`;
        groupFrame.fills = [];
        groupFrame.layoutMode = "VERTICAL";
        groupFrame.primaryAxisSizingMode = "AUTO";
        groupFrame.counterAxisSizingMode = "AUTO";
        groupFrame.paddingLeft = 0;
        groupFrame.paddingRight = 0;
        groupFrame.paddingTop = 0;
        groupFrame.paddingBottom = 0;
        groupFrame.itemSpacing = 12;
        groupFrame.counterAxisAlignItems = "MIN";
        gridFrame.appendChild(groupFrame);

        // Add group label
        try {
          const groupLabel = figma.createText();
          const capitalizedName = groupName.charAt(0).toUpperCase() + groupName.slice(1);
          groupLabel.characters = capitalizedName;
          groupLabel.fontSize = 16;
          groupLabel.fontName = { family: 'Inter', style: 'Bold' };
          groupLabel.resize(200, 22);
          groupLabel.fills = [{ type: 'SOLID', color: { r: 0.12, g: 0.12, b: 0.12 } }]; // Dark gray text
          groupFrame.appendChild(groupLabel);
        } catch (e) {
          // Font loading failed, skip label
        }

        // Create row frame with horizontal auto layout
        const rowFrame = figma.createFrame();
        rowFrame.name = groupName;
        rowFrame.fills = [];
        rowFrame.layoutMode = "HORIZONTAL";
        rowFrame.primaryAxisSizingMode = "AUTO";
        rowFrame.counterAxisSizingMode = "AUTO";
        rowFrame.paddingLeft = 0;
        rowFrame.paddingRight = 0;
        rowFrame.paddingTop = 0;
        rowFrame.paddingBottom = 0;
        rowFrame.itemSpacing = gap;
        rowFrame.counterAxisAlignItems = "CENTER";
        groupFrame.appendChild(rowFrame);

        // Sort tokens by shade number
        const sortedTokens = [...tokens].sort((a, b) => {
          const shadeA = typeof a.shade === 'number' ? a.shade : parseInt(a.shade.toString());
          const shadeB = typeof b.shade === 'number' ? b.shade : parseInt(b.shade.toString());
          return shadeA - shadeB;
        });

        // @ts-ignore
        for (const token of sortedTokens) {
          // Create swatch container with vertical auto layout
          const swatchFrame = figma.createFrame();
          swatchFrame.name = `${groupName}-${token.shade}`;
          swatchFrame.fills = [];
          swatchFrame.layoutMode = "VERTICAL";
          swatchFrame.primaryAxisSizingMode = "FIXED";
          swatchFrame.counterAxisSizingMode = "FIXED";
          swatchFrame.layoutGrow = 0;
          swatchFrame.paddingLeft = 0;
          swatchFrame.paddingRight = 0;
          swatchFrame.paddingTop = 0;
          swatchFrame.paddingBottom = 0;
          swatchFrame.itemSpacing = 6;
          swatchFrame.counterAxisAlignItems = "CENTER";
          swatchFrame.resize(swatchSize, swatchSize + 24);

          // Create rounded color rectangle
          const rect = figma.createRectangle();
          const { r, g, b } = hexToRgb(token.value);
          rect.fills = [{ type: 'SOLID', color: { r, g, b } }];
          rect.resize(swatchSize, swatchSize);
          rect.cornerRadius = 8; // Rounded corners
          swatchFrame.appendChild(rect);

          // Add label
          try {
            const text = figma.createText();
            text.characters = `${groupName}-${token.shade}`;
            text.fontSize = 11;
            text.fontName = { family: 'Inter', style: 'Regular' };
            text.resize(swatchSize, 18);
            text.textAlignHorizontal = "CENTER";
            swatchFrame.appendChild(text);
          } catch (e) {
            // Font loading failed, skip text
          }

          rowFrame.appendChild(swatchFrame);
        }
      }

      figma.currentPage.appendChild(mainFrame);

      // Select the main frame
      figma.currentPage.selection = [mainFrame];
      figma.viewport.scrollAndZoomIntoView([mainFrame]);

      const totalSwatches = Object.values(palettes).reduce((sum, tokens) => sum + tokens.length, 0);
      figma.notify(`Added color palette with ${Object.keys(palettes).length} groups (${totalSwatches} swatches) to canvas`);
    } catch (err: any) {
      console.error("Error adding palette to canvas:", err);
      figma.notify(`Error: ${err.message || "Failed to add palette to canvas"}`);
    }
  }

  if (msg.type === 'notify') {
    figma.notify(msg.message);
  }

  if (msg.type === 'fetch-webpage') {
    const { url } = msg;
    try {
      // Ensure URL has protocol
      let fullUrl = url.trim();
      if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
        fullUrl = 'https://' + fullUrl;
      }

      // Fetch the webpage HTML using Node.js fetch (no CORS restrictions)
      const response = await fetch(fullUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      figma.ui.postMessage({
        type: 'webpage-html-response',
        html,
        url: fullUrl
      });
    } catch (err: any) {
      console.error("Error fetching webpage:", err);
      figma.ui.postMessage({
        type: 'webpage-html-response',
        error: err.message || 'Failed to fetch webpage'
      });
    }
  }

  // === NEW: Explore Module Handlers ===
  if (msg.type === 'explore-add-variables') {
    if (!figma.variables) {
      figma.notify("Error: Variables API not available.");
      return;
    }

    const { palette } = msg;
    try {
      const collections = await figma.variables.getLocalVariableCollectionsAsync();
      let collection = collections.find(c => c.name === "Explore Palettes");

      if (!collection) {
        collection = figma.variables.createVariableCollection("Explore Palettes");
      }

      const modeId = collection.modes[0].modeId;
      const allVars = await figma.variables.getLocalVariablesAsync();
      let count = 0;

      for (let i = 0; i < palette.colors.length; i++) {
        const colorHex = palette.colors[i];
        // Naming convention: <palette-name>-<index>
        const varName = `${palette.name}-${i + 1}`;

        let variable = allVars.find(v => v.name === varName && v.variableCollectionId === collection!.id);

        if (!variable) {
          // @ts-ignore
          variable = figma.variables.createVariable(varName, collection, "COLOR");
        }

        const { r, g, b } = hexToRgb(colorHex);
        variable!.setValueForMode(modeId, { r, g, b, a: 1 });
        count++;
      }

      figma.notify(`Added ${count} variables to "Explore Palettes" collection.`);
    } catch (err: any) {
      console.error(err);
      figma.notify(`Error creating variables: ${err.message}`);
    }
  }

  if (msg.type === 'explore-add-styles') {
    const { palette } = msg;
    try {
      const existingStyles = await figma.getLocalPaintStylesAsync();
      let count = 0;

      for (let i = 0; i < palette.colors.length; i++) {
        const colorHex = palette.colors[i];
        // Naming convention: <palette-name>-<index>
        const styleName = `${palette.name}/${i + 1}`; // Using slash for better organization in Figma UI, but user said -1. I'll stick to -1 if strict, but / is better. 
        // User explicitly asked for <palette-name>-1. But "same naming logic" usually implies grouping in systems. 
        // Let's use hyphen as requested: <palette-name>-<index>
        // Wait, for styles, "Folder/Name" is standard. If I do "Ocean-1", it's top level.
        // I will use `Explore/${palette.name}/${i+1}` to keep it clean, OR strictly `${palette.name}-${i+1}`.
        // User requirement: "<palette-name>-1". I will follow that.
        const finalName = `${palette.name}-${i + 1}`;

        let style = existingStyles.find(s => s.name === finalName);
        if (!style) {
          style = figma.createPaintStyle();
          style.name = finalName;
        }

        const { r, g, b } = hexToRgb(colorHex);
        style.paints = [{
          type: 'SOLID',
          color: { r, g, b }
        }];
        count++;
      }

      figma.notify(`Created ${count} color styles.`);
    } catch (err: any) {
      console.error(err);
      figma.notify(`Error creating styles: ${err.message}`);
    }
  }

  // Settings storage handlers
  if (msg.type === 'save-settings') {
    try {
      const settings = (msg as any).settings;
      console.log('Saving settings to clientStorage:', settings);
      await figma.clientStorage.setAsync('procolors-settings', settings);
      console.log('Settings saved successfully to clientStorage');
      figma.ui.postMessage({ type: 'settings-saved', success: true });
    } catch (err: any) {
      console.error('Error saving settings:', err);
      figma.ui.postMessage({ type: 'settings-saved', success: false, error: err.message });
    }
  }

  if (msg.type === 'get-settings') {
    try {
      const settings = await figma.clientStorage.getAsync('procolors-settings');
      figma.ui.postMessage({ type: 'settings-loaded', settings: settings || null });
    } catch (err: any) {
      console.error('Error loading settings:', err);
      figma.ui.postMessage({ type: 'settings-loaded', settings: null, error: err.message });
    }
  }

  if (msg.type === 'clear-settings') {
    try {
      await figma.clientStorage.setAsync('procolors-settings', null);
      figma.ui.postMessage({ type: 'settings-cleared', success: true });
    } catch (err: any) {
      console.error('Error clearing settings:', err);
      figma.ui.postMessage({ type: 'settings-cleared', success: false, error: err.message });
    }
  }

  // Brand storage handlers
  if (msg.type === 'save-brands') {
    try {
      const brands = (msg as any).brands;
      console.log('Saving brands to clientStorage:', brands);
      await figma.clientStorage.setAsync('procolors-brands', brands);
      console.log('Brands saved successfully to clientStorage');
      figma.ui.postMessage({ type: 'brands-saved', success: true });
    } catch (err: any) {
      console.error('Error saving brands:', err);
      figma.ui.postMessage({ type: 'brands-saved', success: false, error: err.message });
    }
  }

  if (msg.type === 'get-brands') {
    try {
      const brands = await figma.clientStorage.getAsync('procolors-brands');
      figma.ui.postMessage({ type: 'brands-loaded', brands: brands || null });
    } catch (err: any) {
      console.error('Error loading brands:', err);
      figma.ui.postMessage({ type: 'brands-loaded', brands: null, error: err.message });
    }
  }

  if (msg.type === 'save-active-brand-id') {
    try {
      const brandId = (msg as any).brandId;
      console.log('Saving active brand ID to clientStorage:', brandId);
      await figma.clientStorage.setAsync('procolors-active-brand-id', brandId);
      console.log('Active brand ID saved successfully to clientStorage');
      figma.ui.postMessage({ type: 'active-brand-id-saved', success: true });
    } catch (err: any) {
      console.error('Error saving active brand ID:', err);
      figma.ui.postMessage({ type: 'active-brand-id-saved', success: false, error: err.message });
    }
  }

  if (msg.type === 'get-active-brand-id') {
    try {
      const brandId = await figma.clientStorage.getAsync('procolors-active-brand-id');
      figma.ui.postMessage({ type: 'active-brand-id-loaded', brandId: brandId || null });
    } catch (err: any) {
      console.error('Error loading active brand ID:', err);
      figma.ui.postMessage({ type: 'active-brand-id-loaded', brandId: null, error: err.message });
    }
  }

  // === NEW: Token Management Handlers ===

  // Scan colors in selection/page/file
  if (msg.type === 'scan-colors') {
    const { scope, threshold } = msg;
    try {
      let nodes: SceneNode[] = [];

      if (scope === 'selection') {
        nodes = [...figma.currentPage.selection];
        if (nodes.length === 0) {
          figma.ui.postMessage({
            type: 'scan-colors-result',
            colors: [],
            error: 'No selection found. Please select at least one element.'
          });
          return;
        }
      } else if (scope === 'page') {
        nodes = [...figma.currentPage.children];
        if (nodes.length === 0) {
          figma.ui.postMessage({
            type: 'scan-colors-result',
            colors: [],
            error: 'Current page is empty.'
          });
          return;
        }
      } else if (scope === 'file') {
        // Load all pages first (required for accessing children)
        console.log('Loading all pages...');
        await figma.loadAllPagesAsync();
        console.log('All pages loaded');

        // Get all pages
        figma.root.children.forEach(page => {
          if (page.type === 'PAGE') {
            nodes.push(...page.children);
          }
        });
        if (nodes.length === 0) {
          figma.ui.postMessage({
            type: 'scan-colors-result',
            colors: [],
            error: 'File is empty.'
          });
          return;
        }
      }

      const colorMap = new Map<string, { count: number; locations: string[] }>();

      function extractColors(node: SceneNode, path: string = '') {
        const nodePath = path ? `${path}/${node.name}` : node.name;

        if ('fills' in node && Array.isArray(node.fills)) {
          node.fills.forEach(fill => {
            if (fill.type === 'SOLID') {
              const hex = rgbToHex(fill.color.r, fill.color.g, fill.color.b);
              const existing = colorMap.get(hex);
              if (existing) {
                existing.count++;
                if (!existing.locations.includes(nodePath)) {
                  existing.locations.push(nodePath);
                }
              } else {
                colorMap.set(hex, { count: 1, locations: [nodePath] });
              }
            }
          });
        }

        if ('strokes' in node && Array.isArray(node.strokes)) {
          node.strokes.forEach(stroke => {
            if (stroke.type === 'SOLID') {
              const hex = rgbToHex(stroke.color.r, stroke.color.g, stroke.color.b);
              const existing = colorMap.get(hex);
              if (existing) {
                existing.count++;
                if (!existing.locations.includes(nodePath)) {
                  existing.locations.push(nodePath);
                }
              } else {
                colorMap.set(hex, { count: 1, locations: [nodePath] });
              }
            }
          });
        }

        if ('children' in node) {
          node.children.forEach(child => {
            extractColors(child, nodePath);
          });
        }
      }

      nodes.forEach(node => extractColors(node));

      const colors = Array.from(colorMap.entries()).map(([color, data]) => ({
        color,
        count: data.count,
        locations: data.locations.slice(0, 10) // Limit to 10 locations
      }));

      console.log('Sending scan-colors-result:', { colorsCount: colors.length });
      figma.ui.postMessage({ type: 'scan-colors-result', colors });
    } catch (err: any) {
      console.error('Error scanning colors:', err);
      figma.ui.postMessage({ type: 'scan-colors-result', colors: [], error: err.message });
    }
  }

  // Create semantic tokens as Figma variables
  if (msg.type === 'create-semantic-tokens') {
    console.log('=== CREATE SEMANTIC TOKENS HANDLER ===');
    console.log('Semantic tokens count:', msg.semanticTokens?.length);
    console.log('Collection ID:', msg.collectionId);

    if (!figma.variables) {
      console.error('Variables API not available');
      figma.notify("Error: Variables API is not available.");
      return;
    }

    const { semanticTokens, baseTokens, collectionId } = msg;
    let count = 0;
    let errorCount = 0;

    try {
      const collections = await figma.variables.getLocalVariableCollectionsAsync();
      console.log('Available collections:', collections.map(c => ({ id: c.id, name: c.name })));

      let collection = collections.find(c => c.id === collectionId);

      if (!collection) {
        console.error('Collection not found:', collectionId);
        figma.notify("Error: Collection not found.");
        return;
      }

      console.log('Using collection:', collection.name);

      const modeId = collection.modes[0].modeId;
      const allVariables = await figma.variables.getLocalVariablesAsync();
      const collectionVars = allVariables.filter(v => v.variableCollectionId === collection.id);
      const varMap = new Map(collectionVars.map(v => [v.name, v]));

      // Create base token map for aliasing
      const baseVarMap = new Map<string, Variable>();
      collectionVars.forEach(v => {
        if (v.name.startsWith('Base Tokens/')) {
          baseVarMap.set(v.name, v);
        }
      });

      for (const token of semanticTokens) {
        try {
          // Convert dots to slashes for Figma variable naming convention
          const varName = token.name.replace(/\./g, '/');
          console.log(`Creating token: "${token.name}" -> "${varName}"`);

          // Check if semantic token already exists
          let variable = varMap.get(varName);

          if (!variable) {
            // @ts-ignore
            variable = figma.variables.createVariable(varName, collection, "COLOR");
            varMap.set(varName, variable);
            console.log(`✓ Created variable: ${varName}`);
          } else {
            console.log(`Variable already exists: ${varName}`);
          }

          // Set value - either alias or direct value
          if (token.aliasTo) {
            const sourceVar = baseVarMap.get(token.aliasTo);
            if (sourceVar) {
              variable.setValueForMode(modeId, { type: "VARIABLE_ALIAS", id: sourceVar.id });
              console.log(`✓ Set alias for ${varName} to ${token.aliasTo}`);
            } else {
              console.warn(`Alias source not found: ${token.aliasTo}, using direct value`);
              // Fallback to direct value if alias not found
              if (token.value) {
                const { r, g, b } = hexToRgb(token.value);
                variable.setValueForMode(modeId, { r, g, b, a: 1 });
              }
            }
          } else if (token.value) {
            const { r, g, b } = hexToRgb(token.value);
            variable.setValueForMode(modeId, { r, g, b, a: 1 });
            console.log(`✓ Set direct value for ${varName}: ${token.value}`);
          }

          count++;
        } catch (innerErr: any) {
          console.error(`Failed to create semantic token ${token.name}:`, innerErr);
          console.error('Error details:', innerErr.message, innerErr.stack);
          errorCount++;
        }
      }

      console.log(`Completed: ${count} created, ${errorCount} failed`);

      if (errorCount > 0) {
        figma.notify(`Created ${count} semantic tokens. Failed: ${errorCount}.`);
      } else {
        figma.notify(`Success! Created ${count} semantic tokens.`);
      }
    } catch (err: any) {
      console.error("Error creating semantic tokens:", err);
      figma.notify(`Error: ${err.message || "Unknown error"}`);
    }
  }

  // Create token snapshot for versioning
  if (msg.type === 'create-token-snapshot') {
    const { tokens, semanticTokens, name, description } = msg;
    try {
      const snapshot = {
        id: `snapshot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        name: name || `Snapshot ${new Date().toLocaleString()}`,
        description,
        tokens,
        semanticTokens
      };

      // Store in clientStorage
      const snapshots = await figma.clientStorage.getAsync('token-snapshots') || [];
      snapshots.push(snapshot);
      await figma.clientStorage.setAsync('token-snapshots', snapshots);

      figma.ui.postMessage({ type: 'token-snapshot-created', snapshot });
      figma.notify(`Snapshot "${snapshot.name}" created successfully.`);
    } catch (err: any) {
      console.error('Error creating snapshot:', err);
      figma.ui.postMessage({ type: 'token-snapshot-error', error: err.message });
    }
  }

  // Get token snapshots
  if (msg.type === 'get-token-snapshots') {
    try {
      const snapshots = await figma.clientStorage.getAsync('token-snapshots') || [];
      figma.ui.postMessage({ type: 'token-snapshots-loaded', snapshots });
    } catch (err: any) {
      console.error('Error loading snapshots:', err);
      figma.ui.postMessage({ type: 'token-snapshots-loaded', snapshots: [] });
    }
  }

  // Create variables from extracted colors
  if (msg.type === 'create-variables-from-colors') {
    console.log('=== CREATE VARIABLES HANDLER CALLED ===');
    console.log('Received create-variables-from-colors request:', {
      colorsCount: msg.colors?.length,
      collectionId: msg.collectionId,
      createNewCollection: msg.createNewCollection,
      hasColors: !!msg.colors
    });

    // Execute async handler and ensure response is always sent
    // Use IIFE to handle async operations
    (async () => {
      let responseSent = false;

      const sendResponse = (response: any) => {
        if (responseSent) {
          console.warn('Response already sent, ignoring duplicate');
          return;
        }
        responseSent = true;
        console.log('Sending response:', response);
        figma.ui.postMessage(response);
      };

      // Set timeout to ensure we always send a response
      const timeoutId = setTimeout(() => {
        if (!responseSent) {
          console.error('Handler timeout - sending error response');
          sendResponse({
            type: 'create-variables-from-colors-result',
            success: false,
            error: 'Handler timeout - operation took too long'
          });
        }
      }, 25000); // 25 second timeout

      try {
        if (!figma.variables) {
          console.error('Variables API not available');
          sendResponse({
            type: 'create-variables-from-colors-result',
            success: false,
            error: 'Variables API is not available in this file.'
          });
          return;
        }

        if (!msg.colors || !Array.isArray(msg.colors) || msg.colors.length === 0) {
          console.error('No colors provided');
          sendResponse({
            type: 'create-variables-from-colors-result',
            success: false,
            error: 'No colors provided to create variables.'
          });
          return;
        }

        const { colors, collectionId, createNewCollection } = msg;
        let count = 0;
        let errorCount = 0;

        console.log('Getting collections...');
        const collections = await figma.variables.getLocalVariableCollectionsAsync();
        console.log('Found collections:', collections.length);
        let collection;

        // Determine which collection to use
        console.log('Collection decision:', { createNewCollection, collectionId, hasCollectionId: !!collectionId });

        if (createNewCollection || !collectionId || collectionId === null) {
          // Create new collection
          const timestamp = new Date().toLocaleString('en-GB', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' });
          console.log('Creating new collection...');
          try {
            collection = figma.variables.createVariableCollection(`Extracted Colors (${timestamp})`);
            console.log('✓ Created new collection:', collection.name, 'ID:', collection.id);
          } catch (createErr: any) {
            console.error('Failed to create collection:', createErr);
            throw new Error(`Failed to create collection: ${createErr.message}`);
          }
        } else if (collectionId) {
          // Use existing collection
          console.log('Looking for collection with ID:', collectionId);
          console.log('Available collections:', collections.map(c => ({ id: c.id, name: c.name })));
          collection = collections.find(c => c.id === collectionId);
          if (!collection) {
            console.error('Collection not found:', collectionId);
            sendResponse({
              type: 'create-variables-from-colors-result',
              success: false,
              error: `Selected collection not found.`
            });
            return;
          } else {
            console.log('✓ Using existing collection:', collection.name);
          }
        }

        if (!collection) {
          throw new Error("Could not determine variable collection.");
        }

        const modeId = collection.modes[0].modeId;
        console.log('Mode ID:', modeId);

        const allVariables = await figma.variables.getLocalVariablesAsync();
        const collectionVars = allVariables.filter(v => v.variableCollectionId === collection.id);
        const varMap = new Map(collectionVars.map(v => [v.name, v]));

        console.log(`Processing ${colors.length} colors...`);

        for (const colorData of colors) {
          try {
            const { color, name } = colorData;

            if (!color || !name) {
              console.error('Invalid color data:', colorData);
              errorCount++;
              continue;
            }

            console.log(`Creating variable: ${name} with color: ${color}`);

            // Check if variable already exists
            let variable = varMap.get(name);

            if (!variable) {
              try {
                // @ts-ignore
                variable = figma.variables.createVariable(name, collection, "COLOR");
                varMap.set(name, variable);
                console.log(`Created new variable: ${name}`);
              } catch (createErr: any) {
                console.error(`Error creating variable ${name}:`, createErr);
                throw createErr;
              }
            } else {
              console.log(`Variable already exists: ${name}, updating value`);
            }

            // Set color value
            try {
              const { r, g, b } = hexToRgb(color);
              const colorValue = { r, g, b, a: 1 };
              variable.setValueForMode(modeId, colorValue);
              console.log(`Set value for ${name}:`, colorValue);
              count++;
            } catch (setErr: any) {
              console.error(`Error setting value for ${name}:`, setErr);
              throw setErr;
            }
          } catch (innerErr: any) {
            console.error(`Failed to create variable ${colorData.name}:`, innerErr);
            console.error('Error details:', innerErr.message, innerErr.stack);
            errorCount++;
          }
        }

        console.log('Variable creation complete:', { count, errorCount, collectionName: collection.name });

        const response = errorCount > 0
          ? {
            type: 'create-variables-from-colors-result',
            success: true,
            count,
            error: `Created ${count} variables. Failed: ${errorCount}.`
          }
          : {
            type: 'create-variables-from-colors-result',
            success: true,
            count
          };

        clearTimeout(timeoutId);
        sendResponse(response);

        if (errorCount === 0) {
          figma.notify(`Success! Created ${count} color variables in "${collection.name}".`);
        }

        console.log('=== RESPONSE SENT TO UI ===');
      } catch (err: any) {
        clearTimeout(timeoutId);
        console.error("=== ERROR IN CREATE VARIABLES HANDLER ===");
        console.error("Error creating variables from colors:", err);
        console.error('Error name:', err.name);
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
        sendResponse({
          type: 'create-variables-from-colors-result',
          success: false,
          error: err.message || "Unknown error"
        });
        console.log('Error response sent to UI');
      }
    })();
    return; // Important: return early to prevent other handlers from running
  }

  // Create variables with multiple modes
  if (msg.type === 'create-mode-variables') {
    console.log('=== CREATE MODE VARIABLES HANDLER ===');
    console.log('Received data:', {
      hasModeTokens: !!msg.modeTokens,
      hasModeTokensByMode: !!msg.modeTokensByMode,
      collectionName: msg.collectionName,
      collectionId: msg.collectionId,
      createNewCollection: msg.createNewCollection
    });

    if (!figma.variables) {
      figma.ui.postMessage({
        type: 'create-mode-variables-result',
        success: false,
        error: 'Variables API is not available in this file.'
      });
      return;
    }

    (async () => {
      try {
        // Support both old and new property names
        const modeTokens = msg.modeTokensByMode || msg.modeTokens;
        const modes = ['light', 'dark', 'high-contrast'];

        if (!modeTokens) {
          throw new Error('No mode tokens provided');
        }

        console.log('Mode tokens received:', {
          light: modeTokens.light?.length || 0,
          dark: modeTokens.dark?.length || 0,
          'high-contrast': modeTokens['high-contrast']?.length || 0
        });

        // Get or create collection
        let collection: VariableCollection;
        const collections = await figma.variables.getLocalVariableCollectionsAsync();

        if (msg.createNewCollection || !msg.collectionId) {
          // Create new collection
          const timestamp = new Date().toLocaleString('en-GB', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' });
          const collectionName = msg.collectionName || `Multi-Mode Tokens (${timestamp})`;
          collection = figma.variables.createVariableCollection(collectionName);
          console.log('Created new collection:', collection.name);
        } else {
          // Use existing collection
          const existingCollection = collections.find(c => c.id === msg.collectionId);
          if (!existingCollection) {
            throw new Error(`Collection with ID ${msg.collectionId} not found`);
          }
          collection = existingCollection;
          console.log('Using existing collection:', collection.name);
        }

        // Set up modes
        let lightModeId: string;
        let darkModeId: string;
        let highContrastModeId: string;

        if (msg.createNewCollection || !msg.collectionId) {
          // Creating new collection - set up fresh modes
          lightModeId = collection.modes[0].modeId;
          collection.renameMode(lightModeId, 'Light');

          const darkMode = collection.addMode('Dark');
          const highContrastMode = collection.addMode('High Contrast');

          darkModeId = darkMode.modeId;
          highContrastModeId = highContrastMode.modeId;

          console.log('Created new modes:', { lightModeId, darkModeId, highContrastModeId });
        } else {
          // Using existing collection - find or create modes
          const existingModes = collection.modes;
          const lightMode = existingModes.find(m => m.name.toLowerCase() === 'light') || existingModes[0];
          let darkMode = existingModes.find(m => m.name.toLowerCase() === 'dark');
          let highContrastMode = existingModes.find(m => m.name.toLowerCase().includes('contrast'));

          if (!darkMode) {
            darkMode = collection.addMode('Dark');
            console.log('Added Dark mode to existing collection');
          }

          if (!highContrastMode) {
            highContrastMode = collection.addMode('High Contrast');
            console.log('Added High Contrast mode to existing collection');
          }

          lightModeId = lightMode.modeId;
          darkModeId = darkMode.modeId;
          highContrastModeId = highContrastMode.modeId;

          console.log('Using existing modes:', { lightModeId, darkModeId, highContrastModeId });
        }

        const modeMap: Record<string, string> = {
          'light': lightModeId,
          'dark': darkModeId,
          'high-contrast': highContrastModeId
        };

        // Create variables and set values for each mode
        const variableMap = new Map<string, Variable>();
        let count = 0;

        // Use light mode tokens as the base set of variables
        const lightTokens = modeTokens['light'] || [];

        if (lightTokens.length === 0) {
          throw new Error('No light mode tokens found. Please generate tokens first.');
        }

        console.log(`Creating ${lightTokens.length} variables...`);

        for (const token of lightTokens) {
          try {
            // Create variable once
            // @ts-ignore
            const variable = figma.variables.createVariable(
              token.name,
              collection,
              'COLOR'
            );

            variableMap.set(token.name, variable);
            count++;

            // Set value for each mode
            for (const mode of modes) {
              const modeId = modeMap[mode];
              const modeToken = (modeTokens[mode] || []).find(t => t.name === token.name);

              if (modeToken) {
                const { r, g, b } = hexToRgb(modeToken.value);
                variable.setValueForMode(modeId, { r, g, b, a: 1 });
                console.log(`Set ${token.name} for ${mode}:`, modeToken.value);
              }
            }
          } catch (err: any) {
            console.error(`Error creating variable ${token.name}:`, err);
          }
        }

        console.log(`Created ${count} mode variables with ${modes.length} modes`);
        console.log('Variable map contains:', Array.from(variableMap.keys()));

        // Create semantic tokens if requested
        let semanticCount = 0;
        if (msg.createSemanticTokens && msg.semanticTokensByMode) {
          console.log('Creating semantic tokens as aliases...');
          const semanticTokens = msg.semanticTokensByMode;
          const lightSemanticTokens = semanticTokens['light'] || [];

          console.log(`Creating ${lightSemanticTokens.length} semantic tokens...`);
          console.log('Sample semantic token:', lightSemanticTokens[0]);

          for (const token of lightSemanticTokens) {
            try {
              // Create semantic token variable
              const varName = token.name.replace(/\./g, '/');

              // @ts-ignore
              const variable = figma.variables.createVariable(
                varName,
                collection,
                'COLOR'
              );

              // Set value for each mode as ALIAS to base token
              for (const mode of modes) {
                const modeId = modeMap[mode];
                const modeToken = (semanticTokens[mode] || []).find(t => t.name === token.name);

                console.log(`Processing ${varName} for ${mode}:`, {
                  hasToken: !!modeToken,
                  aliasTo: modeToken?.aliasTo,
                  value: modeToken?.value,
                  hasBaseVar: !!variableMap.get(modeToken?.aliasTo || '')
                });

                if (modeToken && modeToken.aliasTo) {
                  // Find the base token variable to alias to
                  const baseTokenVar = variableMap.get(modeToken.aliasTo);

                  if (baseTokenVar) {
                    // Set as VARIABLE_ALIAS instead of direct color value
                    variable.setValueForMode(modeId, {
                      type: 'VARIABLE_ALIAS',
                      id: baseTokenVar.id
                    });
                    console.log(`✓ Set semantic ${varName} for ${mode} as alias to: ${modeToken.aliasTo}`);
                  } else {
                    // Fallback to direct color value if base token not found
                    console.warn(`✗ Base token "${modeToken.aliasTo}" not found in map (available: ${Array.from(variableMap.keys()).slice(0, 5).join(', ')}...), using direct value`);
                    const { r, g, b } = hexToRgb(modeToken.value);
                    variable.setValueForMode(modeId, { r, g, b, a: 1 });
                  }
                } else if (modeToken) {
                  // No alias info, use direct value as fallback
                  console.log(`No alias info for ${varName}, using direct value`);
                  const { r, g, b } = hexToRgb(modeToken.value);
                  variable.setValueForMode(modeId, { r, g, b, a: 1 });
                  console.log(`Set semantic ${varName} for ${mode} (direct value):`, modeToken.value);
                }
              }

              semanticCount++;
            } catch (err: any) {
              console.error(`Error creating semantic token ${token.name}:`, err);
              console.error('Error details:', err.message);
            }
          }

          console.log(`Created ${semanticCount} semantic tokens as aliases`);
        }

        const totalCount = count + semanticCount;

        figma.ui.postMessage({
          type: 'create-mode-variables-result',
          success: true,
          count,
          semanticCount,
          modes: modes.length
        });

        if (semanticCount > 0) {
          figma.notify(`Success! Created ${count} mode variables and ${semanticCount} semantic tokens with ${modes.length} modes in "${collection.name}".`);
        } else {
          figma.notify(`Success! Created ${count} variables with ${modes.length} modes in "${collection.name}".`);
        }
      } catch (err: any) {
        console.error('=== ERROR IN CREATE MODE VARIABLES ===');
        console.error('Error:', err);
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);

        figma.ui.postMessage({
          type: 'create-mode-variables-result',
          success: false,
          error: err.message || 'Unknown error'
        });

        figma.notify(`Error creating mode variables: ${err.message}`);
      }
    })();
    return;
  }

  if (msg.type === 'export-documentation-to-canvas') {
    (async () => {
      try {
        const data = msg.data;
        console.log('Creating documentation in Figma canvas...', data);

        if (!data || !data.categories) {
          throw new Error('Invalid data received. Please try again.');
        }

        const palettes = data.palettes || {};

        // Load fonts with fallback to Roboto (always available in Figma)
        let fontBold = { family: 'Roboto', style: 'Bold' };
        let fontSemiBold = { family: 'Roboto', style: 'Medium' };
        let fontMedium = { family: 'Roboto', style: 'Medium' };
        let fontRegular = { family: 'Roboto', style: 'Regular' };

        try {
          await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
          fontBold = { family: 'Inter', style: 'Bold' };
        } catch (e) {
          await figma.loadFontAsync(fontBold);
        }

        try {
          await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' });
          fontSemiBold = { family: 'Inter', style: 'Semi Bold' };
        } catch (e) {
          try {
            await figma.loadFontAsync({ family: 'Inter', style: 'SemiBold' });
            fontSemiBold = { family: 'Inter', style: 'SemiBold' };
          } catch (e2) {
            await figma.loadFontAsync(fontSemiBold);
          }
        }

        try {
          await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
          fontMedium = { family: 'Inter', style: 'Medium' };
        } catch (e) {
          await figma.loadFontAsync(fontMedium);
        }

        try {
          await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
          fontRegular = { family: 'Inter', style: 'Regular' };
        } catch (e) {
          await figma.loadFontAsync(fontRegular);
        }

        // Create main container frame with modern gradient background
        const mainFrame = figma.createFrame();
        mainFrame.name = data.title || 'Color Documentation';
        mainFrame.resize(1440, 100); // Will auto-resize based on content

        // Modern gradient background
        mainFrame.fills = [{
          type: 'GRADIENT_LINEAR',
          gradientTransform: [
            [1, 0, 0],
            [0, 1, 0]
          ],
          gradientStops: [
            { position: 0, color: { r: 0.97, g: 0.98, b: 1, a: 1 } },
            { position: 1, color: { r: 0.93, g: 0.96, b: 1, a: 1 } }
          ]
        }];

        mainFrame.layoutMode = 'VERTICAL';
        mainFrame.primaryAxisSizingMode = 'AUTO';
        mainFrame.counterAxisSizingMode = 'FIXED';
        mainFrame.itemSpacing = 56;
        mainFrame.paddingLeft = 72;
        mainFrame.paddingRight = 72;
        mainFrame.paddingTop = 72;
        mainFrame.paddingBottom = 72;
        mainFrame.cornerRadius = 32;
        mainFrame.effects = [{
          type: 'DROP_SHADOW',
          color: { r: 0.15, g: 0.23, b: 0.35, a: 0.15 },
          offset: { x: 0, y: 16 },
          radius: 64,
          spread: -8,
          visible: true,
          blendMode: 'NORMAL'
        }];

        // Create modern header section with gradient card
        const headerFrame = figma.createFrame();
        headerFrame.name = 'Header';
        headerFrame.resize(1296, 100);
        headerFrame.fills = [{
          type: 'GRADIENT_LINEAR',
          gradientTransform: [
            [0.9, -0.5, 0.45],
            [0.5, 0.9, -0.15]
          ],
          gradientStops: [
            { position: 0, color: { r: 0.15, g: 0.42, b: 0.93, a: 1 } },
            { position: 1, color: { r: 0.52, g: 0.27, b: 0.95, a: 1 } }
          ]
        }];
        headerFrame.cornerRadius = 24;
        headerFrame.layoutMode = 'VERTICAL';
        headerFrame.primaryAxisSizingMode = 'AUTO';
        headerFrame.counterAxisSizingMode = 'FIXED';
        headerFrame.itemSpacing = 16;
        headerFrame.paddingLeft = 48;
        headerFrame.paddingRight = 48;
        headerFrame.paddingTop = 48;
        headerFrame.paddingBottom = 48;
        headerFrame.effects = [
          {
            type: 'DROP_SHADOW',
            color: { r: 0.15, g: 0.4, b: 0.92, a: 0.3 },
            offset: { x: 0, y: 12 },
            radius: 40,
            spread: 0,
            visible: true,
            blendMode: 'NORMAL'
          },
          {
            type: 'DROP_SHADOW',
            color: { r: 0.15, g: 0.4, b: 0.92, a: 0.15 },
            offset: { x: 0, y: 4 },
            radius: 12,
            spread: 0,
            visible: true,
            blendMode: 'NORMAL'
          }
        ];

        // Title with white text on gradient
        const titleText = figma.createText();
        titleText.fontName = fontBold;
        titleText.fontSize = 64;
        titleText.characters = data.title || 'Color Documentation';
        titleText.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
        titleText.letterSpacing = { value: -2.5, unit: 'PERCENT' };
        titleText.lineHeight = { value: 110, unit: 'PERCENT' };
        headerFrame.appendChild(titleText);

        // Subtitle with white text
        if (data.subtitle) {
          const subtitleText = figma.createText();
          subtitleText.fontName = fontRegular;
          subtitleText.fontSize = 22;
          subtitleText.characters = data.subtitle;
          subtitleText.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0.92 }];
          subtitleText.lineHeight = { value: 160, unit: 'PERCENT' };
          headerFrame.appendChild(subtitleText);
        }

        // Metadata row with badges
        if (data.brandName || data.version || data.author) {
          const metaFrame = figma.createFrame();
          metaFrame.name = 'Metadata';
          metaFrame.resize(1200, 30);
          metaFrame.fills = [];
          metaFrame.layoutMode = 'HORIZONTAL';
          metaFrame.primaryAxisSizingMode = 'AUTO';
          metaFrame.counterAxisSizingMode = 'AUTO';
          metaFrame.itemSpacing = 10;

          const metaItems = [];
          if (data.brandName) metaItems.push(data.brandName);
          if (data.version) metaItems.push(`v${data.version}`);
          if (data.author) metaItems.push(data.author);
          metaItems.push(data.generatedDate);

          for (const item of metaItems) {
            const badge = figma.createFrame();
            badge.resize(100, 36);
            badge.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0.24 }];
            badge.cornerRadius = 10;
            badge.layoutMode = 'HORIZONTAL';
            badge.primaryAxisSizingMode = 'AUTO';
            badge.counterAxisSizingMode = 'AUTO';
            badge.paddingLeft = 16;
            badge.paddingRight = 16;
            badge.paddingTop = 8;
            badge.paddingBottom = 8;
            badge.itemSpacing = 8;

            const badgeText = figma.createText();
            badgeText.fontName = fontMedium;
            badgeText.fontSize = 14;
            badgeText.characters = item;
            badgeText.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
            badge.appendChild(badgeText);
            metaFrame.appendChild(badge);
          }

          headerFrame.appendChild(metaFrame);
        }

        mainFrame.appendChild(headerFrame);

        // Create sections for each category
        for (const category of data.categories) {
          const categoryFrame = figma.createFrame();
          categoryFrame.name = category.name + ' Colors';
          categoryFrame.resize(1296, 100);
          categoryFrame.fills = [];
          categoryFrame.layoutMode = 'VERTICAL';
          categoryFrame.primaryAxisSizingMode = 'AUTO';
          categoryFrame.counterAxisSizingMode = 'FIXED';
          categoryFrame.itemSpacing = 28;

          // Category title with modern styling
          const categoryTitle = figma.createText();
          categoryTitle.fontName = fontBold;
          categoryTitle.fontSize = 40;
          categoryTitle.characters = category.name + ' Colors';
          categoryTitle.fills = [{ type: 'SOLID', color: { r: 0.08, g: 0.09, b: 0.18 } }];
          categoryTitle.letterSpacing = { value: -2, unit: 'PERCENT' };
          categoryFrame.appendChild(categoryTitle);

          // Create color grid
          const gridFrame = figma.createFrame();
          gridFrame.name = 'Color Grid';
          gridFrame.resize(1296, 100);
          gridFrame.fills = [];
          gridFrame.layoutMode = 'HORIZONTAL';
          gridFrame.primaryAxisSizingMode = 'AUTO';
          gridFrame.counterAxisSizingMode = 'AUTO';
          gridFrame.itemSpacing = data.layout === 'compact' ? 20 : 24;
          gridFrame.layoutWrap = 'WRAP';

          // Create color cards
          for (const color of category.colors) {
            const cardFrame = figma.createFrame();
            cardFrame.name = color.name;
            cardFrame.resize(412, data.layout === 'compact' ? 260 : 340);
            cardFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
            cardFrame.cornerRadius = 20;
            cardFrame.layoutMode = 'VERTICAL';
            cardFrame.primaryAxisSizingMode = 'AUTO';
            cardFrame.counterAxisSizingMode = 'FIXED';
            cardFrame.itemSpacing = 0;
            cardFrame.strokes = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 }, opacity: 0.06 }];
            cardFrame.strokeWeight = 1;
            cardFrame.effects = [
              {
                type: 'DROP_SHADOW',
                color: { r: 0.09, g: 0.12, b: 0.2, a: 0.1 },
                offset: { x: 0, y: 8 },
                radius: 24,
                spread: -4,
                visible: true,
                blendMode: 'NORMAL'
              },
              {
                type: 'DROP_SHADOW',
                color: { r: 0, g: 0, b: 0, a: 0.05 },
                offset: { x: 0, y: 2 },
                radius: 8,
                spread: 0,
                visible: true,
                blendMode: 'NORMAL'
              }
            ];

            // Color swatch
            const swatchFrame = figma.createFrame();
            swatchFrame.name = 'Swatch';
            swatchFrame.resize(412, data.layout === 'compact' ? 120 : 160);
            try {
              const rgb = hexToRgb(color.value);
              swatchFrame.fills = [{ type: 'SOLID', color: rgb }];
            } catch (e) {
              swatchFrame.fills = [{ type: 'SOLID', color: { r: 0.8, g: 0.8, b: 0.8 } }];
            }
            swatchFrame.cornerRadius = 20;
            swatchFrame.topLeftRadius = 20;
            swatchFrame.topRightRadius = 20;
            swatchFrame.bottomLeftRadius = 0;
            swatchFrame.bottomRightRadius = 0;

            // Color code badge on swatch (if enabled)
            if (data.includeCodeSnippets) {
              const codeBadge = figma.createFrame();
              codeBadge.resize(100, 28);
              codeBadge.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 }, opacity: 0.4 }];
              codeBadge.cornerRadius = 8;
              codeBadge.layoutMode = 'HORIZONTAL';
              codeBadge.primaryAxisSizingMode = 'AUTO';
              codeBadge.counterAxisSizingMode = 'AUTO';
              codeBadge.paddingLeft = 12;
              codeBadge.paddingRight = 12;
              codeBadge.paddingTop = 6;
              codeBadge.paddingBottom = 6;
              codeBadge.effects = [{
                type: 'DROP_SHADOW',
                color: { r: 0, g: 0, b: 0, a: 0.2 },
                offset: { x: 0, y: 2 },
                radius: 8,
                spread: 0,
                visible: true,
                blendMode: 'NORMAL'
              }];

              const codeText = figma.createText();
              codeText.fontName = fontMedium;
              codeText.fontSize = 13;
              codeText.characters = color.value.toUpperCase();
              codeText.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
              codeBadge.appendChild(codeText);

              codeBadge.x = 16;
              codeBadge.y = data.layout === 'compact' ? 60 : 100;
              swatchFrame.appendChild(codeBadge);
            }

            cardFrame.appendChild(swatchFrame);

            // Info section
            const infoFrame = figma.createFrame();
            infoFrame.name = 'Info';
            infoFrame.resize(412, 100);
            infoFrame.fills = [];
            infoFrame.layoutMode = 'VERTICAL';
            infoFrame.primaryAxisSizingMode = 'AUTO';
            infoFrame.counterAxisSizingMode = 'FIXED';
            infoFrame.itemSpacing = 16;
            infoFrame.paddingLeft = 20;
            infoFrame.paddingRight = 20;
            infoFrame.paddingTop = 20;
            infoFrame.paddingBottom = 20;

            // Color name
            const nameText = figma.createText();
            nameText.fontName = fontBold;
            nameText.fontSize = 18;
            nameText.characters = color.name.charAt(0).toUpperCase() + color.name.slice(1);
            nameText.fills = [{ type: 'SOLID', color: { r: 0.09, g: 0.09, b: 0.15 } }];
            nameText.letterSpacing = { value: -0.5, unit: 'PERCENT' };
            infoFrame.appendChild(nameText);

            // Add shade palette if available - create visual shade strip
            const colorKey = color.name.toLowerCase();
            console.log('Looking for shades for:', colorKey, 'Available palettes:', Object.keys(palettes));

            if (palettes && palettes[colorKey]) {
              const shadeFrame = figma.createFrame();
              shadeFrame.name = 'Shades';
              shadeFrame.resize(372, 48);
              shadeFrame.fills = [];
              shadeFrame.layoutMode = 'HORIZONTAL';
              shadeFrame.primaryAxisSizingMode = 'FIXED';
              shadeFrame.counterAxisSizingMode = 'FIXED';
              shadeFrame.itemSpacing = 4;

              const shades = palettes[colorKey];
              console.log('Shades for', colorKey, ':', shades);

              if (shades && typeof shades === 'object') {
                const shadeKeys = Object.keys(shades).sort((a, b) => Number(a) - Number(b));
                console.log('Shade keys:', shadeKeys);

                for (const shadeKey of shadeKeys) {
                  const shadeValue = shades[shadeKey];
                  console.log('Processing shade:', shadeKey, '=', shadeValue);

                  if (!shadeValue || typeof shadeValue !== 'string') {
                    console.log('Skipping invalid shade value:', shadeValue);
                    continue;
                  }

                  const shadeBox = figma.createFrame();
                  shadeBox.name = `Shade-${shadeKey}`;
                  shadeBox.resize(28, 48);
                  shadeBox.cornerRadius = 6;

                  try {
                    const rgb = hexToRgb(shadeValue);
                    console.log('Converted', shadeValue, 'to RGB:', rgb);
                    shadeBox.fills = [{ type: 'SOLID', color: rgb }];
                  } catch (e) {
                    console.error('Error converting color:', shadeValue, e);
                    continue;
                  }

                  shadeBox.strokes = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 }, opacity: 0.1 }];
                  shadeBox.strokeWeight = 1;

                  shadeFrame.appendChild(shadeBox);
                }

                if (shadeFrame.children.length > 0) {
                  infoFrame.appendChild(shadeFrame);
                }
              }
            }

            // Accessibility info with badges
            if (data.includeAccessibility && color.accessibility) {
              const accessFrame = figma.createFrame();
              accessFrame.name = 'Accessibility';
              accessFrame.resize(372, 64);
              accessFrame.fills = [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.99 } }];
              accessFrame.cornerRadius = 8;
              accessFrame.layoutMode = 'VERTICAL';
              accessFrame.primaryAxisSizingMode = 'AUTO';
              accessFrame.counterAxisSizingMode = 'FIXED';
              accessFrame.itemSpacing = 10;
              accessFrame.paddingLeft = 12;
              accessFrame.paddingRight = 12;
              accessFrame.paddingTop = 12;
              accessFrame.paddingBottom = 12;

              const contrastText = figma.createText();
              contrastText.fontName = fontRegular;
              contrastText.fontSize = 13;
              contrastText.characters = `Contrast: ${color.accessibility.onWhite.toFixed(2)}:1 (white)`;
              contrastText.fills = [{ type: 'SOLID', color: { r: 0.42, g: 0.47, b: 0.57 } }];
              accessFrame.appendChild(contrastText);

              const badgeFrame = figma.createFrame();
              badgeFrame.resize(360, 24);
              badgeFrame.fills = [];
              badgeFrame.layoutMode = 'HORIZONTAL';
              badgeFrame.primaryAxisSizingMode = 'AUTO';
              badgeFrame.counterAxisSizingMode = 'AUTO';
              badgeFrame.itemSpacing = 8;

              // WCAG AA badge
              const aaBadge = figma.createFrame();
              aaBadge.resize(80, 24);
              aaBadge.fills = [{
                type: 'SOLID',
                color: color.accessibility.wcagAA
                  ? { r: 0.22, g: 0.8, b: 0.5 }
                  : { r: 0.95, g: 0.4, b: 0.4 }
              }];
              aaBadge.cornerRadius = 6;
              aaBadge.layoutMode = 'HORIZONTAL';
              aaBadge.primaryAxisSizingMode = 'AUTO';
              aaBadge.counterAxisSizingMode = 'AUTO';
              aaBadge.paddingLeft = 8;
              aaBadge.paddingRight = 8;
              aaBadge.paddingTop = 4;
              aaBadge.paddingBottom = 4;

              const aaText = figma.createText();
              aaText.fontName = fontMedium;
              aaText.fontSize = 11;
              aaText.characters = color.accessibility.wcagAA ? '✓ WCAG AA' : '✗ WCAG AA';
              aaText.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
              aaBadge.appendChild(aaText);
              badgeFrame.appendChild(aaBadge);

              // WCAG AAA badge
              const aaaBadge = figma.createFrame();
              aaaBadge.resize(80, 24);
              aaaBadge.fills = [{
                type: 'SOLID',
                color: color.accessibility.wcagAAA
                  ? { r: 0.22, g: 0.8, b: 0.5 }
                  : { r: 0.95, g: 0.4, b: 0.4 }
              }];
              aaaBadge.cornerRadius = 6;
              aaaBadge.layoutMode = 'HORIZONTAL';
              aaaBadge.primaryAxisSizingMode = 'AUTO';
              aaaBadge.counterAxisSizingMode = 'AUTO';
              aaaBadge.paddingLeft = 8;
              aaaBadge.paddingRight = 8;
              aaaBadge.paddingTop = 4;
              aaaBadge.paddingBottom = 4;

              const aaaText = figma.createText();
              aaaText.fontName = fontMedium;
              aaaText.fontSize = 11;
              aaaText.characters = color.accessibility.wcagAAA ? '✓ WCAG AAA' : '✗ WCAG AAA';
              aaaText.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
              aaaBadge.appendChild(aaaText);
              badgeFrame.appendChild(aaaBadge);

              accessFrame.appendChild(badgeFrame);
              infoFrame.appendChild(accessFrame);
            }

            // Use cases with modern styling
            if (data.includeUseCases && color.useCases && color.useCases.length > 0 && data.layout !== 'compact') {
              const useCasesText = figma.createText();
              useCasesText.fontName = fontRegular;
              useCasesText.fontSize = 12;
              useCasesText.characters = '→ ' + color.useCases.slice(0, 2).join('\n→ ');
              useCasesText.fills = [{ type: 'SOLID', color: { r: 0.45, g: 0.5, b: 0.6 } }];
              useCasesText.lineHeight = { value: 18, unit: 'PIXELS' };
              infoFrame.appendChild(useCasesText);
            }

            cardFrame.appendChild(infoFrame);
            gridFrame.appendChild(cardFrame);
          }

          categoryFrame.appendChild(gridFrame);
          mainFrame.appendChild(categoryFrame);
        }

        // Position frame in viewport
        mainFrame.x = figma.viewport.center.x - mainFrame.width / 2;
        mainFrame.y = figma.viewport.center.y - mainFrame.height / 2;

        // Select the created frame
        figma.currentPage.selection = [mainFrame];
        figma.viewport.scrollAndZoomIntoView([mainFrame]);

        figma.notify(`✨ Documentation created in Figma! ${data.totalColors} colors documented.`);

        figma.ui.postMessage({
          type: 'export-documentation-to-canvas-result',
          success: true
        });

      } catch (err: any) {
        console.error('Error creating documentation in canvas:', err);
        const errorMessage = err?.message || err?.toString() || 'Unknown error occurred';
        figma.notify(`Error: ${errorMessage}`);
        figma.ui.postMessage({
          type: 'export-documentation-to-canvas-result',
          success: false,
          error: errorMessage
        });
      }
    })();
    return;
  }

  if (msg.type === 'create-mesh-gradient') {
    (async () => {
      const { points, width, height, influence = 50, vignette = 0, blendMode = 'normal', exportType = 'frame', noise = 0, grainType = 'noise' } = msg;

      try {
        const frame = figma.createFrame();
        frame.name = "Mesh Gradient";
        frame.resize(width, height);
        frame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 1 }]; // White bg base
        frame.clipsContent = true; // Clip content to frame bounds

        // Apply vignette as an inner shadow on the frame
        if (vignette > 0) {
          frame.effects = [{
            type: 'INNER_SHADOW',
            color: { r: 0, g: 0, b: 0, a: (vignette / 100) * 0.6 },
            offset: { x: 0, y: 0 },
            radius: Math.max(width, height) * 0.8,
            spread: 0,
            visible: true,
            blendMode: 'NORMAL'
          }];
        }

        // We need to add the points as blurred circles
        // To make it look like a mesh, we use large circles with heavy blur
        const influenceFactor = Math.max(0.1, Math.min(1, influence / 100));

        for (const p of points) {
          const circle = figma.createEllipse();
          circle.name = `Mesh Point`;

          const radius = Math.max(width, height) * (0.2 + (influenceFactor * 0.4));
          circle.resize(radius * 2, radius * 2);

          const x = (p.x / 100) * width;
          const y = (p.y / 100) * height;

          circle.x = x - radius;
          circle.y = y - radius;

          const { r, g, b } = hexToRgb(p.color);
          circle.fills = [{ type: 'SOLID', color: { r, g, b } }];

          // Apply blend mode if it's a standard Figma one
          const figmaBlendMode = blendMode.toUpperCase() as BlendMode;
          const validBlendModes = ['NORMAL', 'MULTIPLY', 'SCREEN', 'OVERLAY', 'DARKEN', 'LIGHTEN', 'COLOR_DODGE', 'COLOR_BURN', 'HARD_LIGHT', 'SOFT_LIGHT', 'DIFFERENCE', 'EXCLUSION', 'HUE', 'SATURATION', 'COLOR', 'LUMINOSITY'];
          if (validBlendModes.includes(figmaBlendMode)) {
            circle.blendMode = figmaBlendMode as any;
          }

          // Add heavy layer blur
          circle.effects = [{
            type: 'LAYER_BLUR',
            radius: radius * (0.5 + (influenceFactor * 0.5)),
            visible: true
          } as Effect];

          frame.appendChild(circle);
        }

        // Add noise/grain overlay if noise > 0 and we have pre-rendered texture from UI
        if (noise > 0 && msg.noiseTextureData) {
          // Use the pre-rendered noise texture from the UI
          const noiseBytes = new Uint8Array(msg.noiseTextureData);
          const noiseImage = figma.createImage(noiseBytes);
          
          const noiseOverlay = figma.createRectangle();
          noiseOverlay.name = `Grain Overlay (${grainType})`;
          noiseOverlay.resize(width, height);
          noiseOverlay.x = 0;
          noiseOverlay.y = 0;
          
          // Apply the noise texture as image fill
          noiseOverlay.fills = [{
            type: 'IMAGE',
            imageHash: noiseImage.hash,
            scaleMode: 'TILE',
            scalingFactor: 0.5 // Scale down for finer grain
          }];
          
          // Set blend mode based on grain type
          let grainBlendMode: BlendMode = 'OVERLAY';
          switch (grainType) {
            case 'fiber':
              grainBlendMode = 'SOFT_LIGHT';
              break;
            case 'paper':
              grainBlendMode = 'MULTIPLY';
              break;
            case 'film':
              grainBlendMode = 'OVERLAY';
              break;
            case 'canvas':
              grainBlendMode = 'SOFT_LIGHT';
              break;
            default:
              grainBlendMode = 'OVERLAY';
          }
          noiseOverlay.blendMode = grainBlendMode;
          
          frame.appendChild(noiseOverlay);
        }

        // If exportType is 'image', flatten to PNG
        if (exportType === 'image') {
          // Export the frame as PNG bytes
          const pngBytes = await frame.exportAsync({
            format: 'PNG',
            constraint: { type: 'SCALE', value: 2 } // 2x for better quality
          });

          // Create an image from the PNG bytes
          const imageHash = figma.createImage(pngBytes).hash;
          
          // Create a rectangle to hold the image
          const imageRect = figma.createRectangle();
          imageRect.name = "Mesh Gradient Image";
          imageRect.resize(width, height);
          imageRect.x = frame.x;
          imageRect.y = frame.y;
          imageRect.fills = [{
            type: 'IMAGE',
            imageHash: imageHash,
            scaleMode: 'FILL'
          }];

          // Remove the original frame with all the circles
          frame.remove();

          figma.viewport.scrollAndZoomIntoView([imageRect]);
          figma.notify("Created Mesh Gradient as Image!");
        } else {
          figma.viewport.scrollAndZoomIntoView([frame]);
          figma.notify("Created Mesh Gradient!");
        }

      } catch (err: any) {
        console.error("Error creating mesh gradient:", err);
        figma.notify(`Error: ${err.message}`);
      }
    })();
    return;
  }

  // Handle image export with pre-rendered PNG data from UI
  if (msg.type === 'create-mesh-gradient-image') {
    (async () => {
      const { imageData, width, height } = msg;
      
      try {
        // Convert array back to Uint8Array
        const pngBytes = new Uint8Array(imageData);
        
        // Create image from PNG bytes
        const image = figma.createImage(pngBytes);
        
        // Create rectangle with image fill
        const imageRect = figma.createRectangle();
        imageRect.name = "Mesh Gradient Image";
        imageRect.resize(width, height);
        imageRect.fills = [{
          type: 'IMAGE',
          imageHash: image.hash,
          scaleMode: 'FILL'
        }];

        figma.viewport.scrollAndZoomIntoView([imageRect]);
        figma.notify("Created Mesh Gradient as Image!");
      } catch (err: any) {
        console.error("Error creating mesh gradient image:", err);
        figma.notify(`Error: ${err.message}`);
      }
    })();
    return;
  }

  // Get colors from Figma selection for AI module
  if (msg.type === 'get-selection-colors') {
    (async () => {
      const selection = figma.currentPage.selection;
      
      if (selection.length === 0) {
        figma.ui.postMessage({ type: 'selection-colors', colors: [] });
        return;
      }

      const colors: string[] = [];
      
      const extractColorsFromNode = (node: SceneNode) => {
        // Check for fills
        if ('fills' in node && Array.isArray(node.fills)) {
          for (const fill of node.fills) {
            if (fill.type === 'SOLID' && fill.visible !== false) {
              const hex = rgbToHex(fill.color.r, fill.color.g, fill.color.b).toUpperCase();
              if (!colors.includes(hex)) {
                colors.push(hex);
              }
            }
          }
        }
        
        // Check for strokes
        if ('strokes' in node && Array.isArray(node.strokes)) {
          for (const stroke of node.strokes) {
            if (stroke.type === 'SOLID' && stroke.visible !== false) {
              const hex = rgbToHex(stroke.color.r, stroke.color.g, stroke.color.b).toUpperCase();
              if (!colors.includes(hex)) {
                colors.push(hex);
              }
            }
          }
        }
        
        // Recursively check children
        if ('children' in node) {
          for (const child of (node as FrameNode | GroupNode).children) {
            extractColorsFromNode(child);
          }
        }
      };
      
      for (const node of selection) {
        extractColorsFromNode(node);
        // Limit to 10 colors
        if (colors.length >= 10) break;
      }
      
      figma.ui.postMessage({ type: 'selection-colors', colors: colors.slice(0, 10) });
    })();
    return;
  }

  // Create Figma variables from AI-generated colors
  if (msg.type === 'create-color-variables-from-ai') {
    (async () => {
      if (!figma.variables) {
        figma.notify("Error: Variables API is not available in this file.");
        return;
      }

      const { colors } = msg;
      if (!colors || !Array.isArray(colors) || colors.length === 0) {
        figma.notify("No colors to create variables from.");
        return;
      }

      // Semantic names for AI-generated colors
      const colorNames = ['Primary', 'Secondary', 'Accent', 'Background', 'Surface', 'Text', 'Muted', 'Border', 'Highlight', 'Shadow'];

      try {
        const timestamp = new Date().toLocaleString('en-GB', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' });
        const collection = figma.variables.createVariableCollection(`AI Colors (${timestamp})`);
        const modeId = collection.modes[0].modeId;
        let count = 0;

        for (let i = 0; i < colors.length; i++) {
          const hex = colors[i];
          if (typeof hex !== 'string') continue;
          
          try {
            const name = colorNames[i] || `Color ${i + 1}`;
            const variableName = `AI Colors/${name}`;
            const variable = figma.variables.createVariable(variableName, collection, 'COLOR');
            const rgb = hexToRgb(hex);
            variable.setValueForMode(modeId, { ...rgb, a: 1 });
            count++;
          } catch (varErr: any) {
            console.error(`Error creating variable:`, varErr);
          }
        }

        figma.notify(`Success! Created ${count} color variables from AI palette.`);
      } catch (err: any) {
        console.error("Error creating AI color variables:", err);
        figma.notify(`Error: ${err.message}`);
      }
    })();
    return;
  }

  // Create Figma color styles from AI-generated colors
  if (msg.type === 'create-color-styles-from-ai') {
    (async () => {
      const { colors } = msg;
      if (!colors || !Array.isArray(colors) || colors.length === 0) {
        figma.notify("No colors to create styles from.");
        return;
      }

      // Semantic names for AI-generated colors
      const colorNames = ['Primary', 'Secondary', 'Accent', 'Background', 'Surface', 'Text', 'Muted', 'Border', 'Highlight', 'Shadow'];

      try {
        let count = 0;

        for (let i = 0; i < colors.length; i++) {
          const hex = colors[i];
          if (typeof hex !== 'string') continue;
          
          try {
            const name = colorNames[i] || `Color ${i + 1}`;
            const styleName = `AI Colors/${name}`;
            const style = figma.createPaintStyle();
            style.name = styleName;
            const rgb = hexToRgb(hex);
            style.paints = [{ type: 'SOLID', color: rgb }];
            count++;
          } catch (styleErr: any) {
            console.error(`Error creating style:`, styleErr);
          }
        }

        figma.notify(`Success! Created ${count} color styles from AI palette.`);
      } catch (err: any) {
        console.error("Error creating AI color styles:", err);
        figma.notify(`Error: ${err.message}`);
      }
    })();
    return;
  }

  if (msg.type === 'close') {
    figma.closePlugin();
  }

  if (msg.type === 'sample-figma-selection') {
    const selection = figma.currentPage.selection;
    if (selection.length === 0) {
      figma.notify('Please select something first');
      return;
    }

    const colors: string[] = [];
    selection.forEach(node => {
      if ('fills' in node) {
        const fills = node.fills as Paint[];
        if (Array.isArray(fills)) {
          fills.forEach(fill => {
            if (fill.type === 'SOLID') {
              colors.push(rgbToHex(fill.color.r, fill.color.g, fill.color.b));
            }
          });
        }
      }
    });

    if (colors.length === 0) {
      figma.notify('No solid colors found in selection');
      return;
    }

    figma.ui.postMessage({ type: 'selection-colors', colors });
  }
};

// Load brands and active brand ID on plugin start
(async () => {
  try {
    const brands = await figma.clientStorage.getAsync('procolors-brands');
    figma.ui.postMessage({ type: 'brands-loaded', brands: brands || null });
  } catch (err: any) {
    console.error('Error loading brands on start:', err);
    figma.ui.postMessage({ type: 'brands-loaded', brands: null, error: err.message });
  }

  try {
    const brandId = await figma.clientStorage.getAsync('procolors-active-brand-id');
    figma.ui.postMessage({ type: 'active-brand-id-loaded', brandId: brandId || null });
  } catch (err: any) {
    console.error('Error loading active brand ID on start:', err);
    figma.ui.postMessage({ type: 'active-brand-id-loaded', brandId: null, error: err.message });
  }
})();
