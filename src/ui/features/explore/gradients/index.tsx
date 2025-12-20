import React, { useMemo, useState } from 'react';
import { ColorToken } from '../../../../utils/tokens';
import { GradientData } from './utils/gradientUtils';
import { generateGradients } from './utils/generateGradients';
import { GradientCard } from './components/GradientCard';
import { GradientSettings } from './components/GradientSettings';
import { CustomGradientModal } from './components/CustomGradientModal';

interface GradientModuleProps {
  palettes: Record<string, ColorToken[]>;
}

export const GradientModule: React.FC<GradientModuleProps> = ({ palettes }) => {
  const [intensity, setIntensity] = useState(100);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customGradients, setCustomGradients] = useState<GradientData[]>([]);

  const [generationError, setGenerationError] = useState<string | null>(null);

  const generatedGradients = useMemo(() => {
    try {
      setGenerationError(null);
      return generateGradients(palettes, { intensity });
    } catch (e: any) {
      console.error("Failed to generate gradients:", e);
      setGenerationError(e.message || String(e));
      return [];
    }
  }, [palettes, intensity]);

  const allGradients = [...customGradients, ...generatedGradients];

  if (generationError) {
      return <div style={{ padding: '20px', color: 'red' }}>Error loading gradients: {generationError}</div>;
  }

  if (!generatedGradients.length && !customGradients.length && Object.keys(palettes).length > 0) {
     // If we have palettes but no gradients generated, likely an error occurred silently or empty return.
     return <div style={{ padding: '20px', color: 'red' }}>Error: No gradients generated.</div>;
  }

  const handleAddStyle = (gradient: GradientData) => {
    parent.postMessage({ 
      pluginMessage: { 
        type: 'create-gradient-style', 
        gradient 
      } 
    }, '*');
  };

  const handleSaveCustom = (gradient: GradientData) => {
    setCustomGradients([...customGradients, gradient]);
  };

  return (
    <div className="animate-fade-in">
       
       <GradientSettings 
         intensity={intensity} 
         setIntensity={setIntensity} 
         onCreateCustom={() => setIsModalOpen(true)} 
       />

       <div style={{ 
         display: 'grid', 
         gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
         gap: '16px' 
       }}>
         {allGradients.map((gradient) => (
           <GradientCard 
             key={gradient.id} 
             gradient={gradient} 
             onAddStyle={handleAddStyle}
           />
         ))}
       </div>

       <CustomGradientModal 
         isOpen={isModalOpen} 
         onClose={() => setIsModalOpen(false)} 
         onSave={handleSaveCustom} 
       />
    </div>
  );
};

