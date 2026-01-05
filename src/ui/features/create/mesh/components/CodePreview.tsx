import React, { useState, useMemo } from 'react';
import { Copy, Check, Terminal, FileCode } from 'lucide-react';
import { MeshPoint, generateSVGGradient } from '../utils/meshUtils';

interface CodePreviewProps {
  points: MeshPoint[];
  influence: number;
  animationSpeed?: number;
  easingMode?: string;
  noise?: number;
  grainType?: string;
  vignette?: number;
  glassmorphism?: boolean;
  aspectRatio?: string;
  magnetism?: boolean;
}

export const CodePreview: React.FC<CodePreviewProps> = ({
  points,
  influence,
  animationSpeed = 1,
  easingMode = 'smooth',
  noise = 0,
  grainType = 'noise',
  vignette = 0,
  glassmorphism = false,
  aspectRatio = 'none',
  magnetism = false
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'css' | 'react'>('css');

  const cssCode = useMemo(() => {
    const gradient = generateSVGGradient(points, influence, vignette);
    return `/* Mesh Gradient CSS */
.mesh-gradient {
  background-color: #ffffff;
  background-image: ${gradient};
  background-repeat: no-repeat;
  background-size: cover;
  ${noise > 0 ? `/* Add texture overlay div separately for best results */` : ''}
}`;
  }, [points, influence, vignette, noise]);

  const reactCode = useMemo(() => {
    const stringifiedPoints = JSON.stringify(points, null, 2);

    return `import React, { useEffect, useRef, useState } from 'react';

const AnimatedMesh = () => {
  const containerRef = useRef(null);
  const [points, setPoints] = useState(${stringifiedPoints});

  useEffect(() => {
    let frameId;
    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const elapsedSec = (now - startTime) / 1000 * ${animationSpeed};

      setPoints(prevPoints => prevPoints.map((p, i) => {
        const offset = i * 1.5;
        let dx = 0, dy = 0;
        
        if ("${easingMode}" === 'smooth') {
          dx = Math.sin(elapsedSec + offset) * 3;
          dy = Math.cos(elapsedSec * 0.8 + offset) * 3;
        } else if ("${easingMode}" === 'bouncy') {
          dx = Math.sin(elapsedSec * 2 + offset) * 5;
          dy = Math.cos(elapsedSec * 1.5 + offset) * 5;
        }

        return {
          ...p,
          x: Math.max(0, Math.min(100, p.x + dx)),
          y: Math.max(0, Math.min(100, p.y + dy))
        };
      }));

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const generateSVG = (pts) => {
    const paths = pts.map(p => \`
      <radialGradient id="grad-\${p.id}" cx="\${p.x}%" cy="\${p.y}%" r="\${p.influence || ${influence}}%">
        <stop offset="0%" stopColor="\${p.color}" stopOpacity="1" />
        <stop offset="100%" stopColor="\${p.color}" stopOpacity="0" />
      </radialGradient>
    \`).join('');

    const rects = pts.map(p => \`
      <rect width="100%" height="100%" fill="url(#grad-\${p.id})" />
    \`).join('');

    return \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <defs>\${paths}</defs>
      <rect width="100%" height="100%" fill="transparent" />
      \${rects}
    </svg>\`;
  };

  const l1 = \`url("data:image/svg+xml;utf8,\${generateSVG(points).replace(/#/g, '%23')}")\`;

  const getTextureSVG = (type, op) => {
    switch (type) {
      case 'fiber': return \`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.01 0.5' numOctaves='3'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23f)' opacity='\${op}'/%3E%3C/svg%3E")\`;
      case 'paper': return \`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='5'/%3E%3CfeDiffuseLighting lighting-color='white' surfaceScale='2'%3E%3CfeDistantLight azimuth='45' elevation='60'/%3E%3C/feDiffuseLighting%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23f)' opacity='\${op}'/%3E%3C/svg%3E")\`;
      case 'film': return \`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='1'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23f)' opacity='\${op}'/%3E%3C/svg%3E")\`;
      case 'canvas': return \`url("data:image/svg+xml,%3Csvg viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='20' height='20' fill='white'/%3E%3Cpath d='M0 10h20M10 0v20' stroke='black' stroke-opacity='\${op / 5}' stroke-width='0.5'/%3E%3C/svg%3E")\`;
      default: return \`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23f)' opacity='\${op}'/%3E%3C/svg%3E")\`;
    }
  };

  return (
    <div 
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundColor: '#ffffff',
        backgroundImage: l1,
        backgroundSize: 'cover',
        aspectRatio: "${aspectRatio === 'none' ? 'auto' : aspectRatio.replace(':', '/')}",
        overflow: 'hidden',
        ${vignette > 0 ? `boxShadow: 'inset 0 0 ${vignette}px rgba(0,0,0,0.5)',` : ''}
        ${glassmorphism ? `backdropFilter: 'blur(20px) saturate(180%)',` : ''}
      }}
    >
      {${noise} > 0 && (
        <div style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage: getTextureSVG("${grainType}", ${noise / 100})
        }} />
      )}
    </div>
  );
};

export default AnimatedMesh;`;
  }, [points, influence, animationSpeed, easingMode, noise, grainType, vignette, glassmorphism, aspectRatio, magnetism]);

  const handleCopy = () => {
    const code = activeTab === 'css' ? cssCode : reactCode;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      backgroundColor: '#111827',
      color: '#e2e8f0',
      padding: '20px',
      borderRadius: '12px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100
    }}>
      {/* Header / Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', backgroundColor: '#1f2937', padding: '4px', borderRadius: '8px' }}>
          <button
            onClick={() => setActiveTab('css')}
            style={{
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'css' ? '#374151' : 'transparent',
              color: activeTab === 'css' ? '#ffffff' : '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Terminal size={14} />
            CSS
          </button>
          <button
            onClick={() => setActiveTab('react')}
            style={{
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'react' ? '#374151' : 'transparent',
              color: activeTab === 'react' ? '#ffffff' : '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FileCode size={14} />
            React Component
          </button>
        </div>

        <button
          onClick={handleCopy}
          className="btn"
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)'
          }}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copied' : 'Copy All Code'}
        </button>
      </div>

      {/* Code Content */}
      <div style={{
        flex: 1,
        backgroundColor: '#0f172a',
        borderRadius: '8px',
        padding: '16px',
        overflow: 'auto',
        border: '1px solid #1e293b'
      }}>
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#94a3b8' }}>
          <code style={{ color: activeTab === 'css' ? '#60a5fa' : '#34d399' }}>
            {activeTab === 'css' ? cssCode : reactCode}
          </code>
        </pre>
      </div>

      <p style={{ marginTop: '12px', fontSize: '10px', color: '#64748b', textAlign: 'center' }}>
        {activeTab === 'css' ? 'Best for static backgrounds.' : 'A complete, self-contained functional component with animation logic.'}
      </p>
    </div>
  );
};
