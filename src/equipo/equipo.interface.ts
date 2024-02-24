export default interface EquipoData {
    id: string;
    createdDateTime: Date | null;
    displayName: string;
    description: string;
    isArchived: boolean;
    channels: CanalEquipo[] | null;
}

export interface CanalEquipo {
    id: string;
    createdDateTime: Date;
    displayName: string;
    description: string;
    isFavoriteByDefault: boolean | null;
    email: string;
    membershipType: string;
}
