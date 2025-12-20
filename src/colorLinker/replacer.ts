/**
 * Replacer - applies variables/styles to nodes
 */

import { ColorMatch, VariableInfo, StyleInfo } from './matcher';

export interface ReplacementResult {
  nodeId: string;
  nodeName: string;
  property: 'fill' | 'stroke' | 'text';
  success: boolean;
  error?: string;
}

export interface UndoState {
  nodeId: string;
  property: 'fill' | 'stroke' | 'text';
  originalPaint?: Paint;
  originalStyleId?: string;
}

/**
 * Apply a variable to a node property
 */
async function applyVariable(
  node: SceneNode,
  property: 'fill' | 'stroke' | 'text',
  variable: VariableInfo
): Promise<boolean> {
  try {
    if (!figma.variables) {
      console.error('Variables API not available');
      return false;
    }

    // Check if node is locked
    if ('locked' in node && node.locked) {
      console.error(`Node ${node.id} is locked`);
      return false;
    }

    const variableRef = await figma.variables.getVariableByIdAsync(variable.variableId);
    if (!variableRef) {
      console.error(`Variable not found: ${variable.variableId} (${variable.name})`);
      return false;
    }

    // Use the pre-resolved RGB value from the matcher
    // This avoids alias resolution issues here and ensures we use the matched color
    const resolvedColor = { 
      r: variable.valueRGB.r, 
      g: variable.valueRGB.g, 
      b: variable.valueRGB.b 
    };
    
    console.log(`Binding variable ${variable.name} (${variable.variableId}) to ${node.name} ${property}`);

    if (property === 'fill' && 'fills' in node && Array.isArray(node.fills)) {
      // Clear style if exists
      if ('fillStyleId' in node) {
        node.fillStyleId = '';
      }
      
      try {
        // Primary goal: Bind to variable
        // Fallback: Set solid color
        
        // We set the color first to ensure visual correctness even if binding fails or is delayed
        const colorPaint: SolidPaint = {
          type: 'SOLID',
          color: resolvedColor
        };
        
        // Try to bind the variable
        try {
          const paintWithBinding: any = {
            type: 'SOLID',
            color: resolvedColor,
            boundVariables: {
              color: variable.variableId
            }
          };
          
          node.fills = [paintWithBinding];
          // Short delay to let Figma process
          await new Promise(resolve => setTimeout(resolve, 20));
          
          // Check if binding worked
          const checkNode = await figma.getNodeByIdAsync(node.id);
          if (checkNode && 'fills' in checkNode) {
            const appliedFill = (checkNode as any).fills?.[0] as SolidPaint;
            if (appliedFill?.boundVariables?.color === variable.variableId) {
              return true;
            }
          }
        } catch (bindError: any) {
          console.warn(`Variable binding failed for ${variable.name}, falling back to color value`);
        }
        
        // Fallback: set color only (if binding didn't stick or threw error)
        node.fills = [{ type: 'SOLID', color: resolvedColor }];
        return true;
        
      } catch (fillError: any) {
        console.error(`Error setting fills:`, fillError.message);
        return false;
      }
    } else if (property === 'stroke' && 'strokes' in node && Array.isArray(node.strokes)) {
      if ('strokeStyleId' in node) {
        node.strokeStyleId = '';
      }
      
      try {
        const paintWithBinding: any = {
          type: 'SOLID',
          color: resolvedColor,
          boundVariables: {
            color: variable.variableId
          }
        };
        
        (node as any).strokes = [paintWithBinding];
        await new Promise(resolve => setTimeout(resolve, 20));
        
        const checkNode = await figma.getNodeByIdAsync(node.id);
        if (checkNode && 'strokes' in checkNode) {
          const appliedStroke = (checkNode as any).strokes?.[0] as SolidPaint;
          if (appliedStroke?.boundVariables?.color === variable.variableId) {
            return true;
          }
        }
        // Fallback
        node.strokes = [{ type: 'SOLID', color: resolvedColor }];
        return true;
      } catch (strokeError: any) {
        console.error(`Error setting strokes:`, strokeError.message);
        return false;
      }
    } else if (property === 'text' && node.type === 'TEXT' && 'fills' in node && Array.isArray(node.fills)) {
      if ('fillStyleId' in node) {
        node.fillStyleId = '';
      }
      
      try {
        const paintWithBinding: any = {
          type: 'SOLID',
          color: resolvedColor,
          boundVariables: {
            color: variable.variableId
          }
        };
        
        (node as any).fills = [paintWithBinding];
        await new Promise(resolve => setTimeout(resolve, 20));
        
        const checkNode = await figma.getNodeByIdAsync(node.id);
        if (checkNode && 'fills' in checkNode) {
          const appliedFill = (checkNode as any).fills?.[0] as SolidPaint;
          if (appliedFill?.boundVariables?.color === variable.variableId) {
            return true;
          }
        }
        // Fallback
        node.fills = [{ type: 'SOLID', color: resolvedColor }];
        return true;
      } catch (textError: any) {
        console.error(`Error setting text fills:`, textError.message);
        return false;
      }
    }

    console.error(`Node type ${node.type} doesn't support ${property} property`);
    return false;
  } catch (error: any) {
    console.error(`Error applying variable to ${node.id} (${node.name}):`, error);
    return false;
  }
}

