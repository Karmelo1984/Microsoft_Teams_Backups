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

    // Extraemos información de mi usuario
    let me: Usuario = await Usuario.getMyUser(apiRequestManager);

    // Extraemos un array con todos los chats asociados a mi usuario
    const meChats: Chat[] = await Chat.fromAPIRequestManager(
        apiRequestManager,
        'https://graph.microsoft.com/v1.0/me/chats/',
    );

    console.log(meChats[7]);

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
