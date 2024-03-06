export default interface ResumePathChat {
    topic: string;
    CRC: string;
    chatType: string;
    path_ChatJSON: string; // Ruta donde se han descargado los chats.json originales.
    pathRel_ChatHTML: string; // Ruta relativa donde se guardan los chat en formato HTML, para poder llamarlos desde el index.html
    path_ChatHTML: string; // Ruta donde se guardan los chat en formato HTML
    path_ChatImages: string; // Ruta donde se guardan las imágenes
    path_ChatAdjuntos: string; // Ruta donde se guardan los ficheros adjuntos
}

export interface ResumePathChatTypes {
    chatType: string;
    chatPath: ResumePathChat[];
}
