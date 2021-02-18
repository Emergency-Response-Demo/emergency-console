import { Incident } from './incident';
import { Responder } from './responder';

export interface TopicIncidentCommand {
  incident: Incident;
}

export interface TopicResponderEvent {
  responder: Responder;
}

export interface TopicResponderCreateEvent  {
  created: number,
  responders: Responder[]
}

export interface TopicResponderDeleteEvent  {
  deleted: number,
  responders: string[]
}

export interface TopicResponderCommand  {
  responder: Responder;
}
