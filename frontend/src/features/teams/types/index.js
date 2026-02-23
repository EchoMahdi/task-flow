/**
 * Team Types
 * 
 * Type definitions for the Team feature module.
 */

/**
 * @typedef {Object} TeamMember
 * @property {number} id
 * @property {string} name
 * @property {string} email
 * @property {string} avatar
 * @property {string} role - 'owner' | 'admin' | 'member'
 */

/**
 * @typedef {Object} Team
 * @property {number} id
 * @property {string} name
 * @property {string|null} description
 * @property {string|null} avatar
 * @property {number} owner_id
 * @property {Object} owner
 * @property {TeamMember[]} members
 * @property {number} member_count
 * @property {number} project_count
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} TeamProject
 * @property {number} id
 * @property {number} user_id
 * @property {number|null} team_id
 * @property {string} name
 * @property {string} color
 * @property {string} icon
 * @property {boolean} is_favorite
 * @property {number|null} parent_id
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} TeamFormData
 * @property {string} name
 * @property {string} [description]
 * @property {string} [avatar]
 */

/**
 * @typedef {Object} TeamMemberFormData
 * @property {number} user_id
 * @property {string} [role] - 'admin' | 'member'
 */

/**
 * @typedef {Object} TeamRoleUpdateData
 * @property {string} role - 'admin' | 'member'
 */

/**
 * @typedef {Object} TeamProjectAssignData
 * @property {number} project_id
 */

/**
 * @typedef {Object} TeamOption
 * @property {number} id
 * @property {string} name
 * @property {string} role
 */

export const TEAM_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
};

export const TEAM_ROLE_LABELS = {
  [TEAM_ROLES.OWNER]: 'Owner',
  [TEAM_ROLES.ADMIN]: 'Admin',
  [TEAM_ROLES.MEMBER]: 'Member',
};

export default {};
