/**
 * Project Event Publisher
 * 
 * Centralized event publishing for project lifecycle events.
 * Uses the core observer infrastructure to emit typed events.
 * 
 * This module provides a clean API for the projects feature to publish
 * events without coupling to the observer implementation.
 * 
 * IMPORTANT: Events are emitted AFTER successful API/state updates only.
 * 
 * @module features/projects/events
 */

import { emit, emitAsync } from '@/core/observer';
import {
  ProjectEvents,
  ProjectCreatedPayload,
  ProjectUpdatedPayload,
  ProjectDeletedPayload,
  ProjectArchivedPayload,
  ProjectRestoredPayload,
  ProjectMemberAddedPayload,
  ProjectMemberRemovedPayload,
} from './projectEvents';

/**
 * Project event publisher options
 */
interface ProjectEventPublisherOptions {
  /** Whether to use async emission (non-blocking) */
  async?: boolean;
  /** Source identifier for the events */
  source?: string;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Project Event Publisher Class
 * 
 * Provides methods to publish project lifecycle events.
 * All methods ensure events are emitted AFTER successful operations.
 * 
 * @default async: true for non-blocking UI
 */
class ProjectEventPublisher {
  private options: ProjectEventPublisherOptions;
  private debug: boolean = process.env.NODE_ENV !== 'production';

  constructor(options: ProjectEventPublisherOptions = {}) {
    this.options = {
      async: true, // Default to async for non-blocking
      ...options,
    };
    this.debug = this.options.debug ?? (process.env.NODE_ENV !== 'production');
  }

  /**
   * Debug logging helper
   */
  private log(message: string, ...args: unknown[]): void {
    if (this.debug) {
      console.log(`[ProjectEventPublisher] ${message}`, ...args);
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
   * Publish project.created event
   * Call this AFTER successful project creation
   */
  publishProjectCreated(data: {
    projectId: string;
    name: string;
    description?: string;
    teamId?: string | null;
  }): void {
    const payload: ProjectCreatedPayload = {
      projectId: data.projectId,
      name: data.name,
      description: data.description,
      teamId: data.teamId,
      timestamp: Date.now(),
      source: this.options.source,
    };

    this.publish(ProjectEvents.CREATED, payload);
    this.log(`Emitted ${ProjectEvents.CREATED}:`, payload);
  }

  /**
   * Publish project.updated event
   * Call this AFTER successful project update
   */
  publishProjectUpdated(data: {
    projectId: string;
    changes: Record<string, unknown>;
    previousValues: Record<string, unknown>;
  }): void {
    const payload: ProjectUpdatedPayload = {
      projectId: data.projectId,
      changes: data.changes,
      previousValues: data.previousValues,
      timestamp: Date.now(),
      source: this.options.source,
    };

    this.publish(ProjectEvents.UPDATED, payload);
    this.log(`Emitted ${ProjectEvents.UPDATED}:`, payload);
  }

  /**
   * Publish project.deleted event
   * Call this AFTER successful project deletion
   */
  publishProjectDeleted(data: {
    projectId: string;
    name: string;
  }): void {
    const payload: ProjectDeletedPayload = {
      projectId: data.projectId,
      name: data.name,
      deletedAt: Date.now(),
      timestamp: Date.now(),
      source: this.options.source,
    };

    this.publish(ProjectEvents.DELETED, payload);
    this.log(`Emitted ${ProjectEvents.DELETED}:`, payload);
  }

  /**
   * Publish project.archived event
   * Call this AFTER successful project archival
   */
  publishProjectArchived(data: {
    projectId: string;
  }): void {
    const payload: ProjectArchivedPayload = {
      projectId: data.projectId,
      archivedAt: Date.now(),
      timestamp: Date.now(),
      source: this.options.source,
    };

    this.publish(ProjectEvents.ARCHIVED, payload);
    this.log(`Emitted ${ProjectEvents.ARCHIVED}:`, payload);
  }

  /**
   * Publish project.restored event
   * Call this AFTER successful project restoration
   */
  publishProjectRestored(data: {
    projectId: string;
  }): void {
    const payload: ProjectRestoredPayload = {
      projectId: data.projectId,
      restoredAt: Date.now(),
      timestamp: Date.now(),
      source: this.options.source,
    };

    this.publish(ProjectEvents.RESTORED, payload);
    this.log(`Emitted ${ProjectEvents.RESTORED}:`, payload);
  }

  /**
   * Publish project.memberAdded event
   * Call this AFTER successful member addition
   */
  publishMemberAdded(data: {
    projectId: string;
    memberId: string;
    memberName: string;
    role: string;
  }): void {
    const payload: ProjectMemberAddedPayload = {
      projectId: data.projectId,
      memberId: data.memberId,
      memberName: data.memberName,
      role: data.role,
      timestamp: Date.now(),
      source: this.options.source,
    };

    this.publish(ProjectEvents.MEMBER_ADDED, payload);
    this.log(`Emitted ${ProjectEvents.MEMBER_ADDED}:`, payload);
  }

  /**
   * Publish project.memberRemoved event
   * Call this AFTER successful member removal
   */
  publishMemberRemoved(data: {
    projectId: string;
    memberId: string;
    memberName: string;
    previousRole: string;
  }): void {
    const payload: ProjectMemberRemovedPayload = {
      projectId: data.projectId,
      memberId: data.memberId,
      memberName: data.memberName,
      previousRole: data.previousRole,
      timestamp: Date.now(),
      source: this.options.source,
    };

    this.publish(ProjectEvents.MEMBER_REMOVED, payload);
    this.log(`Emitted ${ProjectEvents.MEMBER_REMOVED}:`, payload);
  }
}

/**
 * Singleton instance for project events
 */
export const projectEventPublisher = new ProjectEventPublisher();

export { ProjectEventPublisher };
export type { ProjectEventPublisherOptions };
