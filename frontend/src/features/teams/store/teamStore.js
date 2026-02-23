/**
 * Team Store
 * 
 * State management for teams using Zustand.
 */

import { create } from 'zustand';
import teamService from '../services/teamService';

const useTeamStore = create((set, get) => ({
  // State
  teams: [],
  currentTeam: null,
  teamMembers: [],
  teamProjects: [],
  teamOptions: [],
  isLoading: false,
  error: null,

  // Actions
  /**
   * Fetch all teams the user is a member of.
   */
  fetchTeams: async () => {
    set({ isLoading: true, error: null });
    try {
      const teams = await teamService.getTeams();
      set({ teams: teams.data || [], isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch teams', isLoading: false });
    }
  },

  /**
   * Fetch team options for dropdowns.
   */
  fetchTeamOptions: async () => {
    try {
      const teamOptions = await teamService.getTeamOptions();
      set({ teamOptions });
    } catch (error) {
      console.error('Failed to fetch team options:', error);
    }
  },

  /**
   * Fetch a single team.
   */
  fetchTeam: async (teamId) => {
    set({ isLoading: true, error: null });
    try {
      const team = await teamService.getTeam(teamId);
      set({ currentTeam: team.data || team, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch team', isLoading: false });
    }
  },

  /**
   * Create a new team.
   */
  createTeam: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const team = await teamService.createTeam(data);
      const currentTeams = get().teams;
      set({ 
        teams: [...currentTeams, team.data || team], 
        isLoading: false 
      });
      return team;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to create team', isLoading: false });
      throw error;
    }
  },

  /**
   * Update a team.
   */
  updateTeam: async (teamId, data) => {
    set({ isLoading: true, error: null });
    try {
      const team = await teamService.updateTeam(teamId, data);
      const currentTeams = get().teams;
      const updatedTeams = currentTeams.map(t => 
        t.id === teamId ? { ...t, ...(team.data || team) } : t
      );
      set({ 
        teams: updatedTeams, 
        currentTeam: team.data || team,
        isLoading: false 
      });
      return team;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to update team', isLoading: false });
      throw error;
    }
  },

  /**
   * Delete a team.
   */
  deleteTeam: async (teamId) => {
    set({ isLoading: true, error: null });
    try {
      await teamService.deleteTeam(teamId);
      const currentTeams = get().teams;
      set({ 
        teams: currentTeams.filter(t => t.id !== teamId), 
        currentTeam: null,
        isLoading: false 
      });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to delete team', isLoading: false });
      throw error;
    }
  },

  /**
   * Fetch team members.
   */
  fetchTeamMembers: async (teamId) => {
    try {
      const members = await teamService.getTeamMembers(teamId);
      set({ teamMembers: members });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch members' });
    }
  },

  /**
   * Add a member to a team.
   */
  addTeamMember: async (teamId, data) => {
    try {
      await teamService.addTeamMember(teamId, data);
      await get().fetchTeamMembers(teamId);
      await get().fetchTeam(teamId);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Remove a member from a team.
   */
  removeTeamMember: async (teamId, userId) => {
    try {
      await teamService.removeTeamMember(teamId, userId);
      await get().fetchTeamMembers(teamId);
      await get().fetchTeam(teamId);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update a member's role.
   */
  updateMemberRole: async (teamId, userId, role) => {
    try {
      await teamService.updateMemberRole(teamId, userId, role);
      await get().fetchTeamMembers(teamId);
      await get().fetchTeam(teamId);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Fetch team projects.
   */
  fetchTeamProjects: async (teamId) => {
    try {
      const projects = await teamService.getTeamProjects(teamId);
      set({ teamProjects: projects.data || projects });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch projects' });
    }
  },

  /**
   * Assign a project to a team.
   */
  assignProjectToTeam: async (teamId, projectId) => {
    try {
      await teamService.assignProjectToTeam(teamId, projectId);
      await get().fetchTeamProjects(teamId);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Remove a project from a team.
   */
  removeProjectFromTeam: async (teamId, projectId) => {
    try {
      await teamService.removeProjectFromTeam(teamId, projectId);
      await get().fetchTeamProjects(teamId);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Leave a team.
   */
  leaveTeam: async (teamId) => {
    try {
      await teamService.leaveTeam(teamId);
      const currentTeams = get().teams;
      set({ teams: currentTeams.filter(t => t.id !== teamId) });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Clear current team.
   */
  clearCurrentTeam: () => {
    set({ currentTeam: null, teamMembers: [], teamProjects: [] });
  },

  /**
   * Clear error.
   */
  clearError: () => {
    set({ error: null });
  },
}));

export default useTeamStore;
