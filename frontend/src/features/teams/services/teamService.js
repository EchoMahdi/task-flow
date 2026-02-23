/**
 * Team Service
 * 
 * Handles API calls for team-related operations.
 */

import axios from 'axios';

const API_URL = '/api/teams';

/**
 * Get all teams the user is a member of.
 */
export const getTeams = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

/**
 * Get team options for dropdowns.
 */
export const getTeamOptions = async () => {
  const response = await axios.get(`${API_URL}/options`);
  return response.data.teams;
};

/**
 * Get a single team by ID.
 */
export const getTeam = async (teamId) => {
  const response = await axios.get(`${API_URL}/${teamId}`);
  return response.data;
};

/**
 * Create a new team.
 */
export const createTeam = async (data) => {
  const response = await axios.post(API_URL, data);
  return response.data;
};

/**
 * Update a team.
 */
export const updateTeam = async (teamId, data) => {
  const response = await axios.put(`${API_URL}/${teamId}`, data);
  return response.data;
};

/**
 * Delete a team.
 */
export const deleteTeam = async (teamId) => {
  const response = await axios.delete(`${API_URL}/${teamId}`);
  return response.data;
};

/**
 * Get team members.
 */
export const getTeamMembers = async (teamId) => {
  const response = await axios.get(`${API_URL}/${teamId}/members`);
  return response.data.members || [];
};

/**
 * Add a member to a team.
 */
export const addTeamMember = async (teamId, data) => {
  const response = await axios.post(`${API_URL}/${teamId}/members`, data);
  return response.data;
};

/**
 * Remove a member from a team.
 */
export const removeTeamMember = async (teamId, userId) => {
  const response = await axios.delete(`${API_URL}/${teamId}/members/${userId}`);
  return response.data;
};

/**
 * Update a member's role.
 */
export const updateMemberRole = async (teamId, userId, role) => {
  const response = await axios.patch(`${API_URL}/${teamId}/members/${userId}/role`, { role });
  return response.data;
};

/**
 * Get team projects.
 */
export const getTeamProjects = async (teamId) => {
  const response = await axios.get(`${API_URL}/${teamId}/projects`);
  return response.data;
};

/**
 * Assign a project to a team.
 */
export const assignProjectToTeam = async (teamId, projectId) => {
  const response = await axios.post(`${API_URL}/${teamId}/projects`, { project_id: projectId });
  return response.data;
};

/**
 * Remove a project from a team.
 */
export const removeProjectFromTeam = async (teamId, projectId) => {
  const response = await axios.delete(`${API_URL}/${teamId}/projects/${projectId}`);
  return response.data;
};

/**
 * Leave a team.
 */
export const leaveTeam = async (teamId) => {
  const response = await axios.post(`${API_URL}/${teamId}/leave`);
  return response.data;
};

export default {
  getTeams,
  getTeamOptions,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  getTeamMembers,
  addTeamMember,
  removeTeamMember,
  updateMemberRole,
  getTeamProjects,
  assignProjectToTeam,
  removeProjectFromTeam,
  leaveTeam,
};
