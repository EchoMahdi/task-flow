/**
 * Team Card Component
 * 
 * Displays a team summary card.
 */

import { Link } from 'react-router-dom';
import { TEAM_ROLE_LABELS } from '../types';

const TeamCard = ({ team, currentUserRole }) => {
  return (
    <Link
      to={`/teams/${team.id}`}
      className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
          {team.avatar ? (
            <img src={team.avatar} alt={team.name} className="w-10 h-10 rounded-full" />
          ) : (
            <span className="text-blue-600 dark:text-blue-400 font-bold">
              {team.name?.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{team.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {team.member_count} member{team.member_count !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
      {team.description && (
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
          {team.description}
        </p>
      )}
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-gray-500 dark:text-gray-400">
          {team.project_count} project{team.project_count !== 1 ? 's' : ''}
        </span>
        {currentUserRole && (
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
            {TEAM_ROLE_LABELS[currentUserRole]}
          </span>
        )}
      </div>
    </Link>
  );
};

export default TeamCard;
