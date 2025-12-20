/**
 * Color matcher - matches unlinked colors to variables and styles
 */

import { findClosestColor, RGB } from '../utils/colorMatching';

export interface VariableInfo {
  name: string;
  valueRGB: RGB;
  variableId: string;
  collectionId: string;
}

export interface StyleInfo {
  name: string;
  valueRGB: RGB;
  styleId: string;
}

export interface ColorMatch {
  nodeId: string;
  nodeName: string;
  property: 'fill' | 'stroke' | 'text';
  originalColor: RGB;
  matchedVariable?: VariableInfo;
  matchedStyle?: StyleInfo;
  deltaE: number;
  isMatched: boolean;
  isCloseMatch?: boolean; // True if match is within threshold
}

/**
 * Resolve variable value recursively (handling aliases)
 */
function resolveVariableValue(
  variable: Variable,
  modeId: string,
  allVariables: Variable[],
  collections: VariableCollection[],
  depth: number = 0
): RGB | null {
  // Prevent infinite recursion
  if (depth > 5) return null;

  try {
    const value = variable.valuesByMode[modeId];

    // Case 1: Direct Color
    if (typeof value === 'object' && 'r' in value && 'g' in value && 'b' in value) {
      return {
        r: value.r,
        g: value.g,
        b: value.b
      };
    }

    // Case 2: Alias
    if (typeof value === 'object' && 'type' in value && value.type === 'VARIABLE_ALIAS') {
      const aliasId = (value as VariableAlias).id;
      const aliasedVar = allVariables.find(v => v.id === aliasId);
      
      if (aliasedVar) {
        // Try to find the collection to get the mode
        const aliasedCollection = collections.find(c => c.id === aliasedVar.variableCollectionId);
        if (aliasedCollection) {
          // Use the first mode of the aliased collection as a best-effort resolution
          // Ideally, we'd map modes, but that's complex without user input
          const aliasedModeId = aliasedCollection.modes[0].modeId;
          return resolveVariableValue(aliasedVar, aliasedModeId, allVariables, collections, depth + 1);
        }
      }
    }
  } catch (err) {
    console.warn(`Error resolving variable ${variable.name}`, err);
  }

  return null;
}

/**
 * Extract RGB from a paint style
 */
function extractStyleRGB(paint: Paint): RGB | null {
  if (paint.type === 'SOLID') {
    return {
      r: paint.color.r,
      g: paint.color.g,
      b: paint.color.b
    };
  }
  return null;
}

/**
 * Fetch all color variables from the document
 */
export async function fetchVariables(): Promise<VariableInfo[]> {
  if (!figma.variables) {
    return [];
  }

  try {
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    const allVariables = await figma.variables.getLocalVariablesAsync();
    const variables: VariableInfo[] = [];

    for (const variable of allVariables) {
      if (variable.resolvedType === 'COLOR') {
        const collection = collections.find(c => c.id === variable.variableCollectionId);
        if (collection) {
          const modeId = collection.modes[0].modeId;
          
          const rgb = resolveVariableValue(variable, modeId, allVariables, collections);
          
          if (rgb) {
            variables.push({
              name: variable.name,
              valueRGB: rgb,
              variableId: variable.id,
              collectionId: collection.id
            });
          } else {
            // Variable might not have a value in this mode or failed to resolve
            // console.warn(`Variable ${variable.name} could not be resolved in mode ${modeId}`);
          }
        } else {
          console.warn(`Variable ${variable.name} has no collection`);
        }
      }
    }
    
    console.log(`Found ${variables.length} color variables`);

    return variables;
  } catch (error) {
    console.error('Error fetching variables:', error);
    return [];
  }
}

/**
 * Fetch all color styles from the document
 */
export async function fetchStyles(): Promise<StyleInfo[]> {
  try {
    const styles = await figma.getLocalPaintStylesAsync();
    const styleInfos: StyleInfo[] = [];

    for (const style of styles) {
      if (style.paints && style.paints.length > 0) {
        const firstPaint = style.paints[0];
        const rgb = extractStyleRGB(firstPaint);
        
        if (rgb) {
          styleInfos.push({
            name: style.name,
            valueRGB: rgb,
            styleId: style.id
          });
        }
      }
    }

    console.log(`Found ${styleInfos.length} color styles`);
    return styleInfos;
  } catch (error) {
    console.error('Error fetching styles:', error);
    return [];
  }
}

/**
 * Match unlinked colors to variables and styles
 */
export async function matchColors(
  unlinkedColors: Array<{ nodeId: string; nodeName: string; property: 'fill' | 'stroke' | 'text'; rawColor: RGB }>,
  preference?: 'variables' | 'styles',
  threshold: number = 10
): Promise<ColorMatch[]> {
  const variables = await fetchVariables();
  const styles = await fetchStyles();

  const matches: ColorMatch[] = [];

  for (const unlinked of unlinkedColors) {
    // Try to match with variables first
    let matchedVariable: VariableInfo | undefined;
    let matchedStyle: StyleInfo | undefined;
    let bestDeltaE = Infinity;

    // Find closest variable (always find best, even if outside threshold)
    let bestVariableMatch: { match: VariableInfo | null; deltaE: number } | null = null;
    if (variables.length > 0 && (preference === 'variables' || !preference)) {
      bestVariableMatch = findClosestColor(unlinked.rawColor, variables);
      if (bestVariableMatch.match) {
        matchedVariable = bestVariableMatch.match as VariableInfo;
        bestDeltaE = bestVariableMatch.deltaE;
      }
    }

    // Find closest style (always find best, even if outside threshold)
    let bestStyleMatch: { match: StyleInfo | null; deltaE: number } | null = null;
    if (styles.length > 0 && (preference === 'styles' || !preference)) {
      bestStyleMatch = findClosestColor(unlinked.rawColor, styles);
      if (bestStyleMatch.match) {
        if (preference === 'styles') {
          // If preference is styles, always use style
          matchedVariable = undefined;
          matchedStyle = bestStyleMatch.match as StyleInfo;
          bestDeltaE = bestStyleMatch.deltaE;
        } else if (!preference) {
          // No preference: prefer variable if it exists and is closer or equal, otherwise use style
          // Also prefer variable if deltaE is same (modern approach)
          if (!matchedVariable || bestStyleMatch.deltaE < bestDeltaE) {
            matchedVariable = undefined;
            matchedStyle = bestStyleMatch.match as StyleInfo;
            bestDeltaE = bestStyleMatch.deltaE;
          }
        }
      }
    }

    // Match logic:
    // We only consider it a "Match" if it is within the threshold.
    const isWithinThreshold = bestDeltaE <= threshold;
    
    // If we found ANY candidate, we have a potential match, but we only flag isMatched=true if it's good.
    // Actually, "Scan & Link" implies we ONLY link good matches.
    const hasCandidate = !!(matchedVariable || matchedStyle);
    const isMatched = hasCandidate && isWithinThreshold;

    matches.push({
      nodeId: unlinked.nodeId,
      nodeName: unlinked.nodeName,
      property: unlinked.property,
      originalColor: unlinked.rawColor,
      matchedVariable: isMatched ? matchedVariable : undefined, // Only attach if matched
      matchedStyle: isMatched ? matchedStyle : undefined,       // Only attach if matched
      deltaE: bestDeltaE,
      isMatched: isMatched,
      isCloseMatch: isMatched // Since we enforce threshold, all matches are close matches
    });
  }

  return matches;
}
