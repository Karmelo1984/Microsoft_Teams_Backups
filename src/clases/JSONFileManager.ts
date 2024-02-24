import fs from 'fs';
import path from 'path';

export default class JSONFileManager {
    filePath: string;

    constructor(filePath: string) {
        this.filePath = filePath;
    }

    // Método para escribir un objeto JSON en un archivo de manera asincrona
    async writeJSON(data: any) {
        if (typeof data !== 'object' || data === null || Array.isArray(data)) {
            console.error('Error: El dato proporcionado no es un objeto JSON válido.');
            return;
        }

        // Obtener el directorio del archivo
        const directory = path.dirname(this.filePath);

        // Comprobar si el directorio existe, si no, crearlo
        if (!fs.existsSync(directory)) {
            try {
                await fs.promises.mkdir(directory, { recursive: true }); // Crear directorio recursivamente
            } catch (error) {
                console.error(`Error al crear el directorio: ${error}`);
                return;
            }
        }

        // Escribir el archivo JSON
        try {
            await fs.promises.writeFile(this.filePath, JSON.stringify(data, null, 2));
            console.log(`Archivo guardado correctamente en ${this.filePath}`);
        } catch (error) {
            if (error instanceof Error) {
                console.error(`Error al guardar el archivo: ${error.message}`);
            } else {
                console.error(`Se produjo un error desconocido al guardar el archivo.`);
            }
        }
    }

    // Método para leer un objeto JSON desde un archivo
    readJSON() {
        try {
            const data = fs.readFileSync(this.filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            if (error instanceof Error) {
                console.error(`Error al leer el archivo: ${error.message}`);
            } else {
                console.error(`Se produjo un error desconocido al leer el archivo.`);
            }
            return null;
        }
    }
}
