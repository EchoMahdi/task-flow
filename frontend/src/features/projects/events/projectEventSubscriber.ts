/**
 * Project Event Subscriber
 * 
 * Example observers that subscribe to project lifecycle events.
 * These demonstrate how other features can react to project changes
 * without creating direct dependencies.
 * 
 * @module features/projects/events
 */

import { Observer } from '@/core/observer';
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
 * Example: Notification Handler for Project Events
 * 
 * This observer demonstrates how the notifications feature
 * can react to project changes to send user alerts.
 * 
 * NOTE: This is just an example - actual implementation would
 * integrate with your notification service.
 */
class ProjectNotificationObserver extends Observer {
  constructor() {
    super('ProjectNotificationObserver');
  }

  /**
   * Subscribe to project events
   */
  mount(): void {
    // Project lifecycle events
    this.subscribe(ProjectEvents.CREATED, this.handleProjectCreated);
    this.subscribe(ProjectEvents.UPDATED, this.handleProjectUpdated);
    this.subscribe(ProjectEvents.DELETED, this.handleProjectDeleted);
    this.subscribe(ProjectEvents.ARCHIVED, this.handleProjectArchived);
    this.subscribe(ProjectEvents.RESTORED, this.handleProjectRestored);
    
    // Team membership events
    this.subscribe(ProjectEvents.MEMBER_ADDED, this.handleMemberAdded);
    this.subscribe(ProjectEvents.MEMBER_REMOVED, this.handleMemberRemoved);
    
    super.mount();
  }

  /**
   * Handle project created - send notification to project owner
   */
  private handleProjectCreated = (event: any): void => {
    const payload = event.payload as ProjectCreatedPayload;
    
    console.log('[ProjectNotificationObserver] Project created:', payload.projectId);
    
    // Implementation would call notification service:
    // notificationService.send({
    //   userId: payload.ownerId,
    //   type: 'project_created',
    //   title: 'New Project Created',
    //   body: `Project "${payload.name}" has been created`,
    // });
  };

  /**
   * Handle project updated - notify relevant users
   */
  private handleProjectUpdated = (event: any): void => {
    const payload = event.payload as ProjectUpdatedPayload;
    
    console.log('[ProjectNotificationObserver] Project updated:', payload.projectId);
    
    // Could notify project members about changes
    // const changedFields = Object.keys(payload.changes);
    // if (changedFields.includes('name')) {
    //   notificationService.notifyProjectMembers(payload.projectId, {
    //     title: 'Project Renamed',
    //     body: `Project renamed to "${payload.changes.name}"`,
    //   });
    // }
  };

  /**
   * Handle project deleted - notify all members
   */
  private handleProjectDeleted = (event: any): void => {
    const payload = event.payload as ProjectDeletedPayload;
    
    console.log('[ProjectNotificationObserver] Project deleted:', payload.projectId);
    
    // Notify users that project was deleted
  };

  /**
   * Handle project archived - notify members
   */
  private handleProjectArchived = (event: any): void => {
    const payload = event.payload as ProjectArchivedPayload;
    
    console.log('[ProjectNotificationObserver] Project archived:', payload.projectId);
  };

  /**
   * Handle project restored - notify members
   */
  private handleProjectRestored = (event: any): void => {
    const payload = event.payload as ProjectRestoredPayload;
    
    console.log('[ProjectNotificationObserver] Project restored:', payload.projectId);
  };

  /**
   * Handle member added - notify the new member
   */
  private handleMemberAdded = (event: any): void => {
    const payload = event.payload as ProjectMemberAddedPayload;
    
    console.log('[ProjectNotificationObserver] Member added:', payload.memberId);
    
    // Notify new member they were added
    // notificationService.send({
    //   userId: payload.memberId,
    //   type: 'project_member_added',
    //   title: 'Added to Project',
    //   body: `You have been added to project as ${payload.role}`,
    // });
  };

