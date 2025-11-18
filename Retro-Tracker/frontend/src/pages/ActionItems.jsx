import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTeam } from '../context/TeamContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../utils/api.js';

const ActionItems = () => {
  const { selectedTeam } = useTeam();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [actionItems, setActionItems] = useState([]);
  const [retros, setRetros] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    retroId: searchParams.get('retroId') || '',
    search: searchParams.get('search') || '',
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newActionItem, setNewActionItem] = useState({
    title: '',
    description: '',
    status: 'Open',
    assignedTo: '',
    sourceCardIds: [],
  });

  useEffect(() => {
    if (selectedTeam) {
      fetchActionItems();
      fetchRetros();
      fetchTeamMembers();
    }
  }, [selectedTeam, filters]);

  const fetchTeamMembers = async () => {
    if (!selectedTeam) return;
    try {
      const { data } = await api.get(`/teams/${selectedTeam._id}`);
      setTeamMembers(data.team.members || []);
    } catch (error) {
      console.error('Failed to fetch team members:', error);
    }
  };

  useEffect(() => {
    const cardId = searchParams.get('cardId');
    const retroId = searchParams.get('retroId');
    if (cardId && retroId) {
      setNewActionItem((prev) => ({
        ...prev,
        sourceCardIds: [cardId],
      }));
      setFilters((prev) => ({ ...prev, retroId }));
      setShowCreateModal(true);
      // Clear URL params after reading
      navigate('/action-items', { replace: true });
    }
  }, [searchParams, navigate]);

  const fetchActionItems = async () => {
    if (!selectedTeam) return;

    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.retroId) params.retroId = filters.retroId;
      if (filters.search) params.search = filters.search;

      const { data } = await api.get(`/action-items/teams/${selectedTeam._id}`, { params });
      setActionItems(data.actionItems);
    } catch (error) {
      console.error('Failed to fetch action items:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRetros = async () => {
    if (!selectedTeam) return;

    try {
      const { data } = await api.get(`/retros/teams/${selectedTeam._id}`);
      setRetros(data.retros);
    } catch (error) {
      console.error('Failed to fetch retros:', error);
    }
  };

  const handleCreateActionItem = async (e) => {
    e.preventDefault();
    if (!selectedTeam) return;

    try {
      // Use the retroId from filters if available, otherwise use first retro
      const retroId = filters.retroId || retros[0]?._id;

      if (!retroId) {
        alert('Please create a retro first');
        return;
      }

      const payload = {
        title: newActionItem.title,
        description: newActionItem.description,
        sourceCardIds: newActionItem.sourceCardIds,
        assignedTo: newActionItem.assignedTo || undefined,
      };

      const { data } = await api.post(`/action-items/retros/${retroId}`, payload);
      setShowCreateModal(false);
      setNewActionItem({
        title: '',
        description: '',
        status: 'Open',
        assignedTo: '',
        sourceCardIds: [],
      });
      fetchActionItems();
      navigate('/action-items');
    } catch (error) {
      console.error('Failed to create action item:', error);
      alert(error.response?.data?.message || 'Failed to create action item');
    }
  };

  const handleUpdateStatus = async (actionItemId, newStatus) => {
    try {
      await api.put(`/action-items/${actionItemId}`, { status: newStatus });
      fetchActionItems();
    } catch (error) {
      console.error('Failed to update action item:', error);
      alert(error.response?.data?.message || 'Failed to update action item');
    }
  };

  const handleUpdateAssignment = async (actionItemId, assignedTo) => {
    try {
      await api.put(`/action-items/${actionItemId}`, { assignedTo: assignedTo || null });
      fetchActionItems();
    } catch (error) {
      console.error('Failed to update assignment:', error);
      alert(error.response?.data?.message || 'Failed to update assignment');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open':
        return 'bg-gray-200 text-gray-800';
      case 'In Progress':
        return 'bg-blue-200 text-blue-800';
      case 'Done':
        return 'bg-green-200 text-green-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  if (!selectedTeam) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please select or create a team to view action items.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Action Items</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create Action Item
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Retro</label>
            <select
              value={filters.retroId}
              onChange={(e) => setFilters({ ...filters, retroId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
            >
              <option value="">All Retros</option>
              {retros.map((retro) => (
                <option key={retro._id} value={retro._id}>
                  {retro.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search by title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : actionItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No action items found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {actionItems.map((item) => (
            <div key={item._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                  {item.description && (
                    <p className="text-gray-600 mb-2">{item.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                    <span>From: {item.retro?.name || 'Unknown Retro'}</span>
                    <span>• Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-2">
                    <label className="text-xs text-gray-500">Assigned to:</label>
                    <select
                      value={item.assignedTo?._id || ''}
                      onChange={(e) => handleUpdateAssignment(item._id, e.target.value)}
                      className="mt-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                    >
                      <option value="">Unassigned</option>
                      {teamMembers
                        .filter(m => m.user)
                        .map((member) => (
                          <option key={member.user._id} value={member.user._id}>
                            {member.user.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={item.status}
                    onChange={(e) => handleUpdateStatus(item._id, e.target.value)}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${getStatusColor(item.status)} border-0 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
              </div>
              {item.sourceCards && item.sourceCards.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Source Cards:</p>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {item.sourceCards.map((card, idx) => (
                      <li key={idx}>{card.content}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Action Item Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create Action Item</h3>
            <form onSubmit={handleCreateActionItem}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newActionItem.title}
                    onChange={(e) =>
                      setNewActionItem({ ...newActionItem, title: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newActionItem.description}
                    onChange={(e) =>
                      setNewActionItem({ ...newActionItem, description: e.target.value })
                    }
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign To
                  </label>
                  <select
                    value={newActionItem.assignedTo}
                    onChange={(e) =>
                      setNewActionItem({ ...newActionItem, assignedTo: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                  >
                    <option value="">Unassigned</option>
                    {teamMembers
                      .filter(m => m.user) // Only show members with user accounts
                      .map((member) => (
                        <option key={member.user._id} value={member.user._id}>
                          {member.user.name} ({member.role})
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewActionItem({
                      title: '',
                      description: '',
                      status: 'Open',
                      assignedTo: '',
                      sourceCardIds: [],
                    });
                    navigate('/action-items');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionItems;

