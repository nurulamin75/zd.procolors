import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Shuffle, Wand2, Code, Play, Pause, MousePointer2, Eye, EyeOff, Database, Loader2 } from 'lucide-react';
import { ColorToken } from '../../../../utils/tokens';
import { MeshCanvas } from './components/MeshCanvas';
import {
    MeshPoint,
    generateInitialMesh,
    getRandomColorFromPalette,
    getHarmoniousColors,
    adjustMeshGlobal,
    MirrorMode,
    EasingMode,
    mirrorPoints,
    scalePoints,
    getHarmonyFromBase
} from './utils/meshUtils';
import { MESH_PRESETS, applyPresetToPoints } from './utils/presets';
import { extractColorsFromImage, applyImageColorsToMesh } from './utils/imageUtils';
import { ImageUploader } from './components/ImageUploader';
import { CodePreview } from './components/CodePreview';

interface MeshGradientModuleProps {
    palettes: Record<string, ColorToken[]>;
}

export const MeshGradientModule: React.FC<MeshGradientModuleProps> = ({ palettes }) => {
    interface MeshState {
        points: MeshPoint[];
        density: number;
    }

    const [meshState, setMeshState] = useState<MeshState>({ points: [], density: 3 });
    const { points, density } = meshState;

    const [showWireframe, setShowWireframe] = useState(true);
    const [animationSpeed, setAnimationSpeed] = useState(1);
    const [easingMode, setEasingMode] = useState<EasingMode>('smooth');
    const [vignette, setVignette] = useState(0);
    const [glassmorphism, setGlassmorphism] = useState(false);
    const [blendMode, setBlendMode] = useState('normal');
    const [mirrorMode, setMirrorMode] = useState<MirrorMode>('none');
    const [scale, setScale] = useState(1);
    const [activeTab, setActiveTab] = useState<'adjust' | 'animate' | 'effects'>('adjust');
    const [aspectRatio, setAspectRatio] = useState<'none' | '9:16' | '16:9' | '1:1'>('none');
    const [magnetism, setMagnetism] = useState(false);
    const [showCode, setShowCode] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [grain, setGrain] = useState(0);
    const [grainType, setGrainType] = useState<string>('noise');
    const [influence, setInfluence] = useState(50);

    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [collections, setCollections] = useState<{ id: string, name: string }[]>([]);
    const [isLoadingCollections, setIsLoadingCollections] = useState(false);

    // Global Adjustments State
    const [adjustments, setAdjustments] = useState({ hue: 0, saturation: 100, lightness: 100 });

    // Derived points with adjustments applied
    const displayedPoints = React.useMemo(() => {
        const { hue, saturation, lightness } = adjustments;
        if (hue === 0 && saturation === 100 && lightness === 100) return points;
        return adjustMeshGlobal(points, hue, saturation, lightness);
    }, [points, adjustments]);

    // Helper to update just points (clearing adjustments if any)
    const handlePointsChange = (newPoints: MeshPoint[]) => {
        const changedPoint = newPoints.find((p, i) => p.x !== points[i].x || p.y !== points[i].y || p.color !== points[i].color);

        let finalPoints = newPoints;
        if (changedPoint && mirrorMode !== 'none') {
            finalPoints = mirrorPoints(newPoints, mirrorMode, changedPoint.id);
        }

        setMeshState({ ...meshState, points: finalPoints });
        setAdjustments({ hue: 0, saturation: 100, lightness: 100 });
    };

    const updatePoints = (newPoints: MeshPoint[]) => {
        setMeshState({ ...meshState, points: newPoints });
        setAdjustments({ hue: 0, saturation: 100, lightness: 100 });
    };

    const updateDensity = (newDensity: number) => {
        setMeshState({
            density: newDensity,
            points: generateInitialMesh(palettes, newDensity)
        });
    };

    // Initialize mesh on first load or when no points exist
    useEffect(() => {
        if (points.length === 0 && Object.keys(palettes).length > 0) {
            updateDensity(3);
        }
    }, [palettes]);

    // Use ref to always have access to latest state values in event handler
    const exportStateRef = useRef({ displayedPoints, influence, grain, grainType, vignette, blendMode });
    
    // Update ref whenever state changes
    useEffect(() => {
        exportStateRef.current = { displayedPoints, influence, grain, grainType, vignette, blendMode };
    }, [displayedPoints, influence, grain, grainType, vignette, blendMode]);

    // Function to render gradient with effects to canvas and get image data
    const renderGradientToCanvas = async (width: number, height: number): Promise<Uint8Array> => {
        const state = exportStateRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;

        // Draw white background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);

        // Calculate influence factor
        const influenceFactor = Math.max(0.1, Math.min(1, state.influence / 100));

        // Draw each mesh point as a blurred circle
        for (const p of state.displayedPoints) {
            const radius = Math.max(width, height) * (0.2 + (influenceFactor * 0.4));
            const x = (p.x / 100) * width;
            const y = (p.y / 100) * height;

            // Create radial gradient for each point
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, p.color);
            gradient.addColorStop(1, p.color + '00'); // Transparent at edges

            ctx.globalCompositeOperation = state.blendMode === 'normal' ? 'source-over' : 
                state.blendMode === 'multiply' ? 'multiply' :
                state.blendMode === 'screen' ? 'screen' :
                state.blendMode === 'overlay' ? 'overlay' : 'source-over';
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.globalCompositeOperation = 'source-over';

        // Apply vignette if needed
        if (state.vignette > 0) {
            const vignetteGradient = ctx.createRadialGradient(
                width / 2, height / 2, Math.min(width, height) * 0.2,
                width / 2, height / 2, Math.max(width, height) * 0.7
            );
            vignetteGradient.addColorStop(0, 'rgba(0,0,0,0)');
            vignetteGradient.addColorStop(1, `rgba(0,0,0,${state.vignette / 100 * 0.6})`);
            ctx.fillStyle = vignetteGradient;
            ctx.fillRect(0, 0, width, height);
        }

        // Apply grain/noise if needed
        if (state.grain > 0) {
            const noiseOpacity = Math.min(state.grain / 100, 0.5);
            const currentGrainType = state.grainType;
            
            // Create SVG with the exact same filter as the preview
            let svgFilter = '';
            let svgContent = '';
            
            if (currentGrainType === 'fiber') {
                svgFilter = `<filter id="texture"><feTurbulence type="fractalNoise" baseFrequency="0.01 0.5" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncR type="linear" slope="2" intercept="-0.5"/></feComponentTransfer></filter>`;
                svgContent = `<rect width="100%" height="100%" filter="url(#texture)" opacity="${noiseOpacity}"/>`;
            } else if (currentGrainType === 'paper') {
                svgFilter = `<filter id="texture"><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" stitchTiles="stitch"/><feDiffuseLighting lighting-color="white" surfaceScale="2"><feDistantLight azimuth="45" elevation="60"/></feDiffuseLighting></filter>`;
                svgContent = `<rect width="100%" height="100%" filter="url(#texture)" opacity="${noiseOpacity}"/>`;
            } else if (currentGrainType === 'film') {
                svgFilter = `<filter id="texture"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="1" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>`;
                svgContent = `<rect width="100%" height="100%" filter="url(#texture)" opacity="${noiseOpacity}"/>`;
            } else if (currentGrainType === 'canvas') {
                svgFilter = '';
                svgContent = `<defs><pattern id="canvasPattern" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="white"/><path d="M0 10h20M10 0v20" stroke="black" stroke-opacity="${noiseOpacity / 5}" stroke-width="0.5"/></pattern></defs><rect width="100%" height="100%" fill="url(#canvasPattern)"/>`;
            } else {
                svgFilter = `<filter id="texture"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/></filter>`;
                svgContent = `<rect width="100%" height="100%" filter="url(#texture)" opacity="${noiseOpacity}"/>`;
            }
            
            const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${svgFilter}${svgContent}</svg>`;
            
            // Convert SVG to image and draw on canvas
            const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
            const svgUrl = URL.createObjectURL(svgBlob);
            
            await new Promise<void>((resolve) => {
                const img = new Image();
                img.onload = () => {
                    ctx.globalCompositeOperation = 'overlay';
                    ctx.drawImage(img, 0, 0);
                    ctx.globalCompositeOperation = 'source-over';
                    URL.revokeObjectURL(svgUrl);
                    resolve();
                };
                img.onerror = () => {
                    URL.revokeObjectURL(svgUrl);
                    resolve();
                };
                img.src = svgUrl;
            });
        }

        // Convert to PNG bytes
        const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((b) => resolve(b!), 'image/png');
        });
        const arrayBuffer = await blob.arrayBuffer();
        return new Uint8Array(arrayBuffer);
    };

    // Listen for export trigger from App header
    useEffect(() => {
        const onExportTrigger = async (e: Event) => {
            const customEvent = e as CustomEvent<{ exportType?: 'frame' | 'image' }>;
            const exportType = customEvent.detail?.exportType || 'frame';
            const state = exportStateRef.current;
            
            if (exportType === 'image') {
                // For image export, render with effects to canvas and send PNG data
                try {
                    const imageData = await renderGradientToCanvas(800, 600);
                    parent.postMessage({
                        pluginMessage: {
                            type: 'create-mesh-gradient-image',
                            imageData: Array.from(imageData), // Convert to regular array for postMessage
                            width: 800,
                            height: 600
                        }
                    }, '*');
                } catch (err) {
                    console.error('Failed to render gradient:', err);
                }
            } else {
                // For frame export, send the data for Figma to render
                // Also generate noise texture if needed
                let noiseTextureData: number[] | null = null;
                
                if (state.grain > 0) {
                    // Generate noise texture as PNG using same SVG filters as preview
                    const noiseWidth = 400;
                    const noiseHeight = 300;
                    const noiseOpacity = Math.min(state.grain / 100, 0.6);
                    const currentGrainType = state.grainType;
                    
                    // Create SVG with the exact same filter as the preview
                    let svgFilter = '';
                    let svgContent = '';
                    
                    if (currentGrainType === 'fiber') {
                        svgFilter = `<filter id="texture"><feTurbulence type="fractalNoise" baseFrequency="0.01 0.5" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncR type="linear" slope="2" intercept="-0.5"/></feComponentTransfer></filter>`;
                        svgContent = `<rect width="100%" height="100%" filter="url(#texture)" opacity="${noiseOpacity}"/>`;
                    } else if (currentGrainType === 'paper') {
                        svgFilter = `<filter id="texture"><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" stitchTiles="stitch"/><feDiffuseLighting lighting-color="white" surfaceScale="2"><feDistantLight azimuth="45" elevation="60"/></feDiffuseLighting></filter>`;
                        svgContent = `<rect width="100%" height="100%" filter="url(#texture)" opacity="${noiseOpacity}"/>`;
                    } else if (currentGrainType === 'film') {
                        svgFilter = `<filter id="texture"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="1" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>`;
                        svgContent = `<rect width="100%" height="100%" filter="url(#texture)" opacity="${noiseOpacity}"/>`;
                    } else if (currentGrainType === 'canvas') {
                        svgFilter = '';
                        svgContent = `<defs><pattern id="canvasPattern" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="white"/><path d="M0 10h20M10 0v20" stroke="black" stroke-opacity="${noiseOpacity / 5}" stroke-width="0.5"/></pattern></defs><rect width="100%" height="100%" fill="url(#canvasPattern)"/>`;
                    } else {
                        svgFilter = `<filter id="texture"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/></filter>`;
                        svgContent = `<rect width="100%" height="100%" filter="url(#texture)" opacity="${noiseOpacity}"/>`;
                    }
                    
                    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${noiseWidth}" height="${noiseHeight}">${svgFilter}${svgContent}</svg>`;
                    
                    // Convert SVG to PNG via canvas
                    const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
                    const svgUrl = URL.createObjectURL(svgBlob);
                    
                    const pngData = await new Promise<number[] | null>((resolve) => {
                        const img = new Image();
                        img.onload = () => {
                            const canvas = document.createElement('canvas');
                            canvas.width = noiseWidth;
                            canvas.height = noiseHeight;
                            const ctx = canvas.getContext('2d')!;
                            ctx.drawImage(img, 0, 0);
                            URL.revokeObjectURL(svgUrl);
                            
                            canvas.toBlob((blob) => {
                                if (blob) {
                                    blob.arrayBuffer().then(ab => {
                                        resolve(Array.from(new Uint8Array(ab)));
                                    });
                                } else {
                                    resolve(null);
                                }
                            }, 'image/png');
                        };
                        img.onerror = () => {
                            URL.revokeObjectURL(svgUrl);
                            resolve(null);
                        };
                        img.src = svgUrl;
                    });
                    
                    noiseTextureData = pngData;
                }
                
                parent.postMessage({
                    pluginMessage: {
                        type: 'create-mesh-gradient',
                        exportType: exportType,
                        points: state.displayedPoints,
                        width: 800,
                        height: 600,
                        influence: state.influence,
                        vignette: state.vignette,
                        noise: state.grain,
                        grainType: state.grainType,
                        blendMode: state.blendMode,
                        noiseTextureData: noiseTextureData
                    }
                }, '*');
            }
        };
        window.addEventListener('mesh-gradient-export', onExportTrigger);
        return () => window.removeEventListener('mesh-gradient-export', onExportTrigger);
    }, []); // Only set up once, ref handles latest values

    const handleRandomize = () => {
        const p1 = generateInitialMesh(palettes, density);
        setMeshState({ points: p1, density });
    };

    const handleRandomizeColors = () => {
        const updated = points.map(p => ({
            ...p,
            color: getRandomColorFromPalette(palettes)
        }));
        updatePoints(updated);
    };

    const handleSmoothRandomize = () => {
        const harmoniousSet = getHarmoniousColors(palettes);
        const updated = points.map(p => ({
            ...p,
            color: harmoniousSet[Math.floor(Math.random() * harmoniousSet.length)]
        }));
        updatePoints(updated);
    };

    const handleDensityChange = (newDensity: number) => {
        updateDensity(newDensity);
    };

    const handlePresetSelect = (presetId: string) => {
        const preset = MESH_PRESETS.find(p => p.id === presetId);
        if (preset) {
            updatePoints(applyPresetToPoints(points, preset));
        }
    };

    const handleApplyHarmony = (type: 'analogous' | 'triadic' | 'split-complementary') => {
        if (points.length === 0) return;
        const baseColor = points[0].color;
        const harmony = getHarmonyFromBase(baseColor, type);
        updatePoints(points.map((p, i) => ({
            ...p,
            color: harmony[i % harmony.length]
        })));
    };

    const handleRandomizePositions = () => {
        updatePoints(points.map(p => ({
            ...p,
            x: 10 + Math.random() * 80,
            y: 10 + Math.random() * 80
        })));
    };

    const handleScaleChange = (newScale: number) => {
        const factor = newScale / scale;
        const newPoints = scalePoints(points, factor);
        setMeshState({ ...meshState, points: newPoints });
        setScale(newScale);
    };

    const handleSampleSelection = () => {
        parent.postMessage({ pluginMessage: { type: 'sample-figma-selection' } }, '*');
    };

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const msg = event.data.pluginMessage;
            if (msg.type === 'selection-colors' && msg.colors) {
                const newPoints = applyImageColorsToMesh(points, msg.colors);
                updatePoints(newPoints);
            } else if (msg.type === 'mesh-variable-collections-response') {
                setCollections(msg.collections || []);
                setIsLoadingCollections(false);
                if (msg.collections && msg.collections.length > 0) {
                    setIsImportModalOpen(true);
                } else {
                    parent.postMessage({ pluginMessage: { type: 'notify', message: 'No variable collections found in this file.' } }, '*');
                }
            } else if (msg.type === 'mesh-variables-response') {
                const newPoints = applyImageColorsToMesh(points, msg.colors);
                updatePoints(newPoints);
                setIsImportModalOpen(false);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [points]);

    const handleImportFromVariables = () => {
        setIsLoadingCollections(true);
        parent.postMessage({ pluginMessage: { type: 'get-mesh-variable-collections' } }, '*');
    };

    const handleSelectCollection = (collectionId: string) => {
        parent.postMessage({ pluginMessage: { type: 'get-mesh-variables-from-collection', collectionId } }, '*');
    };

    const handleImageUpload = async (file: File) => {
        try {
            const url = URL.createObjectURL(file);
            const colors = await extractColorsFromImage(url, density, density);
            URL.revokeObjectURL(url);
            const newPoints = applyImageColorsToMesh(points, colors);
            updatePoints(newPoints);
        } catch (error) {
            console.error("Failed to extract colors from image:", error);
        }
    };

    const handleSyncVariables = () => {
        parent.postMessage({
            pluginMessage: {
                type: 'create-mesh-variables',
                colors: displayedPoints.map(p => p.color),
                name: 'Mesh Gradient'
            }
        }, '*');
    };

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '0px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', height: '100%' }}>

                {/* Left Column: Controls (Fixed Width) */}
                <div
                    className="no-scrollbar"
                    style={{
                        width: '320px',
                        flexShrink: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                        padding: '16px',
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        maxHeight: '100%',
                        overflowY: 'auto'
                    }}>

                    {/* TOP SECTION: Randomization & Primary Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* Row 1: Randomization */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '6px',
                            backgroundColor: 'transparent',
                            padding: '0'
                        }}>
                            <button className="btn" onClick={handleRandomize} title="New" style={{ height: '36px', gap: '6px', fontSize: '11px', width: '100%', borderRadius: '100px', backgroundColor: '#f1f5f9', border: 'none', color: 'var(--color-text-primary)' }}>
                                <RefreshCw size={14} /> <span style={{ fontWeight: 600 }}>New</span>
                            </button>
                            <button className="btn" onClick={handleRandomizeColors} title="Chaos" style={{ height: '36px', gap: '6px', fontSize: '11px', width: '100%', borderRadius: '100px', backgroundColor: '#f1f5f9', border: 'none', color: 'var(--color-text-primary)' }}>
                                <Shuffle size={14} /> <span style={{ fontWeight: 600 }}>Colors</span>
                            </button>
                            <button className="btn" onClick={handleRandomizePositions} title="Layout" style={{ height: '36px', gap: '6px', fontSize: '11px', width: '100%', borderRadius: '100px', backgroundColor: '#f1f5f9', border: 'none', color: 'var(--color-text-primary)' }}>
                                <Shuffle size={14} /> <span style={{ fontWeight: 600 }}>Forms</span>
                            </button>
                            <button className="btn" onClick={handleSmoothRandomize} title="Smooth" style={{ height: '36px', gap: '6px', fontSize: '11px', width: '100%', borderRadius: '100px', backgroundColor: '#f1f5f9', border: 'none', color: 'var(--color-text-primary)' }}>
                                <Wand2 size={14} /> <span style={{ fontWeight: 600 }}>Smooth</span>
                            </button>
                        </div>

                        {/* Row 2: Secondary Tools Toolbar (Combined) */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px',
                            backgroundColor: '#f1f5f9',
                            padding: '4px',
                            borderRadius: '100px'
                        }}>
                            {/* Group 2: Preview Tools */}
                            <div style={{ display: 'flex', gap: '2px', flex: 1, justifyContent: 'center' }}>
                                <button
                                    className="btn btn-icon"
                                    onClick={handleSampleSelection}
                                    title="Sample Figma Selection"
                                    style={{ padding: '0', width: '32px', height: '32px', borderRadius: '100px' }}
                                >
                                    <MousePointer2 size={16} />
                                </button>
                                <button
                                    className={`btn ${showCode ? 'btn-primary' : 'btn-icon'} `}
                                    onClick={() => setShowCode(!showCode)}
                                    title="View CSS"
                                    style={{ padding: '0', width: '32px', height: '32px', borderRadius: '100px' }}
                                >
                                    <Code size={16} />
                                </button>
                                <button
                                    className="btn btn-icon"
                                    onClick={handleImportFromVariables}
                                    title="Use colors from existing variables"
                                    style={{ padding: '6px', width: '32px', height: '32px' }}
                                    disabled={isLoadingCollections}
                                >
                                    {isLoadingCollections ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
                                </button>
                                <button
                                    className="btn btn-icon"
                                    onClick={handleSyncVariables}
                                    title="Sync Colors to Figma Variables"
                                    style={{ padding: '6px', width: '32px', height: '32px' }}
                                >
                                    <RefreshCw size={16} />
                                </button>
                                <button
                                    className={`btn ${isAnimating ? 'btn-primary' : 'btn-icon'} `}
                                    onClick={() => setIsAnimating(!isAnimating)}
                                    title={isAnimating ? "Pause Animation" : "Play Animation"}
                                    style={{ padding: '0', width: '32px', height: '32px', borderRadius: '100px' }}
                                >
                                    {isAnimating ? <Pause size={16} /> : <Play size={16} />}
                                </button>
                            </div>

                            {/* Divider */}
                            <div style={{ width: '1px', height: '16px', backgroundColor: 'rgba(0,0,0,0.08)', margin: '0 4px' }} />

                            {/* Group 3: Visibility */}
                            <div style={{ display: 'flex' }}>
                                <button
                                    className={`btn ${!showWireframe ? 'btn-primary' : 'btn-icon'} `}
                                    onClick={() => setShowWireframe(!showWireframe)}
                                    title={showWireframe ? "Hide Mesh Controls" : "Show Mesh Controls"}
                                    style={{ padding: '0', width: '32px', height: '32px', borderRadius: '100px' }}
                                >
                                    {showWireframe ? <Eye size={16} /> : <EyeOff size={16} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* TABS NAVIGATION */}
                    <div style={{
                        display: 'flex',
                        gap: '4px',
                        backgroundColor: '#f1f5f9',
                        padding: '4px',
                        borderRadius: '100px',
                        marginBottom: '4px'
                    }}>
                        {(['adjust', 'animate', 'effects'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    flex: 1,
                                    padding: '6px 0',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    borderRadius: '100px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    backgroundColor: activeTab === tab ? '#ffffff' : 'transparent',
                                    color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                    boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                    textTransform: 'capitalize',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* TAB CONTENT: ADJUST */}
                    {activeTab === 'adjust' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Color & Scale</span>
                                    <button
                                        onClick={() => {
                                            setAdjustments({ hue: 0, saturation: 100, lightness: 100 });
                                            setInfluence(50);
                                            setScale(1);
                                        }}
                                        style={{ fontSize: '10px', color: 'var(--color-primary)', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 600 }}
                                    >
                                        Reset
                                    </button>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                                    {[
                                        { label: 'INF', val: influence, set: setInfluence, min: 10, max: 100, suffix: '%' },
                                        { label: 'HUE', val: adjustments.hue, set: (v: number) => setAdjustments({ ...adjustments, hue: v }), min: -180, max: 180 },
                                        { label: 'SAT', val: adjustments.saturation, set: (v: number) => setAdjustments({ ...adjustments, saturation: v }), min: 0, max: 200 },
                                        { label: 'LIG', val: adjustments.lightness, set: (v: number) => setAdjustments({ ...adjustments, lightness: v }), min: 0, max: 200 },
                                        { label: 'SCL', val: Math.round(scale * 100), set: (v: number) => handleScaleChange(v / 100), min: 50, max: 150, suffix: '%' }
                                    ].map(s => (
                                        <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ fontSize: '10px', fontWeight: 700, width: '28px', color: 'var(--color-text-tertiary)' }}>{s.label}</span>
                                            <input
                                                type="range"
                                                min={s.min} max={s.max}
                                                value={s.val}
                                                onChange={(e) => s.set(Number(e.target.value))}
                                                className="modern-slider"
                                                style={{ flex: 1 }}
                                            />
                                            {s.suffix && <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', width: '24px', textAlign: 'right' }}>{s.val}{s.suffix}</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Symmetry</span>
                                <div style={{ display: 'flex', gap: '4px', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '100px' }}>
                                    {(['none', 'x', 'y', 'both'] as const).map(m => (
                                        <button
                                            key={m}
                                            onClick={() => setMirrorMode(m)}
                                            style={{
                                                flex: 1,
                                                padding: '4px 0',
                                                fontSize: '10px',
                                                fontWeight: 600,
                                                borderRadius: '100px',
                                                border: 'none',
                                                cursor: 'pointer',
                                                backgroundColor: mirrorMode === m ? '#ffffff' : 'transparent',
                                                color: mirrorMode === m ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                                boxShadow: mirrorMode === m ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                                                textTransform: 'uppercase'
                                            }}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Harmonies</span>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    {[
                                        { label: 'Analog', type: 'analogous' },
                                        { label: 'Triadic', type: 'triadic' },
                                        { label: 'Split', type: 'split-complementary' }
                                    ].map(h => (
                                        <button
                                            key={h.type}
                                            className="btn"
                                            onClick={() => handleApplyHarmony(h.type as any)}
                                            style={{ flex: 1, height: '28px', fontSize: '10px', fontWeight: 600, borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: 'white' }}
                                        >
                                            {h.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '4px 0' }} />

                            {/* DENSITY & EXPORT SECTION */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Structure</span>
                                    <div style={{ display: 'flex', gap: '4px', backgroundColor: '#f1f5f9', padding: '2px', borderRadius: '8px' }}>
                                        {[2, 3, 4, 5].map(d => (
                                            <button
                                                key={d}
                                                onClick={() => handleDensityChange(d)}
                                                style={{
                                                    padding: '2px 8px',
                                                    fontSize: '10px',
                                                    fontWeight: 600,
                                                    borderRadius: '6px',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    backgroundColor: density === d ? '#ffffff' : 'transparent',
                                                    color: density === d ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                                    boxShadow: density === d ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                                                }}
                                            >
                                                {d}x{d}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Guides</span>
                                    <div style={{ display: 'flex', gap: '4px', backgroundColor: '#f1f5f9', padding: '2px', borderRadius: '8px' }}>
                                        {(['none', '9:16', '16:9', '1:1'] as const).map(ratio => (
                                            <button
                                                key={ratio}
                                                onClick={() => setAspectRatio(ratio)}
                                                style={{
                                                    padding: '2px 8px',
                                                    fontSize: '10px',
                                                    fontWeight: 600,
                                                    borderRadius: '6px',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    backgroundColor: aspectRatio === ratio ? '#ffffff' : 'transparent',
                                                    color: aspectRatio === ratio ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                                    boxShadow: aspectRatio === ratio ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                                                }}
                                            >
                                                {ratio}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div style={{ height: '1px', backgroundColor: 'var(--color-border-light)' }} />

                            {/* SECTION: Presets & Image */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <details>
                                    <summary style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', cursor: 'pointer', outline: 'none', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>Presets & Assets</span>
                                        <Wand2 size={12} />
                                    </summary>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr',
                                            gap: '6px'
                                        }}>
                                            {MESH_PRESETS.map(preset => (
                                                <button
                                                    key={preset.id}
                                                    onClick={() => handlePresetSelect(preset.id)}
                                                    className="preset-card"
                                                    style={{
                                                        position: 'relative',
                                                        height: '66px',
                                                        border: '1px dashed rgba(255, 255, 255, 0.4)',
                                                        background: '#ffffff',
                                                        cursor: 'pointer',
                                                        padding: '0',
                                                        overflow: 'hidden',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        outline: 'none'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)';
                                                    }}
                                                >
                                                    <div style={{
                                                        flex: 1,
                                                        width: '100%',
                                                        background: `linear-gradient(135deg, ${preset.colors.join(', ')})`,
                                                    }} />
                                                    <div style={{
                                                        width: '100%',
                                                        padding: '6px 10px',
                                                        backgroundColor: '#ffffff',
                                                        textAlign: 'left',
                                                        borderTop: '1px solid rgba(0,0,0,0.03)',
                                                        boxSizing: 'border-box'
                                                    }}>
                                                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-primary)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {preset.name}
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                        <ImageUploader onImageSelect={handleImageUpload} />
                                    </div>
                                </details>
                            </div>
                        </div>
                    )}

                    {/* TAB CONTENT: ANIMATE */}
                    {activeTab === 'animate' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Motion Properties</span>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ fontSize: '10px', fontWeight: 700, width: '40px', color: 'var(--color-text-tertiary)' }}>SPEED</span>
                                        <input
                                            type="range"
                                            min="10" max="300"
                                            value={animationSpeed * 100}
                                            onChange={(e) => setAnimationSpeed(Number(e.target.value) / 100)}
                                            className="modern-slider"
                                            style={{ flex: 1 }}
                                        />
                                        <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', width: '28px', textAlign: 'right' }}>{Math.round(animationSpeed * 100)}%</span>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-tertiary)' }}>EASING PATTERN</span>
                                        <div style={{ display: 'flex', gap: '4px', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
                                            {(['smooth', 'bouncy', 'linear'] as const).map(e => (
                                                <button
                                                    key={e}
                                                    onClick={() => setEasingMode(e)}
                                                    style={{
                                                        flex: 1,
                                                        padding: '6px 0',
                                                        fontSize: '10px',
                                                        fontWeight: 600,
                                                        borderRadius: '6px',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        backgroundColor: easingMode === e ? '#ffffff' : 'transparent',
                                                        color: easingMode === e ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                                        boxShadow: easingMode === e ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                                                        textTransform: 'capitalize'
                                                    }}
                                                >
                                                    {e}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                className={`btn ${isAnimating ? 'btn-primary' : 'btn-secondary'} `}
                                onClick={() => setIsAnimating(!isAnimating)}
                                style={{ width: '100%', height: '40px', borderRadius: '12px', fontWeight: 600, gap: '8px' }}
                            >
                                {isAnimating ? <Pause size={16} /> : <Play size={16} />}
                                {isAnimating ? "Pause Animation" : "Start Animation"}
                            </button>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Cursor Magnetism</span>
                                    <span style={{ fontSize: '9px', color: 'var(--color-text-tertiary)' }}>Points react to your mouse</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={magnetism}
                                    onChange={(e) => setMagnetism(e.target.checked)}
                                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                />
                            </div>
                        </div>
                    )}

                    {/* TAB CONTENT: EFFECTS */}
                    {activeTab === 'effects' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Visual Enhancements</span>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-tertiary)' }}>GRAIN TYPE</span>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                            {['noise', 'fiber', 'paper', 'film', 'canvas'].map(type => (
                                                <button
                                                    key={type}
                                                    onClick={() => setGrainType(type)}
                                                    style={{
                                                        padding: '4px 8px',
                                                        fontSize: '10px',
                                                        fontWeight: 600,
                                                        borderRadius: '6px',
                                                        border: '1px solid #e2e8f0',
                                                        cursor: 'pointer',
                                                        backgroundColor: grainType === type ? 'var(--color-primary)' : 'white',
                                                        color: grainType === type ? 'white' : 'var(--color-text-secondary)',
                                                        textTransform: 'capitalize'
                                                    }}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ fontSize: '10px', fontWeight: 700, width: '40px', color: 'var(--color-text-tertiary)' }}>NOISE</span>
                                        <input
                                            type="range"
                                            min="0" max="60"
                                            value={grain}
                                            onChange={(e) => setGrain(Number(e.target.value))}
                                            className="modern-slider"
                                            style={{ flex: 1 }}
                                        />
                                        <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', width: '28px', textAlign: 'right' }}>{grain}%</span>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ fontSize: '10px', fontWeight: 700, width: '40px', color: 'var(--color-text-tertiary)' }}>VIG</span>
                                        <input
                                            type="range"
                                            min="0" max="100"
                                            value={vignette}
                                            onChange={(e) => setVignette(Number(e.target.value))}
                                            className="modern-slider"
                                            style={{ flex: 1 }}
                                        />
                                        <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', width: '28px', textAlign: 'right' }}>{vignette}%</span>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Glassmorphism</span>
                                        <input
                                            type="checkbox"
                                            checked={glassmorphism}
                                            onChange={(e) => setGlassmorphism(e.target.checked)}
                                            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-tertiary)' }}>BLEND MODE</span>
                                        <select
                                            value={blendMode}
                                            onChange={(e) => setBlendMode(e.target.value)}
                                            style={{ padding: '6px', fontSize: '11px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: 'white' }}
                                        >
                                            <option value="normal">Normal</option>
                                            <option value="overlay">Overlay</option>
                                            <option value="multiply">Multiply</option>
                                            <option value="screen">Screen</option>
                                            <option value="hard-light">Hard Light</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Right Column: Canvas Preview */}
                <div style={{
                    flex: 1,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#f9fafb',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    <MeshCanvas
                        points={displayedPoints}
                        showWireframe={showWireframe}
                        animate={isAnimating}
                        width={600}
                        height={450}
                        onChange={handlePointsChange}
                        influence={influence}
                        animationSpeed={animationSpeed}
                        easingMode={easingMode}
                        noise={grain}
                        grainType={grainType}
                        vignette={vignette}
                        blendMode={blendMode}
                        aspectRatio={aspectRatio}
                        magnetism={magnetism}
                    />

                    {showCode && (
                        <CodePreview
                            points={points}
                            influence={influence}
                            animationSpeed={animationSpeed}
                            easingMode={easingMode}
                            noise={grain}
                            grainType={grainType}
                            vignette={vignette}
                            glassmorphism={glassmorphism}
                            aspectRatio={aspectRatio}
                            magnetism={magnetism}
                        />
                    )}

                    <div style={{
                        position: 'absolute',
                        bottom: '12px',
                        right: '12px',
                        backgroundColor: 'rgba(255,255,255,0.8)',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '10px',
                        color: 'var(--color-text-tertiary)',
                        pointerEvents: 'none'
                    }}>
                        Preview
                    </div>
                </div>
            </div>

            {/* Collection Selection Modal */}
            {isImportModalOpen && (
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
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '24px',
                        maxWidth: '400px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600 }}>
                            Select Variable Collection
                        </h3>
                        <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                            Choose a collection to import colors from:
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {collections.map((collection) => (
                                <button
                                    key={collection.id}
                                    className="btn"
                                    onClick={() => handleSelectCollection(collection.id)}
                                    style={{
                                        padding: '12px',
                                        textAlign: 'left',
                                        backgroundColor: '#f8fafc',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#f1f5f9';
                                        e.currentTarget.style.borderColor = '#cbd5e1';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#f8fafc';
                                        e.currentTarget.style.borderColor = '#e2e8f0';
                                    }}
                                >
                                    {collection.name}
                                </button>
                            ))}
                        </div>
                        <button
                            className="btn"
                            onClick={() => setIsImportModalOpen(false)}
                            style={{
                                marginTop: '16px',
                                width: '100%',
                                padding: '10px',
                                backgroundColor: 'transparent',
                                border: '1px solid #e2e8f0'
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )
            }
        </div >
    );
};
