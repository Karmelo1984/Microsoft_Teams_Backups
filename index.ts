import * as readline from 'readline';
import path from 'path';

require('dotenv').config(); // Carga las variables de entorno desde .env
const ACCESS_TOKEN = process.env.ACCESS_TOKEN || '';
const PATH_SALIDA = path.resolve(__dirname, process.env.PATH_GENERAL || './salida');

import APIRequestManager from './src/clases/APIRequestManager';
import extractMyUser from './src/extractMyUser';
import extractChat from './src/extractChat';
import HTMLGenerator from './src/clases/HTMLGenerator';

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

    // Inicializar la conexión
    const apiRequestManager = new APIRequestManager(ACCESS_TOKEN);

    // Extraer Mi Usuario
    const myUser = await extractMyUser(apiRequestManager, PATH_SALIDA);

    const typeChat = await extractChat(apiRequestManager, myUser, PATH_SALIDA);

    // Ejemplo de uso:
    const htmlGenerator = new HTMLGenerator();
    const title = `${myUser.getUserName()} - Microsoft Teams Backup`;

    const generatedHTML = htmlGenerator.generateHTML(title, typeChat);

    //htmlGenerator.saveHTMLToFile(generatedHTML, path.resolve(PATH_SALIDA, 'web', `myBackupTeam.html`));
    htmlGenerator.saveHTMLToFile(generatedHTML, path.resolve(PATH_SALIDA, 'web', `index.html`));
}

main()
    .then(() => rl.close())
    .catch((err) => {
        rl.close();
        console.error(err);
    });
