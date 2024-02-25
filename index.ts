import * as readline from 'readline';
import path from 'path';
import fs from 'fs';

require('dotenv').config(); // Carga las variables de entorno desde .env
const ACCESS_TOKEN = process.env.ACCESS_TOKEN || '';
const PATH_SALIDA = path.resolve(__dirname, process.env.PATH_GENERAL || './salida');

import APIRequestManager from './src/clases/APIRequestManager';
import extractMyUser from './src/extractMyUser';
import extractChat from './src/extractChat';

import HTMLGenerator from './src/clases/HTMLGenerator';
import JSONFileManager from './src/clases/JSONFileManager';
import ResumeChats from './src/interfaces/resumeChats.interfaces';
import ResumeTypeChats from './src/interfaces/resumeTypeChats.interfaces';
import ResumePath from './src/interfaces/resumePath.interfaces';
import ChatData from './src/clases/chat/chat.interface';
import MensajeData from './src/clases/mensaje/mensaje.interface';
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

    // Extraer mi usuario
    const myUser = await extractMyUser(apiRequestManager, PATH_SALIDA);
    const pathMyUserPhoto = path.resolve(PATH_SALIDA, 'myUser.png');

    apiRequestManager.fetchResponseImage('https://graph.microsoft.com/v1.0/me/photo/$value', pathMyUserPhoto);

    // Extraer mis chats
    const myChat = await extractChat(apiRequestManager, myUser, PATH_SALIDA);
    const jsonFileManager = new JSONFileManager(path.resolve(PATH_SALIDA, `myChat.json`));
    jsonFileManager.writeJSON(myChat);
    //const jsonFileManager = new JSONFileManager(path.resolve(PATH_SALIDA, `myChat.json`));
    //const myChat: ResumeChats = jsonFileManager.readJSON();

    // Generamos los path para poder enlazar correctamente las páginas de los chats
    const pathChatJSON = path.resolve(PATH_SALIDA, 'chats');
    const pathWebChat = path.resolve(PATH_SALIDA, 'web', 'chats');
    const resumeTypeChats: ResumeTypeChats[] = getPath(myChat, pathChatJSON, pathWebChat);

    // Generar HTML principal y guardarlo
    const indexTitle = `${myUser.getUserName()} - Microsoft Teams Backup`;
    const indexHeader = generateHeaderIndexHTML(indexTitle, [pathMyUserPhoto, 'Mi Foto']);
    const indexBody = generateBodyIndexHTML(resumeTypeChats);
    const indexPath = path.resolve(PATH_SALIDA, 'web', `index.html`);
    const indexHTML = HTMLGenerator.generateHTML(indexTitle, indexHeader, indexBody, './styles.css', indexPath);
    indexHTML.saveHTMLToFile();

    // Generar HTML de cada conversación, hay que recorrer todos los 'chatPath' del objeto 'resumeTypeChats'
    for (const chatTypeData of resumeTypeChats) {
        for (const chatPath of chatTypeData.chatPath) {
            const jsonFileManager = new JSONFileManager(chatPath.pathChatJSON);
            const chat: ChatData = jsonFileManager.readJSON();

            const { messages, ...rest } = chat;
            const reversedMessages = messages !== null ? messages.reverse() : null;

            // Quizás es el peor lugar, pero toca descargarse las imágenes y redireccionarlas en los mensajes
            let imageIdx = 1;

            fs.access(chatPath.pathChatImages, fs.constants.F_OK, (err) => {
                if (err) {
                    fs.mkdirSync(chatPath.pathChatImages, { recursive: true });
                }
            });

            if (reversedMessages) {
                for (const message of reversedMessages) {
                    const images = Array.isArray(message.image) && message.image.length > 0 ? message.image : undefined;

                    if (images) {
                        try {
                            for (const image of images) {
                                const imageName = `image-${String(imageIdx++).padStart(5, '0')}`;
                                const path_image = path.resolve(chatPath.pathChatImages, `${imageName}.png`);

                                message.content = message.content.replace(image, path_image);

                                await apiRequestManager.fetchResponseImage(image, path_image);
                            }
                        } catch (error) {
                            console.error('Error al procesar mensaje:', error);
                        }
                    }
                }
            }

            // Ahora ya sí que podemos generar el HTML
            const indexHTML = HTMLGenerator.generateHTML(
                `Chat: ${chatPath.topic}`,
                generateHeaderChatHTML(rest, indexPath),
                generateBodyChatHTML(reversedMessages, myUser.id),
                '../../chat-teams.css',
                chatPath.pathChatHTML,
            );

            indexHTML.saveHTMLToFile();
        }
    }
}