/**
 * Apply a style to a node property
 */
async function applyStyle(
  node: SceneNode,
  property: 'fill' | 'stroke' | 'text',
  style: StyleInfo
): Promise<boolean> {
  try {
    // Check if node is locked
    if ('locked' in node && node.locked) {
      console.error(`Node ${node.id} is locked`);
      return false;
    }

    const paintStyle = figma.getStyleById(style.styleId) as PaintStyle | null;
    if (!paintStyle) {
      console.error(`Style not found: ${style.styleId} (${style.name})`);
      return false;
    }

    if (property === 'fill' && 'fills' in node && 'fillStyleId' in node) {
      // Clear any bound variables first by setting a plain paint
      if (Array.isArray(node.fills) && node.fills.length > 0) {
        const firstFill = node.fills[0];
        if (firstFill.type === 'SOLID') {
          const solidFill = firstFill as SolidPaint;
          if (solidFill.boundVariables && Object.keys(solidFill.boundVariables).length > 0) {
            node.fills = [{
              type: 'SOLID',
              color: solidFill.color,
              opacity: solidFill.opacity !== undefined ? solidFill.opacity : 1
            }];
          }
        }
      }
      
      // Set the style
      try {
        node.fillStyleId = style.styleId;
        // Wait a tick for Figma to process
        await new Promise(resolve => setTimeout(resolve, 0));
        
        if (node.fillStyleId === style.styleId) {
          return true;
        } else {
          return false;
        }
      } catch (styleError: any) {
        return false;
      }
    } else if (property === 'stroke' && 'strokes' in node && 'strokeStyleId' in node) {
      // Clear any bound variables first
      if (Array.isArray(node.strokes) && node.strokes.length > 0) {
        const firstStroke = node.strokes[0];
        if (firstStroke.type === 'SOLID') {
          const solidStroke = firstStroke as SolidPaint;
          if (solidStroke.boundVariables && Object.keys(solidStroke.boundVariables).length > 0) {
            node.strokes = [{
              type: 'SOLID',
              color: solidStroke.color,
              opacity: solidStroke.opacity !== undefined ? solidStroke.opacity : 1
            }];
          }
        }
      }
      
      try {
        node.strokeStyleId = style.styleId;
        await new Promise(resolve => setTimeout(resolve, 0));
        
        if (node.strokeStyleId === style.styleId) {
          return true;
        } else {
          return false;
        }
      } catch (styleError: any) {
        return false;
      }
    } else if (property === 'text' && node.type === 'TEXT' && 'fills' in node && 'fillStyleId' in node) {
      // Clear any bound variables first
      if (Array.isArray(node.fills) && node.fills.length > 0) {
        const firstFill = node.fills[0];
        if (firstFill.type === 'SOLID') {
          const solidFill = firstFill as SolidPaint;
          if (solidFill.boundVariables && Object.keys(solidFill.boundVariables).length > 0) {
            node.fills = [{
              type: 'SOLID',
              color: solidFill.color,
              opacity: solidFill.opacity !== undefined ? solidFill.opacity : 1
            }];
          }
        }
      }
      
      try {
        node.fillStyleId = style.styleId;
        await new Promise(resolve => setTimeout(resolve, 0));
        
        if (node.fillStyleId === style.styleId) {
          return true;
        } else {
          return false;
        }
      } catch (styleError: any) {
        return false;
      }
    }

    return false;
  } catch (error: any) {
    console.error(`Error applying style to ${node.id} (${node.name}):`, error);
    return false;
  }
}

/**
 * Store original state for undo (paint and style)
 */
function storeOriginalState(
  node: SceneNode,
  property: 'fill' | 'stroke' | 'text'
): { paint?: Paint; styleId?: string } | null {
  try {
    if (property === 'fill' && 'fills' in node) {
      const paint = node.fills.length > 0 ? node.fills[0] : undefined;
      const styleId = 'fillStyleId' in node && node.fillStyleId !== figma.mixed ? node.fillStyleId : undefined;
      return { paint, styleId };
    } else if (property === 'stroke' && 'strokes' in node) {
      const paint = node.strokes.length > 0 ? node.strokes[0] : undefined;
      const styleId = 'strokeStyleId' in node && node.strokeStyleId !== figma.mixed ? node.strokeStyleId : undefined;
      return { paint, styleId };
    } else if (property === 'text' && node.type === 'TEXT' && 'fills' in node) {
      const paint = node.fills.length > 0 ? node.fills[0] : undefined;
      const styleId = 'fillStyleId' in node && node.fillStyleId !== figma.mixed ? node.fillStyleId : undefined;
      return { paint, styleId };
    }
  } catch (error) {
    console.error(`Error storing original state for ${node.id}:`, error);
  }
  return null;
}

