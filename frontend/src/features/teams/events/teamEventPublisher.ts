/**
 * Team Event Publisher
 * 
 * Centralized event publishing for team lifecycle events.
 * Uses the core observer infrastructure to emit typed events.
 * 
 * This module provides a clean API for the teams feature to publish
 * events without coupling to the observer implementation.
 * 
 * IMPORTANT: Events are emitted AFTER successful API/state updates only.
 * 
 * @module features/teams/events
 */

import { emit, emitAsync } from '@/core/observer';
import {
  TeamEvents,
  TeamCreatedPayload,
  TeamUpdatedPayload,
  TeamDeletedPayload,
  TeamArchivedPayload,
  TeamRestoredPayload,
  TeamMemberAddedPayload,
  TeamMemberRemovedPayload,
  TeamMemberUpdatedPayload,
  TeamRoleChangedPayload,
  TeamInviteSentPayload,
  TeamInviteAcceptedPayload,
  TeamInviteDeclinedPayload,
} from './teamEvents';

/**
 * Team event publisher options
 */
interface TeamEventPublisherOptions {
  /** Whether to use async emission (non-blocking) */
  async?: boolean;
  /** Source identifier for the events */
  source?: string;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Team Event Publisher Class
 * 
 * Provides methods to publish team lifecycle events.
 * All methods ensure events are emitted AFTER successful operations.
 */
class TeamEventPublisher {
  private options: TeamEventPublisherOptions;
  private debug: boolean;

  constructor(options: TeamEventPublisherOptions = {}) {
    this.options = {
      async: true, // Default to async for non-blocking UI
      ...options,
    };
    this.debug = this.options.debug ?? (process.env.NODE_ENV !== 'production');
  }

  /**
   * Debug logging helper
   */
  private log(message: string, ...args: unknown[]): void {
    if (this.debug) {
      console.log(`[TeamEventPublisher] ${message}`, ...args);
    }
  }

  /**
   * Emit an event using the configured mode
   */
  private publish<T>(eventName: string, payload: T): void {
    if (this.options.async) {
      emitAsync(eventName, payload as any);
    } else {
      emit(eventName, payload as any);
    }
  }

  /**
   * Publish team.created event
   * Call this AFTER successful team creation
   */
  publishTeamCreated(data: {
    teamId: string;
    name: string;
    description?: string;
    ownerId: string;
  }): void {
    const payload: TeamCreatedPayload = {
      teamId: data.teamId,
      name: data.name,
      description: data.description,
      ownerId: data.ownerId,
      timestamp: Date.now(),
      source: this.options.source,
    };

    this.publish(TeamEvents.CREATED, payload);
  }

  /**
   * Publish team.updated event
   * Call this AFTER successful team update
   */
  publishTeamUpdated(data: {
    teamId: string;
    changes: Record<string, unknown>;
    previousValues: Record<string, unknown>;
  }): void {
    const payload: TeamUpdatedPayload = {
      teamId: data.teamId,
      changes: data.changes,
      previousValues: data.previousValues,
      timestamp: Date.now(),
      source: this.options.source,
    };

    this.publish(TeamEvents.UPDATED, payload);
    this.log(`Emitted ${TeamEvents.UPDATED}:`, payload);
  }

  /**
   * Publish team.deleted event
   * Call this AFTER successful team deletion
   */
  publishTeamDeleted(data: {
    teamId: string;
    name: string;
  }): void {
    const payload: TeamDeletedPayload = {
      teamId: data.teamId,
      name: data.name,
      deletedAt: Date.now(),
      timestamp: Date.now(),
      source: this.options.source,
    };

    this.publish(TeamEvents.DELETED, payload);
    this.log(`Emitted ${TeamEvents.DELETED}:`, payload);
  }

  /**
   * Publish team.archived event
   * Call this AFTER successful team archival
   */
  publishTeamArchived(data: {
    teamId: string;
  }): void {
    const payload: TeamArchivedPayload = {
      teamId: data.teamId,
      archivedAt: Date.now(),
      timestamp: Date.now(),
      source: this.options.source,
    };

    this.publish(TeamEvents.ARCHIVED, payload);
    this.log(`Emitted ${TeamEvents.ARCHIVED}:`, payload);
  }

  /**
   * Publish team.restored event
   * Call this AFTER successful team restoration
   */
  publishTeamRestored(data: {
    teamId: string;
  }): void {
    const payload: TeamRestoredPayload = {
      teamId: data.teamId,
      restoredAt: Date.now(),
      timestamp: Date.now(),
      source: this.options.source,
    };

    this.publish(TeamEvents.RESTORED, payload);
    this.log(`Emitted ${TeamEvents.RESTORED}:`, payload);
  }

