export class MapItem {
  id: number;
  reporter: {
    id: number;
    fullName: string;
    phoneNumber: string;
    reportTime: Date;
  };
  lat: number;
  lon: number;
  numberOfPeople: number;
  missionStatus: string;
  medicalNeeded: boolean;
}
