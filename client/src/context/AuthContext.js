import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { API_BASE } from '../config/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const refreshTimerRef = useRef(null);

  // Refresh access token using cookie
  const refreshAccessToken = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include' // Important: send the jid cookie
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      localStorage.setItem('token', data.authToken);
      setToken(data.authToken);
      return data.authToken;
    } catch (err) {
      // Session expired
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      return null;
    }
  }, []);

  // Centralized authenticated fetch with auto-refresh
  const authFetch = useCallback(async (url, options = {}) => {
    let currentToken = localStorage.getItem('token');
    
    const execute = async (tokenToUse) => {
      const headers = {
        ...options.headers,
        'Content-Type': 'application/json',
        'auth-token': tokenToUse
      };
      
      const res = await fetch(url, { ...options, headers });
      
      if (res.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          // Retry once with new token
          const retryHeaders = { ...headers, 'auth-token': newToken };
          return fetch(url, { ...options, headers: retryHeaders });
        }
      }
      return res;
    };

    return execute(currentToken);
  }, [refreshAccessToken]);

  const fetchUser = useCallback(async (authToken) => {
    try {
      const res = await authFetch(`${API_BASE}/api/auth/me`, {
        headers: { 'auth-token': authToken }
      });
      if (!res.ok) throw new Error('Unauthorized');
      const data = await res.json();
      setUser(data);
      return data;
    } catch (err) {
      setUser(null);
      return null;
    }
  }, [authFetch]);

  // Initial Check & Auto-refresh interval
  useEffect(() => {
    const initAuth = async () => {
      let currentToken = localStorage.getItem('token');
      if (!currentToken) {
        currentToken = await refreshAccessToken();
      }
      if (currentToken) {
        await fetchUser(currentToken);
      }
      setLoading(false);
    };

    initAuth();

    refreshTimerRef.current = setInterval(() => {
      if (localStorage.getItem('token')) {
        refreshAccessToken();
      }
    }, 14 * 60 * 1000);

    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    }
  }, [fetchUser, refreshAccessToken]);

  const login = async (email, password) => {
    const res = await fetch(`${API_BASE}/api/auth/userlogin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.errors?.[0]?.msg || 'Login failed');

    localStorage.setItem('token', data.authToken);
    setToken(data.authToken);
    setUser(data.user);
    return data;
  };

  const signup = async (name, email, password, cPassword) => {
    const res = await fetch(`${API_BASE}/api/auth/createuser`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, cPassword }),
      credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.errors?.[0]?.msg || 'Signup failed');

    localStorage.setItem('token', data.authToken);
    setToken(data.authToken);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (err) {}
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.success('Logged out');
  };

  const updateProfile = async (updates) => {
    const res = await authFetch(`${API_BASE}/api/auth/updateprofile`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Update failed');
    
    // Normalize user object (ensure _id is present for consistency)
    const updatedUser = data.user;
    if (updatedUser.id && !updatedUser._id) updatedUser._id = updatedUser.id;
    
    setUser(updatedUser);
    return updatedUser;
  };


  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;

