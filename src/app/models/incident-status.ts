export class IncidentStatus {
  requested = 0;
  assigned = 0;
  pickedUp = 0;
  rescued = 0;

  get total(): number {
    return this.requested + this.assigned + this.pickedUp + this.rescued;
  }

  get percent(): number {
    return (this.rescued / this.total) * 100;
  }
}
