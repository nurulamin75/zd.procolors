import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HexColorPicker } from 'react-colorful';
import { MeshPoint, generateSVGGradient, EasingMode, getTextureFilter } from '../utils/meshUtils';

interface MeshCanvasProps {
    points: MeshPoint[];
    onChange: (points: MeshPoint[]) => void;
    width?: number;
    height?: number;
    showWireframe?: boolean;
    influence?: number;
    animate?: boolean;
    animationSpeed?: number;
    easingMode?: EasingMode;
    noise?: number;
    grainType?: string;
    vignette?: number;
    glassmorphism?: boolean;
    aspectRatio?: 'none' | '9:16' | '16:9' | '1:1';
    magnetism?: boolean;
    blendMode?: string;
    onImageDrop?: (file: File) => void;
}

export const MeshCanvas: React.FC<MeshCanvasProps> = ({
    points,
    onChange,
    width = 400,
    height = 300,
    showWireframe = true,
    influence = 50,
    animate = false,
    animationSpeed = 1,
    easingMode = 'smooth',
    noise = 0,
    grainType = 'noise',
    vignette = 0,
    glassmorphism = false,
    aspectRatio = 'none',
    magnetism = false,
    blendMode = 'normal',
    onImageDrop
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const dragStartPositions = useRef<Record<string, { x: number; y: number }>>({});
    const mousePosRef = useRef<{ x: number; y: number } | null>(null);
    const [popoverPosition, setPopoverPosition] = useState<{ top: number; left: number } | null>(null);

    const handleMouseDown = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setDraggingId(id);
        setSelectedId(id);

        let newSelectedIds = [...selectedIds];
        if (e.shiftKey) {
            if (newSelectedIds.includes(id)) {
                newSelectedIds = newSelectedIds.filter(sid => sid !== id);
            } else {
                newSelectedIds.push(id);
            }
        } else {
            if (!newSelectedIds.includes(id)) {
                newSelectedIds = [id];
            }
        }
        setSelectedIds(newSelectedIds);

        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
            dragStartPositions.current = {};
            points.forEach(p => {
                if (newSelectedIds.includes(p.id)) {
                    dragStartPositions.current[p.id] = { x: p.x, y: p.y };
                }
            });
        }

        if (containerRef.current) {
            const target = e.currentTarget as HTMLElement;
            const targetRect = target.getBoundingClientRect();

            setPopoverPosition({
                top: targetRect.bottom + 8,
                left: targetRect.left + (targetRect.width / 2)
            });
        }
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!draggingId || !containerRef.current) return;

            const rect = containerRef.current.getBoundingClientRect();
            const currentX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
            const currentY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

            const startPosOfDragged = dragStartPositions.current[draggingId];
            if (!startPosOfDragged) return;

            const dx = currentX - startPosOfDragged.x;
            const dy = currentY - startPosOfDragged.y;

            const newPoints = points.map(p => {
                if (selectedIds.includes(p.id)) {
                    const startPos = dragStartPositions.current[p.id];
                    return {
                        ...p,
                        x: Math.max(0, Math.min(100, startPos.x + dx)),
                        y: Math.max(0, Math.min(100, startPos.y + dy))
                    };
                }
                return p;
            });

            onChange(newPoints);

            const activePoint = newPoints.find(p => p.id === draggingId);
            if (activePoint && selectedId === draggingId) {
                const pointX = rect.left + (activePoint.x / 100) * rect.width;
                const pointY = rect.top + (activePoint.y / 100) * rect.height;
                setPopoverPosition({
                    top: pointY + 20,
                    left: pointX
                });
            }
        };

        const handleMouseUp = () => {
            setDraggingId(null);
        };

        if (draggingId) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [draggingId, points, onChange, selectedId, selectedIds]);

    useEffect(() => {
        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            mousePosRef.current = {
                x: ((e.clientX - rect.left) / rect.width) * 100,
                y: ((e.clientY - rect.top) / rect.height) * 100
            };
        };

        const handleClickOutside = (e: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node) &&
                !(e.target as HTMLElement).closest('.mesh-popover')
            ) {
                setSelectedId(null);
                setSelectedIds([]);
            }
        };
        if (magnetism) {
            window.addEventListener('mousemove', handleGlobalMouseMove);
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            window.removeEventListener('mousemove', handleGlobalMouseMove);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [magnetism]);

    const handleColorChange = (newColor: string) => {
        if (selectedIds.length === 0) return;
        const newPoints = points.map(p =>
            selectedIds.includes(p.id) ? { ...p, color: newColor } : p
        );
        onChange(newPoints);
    };

    const handleInfluenceChange = (newInfluence: number) => {
        if (selectedIds.length === 0) return;
        const newPoints = points.map(p =>
            selectedIds.includes(p.id) ? { ...p, influence: newInfluence } : p
        );
        onChange(newPoints);
    };

    const backgroundRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let animationFrameId: number;
        let startTime = Date.now();

        const animateGradient = () => {
            if (!animate || draggingId) {
                if (backgroundRef.current) {
                    backgroundRef.current.style.backgroundImage = generateSVGGradient(points, influence, vignette);
                }
                return;
            }

            const currentTime = Date.now();
            const elapsed = ((currentTime - startTime) / 1000) * animationSpeed;

            const animatedPoints = points.map((p, i) => {
                const offset = i * 1.5;
                let dx = 0;
                let dy = 0;

                if (easingMode === 'smooth') {
                    dx = Math.sin(elapsed + offset) * 3;
                    dy = Math.cos(elapsed * 0.8 + offset) * 3;
                } else if (easingMode === 'bouncy') {
                    dx = Math.sin(elapsed * 1.5 + offset) * Math.sin(elapsed * 3) * 5;
                    dy = Math.cos(elapsed * 2 + offset) * Math.sin(elapsed * 2.5) * 5;
                } else if (easingMode === 'linear') {
                    dx = Math.sin(elapsed * 0.5 + offset) * 2;
                    dy = Math.sin(elapsed * 0.5 + offset + Math.PI / 2) * 2;
                }

                let finalPoint = {
                    ...p,
                    x: Math.max(0, Math.min(100, p.x + dx)),
                    y: Math.max(0, Math.min(100, p.y + dy))
                };

                if (magnetism && mousePosRef.current) {
                    const distToMouse = Math.sqrt(
                        Math.pow(finalPoint.x - mousePosRef.current.x, 2) +
                        Math.pow(finalPoint.y - mousePosRef.current.y, 2)
                    );

                    if (distToMouse < 40) {
                        const pullStrengh = (40 - distToMouse) / 400;
                        finalPoint.x += (mousePosRef.current.x - finalPoint.x) * pullStrengh;
                        finalPoint.y += (mousePosRef.current.y - finalPoint.y) * pullStrengh;
                    }
                }

                return finalPoint;
            });

            if (backgroundRef.current) {
                backgroundRef.current.style.backgroundImage = generateSVGGradient(animatedPoints, influence, vignette);
            }

            animationFrameId = requestAnimationFrame(animateGradient);
        };

        if (animate) {
            animateGradient();
        } else if (backgroundRef.current) {
            backgroundRef.current.style.backgroundImage = generateSVGGradient(points, influence, vignette);
        }

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [animate, points, width, height, influence, draggingId, animationSpeed, easingMode, vignette]);

    const backgroundStyle = {
        width: '100%',
        height: '100%',
        backgroundColor: '#fff',
        backgroundImage: generateSVGGradient(points, influence, vignette),
        borderRadius: '12px',
        position: 'relative' as const,
        overflow: 'hidden',
        boxShadow: 'var(--shadow-md)',
        mixBlendMode: blendMode as any
    };

    const selectedPoint = points.find(p => p.id === selectedId);

    return (
        <div
            ref={containerRef}
            onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingOver(true);
            }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={(e) => {
                e.preventDefault();
                setIsDraggingOver(false);
                const file = e.dataTransfer.files[0];
                if (file && file.type.startsWith('image/') && onImageDrop) {
                    onImageDrop(file);
                }
            }}
            style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                userSelect: 'none'
            }}
        >
            {isDraggingOver && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    border: '2px dashed var(--color-primary)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 100,
                    pointerEvents: 'none'
                }}>
                    <div style={{ padding: '12px 24px', backgroundColor: 'white', borderRadius: '24px', boxShadow: 'var(--shadow-lg)', fontWeight: 600, color: 'var(--color-primary)' }}>
                        Drop image to extract colors
                    </div>
                </div>
            )}

            <div ref={backgroundRef} style={backgroundStyle} />

            {noise > 0 && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'transparent',
                        backgroundImage: getTextureFilter(grainType, noise),
                        mixBlendMode: 'overlay',
                        pointerEvents: 'none',
                        borderRadius: '12px'
                    }}
                />
            )}

            {aspectRatio !== 'none' && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    zIndex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{
                        width: aspectRatio === '9:16' ? `${(9 / 16) * 100}%` : '100%',
                        height: aspectRatio === '16:9' ? `${(9 / 16) * 100}%` : '100%',
                        maxWidth: '100%',
                        maxHeight: '100%',
                        aspectRatio: aspectRatio.replace(':', '/'),
                        border: '1px dashed rgba(255, 255, 255, 0.4)',
                        boxShadow: '0 0 0 1000px rgba(0,0,0,0.1)'
                    }} />
                </div>
            )}

            {glassmorphism && (
                <div
                    style={{
                        position: 'absolute',
                        inset: '20px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '16px',
                        pointerEvents: 'none',
                        zIndex: 5
                    }}
                >
                    <div style={{ padding: '12px', fontSize: '10px', color: 'white', opacity: 0.5, fontWeight: 600 }}>GLASS PREVIEW</div>
                </div>
            )}

            {showWireframe && points.map(p => (
                <div
                    key={p.id}
                    onMouseDown={(e) => handleMouseDown(p.id, e)}
                    style={{
                        position: 'absolute',
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: selectedIds.includes(p.id) ? '28px' : '24px',
                        height: selectedIds.includes(p.id) ? '28px' : '24px',
                        borderRadius: '50%',
                        backgroundColor: p.color,
                        border: selectedIds.includes(p.id) ? '3px solid white' : '2px solid white',
                        boxShadow: selectedIds.includes(p.id) ? '0 0 0 2px #3b82f6, 0 8px 12px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.2)',
                        transform: 'translate(-50%, -50%)',
                        cursor: 'move',
                        zIndex: selectedIds.includes(p.id) ? 20 : 10,
                        transition: draggingId === p.id ? 'none' : 'width 0.15s, height 0.15s, transform 0.1s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {selectedIds.includes(p.id) && (
                        <div style={{ width: '4px', height: '4px', backgroundColor: 'white', borderRadius: '50%' }} />
                    )}

                    {selectedIds.includes(p.id) && (
                        <div
                            style={{
                                position: 'absolute',
                                width: `${(p.influence || influence) * 1.5}px`,
                                height: `${(p.influence || influence) * 1.5}px`,
                                borderRadius: '50%',
                                border: '1px solid rgba(255,255,255,0.4)',
                                background: 'rgba(255,255,255,0.05)',
                                pointerEvents: 'none',
                                animation: 'pulse 2s infinite ease-in-out'
                            }}
                        />
                    )}
                </div>
            ))}

            {selectedPoint && popoverPosition && createPortal(
                <div
                    className="mesh-popover"
                    style={{
                        position: 'fixed',
                        top: `${popoverPosition.top}px`,
                        left: `${popoverPosition.left}px`,
                        transform: 'translateX(-50%)',
                        zIndex: 99999,
                        backgroundColor: 'white',
                        padding: '12px',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <HexColorPicker
                        color={selectedPoint.color}
                        onChange={handleColorChange}
                    />
                    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '10px', fontWeight: 600, color: '#64748b' }}>SPREAD</span>
                            <span style={{ fontSize: '10px', fontWeight: 600, color: '#64748b' }}>{selectedPoint.influence || 50}%</span>
                        </div>
                        <input
                            type="range"
                            min="5" max="100"
                            value={selectedPoint.influence || 50}
                            onChange={(e) => handleInfluenceChange(Number(e.target.value))}
                            style={{ width: '100%', height: '4px', borderRadius: '2px', cursor: 'ew-resize' }}
                        />
                    </div>
                    <style>{`
                        .mesh-popover .react-colorful {
                            width: 140px;
                            height: 140px;
                        }
                        @keyframes pulse {
                            0% { transform: scale(1); opacity: 0.4; }
                            50% { transform: scale(1.05); opacity: 0.6; }
                            100% { transform: scale(1); opacity: 0.4; }
                        }
                    `}</style>
                </div>,
                document.body
            )}
        </div>
    );
};
