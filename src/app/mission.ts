export interface Location {
  lat: number;
  long: number;
}

export interface LocationHistory {
  timestamp: number;
  location: Location;
}

export class Mission {
  id: string;
  incidentId: string;
  responderId: number;
  responderStartLat: number;
  responderStartLong: number;
  incidentLat: number;
  incidentLong: number;
  destinationLat: number;
  destinationLong: number;
  responderLocationHistory: LocationHistory[];
  route: any;
  status: string;
}
