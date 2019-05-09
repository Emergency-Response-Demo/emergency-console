// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export var servicesMap = new Map();
servicesMap.set('incident-service', 'd3fa642d9b83043af5b92805ebdaf7d2');
servicesMap.set('alert-service', 'xxx'),
servicesMap.set('responder-service', '884e490b9c52e6c6354b8c6e7cb8ee14'),
servicesMap.set('mission-service', '3865ce20837908ebae41c32a8ae3e829');

export const environment = {
  production: false,
  isGatewayEnabled: true,
  service: servicesMap,
  servicesNames: [
    'incident-service',
    'alert-service',
    'responder-service',
    'mission-service',
  ]
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
