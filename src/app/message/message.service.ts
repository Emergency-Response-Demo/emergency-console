import { Injectable } from '@angular/core';
import { MessageItem } from './message-item';
import { ToastrService } from 'ngx-toastr';
import {
  faCheckCircle,
  IconDefinition
} from '@fortawesome/free-solid-svg-icons';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { Subject } from 'rxjs/internal/Subject';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private successIcon: IconDefinition;
  private errorIcon: IconDefinition;
  private infoIcon: IconDefinition;
  private warningIcon: IconDefinition;
  public newMessage$: Subject<MessageItem>;

  constructor(private toastr: ToastrService) {
    this.successIcon = faCheckCircle;
    this.errorIcon = faTimesCircle;
    this.infoIcon = faInfoCircle;
    this.warningIcon = faExclamationCircle;
    this.newMessage$ = new Subject();
  }

  success(msg: string): void {
    this.toastr.success(msg);
    this.emitMessage(this.successIcon, msg);
  }

  error(msg: string): void {
    this.toastr.error(msg);
    this.emitMessage(this.errorIcon, msg);
  }

  info(msg: string): void {
    this.toastr.info(msg);
    this.emitMessage(this.infoIcon, msg);
  }

  warning(msg: string): void {
    this.toastr.warning(msg);
    this.emitMessage(this.warningIcon, msg);
  }

  private emitMessage(icon: IconDefinition, text: string): void {
    const message = new MessageItem(icon, text);

    // message history service will pick up the change
    this.newMessage$.next(message);
  }
}