/**
 * Apply matches to nodes
 */
export async function applyMatches(
  matches: ColorMatch[]
): Promise<{ results: ReplacementResult[]; undoStates: UndoState[] }> {
  const results: ReplacementResult[] = [];
  const undoStates: UndoState[] = [];

  for (const match of matches) {
    if (!match.isMatched) {
      results.push({
        nodeId: match.nodeId,
        nodeName: match.nodeName,
        property: match.property,
        success: false,
        error: 'No match found'
      });
      continue;
    }

    try {
      const node = await figma.getNodeByIdAsync(match.nodeId) as SceneNode | null;
      if (!node) {
        results.push({
          nodeId: match.nodeId,
          nodeName: match.nodeName,
          property: match.property,
          success: false,
          error: 'Node not found'
        });
        continue;
      }

      // Check if node is locked (can't edit locked nodes)
      if ('locked' in node && node.locked) {
        results.push({
          nodeId: match.nodeId,
          nodeName: match.nodeName,
          property: match.property,
          success: false,
          error: 'Node is locked'
        });
        continue;
      }

      // Check if node is in a locked parent
      let parent: BaseNode | null = node.parent;
      let isInLockedParent = false;
      while (parent) {
        if ('locked' in parent && parent.locked) {
          isInLockedParent = true;
          break;
        }
        parent = parent.parent;
      }
      
      if (isInLockedParent) {
        results.push({
          nodeId: match.nodeId,
          nodeName: match.nodeName,
          property: match.property,
          success: false,
          error: 'Node is in a locked group'
        });
        continue;
      }

      // Store original for undo
      const originalState = storeOriginalState(node, match.property);
      if (originalState) {
        undoStates.push({
          nodeId: match.nodeId,
          property: match.property,
          originalPaint: originalState.paint ? JSON.parse(JSON.stringify(originalState.paint)) as Paint : undefined,
          originalStyleId: originalState.styleId
        });
      }

      let success = false;
      let errorMessage = 'Failed to apply';

      if (match.matchedVariable) {
        success = await applyVariable(node, match.property, match.matchedVariable);
        if (!success) errorMessage = 'Failed to apply variable';
      } else if (match.matchedStyle) {
        success = await applyStyle(node, match.property, match.matchedStyle);
        if (!success) errorMessage = 'Failed to apply style';
      } else {
        errorMessage = 'No variable or style to apply';
      }

      results.push({
        nodeId: match.nodeId,
        nodeName: match.nodeName,
        property: match.property,
        success,
        error: success ? undefined : errorMessage
      });
    } catch (error: any) {
      results.push({
        nodeId: match.nodeId,
        nodeName: match.nodeName,
        property: match.property,
        success: false,
        error: error.message || 'Unknown error'
      });
    }
  }

  return { results, undoStates };
}

/**
 * Undo replacements
 */
export async function undoReplacements(undoStates: UndoState[]): Promise<void> {
  for (const undoState of undoStates) {
    try {
      const node = await figma.getNodeByIdAsync(undoState.nodeId) as SceneNode | null;
      if (!node) continue;

      if (undoState.property === 'fill' && 'fills' in node) {
        if (undoState.originalStyleId && 'fillStyleId' in node) {
          node.fillStyleId = undoState.originalStyleId;
        } else if (undoState.originalPaint) {
          node.fillStyleId = '';
          node.fills = [undoState.originalPaint];
        }
      } else if (undoState.property === 'stroke' && 'strokes' in node) {
        if (undoState.originalStyleId && 'strokeStyleId' in node) {
          node.strokeStyleId = undoState.originalStyleId;
        } else if (undoState.originalPaint) {
          node.strokeStyleId = '';
          node.strokes = [undoState.originalPaint];
        }
      } else if (undoState.property === 'text' && node.type === 'TEXT' && 'fills' in node) {
        if (undoState.originalStyleId && 'fillStyleId' in node) {
          node.fillStyleId = undoState.originalStyleId;
        } else if (undoState.originalPaint) {
          node.fillStyleId = '';
          node.fills = [undoState.originalPaint];
        }
      }
    } catch (error) {
      console.error(`Error undoing replacement for ${undoState.nodeId}:`, error);
    }
  }
}
