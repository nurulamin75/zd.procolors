// Documentation Generator Utility - Enhanced
import chroma from 'chroma-js';
import { getContrast } from './contrast';

export interface ColorDocItem {
  name: string;
  value: string;
  category: string;
  description?: string;
  useCases?: string[];
  accessibility?: {
    onWhite: number;
    onBlack: number;
    wcagAA: boolean;
    wcagAAA: boolean;
  };
  relatedColors?: string[];
}

export interface DocumentationConfig {
  title: string;
  subtitle?: string;
  brandName?: string;
  version?: string;
  author?: string;
  includeAccessibility: boolean;
  includeUseCases: boolean;
  includeCodeSnippets: boolean;
  includeRelatedColors: boolean;
  showColorCodes: boolean;
  format: 'html' | 'markdown' | 'json' | 'css' | 'design-tokens' | 'figma-canvas';
  theme: 'light' | 'dark';
  layout: 'grid' | 'list' | 'compact';
  includeTableOfContents: boolean;
  includeBestPractices: boolean;
  includeColorTheory: boolean;
}

// Generate accessibility information for a color
function getAccessibilityInfo(color: string) {
  const onWhite = getContrast(color, '#FFFFFF');
  const onBlack = getContrast(color, '#000000');
  
  return {
    onWhite,
    onBlack,
    wcagAA: onWhite >= 4.5 || onBlack >= 4.5,
    wcagAAA: onWhite >= 7 || onBlack >= 7,
  };
}

// Categorize colors
function categorizeColor(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('primary')) return 'Brand';
  if (lower.includes('secondary')) return 'Brand';
  if (lower.includes('success') || lower.includes('error') || lower.includes('warning') || lower.includes('info')) return 'Semantic';
  if (lower.includes('neutral') || lower.includes('gray') || lower.includes('grey')) return 'Neutral';
  if (lower.includes('text')) return 'Text';
  if (lower.includes('background') || lower.includes('surface')) return 'Surface';
  if (lower.includes('border')) return 'Border';
  return 'Custom';
}

// Generate use cases based on color name and properties
function generateUseCases(name: string, color: string): string[] {
  const lower = name.toLowerCase();
  const useCases: string[] = [];
  
  if (lower.includes('primary')) {
    useCases.push('Primary buttons and CTAs');
    useCases.push('Links and interactive elements');
    useCases.push('Brand emphasis');
    useCases.push('Active states and selections');
  } else if (lower.includes('secondary')) {
    useCases.push('Secondary actions');
    useCases.push('Supporting content');
    useCases.push('Less prominent UI elements');
    useCases.push('Alternative CTAs');
  } else if (lower.includes('success')) {
    useCases.push('Success messages and notifications');
    useCases.push('Confirmation indicators');
    useCases.push('Positive feedback');
    useCases.push('Completed states');
  } else if (lower.includes('error')) {
    useCases.push('Error messages and alerts');
    useCases.push('Validation failures');
    useCases.push('Destructive actions');
    useCases.push('Critical warnings');
  } else if (lower.includes('warning')) {
    useCases.push('Warning messages');
    useCases.push('Caution indicators');
    useCases.push('Important notices');
    useCases.push('Pending states');
  } else if (lower.includes('info')) {
    useCases.push('Informational messages');
    useCases.push('Tooltips and hints');
    useCases.push('Help content');
    useCases.push('Neutral notifications');
  } else if (lower.includes('neutral')) {
    useCases.push('Text and typography');
    useCases.push('Borders and dividers');
    useCases.push('Disabled states');
    useCases.push('Subtle backgrounds');
  } else if (lower.includes('text')) {
    useCases.push('Body text and paragraphs');
    useCases.push('Headings and titles');
    useCases.push('Labels and captions');
  } else if (lower.includes('background')) {
    useCases.push('Page backgrounds');
    useCases.push('Card backgrounds');
    useCases.push('Container backgrounds');
    useCases.push('Modal overlays');
  }
  
  return useCases.length > 0 ? useCases : ['General UI elements', 'Custom components'];
}

