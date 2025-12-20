import chroma from 'chroma-js';
import { ColorToken } from './tokens';
import { checkAccessibility } from './contrast';

export interface HealthMetric {
  name: string;
  value: number;
  maxValue: number;
  weight: number; // Weight for overall score calculation
  issues: string[];
  suggestions: string[];
}

export interface TokenHealthScore {
  overallScore: number; // 0-100
  metrics: HealthMetric[];
  summary: string;
}

// Calculate token health score
export function calculateTokenHealth(
  baseTokens: Record<string, ColorToken[]>,
  semanticTokens?: any[],
  usageData?: Record<string, number>
): TokenHealthScore {
  const metrics: HealthMetric[] = [];
  
  // 1. Raw colors count (fewer is better, but need some)
  const rawColorCount = Object.values(baseTokens).reduce((sum, tokens) => sum + tokens.length, 0);
  const rawColorScore = Math.max(0, 100 - (rawColorCount - 20) * 2); // Penalize if too many (>20)
  metrics.push({
    name: 'Raw Colors Count',
    value: rawColorCount,
    maxValue: 50,
    weight: 0.1,
    issues: rawColorCount > 50 ? [`Too many raw colors (${rawColorCount}). Consider consolidating.`] : [],
    suggestions: rawColorCount > 50 ? ['Use semantic tokens instead of raw colors', 'Merge similar shades'] : []
  });
  
  // 2. Unused tokens
  const unusedTokens: string[] = [];
  if (usageData) {
    Object.entries(baseTokens).forEach(([group, tokens]) => {
      tokens.forEach(token => {
        const tokenKey = `${group}/${token.shade}`;
        if (!usageData[tokenKey] || usageData[tokenKey] === 0) {
          unusedTokens.push(tokenKey);
        }
      });
    });
  }
  const unusedRatio = usageData ? unusedTokens.length / rawColorCount : 0;
  const unusedScore = Math.max(0, 100 - unusedRatio * 200); // Penalize high unused ratio
  metrics.push({
    name: 'Unused Tokens',
    value: unusedTokens.length,
    maxValue: rawColorCount,
    weight: 0.15,
    issues: unusedTokens.length > 0 ? [`${unusedTokens.length} unused tokens found`] : [],
    suggestions: unusedTokens.length > 0 ? ['Remove unused tokens', 'Consider if tokens are needed for future use'] : []
  });
  
  // 3. Duplicate shades (similar colors)
  const duplicates: string[] = [];
  const colorMap = new Map<string, string[]>();
  
  Object.entries(baseTokens).forEach(([group, tokens]) => {
    tokens.forEach(token => {
      const rounded = chroma(token.value).hex();
      if (!colorMap.has(rounded)) {
        colorMap.set(rounded, []);
      }
      colorMap.get(rounded)!.push(`${group}/${token.shade}`);
    });
  });
  
  colorMap.forEach((paths, color) => {
    if (paths.length > 1) {
      duplicates.push(...paths);
    }
  });
  
  const duplicateScore = Math.max(0, 100 - (duplicates.length / rawColorCount) * 100);
  metrics.push({
    name: 'Duplicate Shades',
    value: duplicates.length,
    maxValue: rawColorCount,
    weight: 0.15,
    issues: duplicates.length > 0 ? [`${duplicates.length} duplicate or very similar colors found`] : [],
    suggestions: duplicates.length > 0 ? ['Merge duplicate colors', 'Use aliases instead of duplicates'] : []
  });
  
  // 4. Contrast failures
  const contrastFailures: string[] = [];
  let contrastChecks = 0;
  let contrastPasses = 0;
  
  // Check common text/background combinations
  Object.entries(baseTokens).forEach(([group, tokens]) => {
    if (group === 'neutral' || group === 'primary') {
      tokens.forEach(token => {
        // Check against white and black backgrounds
        const whiteContrast = checkAccessibility(token.value, '#ffffff');
        const blackContrast = checkAccessibility(token.value, '#000000');
        
        contrastChecks += 2;
        if (whiteContrast.aa) contrastPasses++;
        if (blackContrast.aa) contrastPasses++;
        
        if (!whiteContrast.aa && !blackContrast.aa) {
          contrastFailures.push(`${group}/${token.shade} fails contrast on both white and black`);
        }
      });
    }
  });
  
  const contrastScore = contrastChecks > 0 ? (contrastPasses / contrastChecks) * 100 : 100;
  metrics.push({
    name: 'Contrast Failures',
    value: contrastFailures.length,
    maxValue: rawColorCount,
    weight: 0.25,
    issues: contrastFailures,
    suggestions: contrastFailures.length > 0 ? [
      'Adjust colors to meet WCAG AA (4.5:1) minimum',
      'Use darker/lighter shades for better contrast',
      'Consider high-contrast mode variants'
    ] : []
  });
  
  // 5. Semantic token coverage
  const semanticCoverage = semanticTokens ? (semanticTokens.length / Math.max(1, rawColorCount)) * 100 : 0;
  const semanticScore = Math.min(100, semanticCoverage * 2); // Reward high semantic coverage
  metrics.push({
    name: 'Semantic Coverage',
    value: semanticTokens?.length || 0,
    maxValue: rawColorCount,
    weight: 0.2,
    issues: (semanticTokens?.length || 0) < 10 ? ['Low semantic token coverage'] : [],
    suggestions: (semanticTokens?.length || 0) < 10 ? [
      'Create more semantic tokens',
      'Use semantic tokens instead of raw colors in designs'
    ] : []
  });
  
  // 6. Naming consistency
  const namingIssues: string[] = [];
  Object.keys(baseTokens).forEach(group => {
    if (!/^[a-z]+$/.test(group.toLowerCase())) {
      namingIssues.push(`Group "${group}" has inconsistent naming`);
    }
  });
  const namingScore = namingIssues.length === 0 ? 100 : Math.max(0, 100 - namingIssues.length * 20);
  metrics.push({
    name: 'Naming Consistency',
    value: namingIssues.length,
    maxValue: 10,
    weight: 0.15,
    issues: namingIssues,
    suggestions: namingIssues.length > 0 ? [
      'Use lowercase, kebab-case for token names',
      'Follow consistent naming patterns'
    ] : []
  });
  
  // Calculate overall score
  const overallScore = metrics.reduce((sum, metric) => {
    const normalizedScore = (metric.value / metric.maxValue) * 100;
    const weightedScore = (100 - Math.min(100, normalizedScore)) * metric.weight;
    return sum + weightedScore;
  }, 0);
  
  // Generate summary
  let summary = 'Token system is ';
  if (overallScore >= 90) {
    summary += 'excellent';
  } else if (overallScore >= 75) {
    summary += 'good';
  } else if (overallScore >= 60) {
    summary += 'fair';
  } else {
    summary += 'needs improvement';
  }
  
  return {
    overallScore: Math.round(overallScore),
    metrics,
    summary
  };
}

