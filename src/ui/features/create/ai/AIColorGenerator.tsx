import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Loader2, AlertCircle, CheckCircle2, Copy, X, ChevronDown, Plus, Palette, Sparkles, 
  Grid3X3, HelpCircle, Pipette, ImagePlus, FileText
} from 'lucide-react';
import { callOpenRouter, extractColors, getColorPaletteSystemPrompt, type ChatMessage } from '../../../../utils/ai';
import { isValidColor } from '../../../../utils/color';
import logoMark from '../../../mark.png';

// Welcome greetings with titles and subtitles
const welcomeGreetings = [
  {
    title: "Hi, what's on your mind today?",
    subtitle: "Describe your brand, mood, or style and I'll create the perfect color palette for you."
  },
  {
    title: "Let's find your perfect colors?",
    subtitle: "Tell me about your project and I'll generate a harmonious palette tailored to your needs."
  },
  {
    title: "Let's create beautiful colors",
    subtitle: "Share your vision and watch as I craft a stunning color palette just for you."
  },
  {
    title: "What colors are you dreaming of?",
    subtitle: "From bold and vibrant to soft and subtle, I'll help bring your color vision to life."
  },
];

interface AIColorGeneratorProps {
  onColorsGenerated?: (colors: string[]) => void;
  onNavigate?: (module: string) => void;
  showHistory?: boolean;
  triggerNewChat?: number;
  onToggleHistory?: () => void;
}

// Extended message type that can include extracted colors
interface ExtendedMessage extends ChatMessage {
  colors?: string[];
  timestamp?: number;
}

// Chat session type for history
interface ChatSession {
  id: string;
  title: string;
  messages: ExtendedMessage[];
  createdAt: number;
  updatedAt: number;
}

// Local storage keys
const CHAT_HISTORY_KEY = 'colzen-ai-chat-history';

