import APIRequestManager from '../APIRequestManager';
import UsuarioData from './usuario.interface';

export default class Usuario {
    businessPhones: string[];
    displayName: string;
    givenName: string;
    mail: string;
    officeLocation: string;
    surname: string;
    userPrincipalName: string;
    id: string;

    constructor({
        displayName,
        givenName,
        mail,
        officeLocation,
        surname,
        userPrincipalName,
        id,
        businessPhones = [],
        jobTitle = null,
        mobilePhone = null,
        preferredLanguage = null,
    }: UsuarioData) {
        if (!displayName || !givenName || !mail || !officeLocation || !surname || !userPrincipalName || !id) {
            throw new Error(
                'Los parámetros displayName, givenName, mail, officeLocation, surname, userPrincipalName e id son obligatorios y no pueden ser nulos.',
            );
        }
        this.id = id;
        this.displayName = displayName;
        this.givenName = givenName;
        this.surname = surname;
        this.mail = mail;
        this.userPrincipalName = userPrincipalName;
        this.officeLocation = officeLocation;
        this.businessPhones = businessPhones;
    }

    static async getMyUser(apiRequestManager: APIRequestManager): Promise<Usuario> {
        const url: string = `https://graph.microsoft.com/v1.0/me`;

        return Usuario.fromAPIRequestManager(apiRequestManager, url);
    }

    static async getUserByEmail(apiRequestManager: APIRequestManager, email: string): Promise<Usuario> {
        const url: string = `https://graph.microsoft.com/v1.0/users/${email}`;

        return Usuario.fromAPIRequestManager(apiRequestManager, url);
    }

    static async getUserById(apiRequestManager: APIRequestManager, id: string): Promise<any> {
        let url: string = `https://graph.microsoft.com/v1.0/users/${id}/identities`;
        console.log(url);

        const jsonData: any = await apiRequestManager.fetchResponse(url);
        if (!Usuario.isUserById(jsonData)) {
            throw new Error('El objeto JSON no cumple con la estructura de usuario esperada.');
        }

        const email = jsonData.value[0].issuerAssignedId;
        return Usuario.getUserByEmail(apiRequestManager, email);
    }

    private static async fromAPIRequestManager(apiRequestManager: APIRequestManager, url: string): Promise<Usuario> {
        const jsonData: any = await apiRequestManager.fetchResponse(url);
        if (!Usuario.isUser(jsonData)) {
            throw new Error('El objeto JSON no cumple con la estructura de usuario esperada.');
        }
        return new Usuario(jsonData);
    }

    private static isUserById(obj: any): Boolean {
        if (!obj || typeof obj !== 'object') {
            return false;
        }
        if (!('@odata.context' in obj) || typeof obj['@odata.context'] !== 'string') {
            return false;
        }
        if (!('value' in obj) || !Array.isArray(obj.value)) {
            return false;
        }
        for (const identity of obj.value) {
            if (!('signInType' in identity) || typeof identity.signInType !== 'string') {
                return false;
            }
            if (!('issuer' in identity) || typeof identity.issuer !== 'string') {
                return false;
            }
            if (!('issuerAssignedId' in identity) || typeof identity.issuerAssignedId !== 'string') {
                return false;
            }
        }
        return true;
    }

    private static isUser(obj: any): Boolean {
        if (!obj || typeof obj !== 'object') {
            return false;
        }

        const requiredProperties = [
            'displayName',
            'givenName',
            'mail',
            'officeLocation',
            'surname',
            'userPrincipalName',
            'id',
        ];
        for (const prop of requiredProperties) {
            if (typeof obj[prop] !== 'string') {
                return false;
            }
        }

        if (obj.businessPhones && !Array.isArray(obj.businessPhones)) {
            return false;
        }

        if (obj.jobTitle && typeof obj.jobTitle !== 'string' && obj.jobTitle !== null) {
            return false;
        }

        if (obj.mobilePhone && typeof obj.mobilePhone !== 'string' && obj.mobilePhone !== null) {
            return false;
        }

        if (obj.preferredLanguage && typeof obj.preferredLanguage !== 'string' && obj.preferredLanguage !== null) {
            return false;
        }

        return true;
    }
}
