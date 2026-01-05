import { MeshPoint } from './meshUtils';

export interface GradientPreset {
    id: string;
    name: string;
    colors: string[]; // List of colors to use for points
    background?: string; // Optional background color (not used yet but good for future)
}

export const MESH_PRESETS: GradientPreset[] = [
    {
        id: 'aurora',
        name: 'Aurora',
        colors: ['#00d2ff', '#3a7bd5', '#9be15d', '#00e3ae']
    },
    {
        id: 'sunset',
        name: 'Sunset',
        colors: ['#ff9966', '#ff5e62', '#ff9966', '#ffc3a0']
    },
    {
        id: 'holographic',
        name: 'Holographic',
        colors: ['#E0C3FC', '#8EC5FC', '#C2E9FB', '#FFFFFF']
    },
    {
        id: 'neon',
        name: 'Neon',
        colors: ['#F53844', '#42378F', '#F2F2F2', '#33E1ED']
    },
    {
        id: 'deep-sea',
        name: 'Deep Sea',
        colors: ['#2b5876', '#4e4376', '#2193b0', '#6dd5ed']
    },
    {
        id: 'forest',
        name: 'Forest',
        colors: ['#134E5E', '#71B280', '#5D9C59', '#C7E9B0']
    }
];

// Helper to apply a preset to an existing points structure
// It tries to distribute preset colors across the existing points
export const applyPresetToPoints = (points: MeshPoint[], preset: GradientPreset): MeshPoint[] => {
    return points.map((p, i) => ({
        ...p,
        color: preset.colors[i % preset.colors.length]
    }));
};
