/**
 * Team Events - Event Naming Convention Constants
 * 
 * This file defines all event names for the Teams feature following the
 * standardized naming convention: <feature>.<entity>.<action>
 * 
 * All actions MUST use past tense to represent completed facts.
 * 
 * @module features/teams/events
 */

import { EventPayload } from '@/core/observer/types';

/**
 * Team event names - use these constants for publishing/subscribing
 */
export const TeamEvents = {
  /** A new team was created */
  CREATED: 'teams.created',
  
  /** Team properties were modified */
  UPDATED: 'teams.updated',
  
  /** A team was permanently deleted */
  DELETED: 'teams.deleted',
  
  /** Team was archived */
  ARCHIVED: 'teams.archived',
  
  /** Team was restored from archive */
  RESTORED: 'teams.restored',
  
  /** A member was added to the team */
  MEMBER_ADDED: 'teams.memberAdded',
  
  /** A member was removed from the team */
  MEMBER_REMOVED: 'teams.memberRemoved',
  
  /** A member was updated */
  MEMBER_UPDATED: 'teams.memberUpdated',
  
  /** A member's role was changed */
  ROLE_CHANGED: 'teams.roleChanged',
  
  /** An invitation was sent */
  INVITE_SENT: 'teams.inviteSent',
  
  /** An invitation was accepted */
  INVITE_ACCEPTED: 'teams.inviteAccepted',
  
  /** An invitation was declined */
  INVITE_DECLINED: 'teams.inviteDeclined',
} as const;

/**
 * Union type of all team event names
 */
export type TeamEventName = typeof TeamEvents[keyof typeof TeamEvents];

/**
 * =====================================================
 * EVENT PAYLOAD INTERFACES
 * =====================================================
 */

interface BaseTeamPayload extends EventPayload {
  teamId: string;
}

/**
 * Payload for teams.created event
 */
export interface TeamCreatedPayload extends BaseTeamPayload {
  name: string;
  description?: string;
  ownerId: string;
}

/**
 * Payload for teams.updated event
 */
export interface TeamUpdatedPayload extends BaseTeamPayload {
  changes: Record<string, unknown>;
  previousValues: Record<string, unknown>;
}

/**
 * Payload for teams.deleted event
 */
export interface TeamDeletedPayload extends BaseTeamPayload {
  deletedAt: number;
  name: string;
}

/**
 * Payload for teams.archived event
 */
export interface TeamArchivedPayload extends BaseTeamPayload {
  archivedAt: number;
}

/**
 * Payload for teams.restored event
 */
export interface TeamRestoredPayload extends BaseTeamPayload {
  restoredAt: number;
}

/**
 * Payload for teams.memberAdded event
 */
export interface TeamMemberAddedPayload extends BaseTeamPayload {
  memberId: string;
  memberEmail: string;
  memberName?: string;
  role: string;
}

/**
 * Payload for teams.memberRemoved event
 */
export interface TeamMemberRemovedPayload extends BaseTeamPayload {
  memberId: string;
  memberEmail: string;
  memberName?: string;
  previousRole: string;
}

/**
 * Payload for teams.memberUpdated event
 */
export interface TeamMemberUpdatedPayload extends BaseTeamPayload {
  memberId: string;
  memberEmail: string;
  changes: Record<string, unknown>;
  previousValues: Record<string, unknown>;
}

/**
 * Payload for teams.roleChanged event
 */
export interface TeamRoleChangedPayload extends BaseTeamPayload {
  memberId: string;
  memberEmail: string;
  role: string;
  previousRole: string;
}

/**
 * Payload for teams.inviteSent event
 */
export interface TeamInviteSentPayload extends BaseTeamPayload {
  inviteId: string;
  email: string;
  role: string;
  expiresAt: number;
}

/**
 * Payload for teams.inviteAccepted event
 */
export interface TeamInviteAcceptedPayload extends BaseTeamPayload {
  inviteId: string;
  email: string;
  memberId: string;
}

/**
 * Payload for teams.inviteDeclined event
 */
export interface TeamInviteDeclinedPayload extends BaseTeamPayload {
  inviteId: string;
  email: string;
  reason?: string;
}

/**
 * =====================================================
 * TYPE MAPPING
 * =====================================================
 */

export type TeamEventPayload<T extends TeamEventName> = 
  T extends typeof TeamEvents.CREATED ? TeamCreatedPayload :
  T extends typeof TeamEvents.UPDATED ? TeamUpdatedPayload :
  T extends typeof TeamEvents.DELETED ? TeamDeletedPayload :
  T extends typeof TeamEvents.ARCHIVED ? TeamArchivedPayload :
  T extends typeof TeamEvents.RESTORED ? TeamRestoredPayload :
  T extends typeof TeamEvents.MEMBER_ADDED ? TeamMemberAddedPayload :
  T extends typeof TeamEvents.MEMBER_REMOVED ? TeamMemberRemovedPayload :
  T extends typeof TeamEvents.MEMBER_UPDATED ? TeamMemberUpdatedPayload :
  T extends typeof TeamEvents.ROLE_CHANGED ? TeamRoleChangedPayload :
  T extends typeof TeamEvents.INVITE_SENT ? TeamInviteSentPayload :
  T extends typeof TeamEvents.INVITE_ACCEPTED ? TeamInviteAcceptedPayload :
  T extends typeof TeamEvents.INVITE_DECLINED ? TeamInviteDeclinedPayload :
  EventPayload;

export default TeamEvents;