  /**
   * Publish team.memberAdded event
   * Call this AFTER successful member addition
   */
  publishMemberAdded(data: {
    teamId: string;
    memberId: string;
    memberEmail: string;
    memberName?: string;
    role: string;
  }): void {
    const payload: TeamMemberAddedPayload = {
      teamId: data.teamId,
      memberId: data.memberId,
      memberEmail: data.memberEmail,
      memberName: data.memberName,
      role: data.role,
      timestamp: Date.now(),
      source: this.options.source,
    };

    this.publish(TeamEvents.MEMBER_ADDED, payload);
    this.log(`Emitted ${TeamEvents.MEMBER_ADDED}:`, payload);
  }

  /**
   * Publish team.memberRemoved event
   * Call this AFTER successful member removal
   */
  publishMemberRemoved(data: {
    teamId: string;
    memberId: string;
    memberEmail: string;
    memberName?: string;
    previousRole: string;
  }): void {
    const payload: TeamMemberRemovedPayload = {
      teamId: data.teamId,
      memberId: data.memberId,
      memberEmail: data.memberEmail,
      memberName: data.memberName,
      previousRole: data.previousRole,
      timestamp: Date.now(),
      source: this.options.source,
    };

    this.publish(TeamEvents.MEMBER_REMOVED, payload);
    this.log(`Emitted ${TeamEvents.MEMBER_REMOVED}:`, payload);
  }

  /**
   * Publish team.memberUpdated event
   * Call this AFTER successful member update
   */
  publishMemberUpdated(data: {
    teamId: string;
    memberId: string;
    memberEmail: string;
    changes: Record<string, unknown>;
    previousValues: Record<string, unknown>;
  }): void {
    const payload: TeamMemberUpdatedPayload = {
      teamId: data.teamId,
      memberId: data.memberId,
      memberEmail: data.memberEmail,
      changes: data.changes,
      previousValues: data.previousValues,
      timestamp: Date.now(),
      source: this.options.source,
    };

    this.publish(TeamEvents.MEMBER_UPDATED, payload);
    this.log(`Emitted ${TeamEvents.MEMBER_UPDATED}:`, payload);
  }

  /**
   * Publish team.roleChanged event
   * Call this AFTER successful role change
   */
  publishRoleChanged(data: {
    teamId: string;
    memberId: string;
    memberEmail: string;
    role: string;
    previousRole: string;
  }): void {
    const payload: TeamRoleChangedPayload = {
      teamId: data.teamId,
      memberId: data.memberId,
      memberEmail: data.memberEmail,
      role: data.role,
      previousRole: data.previousRole,
      timestamp: Date.now(),
      source: this.options.source,
    };

    this.publish(TeamEvents.ROLE_CHANGED, payload);
    this.log(`Emitted ${TeamEvents.ROLE_CHANGED}:`, payload);
  }

  /**
   * Publish team.inviteSent event
   * Call this AFTER successful invitation sent
   */
  publishInviteSent(data: {
    teamId: string;
    inviteId: string;
    email: string;
    role: string;
    expiresAt: number;
  }): void {
    const payload: TeamInviteSentPayload = {
      teamId: data.teamId,
      inviteId: data.inviteId,
      email: data.email,
      role: data.role,
      expiresAt: data.expiresAt,
      timestamp: Date.now(),
      source: this.options.source,
    };

    this.publish(TeamEvents.INVITE_SENT, payload);
    this.log(`Emitted ${TeamEvents.INVITE_SENT}:`, payload);
  }

  /**
   * Publish team.inviteAccepted event
   * Call this AFTER successful invitation acceptance
   */
  publishInviteAccepted(data: {
    teamId: string;
    inviteId: string;
    email: string;
    memberId: string;
  }): void {
    const payload: TeamInviteAcceptedPayload = {
      teamId: data.teamId,
      inviteId: data.inviteId,
      email: data.email,
      memberId: data.memberId,
      timestamp: Date.now(),
      source: this.options.source,
    };

    this.publish(TeamEvents.INVITE_ACCEPTED, payload);
    this.log(`Emitted ${TeamEvents.INVITE_ACCEPTED}:`, payload);
  }

  /**
   * Publish team.inviteDeclined event
   * Call this AFTER successful invitation decline
   */
  publishInviteDeclined(data: {
    teamId: string;
    inviteId: string;
    email: string;
    reason?: string;
  }): void {
    const payload: TeamInviteDeclinedPayload = {
      teamId: data.teamId,
      inviteId: data.inviteId,
      email: data.email,
      reason: data.reason,
      timestamp: Date.now(),
      source: this.options.source,
    };

    this.publish(TeamEvents.INVITE_DECLINED, payload);
  }
}

/**
 * Singleton instance for team events
 */
export const teamEventPublisher = new TeamEventPublisher();
