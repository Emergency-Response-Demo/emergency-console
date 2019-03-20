import { LngLat, LngLatBoundsLike } from 'mapbox-gl';

export class BoundUtil {
  public static getBounds(coordinates: number[][]): LngLatBoundsLike {
    let lngArray: number[] = new Array();
    let latArray: number[] = new Array();

    coordinates.map(coordinate => {
      lngArray.push(coordinate[0]);
      latArray.push(coordinate[1]);
    });

    lngArray = lngArray.sort();
    latArray = latArray.sort();

    const bounds: LngLatBoundsLike = [lngArray[0], latArray[0], lngArray.slice(-1)[0], latArray.slice(-1)[0]];
    return bounds;
  }
}
