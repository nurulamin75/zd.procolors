import React, { useMemo, useState } from 'react';
import { ColorToken } from '../../../../utils/tokens';
import { evaluateSystem } from './utils/shadeEvaluator';
import { ScoreCard } from './components/ScoreCard';
import { FamilySection } from './components/FamilySection';
import { SummaryCards } from './components/SummaryCards';
import { DetailsPopover } from './components/DetailsPopover';

interface HeatmapPageProps {
  palettes: Record<string, ColorToken[]>;
}

export const HeatmapPage: React.FC<HeatmapPageProps> = ({ palettes }) => {
  const [selected, setSelected] = useState<{ token: ColorToken; anchor: HTMLElement } | null>(null);

  const systemScore = useMemo(() => {
    return evaluateSystem(palettes);
  }, [palettes]);

  // Mock update handler - in a real app this would update the main state
  // Since we can't easily lift state up without Redux/Context refactor in App.tsx,
  // we will just notify the user for now, or you could pass a handler from App.tsx if you want real updates.
  const handleFixToken = (token: ColorToken, newHex: string) => {
    // For MVP: We'll copy to clipboard and show a toast
    const textArea = document.createElement("textarea");
    textArea.value = newHex;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    
    parent.postMessage({ pluginMessage: { type: 'notify', message: `Copied fix ${newHex} to clipboard! Update the generator.` } }, '*');
    setSelected(null);
  };

  const handleSelectToken = (token: ColorToken, anchor: HTMLElement) => {
      setSelected({ token, anchor });
  };

  return (
    <div className="animate-fade-in" style={{ position: 'relative', minHeight: '100%' }}>
      
      <ScoreCard score={systemScore} />

      <div style={{ marginTop: '32px' }}>
        {Object.entries(palettes).map(([name, tokens]) => (
          <FamilySection 
            key={name} 
            name={name} 
            tokens={tokens} 
            onSelectToken={handleSelectToken}
          />
        ))}
      </div>

      <SummaryCards score={systemScore} />

      {selected && (
        <DetailsPopover 
          token={selected.token}
          anchor={selected.anchor} 
          onClose={() => setSelected(null)} 
          onFix={handleFixToken}
        />
      )}
    </div>
  );
};
