export class DisasterCenter {
    name:string;
    lat:number;
    lon:number;
    zoom:number;

    constructor (name:string, lon:number, lat:number, zoom:number) {
        this.name = name;
        this.lon = lon;
        this.lat = lat;
        this.zoom = zoom;
    }
}