/**
 * Project Store Event Integration
 * 
 * This file demonstrates how to integrate the event publisher
 * into the project store for event-driven communication.
 * 
 * IMPORTANT: Events should ONLY be emitted AFTER successful API/state updates.
 * 
 * @module features/projects/store
 * 
 * @example
 * 
 * // In projectStore.js, import the publisher:
 * import { projectEventPublisher } from '../events';
 * 
 * // Then add event emission after successful operations:
 * 
 * createProject: async (data) => {
 *   set({ isCreating: true, error: null });
 *   
 *   try {
 *     const result = await projectService.createProject(data);
 *     const newProject = result.project || result.data;
 * 
 *     // Update state first
 *     set((state) => ({
 *       other: [...state.other, newProject],
 *       projects: [...state.projects, newProject],
 *       isCreating: false,
 *     }));
 * 
 *     // THEN emit event AFTER successful state update
 *     projectEventPublisher.publishProjectCreated({
 *       projectId: String(newProject.id),
 *       name: newProject.name,
 *       description: newProject.description,
 *       teamId: newProject.team_id,
 *     });
 * 
 *     return newProject;
 *   } catch (error) {
 *     set({ isCreating: false, error: error.message });
 *     throw error;
 *   }
 * },
 */

// ============================================
// INTEGRATION TEMPLATE - Copy to projectStore.js
// ============================================

/*
// Add this import at the top of projectStore.js
import { projectEventPublisher } from '../events';

// ============================================
// CREATE PROJECT - Add event emission
// ============================================

createProject: async (data) => {
  set({ isCreating: true, error: null });
  
  try {
    const result = await projectService.createProject(data);
    const newProject = result.project || result.data;

    // Update local state
    set((state) => ({
      other: [...state.other, newProject],
      projects: [...state.projects, newProject],
      isCreating: false,
    }));

    // Emit event AFTER successful state update
    projectEventPublisher.publishProjectCreated({
      projectId: String(newProject.id),
      name: newProject.name,
      description: newProject.description,
      teamId: newProject.team_id,
    });

    return newProject;
  } catch (error) {
    set({ isCreating: false, error: error.message });
    throw error;
  }
},

// ============================================
// UPDATE PROJECT - Add event emission
// ============================================

updateProject: async (id, data) => {
  const previousProject = get().projects.find(p => p.id == id);
  
  // Optimistic update
  set((state) => ({
    favorites: state.favorites.map((p) =>
      p.id == id ? { ...p, ...data } : p
    ),
    other: state.other.map((p) =>
      p.id == id ? { ...p, ...data } : p
    ),
    projects: state.projects.map((p) =>
      p.id == id ? { ...p, ...data } : p
    ),
    isUpdating: true,
    error: null,
  }));

  try {
    const result = await projectService.updateProject(id, data);
    const updatedProject = result.project || result.data;

    // Update with server response
    set((state) => ({
      favorites: state.favorites.map((p) =>
        p.id == id ? updatedProject : p
      ),
      other: state.other.map((p) =>
        p.id == id ? updatedProject : p
      ),
      projects: state.projects.map((p) =>
        p.id == id ? updatedProject : p
      ),
      isUpdating: false,
    }));

    // Emit event AFTER successful update
    projectEventPublisher.publishProjectUpdated({
      projectId: String(id),
      changes: data,
      previousValues: previousProject || {},
    });

    return updatedProject;
  } catch (error) {
    set({ isUpdating: false, error: error.message });
    throw error;
  }
},

// ============================================
// DELETE PROJECT - Add event emission
// ============================================

deleteProject: async (id) => {
  const projectToDelete = get().projects.find(p => p.id == id);
  
  // Optimistic delete
  set((state) => ({
    favorites: state.favorites.filter((p) => p.id != id),
    other: state.other.filter((p) => p.id != id),
    projects: state.projects.filter((p) => p.id != id),
    selectedProject: state.selectedProject?.id == id ? null : state.selectedProject,
    currentProject: state.currentProject?.id == id ? null : state.currentProject,
    isDeleting: true,
    error: null,
  }));

  try {
    await projectService.deleteProject(id);
    
    set({ isDeleting: false });

    // Emit event AFTER successful deletion
    projectEventPublisher.publishProjectDeleted({
      projectId: String(id),
      name: projectToDelete?.name || '',
    });
  } catch (error) {
    // Restore on error
    set((state) => ({
      favorites: [...state.favorites, projectToDelete].filter(Boolean),
      other: [...state.other, projectToDelete].filter(Boolean),
      projects: [...state.projects, projectToDelete].filter(Boolean),
      isDeleting: false,
      error: error.message,
    }));
    throw error;
  }
},

// ============================================
// ARCHIVE PROJECT - Add event emission
// ============================================

archiveProject: async (id) => {
  // Similar pattern to deleteProject
  // Emit project.archived event after successful archive
},

// ============================================
// RESTORE PROJECT - Add event emission
// ============================================

restoreProject: async (id) => {
  // Similar pattern to archiveProject
  // Emit project.restored event after successful restore
},

// ============================================
// ADD MEMBER - Add event emission
// ============================================

addProjectMember: async (projectId, memberId, memberName, role) => {
  try {
    await projectService.addMember(projectId, { member_id: memberId, role });
    
    // Update local state
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id == projectId
          ? { ...p, members: [...(p.members || []), { id: memberId, name: memberName, role }] }
          : p
      ),
    }));

    // Emit event AFTER successful member addition
    projectEventPublisher.publishMemberAdded({
      projectId: String(projectId),
      memberId: String(memberId),
      memberName,
      role,
    });
  } catch (error) {
    throw error;
  }
},

// ============================================
// REMOVE MEMBER - Add event emission
// ============================================

removeProjectMember: async (projectId, memberId, memberName, previousRole) => {
  try {
    await projectService.removeMember(projectId, memberId);
    
    // Update local state
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id == projectId
          ? { ...p, members: (p.members || []).filter(m => m.id != memberId) }
          : p
      ),
    }));

    // Emit event AFTER successful member removal
    projectEventPublisher.publishMemberRemoved({
      projectId: String(projectId),
      memberId: String(memberId),
      memberName,
      previousRole,
    });
  } catch (error) {
    throw error;
  }
},
*/

// ============================================
// BEST PRACTICES SUMMARY
// ============================================

/**
 * Event Publishing Best Practices
 * 
 * 1. ALWAYS emit events AFTER successful API/state updates
 *    ❌ emit() before API call - can emit if API fails
 *    ✅ emit() after successful state update
 * 
 * 2. NEVER emit events in catch blocks
 *    ❌ emit() in error handler
 *    ✅ Only emit in success paths
 * 
 * 3. Store previous values BEFORE optimistic updates
 *    - Needed for change tracking in events
 * 
 * 4. Use async emission for non-critical notifications
 *    - projectEventPublisher.options.async = true
 *    - Won't block UI for analytics/logging
 * 
 * 5. Clean up subscriptions in components
 *    - Use Observer class for automatic cleanup
 *    - Or manual unsubscribe in useEffect return
 */
