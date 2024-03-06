import Chat from '../chat/chat';
import MensajeData from '../mensaje/mensaje.interface';
import HTMLGenerator from './HTMLGenerator';

export default class ChatHTML {
    readonly chatTitle: string;
    readonly chatHeader: string;
    readonly chatBody: string;
    readonly chatPath: string;

    readonly chatHTML: HTMLGenerator;

    private constructor(chat: Chat, myUserId: string, path_chatSave: string, path_stylesCSS: string) {
        this.chatTitle = `Chat: ${chat.topic}`;
        this.chatHeader = this.generateHeaderChatHTML(chat);
        this.chatBody = this.generateBodyChatHTML(chat.messages, myUserId);
        this.chatPath = path_chatSave;

        this.chatHTML = HTMLGenerator.generateHTML(
            this.chatTitle,
            this.chatHeader,
            this.chatBody,
            path_stylesCSS,
            this.chatPath,
        );
    }

    static generateChatHTML(
        chat: Chat,
        myUserId: string,
        path_chatSave: string,
        path_stylesCSS: string = '../../chat-teams.css',
    ): void {
        const instance = new ChatHTML(chat, myUserId, path_chatSave, path_stylesCSS);

        instance.chatHTML.saveHTMLToFile();
    }

    private generateHeaderChatHTML(chat: Chat, indexPath: string = '../../index.html') {
        let html = '';

        // Botón para volver a la página principal
        const backButtonHTML = `<a href="${indexPath}">Volver a la página principal</a>`;
        html += backButtonHTML;

        // Obtener el valor de 'topic' y convertirlo en etiqueta <h1>
        if (chat.hasOwnProperty('topic')) {
            html += `<h1>[Chat] ${chat['topic']}</h1>`;
        }

        // Formatear 'createdDateTime' y 'lastUpdatedDateTime'
        if (chat.hasOwnProperty('createdDateTime')) {
            const createdDate = new Date(chat['createdDateTime']);
            const createdDateTimeFormatted = this.formatDate(createdDate);
            html += `<h3 class="header-info"><span>createdDateTime:</span> ${createdDateTimeFormatted}</h3>`;
        }

        return html;
    }

    private generateBodyChatHTML(jsonData: MensajeData[] | null, myId: string): string {
        if (!jsonData) return '';

        const html = jsonData
            .map((mensaje) => {
                const isMyMessage = mensaje.id_user === myId;
                const positionClass = isMyMessage ? 'message-right' : 'message-left';

                return `
                    <div class="${positionClass}">
                        <div class="message-info">
                            <span class="message-sender">${mensaje.displayName}</span>
                            <br> 
                            <span class="message-time">${this.formatDate(new Date(mensaje.createdDateTime))}</span>
                        </div>
                        <div class="message-content">${mensaje.content}</div>
                    </div>
                `;
            })
            .join('');

        return html;
    }

    private formatDate(date: Date) {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        };
        return date.toLocaleString('es-ES', options).replace(',', ' -');
    }
}
