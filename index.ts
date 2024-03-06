import * as readline from 'readline';
import path from 'path';
import fs from 'fs';

require('dotenv').config(); // Carga las variables de entorno desde .env
const ACCESS_TOKEN = process.env.ACCESS_TOKEN || '';
const PATH_SALIDA = process.env.PATH_GENERAL || path.resolve(__dirname, './salida');

import APIRequestManager from './src/clases/APIRequestManager';
import extractMyUser from './src/extractMyUser';
import extractChat from './src/extractChat';

import Chat from './src/clases/chat/chat';
import ResumePathChat, { ResumePathChatTypes } from './src/interfaces/resumePath.interfaces';
import IndexHTML from './src/clases/html/indexHTML';
import Mensaje from './src/clases/mensaje/mensaje';
import BasicLog from './src/clases/basicLog';
import ChatHTML from './src/clases/html/chatHTML';
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

async function main(): Promise<void> {
    BasicLog.consoleLog('MAIN', 'Comprobar si el ACCESS_TOKEN es válido');
    if (ACCESS_TOKEN === '') {
        console.error('NO se ha encontrado ACCESS_TOKEN. NO se puede continuar.');
        process.exit(1); // Detener la ejecución del programa con un código de salida no cero para indicar un error
    }

    BasicLog.consoleLog('MAIN', 'Inicializar path donde se guardarán los distintos ficheros');
    const path_jsonChat = path.resolve(PATH_SALIDA, 'chats');
    const path_web = path.resolve(PATH_SALIDA, 'web');

    const pathMyUserPhoto = path.resolve(path_web, 'myUser.png');
    const path_webChat = path.resolve(path_web, 'chats');
    const path_indexHTML = path.resolve(path_web, `index.html`);

    BasicLog.consoleLog('MAIN', 'Inicializar la conexión');
    const apiRequestManager = new APIRequestManager(ACCESS_TOKEN);

    BasicLog.consoleLog('MAIN', 'Extraer el usuario relacionado al ACCESS_TOKEN');
    const myUser = await extractMyUser(apiRequestManager, PATH_SALIDA);

    BasicLog.consoleLog('MAIN', 'Descargar la imagen de perfil del usuario');
    apiRequestManager.fetchResponseImage('https://graph.microsoft.com/v1.0/me/photo/$value', pathMyUserPhoto);

    BasicLog.consoleLog('MAIN', `Extraer todos los chats relacionados al ACCESS_TOKEN`);
    const myChat = await extractChat(PATH_SALIDA, apiRequestManager, myUser, path_jsonChat);

    BasicLog.consoleLog('MAIN', `Generar JSON con path, aprupados por 'chatType'`);
    const resumeTypeChats: ResumePathChatTypes[] = generateInfoPath(myChat, path_jsonChat, path_webChat);

    BasicLog.consoleLog('MAIN', `Generar 'index.html'`);
    IndexHTML.generateIndexHTML(myUser.getUserName(), './myUser.png', resumeTypeChats, path_indexHTML);

    let chatCount = 1;
    for (const chat of myChat) {
        const msgHead = `[${(chatCount++).toString().padStart(3, '0')} / ${myChat.length.toString().padStart(3, '0')}]`;

        BasicLog.consoleLog('MAIN', `${msgHead} Descargando imágenes: ${chat.topic}`);
        const crc32 = chat.standardName ?? '';
        const path_ChatHTML = path.resolve(path_webChat, crc32, `${crc32}.html`);
        const path_ChatImages = path.resolve(path_webChat, crc32, 'images');
        const path_ChatAttachments = path.resolve(path_webChat, crc32, 'attachments');

        fs.access(path_ChatImages, fs.constants.F_OK, (err) => {
            if (err) {
                fs.mkdirSync(path_ChatImages, { recursive: true });
            }
        });

        const mensajes = chat.messages ?? [];

        let mensajesCount = 1;
        for (const mensaje of mensajes) {
            const imageName = `image-${String(mensajesCount++).padStart(5, '0')}.png`;

            const attachmentName = `attachment-${String(mensajesCount++).padStart(5, '0')}`;

            await Mensaje.processImages(apiRequestManager, mensaje, path_ChatImages, imageName);

            await Mensaje.processAttachments(mensaje, path_ChatAttachments, attachmentName);
        }

        BasicLog.consoleLog('MAIN', `${msgHead} Generar 'chat.html': ${chat.topic}`);
        ChatHTML.generateChatHTML(chat, myUser.id, path_ChatHTML);
    }
}

function generateInfoPath(myChat: Chat[], pathChatJSON: string, pathChatWeb: string): ResumePathChatTypes[] {
    const resumePathChat: ResumePathChat[] = [];

    myChat.forEach((chat) => {
        const crc = chat.standardName || '';

        const item: ResumePathChat = {
            topic: chat.topic || '',
            CRC: crc,
            chatType: chat.chatType,
            path_ChatJSON: path.resolve(pathChatJSON, `${crc}.json`),
            path_ChatHTML: path.resolve(pathChatJSON, `${crc}.html`),
            pathRel_ChatHTML: path.join('chats', `${crc}`, `${crc}.html`),
            path_ChatImages: path.resolve(pathChatWeb, crc, 'images'),
            path_ChatAdjuntos: path.resolve(pathChatWeb, crc, 'adjuntos'),
        };
        resumePathChat.push(item);
    });

    const resumeTypeChats: ResumePathChatTypes[] = [];

    resumePathChat.forEach((resume) => {
        const existingGroupChat = resumeTypeChats.find((groupedChat) => groupedChat.chatType === resume.chatType);

        if (existingGroupChat) {
            existingGroupChat.chatPath.push(resume);
        } else {
            resumeTypeChats.push({ chatType: resume.chatType, chatPath: [resume] });
        }
    });

    return resumeTypeChats;
}

main()
    .then(() => rl.close())
    .catch((err) => {
        rl.close();
        console.error(err);
    });
