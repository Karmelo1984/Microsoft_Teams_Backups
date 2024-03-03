import * as fs from 'fs';
import * as path from 'path';

export function findRootDirectory(rootMarker: string = 'package.json'): string | null {
    let currentPath = __dirname;
    while (currentPath !== '/') {
        const files = fs.readdirSync(currentPath);
        if (files.includes(rootMarker)) {
            return currentPath;
        }
        currentPath = path.dirname(currentPath);
    }

    return null; // No se encontró el marcador de raíz
}