function getPath(myChat: ResumeChats, pathChatJSON: string, pathWebChat: string): ResumeTypeChats[] {
    const result: ResumeTypeChats[] = [];

    for (const key in myChat) {
        const chatData: [string, string | null][] = myChat[key];
        const chatPath: ResumePath[] = [];

        for (const [CRC32, name] of chatData) {
            const pathWebChat_ = path.resolve(pathWebChat, CRC32);
            const pathWebChat_images = path.resolve(pathWebChat_, 'images');

            const _pathChatJSON = path.resolve(pathChatJSON, `${CRC32}.json`);
            const _pathWebChat_HTML = path.resolve(pathWebChat_, `${CRC32}.html`);

            const item: ResumePath = {
                pathChatCRC: CRC32,
                topic: name ?? '',
                pathChatJSON: _pathChatJSON,
                pathChatHTML: _pathWebChat_HTML,
                pathChatImages: pathWebChat_images,
            };

            chatPath.push(item);
        }

        result.push({ type: key, chatPath });
    }

    return result;
}

function generateBodyIndexHTML(data: ResumeTypeChats[]): string {
    const sectionsHTML = data
        .map(({ type, chatPath }) => {
            const itemsHTML = chatPath
                .map(({ pathChatHTML, topic }) => {
                    return `<li><a href="${pathChatHTML}">${topic}</a></li>`;
                })
                .join('');

            return `<section>
                        <h2>${type}</h2>
                        <ul>
                            ${itemsHTML}
                        </ul>
                    </section>`;
        })
        .join('');

    return sectionsHTML;
}

function generateHeaderIndexHTML(titleH1: string, img: string[] | undefined = undefined) {
    let imageTag = '';

    if (img && img.length === 2) {
        const [src, alt] = img;
        // Pequeña comprobación para evitar cadenas vacías
        if (src.trim() !== '' && alt.trim() !== '') {
            imageTag = `<img src="${src}" alt="${alt}">`;
        }
    }

    const header: string = `
            ${imageTag}
            <h1>${titleH1}</h1>`;

    return header;
}

function generateHeaderChatHTML(jsonData: any, indexPath: string) {
    let html = '';

    // Botón para volver a la página principal
    const backButtonHTML = `<a href="${indexPath}">Volver a la página principal</a>`;
    html += backButtonHTML;

    // Obtener el valor de 'topic' y convertirlo en etiqueta <h1>
    if (jsonData.hasOwnProperty('topic')) {
        html += `<h1>[Chat] ${jsonData['topic']}</h1>`;
    }

    // Formatear 'createdDateTime' y 'lastUpdatedDateTime'
    if (jsonData.hasOwnProperty('createdDateTime')) {
        const createdDate = new Date(jsonData['createdDateTime']);
        const createdDateTimeFormatted = formatDate(createdDate);
        html += `<h3 class="header-info"><span>createdDateTime:</span> ${createdDateTimeFormatted}</h3>`;
    }

    return html;
}

function generateBodyChatHTML(jsonData: MensajeData[] | null, myId: string): string {
    if (!jsonData) return '';

    const html = jsonData
        .map((mensaje) => {
            const isMyMessage = mensaje.id_user === myId;
            const positionClass = isMyMessage ? 'message-right' : 'message-left';

            return `
                <div class="${positionClass}">
                    <div class="message-info">
                        <span class="message-sender">${mensaje.displayName}</span>
                        <br> 
                        <span class="message-time">${formatDate(new Date(mensaje.createdDateTime))}</span>
                    </div>
                    <div class="message-content">${mensaje.content}</div>
                </div>
            `;
        })
        .join('');

    return html;
}

function formatDate(date: Date) {
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    };
    return date.toLocaleString('es-ES', options).replace(',', ' -');
}

main()
    .then(() => rl.close())
    .catch((err) => {
        rl.close();
        console.error(err);
    });
