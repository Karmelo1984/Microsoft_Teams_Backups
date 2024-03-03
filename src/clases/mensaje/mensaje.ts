import * as path from 'path';
import fs from 'fs';

import APIRequestManager from '../APIRequestManager';
import MensajeData, { Attachments } from './mensaje.interface';
import { findRootDirectory } from '../../utils';

const UPLOADED_IMAGE_MATCH = /https:\/\/graph.microsoft.com\/v1.0\/chats([^"]*)/g;

export default class Mensaje {
    static readonly PATH_IMAGE_NOTFOUND: string = path.resolve(
        findRootDirectory() ?? '',
        'src',
        'styles',
        'image-404_notFound.png',
    );

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

    static async getAllMessagesByIdChat(apiRequestManager: APIRequestManager, idChat: string): Promise<Mensaje[]> {
        const chatUrl = `https://graph.microsoft.com/v1.0/me/chats/${idChat}/messages`;

        let mensajes: Mensaje[] = [];
        let nextPageUrl = chatUrl;

        while (nextPageUrl) {
            const jsonData: any = await apiRequestManager.fetchResponse(nextPageUrl);

            if (!Mensaje.isMessageData(jsonData)) {
                console.error(
                    `[Mensaje.fromAPIRequestManager] [ WARN] - El objeto JSON NO tiene una estructura de MENSAJE.`,
                );
                continue;
            }

            // Se agregan todos los mensajes que no sean del sistema
            mensajes.push(
                ...jsonData.value
                    .filter((msgData: any) => msgData.body.content !== '<systemEventMessage/>')
                    .map((msgData: any) => {
                        const imageUrls = msgData.body.content.match(UPLOADED_IMAGE_MATCH);
                        const imageUrlsArray = imageUrls ? imageUrls.filter((url: any) => typeof url === 'string') : [];
                        const userId = msgData.from && msgData.from.user ? msgData.from.user.id : null;
                        const displayName = msgData.from && msgData.from.user ? msgData.from.user.displayName : null;

                        return new Mensaje({
                            id_msg: msgData.id,
                            createdDateTime: msgData.createdDateTime,
                            id_user: userId,
                            displayName: displayName,
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

        return mensajes.reverse();
    }

    static async processImages(
        apiRequestManager: APIRequestManager,
        mensaje: MensajeData,
        path_ChatImages: string,
        imageName: string,
    ) {
        const images = Array.isArray(mensaje.image) && mensaje.image.length > 0 ? mensaje.image : undefined;
        if (images) {
            try {
                for (const image of images) {
                    // ademas de descargarlo, cambia en el mensaje el enlace para que apunte a la ruta local
                    const path_image = path.resolve(path_ChatImages, `${imageName}`);

                    mensaje.content = mensaje.content.replace(image, path_image);

                    await apiRequestManager.fetchResponseImage(image, path_image);
                }
            } catch (error) {
                await Mensaje.copyFile(Mensaje.PATH_IMAGE_NOTFOUND, path_ChatImages, `${imageName}`);
            }
        }
    }

    static async processAttachments(mensaje: MensajeData, path_ChatAttachments: string, attachmentName: string) {
        const attachments =
            Array.isArray(mensaje.attachments) && mensaje.attachments.length > 0 ? mensaje.attachments : undefined;
        if (attachments) {
            try {
                for (const attachment of attachments) {
                    if (attachment.contentType !== 'messageReference') {
                        const parts = attachment.name.split('.');
                        const fileName = parts.slice(0, -1).join('.'); // Nombre del archivo (todo menos la última parte)
                        const fileExtension = parts[parts.length - 1]; // Extensión del archivo (la última parte)

                        const path_attachment = path.resolve(
                            path_ChatAttachments,
                            `${attachmentName}.${fileExtension}`,
                        );

                        mensaje.content = mensaje.content.replace(attachment.contentUrl, path_attachment);

                        // Queda pendiente que se puedan descargar los ficheros
                    }
                }
            } catch (error) {
                console.error(`Error al procesar mensaje <${error}>`);
            }
        }
    }

    // Función para convertir el array de MensajeData a un array de Mensaje
    static parseMensajes(arrayMensajeData: MensajeData[]): Mensaje[] {
        const mensajes: Mensaje[] = [];
        for (const mensajeData of arrayMensajeData) {
            const mensaje = new Mensaje(mensajeData);
            mensajes.push(mensaje);
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

    private static async copyFile(srcPath: string, destPath: string, newName: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const readStream = fs.createReadStream(srcPath);
            const writeStream = fs.createWriteStream(path.join(destPath, newName));

            readStream.on('error', reject);
            writeStream.on('error', reject);

            readStream.on('close', () => {
                resolve();
            });

            readStream.pipe(writeStream);
        });
    }
}
