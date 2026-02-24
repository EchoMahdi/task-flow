/**
 * Notification Event Observer
 * 
 * Centralized observer that subscribes to events from other features
 * and creates notifications in response.
 * 
 * This is the main entry point for notification event handling.
 * Other features emit events, and this observer creates notifications
 * without direct coupling.
 * 
 * @module features/notifications/events
 */

import { Observer, emitAsync } from '../../../core/observer';
import { TaskEvents } from '../../tasks/events/taskEvents';
import { ProjectEvents } from '../../projects/events/projectEvents';
import { TeamEvents } from '../../teams/events/teamEvents';
import { NotificationEvents } from './notificationEvents';

/**
 * Notification data structure
 */
interface NotificationData {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  data?: Record<string, unknown>;
}

/**
 * Notification Event Observer Class
 * 
 * Subscribes to various system events and creates notifications
 * for users based on those events.
 * 
 * NOTE: This observer is typically mounted at app initialization
 * and stays active for the duration of the session.
 */
class NotificationEventObserver extends Observer {
  private currentUserId: string | null = null;

  constructor(userId?: string) {
    super('NotificationEventObserver');
    this.currentUserId = userId || null;
  }

  /**
   * Set the current user ID
   */
  setCurrentUser(userId: string): void {
    this.currentUserId = userId;
  }

  /**
   * Mount all event subscriptions
   */
  mount(): void {
    // Task events
    this.subscribe(TaskEvents.CREATED, this.handleTaskCreated);
    this.subscribe(TaskEvents.UPDATED, this.handleTaskUpdated);
    this.subscribe(TaskEvents.COMPLETED, this.handleTaskCompleted);
    this.subscribe(TaskEvents.ASSIGNED, this.handleTaskAssigned);
    this.subscribe(TaskEvents.MOVED, this.handleTaskMoved);
    
    // Project events
    this.subscribe(ProjectEvents.CREATED, this.handleProjectCreated);
    this.subscribe(ProjectEvents.UPDATED, this.handleProjectUpdated);
    this.subscribe(ProjectEvents.MEMBER_ADDED, this.handleProjectMemberAdded);
    this.subscribe(ProjectEvents.MEMBER_REMOVED, this.handleProjectMemberRemoved);
    
    // Team events
    this.subscribe(TeamEvents.MEMBER_ADDED, this.handleTeamMemberAdded);
    this.subscribe(TeamEvents.ROLE_CHANGED, this.handleTeamRoleChanged);
    this.subscribe(TeamEvents.INVITE_SENT, this.handleTeamInviteSent);
    this.subscribe(TeamEvents.INVITE_ACCEPTED, this.handleTeamInviteAccepted);
    
    super.mount();
    console.log('[NotificationEventObserver] Mounted and listening for events');
  }

  /**
   * Create a notification (internal helper)
   */
  private createNotification = async (notification: NotificationData): Promise<void> => {
    try {
      // Emit notification created event
      await emitAsync(NotificationEvents.SENT, {
        notificationId: `notif-${Date.now()}`,
        type: notification.type,
        title: notification.title,
        body: notification.message,
        recipientId: notification.userId,
        timestamp: Date.now(),
      });

      
      // In a real implementation, this would also:
      // 1. Call notificationService to save to backend
      // 2. Update the notification store
      // 3. Trigger UI updates (badge, toast, etc.)
    } catch (error) {
      console.error('[NotificationEventObserver] Failed to create notification:', error);
    }
  };

  // ==================== Task Event Handlers ====================

  /**
   * Handle task created - notify project members
   */
  private handleTaskCreated = async (event: any): Promise<void> => {
    const { taskId, projectId, title } = event.payload;
    
    // Notify relevant users about new task
    // In practice, would determine who needs to be notified
    if (this.currentUserId) {
      await this.createNotification({
        userId: this.currentUserId,
        type: NotificationType.TASK_ASSIGNED,
        title: 'New Task Created',
        message: `Task "${title}" has been created`,
        link: `/tasks/${taskId}`,
        data: { taskId, projectId },
      });
    }
  };

  /**
   * Handle task updated
   */
  private handleTaskUpdated = async (event: any): Promise<void> => {
    const { taskId, changes, previousValues } = event.payload;
    
    // Could notify about specific changes
    if (changes.title && this.currentUserId) {
      await this.createNotification({
        userId: this.currentUserId,
        type: NotificationType.PROJECT_UPDATE,
        title: 'Task Updated',
        message: `Task was updated: ${changes.title}`,
        link: `/tasks/${taskId}`,
        data: { taskId, changes },
      });
    }
  };

  /**
   * Handle task completed
   */
  private handleTaskCompleted = async (event: any): Promise<void> => {
    const { taskId, projectId } = event.payload;
    
    if (this.currentUserId) {
      await this.createNotification({
        userId: this.currentUserId,
        type: 'task_completed',
        title: 'Task Completed',
        message: 'A task has been marked as completed',
        link: `/tasks/${taskId}`,
        data: { taskId, projectId },
      });
    }
  };

  /**
   * Handle task assigned
   */
  private handleTaskAssigned = async (event: any): Promise<void> => {
    const { taskId, assigneeId, assigneeName } = event.payload;
    
    // Notify the person assigned
    if (assigneeId && assigneeId !== this.currentUserId) {
      await this.createNotification({
        userId: String(assigneeId),
        type: NotificationType.TASK_ASSIGNED,
        title: 'Task Assigned',
        message: `You have been assigned to a new task`,
        link: `/tasks/${taskId}`,
        data: { taskId, assigneeName },
      });
    }
  };

