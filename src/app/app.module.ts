import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { RouterModule } from '@angular/router';
import { AppRoutes } from './app.routes';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AlertModule } from 'ngx-bootstrap/alert';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from './home/home.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { ChartsComponent } from './charts/charts.component';
import { ChartsModule } from 'ng2-charts';
import { FormComponent } from './form/form.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { KeycloakService } from './keycloak.service';
import { JWT_OPTIONS, JwtModule } from '@auth0/angular-jwt';
import { StatusComponent } from './status/status.component';
import { ProfileComponent } from './profile/profile.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AlertsComponent } from './alerts/alerts.component';
import { InMemoryApiService } from './in-memory-api.service';
import { IncidentStatusComponent } from './incident-status/incident-status.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';

export function jwtOptionsFactory(keycloakService: KeycloakService) {
  return {
    tokenGetter: () => {
      return keycloakService.getToken();
    }
  };
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    HeaderComponent,
    BreadcrumbComponent,
    ChartsComponent,
    FormComponent,
    SidebarComponent,
    StatusComponent,
    ProfileComponent,
    DashboardComponent,
    AlertsComponent,
    IncidentStatusComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    FontAwesomeModule,
    HttpClientModule,
    RouterModule.forRoot(AppRoutes),
    BsDropdownModule.forRoot(),
    AlertModule.forRoot(),
    ModalModule.forRoot(),
    ProgressbarModule.forRoot(),
    CommonModule,
    BrowserAnimationsModule,
    ChartsModule,
    ToastrModule.forRoot({
      closeButton: true,
      progressBar: true
    }),
    JwtModule.forRoot({
      jwtOptionsProvider: {
        provide: JWT_OPTIONS,
        useFactory: jwtOptionsFactory,
        deps: [KeycloakService]
      }
    }),
    HttpClientInMemoryWebApiModule.forRoot(InMemoryApiService, {
      dataEncapsulation: false,
      passThruUnknownUrl: true
    }),
    LeafletModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
