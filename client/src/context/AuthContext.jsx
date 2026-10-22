import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './authContext.js';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isCurrent = true;
    api.get('/api/auth/me')
      .then((res) => {
        if (isCurrent) {
          setUser(res.data?.success && res.data?.data ? res.data.data : null);
        }
      })
      .catch(() => {
        if (isCurrent) setUser(null);
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { email, password });
      if (res.data?.success) {
        setUser(res.data.data);
        return { success: true };
      }
      return { success: false, error: res.data?.error || 'Login failed' };
    } catch (err) {
      const status = err.response?.status;
      const serverMsg = err.response?.data?.error;
      if (status === 503) {
        return { success: false, error: serverMsg || 'Database unavailable — contact your administrator to whitelist the server IP in MongoDB Atlas.' };
      }
      return { success: false, error: serverMsg || err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.post('/api/auth/logout');
      setUser(null);
      navigate('/login');
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
