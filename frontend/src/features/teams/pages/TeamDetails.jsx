/**
 * Team Details Page
 * 
 * Shows team information, members, and projects.
 */

import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import useTeamStore from '../store/teamStore';
import { TEAM_ROLE_LABELS } from '../types';

const TeamDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    currentTeam,
    teamMembers,
    teamProjects,
    isLoading,
    error,
    fetchTeam,
    fetchTeamMembers,
    fetchTeamProjects,
    removeTeamMember,
    leaveTeam,
    clearCurrentTeam,
    clearError,
  } = useTeamStore();

  const [activeTab, setActiveTab] = useState('projects');
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  useEffect(() => {
    fetchTeam(id);
    fetchTeamMembers(id);
    fetchTeamProjects(id);

    return () => {
      clearCurrentTeam();
    };
  }, [id, fetchTeam, fetchTeamMembers, fetchTeamProjects, clearCurrentTeam]);

  const handleLeaveTeam = async () => {
    try {
      await leaveTeam(id);
      navigate('/teams');
    } catch (err) {
      console.error('Failed to leave team:', err);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      try {
        await removeTeamMember(id, userId);
      } catch (err) {
        console.error('Failed to remove member:', err);
      }
    }
  };

  const isAdmin = currentTeam?.members?.some(
    (m) => m.pivot?.role === 'owner' || m.pivot?.role === 'admin'
  );

  if (isLoading && !currentTeam) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!currentTeam) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">Team not found</p>
        <Link to="/teams" className="text-blue-500 hover:text-blue-600 mt-2 inline-block">
          Back to Teams
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={clearError} className="text-red-500 hover:text-red-700">
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link to="/teams" className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
            ← Back
          </Link>
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            {currentTeam.avatar ? (
              <img src={currentTeam.avatar} alt={currentTeam.name} className="w-16 h-16 rounded-full" />
            ) : (
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {currentTeam.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{currentTeam.name}</h1>
            {currentTeam.description && (
              <p className="text-gray-600 dark:text-gray-300">{currentTeam.description}</p>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          {isAdmin && (
            <Link
              to={`/teams/${id}/settings`}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Settings
            </Link>
          )}
          <button
            onClick={() => setShowLeaveConfirm(true)}
            className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
          >
            Leave Team
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('projects')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'projects'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Projects ({teamProjects.length})
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'members'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Members ({teamMembers.length})
          </button>
        </nav>
      </div>

      {/* Projects Tab */}
      {activeTab === 'projects' && (
        <div>
          {teamProjects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No projects yet</p>
              {isAdmin && (
                <Link
                  to="/projects"
                  className="text-blue-500 hover:text-blue-600 mt-2 inline-block"
                >
                  Add a project to this team
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamProjects.map((project) => (
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
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div>
          {teamMembers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No members yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {teamMembers.map((member) => (
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
                          {member.name.charAt(0).toUpperCase()}
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
                    {isAdmin && member.pivot?.role !== 'owner' && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Leave Team Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Leave Team</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to leave this team? You will lose access to all team projects.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleLeaveTeam}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Leave Team
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamDetails;
