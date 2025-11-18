import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api.js';
import { useAuth } from './AuthContext.jsx';

const TeamContext = createContext(null);

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeam must be used within TeamProvider');
  }
  return context;
};

export const TeamProvider = ({ children }) => {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTeams();
    }
  }, [user]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/teams');
      // Backend already filters and auto-links invitations, so we can use all returned teams
      const teams = data.teams || [];
      
      setTeams(teams);
      
      // Restore selected team from localStorage or select first team
      const savedTeamId = localStorage.getItem('selectedTeamId');
      if (savedTeamId && teams.find(t => t._id === savedTeamId)) {
        setSelectedTeam(teams.find(t => t._id === savedTeamId));
      } else if (teams.length > 0) {
        setSelectedTeam(teams[0]);
        localStorage.setItem('selectedTeamId', teams[0]._id);
      } else {
        setSelectedTeam(null);
      }
    } catch (error) {
      console.error('Failed to fetch teams:', error);
      // Don't clear teams on error - just log it
      // The API interceptor will handle 401 errors
      if (error.response?.status === 401) {
        // This will be handled by the API interceptor
        console.error('Unauthorized - token may be invalid');
      }
    } finally {
      setLoading(false);
    }
  };

  const selectTeam = (team) => {
    setSelectedTeam(team);
    localStorage.setItem('selectedTeamId', team._id);
  };

  const createTeam = async (name) => {
    try {
      // Verify token exists before making request
      const token = localStorage.getItem('token');
      if (!token) {
        return {
          success: false,
          message: 'You are not logged in. Please log in again.',
        };
      }

      const { data } = await api.post('/teams', { name });
      setTeams([...teams, data.team]);
      setSelectedTeam(data.team);
      localStorage.setItem('selectedTeamId', data.team._id);
      return { success: true, team: data.team };
    } catch (error) {
      // Log the error for debugging
      console.error('Team creation error:', error);
      console.error('Error details:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        token: localStorage.getItem('token') ? 'exists' : 'missing',
      });
      
      // If it's a 401, it might be a token issue
      if (error.response?.status === 401) {
        const errorMessage = error.response?.data?.message || 'Authentication failed';
        
        // If token is invalid, suggest re-login
        if (errorMessage.includes('Invalid token') || errorMessage.includes('token')) {
          return {
            success: false,
            message: 'Your session has expired. Please log in again.',
          };
        }
        
        return {
          success: false,
          message: errorMessage,
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create team',
      };
    }
  };

  const refreshTeams = () => {
    fetchTeams();
  };

  const updateTeam = async (teamId, name) => {
    try {
      const { data } = await api.put(`/teams/${teamId}`, { name });
      setTeams(teams.map(t => t._id === teamId ? data.team : t));
      if (selectedTeam?._id === teamId) {
        setSelectedTeam(data.team);
      }
      return { success: true, team: data.team };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update team',
      };
    }
  };

  const inviteMember = async (teamId, email, role = 'Member') => {
    try {
      const { data } = await api.post(`/teams/${teamId}/members`, { email, role });
      setTeams(teams.map(t => t._id === teamId ? data.team : t));
      if (selectedTeam?._id === teamId) {
        setSelectedTeam(data.team);
      }
      return { success: true, team: data.team };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to invite member',
      };
    }
  };

  const removeMember = async (teamId, memberId) => {
    try {
      const { data } = await api.delete(`/teams/${teamId}/members/${memberId}`);
      setTeams(teams.map(t => t._id === teamId ? data.team : t));
      if (selectedTeam?._id === teamId) {
        setSelectedTeam(data.team);
      }
      return { success: true, team: data.team };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to remove member',
      };
    }
  };

  const fetchTeamDetails = async (teamId) => {
    try {
      const { data } = await api.get(`/teams/${teamId}`);
      return { success: true, team: data.team };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch team details',
      };
    }
  };

  return (
    <TeamContext.Provider
      value={{
        teams,
        selectedTeam,
        selectTeam,
        createTeam,
        updateTeam,
        inviteMember,
        removeMember,
        fetchTeamDetails,
        refreshTeams,
        loading,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
};

