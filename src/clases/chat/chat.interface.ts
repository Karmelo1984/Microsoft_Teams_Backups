import MensajeData from '../mensaje/mensaje.interface';

export default interface ChatData {
    id: string;
    topic: string | null;
    createdDateTime: string;
    lastUpdatedDateTime: string;
    chatType: string;
    messages: MensajeData[] | null;
}
