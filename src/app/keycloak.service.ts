import { Injectable } from '@angular/core';
import { HttpClient, HttpXhrBackend } from '@angular/common/http';
import { Observable } from 'rxjs';
import { fromPromise } from 'rxjs/internal/observable/fromPromise';
import { KeycloakInstance, KeycloakInitOptions, KeycloakProfile } from 'keycloak-js';
import * as Keycloak from 'keycloak-js';
import { Auth } from './auth';

// tslint:disable-next-line:max-line-length
// https://github.com/ssilvert/keycloak/blob/ACCOUNT-REST-STAN/themes/src/main/resources/theme/keycloak-preview/account/resources/app/keycloak-service/keycloak.service.ts

@Injectable({
  providedIn: 'root'
})
export class KeycloakService {
  static auth: Auth = {};
  static configPath = 'assets/data/keycloak.json';

  static init(): Observable<KeycloakService> {
    return fromPromise(KeycloakService.initPromise());
  }

  static initPromise(): Promise<KeycloakService> {
    const keycloakAuth: KeycloakInstance = Keycloak(this.configPath);
    KeycloakService.auth.isLoggedIn = false;
    KeycloakService.auth.logoutUrl = '';

    return new Promise((resolve, reject) => {
      const initOptions: KeycloakInitOptions = {
        onLoad: 'login-required'
      };

      keycloakAuth
        .init(initOptions)
        .success(() => {
          KeycloakService.auth.isLoggedIn = true;
          KeycloakService.auth.instance = keycloakAuth;
          // tslint:disable-next-line:max-line-length
          KeycloakService.auth.logoutUrl = `${keycloakAuth.authServerUrl}/realms/${keycloakAuth.realm}/protocol/openid-connect/logout?redirect_uri=${window.location.href}`;
          KeycloakService.auth.accountUrl = `${keycloakAuth.authServerUrl}/realms/${keycloakAuth.realm}/account`;
          resolve();
        })
        .error(() => {
          reject();
        });
    });
  }

  static getConfig(): Observable<any> {
    const http = new HttpClient(new HttpXhrBackend({ build: () => new XMLHttpRequest() }));
    return http.get(this.configPath);
  }

  static loadProfile(): Observable<KeycloakProfile> {
    return fromPromise(KeycloakService.profilePromise());
  }

  private static profilePromise(): Promise<KeycloakProfile> {
    return new Promise((resolve, reject) => {
      KeycloakService.auth.instance
        .loadUserProfile()
        .success(res => {
          KeycloakService.auth.profile = res;
          resolve();
        })
        .error(() => {
          reject();
        });
    });
  }

  getAuth(): Auth {
    return KeycloakService.auth;
  }

  logout() {
    KeycloakService.auth.isLoggedIn = false;
    KeycloakService.auth.instance = null;

    window.location.href = KeycloakService.auth.logoutUrl;
  }

  getToken(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      if (KeycloakService.auth.isLoggedIn) {
        if (KeycloakService.auth.instance.token) {
          KeycloakService.auth.instance
            .updateToken(5)
            .success(() => {
              resolve(<string>KeycloakService.auth.instance.token);
            })
            .error(() => {
              reject('Failed to refresh token');
            });
        }
      } else {
        resolve('Not logged in');
      }
    });
  }
}
