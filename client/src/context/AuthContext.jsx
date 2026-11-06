import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './authContext.js';

const DEMO_USERS = [
  {
    email: 'admin@greenh2.local',
    password: '2024',
    id: 'demo-admin-01',
    name: 'System Administrator',
    role: 'ADMIN',
  },
  {
    email: 'operator@greenh2.com',
    password: '2024',
    id: 'demo-operator-01',
    name: 'Lead Plant Operator',
    role: 'OPERATOR',
  },
  {
    email: 'viewer@greenh2.com',
    password: '2024',
    id: 'demo-viewer-01',
    name: 'Energy Systems Analyst',
    role: 'VIEWER',
  },
];

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
      .catch((err) => {
        if (isCurrent) {
          if (err.response?.status === 401) {
            localStorage.removeItem('token');
          }
          setUser(null);
        }
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
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
        }
        setUser(res.data.data);
        return { success: true };
      }
      return { success: false, error: res.data?.error || 'Login failed' };
    } catch (err) {
      const status = err.response?.status;
      const serverMsg = err.response?.data?.error;
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedPassword = password.trim();
      const demoUser = DEMO_USERS.find(
        (account) => account.email === normalizedEmail && account.password === normalizedPassword,
      );

      if (demoUser && (status === 503 || !err.response)) {
        setUser({
          id: demoUser.id,
          name: demoUser.name,
          email: demoUser.email,
          role: demoUser.role,
          demoMode: true,
        });
        return { success: true, demoMode: true };
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
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
