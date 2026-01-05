import React, { useState, useMemo } from 'react';
import { FileText, Download, Eye, Settings, Sparkles, BookOpen, Code, Palette, Figma } from 'lucide-react';
import {
  generateDocumentation,
  downloadDocumentation,
  DocumentationConfig,
} from '../../../../utils/documentation';

interface DocumentationGeneratorProps {
  colors: Record<string, string>;
  palettes?: Record<string, Record<number, string>>;
  brandName?: string;
}

export const DocumentationGenerator: React.FC<DocumentationGeneratorProps> = ({
  colors,
  palettes = {},
  brandName
}) => {
  const [config, setConfig] = useState<DocumentationConfig>({
    title: 'Color System Documentation',
    subtitle: 'A comprehensive guide to our color palette',
    brandName: brandName || '',
    version: '1.0.0',
    author: '',
    includeAccessibility: true,
    includeUseCases: true,
    includeCodeSnippets: true,
    includeRelatedColors: true,
    showColorCodes: true,
    format: 'html',
    theme: 'light',
    layout: 'grid',
    includeTableOfContents: true,
    includeBestPractices: true,
    includeColorTheory: true,
  });

  const [showPreview, setShowPreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const documentation = useMemo(() => {
    return generateDocumentation(colors, config);
  }, [colors, config]);

  const colorCount = Object.keys(colors).length;

  const handleExport = async () => {
    if (config.format === 'figma-canvas') {
      // Export to Figma canvas
      setIsExporting(true);
      try {
        const data = JSON.parse(documentation);
        // Add palettes data for shades - ensure it's properly formatted
        console.log('Palettes being sent:', palettes);
        data.palettes = palettes;
        console.log('Full data being sent:', data);
        (window as any).parent.postMessage(
          {
            pluginMessage: {
              type: 'export-documentation-to-canvas',
              data
            }
          },
          '*'
        );
        
        // Listen for result
        const handleMessage = (event: MessageEvent) => {
          const msg = event.data.pluginMessage || event.data;
          if (msg.type === 'export-documentation-to-canvas-result') {
            setIsExporting(false);
            window.removeEventListener('message', handleMessage);
          }
        };
        window.addEventListener('message', handleMessage);
        
        // Timeout after 10 seconds
        setTimeout(() => {
          setIsExporting(false);
          window.removeEventListener('message', handleMessage);
        }, 10000);
        
      } catch (err) {
        console.error('Error exporting to canvas:', err);
        setIsExporting(false);
      }
    } else {
      // Download as file
      const extensions: Record<string, string> = {
        html: 'html',
        markdown: 'md',
        json: 'json',
        css: 'css',
        'design-tokens': 'tokens.json'
      };
      const extension = extensions[config.format] || 'html';
      const filename = `color-documentation.${extension}`;
      downloadDocumentation(documentation, filename, config.format);
    }
  };

  const updateConfig = <K extends keyof DocumentationConfig>(
    key: K,
    value: DocumentationConfig[K]
  ) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const formatOptions = [
    { value: 'html' as const, label: 'HTML', icon: FileText, description: 'Beautiful standalone webpage' },
    { value: 'markdown' as const, label: 'Markdown', icon: BookOpen, description: 'Clean, readable docs' },
    { value: 'figma-canvas' as const, label: 'Figma Canvas', icon: Figma, description: 'Create frames in Figma' },
    { value: 'json' as const, label: 'JSON', icon: Code, description: 'Structured data format' },
    { value: 'css' as const, label: 'CSS', icon: Palette, description: 'CSS variables' },
    { value: 'design-tokens' as const, label: 'Design Tokens', icon: Sparkles, description: 'W3C standard format' },
  ];

  return (
    <div className="animate-fade-in" style={{ padding: '0 24px 24px 24px', height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <FileText size={24} color="#2563eb" />
          <h2 style={{ fontSize: '24px', fontWeight: '600', margin: 0 }}>
            Documentation Generator
          </h2>
        </div>
        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
          Generate professional, comprehensive documentation for your color system in multiple formats
        </p>
      </div>

      {/* Stats Card */}
      <div style={{
        backgroundColor: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <Sparkles size={20} color="#2563eb" />
        <div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e40af' }}>
            Ready to document {colorCount} color{colorCount !== 1 ? 's' : ''}
          </div>
          <div style={{ fontSize: '12px', color: '#3b82f6', marginTop: '2px' }}>
            Customize settings below and generate your documentation in seconds
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: '24px' }}>
        {/* Settings Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Basic Info Card */}
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Settings size={18} color="#64748b" />
              <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
                Basic Information
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#64748b',
                  marginBottom: '8px'
                }}>
                  Document Title *
                </label>
                <input
                  type="text"
                  value={config.title}
                  onChange={(e) => updateConfig('title', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#64748b',
                  marginBottom: '8px'
                }}>
                  Subtitle
                </label>
                <input
                  type="text"
                  value={config.subtitle}
                  onChange={(e) => updateConfig('subtitle', e.target.value)}
                  placeholder="Brief description"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: '#64748b',
                    marginBottom: '8px'
                  }}>
                    Version
                  </label>
                  <input
                    type="text"
                    value={config.version}
                    onChange={(e) => updateConfig('version', e.target.value)}
                    placeholder="1.0.0"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: '#64748b',
                    marginBottom: '8px'
                  }}>
                    Author
                  </label>
                  <input
                    type="text"
                    value={config.author}
                    onChange={(e) => updateConfig('author', e.target.value)}
                    placeholder="Your name"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Format Selection Card */}
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
              Export Format
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {formatOptions.map(({ value, label, icon: Icon, description }) => (
                <button
                  key={value}
                  onClick={() => updateConfig('format', value)}
                  style={{
                    padding: '12px',
                    border: `2px solid ${config.format === value ? '#2563eb' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    backgroundColor: config.format === value ? '#eff6ff' : 'white',
                    color: config.format === value ? '#2563eb' : '#1e293b',
                    transition: 'all 0.2s',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <Icon size={20} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600' }}>{label}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                      {description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Layout & Theme (only for HTML and Figma Canvas) */}
          {(config.format === 'html' || config.format === 'figma-canvas') && (
            <div style={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                Appearance
              </h3>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#64748b',
                  marginBottom: '8px'
                }}>
                  Layout Style
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['grid', 'list', 'compact'] as const).map(layout => (
                    <button
                      key={layout}
                      onClick={() => updateConfig('layout', layout)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        border: `2px solid ${config.layout === layout ? '#2563eb' : '#e2e8f0'}`,
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        backgroundColor: config.layout === layout ? '#eff6ff' : 'white',
                        color: config.layout === layout ? '#2563eb' : '#64748b',
                        transition: 'all 0.2s',
                        textTransform: 'capitalize'
                      }}
                    >
                      {layout}
                    </button>
                  ))}
                </div>
              </div>

              {config.format === 'html' && (
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: '#64748b',
                    marginBottom: '8px'
                  }}>
                    Theme
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {(['light', 'dark'] as const).map(theme => (
                      <button
                        key={theme}
                        onClick={() => updateConfig('theme', theme)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          border: `2px solid ${config.theme === theme ? '#2563eb' : '#e2e8f0'}`,
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          backgroundColor: config.theme === theme ? '#eff6ff' : 'white',
                          color: config.theme === theme ? '#2563eb' : '#64748b',
                          transition: 'all 0.2s',
                          textTransform: 'capitalize'
                        }}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Content Options */}
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
              Content Options
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { key: 'includeTableOfContents' as const, label: 'Table of Contents', description: 'Navigation for sections' },
                { key: 'includeBestPractices' as const, label: 'Best Practices', description: 'Design guidelines' },
                { key: 'includeColorTheory' as const, label: 'Color Theory', description: 'Psychology & analysis' },
                { key: 'includeAccessibility' as const, label: 'Accessibility Info', description: 'WCAG contrast ratios' },
                { key: 'includeUseCases' as const, label: 'Use Cases', description: 'Suggested applications' },
                { key: 'includeCodeSnippets' as const, label: 'Code Snippets', description: 'CSS, RGB, HSL values' },
                { key: 'includeRelatedColors' as const, label: 'Related Colors', description: 'Color relationships' },
                { key: 'showColorCodes' as const, label: 'Show Hex Codes', description: 'Display on swatches' },
              ].map(({ key, label, description }) => (
                <label key={key} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '6px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <input
                    type="checkbox"
                    checked={config[key]}
                    onChange={(e) => updateConfig(key, e.target.checked)}
                    style={{
                      marginTop: '2px',
                      cursor: 'pointer',
                      width: '16px',
                      height: '16px'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '2px' }}>
                      {label}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setShowPreview(!showPreview)}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              <Eye size={16} />
              {showPreview ? 'Hide' : 'Preview'}
            </button>
            
            <button
              onClick={handleExport}
              disabled={isExporting}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: isExporting ? '#94a3b8' : '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isExporting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!isExporting) {
                  e.currentTarget.style.backgroundColor = '#1d4ed8';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isExporting) {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {config.format === 'figma-canvas' ? (
                <>
                  <Figma size={16} />
                  {isExporting ? 'Creating...' : 'Create in Figma'}
                </>
              ) : (
                <>
                  <Download size={16} />
                  Download
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preview Panel */}
        <div>
          {showPreview ? (
            <div style={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '20px',
              height: 'calc(100vh - 200px)',
              overflow: 'auto'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
                  Preview
                </h3>
                <span style={{
                  fontSize: '12px',
                  padding: '4px 8px',
                  backgroundColor: '#f1f5f9',
                  color: '#64748b',
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                  fontWeight: '600'
                }}>
                  {config.format}
                </span>
              </div>

              {config.format === 'html' ? (
                <iframe
                  srcDoc={documentation}
                  style={{
                    width: '100%',
                    height: 'calc(100% - 60px)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                  title="Documentation Preview"
                />
              ) : config.format === 'figma-canvas' ? (
                <div style={{
                  backgroundColor: '#f8fafc',
                  padding: '32px',
                  borderRadius: '8px',
                  height: 'calc(100% - 60px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center'
                }}>
                  <Figma size={64} color="#2563eb" style={{ marginBottom: '20px' }} />
                  <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px', color: '#1e293b' }}>
                    Figma Canvas Export
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '400px', lineHeight: '1.6', marginBottom: '24px' }}>
                    This will create beautifully formatted frames directly in your Figma canvas with all color information, swatches, and documentation.
                  </p>
                  <div style={{
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px',
                    padding: '16px',
                    maxWidth: '500px',
                    textAlign: 'left'
                  }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e40af', marginBottom: '8px' }}>
                      What will be created:
                    </div>
                    <ul style={{ fontSize: '13px', color: '#3b82f6', paddingLeft: '20px', lineHeight: '1.8' }}>
                      <li>Header with title and metadata</li>
                      <li>Organized color sections by category</li>
                      <li>Color swatches with hex codes</li>
                      <li>Accessibility information (WCAG ratios)</li>
                      <li>Use cases and recommendations</li>
                      <li>Professional layout and styling</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <pre style={{
                  backgroundColor: '#f8fafc',
                  padding: '16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  overflow: 'auto',
                  height: 'calc(100% - 60px)',
                  fontFamily: 'Monaco, Courier New, monospace',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {documentation}
                </pre>
              )}
            </div>
          ) : (
            <div style={{
              backgroundColor: 'white',
              border: '2px dashed #e2e8f0',
              borderRadius: '12px',
              padding: '60px 40px',
              textAlign: 'center',
              height: 'calc(100vh - 200px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText size={64} color="#cbd5e1" style={{ marginBottom: '20px' }} />
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px', color: '#1e293b' }}>
                Documentation Ready
              </h3>
              <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '400px', lineHeight: '1.6', marginBottom: '24px' }}>
                Your documentation is ready to be generated. Click "Preview" to see how it will look, or "Download" to export it immediately.
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '16px',
                fontSize: '13px',
                color: '#94a3b8',
                width: '100%',
                maxWidth: '500px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#2563eb', marginBottom: '4px' }}>
                    {colorCount}
                  </div>
                  <div>Colors</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#2563eb', marginBottom: '4px' }}>
                    {config.format.toUpperCase()}
                  </div>
                  <div>Format</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#2563eb', marginBottom: '4px' }}>
                    {Object.values(config).filter(v => v === true).length}
                  </div>
                  <div>Features</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#2563eb', marginBottom: '4px' }}>
                    {config.layout?.toUpperCase() || 'GRID'}
                  </div>
                  <div>Layout</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
