import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { JwtModule, JWT_OPTIONS } from '@auth0/angular-jwt';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { ChartsModule } from 'ng2-charts';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { ToastrModule } from 'ngx-toastr';
import { AppComponent } from './app.component';
import { AppRoutes } from './app.routes';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { ChartsComponent } from './charts/charts.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from './home/home.component';
import { InMemoryApiService } from './in-memory-api.service';
import { IncidentComponent } from './incident/incident.component';
import { KeycloakService } from './keycloak.service';
import { MapComponent } from './map/map.component';
import { ProfileComponent } from './profile/profile.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { NgxMapboxGLModule } from 'ngx-mapbox-gl';

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
    SidebarComponent,
    ProfileComponent,
    DashboardComponent,
    IncidentComponent,
    MapComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    FontAwesomeModule,
    HttpClientModule,
    RouterModule.forRoot(AppRoutes),
    BsDropdownModule.forRoot(),
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
    NgxMapboxGLModule.withConfig({
      accessToken: 'pk.eyJ1IjoibWVjaGV2YXJyaWEiLCJhIjoiY2pxbXNuMXF0MGwzNTQ5bzJwNGtyMTRqdyJ9.WZfALlPxuOveabQDrroLcQ'
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
