export interface LocationHistory {
  timestamp: number;
  lat: number;
  lon: number;
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
  steps: MissionStep[];
  status: string;
}

export class MissionStep {
  destination: boolean;
  wayPoint: boolean;
  lat: number;
  lon: number;
}
