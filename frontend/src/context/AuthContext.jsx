import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('hostel_token') || null);
  const [loading, setLoading] = useState(true);

  // Check user validity on mount or token change
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          logout();
        }
      } catch (err) {
        console.error('Failed to verify token:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (email, password, role) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Login failed.');
    }

    localStorage.setItem('hostel_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Registration failed.');
    }

    localStorage.setItem('hostel_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('hostel_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, API_BASE }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
