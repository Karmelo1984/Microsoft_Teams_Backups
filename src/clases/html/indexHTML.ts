import { ResumePathChatTypes } from '../../interfaces/resumePath.interfaces';
import HTMLGenerator from './HTMLGenerator';

export default class IndexHTML {
    readonly indexTitle: string;
    readonly indexHeader: string;
    readonly indexBody: string;
    readonly indexPath: string;

    readonly indexHTML: HTMLGenerator;

    private constructor(
        myUserName: string,
        path_MyUserPhoto: string,
        resumeTypeChats: ResumePathChatTypes[],
        path_indexSave: string,
        path_stylesCSS: string,
    ) {
        this.indexTitle = `${myUserName} - Microsoft Teams Backup`;
        this.indexHeader = this.generateHeaderIndexHTML(this.indexTitle, [path_MyUserPhoto, 'Mi Foto']);
        this.indexBody = this.generateBodyIndexHTML(resumeTypeChats);
        this.indexPath = path_indexSave;

        this.indexHTML = HTMLGenerator.generateHTML(
            this.indexTitle,
            this.indexHeader,
            this.indexBody,
            path_stylesCSS,
            this.indexPath,
        );
    }

    static generateIndexHTML(
        myUserName: string,
        path_MyUserPhoto: string,
        resumeTypeChats: ResumePathChatTypes[],
        path_indexSave: string,
        path_stylesCSS: string = './styles.css',
    ): void {
        const instance = new IndexHTML(myUserName, path_MyUserPhoto, resumeTypeChats, path_indexSave, path_stylesCSS);

        instance.indexHTML.saveHTMLToFile();
    }

    private generateHeaderIndexHTML(titleH1: string, img: string[] | undefined = undefined): string {
        let imageTag = '';

        if (img && img.length === 2) {
            const [src, alt] = img;
            // Pequeña comprobación para evitar cadenas vacías
            if (src.trim() !== '' && alt.trim() !== '') {
                imageTag = `<img src="${src}" alt="${alt}">`;
            }
        }

        const header: string = `
            ${imageTag}
            <h1>${titleH1}</h1>`;

        return header;
    }

    private generateBodyIndexHTML(data: ResumePathChatTypes[]): string {
        const sectionsHTML = data
            .map(({ chatType, chatPath }) => {
                const itemsHTML = chatPath
                    .map(({ pathRel_ChatHTML, topic }) => {
                        return `<li><a href="${pathRel_ChatHTML}">${topic}</a></li>`;
                    })
                    .join('');

                return `<section>
                        <h2>${chatType}</h2>
                        <ul>
                            ${itemsHTML}
                        </ul>
                    </section>`;
            })
            .join('');

        return sectionsHTML;
    }
}
