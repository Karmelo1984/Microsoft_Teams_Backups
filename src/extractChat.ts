import * as path from 'path';
import crc32 from 'crc-32';
import { AxiosError } from 'axios';

import APIRequestManager from './clases/APIRequestManager';
import JSONFileManager from './clases/JSONFileManager';
import Usuario from './clases/usuario/usuario';
import Chat from './clases/chat/chat';
import Mensaje from './clases/mensaje/mensaje';
import ResumeChats from './interfaces/resumeChats.interfaces';

export default async function extractChat(
    apiRequestManager: APIRequestManager,
    me: Usuario,
    path_json: string,
): Promise<ResumeChats> {
    //console.log(`[extractChat] [START] - `);

    //console.log(`[extractChat] [ INFO] - Crear array con todos los chats asociados a nuestro usuario`);
    const meChats: Chat[] = await Chat.fromAPIRequestManager(
        apiRequestManager,
        'https://graph.microsoft.com/v1.0/me/chats/',
    );

    //console.log(`[extractChat] [ INFO] - Reordenar los chats usando el campo 'chatType'`);
    const groupedChats = Chat.groupChatsByType(meChats);

    //console.log(`[extractChat] [ INFO] - Completar el campo 'topic' de los grupos 'oneOnOne'`);
    let i = 1;
    for (const chat of groupedChats.oneOnOne) {
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
    }

    //console.log(`[extractChat] [ INFO] - Completar el campo 'topic' de los grupos 'group'`);
    for (const chat of groupedChats.group) {
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

    //console.log(`[extractChat] [ INFO] - Iterar sobre cada Chat para, asignarle los mensajes y para no tener que hacer otro bucle, aprovechamos y lo vamos guardando como JSON`,);
    const chatData: ResumeChats = {};
    for (const key in groupedChats) {
        if (Object.hasOwnProperty.call(groupedChats, key)) {
            const chatsArray = groupedChats[key];

            const chatTopics: Array<[string, string | null]> = [];
            //const chatTopics: string[] = [];

            for (const chat of chatsArray) {
                const name = calculateCRC(chat.topic ?? generarStringAleatorio(50)).padStart(8, 'Z');
                const chatUrl = `https://graph.microsoft.com/v1.0/me/chats/${chat.id}/messages`;
                try {
                    // Asignarle a cada Chat, su historial de mensajes correspondientes
                    const mensajes: Mensaje[] = await Mensaje.fromAPIRequestManager(apiRequestManager, chatUrl);
                    chat.messages = mensajes;

                    // Guardar cada chat como un fichero JSON
                    const pathAbsolutoJson = path.resolve(path_json, 'chats', `${name}.json`);
                    const jsonFileManager = new JSONFileManager(pathAbsolutoJson);

                    jsonFileManager.writeJSON(chat);

                    // Agregar el tópico y la ruta al arreglo chatTopics
                    chatTopics.push([name, chat.topic]);
                } catch (error) {
                    // Manejar el error aquí, por ejemplo, registrándolo en la consola
                    console.error(`NO se puede procesar los datos del chat <${chat.topic}> <${name}> <${chatUrl}>`);
                    // Continuar con la siguiente iteración del bucle
                    continue;
                }
            }

            // Asignar el arreglo chatTopics a la clave correspondiente en chatData
            chatData[key] = chatTopics;
        }
    }

    //console.log(`[extractChat] [  END] - `);
    return chatData;
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
