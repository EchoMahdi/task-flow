/**
 * Project Events - Event Naming Convention Constants
 * 
 * This file defines all event names for the Projects feature following the
 * standardized naming convention: <feature>.<entity>.<action>
 * 
 * All actions MUST use past tense to represent completed facts.
 * 
 * @module features/projects/events
 */

import { EventPayload } from '@/core/observer/types';

/**
 * Project event names - use these constants for publishing/subscribing
 */
export const ProjectEvents = {
  /** A new project was created */
  CREATED: 'projects.created',
  
  /** Project properties were modified */
  UPDATED: 'projects.updated',
  
  /** A project was permanently deleted */
  DELETED: 'projects.deleted',
  
  /** Project was archived */
  ARCHIVED: 'projects.archived',
  
  /** Project was restored from archive */
  RESTORED: 'projects.restored',
  
  /** A member was added to the project */
  MEMBER_ADDED: 'projects.memberAdded',
  
  /** A member was removed from the project */
  MEMBER_REMOVED: 'projects.memberRemoved',
  
  /** A member's role was changed */
  ROLE_CHANGED: 'projects.roleChanged',
} as const;

/**
 * Union type of all project event names
 */
export type ProjectEventName = typeof ProjectEvents[keyof typeof ProjectEvents];

/**
 * =====================================================
 * EVENT PAYLOAD INTERFACES
 * =====================================================
 */

interface BaseProjectPayload extends EventPayload {
  projectId: string;
}

/**
 * Payload for projects.created event
 */
export interface ProjectCreatedPayload extends BaseProjectPayload {
  name: string;
  description?: string;
  teamId?: string | null;
}

/**
 * Payload for projects.updated event
 */
export interface ProjectUpdatedPayload extends BaseProjectPayload {
  changes: Record<string, unknown>;
  previousValues: Record<string, unknown>;
}

/**
 * Payload for projects.deleted event
 */
export interface ProjectDeletedPayload extends BaseProjectPayload {
  deletedAt: number;
  name: string;
}

/**
 * Payload for projects.archived event
 */
export interface ProjectArchivedPayload extends BaseProjectPayload {
  archivedAt: number;
}

/**
 * Payload for projects.restored event
 */
export interface ProjectRestoredPayload extends BaseProjectPayload {
  restoredAt: number;
}

/**
 * Payload for projects.memberAdded event
 */
export interface ProjectMemberAddedPayload extends BaseProjectPayload {
  memberId: string;
  memberName: string;
  role: string;
}

/**
 * Payload for projects.memberRemoved event
 */
export interface ProjectMemberRemovedPayload extends BaseProjectPayload {
  memberId: string;
  memberName: string;
  previousRole: string;
}

/**
 * Payload for projects.roleChanged event
 */
export interface ProjectRoleChangedPayload extends BaseProjectPayload {
  memberId: string;
  memberName: string;
  role: string;
  previousRole: string;
}

/**
 * =====================================================
 * TYPE MAPPING
 * =====================================================
 */

export type ProjectEventPayload<T extends ProjectEventName> = 
  T extends typeof ProjectEvents.CREATED ? ProjectCreatedPayload :
  T extends typeof ProjectEvents.UPDATED ? ProjectUpdatedPayload :
  T extends typeof ProjectEvents.DELETED ? ProjectDeletedPayload :
  T extends typeof ProjectEvents.ARCHIVED ? ProjectArchivedPayload :
  T extends typeof ProjectEvents.RESTORED ? ProjectRestoredPayload :
  T extends typeof ProjectEvents.MEMBER_ADDED ? ProjectMemberAddedPayload :
  T extends typeof ProjectEvents.MEMBER_REMOVED ? ProjectMemberRemovedPayload :
  T extends typeof ProjectEvents.ROLE_CHANGED ? ProjectRoleChangedPayload :
  EventPayload;

/**
 * =====================================================
 * DEPRECATED EVENTS MAPPING
 * =====================================================
 */
export const DeprecatedProjectEvents = {
  /** @deprecated Use ProjectEvents.CREATED */
  PROJECT_CREATED: ProjectEvents.CREATED,
  /** @deprecated Use ProjectEvents.UPDATED */
  PROJECT_UPDATED: ProjectEvents.UPDATED,
  /** @deprecated Use ProjectEvents.DELETED */
  PROJECT_DELETED: ProjectEvents.DELETED,
} as const;

export default ProjectEvents;
