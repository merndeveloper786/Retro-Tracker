import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTeam } from '../context/TeamContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../utils/api.js';

const COLUMNS = ['Went Well', 'Needs Improvement', 'Kudos'];

const RetroBoard = () => {
  const { retroId } = useParams();
  const navigate = useNavigate();
  const { selectedTeam } = useTeam();
  const { user } = useAuth();
  const [retro, setRetro] = useState(null);
  const [board, setBoard] = useState({
    'Went Well': [],
    'Needs Improvement': [],
    'Kudos': [],
  });
  const [loading, setLoading] = useState(true);
  const [showDeleted, setShowDeleted] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [newCard, setNewCard] = useState({ column: '', content: '' });
  const [showAddCard, setShowAddCard] = useState({});

  useEffect(() => {
    fetchBoard();
  }, [retroId, showDeleted]);

  const fetchBoard = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/retros/${retroId}/board`, {
        params: { showDeleted: showDeleted.toString() },
      });
      setRetro(data.retro);
      setBoard(data.board);
    } catch (error) {
      console.error('Failed to fetch board:', error);
      alert('Failed to load retro board');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = async (column) => {
    if (!newCard.content.trim()) return;

    try {
      const { data } = await api.post(`/retros/${retroId}/cards`, {
        content: newCard.content,
        column,
      });
      setBoard((prev) => ({
        ...prev,
        [column]: [...prev[column], data.card],
      }));
      setNewCard({ column: '', content: '' });
      setShowAddCard({});
    } catch (error) {
      console.error('Failed to create card:', error);
      alert(error.response?.data?.message || 'Failed to create card');
    }
  };

  const handleUpdateCard = async (cardId, content) => {
    try {
      const { data } = await api.put(`/retros/${retroId}/cards/${cardId}`, {
        content,
      });
      setBoard((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((col) => {
          updated[col] = updated[col].map((c) =>
            c._id === cardId ? data.card : c
          );
        });
        return updated;
      });
      setEditingCard(null);
    } catch (error) {
      console.error('Failed to update card:', error);
      alert(error.response?.data?.message || 'Failed to update card');
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!confirm('Are you sure you want to delete this card?')) return;

    try {
      await api.delete(`/retros/${retroId}/cards/${cardId}`);
      setBoard((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((col) => {
          updated[col] = updated[col].filter((c) => c._id !== cardId);
        });
        return updated;
      });
    } catch (error) {
      console.error('Failed to delete card:', error);
      alert(error.response?.data?.message || 'Failed to delete card');
    }
  };

  const handleCreateActionItem = (card) => {
    navigate(`/action-items/create?cardId=${card._id}&retroId=${retroId}`);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (!retro) {
    return <div>Retro not found</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-blue-600 hover:text-blue-700 mb-4"
        >
          ← Back to Dashboard
        </button>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{retro.name}</h2>
            {retro.sprintNumber && (
              <p className="text-sm text-gray-600">Sprint: {retro.sprintNumber}</p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showDeleted}
                onChange={(e) => setShowDeleted(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Show deleted</span>
            </label>
            <button
              onClick={() => navigate('/action-items')}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              View Action Items
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map((column) => (
          <div key={column} className="bg-gray-100 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{column}</h3>

            <div className="space-y-3 mb-4">
              {board[column]?.map((card) => (
                <div
                  key={card._id}
                  className={`bg-white rounded-md p-3 shadow ${
                    card.isDeleted ? 'opacity-50' : ''
                  }`}
                >
                  {editingCard === card._id ? (
                    <div>
                      <textarea
                        defaultValue={card.content}
                        onBlur={(e) => {
                          if (e.target.value.trim() && e.target.value !== card.content) {
                            handleUpdateCard(card._id, e.target.value);
                          } else {
                            setEditingCard(null);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.ctrlKey) {
                            e.target.blur();
                          }
                          if (e.key === 'Escape') {
                            setEditingCard(null);
                          }
                        }}
                        autoFocus
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-blue-500"
                      />
                    </div>
                  ) : (
                    <>
                      {card.isDeleted && (
                        <span className="text-xs text-red-600">(deleted)</span>
                      )}
                      <p className="text-gray-800 mb-2">{card.content}</p>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>
                          {card.author?.name || 'Unknown'} •{' '}
                          {new Date(card.createdAt).toLocaleDateString()}
                        </span>
                        {!card.isDeleted && card.author?._id === user?.id && (
                          <div className="space-x-2">
                            <button
                              onClick={() => setEditingCard(card._id)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteCard(card._id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                      {column === 'Needs Improvement' && !card.isDeleted && (
                        <button
                          onClick={() => handleCreateActionItem(card)}
                          className="mt-2 text-xs text-green-600 hover:text-green-700"
                        >
                          → Create Action Item
                        </button>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>

            {showAddCard[column] ? (
              <div className="bg-white rounded-md p-3 shadow">
                <textarea
                  value={newCard.column === column ? newCard.content : ''}
                  onChange={(e) =>
                    setNewCard({ column, content: e.target.value })
                  }
                  placeholder="Add a card..."
                  className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-blue-500 mb-2"
                  rows="3"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setShowAddCard({ ...showAddCard, [column]: false });
                      setNewCard({ column: '', content: '' });
                    }}
                    className="text-sm text-gray-600 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleAddCard(column)}
                    disabled={!newCard.content.trim()}
                    className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddCard({ ...showAddCard, [column]: true })}
                className="w-full py-2 text-sm text-gray-600 border-2 border-dashed border-gray-300 rounded-md hover:border-gray-400 hover:text-gray-700"
              >
                + Add Card
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RetroBoard;