// Find related colors based on hue similarity
function findRelatedColors(targetColor: string, allColors: Record<string, string>): string[] {
  try {
    const targetHue = chroma(targetColor).get('hsl.h') || 0;
    const related: { name: string; diff: number }[] = [];
    
    Object.entries(allColors).forEach(([name, color]) => {
      if (color === targetColor) return;
      try {
        const hue = chroma(color).get('hsl.h') || 0;
        const diff = Math.abs(targetHue - hue);
        if (diff < 30 || diff > 330) {
          related.push({ name, diff });
        }
      } catch (e) {
        // Skip invalid colors
      }
    });
    
    return related
      .sort((a, b) => a.diff - b.diff)
      .slice(0, 3)
      .map(r => r.name);
  } catch (e) {
    return [];
  }
}

// Convert colors to documentation items
export function prepareColorDocumentation(
  colors: Record<string, string>,
  includeAccessibility: boolean = true,
  includeRelated: boolean = false
): ColorDocItem[] {
  return Object.entries(colors).map(([name, value]) => {
    const item: ColorDocItem = {
      name,
      value,
      category: categorizeColor(name),
      useCases: generateUseCases(name, value),
    };
    
    if (includeAccessibility) {
      item.accessibility = getAccessibilityInfo(value);
    }
    
    if (includeRelated) {
      item.relatedColors = findRelatedColors(value, colors);
    }
    
    return item;
  });
}

// Group colors by category
export function groupByCategory(items: ColorDocItem[]): Record<string, ColorDocItem[]> {
  return items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ColorDocItem[]>);
}

// Generate best practices section
function generateBestPractices(): string {
  return `
    <section class="best-practices-section">
      <h2 class="section-title">🎯 Best Practices</h2>
      
      <div class="practice-grid">
        <div class="practice-card">
          <h3>♿ Accessibility First</h3>
          <ul>
            <li>Maintain WCAG AA contrast ratio (4.5:1) for all text</li>
            <li>Use AAA (7:1) for critical information</li>
            <li>Test with color blindness simulators</li>
            <li>Don't rely solely on color to convey information</li>
          </ul>
        </div>
        
        <div class="practice-card">
          <h3>🎨 Consistency</h3>
          <ul>
            <li>Use semantic colors for consistent meaning</li>
            <li>Maintain consistent color usage across components</li>
            <li>Document exceptions to the standard palette</li>
            <li>Create a single source of truth</li>
          </ul>
        </div>
        
        <div class="practice-card">
          <h3>📐 Hierarchy</h3>
          <ul>
            <li>Use primary colors for main actions</li>
            <li>Reserve bright colors for important elements</li>
            <li>Use neutral colors for less important UI</li>
            <li>Create clear visual hierarchy with color</li>
          </ul>
        </div>
        
        <div class="practice-card">
          <h3>🔄 Scalability</h3>
          <ul>
            <li>Define colors as design tokens/variables</li>
            <li>Use consistent naming conventions</li>
            <li>Document color relationships and aliases</li>
            <li>Plan for light/dark mode variations</li>
          </ul>
        </div>
      </div>
    </section>
  `;
}

// Generate color theory section
function generateColorTheory(colors: Record<string, string>): string {
  const colorCount = Object.keys(colors).length;
  const categories = new Set(Object.values(colors).map(c => categorizeColor(c)));
  
  return `
    <section class="color-theory-section">
      <h2 class="section-title">🎓 Color System Analysis</h2>
      
      <div class="analysis-grid">
        <div class="analysis-card">
          <div class="analysis-number">${colorCount}</div>
          <div class="analysis-label">Total Colors</div>
        </div>
        
        <div class="analysis-card">
          <div class="analysis-number">${categories.size}</div>
          <div class="analysis-label">Categories</div>
        </div>
        
        <div class="analysis-card">
          <div class="analysis-number">${Object.values(colors).filter(c => {
            try {
              return getAccessibilityInfo(c).wcagAA;
            } catch { return false; }
          }).length}</div>
          <div class="analysis-label">WCAG AA Compliant</div>
        </div>
      </div>
      
      <div class="theory-content">
        <h3>Color Psychology</h3>
        <p>Your color system communicates specific emotions and messages:</p>
        <ul>
          <li><strong>Blues:</strong> Trust, stability, professionalism</li>
          <li><strong>Greens:</strong> Growth, success, harmony</li>
          <li><strong>Reds:</strong> Urgency, attention, importance</li>
          <li><strong>Yellows/Oranges:</strong> Warmth, optimism, caution</li>
          <li><strong>Neutrals:</strong> Balance, sophistication, clarity</li>
        </ul>
      </div>
    </section>
  `;
}

