export class ResponderStatus {
  active = 0;
  idle = 0;

  get total(): number {
    return this.active + this.idle;
  }

  get data(): number[] {
    return [this.active, this.total - this.active];
  }
}

export class ResponderTotalStatus {
  active: number;
  total: number;
}

export class ResponderLocationStatus {
  continue: boolean;
  human: boolean;
  incidentId: string;
  lat: number;
  lon: number;
  missionId: string;
  responderId: number;
  status: string;
}
