import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, AlertCircle, CheckCircle2, Copy, X, Settings, Zap } from 'lucide-react';
import { callOpenRouter, extractColors, getColorPaletteSystemPrompt, FREE_MODELS, type ChatMessage } from '../../../../utils/ai';
import { isValidColor } from '../../../../utils/color';

interface AIColorGeneratorProps {
  onColorsGenerated?: (colors: string[]) => void;
}

export const AIColorGenerator: React.FC<AIColorGeneratorProps> = ({ onColorsGenerated }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'system',
      content: getColorPaletteSystemPrompt(),
    },
    {
      role: 'assistant',
      content: "Hello! I'm your AI color palette assistant. I can help you create beautiful color palettes for your brand.\n\nTry asking me things like:\n• \"Create a palette for a tech startup\"\n• \"I need warm, cozy colors for a coffee shop\"\n• \"Suggest colors that feel professional and trustworthy\"\n\nWhat kind of colors are you looking for?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [apiKey, setApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem('openrouter-api-key') || '';
    } catch {
      return '';
    }
  });
  const [showApiKeyInput, setShowApiKeyInput] = useState<boolean>(() => {
    try {
      const key = localStorage.getItem('openrouter-api-key');
      return !key || key.trim() === '';
    } catch {
      return true;
    }
  });
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const saveApiKey = (key: string) => {
    try {
      localStorage.setItem('openrouter-api-key', key);
      setApiKey(key);
      setShowApiKeyInput(false);
      setShowSettings(false);
      setError(null);
    } catch (err) {
      setError('Failed to save API key');
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    if (!apiKey) {
      setError('Please enter your OpenRouter API key to use the AI feature.');
      setShowApiKeyInput(true);
      return;
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);
    setCurrentModel(null);

    try {
      const response = await callOpenRouter(
        [...messages, userMessage], 
        apiKey,
        (modelName) => setCurrentModel(modelName)
      );
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Extract colors from response
      const colors = extractColors(response).filter(color => isValidColor(color));
      if (colors.length > 0) {
        setExtractedColors(colors);
        onColorsGenerated?.(colors);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get AI response';
      setError(errorMessage);
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `I apologize, but I encountered an error. All AI models failed to respond. Please check your API key or try again later.`,
      }]);
    } finally {
      setIsLoading(false);
      setCurrentModel(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyColor = (color: string) => {
    navigator.clipboard.writeText(color);
  };

  const applyColors = () => {
    if (extractedColors.length > 0 && onColorsGenerated) {
      onColorsGenerated(extractedColors);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      maxHeight: 'calc(100vh - 200px)',
      position: 'relative',
    }}>
      {/* API Key Input Modal */}
      {showApiKeyInput && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>OpenRouter API Key</h3>
              <button
                onClick={() => {
                  if (apiKey) {
                    setShowApiKeyInput(false);
                  }
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: apiKey ? 'pointer' : 'not-allowed',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  opacity: apiKey ? 1 : 0.3,
                }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div style={{
              padding: '12px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              marginBottom: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Zap size={16} color="#16a34a" />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#166534' }}>100% Free to Use</span>
              </div>
              <p style={{ fontSize: '12px', color: '#166534', margin: 0 }}>
                We use completely free AI models. You only need an API key for authentication - no charges apply.
              </p>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
              Get your free API key at{' '}
              <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>
                openrouter.ai/keys
              </a>
              {' '}(takes 30 seconds)
            </p>
            <input
              type="password"
              placeholder="sk-or-v1-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && apiKey.trim()) {
                  saveApiKey(apiKey.trim());
                }
              }}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                fontSize: '13px',
                marginBottom: '12px',
              }}
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  if (apiKey.trim()) {
                    saveApiKey(apiKey.trim());
                  }
                }}
                disabled={!apiKey.trim()}
                className="btn btn-primary"
                style={{ 
                  fontSize: '13px', 
                  padding: '8px 16px',
                  opacity: apiKey.trim() ? 1 : 0.5,
                }}
              >
                Save & Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>AI Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
                OpenRouter API Key
              </label>
              <input
                type="password"
                placeholder="sk-or-v1-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  fontSize: '13px',
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
                Free AI Models Used (with fallback)
              </label>
              <div style={{ 
                fontSize: '12px', 
                color: 'var(--color-text-secondary)',
                backgroundColor: '#f9fafb',
                padding: '12px',
                borderRadius: '6px',
                maxHeight: '150px',
                overflowY: 'auto',
              }}>
                {FREE_MODELS.map((model, index) => (
                  <div key={model.id} style={{ 
                    padding: '4px 0',
                    borderBottom: index < FREE_MODELS.length - 1 ? '1px solid #e5e7eb' : 'none',
                  }}>
                    <span style={{ fontWeight: 500 }}>{index + 1}. {model.name}</span>
                    <span style={{ color: '#9ca3af', marginLeft: '8px' }}>- {model.description}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowSettings(false)}
                className="btn btn-secondary"
                style={{ fontSize: '13px', padding: '8px 16px' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (apiKey.trim()) {
                    saveApiKey(apiKey.trim());
                  }
                }}
                className="btn btn-primary"
                style={{ fontSize: '13px', padding: '8px 16px' }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          fontSize: '13px',
          color: '#991b1b',
        }}>
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span style={{ flex: 1, whiteSpace: 'pre-wrap' }}>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              flexShrink: 0,
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Extracted Colors Preview */}
      {extractedColors.length > 0 && (
        <div style={{
          padding: '16px',
          backgroundColor: '#f9fafb',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} color="#10b981" />
              <span style={{ fontSize: '13px', fontWeight: 500 }}>Found {extractedColors.length} colors</span>
            </div>
            <button
              onClick={applyColors}
              className="btn btn-primary"
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              Apply Colors
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {extractedColors.map((color, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 10px',
                  backgroundColor: 'white',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  fontSize: '12px',
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '4px',
                    backgroundColor: color,
                    border: '1px solid rgba(0,0,0,0.1)',
                  }}
                />
                <span style={{ fontFamily: 'monospace' }}>{color}</span>
                <button
                  onClick={() => copyColor(color)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Copy color"
                >
                  <Copy size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        {messages.filter(m => m.role !== 'system').map((message, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                maxWidth: '80%',
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: message.role === 'user' ? '#3b82f6' : '#f3f4f6',
                color: message.role === 'user' ? 'white' : 'var(--color-text-primary)',
                fontSize: '13px',
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '12px 16px',
              borderRadius: '12px',
              backgroundColor: '#f3f4f6',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                  Generating colors...
                </span>
              </div>
              {currentModel && (
                <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                  Trying: {currentModel}
                </span>
              )}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid var(--color-border)',
        backgroundColor: 'white',
      }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <button
            onClick={() => setShowSettings(true)}
            style={{
              padding: '10px',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              backgroundColor: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="AI Settings"
          >
            <Settings size={16} color="var(--color-text-secondary)" />
          </button>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe your brand colors, mood, or what you're looking for..."
            style={{
              flex: 1,
              padding: '10px 12px',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              fontSize: '13px',
              fontFamily: 'inherit',
              resize: 'none',
              minHeight: '40px',
              maxHeight: '120px',
            }}
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="btn btn-primary"
            style={{
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              opacity: (!input.trim() || isLoading) ? 0.5 : 1,
              cursor: (!input.trim() || isLoading) ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Sending...
              </>
            ) : (
              <>
                <Send size={16} />
                Send
              </>
            )}
          </button>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginTop: '8px' 
        }}>
          <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', margin: 0 }}>
            Press Enter to send, Shift+Enter for new line
          </p>
          <p style={{ fontSize: '11px', color: '#10b981', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Zap size={10} />
            Free AI models with auto-fallback
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
