export class Incident {
    id: string;
    lat: number;
    lon: number;
    numberOfPeople?: number;
    medicalNeeded?: boolean;
    victimName?: string;
    victimPhoneNumber?: string;
    timestamp?: number;
    status: string;
    missionId?: string;
}
