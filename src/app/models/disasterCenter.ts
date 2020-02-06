export class DisasterCenter {
    name:string;
    lat:number;
    lon:number;

    constructor (name:string, lon:number, lat:number) {
        this.name = name;
        this.lon = lon;
        this.lat = lat;
    }
}