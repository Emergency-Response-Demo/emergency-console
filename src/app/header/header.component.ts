import { Component, OnInit, Renderer2} from '@angular/core';
import { MessageItem } from '../message/message-item';
import {
  faEraser,
  faSignOutAlt,
  IconDefinition
} from '@fortawesome/free-solid-svg-icons';
import { MessageHistoryService } from '../message/message-history.service';
import { KeycloakService } from '../keycloak.service';

@Component({
  styleUrls: ['./header.component.css'],
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  eraseIcon: IconDefinition;
  logoutIcon: IconDefinition;
  formIcon: IconDefinition;
  sidebarVisible: boolean;
  username: string;
  messages: MessageItem[];
  logoutUrl: string;

  constructor(
    private messageHistoryService: MessageHistoryService,
    private renderer: Renderer2,
    private keycloakService: KeycloakService
  ) {
    this.eraseIcon = faEraser;
    this.logoutIcon = faSignOutAlt;
    this.sidebarVisible = true;
    this.messages = new Array();
    this.username = '';
  }

  clear() {
    this.messageHistoryService.clear();
  }

  toggleSidebar() {
      this.sidebarVisible = !this.sidebarVisible;
      if (this.sidebarVisible === false) {
        this.renderer.removeClass(document.body, 'sidebar-show');
      } else {
        this.renderer.addClass(document.body, 'sidebar-show');
      }
  }

  ngOnInit(): void {
    this.messages = this.messageHistoryService.getHistory();

    const auth = this.keycloakService.getAuth();

    if (auth.loggedIn) {
      this.logoutUrl = auth.logoutUrl;
    }
  }
}
