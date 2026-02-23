/**
 * Projects Feature - Types
 * 
 * Type definitions for the projects feature.
 * 
 * @module features/projects/types
 */

/**
 * Project status enum
 */
export const ProjectStatus = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  COMPLETED: 'completed',
  ON_HOLD: 'on_hold',
};

/**
 * Project type definition
 * @typedef {Object} Project
 * @property {number|string} id - Project ID
 * @property {string} name - Project name
 * @property {string} description - Project description
 * @property {string} color - Project color
 * @property {string} icon - Project icon
 * @property {ProjectStatus} status - Project status
 * @property {string} startDate - Start date
 * @property {string} endDate - End date
 * @property {number|string} ownerId - Owner ID
 * @property {Object} owner - Owner object
 * @property {number} taskCount - Number of tasks
 * @property {number} completedTaskCount - Number of completed tasks
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Update timestamp
 */

/**
 * Project filter type
 * @typedef {Object} ProjectFilter
 * @property {string} search - Search query
 * @property {ProjectStatus[]} statuses - Filter by statuses
 */

/**
 * Create default project filter
 * @returns {ProjectFilter}
 */
export const createDefaultProjectFilter = () => ({
  search: '',
  statuses: [],
});

export default {
  ProjectStatus,
  createDefaultProjectFilter,
};
