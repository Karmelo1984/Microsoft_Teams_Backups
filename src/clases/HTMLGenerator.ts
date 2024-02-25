import fs from 'fs';
import path from 'path';

export default class HTMLGenerator {
    private _style?: string;
    private _htmlPath?: string;

    private _head?: string;
    private _header?: string;
    private _body?: string;
    private _footer?: string;

    private _HTML?: string;

    private constructor() {
        this._footer = `
            <footer class="footer">
                <h3>Enlace al repositorio en <a href="https://github.com/Karmelo1984/Microsoft_Teams_Backups" target="_blank">GitHub</a></h3>
                <h3>2024 - Carmelo Molero Castillo</h3>
            </footer>`;
    }

    getHead(): string | undefined {
        return this._head;
    }

    setHead(title: string, style: string = './styles.css') {
        const max_char: number = 20;
        if (title.length > max_char) {
            const tituloCortado = title.substring(0, max_char) + '...';
        }

        const head: string = `
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${title}</title>
                <link rel="stylesheet" href="${style}"> <!-- Aquí puedes enlazar tu hoja de estilos CSS -->
            </head>`;

        this._style = style;
        this._head = head;
    }

    getHeader(): string | undefined {
        return this._header;
    }

    setHeader(header: string, _class: string = 'header') {
        this._header = `
        <header class="${_class}">
            ${header}
        </header>`;
    }

    getBody(): string | undefined {
        return this._body;
    }

    setBody(body: string, _class: string = 'body') {
        this._body = `
        <body class="${_class}">
            ${body}
        </body>`;
    }

    getFooter(): string | undefined {
        return this._footer;
    }

    getStyles(): string | undefined {
        return this._style;
    }

    setStyles(style: string | undefined) {
        this._style = style;
    }

    getHtmlPath(): string | undefined {
        return this._htmlPath;
    }

    setHtmlPath(htmlPath: string) {
        try {
            const directoryPath = path.dirname(htmlPath);

            if (fs.existsSync(htmlPath) && fs.statSync(htmlPath).isDirectory()) {
                throw new Error(`La ruta especificada '${htmlPath}' es un directorio.`);
            }

            if (!fs.existsSync(directoryPath)) {
                fs.mkdirSync(directoryPath, { recursive: true });
            }

            this._htmlPath = htmlPath;
        } catch (error) {
            console.error(`Error al establecer la ruta HTML '${htmlPath}': ${(error as Error).message}`);
        }
    }

    setHTML() {
        const undefinedMethods: string[] = [];

        if (this.getHead() === undefined) {
            undefinedMethods.push('getHead');
        }
        if (this.getHeader() === undefined) {
            undefinedMethods.push('getHeader');
        }
        if (this.getBody() === undefined) {
            undefinedMethods.push('getBody');
        }
        if (this.getFooter() === undefined) {
            undefinedMethods.push('getFooter');
        }

        if (undefinedMethods.length > 0) {
            const errorMessage = `[setHTML] Es necesario completar: ${undefinedMethods.join(', ')}`;
            console.error(errorMessage);
            this._HTML = undefined;
        } else {
            this._HTML = `
            <!DOCTYPE html>
                ${this.getHead()}
                ${this.getHeader()}
                ${this.getBody()}
                ${this.getFooter()}
            </html>`;
        }
    }

    getHTML(): string | undefined {
        return this._HTML;
    }

    saveHTMLToFile(): void {
        const undefinedMethods: string[] = [];
        const htmlPath = this.getHtmlPath() ?? '';

        if (htmlPath === undefined) {
            undefinedMethods.push('getHtmlPath');
        }

        if (this.getHTML() === undefined) {
            undefinedMethods.push('getHTML');
        }

        if (undefinedMethods.length > 0) {
            const errorMessage = `[saveHTMLToFile] Es necesario completar: ${undefinedMethods.join(', ')}`;
            console.error(errorMessage);
            return;
        }

        try {
            fs.writeFileSync(htmlPath, this.getHTML() ?? '');
            console.log(`HTML guardado en --> ${htmlPath}`);
        } catch (error) {
            console.error(`ERROR de guardado de HTML --> ${error}`);
        }
    }

    /**
     * Método estático para generar una instancia de HTMLGenerator con los atributos necesarios.
     * @param {string} title - El título de la página.
     * @param {string} headerContent - Contenido de etiquetas <header class="header">   ${header}   </header>
     * @param {string} bodyContent - Contenido de etiquetas <body class="body">   ${body}   </body>
     * @param {string} stylesPath - La ruta del archivo de estilos CSS (opcional).
     * @param {string} htmlPath - La ruta donde se guardará el archivo HTML.
     * @param {string} [classHeader='header'] - La clase CSS para el encabezado (opcional, por defecto es 'header').
     * @param {string} [classBody='body'] - La clase CSS para el cuerpo (opcional, por defecto es 'body').
     * @returns {HTMLGenerator} - Una instancia de HTMLGenerator inicializada con los valores proporcionados.
     */
    static generateHTML(
        title: string,
        headerContent: string,
        bodyContent: string,
        stylesPath: string = './styles.css',
        htmlPath: string,
        classHeader: string = 'header',
        classBody: string = 'body',
    ): HTMLGenerator {
        const instance = new HTMLGenerator();
        instance.setHead(title, stylesPath);
        instance.setHeader(headerContent, classHeader);
        instance.setBody(bodyContent, classBody);
        if (stylesPath) {
            instance.setStyles(stylesPath);
        }
        instance.setHtmlPath(htmlPath);

        instance.setHTML();

        return instance;
    }
}
