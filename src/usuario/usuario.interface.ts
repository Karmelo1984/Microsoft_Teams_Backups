export default interface UsuarioData {
    displayName: string;
    givenName: string;
    mail: string;
    officeLocation: string;
    surname: string;
    userPrincipalName: string;
    id: string;
    businessPhones?: string[];
    jobTitle?: string | null;
    mobilePhone?: string | null;
    preferredLanguage?: string | null;
}
