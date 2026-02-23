/**
 * Team Member List Component
 * 
 * Displays a list of team members with actions.
 */

import { TEAM_ROLE_LABELS } from '../types';

const TeamMemberList = ({ members, currentUserRole, onRemove, onRoleChange }) => {
  const canManage = currentUserRole === 'owner' || currentUserRole === 'admin';

  return (
    <div className="space-y-4">
      {members.map((member) => (
        <div
          key={member.id}
          className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              {member.avatar ? (
                <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full" />
              ) : (
                <span className="text-gray-600 dark:text-gray-300 font-medium">
                  {member.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{member.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{member.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">
              {TEAM_ROLE_LABELS[member.pivot?.role] || 'Member'}
            </span>
            {canManage && member.pivot?.role !== 'owner' && (
              <button
                onClick={() => onRemove?.(member.id)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TeamMemberList;
