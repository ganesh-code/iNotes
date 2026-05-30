import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePage } from '../../context/PageContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import '../../styles/editor.css';

export default function Topbar({ onToggleSidebar, onSearchOpen }) {
  const { activePage, saving, toggleStar } = usePage();
  const { activeWorkspaceData } = useWorkspace();
  const navigate = useNavigate();

  const breadcrumbs = [];
  if (activeWorkspaceData) {
    breadcrumbs.push({
      _id: 'root',
      label: activeWorkspaceData.name,
      icon: activeWorkspaceData.icon || '🏠',
      path: '/'
    });
  }

  if (activePage) {
    if (activePage.ancestors) {
      activePage.ancestors.forEach(anc => {
        breadcrumbs.push({
          _id: anc._id,
          label: anc.title || 'Untitled',
          icon: anc.icon || '📄',
          path: `/page/${anc._id}`
        });
      });
    }
    breadcrumbs.push({
      _id: activePage._id,
      label: activePage.title || 'Untitled',
      icon: activePage.icon || '📄',
      current: true
    });
  }

  return (
    <header className="topbar">
      <button className="topbar-toggle" onClick={onToggleSidebar} title="Toggle sidebar">
        ☰
      </button>

      {/* Breadcrumbs */}
      <nav className="topbar-breadcrumbs">
        {breadcrumbs.map((crumb, i) => (
          <React.Fragment key={crumb._id}>
            {i > 0 && <span className="breadcrumb-sep">/</span>}
            <span
              className={`breadcrumb-item ${crumb.current ? 'current' : ''}`}
              onClick={() => crumb.path && navigate(crumb.path)}
              style={{ cursor: crumb.path ? 'pointer' : 'default' }}
            >
              {crumb.icon && <span style={{ marginRight: '4px' }}>{crumb.icon}</span>}
              {crumb.label}
            </span>
          </React.Fragment>
        ))}
      </nav>


      {/* Actions */}
      <div className="topbar-actions">
        {saving && (
          <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span className="animate-spin" style={{ display: 'inline-block' }}>⟳</span> Saving…
          </span>
        )}

        {activePage && (
          <>
            <button
              className="topbar-action-btn"
              onClick={() => toggleStar(activePage._id)}
              title={activePage.isStarred ? 'Remove from favorites' : 'Add to favorites'}
            >
              {activePage.isStarred ? '★' : '☆'}
            </button>
          </>
        )}

        <button className="topbar-action-btn" onClick={onSearchOpen}>
          🔍
        </button>
      </div>
    </header>
  );
}