// Helper to generate unique ID
const generateId = () => `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Helper to get chat title from first message
const getChatTitle = (messages: ExtendedMessage[]): string => {
  const firstUserMessage = messages.find(m => m.role === 'user');
  if (firstUserMessage) {
    return firstUserMessage.content.slice(0, 40) + (firstUserMessage.content.length > 40 ? '...' : '');
  }
  return 'New Chat';
};

// Helper to load chat history from local storage
const loadChatHistory = (): ChatSession[] => {
  try {
    const stored = localStorage.getItem(CHAT_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Helper to save chat history to local storage
const saveChatHistory = (sessions: ChatSession[]) => {
  try {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save chat history:', e);
  }
};

export const AIColorGenerator: React.FC<AIColorGeneratorProps> = ({ 
  onColorsGenerated, 
  onNavigate,
  showHistory = false,
  triggerNewChat = 0,
  onToggleHistory,
}) => {
  const [messages, setMessages] = useState<ExtendedMessage[]>([
    {
      role: 'system',
      content: getColorPaletteSystemPrompt(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeMenuMessageIndex, setActiveMenuMessageIndex] = useState<number | null>(null);
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [attachedColors, setAttachedColors] = useState<string[]>([]);
  
  // Randomly select a greeting on component mount
  const welcomeGreeting = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * welcomeGreetings.length);
    return welcomeGreetings[randomIndex];
  }, []);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const actionsMenuRef = useRef<HTMLDivElement>(null);
  const plusMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load chat history on mount
  useEffect(() => {
    const history = loadChatHistory();
    setChatHistory(history);
  }, []);

  // Save current chat to history when messages change
  useEffect(() => {
    if (hasStartedChat && messages.length > 1) {
      const userMessages = messages.filter(m => m.role !== 'system');
      if (userMessages.length > 0) {
        const now = Date.now();
        const chatId = currentChatId || generateId();
        
        if (!currentChatId) {
          setCurrentChatId(chatId);
        }

        setChatHistory(prev => {
          const existingIndex = prev.findIndex(s => s.id === chatId);
          const session: ChatSession = {
            id: chatId,
            title: getChatTitle(messages),
            messages: messages,
            createdAt: existingIndex >= 0 ? prev[existingIndex].createdAt : now,
            updatedAt: now,
          };

          let newHistory;
          if (existingIndex >= 0) {
            newHistory = [...prev];
            newHistory[existingIndex] = session;
          } else {
            newHistory = [session, ...prev];
          }
          
          // Keep only last 50 chats
          newHistory = newHistory.slice(0, 50);
          saveChatHistory(newHistory);
          return newHistory;
        });
      }
    }
  }, [messages, hasStartedChat, currentChatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
        setActiveMenuMessageIndex(null);
      }
      if (plusMenuRef.current && !plusMenuRef.current.contains(event.target as Node)) {
        setShowPlusMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen for messages from Figma plugin
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const msg = event.data.pluginMessage;
      if (!msg) return;
      
      if (msg.type === 'selection-colors') {
        const colors = msg.colors as string[];
        if (colors && colors.length > 0) {
          setAttachedColors(prev => [...new Set([...prev, ...colors])]);
          setShowPlusMenu(false);
        } else {
          setError('No colors found in selection. Please select elements with fill colors.');
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleSend = async (customMessage?: string) => {
    const messageToSend = customMessage || input.trim();
    if (!messageToSend && attachedColors.length === 0) return;
    if (isLoading) return;

    if (!hasStartedChat) {
      setHasStartedChat(true);
    }

    // Build the message content with attached colors
    let fullContent = messageToSend;
    if (attachedColors.length > 0) {
      const colorsList = attachedColors.join(', ');
      if (fullContent) {
        fullContent = `${fullContent}\n\nReference colors: ${colorsList}`;
      } else {
        fullContent = `Here are some colors I'd like you to work with: ${colorsList}. Please analyze these and suggest a cohesive palette.`;
      }
    }

    const userMessage: ExtendedMessage = {
      role: 'user',
      content: fullContent,
      colors: attachedColors.length > 0 ? [...attachedColors] : undefined,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAttachedColors([]);
    setIsLoading(true);
    setError(null);
    setCurrentModel(null);

    try {
      const { content, model } = await callOpenRouter([...messages, userMessage]);
      if (model) {
        setCurrentModel(model);
      }

      // Extract colors from response
      const colors = extractColors(content).filter(color => isValidColor(color));

      const assistantMessage: ExtendedMessage = {
        role: 'assistant',
        content,
        colors: colors.length > 0 ? colors : undefined,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (colors.length > 0) {
        onColorsGenerated?.(colors);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get AI response';
      setError(errorMessage);
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `I'm sorry, but the AI service could not respond right now. Please try again in a moment.`,
        timestamp: Date.now(),
      }]);
    } finally {
      setIsLoading(false);
      setCurrentModel(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyColor = (color: string) => {
    navigator.clipboard.writeText(color);
  };

  // Handler: Color picker
  const handleColorPicker = () => {
    // Create a hidden color input and trigger it
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = '#6366f1';
    colorInput.style.position = 'absolute';
    colorInput.style.visibility = 'hidden';
    document.body.appendChild(colorInput);
    
    colorInput.addEventListener('change', (e) => {
      const color = (e.target as HTMLInputElement).value.toUpperCase();
      setAttachedColors(prev => [...new Set([...prev, color])]);
      document.body.removeChild(colorInput);
    });
    
    colorInput.click();
    setShowPlusMenu(false);
  };

  // Handler: Upload image for color extraction
  const handleUploadImage = () => {
    imageInputRef.current?.click();
    setShowPlusMenu(false);
  };

  const processImage = async (file: File) => {
    try {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        // Create canvas and extract colors
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Resize for faster processing
        const maxSize = 100;
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const colors = extractColorsFromImageData(imageData);
        
        if (colors.length > 0) {
          setAttachedColors(prev => [...new Set([...prev, ...colors])]);
        }
        
        URL.revokeObjectURL(url);
      };
      
      img.src = url;
    } catch (e) {
      setError('Failed to process image');
    }
  };

  // Simple color extraction from image
  const extractColorsFromImageData = (imageData: ImageData): string[] => {
    const colorMap = new Map<string, number>();
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = Math.round(data[i] / 17) * 17;
      const g = Math.round(data[i + 1] / 17) * 17;
      const b = Math.round(data[i + 2] / 17) * 17;
      const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
      colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
    }
    
    // Sort by frequency and get top 6 distinct colors
    const sorted = [...colorMap.entries()].sort((a, b) => b[1] - a[1]);
    const colors: string[] = [];
    
    for (const [color] of sorted) {
      if (colors.length >= 6) break;
      // Skip if too similar to existing
      const isSimilar = colors.some(c => {
        const r1 = parseInt(c.slice(1, 3), 16);
        const g1 = parseInt(c.slice(3, 5), 16);
        const b1 = parseInt(c.slice(5, 7), 16);
        const r2 = parseInt(color.slice(1, 3), 16);
        const g2 = parseInt(color.slice(3, 5), 16);
        const b2 = parseInt(color.slice(5, 7), 16);
        const diff = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
        return diff < 50;
      });
      if (!isSimilar) {
        colors.push(color);
      }
    }
    
    return colors;
  };

  // Handler: Import colors from file
  const handleImportColors = () => {
    fileInputRef.current?.click();
    setShowPlusMenu(false);
  };

  const processColorFile = async (file: File) => {
    try {
      const text = await file.text();
      const hexRegex = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\b/g;
      const matches = text.match(hexRegex) || [];
      const uniqueColors = [...new Set(matches.map(c => c.toUpperCase()))];
      
      if (uniqueColors.length > 0) {
        setAttachedColors(prev => [...new Set([...prev, ...uniqueColors.slice(0, 10)])]);
      } else {
        setError('No valid hex colors found in file');
      }
    } catch (e) {
      setError('Failed to read file');
    }
  };

  // Handler: Start new chat
  const handleNewChat = () => {
    setMessages([{
      role: 'system',
      content: getColorPaletteSystemPrompt(),
    }]);
    setHasStartedChat(false);
    setCurrentChatId(null);
    setInput('');
    setAttachedColors([]);
    setError(null);
  };

  // Watch for new chat trigger from parent
  useEffect(() => {
    if (triggerNewChat > 0) {
      handleNewChat();
    }
  }, [triggerNewChat]);

  // Handler: Load chat from history
  const handleLoadChat = (session: ChatSession) => {
    setMessages(session.messages);
    setCurrentChatId(session.id);
    setHasStartedChat(true);
    onToggleHistory?.(); // Close history panel
  };

  // Handler: Delete chat from history
  const handleDeleteChat = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChatHistory(prev => {
      const newHistory = prev.filter(s => s.id !== sessionId);
      saveChatHistory(newHistory);
      return newHistory;
    });
    if (currentChatId === sessionId) {
      handleNewChat();
    }
  };

  // Remove attached color
  const removeAttachedColor = (color: string) => {
    setAttachedColors(prev => prev.filter(c => c !== color));
  };

  const handleAction = (colors: string[], item: { label: string; module?: string; action?: string }) => {
    setActiveMenuMessageIndex(null);
    
    // Apply colors first
    if (colors.length > 0 && onColorsGenerated) {
      onColorsGenerated(colors);
    }
    
    if (item.module && onNavigate) {
      onNavigate(item.module);
    } else if (item.action === 'figma-variables') {
      parent.postMessage({
        pluginMessage: { type: 'create-color-variables-from-ai', colors }
      }, '*');
    } else if (item.action === 'figma-styles') {
      parent.postMessage({
        pluginMessage: { type: 'create-color-styles-from-ai', colors }
      }, '*');
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'shades':
        if (onNavigate) onNavigate('generator');
        break;
      case 'palettes':
        if (onNavigate) onNavigate('palettes');
        break;
      case 'mesh':
        if (onNavigate) onNavigate('mesh-gradient');
        break;
      case 'help':
        handleSend('Help me create a color palette step by step');
        break;
    }
  };

  const actionItems = [
    { label: 'Generate Shades', module: 'generator' },
    { label: 'Generate Tokens', module: 'tokens' },
    { label: 'Create Figma Variables', action: 'figma-variables' },
    { label: 'Create Figma Styles', action: 'figma-styles' },
    { label: 'Show Themes', module: 'themes' },
    { label: 'Create Mesh Gradient', module: 'mesh-gradient' },
    { label: 'Export Colors', module: 'export' },
  ];

  const quickActions = [
    { id: 'shades', label: 'Generate Shades', icon: Palette },
    { id: 'palettes', label: 'Explore Palettes', icon: Sparkles },
    { id: 'mesh', label: 'Mesh Gradients', icon: Grid3X3 },
    { id: 'help', label: 'Step-by-step help', icon: HelpCircle },
  ];

  const plusMenuItems = [
    { id: 'picker', label: 'Color picker', icon: Pipette, handler: handleColorPicker },
    { id: 'image', label: 'Upload image', icon: ImagePlus, handler: handleUploadImage },
    { id: 'import', label: 'Import colors (CSV/JSON)', icon: FileText, handler: handleImportColors },
  ];

  // Plus menu component (reusable)
  const renderPlusMenu = () => (
    <div
      ref={plusMenuRef}
      style={{
        position: 'absolute',
        bottom: '100%',
        left: 0,
        marginBottom: '8px',
        background: 'white',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        zIndex: 100,
        minWidth: '220px',
        overflow: 'hidden',
      }}
    >
      {plusMenuItems.map((item) => {
        const IconComponent = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => item.handler?.()}
            style={{
              width: '100%',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '13px',
              color: 'var(--color-text-primary)',
              textAlign: 'left',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <IconComponent size={16} style={{ color: '#6366f1', flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );

  // History panel component (now a side panel)
  const renderHistoryPanel = () => (
    <div style={{
      width: '260px',
      height: '100%',
      background: 'white',
      borderRadius: '16px',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      animation: 'slideInFromRight 0.25s ease-out forwards',
    }}>
      <style>{`
        @keyframes slideInFromRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
      <div style={{
        padding: '16px',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontWeight: 600, fontSize: '14px' }}>Chat History</span>
        <button
          onClick={onToggleHistory}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
        >
          <X size={18} />
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {chatHistory.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '13px' }}>
            No chat history yet
          </div>
        ) : (
          chatHistory.map((session) => (
            <div
              key={session.id}
              onClick={() => handleLoadChat(session)}
              style={{
                padding: '12px',
                marginBottom: '4px',
                borderRadius: '8px',
                cursor: 'pointer',
                background: currentChatId === session.id ? '#f3f4f6' : 'transparent',
                border: currentChatId === session.id ? '1px solid var(--color-border)' : '1px solid transparent',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                if (currentChatId !== session.id) {
                  e.currentTarget.style.background = '#f9fafb';
                }
              }}
              onMouseLeave={(e) => {
                if (currentChatId !== session.id) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '13px', fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {session.title}
                </span>
                <button
                  onClick={(e) => handleDeleteChat(session.id, e)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', marginLeft: '8px' }}
                >
                  <X size={14} style={{ color: 'var(--color-text-tertiary)' }} />
                </button>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                {new Date(session.updatedAt).toLocaleDateString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Hidden file inputs
  const renderHiddenInputs = () => (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.json,.txt"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) processColorFile(file);
          e.target.value = '';
        }}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) processImage(file);
          e.target.value = '';
        }}
      />
    </>
  );

  // Welcome screen (before chat starts)
  if (!hasStartedChat) {
    return (
      <>
        <style>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeInScale {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .fade-in { animation: fadeIn 0.4s ease-out forwards; }
          .fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
          .fade-in-scale { animation: fadeInScale 0.3s ease-out forwards; }
          .delay-1 { animation-delay: 0.1s; opacity: 0; }
          .delay-2 { animation-delay: 0.2s; opacity: 0; }
          .delay-3 { animation-delay: 0.3s; opacity: 0; }
          .delay-4 { animation-delay: 0.4s; opacity: 0; }
        `}</style>
        {renderHiddenInputs()}
        <div style={{
          display: 'flex',
          height: '100%',
        }}>
          {/* Main Content */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px 24px 40px',
          }}>
            {/* Main Heading */}
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '12px' }}>
              {/* ProColors Logo with infinite animation */}
              <div
                style={{
                  marginBottom: '4px',
                  animation: 'proColorsSpin 3s linear infinite',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Brand Logo */}
                <img
                  src={logoMark}
                  alt="ProColors Logo"
                  width={56}
                  height={56}
                  style={{ display: 'block' }}
                  draggable={false}
                />
              </div>
              {/* Animation keyframes */}
              <style>
                {`
                  @keyframes proColorsSpin {
                    0% { transform: rotate(0deg);}
                    100% { transform: rotate(360deg);}
                  }
                `}
              </style>
              <h1 style={{
                fontSize: '28px',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                marginBottom: '16px',
                textAlign: 'center',
              }}>
                {welcomeGreeting.title}
              </h1>
              {/* <p style={{
                fontSize: '14px',
                color: 'var(--color-text-secondary)',
                textAlign: 'center',
                maxWidth: '480px',
                lineHeight: '1.5',
                marginBottom: '16px',
              }}>
                {welcomeGreeting.subtitle}
              </p> */}
            </div>

            {/* Input Area */}
            <div className="fade-in-up delay-1" style={{
              width: '100%',
              maxWidth: '650px',
              marginBottom: '12px',
            }}>
              {/* Attached Colors */}
              {attachedColors.length > 0 && (
                <div style={{
                  marginBottom: '8px',
                  padding: '8px 12px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '12px',
                  border: '1px solid var(--color-border)',
                }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginRight: '4px' }}>
                      Attached colors:
                    </span>
                    {attachedColors.map((color, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          backgroundColor: 'white',
                          border: '1px solid var(--color-border)',
                          borderRadius: '4px',
                          fontSize: '11px',
                        }}
                      >
                        <div style={{
                          width: '14px',
                          height: '14px',
                          borderRadius: '3px',
                          backgroundColor: color,
                          border: '1px solid rgba(0,0,0,0.1)',
                        }} />
                        <span style={{ fontFamily: 'monospace' }}>{color}</span>
                        <button
                          onClick={() => removeAttachedColor(color)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', display: 'flex' }}
                        >
                          <X size={12} style={{ color: 'var(--color-text-tertiary)' }} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 8px 8px 12px',
                backgroundColor: 'white',
                borderRadius: '50px',
                border: '1px solid var(--color-border)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                position: 'relative',
              }}>
                {/* Plus Button with Dropdown */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setShowPlusMenu(!showPlusMenu)}
                    style={{
                      background: showPlusMenu ? '#f3f4f6' : 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '6px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                    onMouseLeave={(e) => {
                      if (!showPlusMenu) e.currentTarget.style.background = 'none';
                    }}
                  >
                    <Plus size={20} style={{ color: showPlusMenu ? '#6366f1' : 'var(--color-text-tertiary)' }} />
                  </button>
                  {showPlusMenu && renderPlusMenu()}
                </div>
                
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask anything"
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    paddingLeft: '0px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    backgroundColor: 'transparent',
                    color: 'var(--color-text-primary)',
                  }}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={(!input.trim() && attachedColors.length === 0) || isLoading}
                  className="btn btn-primary"
                  style={{
                    padding: '10px 20px',
                    borderRadius: '50px',
                    fontSize: '14px',
                    fontWeight: 500,
                    opacity: ((!input.trim() && attachedColors.length === 0) || isLoading) ? 0.6 : 1,
                    cursor: ((!input.trim() && attachedColors.length === 0) || isLoading) ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isLoading ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>

            {/* Quick Action Cards */}
            <div className="fade-in-up delay-2" style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              justifyContent: 'center',
              maxWidth: '650px',
            }}>
              {quickActions.map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action.id)}
                    className="fade-in-scale"
                    style={{
                      display: 'flex',
                      animationDelay: `${0.3 + index * 0.05}s`,
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: '20px',
                      padding: '20px',
                      width: '150px',
                      backgroundColor: 'white',
                      border: '1px solid var(--color-border)',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#6366f1';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <IconComponent size={24} style={{ color: '#6366f1' }} />
                    <span style={{
                      fontSize: '13px',
                      fontWeight: 500,
                      color: 'var(--color-text-primary)',
                    }}>
                      {action.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          </div>

          {/* History Panel */}
          {showHistory && renderHistoryPanel()}
        </div>
      </>
    );
  }

  // Chat interface (after chat starts)
  return (
    <>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .message-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        .slide-in-left { animation: slideIn 0.3s ease-out forwards; }
        .slide-in-right { animation: slideInRight 0.3s ease-out forwards; }
      `}</style>
      {renderHiddenInputs()}
      <div style={{ 
        display: 'flex', 
        height: '100%',
      }}>
      {/* Main Chat Container */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}>

      {/* Error Banner */}
      {error && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          margin: '8px 12px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          fontSize: '13px',
          color: '#991b1b',
          flexShrink: 0,
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

      {/* Chat Messages */}
      <div style={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        padding: '0px 32px 0px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }} className="hide-scrollbar">
        {messages.filter(m => m.role !== 'system').map((message, index) => (
          <div key={index} className="message-fade-in">
            {/* Message Bubble */}
            <div
              className={message.role === 'user' ? 'slide-in-right' : 'slide-in-left'}
              style={{
                display: 'flex',
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  maxWidth: '80%',
                  padding: '8px 16px',
                  borderRadius: '16px',
                  backgroundColor: message.role === 'user' ? '#2563eb' : '#ffffff',
                  color: message.role === 'user' ? 'white' : 'var(--color-text-primary)',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  border: message.role === 'user' ? 'none' : '1px solid var(--color-border)',
                }}
              >
                {message.content}
              </div>
            </div>

            {/* Inline Colors Card - shown after messages that have colors */}
            {message.colors && message.colors.length > 0 && (
              <div style={{
                marginTop: '12px',
                padding: '16px',
                backgroundColor: '#ffffff',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                maxWidth: '90%',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} color="#10b981" />
                    <span style={{ fontSize: '13px', fontWeight: 500 }}>Found {message.colors.length} colors</span>
                  </div>
                  {/* Actions Dropdown */}
                  <div ref={activeMenuMessageIndex === index ? actionsMenuRef : undefined} style={{ position: 'relative' }}>
                    <button
                      onClick={() => setActiveMenuMessageIndex(activeMenuMessageIndex === index ? null : index)}
                      className="btn btn-primary"
                      style={{
                        fontSize: '12px',
                        padding: '6px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      Actions
                      <ChevronDown size={14} />
                    </button>
                    {activeMenuMessageIndex === index && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: '4px',
                        background: 'white',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        zIndex: 50,
                        minWidth: '180px',
                        overflow: 'hidden',
                      }}>
                        {actionItems.map((item, actionIndex) => (
                          <button
                            key={actionIndex}
                            onClick={() => handleAction(message.colors!, item)}
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              border: 'none',
                              background: 'transparent',
                              cursor: 'pointer',
                              fontSize: '13px',
                              color: 'var(--color-text-primary)',
                              textAlign: 'left',
                              transition: 'background 0.15s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {message.colors.map((color, colorIndex) => (
                    <div
                      key={colorIndex}
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
          </div>
        ))}
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '12px 16px',
              borderRadius: '16px',
              backgroundColor: '#f3f4f6',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                  AI is thinking...
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
        padding: '0px 32px 0px 32px',
        flexShrink: 0,
        backgroundColor: 'transparent',
      }}>
        {/* Attached Colors in Chat */}
        {attachedColors.length > 0 && (
          <div style={{
            marginBottom: '8px',
            padding: '8px 12px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid var(--color-border)',
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginRight: '4px' }}>
                Attached:
              </span>
              {attachedColors.map((color, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    backgroundColor: 'white',
                    border: '1px solid var(--color-border)',
                    borderRadius: '4px',
                    fontSize: '11px',
                  }}
                >
                  <div style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '3px',
                    backgroundColor: color,
                    border: '1px solid rgba(0,0,0,0.1)',
                  }} />
                  <span style={{ fontFamily: 'monospace' }}>{color}</span>
                  <button
                    onClick={() => removeAttachedColor(color)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', display: 'flex' }}
                  >
                    <X size={12} style={{ color: 'var(--color-text-tertiary)' }} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0px',
          padding: '6px 8px 6px 12px',
          backgroundColor: 'white',
          borderRadius: '50px',
          border: '1px solid var(--color-border)',
          position: 'relative',
        }}>
          {/* Plus Button with Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowPlusMenu(!showPlusMenu)}
              style={{
                background: showPlusMenu ? '#f3f4f6' : 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
              onMouseLeave={(e) => {
                if (!showPlusMenu) e.currentTarget.style.background = 'none';
              }}
            >
              <Plus size={18} style={{ color: showPlusMenu ? '#6366f1' : 'var(--color-text-tertiary)' }} />
            </button>
            {showPlusMenu && renderPlusMenu()}
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask anything"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              paddingLeft: '4px',
              fontSize: '14px',
              fontFamily: 'inherit',
              backgroundColor: 'transparent',
              color: 'var(--color-text-primary)',
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={(!input.trim() && attachedColors.length === 0) || isLoading}
            className="btn btn-primary"
            style={{
              padding: '10px 20px',
              borderRadius: '50px',
              fontSize: '14px',
              fontWeight: 500,
              opacity: ((!input.trim() && attachedColors.length === 0) || isLoading) ? 0.6 : 1,
              cursor: ((!input.trim() && attachedColors.length === 0) || isLoading) ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
        <p style={{
          fontSize: '11px',
          color: 'var(--color-text-tertiary)',
          marginTop: '6px',
          marginBottom: 0,
          textAlign: 'center',
        }}>
          Press Enter to send
        </p>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      </div>

      {/* History Panel */}
      {showHistory && renderHistoryPanel()}
    </div>
    </>
  );
};
