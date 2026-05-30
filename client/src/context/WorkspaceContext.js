import React, { createContext, useContext, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { API_BASE } from '../config/api';

const WorkspaceContext = createContext();

export function WorkspaceProvider({ children }) {
  const { token } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(() => {
    const saved = localStorage.getItem('activeWorkspaceId');
    return saved || null;
  });
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(false);

  const authHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    'auth-token': token
  }), [token]);

  const fetchWorkspaces = useCallback(async () => {
    if (!token) return;
    setLoadingWorkspaces(true);
    try {
      const res = await fetch(`${API_BASE}/api/workspaces`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setWorkspaces(data);
      // Auto-select first workspace if none selected
      if (data.length > 0 && !activeWorkspace) {
        const id = data[0]._id;
        setActiveWorkspace(id);
        localStorage.setItem('activeWorkspaceId', id);
      }
      return data;
    } catch (err) {
      console.error('fetchWorkspaces:', err);
    } finally {
      setLoadingWorkspaces(false);
    }
  }, [token, authHeaders, activeWorkspace]);

  const createWorkspace = useCallback(async (name, icon = '🏠', description = '') => {
    const res = await fetch(`${API_BASE}/api/workspaces`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ name, icon, description })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    const { workspace } = data;
    setWorkspaces(prev => [workspace, ...prev]);
    setActiveWorkspace(workspace._id);
    localStorage.setItem('activeWorkspaceId', workspace._id);
    toast.success(`Workspace "${name}" created!`);
    return data;
  }, [authHeaders]);

  const updateWorkspace = useCallback(async (id, updates) => {
    const res = await fetch(`${API_BASE}/api/workspaces/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setWorkspaces(prev => prev.map(w => w._id === id ? data : w));
    toast.success('Workspace updated');
    return data;
  }, [authHeaders]);

  const deleteWorkspace = useCallback(async (id) => {
    const res = await fetch(`${API_BASE}/api/workspaces/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    const remaining = workspaces.filter(w => w._id !== id);
    setWorkspaces(remaining);
    if (activeWorkspace === id) {
      const next = remaining[0]?._id || null;
      setActiveWorkspace(next);
      if (next) localStorage.setItem('activeWorkspaceId', next);
      else localStorage.removeItem('activeWorkspaceId');
    }
    toast.success('Workspace deleted');
  }, [authHeaders, workspaces, activeWorkspace]);

  const switchWorkspace = useCallback((id) => {
    setActiveWorkspace(id);
    localStorage.setItem('activeWorkspaceId', id);
  }, []);

  const activeWorkspaceData = workspaces.find(w => w._id === activeWorkspace) || null;

  return (
    <WorkspaceContext.Provider value={{
      workspaces, activeWorkspace, activeWorkspaceData, loadingWorkspaces,
      fetchWorkspaces, createWorkspace, updateWorkspace, deleteWorkspace, switchWorkspace
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  return useContext(WorkspaceContext);
}

export default WorkspaceContext;
