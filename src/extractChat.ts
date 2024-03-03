import * as path from 'path';
import crc32 from 'crc-32';

import APIRequestManager from './clases/APIRequestManager';
import JSONFileManager from './clases/JSONFileManager';
import Usuario from './clases/usuario/usuario';
import Chat from './clases/chat/chat';
import BasicLog from './clases/basicLog';

export default async function extractChat(
    path_salida: string,
    apiRequestManager: APIRequestManager,
    me: Usuario,
    path_json: string,
): Promise<Chat[]> {
    BasicLog.consoleLog('extractChat', `Crear array con todos los chats asociados a nuestro usuario`);
    const myChats: Chat[] = await Chat.getAllMyChats(apiRequestManager);

    BasicLog.consoleLog('extractChat', `Completar el campo 'topic' de los grupos 'oneOnOne' y 'group'`);
    let i = 1;
    for (const chat of myChats) {
        if (chat.chatType === 'oneOnOne') {
            const userIds = chat.getIdUserOneOnOne();
            if (userIds !== undefined) {
                try {
                    if (userIds[0] !== me.id) {
                        chat.topic = (await Usuario.getUserById(apiRequestManager, userIds[0])).getUserName();
                    } else {
                        chat.topic = (await Usuario.getUserById(apiRequestManager, userIds[1])).getUserName();
                    }
                } catch {
                    chat.topic = `SIN_USER_${(i++).toString().padStart(3, '0')}`;
                }
            }
        } else if (chat.chatType === 'group') {
            const mails = await chat.getChatMembers(apiRequestManager);
            if (mails) {
                let aux_users: string[] = [];
                for (const mail of mails) {
                    if (mail !== me.mail) {
                        aux_users.push((await Usuario.getUserByEmail(apiRequestManager, mail)).getUserName());
                    }
                }
                aux_users.push(me.getUserName());

                chat.topic = aux_users.join('; ');
            }
        }

        chat.standardName = calculateCRC(chat.topic ?? generarStringAleatorio(50)).padStart(8, 'Z');
    }

    BasicLog.consoleLog('extractChat', `ordenar chats por topics`);
    Chat.sortByTopic(myChats);

    let totalMensajes = 0;
    let chatCount = 1;
    for (const chat of myChats) {
        const msgHead = `[${(chatCount++).toString().padStart(3, '0')} / ${myChats.length.toString().padStart(3, '0')}]`;

        BasicLog.consoleLog('extractChat', `${msgHead} Descargando mensajes del chat: ${chat.topic}`);
        await chat.downloadMessages(apiRequestManager);
        totalMensajes += chat.messages?.length ?? 0;
    }

    BasicLog.consoleLog(
        'extractChat',
        `Se han descargdo un total de ${totalMensajes} mensajes en ${myChats.length} chats`,
    );

    BasicLog.consoleLog('extractChat', `Guardar los chats de forma independiente`);
    for (const chat of myChats) {
        const pathAbsolutoJson = path.resolve(path_json, `${chat.standardName}.json`);
        const jsonFileManager = new JSONFileManager(pathAbsolutoJson);

        await jsonFileManager.writeJSON(chat);
    }

    BasicLog.consoleLog('extractChat', 'Guardar backup del array de chats en formato JSON');
    const jsonFileManager = new JSONFileManager(path.resolve(path_salida, `myChat.json`));
    await jsonFileManager.writeJSON(myChats);
    //const myChat: Chat[] = jsonFileManager.readJSON();

    return myChats;
}

function calculateCRC(text: string): string {
    const crc = crc32.str(text);
    return (crc >>> 0).toString(16).toUpperCase();
}

function generarStringAleatorio(longitud: number): string {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let resultado = '';
    for (let i = 0; i < longitud; i++) {
        resultado += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return resultado;
}

function generateTimestamp(): string {
    const now = new Date();
    const timestamp = `\x1b[32m[${now.toLocaleDateString('es-ES')} ${now.toLocaleTimeString('es-ES', { hour12: false })}.${now.getMilliseconds().toString().padStart(3, '0')}] \x1b[0m`;
    return timestamp;
}
