/**
 * Scanner for unlinked colors in Figma nodes
 */

export interface UnlinkedColor {
  nodeId: string;
  nodeName: string;
  property: 'fill' | 'stroke' | 'text';
  rawColor: { r: number; g: number; b: number };
  originalPaint?: Paint;
}

/**
 * Check if a paint is linked to a variable
 */
function isLinkedToVariable(paint: Paint): boolean {
  if (paint.type === 'SOLID') {
    // Check if it's bound to a variable
    if ('boundVariables' in paint && paint.boundVariables) {
      return Object.keys(paint.boundVariables).length > 0;
    }
  }
  return false;
}

/**
 * Check if a node property is using a style
 */
function isUsingStyle(node: SceneNode, property: 'fill' | 'stroke' | 'text'): boolean {
  if (property === 'fill' && 'fillStyleId' in node) {
    return node.fillStyleId !== figma.mixed && node.fillStyleId !== '';
  } else if (property === 'stroke' && 'strokeStyleId' in node) {
    return node.strokeStyleId !== figma.mixed && node.strokeStyleId !== '';
  } else if (property === 'text' && node.type === 'TEXT' && 'fillStyleId' in node) {
    return node.fillStyleId !== figma.mixed && node.fillStyleId !== '';
  }
  return false;
}

/**
 * Extract RGB from a solid paint
 */
function extractRGB(paint: SolidPaint): { r: number; g: number; b: number } | null {
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
 * Scan a node for unlinked colors
 */
function scanNode(node: SceneNode): UnlinkedColor[] {
  const unlinked: UnlinkedColor[] = [];

  // Skip hidden nodes
  if ('visible' in node && node.visible === false) {
    return unlinked;
  }

  // Check fills
  if ('fills' in node && Array.isArray(node.fills) && !isUsingStyle(node, 'fill')) {
    node.fills.forEach((fill, index) => {
      // Skip gradients and images
      if (fill.type === 'SOLID' && !isLinkedToVariable(fill)) {
        const rgb = extractRGB(fill);
        if (rgb) {
          unlinked.push({
            nodeId: node.id,
            nodeName: node.name,
            property: 'fill',
            rawColor: rgb,
            originalPaint: fill
          });
        }
      }
    });
  }

  // Check strokes
  if ('strokes' in node && Array.isArray(node.strokes) && !isUsingStyle(node, 'stroke')) {
    node.strokes.forEach((stroke, index) => {
      // Skip gradients and images
      if (stroke.type === 'SOLID' && !isLinkedToVariable(stroke)) {
        const rgb = extractRGB(stroke);
        if (rgb) {
          unlinked.push({
            nodeId: node.id,
            nodeName: node.name,
            property: 'stroke',
            rawColor: rgb,
            originalPaint: stroke
          });
        }
      }
    });
  }

  // Check text fills (for TEXT nodes)
  if (node.type === 'TEXT' && 'fills' in node && Array.isArray(node.fills) && !isUsingStyle(node, 'text')) {
    node.fills.forEach((fill) => {
      if (fill.type === 'SOLID' && !isLinkedToVariable(fill)) {
        const rgb = extractRGB(fill);
        if (rgb) {
          unlinked.push({
            nodeId: node.id,
            nodeName: node.name,
            property: 'text',
            rawColor: rgb,
            originalPaint: fill
          });
        }
      }
    });
  }

  return unlinked;
}

/**
 * Recursively scan all nodes in a selection
 */
export function scanSelection(selection: readonly SceneNode[]): UnlinkedColor[] {
  const unlinked: UnlinkedColor[] = [];

  function traverse(node: SceneNode) {
    // Scan current node
    unlinked.push(...scanNode(node));

    // Traverse children
    if ('children' in node) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }

  for (const node of selection) {
    traverse(node);
  }

  return unlinked;
}

/**
 * Scan entire page
 */
export function scanPage(page: PageNode): UnlinkedColor[] {
  return scanSelection(page.children);
}

