import APIRequestManager from '../APIRequestManager';
import MensajeData from '../mensaje/mensaje.interface';
import ChatData from './chat.interface';

export default class Chat {
    id: string;
    topic: string | null;
    createdDateTime: Date;
    lastUpdatedDateTime: Date;
    chatType: string;
    messages: MensajeData[] | null;

    constructor(data: ChatData) {
        this.id = data.id;
        this.topic = data.topic;
        this.createdDateTime = new Date(data.createdDateTime);
        this.lastUpdatedDateTime = new Date(data.lastUpdatedDateTime);
        this.chatType = data.chatType;
        this.messages = data.messages;
    }

    static async fromAPIRequestManager(apiRequestManager: APIRequestManager, url: string): Promise<Chat[]> {
        console.log(`[Chat.fromAPIRequestManager] [START] - ${url}`);

        let chats: Chat[] = [];
        let nextPageUrl = url;

        while (nextPageUrl) {
            const jsonData: any = await apiRequestManager.fetchResponse(nextPageUrl);

            /*
            if (Chat.isChatData(jsonData)) {
                console.error(`El objeto JSON NO tiene una estructura de CHAT.
                ${jsonData}`);

                continue;
            }
            */

            chats.push(
                ...jsonData.value.map((chatData: ChatData) => {
                    return new Chat(chatData);
                }),
            );

            nextPageUrl = jsonData['@odata.nextLink'];
        }

        console.log(`[Chat.fromAPIRequestManager] [  END] - ${url} --> '${chats.length}' chats`);
        return chats;
    }

    static groupChatsByType(chats: Chat[]): { [chatType: string]: Chat[] } {
        const groupedChats: { [chatType: string]: Chat[] } = {};

        // console.log(groupedChats);
        chats.forEach((chat) => {
            if (!(chat.chatType in groupedChats)) {
                groupedChats[chat.chatType] = [];
            }
            groupedChats[chat.chatType].push(chat);
        });

        return groupedChats;
    }

    async getChatMembers(apiRequestManager: APIRequestManager): Promise<string[] | undefined> {
        const url = `https://graph.microsoft.com/beta/chats/${this.id}/members`;

        try {
            // Obtener los datos JSON de la API
            const jsonData: any = await apiRequestManager.fetchResponse(url);

            // Comprobar si el objeto tiene la estructura esperada
            if (
                jsonData &&
                jsonData.value &&
                Array.isArray(jsonData.value) &&
                jsonData.value.every((member: any) => member.email)
            ) {
                // Extraer los correos electrónicos y devolverlos en un array
                return jsonData.value.map((member: any) => member.email);
            } else {
                // Devolver undefined si la estructura no es la esperada
                return undefined;
            }
        } catch (error) {
            // Manejar cualquier error que ocurra durante la solicitud
            console.error('Error al obtener los miembros del chat:', error);
            return undefined;
        }
    }

    getIdUserOneOnOne(): string[] | undefined {
        if (this.chatType === 'oneOnOne') {
            const idParts = this.id.split(':');
            if (idParts.length === 2) {
                const [userId1, aux] = idParts[1].split('_');
                const userId2 = aux.split('@')[0];
                return [userId1, userId2];
            }
        }
        return undefined;
    }

    private static isChatData_(obj: any): void {
        if (!Array.isArray(obj.value)) {
            throw new Error('El objeto no contiene un array de chats');
        }

        for (const chat of obj.value) {
            const requiredProperties = ['id', 'createdDateTime', 'lastUpdatedDateTime', 'chatType'];
            for (const prop of requiredProperties) {
                if (typeof chat[prop] !== 'string') {
                    throw new Error(`La propiedad ${prop} es inválida`);
                }
            }
            if (typeof chat.topic !== 'string' && chat.topic !== null) {
                throw new Error('La propiedad topic debe ser una cadena o null');
            }
        }
    }

    private static isChatData(obj: any): Boolean {
        if (!Array.isArray(obj.value)) {
            return false;
        }

        for (const chat of obj.value) {
            const requiredProperties = ['id', 'createdDateTime', 'lastUpdatedDateTime', 'chatType'];
            for (const prop of requiredProperties) {
                if (typeof chat[prop] !== 'string') {
                    return false;
                }
            }
            if (typeof chat.topic !== 'string' && chat.topic !== null) {
                return false;
            }
        }

        return true;
    }
}
