import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutGrid, SplitSquareHorizontal,
  Palette, Gauge, Eye, CheckCircle2, ScanEye,
  Download, Layers, FolderUp, Compass,
  ChevronDown, ChevronRight, Settings,
  PlusCircle, Globe, ArrowRightLeft, FlaskConical,
  PanelRightOpen, Sparkles, Building2,
  Blend, Spline, Droplets, FileCode, BookOpen,
  SwatchBook, Pipette, BarChart3, Thermometer, Bot
} from 'lucide-react';
import logo from '../logo.png';
import markIcon from '../mark.png';

interface SidebarProps {
  activeModule: string;
  onChangeModule: (module: string) => void;
}

const NAV_STRUCTURE = [
  {
    id: 'create',
    label: 'Create',
    icon: PlusCircle,
    items: [
      { id: 'ai-generator', label: 'AI Generator', icon: Bot },
      { id: 'generator', label: 'Shades', icon: SwatchBook },
      { id: 'tokens', label: 'Tokens', icon: Sparkles },
      { id: 'themes', label: 'Themes', icon: Layers },
      { id: 'mesh-gradient', label: 'Mesh Gradient', icon: Gauge },
      { id: 'color-ops', label: 'Color Ops', icon: Blend },
    ]
  },
  {
    id: 'explore',
    label: 'Explore',
    icon: Globe,
    items: [
      { id: 'brand-colors', label: 'Brand Colors', icon: Building2 },
      { id: 'palettes', label: 'Color Palettes', icon: Palette },
      { id: 'gradients', label: 'Gradients', icon: Compass },
    ]
  },
  {
    id: 'flow',
    label: 'Flow',
    icon: ArrowRightLeft,
    items: [
      { id: 'transfer', label: 'Transfer tokens', icon: FolderUp },
      { id: 'brands', label: 'Manage Brands', icon: SplitSquareHorizontal },
      { id: 'export', label: 'Export tokens', icon: Download },
      { id: 'documentation', label: 'Documentation', icon: BookOpen },
      { id: 'extractor', label: 'Color Migrator', icon: Pipette },
    ]
  },
  {
    id: 'test',
    label: 'Test',
    icon: FlaskConical,
    items: [
      { id: 'preview', label: 'Preview', icon: Eye },
      { id: 'contrast', label: 'Checker', icon: CheckCircle2 },
      { id: 'blindness', label: 'Simulator', icon: ScanEye },
      { id: 'heatmap', label: 'Heatmap', icon: Thermometer },
    ]
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    items: [] // Placeholder for now
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ activeModule, onChangeModule }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
  const [submenuPosition, setSubmenuPosition] = useState<{ top: number; left: number } | null>(null);
  const menuItemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [groupStates, setGroupStates] = useState<Record<string, boolean>>({
    create: true,
    explore: false,
    flow: false,
    test: false,
    settings: false
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // If we're clicking outside the sidebar and submenus, close the hovered group
      if (
        isCollapsed &&
        hoveredGroup &&
        !target.closest('.sidebar') &&
        !target.closest('[data-submenu]')
      ) {
        setHoveredGroup(null);
        setSubmenuPosition(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCollapsed, hoveredGroup]);

  const toggleGroup = (id: string) => {
    setGroupStates(prev => {
      const isCurrentlyOpen = prev[id];
      // If clicking on an already open group, close it
      if (isCurrentlyOpen) {
        return { ...prev, [id]: false };
      }
      // Otherwise, close all groups and open the clicked one
      const newState: Record<string, boolean> = {};
      Object.keys(prev).forEach(key => {
        newState[key] = key === id;
      });

      // When opening a group, automatically select the first item
      const group = NAV_STRUCTURE.find(g => g.id === id);
      if (group && group.items.length > 0) {
        onChangeModule(group.items[0].id);
      }

      return newState;
    });
  };

  return (
    <div
      className="sidebar"
      style={{
        width: isCollapsed ? '64px' : '172px',
        transition: 'width 0.2s ease',
        overflow: isCollapsed ? 'visible' : undefined,
        overflowY: isCollapsed ? 'auto' : 'auto',
        overflowX: isCollapsed ? 'visible' : 'hidden',
        position: 'relative'
      }}
    >
      <div style={{
        padding: '16px 8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'space-between',
        position: 'sticky',
        top: 0,
        backgroundColor: 'var(--color-bg-sidebar)',
        zIndex: 20,
        gap: '8px',
        marginTop: '2px'
      }}>
        {isCollapsed ? (
          <img
            src={markIcon}
            alt="ProColors"
            style={{ height: '28px', width: '28px', objectFit: 'contain', cursor: 'pointer' }}
            onClick={() => setIsCollapsed(false)}
          />
        ) : (
          <>
            <img
              src={logo}
              alt="ProColors Logo"
              style={{ height: '26px', objectFit: 'contain' }}
            />
            <button
              onClick={() => setIsCollapsed(true)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-secondary)',
                borderRadius: '4px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title="Collapse sidebar"
            >
              <PanelRightOpen size={16} />
            </button>
          </>
        )}
      </div>

      {/* Submenu portal for collapsed sidebar */}
      {isCollapsed && hoveredGroup && submenuPosition && (() => {
        const group = NAV_STRUCTURE.find(g => g.id === hoveredGroup);
        if (!group || group.id === 'settings' || group.items.length === 0) return null;

        return (
          <div
            data-submenu
            style={{
              position: 'fixed',
              left: `${submenuPosition.left}px`,
              top: `${submenuPosition.top}px`,
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              padding: '4px',
              minWidth: '180px',
              zIndex: 10000,
              display: 'flex',
              flexDirection: 'column',
              gap: '0px',
              pointerEvents: 'auto'
            }}
            onMouseEnter={() => {
              // Stay open
            }}
            onMouseLeave={() => {
              // Stay open until click outside or hover another module
            }}
          >
            <div style={{
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              borderBottom: '1px solid #e5e7eb',
              marginBottom: '2px'
            }}>
              {group.label}
            </div>
            {group.items.map((item) => {
              const isActive = activeModule === item.id;
              const ItemIcon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onChangeModule(item.id);
                    setHoveredGroup(null);
                    setSubmenuPosition(null);
                  }}
                  style={{
                    padding: '6px 12px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: isActive ? 500 : 400,
                    color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                    backgroundColor: isActive ? '#f3f4f6' : 'transparent',
                    borderRadius: '6px',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {ItemIcon && <ItemIcon size={14} />}
                  {item.label}
                </div>
              );
            })}
          </div>
        );
      })()}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          position: 'relative',
          overflow: isCollapsed ? 'visible' : undefined
        }}
      >
        {NAV_STRUCTURE.map((group) => {
          const isOpen = groupStates[group.id];
          const isActiveGroup = group.items.some(item => item.id === activeModule);
          const isSettings = group.id === 'settings';
          const GroupIcon = group.icon;

          if (isCollapsed) {
            // Collapsed view: show only icons with hover submenu
            return (
              <div
                key={group.id}
                ref={(el) => {
                  menuItemRefs.current[group.id] = el;
                }}
                style={{
                  marginBottom: '4px',
                  position: 'relative'
                }}
                onMouseEnter={() => {
                  setHoveredGroup(group.id);
                  const element = menuItemRefs.current[group.id];
                  if (element) {
                    const rect = element.getBoundingClientRect();
                    setSubmenuPosition({
                      top: rect.top,
                      left: rect.right + 4
                    });
                  }
                }}
                onMouseLeave={() => {
                  // No longer clearing on mouse leave to allow "sticky" behavior
                  // as requested by the user.
                }}
              >
                <div
                  onClick={() => {
                    if (isSettings) {
                      onChangeModule('settings');
                    } else {
                      // In collapsed mode, clicking icon opens group and selects first item
                      if (!isOpen) {
                        toggleGroup(group.id);
                      } else {
                        // If already open, just select first item
                        const firstItem = group.items[0];
                        if (firstItem) {
                          onChangeModule(firstItem.id);
                        }
                      }
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    color: (isActiveGroup || (isSettings && activeModule === 'settings')) ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                    borderRadius: '6px',
                    transition: 'background-color 0.2s',
                    backgroundColor: (isActiveGroup || (isSettings && activeModule === 'settings')) ? '#f3f4f6' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActiveGroup && !(isSettings && activeModule === 'settings')) {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActiveGroup && !(isSettings && activeModule === 'settings')) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                  title={group.label}
                >
                  {GroupIcon && <GroupIcon size={18} />}
                </div>
              </div>
            );
          }

          return (
            <div key={group.id} style={{ marginBottom: '4px' }}>
              {/* Group Header */}
              <div
                onClick={() => isSettings ? onChangeModule('settings') : toggleGroup(group.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 8px',
                  cursor: 'pointer',
                  userSelect: 'none',
                  color: (isActiveGroup || (isSettings && activeModule === 'settings')) ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  borderRadius: '6px',
                  transition: 'background-color 0.2s',
                  backgroundColor: (isActiveGroup || (isSettings && activeModule === 'settings')) ? '#f3f4f6' : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (!isActiveGroup && !(isSettings && activeModule === 'settings')) {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActiveGroup && !(isSettings && activeModule === 'settings')) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
                  {GroupIcon && <GroupIcon size={16} />}
                  <span>{group.label}</span>
                </div>
                {!isSettings && (
                  <div style={{ color: 'var(--color-text-tertiary)' }}>
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </div>
                )}
              </div>

              {/* Group Items */}
              {isOpen && !isSettings && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0px',
                  paddingLeft: '4px',
                  position: 'relative',
                  marginLeft: '16px', // Space for icon + gap
                  marginTop: '4px',
                  borderLeft: '1px solid #e5e7eb' // Vertical line connecting sub-items
                }}>
                  {group.items.map((item) => {
                    const isActive = activeModule === item.id;

                    return (
                      <div
                        key={item.id}
                        onClick={() => onChangeModule(item.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '6px 12px',
                          marginTop: '2px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: isActive ? 500 : 400,
                          color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                          backgroundColor: isActive ? '#f3f4f6' : 'transparent',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = '#f9fafb';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <span>{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
