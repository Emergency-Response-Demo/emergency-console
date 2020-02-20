export class Shelter {
  id: string;
  lat: number;
  lon: number;
  name: string;
  rescued = 0;

  constructor(id: string, lon: number, lat: number, name?: string) {
    this.id = id;
    this.lon = lon;
    this.lat = lat;
    this.name = name;
  }
}