  /**
   * Handle task moved
   */
  private handleTaskMoved = async (event: any): Promise<void> => {
    const { taskId, toProjectId } = event.payload;
    
    // Could notify about project changes
    if (this.currentUserId) {
      await this.createNotification({
        userId: this.currentUserId,
        type: NotificationType.PROJECT_UPDATE,
        title: 'Task Moved',
        message: 'A task has been moved to a different project',
        link: `/tasks/${taskId}`,
        data: { taskId, toProjectId },
      });
    }
  };

  // ==================== Project Event Handlers ====================

  /**
   * Handle project created
   */
  private handleProjectCreated = async (event: any): Promise<void> => {
    const { projectId, name, ownerId } = event.payload;
    
    // Notify the owner
    if (ownerId && ownerId !== this.currentUserId) {
      await this.createNotification({
        userId: String(ownerId),
        type: NotificationType.PROJECT_UPDATE,
        title: 'Project Created',
        message: `Your project "${name}" has been created`,
        link: `/projects/${projectId}`,
        data: { projectId },
      });
    }
  };

  /**
   * Handle project updated
   */
  private handleProjectUpdated = async (event: any): Promise<void> => {
    const { projectId, changes } = event.payload;
    
    // Notify project members about significant changes
    if (changes.name && this.currentUserId) {
      await this.createNotification({
        userId: this.currentUserId,
        type: NotificationType.PROJECT_UPDATE,
        title: 'Project Updated',
        message: `Project has been updated: ${changes.name}`,
        link: `/projects/${projectId}`,
        data: { projectId, changes },
      });
    }
  };

  /**
   * Handle project member added
   */
  private handleProjectMemberAdded = async (event: any): Promise<void> => {
    const { projectId, memberId, memberName, role } = event.payload;
    
    // Notify the new member
    if (memberId) {
      await this.createNotification({
        userId: String(memberId),
        type: NotificationType.PROJECT_INVITE,
        title: 'Added to Project',
        message: `You have been added to a project as ${role}`,
        link: `/projects/${projectId}`,
        data: { projectId, role },
      });
    }
  };

  /**
   * Handle project member removed
   */
  private handleProjectMemberRemoved = async (event: any): Promise<void> => {
    const { projectId, memberId, memberName } = event.payload;
    
    // Notify the removed member
    if (memberId) {
      await this.createNotification({
        userId: String(memberId),
        type: NotificationType.PROJECT_UPDATE,
        title: 'Removed from Project',
        message: `You have been removed from a project`,
        data: { projectId },
      });
    }
  };

  // ==================== Team Event Handlers ====================

  /**
   * Handle team member added
   */
  private handleTeamMemberAdded = async (event: any): Promise<void> => {
    const { teamId, memberId, memberEmail, role } = event.payload;
    
    // Notify the new member
    if (memberId) {
      await this.createNotification({
        userId: String(memberId),
        type: NotificationType.PROJECT_INVITE,
        title: 'Added to Team',
        message: `You have been added to a team as ${role}`,
        link: `/teams/${teamId}`,
        data: { teamId, role },
      });
    }
  };

  /**
   * Handle team role changed
   */
  private handleTeamRoleChanged = async (event: any): Promise<void> => {
    const { teamId, memberId, role, previousRole } = event.payload;
    
    // Notify the member
    if (memberId) {
      await this.createNotification({
        userId: String(memberId),
        type: NotificationType.PROJECT_UPDATE,
        title: 'Role Updated',
        message: `Your role changed from ${previousRole} to ${role}`,
        link: `/teams/${teamId}`,
        data: { teamId, role, previousRole },
      });
    }
  };

  /**
   * Handle team invite sent
   */
  private handleTeamInviteSent = async (event: any): Promise<void> => {
    const { teamId, email, role } = event.payload;
    
    // This would typically trigger an email notification
    // The in-app notification would be created when they accept
    console.log(`[NotificationEventObserver] Invite sent to ${email} for team ${teamId}`);
  };

  /**
   * Handle team invite accepted
   */
  private handleTeamInviteAccepted = async (event: any): Promise<void> => {
    const { teamId, email, memberId } = event.payload;
    
    // Notify team owner/admin about accepted invite
    if (this.currentUserId) {
      await this.createNotification({
        userId: this.currentUserId,
        type: NotificationType.PROJECT_INVITE,
        title: 'Invite Accepted',
        message: `${email} has joined the team`,
        link: `/teams/${teamId}`,
        data: { teamId, email },
      });
    }
  };
}

/**
 * Singleton instance for app-wide notification observer
 */
let notificationObserverInstance: NotificationEventObserver | null = null;

/**
 * Get or create the notification observer singleton
 */
export const getNotificationObserver = (userId?: string): NotificationEventObserver => {
  if (!notificationObserverInstance) {
    notificationObserverInstance = new NotificationEventObserver(userId);
  }
  return notificationObserverInstance;
};

/**
 * Initialize notification observer (typically called at app startup)
 */
export const initializeNotificationObserver = (userId: string): NotificationEventObserver => {
  const observer = getNotificationObserver(userId);
  observer.setCurrentUser(userId);
  observer.mount();
  return observer;
};

/**
 * Cleanup notification observer
 */
export const cleanupNotificationObserver = (): void => {
  if (notificationObserverInstance) {
    notificationObserverInstance.unmount();
    notificationObserverInstance = null;
  }
};

export { NotificationEventObserver };
export type { NotificationData };
export default NotificationEventObserver;
