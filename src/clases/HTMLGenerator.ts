import * as path from 'path';
import fs from 'fs';
import resumeChats from '../interfaces/resumeChats.interfaces';

export default class HTMLGenerator {
    constructor() {}

    generateHeader(title: string): string {
        return `
            <header class="header">
                <img src="ruta/a/tu/imagen.jpg" alt="Descripción de la imagen">
                <h1>Carmelo Molero Castillo - Microsoft Teams Backup</h1>
            </header>`;
    }

    generateBody(data: resumeChats): string {
        const sectionsHTML = Object.entries(data)
            .map(([sectionName, items]) => {
                const itemsHTML = items
                    .map(([itemPath, itemName]) => {
                        return `<li><a href="${itemPath}">${itemName}</a></li>`;
                    })
                    .join('');
                return `<section>
                            <h2>${sectionName}</h2>
                            <ul>
                                ${itemsHTML}
                            </ul>
                        </section>`;
            })
            .join('');

        return `
            <body class="body">
                ${sectionsHTML}
            </body>
        `;
    }

    generateFooter(): string {
        return `
            <footer class="footer">
                <h2>Enlace al repositorio en <a href="https://github.com/Karmelo1984/Microsoft_Teams_Backups" target="_blank">GitHub</a></h2>
                <h2>2024 - Carmelo Molero Castillo</h2>
            </footer>
        `;
    }

    generateHTML(title: string, data: resumeChats, style: string = 'styles.css'): string {
        const headerHTML = this.generateHeader(title);
        const bodyHTML = this.generateBody(data);
        const footerHTML = this.generateFooter();

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${title}</title>
                <link rel="stylesheet" href="${style}"> <!-- Aquí puedes enlazar tu hoja de estilos CSS -->
            </head>
            ${headerHTML}
            ${bodyHTML}
            ${footerHTML}
            </html>
        `;
    }

    saveHTMLToFile(htmlContent: string, filePath: string): void {
        try {
            const directory = path.dirname(filePath);
            if (!fs.existsSync(directory)) {
                fs.mkdirSync(directory, { recursive: true });
            }

            fs.writeFileSync(filePath, htmlContent);
            console.log(`Página HTML guardada en: ${filePath}`);
        } catch (error) {
            console.error(`Error al guardar la página HTML: ${error}`);
        }
    }
}
