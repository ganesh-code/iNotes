import React, { useState, useEffect, useCallback } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { usePage } from '../../context/PageContext';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { API_BASE } from '../../config/api';

export default function TrashPage() {
  const { activeWorkspace } = useWorkspace();
  const { restorePage, fetchPages } = usePage();
  const { token } = useAuth();
  const location = useLocation();
  const [trashedPages, setTrashedPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch trash
  const fetchTrash = useCallback(async () => {
    if (!activeWorkspace || !token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/pages/workspace/${activeWorkspace}/trash`, {
        headers: { 'auth-token': token }
      });
      if (res.status === 401) return; // AuthContext will handle refresh
      const data = await res.json();
      setTrashedPages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('fetchTrash error:', err);
      setTrashedPages([]);
    } finally {
      setLoading(false);
    }
  }, [activeWorkspace, token]);

  // Re-fetch whenever we navigate to this page OR workspace/token changes
  useEffect(() => {
    fetchTrash();
  }, [fetchTrash, location.key, token]);

  const handleRestore = async (pageId) => {
    try {
      await restorePage(pageId);
      setTrashedPages(prev => prev.filter(p => p._id !== pageId));
      if (activeWorkspace) fetchPages(activeWorkspace);
      toast.success('Page restored!');
    } catch (err) {
      toast.error('Failed to restore page');
    }
  };

  const handlePermanentDelete = async (pageId) => {
    if (!window.confirm('Permanently delete this page? This cannot be undone.')) return;
    setDeletingId(pageId);
    try {
      const res = await fetch(`${API_BASE}/api/pages/${pageId}/permanent`, {
        method: 'DELETE',
        headers: { 'auth-token': token }
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Delete failed');
      }
      setTrashedPages(prev => prev.filter(p => p._id !== pageId));
      toast.success('Page permanently deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEmptyTrash = async () => {
    if (!window.confirm(`Permanently delete all ${trashedPages.length} page(s)? This cannot be undone.`)) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/pages/workspace/${activeWorkspace}/trash/empty`, {
        method: 'DELETE',
        headers: { 'auth-token': token }
      });
      if (!res.ok) throw new Error('Empty trash failed');
      
      setTrashedPages([]);
      toast.success('Trash emptied');
    } catch (err) {
      toast.error(err.message || 'Failed to empty trash');
      await fetchTrash(); // re-sync on error
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="editor-canvas" style={{ overflowY: 'auto' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '64px 48px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', lineHeight: 1.2 }}>🗑 Trash</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              {trashedPages.length > 0
                ? `${trashedPages.length} deleted page${trashedPages.length > 1 ? 's' : ''} — permanently deleted after 30 days`
                : 'Deleted pages appear here and can be restored'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={fetchTrash}
              title="Refresh list"
              style={{ padding: '6px 10px' }}
            >
              ↺ Refresh
            </button>
            {trashedPages.length > 0 && (
              <button className="btn btn-danger btn-sm" onClick={handleEmptyTrash}>
                Empty Trash
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ height: '64px', borderRadius: '10px' }} />
            ))}
          </div>
        ) : trashedPages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-tertiary)' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Trash is empty</h3>
            <p style={{ fontSize: '14px' }}>Deleted pages will appear here</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {trashedPages.map(page => (
              <div
                key={page._id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px',
                  background: 'var(--bg-secondary)', border: '1px solid var(--border-light)',
                  borderRadius: '10px', transition: 'all 0.15s',
                  opacity: deletingId === page._id ? 0.5 : 1
                }}
                onMouseEnter={e => { if (deletingId !== page._id) e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
              >
                <span style={{ fontSize: '22px', flexShrink: 0 }}>{page.icon || '📄'}</span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: 500, fontSize: '14px', color: 'var(--text-primary)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    marginBottom: '2px'
                  }}>
                    {page.title || 'Untitled'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', display: 'flex', gap: '12px' }}>
                    {page.trashedAt && (
                      <span title={format(new Date(page.trashedAt), 'PPP')}>
                        Deleted {formatDistanceToNow(new Date(page.trashedAt), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleRestore(page._id)}
                    disabled={deletingId === page._id}
                  >
                    ↩ Restore
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handlePermanentDelete(page._id)}
                    disabled={deletingId === page._id}
                  >
                    {deletingId === page._id ? '…' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
