import APIRequestManager from '../APIRequestManager';
import MensajeData from './mensaje.interface';

const UPLOADED_IMAGE_MATCH = /https:\/\/graph.microsoft.com\/v1.0\/chats([^"]*)/g;

export default class Mensaje {
    id_msg: string;
    createdDateTime: string;
    id_user: string;
    displayName: string;
    contentType: string;
    content: string;
    image: string[] | undefined;
    attachments: any[]; // No se especifica el tipo de datos para 'attachments', 'mentions' y 'reactions'
    mentions: any[];
    reactions: any[];

    constructor(data: MensajeData) {
        this.id_msg = data.id_msg;
        this.createdDateTime = data.createdDateTime;
        this.id_user = data.id_user;
        this.displayName = data.displayName;
        this.contentType = data.contentType;
        this.content = data.content;
        this.image = data.image;
        this.attachments = data.attachments || [];
        this.mentions = data.mentions || [];
        this.reactions = data.reactions || [];
    }

    static async fromAPIRequestManager(apiRequestManager: APIRequestManager, url: string): Promise<Mensaje[]> {
        let mensajes: Mensaje[] = [];
        let nextPageUrl = url;

        while (nextPageUrl) {
            const jsonData: any = await apiRequestManager.fetchResponse(nextPageUrl);
            if (!Mensaje.isMessageData(jsonData)) {
                throw new Error('El objeto JSON no cumple con la estructura de mensaje esperada.');
            }
            mensajes.push(
                ...jsonData.value.map((msgData: any) => {
                    const imageUrls = msgData.body.content.match(UPLOADED_IMAGE_MATCH);
                    const imageUrlsArray = imageUrls ? imageUrls.filter((url: any) => typeof url === 'string') : [];
                    return new Mensaje({
                        id_msg: msgData.id,
                        createdDateTime: msgData.createdDateTime,
                        id_user: msgData.from.user.id,
                        displayName: msgData.from.user.displayName,
                        contentType: msgData.body.contentType,
                        content: msgData.body.content,
                        image: imageUrlsArray,
                        attachments: msgData.attachments,
                        mentions: msgData.mentions,
                        reactions: msgData.reactions,
                    });
                }),
            );
            nextPageUrl = jsonData['@odata.nextLink'];
        }

        return mensajes;
    }

    private static isMessageData(obj: any): Boolean {
        return (
            obj &&
            Array.isArray(obj.value) &&
            obj.value.every((msg: any) => typeof msg === 'object' && 'id' in msg && 'createdDateTime' in msg)
        );
    }
}
