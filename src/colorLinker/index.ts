/**
 * Color Linker - Main entry point
 * Automatically links unlinked colors to variables/styles
 */

import { scanSelection, scanPage, UnlinkedColor } from './scanner';
import { matchColors, ColorMatch } from './matcher';
import { applyMatches, undoReplacements, UndoState, ReplacementResult } from './replacer';

export interface LinkingResult {
  totalScanned: number;
  totalReplaced: number;
  matches: ColorMatch[];
  results: ReplacementResult[];
  undoStates: UndoState[];
  unmatchedColors: Array<{
    nodeId: string;
    nodeName: string;
    property: 'fill' | 'stroke' | 'text';
    color: { r: number; g: number; b: number };
  }>;
}

/**
 * Link colors in selection
 */
export async function linkColorsInSelection(selection: readonly SceneNode[], preference?: 'variables' | 'styles', threshold?: number): Promise<LinkingResult> {
  // Scan for unlinked colors
  const unlinked = scanSelection(selection);

  // Match colors to variables/styles
  const matches = await matchColors(unlinked, preference, threshold);

  // Apply matches automatically
  const { results, undoStates } = await applyMatches(matches);

  // Calculate stats
  const totalReplaced = results.filter(r => r.success).length;
  // Only show as unmatched if there were no variables/styles available at all
  const unmatchedColors = matches
    .filter(m => !m.isMatched && m.deltaE === Infinity)
    .map(m => ({
      nodeId: m.nodeId,
      nodeName: m.nodeName,
      property: m.property,
      color: m.originalColor
    }));

  return {
    totalScanned: unlinked.length,
    totalReplaced,
    matches,
    results,
    undoStates,
    unmatchedColors
  };
}

/**
 * Link colors in entire page
 */
export async function linkColorsInPage(page: PageNode, preference?: 'variables' | 'styles', threshold?: number): Promise<LinkingResult> {
  const unlinked = scanPage(page);
  const matches = await matchColors(unlinked, preference, threshold);
  const { results, undoStates } = await applyMatches(matches);

  const totalReplaced = results.filter(r => r.success).length;
  // Only show as unmatched if there were no variables/styles available at all
  const unmatchedColors = matches
    .filter(m => !m.isMatched && m.deltaE === Infinity)
    .map(m => ({
      nodeId: m.nodeId,
      nodeName: m.nodeName,
      property: m.property,
      color: m.originalColor
    }));

  return {
    totalScanned: unlinked.length,
    totalReplaced,
    matches,
    results,
    undoStates,
    unmatchedColors
  };
}

/**
 * Undo linking
 */
export async function undoLinking(undoStates: UndoState[]): Promise<void> {
  await undoReplacements(undoStates);
}

