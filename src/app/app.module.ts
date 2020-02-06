import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ChartsModule } from 'ng2-charts';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { ToastrModule } from 'ngx-toastr';
import { SocketIoModule } from 'ngx-socket-io';
import { AppComponent } from './app.component';
import { AppRoutes } from './app.routes';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { ChartsComponent } from './charts/charts.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from './home/home.component';
import { IncidentComponent } from './incident/incident.component';
import { MapComponent } from './map/map.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { NgxMapboxGLModule } from 'ngx-mapbox-gl';
import { KeycloakAngularModule } from 'keycloak-angular';
import { AppInitService } from './app-init.service';
import { MissionComponent } from './mission/mission.component';
import { LegendComponent } from './legend/legend.component';
import { MapOverlayComponent } from './map-overlay/map-overlay.component';
import { IncidentDashboardComponent } from './incident-dashboard/incident-dashboard.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DisasterLocationComponent } from './disaster-location/disaster-location.component';

export function init(appInitService: AppInitService) {
  return () => appInitService.init();
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    HeaderComponent,
    BreadcrumbComponent,
    ChartsComponent,
    SidebarComponent,
    DashboardComponent,
    IncidentComponent,
    MapComponent,
    MissionComponent,
    LegendComponent,
    MapOverlayComponent,
    IncidentDashboardComponent,
    DisasterLocationComponent
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
    NgxMapboxGLModule,
    KeycloakAngularModule,
    NgbModule,
    ReactiveFormsModule,
    SocketIoModule.forRoot({
      url: null
    })
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: init,
      multi: true,
      deps: [AppInitService]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
