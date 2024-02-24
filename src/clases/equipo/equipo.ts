import EquipoData, { CanalEquipo } from './equipo.interface';

export default class Equipo {
    id: string;
    createdDateTime: Date | null;
    displayName: string;
    description: string;
    isArchived: boolean;
    channels: CanalEquipo[] | null;

    constructor(data: EquipoData) {
        this.id = data.id;
        this.createdDateTime = data.createdDateTime ?? null;
        this.displayName = data.displayName;
        this.description = data.description;
        this.isArchived = data.isArchived;
        this.channels = data.channels ?? null;
    }
}
