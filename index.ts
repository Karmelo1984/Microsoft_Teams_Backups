import * as readline from 'readline';

require('dotenv').config(); // Carga las variables de entorno desde .env
const ACCESS_TOKEN = process.env.ACCESS_TOKEN || '';

import Usuario from './src/usuario/usuario';
import APIRequestManager from './src/APIRequestManager';
import Chat from './src/chat/chat';
import Mensaje from './src/mensaje/mensaje';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

async function main(): Promise<void> {
    // Inicializar la conexión
    const apiRequestManager = new APIRequestManager(ACCESS_TOKEN);

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

    console.log(groupedChats);

    /*
    let i = 0;
    while (i < meChats.length) {
        const chat = meChats[i];
        console.log(++i);

        const mensajes: Mensaje[] = await Mensaje.fromAPIRequestManager(
            apiRequestManager,
            `https://graph.microsoft.com/v1.0/me/chats/${chat.id}/messages`,
        );
        console.log(mensajes);
    }
    */
}

main()
    .then(() => rl.close())
    .catch((err) => {
        rl.close();
        console.error(err);
    });
