import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { usePage } from '../../context/PageContext';
import { format } from 'date-fns';

export default function WorkspacePage() {
  const { user } = useAuth();
  const { activeWorkspaceData } = useWorkspace();
  const { pages, createPage, starredPages } = usePage();
  const navigate = useNavigate();

  const recentPages = [...pages]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 6);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const handleNewPage = async () => {
    if (!activeWorkspaceData) return;
    const page = await createPage(activeWorkspaceData._id);
    if (page) navigate(`/page/${page._id}`);
  };

  return (
    <div className="editor-canvas" style={{ overflowY: 'auto' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '64px 48px' }}>
        {/* Greeting */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: '6px' }}>
            {greeting}, {user?.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            {activeWorkspaceData ? `You're in ${activeWorkspaceData.icon} ${activeWorkspaceData.name}` : 'Create a workspace to get started'}
          </p>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', marginBottom: '40px' }}>
          {[
            { icon: '📝', label: 'New Page', action: handleNewPage },
            { icon: '🔍', label: 'Search', action: () => {} },
          ].map(item => (
            <button
              key={item.label}
              onClick={item.action}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '8px', padding: '20px 12px', background: 'var(--bg-secondary)',
                border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)',
                cursor: 'pointer', transition: 'all 0.15s', fontSize: '14px', color: 'var(--text-secondary)',
                fontWeight: 500, fontFamily: 'inherit'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.borderColor = 'var(--border-medium)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <span style={{ fontSize: '28px' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* Favorites */}
        {starredPages.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              ⭐ Favorites
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
              {starredPages.map(page => (
                <PageCard key={page._id} page={page} onClick={() => navigate(`/page/${page._id}`)} />
              ))}
            </div>
          </div>
        )}

        {/* Recent Pages */}
        {recentPages.length > 0 ? (
          <div>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              🕐 Recently Updated
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
              {recentPages.map(page => (
                <PageCard key={page._id} page={page} onClick={() => navigate(`/page/${page._id}`)} />
              ))}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-tertiary)' }}>
            <div style={{ fontSize: '52px', marginBottom: '16px' }}>✨</div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Start with a blank page
            </h3>
            <p style={{ fontSize: '14px', marginBottom: '20px' }}>
              Create your first page to get organized
            </p>
            <button className="btn btn-primary" onClick={handleNewPage}>
              + New Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PageCard({ page, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)', cursor: 'pointer', transition: 'all 0.15s'
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ fontSize: '22px', marginBottom: '8px' }}>{page.icon || '📄'}</div>
      <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {page.title || 'Untitled'}
      </div>
      {page.updatedAt && (
        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
          {format(new Date(page.updatedAt), 'MMM d')}
        </div>
      )}
    </div>
  );
}
