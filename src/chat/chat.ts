import APIRequestManager from '../APIRequestManager';
import ChatData from './chat.interface';

export default class Chat {
    id: string;
    topic: string | null;
    createdDateTime: Date;
    lastUpdatedDateTime: Date;
    chatType: string;

    constructor(data: ChatData) {
        this.id = data.id;
        this.topic = data.topic;
        this.createdDateTime = new Date(data.createdDateTime);
        this.lastUpdatedDateTime = new Date(data.lastUpdatedDateTime);
        this.chatType = data.chatType;
    }

    static async fromAPIRequestManager(apiRequestManager: APIRequestManager, url: string): Promise<Chat[]> {
        try {
            const jsonData: any = await apiRequestManager.fetchResponse(url);

            this.verificarChatData(jsonData);

            const chats: Chat[] = jsonData.value.map((chatData: ChatData) => new Chat(chatData));
            return chats;
        } catch (error) {
            throw new Error('Error al obtener datos del chat: ' + error);
        }
    }

    static groupChatsByType(chats: Chat[]): { [chatType: string]: Chat[] } {
        const groupedChats: { [chatType: string]: Chat[] } = {};

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

    private static verificarChatData(obj: any): void {
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
}
