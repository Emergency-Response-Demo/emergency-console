import { Incident } from './incident';
import { Mission } from './mission';
import { Responder } from './responder';

interface TopicMessage {
  messageType: string;
}

export interface TopicIncidentEvent extends TopicMessage {
  body: Incident;
}

export interface TopicIncidentCommand extends TopicMessage {
  body: {
    incident: Incident;
  };
}

export interface TopicMissionEvent extends TopicMessage {
  body: Mission;
}

export interface TopicResponderEvent extends TopicMessage {
  body: {
    responder: Responder;
  };
}

export interface TopicResponderCreateEvent extends TopicMessage {
  body: {
    created: number,
    responders: number[]
  };
}

export interface TopicResponderDeleteEvent extends TopicMessage {
  body: {
    deleted: number,
    responders: number[]
  };
}

export interface TopicResponderCommand extends TopicMessage {
  body: {
    responder: Responder;
  };
}
