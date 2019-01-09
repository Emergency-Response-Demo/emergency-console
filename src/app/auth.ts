import { KeycloakProfile, KeycloakInstance } from 'keycloak-js';

export class Auth {
  loggedIn?: boolean;
  authz?: KeycloakInstance;
  logoutUrl?: string;
  profile?: KeycloakProfile;
}
