import { Injectable } from '@angular/core';
import { KeycloakService, KeycloakOptions } from 'keycloak-angular';

@Injectable({
  providedIn: 'root'
})
export class AppInitService {
  constructor(private keycloak: KeycloakService) {}

  init(): Promise<any> {
    let promise: Promise<any>;

    // _env is defined in env.js
    if (window['_env'].enabled === 'false') {
      console.log('keycloak is not enabled');
      promise = Promise.resolve(true);
    } else {
      const options: KeycloakOptions = {
        config: {
          realm: window['_env'].realm,
          url: window['_env'].url,
          clientId: window['_env'].clientId
        },
        initOptions: {
          onLoad: 'login-required'
        }
      };

      promise = this.keycloak.init(options);
    }

    return promise;
  }
}
