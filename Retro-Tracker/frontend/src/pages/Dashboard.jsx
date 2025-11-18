import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeam } from '../context/TeamContext.jsx';
import api from '../utils/api.js';

const Dashboard = () => {
  const { selectedTeam } = useTeam();
  const navigate = useNavigate();
  const [retros, setRetros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRetro, setNewRetro] = useState({
    name: '',
    sprintNumber: '',
    dateRange: { start: '', end: '' },
  });

  useEffect(() => {
    if (selectedTeam) {
      fetchRetros();
    }
  }, [selectedTeam]);

  const fetchRetros = async () => {
    if (!selectedTeam) return;
    
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (dateFilter.start) params.startDate = dateFilter.start;
      if (dateFilter.end) params.endDate = dateFilter.end;
      
      const { data } = await api.get(`/retros/teams/${selectedTeam._id}`, { params });
      setRetros(data.retros);
    } catch (error) {
      console.error('Failed to fetch retros:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (selectedTeam) {
        fetchRetros();
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [search, dateFilter]);

  const handleCreateRetro = async (e) => {
    e.preventDefault();
    if (!selectedTeam) return;

    try {
      const payload = {
        name: newRetro.name,
        sprintNumber: newRetro.sprintNumber || undefined,
        dateRange: newRetro.dateRange.start || newRetro.dateRange.end
          ? {
              start: newRetro.dateRange.start || undefined,
              end: newRetro.dateRange.end || undefined,
            }
          : undefined,
      };

      const { data } = await api.post(`/retros/teams/${selectedTeam._id}`, payload);
      setShowCreateModal(false);
      setNewRetro({ name: '', sprintNumber: '', dateRange: { start: '', end: '' } });
      navigate(`/retros/${data.retro._id}`);
    } catch (error) {
      console.error('Failed to create retro:', error);
      alert(error.response?.data?.message || 'Failed to create retro');
    }
  };

  if (!selectedTeam) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please select or create a team to get started.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Retrospectives</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create Retro
        </button>
      </div>

      <div className="mb-4 space-y-4">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Search retros..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="flex gap-2">
            <input
              type="date"
              placeholder="Start date"
              value={dateFilter.start}
              onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="date"
              placeholder="End date"
              value={dateFilter.end}
              onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {(dateFilter.start || dateFilter.end) && (
              <button
                onClick={() => setDateFilter({ start: '', end: '' })}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : retros.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No retros found. Create your first retro to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {retros.map((retro) => (
            <div
              key={retro._id}
              onClick={() => navigate(`/retros/${retro._id}`)}
              className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{retro.name}</h3>
              {retro.sprintNumber && (
                <p className="text-sm text-gray-600 mb-1">Sprint: {retro.sprintNumber}</p>
              )}
              <p className="text-xs text-gray-500">
                Created: {new Date(retro.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Create Retro Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create New Retro</h3>
            <form onSubmit={handleCreateRetro}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Retro Name *
                  </label>
                  <input
                    type="text"
                    value={newRetro.name}
                    onChange={(e) => setNewRetro({ ...newRetro, name: e.target.value })}
                    placeholder="e.g., Sprint 23 Retrospective"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sprint Number
                  </label>
                  <input
                    type="text"
                    value={newRetro.sprintNumber}
                    onChange={(e) => setNewRetro({ ...newRetro, sprintNumber: e.target.value })}
                    placeholder="e.g., 23"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={newRetro.dateRange.start}
                      onChange={(e) =>
                        setNewRetro({
                          ...newRetro,
                          dateRange: { ...newRetro.dateRange, start: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="date"
                      value={newRetro.dateRange.end}
                      onChange={(e) =>
                        setNewRetro({
                          ...newRetro,
                          dateRange: { ...newRetro.dateRange, end: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewRetro({ name: '', sprintNumber: '', dateRange: { start: '', end: '' } });
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

export default Dashboard;

