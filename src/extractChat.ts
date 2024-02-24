import * as path from 'path';
import crc32 from 'crc-32';

import APIRequestManager from './clases/APIRequestManager';
import JSONFileManager from './clases/JSONFileManager';
import Usuario from './clases/usuario/usuario';
import Chat from './clases/chat/chat';
import Mensaje from './clases/mensaje/mensaje';

export default async function processChats(accessToken: string, path_json: string): Promise<void> {
    if (accessToken === '') {
        console.error('El token de acceso está vacío. Deteniendo la ejecución.');
        process.exit(1); // Detener la ejecución del programa con un código de salida no cero para indicar un error
    }

    // Inicializar la conexión
    const apiRequestManager = new APIRequestManager(accessToken);

    // Creamos nuestro usuario
    let me: Usuario = await Usuario.getMyUser(apiRequestManager);

    // Creamos un array con todos los chats asociados a nuestro usuario
    const meChats: Chat[] = await Chat.fromAPIRequestManager(
        apiRequestManager,
        'https://graph.microsoft.com/v1.0/me/chats/',
    );

    // Reordenamos los chats usando el campo 'chatType'
    const groupedChats = Chat.groupChatsByType(meChats);

    // Completamos el campo 'topic' de los grupos 'oneOnOne'
    for (const chat of groupedChats.oneOnOne) {
        const userIds = chat.getIdUserOneOnOne();
        if (userIds !== undefined) {
            if (userIds[0] !== me.id) {
                chat.topic = (await Usuario.getUserById(apiRequestManager, userIds[0])).getUserName();
            } else {
                chat.topic = (await Usuario.getUserById(apiRequestManager, userIds[1])).getUserName();
            }
        }
    }

    // Completamos el campo 'topic' de los grupos 'group'
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

    // Iteramos sobre cada Chat para, asignarle los mensajes y para no tener que hacer otro bucle, aprovechamos y lo vamos guardando como JSON
    for (const key in groupedChats) {
        if (Object.hasOwnProperty.call(groupedChats, key)) {
            const chatsArray = groupedChats[key];

            for (const chat of chatsArray) {
                const name = calculateCRC(chat.topic ?? generarStringAleatorio(50));

                // Asignarle a cada Chat, su historial de mensajes correspondientes
                const mensajes: Mensaje[] = await Mensaje.fromAPIRequestManager(
                    apiRequestManager,
                    `https://graph.microsoft.com/v1.0/me/chats/${chat.id}/messages`,
                );
                chat.messages = mensajes;

                // Guardar cada chat como un fichero JSON
                const pathAbsolutoJson = path.resolve(path_json, 'chats', `${name}.json`);
                const jsonFileManager = new JSONFileManager(pathAbsolutoJson);

                jsonFileManager.writeJSON(chat);
            }
        }
    }
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
