import React, { useState, useEffect } from 'react';
import { ExportCard } from './components/ExportCard';

export const TransferPage: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Listen for messages from plugin code
    const handleMessage = (event: MessageEvent) => {
      const msg = event.data.pluginMessage;
      if (!msg) return;

      if (msg.type === 'export-data-success') {
        const { data, fileName } = msg;
        // Download the JSON file directly
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ProColors-Transfer-${fileName || new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setIsProcessing(false);
        parent.postMessage({ pluginMessage: { type: 'notify', message: 'Export completed! File downloaded.' } }, '*');
      }
      
      if (msg.type === 'import-data-finished') {
          setIsProcessing(false);
          // Toast is handled by plugin code
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleExportRequest = (selectedCollectionIds: string[], selectedStyleGroups: string[]) => {
      setIsProcessing(true);
      parent.postMessage({ 
        pluginMessage: { 
          type: 'export-all-data',
          selectedCollectionIds,
          selectedStyleGroups
        } 
      }, '*');
  };

  const handleImportFile = (data: any) => {
      setIsProcessing(true);
      parent.postMessage({ pluginMessage: { type: 'import-data', data } }, '*');
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '80px' }}>
        <ExportCard 
            onExportRequest={handleExportRequest} 
            isExporting={isProcessing}
            onImportFile={handleImportFile}
        />
    </div>
  );
};
