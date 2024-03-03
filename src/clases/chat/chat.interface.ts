import MensajeData from '../mensaje/mensaje.interface';
import Chat from './chat';

export default interface ChatData {
    id: string;
    topic: string | null;
    createdDateTime: Date;
    lastUpdatedDateTime: Date;
    chatType: string;
    standardName?: string;
    messages?: MensajeData[] | null;
}

export interface ChatObjectResponse {
    '@odata.context': string;
    '@odata.count': number;
    '@odata.nextLink': string;
    value: {
        id: string;
        topic: string | null;
        createdDateTime: Date;
        lastUpdatedDateTime: Date;
        chatType: string;
        webUrl: string;
        tenantId: string;
        onlineMeetingInfo: any | null;
        viewpoint: any;
    }[];
}

export interface ResumeTypeChats {
    type: string;
    chats: Chat[];
}
