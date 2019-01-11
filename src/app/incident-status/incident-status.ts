export class IncidentStatus {
  requested: number;
  assigned: number;
  pickedUp: number;
  rescued: number;

  constructor() {
    this.assigned = 0;
    this.pickedUp = 0;
    this.requested = 0;
    this.rescued = 0;
  }
}
