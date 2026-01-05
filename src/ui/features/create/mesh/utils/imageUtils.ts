import { MeshPoint } from './meshUtils';

/**
 * extracts dominant/grid colors from an image source
 */
export const extractColorsFromImage = (
    imageSrc: string,
    rows: number,
    cols: number
): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }

            // We want to sample 'rows' x 'cols' points
            // To get a good representation, we can resize the image to exactly rows x cols
            // and let the canvas smoothing handle the averaging/sampling for us.
            // This is a quick and dirty "smart" extraction.
            canvas.width = cols;
            canvas.height = rows;

            // Draw image scaled down to grid size
            ctx.drawImage(img, 0, 0, cols, rows);

            const data = ctx.getImageData(0, 0, cols, rows).data;
            const colors: string[] = [];

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                // Convert to hex
                const hex = '#' + [r, g, b].map(x => {
                    const h = x.toString(16);
                    return h.length === 1 ? '0' + h : h;
                }).join('');
                colors.push(hex);
            }

            resolve(colors);
        };
        img.onerror = (e) => reject(e);
        img.src = imageSrc;
    });
};

/**
 * Maps extracted colors to existing mesh points
 */
export const applyImageColorsToMesh = (
    points: MeshPoint[],
    imageColors: string[]
): MeshPoint[] => {
    // If we simply map 1:1, it works if points are sorted.
    // Our points array is usually generated row by row.
    // Let's assume points are in order.

    return points.map((p, i) => ({
        ...p,
        // Use the extracted color if available, otherwise keep existing (or cycle)
        color: imageColors[i % imageColors.length] || p.color
    }));
};
