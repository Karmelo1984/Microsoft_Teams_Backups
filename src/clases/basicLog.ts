export default class BasicLog {
    private static readonly MAX_TEXT_CABECERA: number = 15;

    static consoleLog(cab: string, msg: string): void {
        const cabMod = cab.length > this.MAX_TEXT_CABECERA ? cab.slice(0, this.MAX_TEXT_CABECERA) : cab;

        console.log(
            `${BasicLog.generateTimestamp()} [${BasicLog.centerText(cabMod, this.MAX_TEXT_CABECERA)}] --> ${msg}`,
        );
    }

    private static generateTimestamp(): string {
        const now = new Date();
        const timestamp = `\x1b[32m[${now.toLocaleDateString('es-ES')} ${now.toLocaleTimeString('es-ES', { hour12: false })}.${now.getMilliseconds().toString().padStart(3, '0')}] \x1b[0m`;
        return timestamp;
    }

    private static centerText(text: string, totalLength: number): string {
        const spaces = totalLength - text.length;
        const spacesBefore = Math.floor(spaces / 2);
        //const spacesAfter = Math.ceil(spaces / 2);
        return text.padStart(spacesBefore + text.length, ' ').padEnd(totalLength, ' ');
    }
}
