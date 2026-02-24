/**
 * Team Store Event Integration
 * 
 * This file demonstrates how to integrate the event publisher
 * into the team store for event-driven communication.
 * 
 * IMPORTANT: Events should ONLY be emitted AFTER successful API/state updates.
 * 
 * @module features/teams/store
 * 
 * @example
 * 
 * // In teamStore.js, import the publisher:
 * import { teamEventPublisher } from '../events';
 * 
 * // Then add event emission after successful operations:
 * 
 * createTeam: async (data) => {
 *   set({ isCreating: true, error: null });
 *   
 *   try {
 *     const result = await teamService.createTeam(data);
 *     const newTeam = result.team || result.data;
 * 
 *     // Update state first
 *     set((state) => ({
 *       teams: [...state.teams, newTeam],
 *       isCreating: false,
 *     }));
 * 
 *     // THEN emit event AFTER successful state update
 *     teamEventPublisher.publishTeamCreated({
 *       teamId: String(newTeam.id),
 *       name: newTeam.name,
 *       description: newTeam.description,
 *       ownerId: String(newTeam.owner_id),
 *     });
 * 
 *     return newTeam;
 *   } catch (error) {
 *     set({ isCreating: false, error: error.message });
 *     throw error;
 *   }
 * },
 */

// ============================================
// INTEGRATION TEMPLATE - Copy to teamStore.js
// ============================================

/*
// Add this import at the top of teamStore.js
import { teamEventPublisher } from '../events';

// ============================================
// CREATE TEAM - Add event emission
// ============================================

createTeam: async (data) => {
  set({ isCreating: true, error: null });
  
  try {
    const result = await teamService.createTeam(data);
    const newTeam = result.team || result.data;

    // Update local state
    set((state) => ({
      teams: [...state.teams, newTeam],
      isCreating: false,
    }));

    // Emit event AFTER successful state update
    teamEventPublisher.publishTeamCreated({
      teamId: String(newTeam.id),
      name: newTeam.name,
      description: newTeam.description,
      ownerId: String(newTeam.owner_id),
    });

    return newTeam;
  } catch (error) {
    set({ isCreating: false, error: error.message });
    throw error;
  }
},

// ============================================
// UPDATE TEAM - Add event emission
// ============================================

updateTeam: async (id, data) => {
  const previousTeam = get().teams.find(t => t.id == id);
  
  // Optimistic update
  set((state) => ({
    teams: state.teams.map((t) =>
      t.id == id ? { ...t, ...data } : t
    ),
    isUpdating: true,
    error: null,
  }));

  try {
    const result = await teamService.updateTeam(id, data);
    const updatedTeam = result.team || result.data;

    // Update with server response
    set((state) => ({
      teams: state.teams.map((t) =>
        t.id == id ? updatedTeam : t
      ),
      isUpdating: false,
    }));

    // Emit event AFTER successful update
    teamEventPublisher.publishTeamUpdated({
      teamId: String(id),
      changes: data,
      previousValues: previousTeam || {},
    });

    return updatedTeam;
  } catch (error) {
    set({ isUpdating: false, error: error.message });
    throw error;
  }
},

// ============================================
// DELETE TEAM - Add event emission
// ============================================

deleteTeam: async (id) => {
  const teamToDelete = get().teams.find(t => t.id == id);
  
  // Optimistic delete
  set((state) => ({
    teams: state.teams.filter((t) => t.id != id),
    selectedTeam: state.selectedTeam?.id == id ? null : state.selectedTeam,
    isDeleting: true,
    error: null,
  }));

  try {
    await teamService.deleteTeam(id);
    
    set({ isDeleting: false });

    // Emit event AFTER successful deletion
    teamEventPublisher.publishTeamDeleted({
      teamId: String(id),
      name: teamToDelete?.name || '',
    });
  } catch (error) {
    // Restore on error
    set((state) => ({
      teams: [...state.teams, teamToDelete].filter(Boolean),
      isDeleting: false,
      error: error.message,
    }));
    throw error;
  }
},

// ============================================
// ADD MEMBER - Add event emission
// ============================================

addTeamMember: async (teamId, memberData) => {
  try {
    const result = await teamService.addMember(teamId, memberData);
    
    // Update local state
    set((state) => ({
      teams: state.teams.map((t) =>
        t.id == teamId
          ? { ...t, members: [...(t.members || []), result.member] }
          : t
      ),
    }));

    // Emit event AFTER successful member addition
    teamEventPublisher.publishMemberAdded({
      teamId: String(teamId),
      memberId: String(result.member.id),
      memberEmail: result.member.email,
      memberName: result.member.name,
      role: result.member.role,
    });
    
    return result;
  } catch (error) {
    throw error;
  }
},

// ============================================
// REMOVE MEMBER - Add event emission
// ============================================

removeTeamMember: async (teamId, memberId, memberEmail, previousRole) => {
  try {
    await teamService.removeMember(teamId, memberId);
    
    // Update local state
    set((state) => ({
      teams: state.teams.map((t) =>
        t.id == teamId
          ? { ...t, members: (t.members || []).filter(m => m.id != memberId) }
          : t
      ),
    }));

    // Emit event AFTER successful member removal
    teamEventPublisher.publishMemberRemoved({
      teamId: String(teamId),
      memberId: String(memberId),
      memberEmail,
      previousRole,
    });
  } catch (error) {
    throw error;
  }
},

// ============================================
// UPDATE MEMBER ROLE - Add event emission
// ============================================

updateMemberRole: async (teamId, memberId, newRole, oldRole, memberEmail) => {
  try {
    await teamService.updateMemberRole(teamId, memberId, { role: newRole });
    
    // Update local state
    set((state) => ({
      teams: state.teams.map((t) =>
        t.id == teamId
          ? {
              ...t,
              members: (t.members || []).map(m =>
                m.id == memberId ? { ...m, role: newRole } : m
              ),
            }
          : t
      ),
    }));

    // Emit event AFTER successful role change
    teamEventPublisher.publishRoleChanged({
      teamId: String(teamId),
      memberId: String(memberId),
      memberEmail,
      role: newRole,
      previousRole: oldRole,
    });
  } catch (error) {
    throw error;
  }
},

// ============================================
// SEND INVITATION - Add event emission
// ============================================

sendTeamInvite: async (teamId, inviteData) => {
  try {
    const result = await teamService.sendInvite(teamId, inviteData);
    
    // Emit event AFTER successful invitation
    teamEventPublisher.publishInviteSent({
      teamId: String(teamId),
      inviteId: String(result.invite.id),
      email: inviteData.email,
      role: inviteData.role,
      expiresAt: result.invite.expires_at,
    });
    
    return result;
  } catch (error) {
    throw error;
  }
},

// ============================================
// ACCEPT INVITATION - Add event emission
// ============================================

acceptTeamInvite: async (inviteId, userId) => {
  try {
    const result = await teamService.acceptInvite(inviteId);
    
    // Emit event AFTER successful acceptance
    teamEventPublisher.publishInviteAccepted({
      teamId: String(result.team_id),
      inviteId: String(inviteId),
      email: result.email,
      memberId: String(userId),
    });
    
    return result;
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
 *    - teamEventPublisher.options.async = true
 *    - Won't block UI for analytics/logging
 * 
 * 5. Clean up subscriptions in components
 *    - Use Observer class for automatic cleanup
 *    - Or manual unsubscribe in useEffect return
 */
