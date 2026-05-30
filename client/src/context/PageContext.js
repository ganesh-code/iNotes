import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { API_BASE } from '../config/api';

const PageContext = createContext();

export function PageProvider({ children }) {
  const { token } = useAuth();
  const [pages, setPages] = useState([]);
  const [activePage, setActivePage] = useState(null);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(null);
  const [loadingPages, setLoadingPages] = useState(false);
  const [saving, setSaving] = useState(false);
  const saveTimerRef = useRef(null);

  const authHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    'auth-token': token
  }), [token]);

  // Fetch all pages for a workspace (sidebar)
  const fetchPages = useCallback(async (workspaceId) => {
    if (!token || !workspaceId) return;
    setLoadingPages(true);
    setActiveWorkspaceId(workspaceId);
    setPages([]);          // immediately clear stale pages from previous workspace
    try {
      const res = await fetch(`${API_BASE}/api/pages/workspace/${workspaceId}`, {
        headers: authHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPages(data);
      return data;
    } catch (err) {
      console.error('fetchPages:', err.message);
    } finally {
      setLoadingPages(false);
    }
  }, [token, authHeaders]);


  // Fetch single page (full content)
  const fetchPage = useCallback(async (pageId) => {
    if (!token || !pageId) return;
    try {
      const res = await fetch(`${API_BASE}/api/pages/${pageId}`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setActivePage(data);
      return data;
    } catch (err) {
      console.error('fetchPage:', err.message);
      toast.error('Failed to load page');
    }
  }, [token, authHeaders]);

  // Create page
  const createPage = useCallback(async (workspaceId, parentId = null, title = 'Untitled') => {
    try {
      const res = await fetch(`${API_BASE}/api/pages`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ workspaceId, parentId, title })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPages(prev => [...prev, data]);
      setActivePage(data);
      return data;
    } catch (err) {
      toast.error(err.message || 'Failed to create page');
    }
  }, [authHeaders]);

  // Update page (debounced autosave)
  const updatePage = useCallback(async (pageId, updates, silent = false) => {
    if (!silent) setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/pages/${pageId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setPages(prev => prev.map(p =>
        p._id === pageId ? { ...p, ...updates, title: data.title, icon: data.icon } : p
      ));

      if (activePage?._id === pageId) {
        setActivePage(prev => ({ ...prev, ...data }));
      }
      return data;
    } catch (err) {
      if (!silent) toast.error('Failed to save: ' + err.message);
    } finally {
      if (!silent) setSaving(false);
    }
  }, [authHeaders, activePage]);

  // Autosave with debounce
  const scheduleAutosave = useCallback((pageId, updates) => {
    setSaving(true);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      await updatePage(pageId, updates, true);
      setSaving(false);
    }, 1200);
  }, [updatePage]);

  // Star/unstar
  const toggleStar = useCallback(async (pageId) => {
    const page = pages.find(p => p._id === pageId);
    if (!page) return;
    const newStarred = !page.isStarred;
    await updatePage(pageId, { isStarred: newStarred }, true);
    toast.success(newStarred ? 'Added to favorites' : 'Removed from favorites');
  }, [pages, updatePage]);

  // Trash page — remove from sidebar, optionally navigate away if currently on this page
  const trashPage = useCallback(async (pageId, navigateFn = null) => {
    try {
      const res = await fetch(`${API_BASE}/api/pages/${pageId}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPages(prev => prev.filter(p => p._id !== pageId && p.parent !== pageId));
      if (activePage?._id === pageId) {
        setActivePage(null);
        // Auto-navigate to home if deleting the currently-open page
        if (navigateFn) navigateFn('/');
      }
      toast.success('Moved to trash');
    } catch (err) {
      toast.error(err.message || 'Failed to trash page');
    }
  }, [authHeaders, activePage]);

  // Restore from trash
  const restorePage = useCallback(async (pageId) => {
    try {
      const res = await fetch(`${API_BASE}/api/pages/${pageId}/restore`, {
        method: 'PUT',
        headers: authHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Page restored');
      return data;
    } catch (err) {
      toast.error(err.message || 'Failed to restore page');
    }
  }, [authHeaders]);

  // Search
  const searchPages = useCallback(async (workspaceId, query) => {
    if (!query.trim()) return [];
    try {
      const res = await fetch(`${API_BASE}/api/pages/search/${workspaceId}?q=${encodeURIComponent(query)}`, {
        headers: authHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    } catch (err) {
      return [];
    }
  }, [authHeaders]);

  // Build page tree from flat array
  const buildTree = useCallback((flatPages) => {
    const map = {};
    const roots = [];
    flatPages.forEach(p => { map[p._id] = { ...p, children: [] }; });
    flatPages.forEach(p => {
      if (p.parent && map[p.parent]) {
        map[p.parent].children.push(map[p._id]);
      } else {
        roots.push(map[p._id]);
      }
    });
    return roots;
  }, []);

  const pageTree = buildTree(pages);
  const starredPages = pages.filter(p => p.isStarred);

  return (
    <PageContext.Provider value={{
      pages, pageTree, activePage, starredPages, loadingPages, saving,
      activeWorkspaceId,
      fetchPages, fetchPage, createPage, updatePage, scheduleAutosave,
      toggleStar, trashPage, restorePage, searchPages,
      setActivePage
    }}>
      {children}
    </PageContext.Provider>
  );
}

export function usePage() {
  return useContext(PageContext);
}

export default PageContext;
