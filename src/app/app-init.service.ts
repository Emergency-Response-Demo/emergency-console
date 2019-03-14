import { Injectable } from '@angular/core';
import { KeycloakService, KeycloakOptions } from 'keycloak-angular';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AppInitService {
  constructor(private http: HttpClient, private keycloak: KeycloakService) {}

  init(): Promise<any> {
    const promise = this.http
      .get('assets/data/keycloak.json')
      .toPromise()
      .then(res => {
        const data: any = new Object(res);

        const enabled = data.enabled;
        if (enabled === 'false') {
          console.log('keycloak is not enabled');
          return Promise.resolve(true);
        } else {
          return this.loadKeycloak(data);
        }
      });

    return promise;
  }

  loadKeycloak(data: any): Promise<any> {
    const options: KeycloakOptions = {
      config: {
        realm: data.realm,
        url: data.url,
        clientId: data.clientId
      },
      initOptions: {
        onLoad: 'login-required'
      }
    };

    return this.keycloak.init(options);
  }
}
