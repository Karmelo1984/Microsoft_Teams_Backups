export default interface MensajeData {
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
}
