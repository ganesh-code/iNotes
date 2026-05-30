import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { usePage } from '../../context/PageContext';
import toast from 'react-hot-toast';
import '../../styles/sidebar.css';

function PageTreeItem({ page, depth = 0, activePage, onSelect, onNew, onStar, onTrash }) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = page.children && page.children.length > 0;

  return (
    <div className="page-tree-item">
      <div
        className={`page-tree-row ${activePage?._id === page._id ? 'active' : ''}`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
        onClick={() => onSelect(page)}
      >
        <button
          className={`page-tree-toggle ${expanded ? 'expanded' : ''}`}
          onClick={e => { e.stopPropagation(); setExpanded(!expanded); }}
          style={{ opacity: hasChildren ? 1 : 0, pointerEvents: hasChildren ? 'auto' : 'none' }}
        >
          ▶
        </button>
        <span className="page-tree-icon">{page.icon || '📄'}</span>
        <span className="page-tree-title">{page.title || 'Untitled'}</span>
        <div className="page-tree-actions" onClick={e => e.stopPropagation()}>
          <button className="sidebar-icon-btn" title="Add subpage" onClick={() => onNew(page._id)}>+</button>
          <button className="sidebar-icon-btn" title={page.isStarred ? 'Unstar' : 'Star'} onClick={() => onStar(page._id)}>
            {page.isStarred ? '★' : '☆'}
          </button>
          <button className="sidebar-icon-btn" title="Delete" onClick={() => onTrash(page._id)}>🗑</button>
        </div>
      </div>
      {expanded && hasChildren && (
        <div className="page-tree-children">
          {page.children.map(child => (
            <PageTreeItem
              key={child._id}
              page={child}
              depth={depth + 1}
              activePage={activePage}
              onSelect={onSelect}
              onNew={onNew}
              onStar={onStar}
              onTrash={onTrash}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ collapsed, onToggle, onSearchOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const {
    workspaces, activeWorkspaceData, activeWorkspace,
    fetchWorkspaces, createWorkspace, switchWorkspace, updateWorkspace
  } = useWorkspace();
  const { pageTree, starredPages, activePage, fetchPages, createPage, toggleStar, trashPage, loadingPages } = usePage();

  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [showNewWs, setShowNewWs] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [newWsIcon, setNewWsIcon] = useState('🏠');
  const [editingWsId, setEditingWsId] = useState(null);
  const [editWsName, setEditWsName] = useState('');
  const [editWsIcon, setEditWsIcon] = useState('');
  const workspaceRef = useRef(null);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  // Re-fetch pages whenever the active workspace changes — clears old workspace pages first
  useEffect(() => {
    if (activeWorkspaceData?._id) {
      fetchPages(activeWorkspaceData._id);
    }
  }, [activeWorkspaceData?._id, fetchPages]);

  // Close dropdown on outside click (use capture so it doesn't race with the open click)
  useEffect(() => {
    const handleClick = (e) => {
      if (workspaceRef.current && !workspaceRef.current.contains(e.target)) {
        setShowWorkspaceMenu(false);
        setShowNewWs(false);
        setEditingWsId(null);
      }
    };
    // Use 'click' (not 'mousedown') so toggle's onClick fires first
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleSelectPage = (page) => {
    navigate(`/page/${page._id}`);
  };

  const handleNewPage = async (parentId = null) => {
    if (!activeWorkspaceData) {
      toast.error('Please select a workspace first');
      return;
    }
    const page = await createPage(activeWorkspaceData._id, parentId);
    if (page) navigate(`/page/${page._id}`);
  };

  const handleTrashPage = (pageId) => {
    trashPage(pageId, navigate);
  };

  const handleSwitchWorkspace = (ws) => {
    if (activeWorkspace === ws._id) {
      // Already active — just close the menu
      setShowWorkspaceMenu(false);
      return;
    }
    switchWorkspace(ws._id);       // updates activeWorkspace → triggers fetchPages effect
    setShowWorkspaceMenu(false);
    setShowNewWs(false);
    setEditingWsId(null);
    navigate('/');                 // go to home so we're not stuck on a page from the old workspace
  };


  const handleCreateWorkspace = async () => {
    if (!newWsName.trim()) return;
    try {
      await createWorkspace(newWsName.trim(), newWsIcon || '🏠');
      setNewWsName('');
      setNewWsIcon('🏠');
      setShowNewWs(false);
      setShowWorkspaceMenu(false);
    } catch (err) {
      toast.error(err.message || 'Failed to create workspace');
    }
  };

  const handleStartEdit = (ws, e) => {
    e.stopPropagation();
    setEditingWsId(ws._id);
    setEditWsName(ws.name);
    setEditWsIcon(ws.icon || '🏠');
  };

  const handleSaveEdit = async (wsId, e) => {
    e?.stopPropagation();
    if (!editWsName.trim()) return;
    try {
      await updateWorkspace(wsId, { name: editWsName.trim(), icon: editWsIcon });
      setEditingWsId(null);
    } catch (err) {
      toast.error(err.message || 'Failed to update workspace');
    }
  };

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'U';

  if (collapsed) return null;

  return (
    <aside className="sidebar">
      {/* ── Workspace Header ── */}
      <div className="sidebar-workspace-header" ref={workspaceRef}>
        <div
          className="workspace-info"
          onClick={(e) => {
            e.stopPropagation();
            setShowWorkspaceMenu(!showWorkspaceMenu);
          }}
          style={{ cursor: 'pointer', flex: 1, minWidth: 0 }}
        >
          <div className="workspace-icon">{activeWorkspaceData?.icon || '🏠'}</div>
          <span className="workspace-name">{activeWorkspaceData?.name || 'Select Workspace'}</span>
          <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginLeft: '4px', flexShrink: 0 }}>
            {showWorkspaceMenu ? '▲' : '▼'}
          </span>
        </div>
        <div className="sidebar-header-actions">
          <button className="sidebar-icon-btn" title="Collapse sidebar" onClick={onToggle}>←</button>
        </div>

        {/* Workspace Dropdown */}
        {showWorkspaceMenu && (
          <div className="workspace-dropdown" onClick={e => e.stopPropagation()}>
            <div style={{ padding: '8px 12px 4px', fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Workspaces
            </div>

            {workspaces.map(ws => (
              <div key={ws._id}>
                {editingWsId === ws._id ? (
                  /* ── Inline edit row ── */
                  <div style={{ padding: '6px 12px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <input
                      value={editWsIcon}
                      onChange={e => setEditWsIcon(e.target.value)}
                      style={{ width: '36px', textAlign: 'center', fontSize: '16px', padding: '4px', borderRadius: '4px' }}
                      maxLength={2}
                    />
                    <input
                      autoFocus
                      value={editWsName}
                      onChange={e => setEditWsName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleSaveEdit(ws._id);
                        if (e.key === 'Escape') setEditingWsId(null);
                      }}
                      style={{ flex: 1, fontSize: '13px', padding: '4px 8px', borderRadius: '4px' }}
                    />
                    <button
                      onClick={() => handleSaveEdit(ws._id)}
                      style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => setEditingWsId(null)}
                      style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  /* ── Workspace row ── */
                  <div
                    className={`workspace-dropdown-item ${activeWorkspace === ws._id ? 'active' : ''}`}
                    onClick={() => handleSwitchWorkspace(ws)}
                    style={{ position: 'relative' }}
                  >
                    <span className="ws-icon">{ws.icon || '🏠'}</span>
                    <span className="ws-name">{ws.name}</span>
                    {activeWorkspace === ws._id && <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--accent)' }}>✓</span>}
                    <button
                      className="sidebar-icon-btn"
                      title="Rename"
                      onClick={e => handleStartEdit(ws, e)}
                      style={{ marginLeft: activeWorkspace === ws._id ? '4px' : 'auto', opacity: 0.6, fontSize: '11px' }}
                    >
                      ✎
                    </button>
                  </div>
                )}
              </div>
            ))}

            <div className="workspace-dropdown-footer">
              {showNewWs ? (
                <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      value={newWsIcon}
                      onChange={e => setNewWsIcon(e.target.value)}
                      style={{ width: '44px', textAlign: 'center', fontSize: '18px', borderRadius: '4px', padding: '4px' }}
                      maxLength={2}
                    />
                    <input
                      autoFocus
                      placeholder="Workspace name…"
                      value={newWsName}
                      onChange={e => setNewWsName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleCreateWorkspace()}
                      style={{ flex: 1, fontSize: '13px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="btn btn-primary btn-sm" onClick={handleCreateWorkspace} style={{ flex: 1 }}>Create</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setShowNewWs(false)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div
                  className="workspace-dropdown-item"
                  onClick={() => setShowNewWs(true)}
                  style={{ color: 'var(--text-secondary)', borderTop: '1px solid var(--border-light)', marginTop: '4px' }}
                >
                  <span className="ws-icon">＋</span>
                  <span className="ws-name">New workspace</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Search ── */}
      <div className="sidebar-search">
        <button className="sidebar-search-btn" onClick={onSearchOpen}>
          <span>🔍</span>
          <span>Search</span>
          <span className="sidebar-search-shortcut">⌘K</span>
        </button>
      </div>

      {/* ── Navigation ── */}
      <div className="sidebar-nav">
        <button
          className={`sidebar-nav-item ${location.pathname === '/' ? 'active' : ''}`}
          onClick={() => navigate('/')}
        >
          <span>🏠</span> Home
        </button>
        <button
          className={`sidebar-nav-item ${location.pathname === '/trash' ? 'active' : ''}`}
          onClick={() => navigate('/trash')}
        >
          <span>🗑</span> Trash
        </button>
        <button
          className={`sidebar-nav-item ${location.pathname === '/settings' ? 'active' : ''}`}
          onClick={() => navigate('/settings')}
        >
          <span>⚙️</span> Settings
        </button>
      </div>

      <div className="divider" style={{ margin: '4px 0' }} />

      {/* ── Starred  ── */}
      {starredPages.length > 0 && (
        <>
          <div className="sidebar-section" style={{ maxHeight: '120px', flex: 'none' }}>
            <div className="sidebar-section-header">
              <span className="sidebar-section-label">Favorites</span>
            </div>
            {starredPages.map(page => (
              <div
                key={page._id}
                className={`page-tree-row ${activePage?._id === page._id ? 'active' : ''}`}
                style={{ paddingLeft: '12px' }}
                onClick={() => handleSelectPage(page)}
              >
                <span className="page-tree-icon">{page.icon || '📄'}</span>
                <span className="page-tree-title">{page.title || 'Untitled'}</span>
              </div>
            ))}
          </div>
          <div className="divider" style={{ margin: '4px 0' }} />
        </>
      )}

      {/* ── Pages Tree ── */}
      <div className="sidebar-section">
        <div className="sidebar-section-header">
          <span className="sidebar-section-label">Pages</span>
          <button className="sidebar-section-action" title="New page" onClick={() => handleNewPage(null)}>+</button>
        </div>
        {!activeWorkspaceData ? (
          <p className="sidebar-empty" style={{ padding: '8px 16px', fontSize: '12px' }}>
            ☝️ Select a workspace above
          </p>
        ) : loadingPages ? (
          <div style={{ padding: '8px 16px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ height: '20px', marginBottom: '6px', borderRadius: '4px' }} />
            ))}
          </div>
        ) : pageTree.length > 0 ? (
          pageTree.map(page => (
            <PageTreeItem
              key={page._id}
              page={page}
              activePage={activePage}
              onSelect={handleSelectPage}
              onNew={handleNewPage}
              onStar={toggleStar}
              onTrash={handleTrashPage}
            />
          ))
        ) : (
          <p className="sidebar-empty">No pages yet. Click + to create one.</p>
        )}
      </div>

      {/* ── Footer: User ── */}
      <div className="sidebar-footer">
        <div className="sidebar-user" onClick={() => navigate('/settings')}>
          <div className="user-avatar">{userInitial}</div>
          <span className="user-name">{user?.name || 'User'}</span>
          <button
            className="sidebar-icon-btn"
            title="Logout"
            onClick={e => { e.stopPropagation(); logout(); navigate('/login'); }}
          >
            ⏻
          </button>
        </div>
      </div>
    </aside>
  );
}
