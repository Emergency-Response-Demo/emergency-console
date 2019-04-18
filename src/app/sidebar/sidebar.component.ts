import { Component, OnInit } from '@angular/core';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent implements OnInit {
  githubIcon: IconDefinition;

  constructor() {
    this.githubIcon = faGithub;
  }

  ngOnInit() {}
}
