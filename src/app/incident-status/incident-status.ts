export class IncidentStatus {
  requested: number;
  claimed: number;
  pickedUp: number;
  rescued: number;

  constructor() {
    this.claimed = 0;
    this.pickedUp = 0;
    this.requested = 0;
    this.rescued = 0;
  }
}
