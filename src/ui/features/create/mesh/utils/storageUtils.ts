import { MeshPoint } from './meshUtils';

export interface SavedMesh {
    id: string;
    name: string;
    points: MeshPoint[];
    density: number;
    influence: number;
    grain: number;
    timestamp: number;
}

const STORAGE_KEY = 'procolors-mesh-library';

export const saveMeshToLibrary = (
    name: string,
    points: MeshPoint[],
    density: number,
    influence: number,
    grain: number
): SavedMesh[] => {
    const savedGrgradients = getSavedMeshes();
    const newSaved: SavedMesh = {
        id: Date.now().toString(),
        name,
        points,
        density,
        influence,
        grain,
        timestamp: Date.now()
    };

    const updated = [newSaved, ...savedGrgradients];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
};

export const getSavedMeshes = (): SavedMesh[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];
        return JSON.parse(stored);
    } catch {
        return [];
    }
};

export const deleteMeshFromLibrary = (id: string): SavedMesh[] => {
    const saved = getSavedMeshes();
    const updated = saved.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
};
