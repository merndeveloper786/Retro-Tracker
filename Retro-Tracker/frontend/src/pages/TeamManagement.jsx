import { useState, useEffect } from 'react';
import { useTeam } from '../context/TeamContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../utils/api.js';

const TeamManagement = () => {
  const { selectedTeam, updateTeam, inviteMember, removeMember, fetchTeamDetails } = useTeam();
  const { user } = useAuth();
  const [teamDetails, setTeamDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Member');
  const [newTeamName, setNewTeamName] = useState('');

  useEffect(() => {
    if (selectedTeam) {
      loadTeamDetails();
    }
  }, [selectedTeam]);

  const loadTeamDetails = async () => {
    if (!selectedTeam) return;
    setLoading(true);
    const result = await fetchTeamDetails(selectedTeam._id);
    if (result.success) {
      setTeamDetails(result.team);
      setNewTeamName(result.team.name);
    }
    setLoading(false);
  };

  const handleRenameTeam = async (e) => {
    e.preventDefault();
    if (!selectedTeam || !newTeamName.trim()) return;

    const result = await updateTeam(selectedTeam._id, newTeamName.trim());
    if (result.success) {
      setShowRenameModal(false);
      loadTeamDetails();
    } else {
      alert(result.message || 'Failed to rename team');
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    if (!selectedTeam || !newMemberEmail.trim()) return;

    const result = await inviteMember(selectedTeam._id, newMemberEmail.trim(), newMemberRole);
    if (result.success) {
      setShowInviteModal(false);
      setNewMemberEmail('');
      setNewMemberRole('Member');
      loadTeamDetails();
    } else {
      alert(result.message || 'Failed to invite member');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!selectedTeam) return;
    if (!confirm('Are you sure you want to remove this member?')) return;

    const result = await removeMember(selectedTeam._id, memberId);
    if (result.success) {
      loadTeamDetails();
    } else {
      alert(result.message || 'Failed to remove member');
    }
  };

  const isOwner = teamDetails?.members?.find(
    m => m.user?._id === user?.id && m.role === 'Owner'
  );

  if (!selectedTeam) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please select a team to manage.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Team Management</h2>
        {isOwner && (
          <div className="space-x-2">
            <button
              onClick={() => setShowRenameModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Rename Team
            </button>
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Invite Member
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{teamDetails?.name || selectedTeam.name}</h3>
        
        <div className="mb-4">
          <h4 className="text-md font-medium text-gray-700 mb-2">Team Members</h4>
          <div className="space-y-2">
            {teamDetails?.members?.map((member, index) => (
              <div
                key={member._id || `member-${index}-${member.invitedEmail}`}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-medium">
                    {member.user?.name
                      ? member.user.name
                          .split(' ')
                          .map(n => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)
                      : member.invitedEmail[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {member.user?.name || 'Pending Invitation'}
                    </p>
                    <p className="text-xs text-gray-500">{member.invitedEmail}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    member.role === 'Owner'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {member.role}
                  </span>
                  {isOwner && member.role !== 'Owner' && (
                    <button
                      onClick={() => handleRemoveMember(member._id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rename Team Modal */}
      {showRenameModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Rename Team</h3>
            <form onSubmit={handleRenameTeam}>
              <input
                type="text"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Team name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 mb-4"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowRenameModal(false);
                    setNewTeamName(teamDetails?.name || selectedTeam.name);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Invite Member</h3>
            <form onSubmit={handleInviteMember}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder="member@example.com"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                  >
                    <option value="Member">Member</option>
                    <option value="Owner">Owner</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowInviteModal(false);
                    setNewMemberEmail('');
                    setNewMemberRole('Member');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;

