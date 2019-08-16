import { LngLatBoundsLike } from 'mapbox-gl';
import { MissionRoute } from './models/mission-route';
import { MissionStep } from './models/mission';
import { Observable, of, throwError } from 'rxjs';
import { retryWhen, mergeMap, delay } from 'rxjs/operators';

export class AppUtil {
  public static getBounds(coordinates: number[][]): LngLatBoundsLike {
    let lon: number[] = new Array();
    let lat: number[] = new Array();

    coordinates.forEach(coordinate => {
      lon.push(coordinate[0]);
      lat.push(coordinate[1]);
    });

    lon = lon.sort();
    lat = lat.sort();

    const bounds: LngLatBoundsLike = [lon[0], lat[0], lon.slice(-1)[0], lat.slice(-1)[0]];
    return bounds;
  }

  public static getRoute(id: string, steps: MissionStep[]): MissionRoute {
    const pickup = [];
    const deliver = [];
    let foundWayPoint = false;
    steps.forEach((step: MissionStep) => {
      if (foundWayPoint) {
        deliver.push([step.lon, step.lat]);
      } else {
        pickup.push([step.lon, step.lat]);
      }
      if (step.wayPoint) {
        foundWayPoint = true;
      }
    });
    return {
      id: id,
      pickupRoute: pickup,
      deliverRoute: deliver,
    };
  }

  public static initGeoJson(): GeoJSON.FeatureCollection<GeoJSON.LineString> {
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: []
          }
        }
      ]
    };
  }

  public static retryWithBackoff(delayMs: number, maxRetries = 5, backoff = 1000) {
    let retries = maxRetries;
    return (src: Observable<any>) => src.pipe(
      retryWhen((errors: Observable<any>) => errors.pipe(
        mergeMap(error => {
          if (retries-- > 0) {
            console.warn('retrying request after backoff');
            const backoffTime = delayMs + (maxRetries - retries) * backoff;
            return of(error).pipe(delay(backoffTime));
          }
          return throwError(`failed to perform request after ${maxRetries} attempts`);
        })
      ))
    );
  }

  public static isMobile(): boolean {
    return window.innerWidth < 640;
  }
}
