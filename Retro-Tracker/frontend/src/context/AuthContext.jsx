import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api.js';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('selectedTeamId');
    setUser(null);
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          setLoading(false);
          
          // Verify token is still valid in the background (non-blocking)
          // Don't block on this - if it fails, we'll handle it gracefully
          api.get('/auth/profile')
            .then(({ data }) => {
              // Only update if we still have a user (avoid race conditions)
              if (localStorage.getItem('token')) {
                setUser(data);
                localStorage.setItem('user', JSON.stringify(data));
              }
            })
            .catch((error) => {
              // Don't logout if user just logged in (within 2 seconds)
              const justLoggedIn = localStorage.getItem('justLoggedIn');
              if (justLoggedIn) {
                console.log('Token verification skipped - user just logged in');
                return;
              }
              
              // Only logout if it's a clear auth error and we're not in the middle of login
              // Don't logout on network errors or if token was just set
              if (error.response?.status === 401 && !error.config?.url?.includes('/login')) {
                console.error('Token verification failed - logging out');
                logout();
              }
            });
        } catch (error) {
          console.error('Error parsing saved user:', error);
          logout();
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      // Set token and user immediately
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      // Set a flag to prevent immediate logout on token verification
      localStorage.setItem('justLoggedIn', 'true');
      // Clear the flag after a short delay
      setTimeout(() => {
        localStorage.removeItem('justLoggedIn');
      }, 5000); // Increased to 5 seconds to be safer
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      // Set token and user immediately
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      // Set a flag to prevent immediate logout on token verification
      localStorage.setItem('justLoggedIn', 'true');
      // Clear the flag after a short delay
      setTimeout(() => {
        localStorage.removeItem('justLoggedIn');
      }, 5000); // Increased to 5 seconds to be safer
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