// Generate table of contents
function generateTableOfContents(categories: string[]): string {
  return `
    <nav class="table-of-contents">
      <h2>📑 Table of Contents</h2>
      <ul>
        ${categories.map(cat => `<li><a href="#${cat.toLowerCase()}">${cat} Colors</a></li>`).join('\n        ')}
        <li><a href="#best-practices">Best Practices</a></li>
        <li><a href="#color-theory">Color Theory</a></li>
      </ul>
    </nav>
  `;
}

// Generate enhanced HTML documentation
export function generateHTMLDocumentation(
  items: ColorDocItem[],
  config: DocumentationConfig
): string {
  const grouped = groupByCategory(items);
  const isDark = config.theme === 'dark';
  
  const bgColor = isDark ? '#0f172a' : '#ffffff';
  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const mutedColor = isDark ? '#94a3b8' : '#64748b';
  const borderColor = isDark ? '#334155' : '#e2e8f0';
  const cardBg = isDark ? '#1e293b' : '#f8fafc';
  
  const layoutClass = config.layout || 'grid';
  
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: ${bgColor};
            color: ${textColor};
            line-height: 1.6;
            padding: 40px 20px;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        
        header {
            text-align: center;
            margin-bottom: 60px;
            padding-bottom: 40px;
            border-bottom: 2px solid ${borderColor};
        }
        
        h1 {
            font-size: 56px;
            font-weight: 700;
            margin-bottom: 12px;
            background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .subtitle {
            font-size: 18px;
            color: ${mutedColor};
            margin-top: 8px;
        }
        
        .meta-info {
            display: flex;
            justify-content: center;
            gap: 24px;
            margin-top: 20px;
            font-size: 14px;
            color: ${mutedColor};
        }
        
        .meta-item {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .table-of-contents {
            background: ${cardBg};
            border: 1px solid ${borderColor};
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 40px;
        }
        
        .table-of-contents h2 {
            font-size: 20px;
            margin-bottom: 16px;
        }
        
        .table-of-contents ul {
            list-style: none;
        }
        
        .table-of-contents li {
            padding: 8px 0;
        }
        
        .table-of-contents a {
            color: #2563eb;
            text-decoration: none;
            transition: color 0.2s;
        }
        
        .table-of-contents a:hover {
            color: #1d4ed8;
        }
        
        .category-section {
            margin-bottom: 60px;
            scroll-margin-top: 20px;
        }
        
        .category-title {
            font-size: 32px;
            font-weight: 600;
            margin-bottom: 24px;
            color: ${textColor};
        }
        
        .color-grid {
            display: grid;
            grid-template-columns: ${layoutClass === 'grid' ? 'repeat(auto-fill, minmax(320px, 1fr))' : '1fr'};
            gap: ${layoutClass === 'compact' ? '12px' : '24px'};
            margin-bottom: 40px;
        }
        
        .color-card {
            background: ${cardBg};
            border: 1px solid ${borderColor};
            border-radius: 16px;
            overflow: hidden;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .color-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 24px rgba(0, 0, 0, ${isDark ? '0.3' : '0.1'});
        }
        
        .color-swatch {
            height: ${layoutClass === 'compact' ? '80px' : '120px'};
            position: relative;
        }
        
        .color-value {
            position: absolute;
            bottom: 12px;
            right: 12px;
            background: rgba(255, 255, 255, 0.95);
            color: #1e293b;
            padding: 6px 12px;
            border-radius: 6px;
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 12px;
            font-weight: 600;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
        
        .color-info {
            padding: ${layoutClass === 'compact' ? '12px' : '20px'};
        }
        
        .color-name {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 8px;
            text-transform: capitalize;
        }
        
        .accessibility-info {
            background: ${isDark ? '#0f172a' : '#ffffff'};
            border: 1px solid ${borderColor};
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 16px;
        }
        
        .accessibility-title {
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: ${mutedColor};
            margin-bottom: 8px;
        }
        
        .contrast-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-bottom: 8px;
        }
        
        .contrast-item {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
        }
        
        .wcag-badges {
            display: flex;
            gap: 8px;
            margin-top: 8px;
        }
        
        .badge {
            font-size: 10px;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .badge-success {
            background: #dcfce7;
            color: #166534;
        }
        
        .badge-fail {
            background: #fee2e2;
            color: #991b1b;
        }
        
        .use-cases, .related-colors {
            margin-top: 16px;
        }
        
        .section-subtitle {
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: ${mutedColor};
            margin-bottom: 8px;
        }
        
        .use-cases-list {
            list-style: none;
        }
        
        .use-cases-list li {
            font-size: 13px;
            color: ${textColor};
            padding: 4px 0;
            padding-left: 16px;
            position: relative;
        }
        
        .use-cases-list li:before {
            content: "→";
            position: absolute;
            left: 0;
            color: #2563eb;
        }
        
        .related-colors-list {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }
        
        .related-tag {
            font-size: 12px;
            padding: 4px 10px;
            background: #eff6ff;
            color: #2563eb;
            border-radius: 12px;
            font-weight: 500;
        }
        
        .code-snippet {
            background: ${isDark ? '#0f172a' : '#1e293b'};
            color: ${isDark ? '#e2e8f0' : '#f8fafc'};
            padding: 16px;
            border-radius: 8px;
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 13px;
            margin-top: 16px;
            overflow-x: auto;
        }
        
        .best-practices-section, .color-theory-section {
            background: ${cardBg};
            border: 2px solid ${borderColor};
            border-radius: 16px;
            padding: 32px;
            margin-bottom: 40px;
        }
        
        .section-title {
            font-size: 32px;
            font-weight: 600;
            margin-bottom: 24px;
        }
        
        .practice-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            margin-top: 24px;
        }
        
        .practice-card {
            background: ${isDark ? '#0f172a' : '#ffffff'};
            border: 1px solid ${borderColor};
            padding: 20px;
            border-radius: 12px;
        }
        
        .practice-card h3 {
            font-size: 18px;
            margin-bottom: 12px;
            color: ${textColor};
        }
        
        .practice-card ul {
            list-style-position: inside;
            color: ${mutedColor};
            font-size: 14px;
            line-height: 1.8;
        }
        
        .analysis-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
        }
        
        .analysis-card {
            background: ${isDark ? '#0f172a' : '#ffffff'};
            border: 1px solid ${borderColor};
            padding: 20px;
            border-radius: 12px;
            text-align: center;
        }
        
        .analysis-number {
            font-size: 36px;
            font-weight: 700;
            color: #2563eb;
            margin-bottom: 8px;
        }
        
        .analysis-label {
            font-size: 14px;
            color: ${mutedColor};
        }
        
        .theory-content {
            background: ${isDark ? '#0f172a' : '#ffffff'};
            border: 1px solid ${borderColor};
            padding: 24px;
            border-radius: 12px;
        }
        
        .theory-content h3 {
            font-size: 20px;
            margin-bottom: 12px;
        }
        
        .theory-content p {
            color: ${mutedColor};
            margin-bottom: 16px;
        }
        
        .theory-content ul {
            list-style-position: inside;
            color: ${mutedColor};
            line-height: 1.8;
        }
        
        footer {
            text-align: center;
            margin-top: 80px;
            padding-top: 40px;
            border-top: 2px solid ${borderColor};
            color: ${mutedColor};
            font-size: 14px;
        }
        
        @media print {
            body { padding: 20px; }
            .color-card:hover { transform: none; box-shadow: none; }
        }
        
        @media (max-width: 768px) {
            h1 { font-size: 36px; }
            .color-grid { grid-template-columns: 1fr; }
            .practice-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>${config.title}</h1>
            ${config.subtitle ? `<p class="subtitle">${config.subtitle}</p>` : ''}
            <div class="meta-info">
                ${config.brandName ? `<div class="meta-item"><strong>Brand:</strong> ${config.brandName}</div>` : ''}
                ${config.version ? `<div class="meta-item"><strong>Version:</strong> ${config.version}</div>` : ''}
                ${config.author ? `<div class="meta-item"><strong>Author:</strong> ${config.author}</div>` : ''}
                <div class="meta-item"><strong>Generated:</strong> ${new Date().toLocaleDateString()}</div>
            </div>
        </header>
        
        <main>`;
  
  // Table of Contents
  if (config.includeTableOfContents) {
    html += generateTableOfContents(Object.keys(grouped));
  }
  
  // Best Practices
  if (config.includeBestPractices) {
    html += generateBestPractices();
  }
  
  // Color Theory
  if (config.includeColorTheory) {
    const allColors = items.reduce((acc, item) => {
      acc[item.name] = item.value;
      return acc;
    }, {} as Record<string, string>);
    html += generateColorTheory(allColors);
  }
  
  // Generate sections for each category
  Object.entries(grouped).forEach(([category, colors]) => {
    html += `
            <section class="category-section" id="${category.toLowerCase()}">
                <h2 class="category-title">${category} Colors</h2>
                <div class="color-grid ${layoutClass}">`;
    
    colors.forEach(color => {
      html += `
                    <div class="color-card">
                        <div class="color-swatch" style="background-color: ${color.value};">
                            ${config.showColorCodes ? `<div class="color-value">${color.value.toUpperCase()}</div>` : ''}
                        </div>
                        <div class="color-info">
                            <h3 class="color-name">${color.name}</h3>`;
      
      if (config.includeAccessibility && color.accessibility) {
        const { onWhite, onBlack, wcagAA, wcagAAA } = color.accessibility;
        html += `
                            <div class="accessibility-info">
                                <div class="accessibility-title">Contrast Ratios</div>
                                <div class="contrast-grid">
                                    <div class="contrast-item">
                                        <span>On White:</span>
                                        <span><strong>${onWhite.toFixed(2)}:1</strong></span>
                                    </div>
                                    <div class="contrast-item">
                                        <span>On Black:</span>
                                        <span><strong>${onBlack.toFixed(2)}:1</strong></span>
                                    </div>
                                </div>
                                <div class="wcag-badges">
                                    <span class="badge ${wcagAA ? 'badge-success' : 'badge-fail'}">
                                        WCAG AA ${wcagAA ? '✓' : '✗'}
                                    </span>
                                    <span class="badge ${wcagAAA ? 'badge-success' : 'badge-fail'}">
                                        WCAG AAA ${wcagAAA ? '✓' : '✗'}
                                    </span>
                                </div>
                            </div>`;
      }
      
      if (config.includeUseCases && color.useCases && color.useCases.length > 0) {
        html += `
                            <div class="use-cases">
                                <div class="section-subtitle">Use Cases</div>
                                <ul class="use-cases-list">
                                    ${color.useCases.map(useCase => `<li>${useCase}</li>`).join('\n                                    ')}
                                </ul>
                            </div>`;
      }
      
      if (config.includeRelatedColors && color.relatedColors && color.relatedColors.length > 0) {
        html += `
                            <div class="related-colors">
                                <div class="section-subtitle">Related Colors</div>
                                <div class="related-colors-list">
                                    ${color.relatedColors.map(name => `<span class="related-tag">${name}</span>`).join('\n                                    ')}
                                </div>
                            </div>`;
      }
      
      if (config.includeCodeSnippets) {
        try {
          const rgb = chroma(color.value).rgb();
          const hsl = chroma(color.value).hsl().map((v, i) => i === 0 ? Math.round(v) : Math.round(v * 100) + '%');
          
          html += `
                            <div class="code-snippet">
                                <pre>// CSS Variable
--${color.name.toLowerCase().replace(/\s+/g, '-')}: ${color.value};

// RGB
rgb(${rgb.join(', ')})

// HSL
hsl(${hsl.join(', ')})</pre>
                            </div>`;
        } catch (e) {
          // Skip if color conversion fails
        }
      }
      
      html += `
                        </div>
                    </div>`;
    });
    
    html += `
                </div>
            </section>`;
  });
  
  html += `
        </main>
        
        <footer>
            <p><strong>Generated with ProColors</strong> • ${new Date().toLocaleDateString()} • ${items.length} colors documented</p>
            ${config.version ? `<p>Version ${config.version}</p>` : ''}
        </footer>
    </div>
</body>
</html>`;
  
  return html;
}

// Generate Markdown documentation
export function generateMarkdownDocumentation(
  items: ColorDocItem[],
  config: DocumentationConfig
): string {
  const grouped = groupByCategory(items);
  
  let markdown = `# ${config.title}\n\n`;
  
  if (config.subtitle) {
    markdown += `${config.subtitle}\n\n`;
  }
  
  if (config.brandName || config.version || config.author) {
    markdown += `---\n`;
    if (config.brandName) markdown += `**Brand:** ${config.brandName}  \n`;
    if (config.version) markdown += `**Version:** ${config.version}  \n`;
    if (config.author) markdown += `**Author:** ${config.author}  \n`;
    markdown += `**Generated:** ${new Date().toLocaleDateString()}\n\n`;
    markdown += `---\n\n`;
  }
  
  // Table of Contents
  if (config.includeTableOfContents) {
    markdown += `## 📑 Table of Contents\n\n`;
    Object.keys(grouped).forEach(category => {
      markdown += `- [${category} Colors](#${category.toLowerCase()}-colors)\n`;
    });
    if (config.includeBestPractices) markdown += `- [Best Practices](#best-practices)\n`;
    markdown += `\n---\n\n`;
  }
  
  // Best Practices
  if (config.includeBestPractices) {
    markdown += `## 🎯 Best Practices\n\n`;
    markdown += `### ♿ Accessibility First\n`;
    markdown += `- Maintain WCAG AA contrast ratio (4.5:1) for all text\n`;
    markdown += `- Use AAA (7:1) for critical information\n`;
    markdown += `- Test with color blindness simulators\n\n`;
    markdown += `### 🎨 Consistency\n`;
    markdown += `- Use semantic colors for consistent meaning\n`;
    markdown += `- Maintain consistent color usage across components\n\n`;
    markdown += `---\n\n`;
  }
  
  // Generate sections for each category
  Object.entries(grouped).forEach(([category, colors]) => {
    markdown += `## ${category} Colors\n\n`;
    
    colors.forEach(color => {
      markdown += `### ${color.name}\n\n`;
      markdown += `\`\`\`\n${color.value.toUpperCase()}\n\`\`\`\n\n`;
      
      if (config.includeAccessibility && color.accessibility) {
        const { onWhite, onBlack, wcagAA, wcagAAA } = color.accessibility;
        markdown += `**Accessibility:**\n`;
        markdown += `- Contrast on white: ${onWhite.toFixed(2)}:1\n`;
        markdown += `- Contrast on black: ${onBlack.toFixed(2)}:1\n`;
        markdown += `- WCAG AA: ${wcagAA ? '✅ Pass' : '❌ Fail'}\n`;
        markdown += `- WCAG AAA: ${wcagAAA ? '✅ Pass' : '❌ Fail'}\n\n`;
      }
      
      if (config.includeUseCases && color.useCases && color.useCases.length > 0) {
        markdown += `**Use Cases:**\n`;
        color.useCases.forEach(useCase => {
          markdown += `- ${useCase}\n`;
        });
        markdown += `\n`;
      }
      
      if (config.includeRelatedColors && color.relatedColors && color.relatedColors.length > 0) {
        markdown += `**Related Colors:** ${color.relatedColors.join(', ')}\n\n`;
      }
      
      if (config.includeCodeSnippets) {
        try {
          const rgb = chroma(color.value).rgb();
          const hsl = chroma(color.value).hsl().map((v, i) => i === 0 ? Math.round(v) : Math.round(v * 100) + '%');
          
          markdown += `**Code:**\n`;
          markdown += `\`\`\`css\n`;
          markdown += `/* CSS Variable */\n`;
          markdown += `--${color.name.toLowerCase().replace(/\s+/g, '-')}: ${color.value};\n\n`;
          markdown += `/* RGB */\n`;
          markdown += `rgb(${rgb.join(', ')});\n\n`;
          markdown += `/* HSL */\n`;
          markdown += `hsl(${hsl.join(', ')});\n`;
          markdown += `\`\`\`\n\n`;
        } catch (e) {
          // Skip if color conversion fails
        }
      }
      
      markdown += `---\n\n`;
    });
  });
  
  markdown += `\n\n_Generated with ProColors • ${new Date().toLocaleDateString()} • ${items.length} colors documented_\n`;
  
  return markdown;
}

// Generate JSON format
export function generateJSONFormat(items: ColorDocItem[]): string {
  return JSON.stringify(items, null, 2);
}

// Generate CSS format
export function generateCSSFormat(colors: Record<string, string>): string {
  let css = `:root {\n`;
  Object.entries(colors).forEach(([name, value]) => {
    const varName = name.toLowerCase().replace(/\s+/g, '-');
    css += `  --color-${varName}: ${value};\n`;
  });
  css += `}\n`;
  return css;
}

// Generate W3C Design Tokens format
export function generateDesignTokensFormat(colors: Record<string, string>): string {
  const tokens: any = {
    colors: {}
  };
  
  Object.entries(colors).forEach(([name, value]) => {
    tokens.colors[name] = {
      $value: value,
      $type: 'color'
    };
  });
  
  return JSON.stringify(tokens, null, 2);
}

// Generate Figma Canvas format (structured data for creating Figma frames)
export function generateFigmaCanvasFormat(
  items: ColorDocItem[],
  config: DocumentationConfig
): string {
  const grouped = groupByCategory(items);
  
  const figmaData = {
    title: config.title,
    subtitle: config.subtitle,
    brandName: config.brandName,
    version: config.version,
    author: config.author,
    generatedDate: new Date().toLocaleDateString(),
    layout: config.layout || 'grid',
    includeAccessibility: config.includeAccessibility,
    includeUseCases: config.includeUseCases,
    includeCodeSnippets: config.includeCodeSnippets,
    includeRelatedColors: config.includeRelatedColors,
    includeBestPractices: config.includeBestPractices,
    includeColorTheory: config.includeColorTheory,
    categories: Object.entries(grouped).map(([category, colors]) => ({
      name: category,
      colors: colors.map(color => ({
        name: color.name,
        value: color.value,
        category: color.category,
        useCases: color.useCases,
        accessibility: color.accessibility,
        relatedColors: color.relatedColors
      }))
    })),
    totalColors: items.length
  };
  
  return JSON.stringify(figmaData);
}

// Main documentation generator function
export function generateDocumentation(
  colors: Record<string, string>,
  config: DocumentationConfig
): string {
  const items = prepareColorDocumentation(
    colors,
    config.includeAccessibility,
    config.includeRelatedColors
  );
  
  switch (config.format) {
    case 'html':
      return generateHTMLDocumentation(items, config);
    case 'markdown':
      return generateMarkdownDocumentation(items, config);
    case 'json':
      return generateJSONFormat(items);
    case 'css':
      return generateCSSFormat(colors);
    case 'design-tokens':
      return generateDesignTokensFormat(colors);
    case 'figma-canvas':
      return generateFigmaCanvasFormat(items, config);
    default:
      return generateHTMLDocumentation(items, config);
  }
}

// Download documentation
export function downloadDocumentation(content: string, filename: string, format: string) {
  const mimeTypes: Record<string, string> = {
    html: 'text/html',
    markdown: 'text/markdown',
    json: 'application/json',
    css: 'text/css',
    'design-tokens': 'application/json'
  };
  
  const extensions: Record<string, string> = {
    html: 'html',
    markdown: 'md',
    json: 'json',
    css: 'css',
    'design-tokens': 'tokens.json'
  };
  
  const mimeType = mimeTypes[format] || 'text/plain';
  const extension = extensions[format] || 'txt';
  const fullFilename = filename.includes('.') ? filename : `${filename}.${extension}`;
  
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = fullFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
