import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { GradientData, gradientToCSS } from '../utils/gradientUtils';

interface CustomGradientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (gradient: GradientData) => void;
}

export const CustomGradientModal: React.FC<CustomGradientModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('My Custom Gradient');
  const [type, setType] = useState<'linear' | 'radial' | 'conic'>('linear');
  const [angle, setAngle] = useState(90);
  const [stops, setStops] = useState<{ color: string; position: number }[]>([
    { color: '#3b82f6', position: 0 },
    { color: '#9333ea', position: 100 }
  ]);

  if (!isOpen) return null;

  const handleAddStop = () => {
    setStops([...stops, { color: '#cccccc', position: 50 }]);
  };

  const handleRemoveStop = (index: number) => {
    if (stops.length > 2) {
      setStops(stops.filter((_, i) => i !== index));
    }
  };

  const handleStopChange = (index: number, field: 'color' | 'position', value: string | number) => {
    const newStops = [...stops];
    // @ts-ignore
    newStops[index][field] = value;
    setStops(newStops);
  };

  const previewGradient: GradientData = {
    id: 'preview',
    name,
    type,
    angle,
    stops
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        width: '450px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '18px' }}>Create Gradient</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Preview */}
        <div style={{
          height: '150px',
          borderRadius: '12px',
          background: gradientToCSS(previewGradient),
          marginBottom: '20px',
          border: '1px solid var(--color-border-light)'
        }} />

        {/* Controls */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="input"
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ width: '100px' }}>
             <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Type</label>
             <select 
                value={type} 
                onChange={(e) => setType(e.target.value as any)}
                className="input"
                style={{ width: '100%' }}
             >
               <option value="linear">Linear</option>
               <option value="radial">Radial</option>
               <option value="conic">Conic</option>
             </select>
          </div>
        </div>

        {type === 'linear' && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Angle ({angle}°)</label>
            <input 
              type="range" min="0" max="360" 
              value={angle} onChange={(e) => setAngle(parseInt(e.target.value))} 
              style={{ width: '100%' }} 
            />
          </div>
        )}

        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
             <label style={{ fontSize: '12px' }}>Color Stops</label>
             <button onClick={handleAddStop} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
               <Plus size={14} /> Add Stop
             </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {stops.map((stop, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                 <input 
                   type="color" 
                   value={stop.color} 
                   onChange={(e) => handleStopChange(i, 'color', e.target.value)}
                   style={{ width: '32px', height: '32px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                 />
                 <input 
                   type="number" 
                   value={stop.position} 
                   onChange={(e) => handleStopChange(i, 'position', parseInt(e.target.value))}
                   className="input"
                   style={{ width: '60px' }}
                   min="0" max="100"
                 />
                 <span style={{ fontSize: '12px' }}>%</span>
                 <button 
                   onClick={() => handleRemoveStop(i)}
                   style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', opacity: stops.length > 2 ? 1 : 0.5 }}
                   disabled={stops.length <= 2}
                 >
                   <Trash2 size={16} />
                 </button>
              </div>
            ))}
          </div>
        </div>

        <button 
          className="btn btn-primary" 
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={() => {
            onSave({ ...previewGradient, id: `custom-${Date.now()}` });
            onClose();
          }}
        >
          Save Gradient
        </button>

      </div>
    </div>
  );
};

