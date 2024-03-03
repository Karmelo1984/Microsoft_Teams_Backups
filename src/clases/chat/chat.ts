import APIRequestManager from '../APIRequestManager';
import Mensaje from '../mensaje/mensaje';
import MensajeData from '../mensaje/mensaje.interface';
import ChatData, { ChatObjectResponse, ResumeTypeChats } from './chat.interface';

export default class Chat {
    id: string;
    topic: string | null;
    createdDateTime: Date;
    lastUpdatedDateTime: Date;
    chatType: string;
    standardName?: string;
    messages: MensajeData[] | null;

    constructor(data: ChatData) {
        this.id = data.id;
        this.topic = data.topic;
        this.createdDateTime = new Date(data.createdDateTime);
        this.lastUpdatedDateTime = new Date(data.lastUpdatedDateTime);
        this.chatType = data.chatType;
        this.messages = data.messages ?? [];
    }

    static async getAllMyChats(apiRequestManager: APIRequestManager): Promise<Chat[]> {
        let chats: Chat[] = [];
        let nextPageUrl = 'https://graph.microsoft.com/v1.0/me/chats/';

        while (nextPageUrl) {
            const jsonData = await Chat.fetchChatData(apiRequestManager, nextPageUrl);

            if (!jsonData) {
                break;
            }

            const chatDataArray: ChatData[] = jsonData.value.map((value: any) => ({
                id: value.id,
                topic: value.topic,
                createdDateTime: value.createdDateTime,
                lastUpdatedDateTime: value.lastUpdatedDateTime,
                chatType: value.chatType,
                messages: value.messages,
            })) as ChatData[];

            chats.push(...chatDataArray.map((chatData: ChatData) => new Chat(chatData)));

            nextPageUrl = jsonData['@odata.nextLink'];
        }

        return chats;
    }

    static groupChatsByType(chats: Chat[]): ResumeTypeChats[] {
        const groupedChats: ResumeTypeChats[] = [];

        chats.forEach((chat) => {
            const existingGroupChat = groupedChats.find((groupedChat) => groupedChat.type === chat.chatType);

            if (existingGroupChat) {
                existingGroupChat.chats.push(chat);
            } else {
                groupedChats.push({ type: chat.chatType, chats: [chat] });
            }
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

    async downloadMessages(apiRequestManager: APIRequestManager): Promise<void> {
        this.messages = await Mensaje.getAllMessagesByIdChat(apiRequestManager, this.id);
    }

    static sortByTopic(chats: Chat[]): Chat[] {
        // Utiliza el método sort() para ordenar los chats por el campo topic
        return chats.sort((a, b) => {
            // Si el campo topic es null, colócalo al final
            if (a.topic === null && b.topic === null) {
                return 0;
            } else if (a.topic === null) {
                return 1;
            } else if (b.topic === null) {
                return -1;
            }
            // Compara los topics alfabéticamente
            return a.topic.localeCompare(b.topic);
        });
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

    private static async fetchChatData(
        apiRequestManager: APIRequestManager,
        url: string,
    ): Promise<ChatObjectResponse | undefined> {
        const response = await apiRequestManager.fetchResponse(url);

        if (response) {
            if (Chat.isChatData(response)) {
                return response;
            }
        }
        return undefined;
    }

    private static isChatData(obj: any): obj is ChatObjectResponse {
        //console.log('Checking base object...');
        if (
            typeof obj === 'object' &&
            '@odata.context' in obj &&
            typeof obj['@odata.context'] === 'string' &&
            '@odata.count' in obj &&
            typeof obj['@odata.count'] === 'number' &&
            '@odata.nextLink' in obj &&
            //typeof obj['@odata.nextLink'] === 'string' &&
            //'value' in obj &&
            Array.isArray(obj['value'])
        ) {
            //console.log('Base object checks passed. Checking individual chats...');
            for (const chat of obj['value']) {
                //console.log('Checking chat object...');
                if (
                    typeof chat === 'object' &&
                    'id' in chat &&
                    typeof chat['id'] === 'string' &&
                    ('topic' in chat || chat['topic'] === null) &&
                    'createdDateTime' in chat &&
                    typeof chat['createdDateTime'] === 'string' &&
                    'lastUpdatedDateTime' in chat &&
                    typeof chat['lastUpdatedDateTime'] === 'string' &&
                    'chatType' in chat &&
                    typeof chat['chatType'] === 'string' &&
                    'webUrl' in chat &&
                    typeof chat['webUrl'] === 'string' &&
                    'tenantId' in chat &&
                    typeof chat['tenantId'] === 'string' &&
                    ('onlineMeetingInfo' in chat || chat['onlineMeetingInfo'] === null) &&
                    'viewpoint' in chat &&
                    typeof chat['viewpoint'] === 'object'
                ) {
                    //console.log('Chat object checks passed.');
                } else {
                    //console.log('Chat object checks failed.');
                    return false;
                }
            }
            //console.log('All chats checked.');
            return true;
        }
        //console.log('Base object checks failed.');
        return false;
    }
}