  /**
   * Handle member removed - notify the removed member
   */
  private handleMemberRemoved = (event: any): void => {
    const payload = event.payload as ProjectMemberRemovedPayload;
    
    console.log('[ProjectNotificationObserver] Member removed:', payload.memberId);
    
    // Notify user they were removed
  };
}

/**
 * Example: Activity Logger for Project Events
 * 
 * This observer demonstrates how to log project activities
 * for audit trails or activity feeds.
 */
class ProjectActivityLoggerObserver extends Observer {
  private activityLog: Array<{
    timestamp: number;
    eventName: string;
    projectId: string;
    data: any;
  }> = [];

  constructor() {
    super('ProjectActivityLogger');
  }

  mount(): void {
    this.subscribe(ProjectEvents.CREATED, this.logActivity);
    this.subscribe(ProjectEvents.UPDATED, this.logActivity);
    this.subscribe(ProjectEvents.DELETED, this.logActivity);
    this.subscribe(ProjectEvents.ARCHIVED, this.logActivity);
    this.subscribe(ProjectEvents.RESTORED, this.logActivity);
    this.subscribe(ProjectEvents.MEMBER_ADDED, this.logActivity);
    this.subscribe(ProjectEvents.MEMBER_REMOVED, this.logActivity);
    
    super.mount();
  }

  private logActivity = (event: any): void => {
    const logEntry = {
      timestamp: Date.now(),
      eventName: event.name,
      projectId: event.payload.projectId,
      data: event.payload,
    };
    
    this.activityLog.push(logEntry);
    
    console.log('[ProjectActivityLogger] Activity logged:', logEntry);
    
    // In production, this would send to a logging service:
    // analyticsService.track('project_activity', logEntry);
  };

  /**
   * Get activity log for a specific project
   */
  getProjectActivity(projectId: string) {
    return this.activityLog.filter(entry => entry.projectId === projectId);
  }

  /**
   * Get all activities
   */
  getAllActivity() {
    return [...this.activityLog];
  }
}

/**
 * Example: Task Sync Observer
 * 
 * This observer demonstrates how the tasks feature can
 * react to project changes to keep data in sync.
 */
class ProjectTaskSyncObserver extends Observer {
  constructor() {
    super('ProjectTaskSync');
  }

  mount(): void {
    this.subscribe(ProjectEvents.DELETED, this.handleProjectDeleted);
    this.subscribe(ProjectEvents.ARCHIVED, this.handleProjectArchived);
    this.subscribe(ProjectEvents.RESTORED, this.handleProjectRestored);
    
    super.mount();
  }

  /**
   * Handle project deletion - handle orphaned tasks
   */
  private handleProjectDeleted = (event: any): void => {
    const payload = event.payload as ProjectDeletedPayload;
    
    console.log('[ProjectTaskSync] Project deleted, handling orphaned tasks:', payload.projectId);
    
    // Implementation would handle tasks:
    // - Option 1: Delete all tasks in the project
    // - Option 2: Move tasks to unassigned/no project
    // - Option 3: Archive tasks
    // taskService.handleProjectDeletion(payload.projectId);
  };

  /**
   * Handle project archival - archive related tasks
   */
  private handleProjectArchived = (event: any): void => {
    const payload = event.payload as ProjectArchivedPayload;
    
    console.log('[ProjectTaskSync] Project archived:', payload.projectId);
    
    // Could archive all tasks in the project
    // taskService.archiveProjectTasks(payload.projectId);
  };

  /**
   * Handle project restoration - restore related tasks
   */
  private handleProjectRestored = (event: any): void => {
    const payload = event.payload as ProjectRestoredPayload;
    
    console.log('[ProjectTaskSync] Project restored:', payload.projectId);
    
    // Could restore archived tasks
    // taskService.restoreProjectTasks(payload.projectId);
  };
}

// Export examples
export { ProjectNotificationObserver };
export { ProjectActivityLoggerObserver };
export { ProjectTaskSyncObserver };

// Default export
export default {
  ProjectNotificationObserver,
  ProjectActivityLoggerObserver,
  ProjectTaskSyncObserver,
};
