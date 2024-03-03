export default interface MensajeData {
    id_msg: string;
    createdDateTime: string;
    id_user: string;
    displayName: string;
    contentType: string;
    content: string;
    image: string[] | undefined;
    attachments: Attachments[]; // No se especifica el tipo de datos para 'attachments', 'mentions' y 'reactions'
    mentions: any[];
    reactions: any[];
}

export interface Attachments {
    id: string;
    contentType: string;
    contentUrl: string;
    name: string;
    content?: string;
    thumbnailUrl?: string;
    teamsAppId?: string;
}
