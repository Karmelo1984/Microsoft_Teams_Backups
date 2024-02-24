import * as readline from 'readline';
import path from 'path';

require('dotenv').config(); // Carga las variables de entorno desde .env
const ACCESS_TOKEN = process.env.ACCESS_TOKEN || '';
const PATH_SALIDA = path.resolve(__dirname, process.env.PATH_GENERAL || './salida');

import processChats from './src/extractChat';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

async function main(): Promise<void> {
    // Si no se encuentra el TOKEN no continuamos
    if (ACCESS_TOKEN === '') {
        console.error('El token de acceso está vacío. Deteniendo la ejecución.');
        process.exit(1); // Detener la ejecución del programa con un código de salida no cero para indicar un error
    }

    processChats(ACCESS_TOKEN, PATH_SALIDA);
}

main()
    .then(() => rl.close())
    .catch((err) => {
        rl.close();
        console.error(err);
    });
