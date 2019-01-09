import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {AppModule} from './app/app.module';
import {environment} from './environments/environment';
import {KeycloakService} from './app/keycloak.service';
import {mergeMap} from 'rxjs/operators';

if (environment.production) {
  enableProdMode();
}

KeycloakService.getConfig().subscribe(res => {
  const enabled = JSON.parse(res.enabled);

  console.log(`keycloak is enabled: ${enabled}`);

  if (enabled === true) {
    KeycloakService.init()
        .pipe(
            mergeMap(KeycloakService.loadProfile)
        )
        .subscribe(loadAngular, handleError);
  } else {
    loadAngular();
  }
});

function loadAngular() {
    platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch(err => console.log(err));
}

function handleError() {
  console.warn(`Failed to init keycloak, starting angular`);
  loadAngular();
}
