/**
 * Team Project List Component
 * 
 * Displays a list of projects belonging to a team.
 */

import { Link } from 'react-router-dom';

const TeamProjectList = ({ projects, canManage, onRemove }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <Link
          key={project.id}
          to={`/projects/${project.id}`}
          className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center space-x-3">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: project.color || '#3B82F6' }}
            />
            <h3 className="font-semibold text-gray-900 dark:text-white">{project.name}</h3>
          </div>
          {project.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
              {project.description}
            </p>
          )}
        </Link>
      ))}
    </div>
  );
};

export default TeamProjectList;
