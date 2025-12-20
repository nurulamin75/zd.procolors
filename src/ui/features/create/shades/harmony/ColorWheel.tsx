import React, { useRef, useEffect, useState, useCallback } from 'react';
import chroma from 'chroma-js';

interface ColorWheelProps {
  color: string;
  onChange: (color: string) => void;
}

export const ColorWheel: React.FC<ColorWheelProps> = ({ color, onChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Parse color safely
  const getHSL = (c: string) => {
      try {
          return chroma.valid(c) ? chroma(c).hsl() : [0, 1, 0.5];
      } catch {
          return [0, 1, 0.5];
      }
  };
  
  const hsl = getHSL(color);
  const h = isNaN(hsl[0]) ? 0 : hsl[0];
  const s = hsl[1];
  const l = hsl[2];

  const SIZE = 200;
  const RADIUS = SIZE / 2;

  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, SIZE, SIZE);

    const cx = RADIUS;
    const cy = RADIUS;

    // Save context
    ctx.save();

    // Clip to circle
    ctx.beginPath();
    ctx.arc(cx, cy, RADIUS, 0, 2 * Math.PI);
    ctx.clip();

    // 1. Hue Conic Gradient (Red at Top)
    // Start at -PI/2 (Top)
    const hueGradient = ctx.createConicGradient(-Math.PI / 2, cx, cy);
    hueGradient.addColorStop(0, "red");
    hueGradient.addColorStop(0.17, "magenta"); // Clockwise from Top? Wait. 
    // Standard HSL: 0=Red, 60=Yellow.
    // Canvas Y is Down.
    // 0 (Top). 
    // If we go CW: Top(Red) -> Right(Yellow? No, Y is Down).
    // Let's trace:
    // x=1, y=0 (Right).
    // If start is Top.
    // Top -> Right is +90deg.
    // HSL: Red -> Yellow is +60deg.
    // Let's stick to standard HSL wheel appearance:
    // Red -> Yellow -> Green -> Cyan -> Blue -> Magenta -> Red.
    hueGradient.addColorStop(0.17, "#ff00ff"); // Magenta (300)
    hueGradient.addColorStop(0.33, "blue");    // Blue (240)
    hueGradient.addColorStop(0.5, "cyan");     // Cyan (180)
    hueGradient.addColorStop(0.67, "lime");    // Green (120)
    hueGradient.addColorStop(0.83, "yellow");  // Yellow (60)
    hueGradient.addColorStop(1, "red");        // Red (0)
    // Wait, HSL direction is usually Red->Yellow->Green.
    // If I want standard direction (CW):
    // Top(Red) -> Right(Yellow).
    // This means angle increases CW.
    // Canvas coordinate system:
    // Top: y=-1. Right: x=1.
    // atan2(y, x): Top (-PI/2), Right (0), Bottom (PI/2), Left (PI).
    // If I offset by +90deg (PI/2): Top (0), Right (PI/2).
    // Correct.
    
    // So gradient stops should be:
    // 0 (Red), 0.17 (Yellow), 0.33 (Green)...
    
    const hueGradientCW = ctx.createConicGradient(-Math.PI / 2, cx, cy);
    hueGradientCW.addColorStop(0, "red");
    hueGradientCW.addColorStop(0.17, "yellow");
    hueGradientCW.addColorStop(0.33, "lime");
    hueGradientCW.addColorStop(0.5, "cyan");
    hueGradientCW.addColorStop(0.67, "blue");
    hueGradientCW.addColorStop(0.83, "magenta");
    hueGradientCW.addColorStop(1, "red");

    ctx.fillStyle = hueGradientCW;
    ctx.fillRect(0, 0, SIZE, SIZE);

    // 2. Saturation Radial Gradient (Grey at center -> Transparent at edge)
    // We use Grey (L=0.5) to simulate mixing.
    const satGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, RADIUS);
    satGradient.addColorStop(0, "gray");
    satGradient.addColorStop(1, "transparent");

    ctx.fillStyle = satGradient;
    ctx.beginPath();
    ctx.arc(cx, cy, RADIUS, 0, 2 * Math.PI);
    ctx.fill();

    // Restore (remove clip)
    ctx.restore();

    // 3. Draw Marker
    // Calculate position:
    // Hue 0 = Top. CW increase.
    // angleRad = (h - 90) * PI / 180 ??
    // If h=0 (Red), we want Top (-90deg).
    // If h=90 (Yellow? No HSL 60 is Yellow).
    // Let's check math: h is 0..360.
    // angleRad = (h - 90) * (Math.PI / 180);
    // h=0 -> -90deg (Top). Correct.
    // h=90 -> 0deg (Right). Correct.
    // h=180 -> 90deg (Bottom). Correct.
    
    const angleRad = (h - 90) * (Math.PI / 180);
    const dist = s * RADIUS;
    const mx = cx + Math.cos(angleRad) * dist;
    const my = cy + Math.sin(angleRad) * dist;

    // Marker shadow/border
    ctx.beginPath();
    ctx.arc(mx, my, 8, 0, 2 * Math.PI);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 4;
    
    // Marker fill
    ctx.fillStyle = color;
    ctx.fill();
    
    // Reset shadow
    ctx.shadowColor = 'transparent';

  }, [h, s, color]);

  useEffect(() => {
    drawWheel();
  }, [drawWheel]);

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    // Only process if dragging or click
    if (e.type === 'mousemove' && !isDragging) return;
    if (e.type === 'touchmove' && !isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
     
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;
     
    const x = clientX - rect.left;
    const y = clientY - rect.top;
     
    const cx = RADIUS;
    const cy = RADIUS;
    const dx = x - cx;
    const dy = y - cy;
     
    // Angle: 0 at Right, CW positive.
    // atan2(dy, dx).
    // We want 0 at Top.
    // So we add 90deg.
    let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;
     
    // Radius
    let dist = Math.sqrt(dx * dx + dy * dy);
    let sat = dist / RADIUS;
    if (sat > 1) sat = 1;

    // Update color
    const newColor = chroma.hsl(angle, sat, l).hex();
    onChange(newColor);
  };

  const handleLightnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newL = parseFloat(e.target.value);
      const newColor = chroma.hsl(h, s, newL).hex();
      onChange(newColor);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
      padding: '16px',
      background: 'white',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <canvas 
        ref={canvasRef}
        width={200}
        height={200}
        style={{ 
            cursor: 'crosshair', 
            touchAction: 'none',
            borderRadius: '50%',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
        onMouseDown={(e) => { setIsDragging(true); handleInteraction(e); }}
        onMouseMove={handleInteraction}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onTouchStart={(e) => { setIsDragging(true); handleInteraction(e); }}
        onTouchMove={handleInteraction}
        onTouchEnd={() => setIsDragging(false)}
      />
      
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
             <span>Lightness</span>
             <span>{Math.round(l * 100)}%</span>
        </div>
        <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={l}
            onChange={handleLightnessChange}
            style={{
                width: '100%',
                height: '6px',
                borderRadius: '3px',
                background: `linear-gradient(to right, black, ${chroma.hsl(h, s, 0.5).hex()}, white)`,
                appearance: 'none',
                cursor: 'pointer'
            }}
        />
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
        <div 
          style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '50%', 
            border: '1px solid var(--color-border)', 
            backgroundColor: color,
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
          }}
        />
        <input
          type="text"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
            fontFamily: 'monospace',
            outline: 'none',
            color: 'var(--color-text-primary)'
          }}
          placeholder="#000000"
        />
      </div>
    </div>
  );
};
