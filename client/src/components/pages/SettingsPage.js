import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import toast from 'react-hot-toast';

const WORKSPACE_ICONS = ['🏠', '🚀', '💼', '🎨', '📚', '🔬', '🎯', '🌟', '💡', '🏆', '🧠', '⚡'];

export default function SettingsPage() {
  const { user, updateProfile, logout } = useAuth();
  const { workspaces, activeWorkspace, createWorkspace, updateWorkspace, deleteWorkspace, switchWorkspace } = useWorkspace();

  const [name, setName] = useState(user?.name || '');
  const [theme, setTheme] = useState(user?.preferences?.theme || 'system');
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('profile');

  // Workspace editing state
  const [editingWsId, setEditingWsId] = useState(null);
  const [editWsName, setEditWsName] = useState('');
  const [editWsIcon, setEditWsIcon] = useState('');
  const [editWsDesc, setEditWsDesc] = useState('');

  // New workspace form
  const [showNewWsForm, setShowNewWsForm] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [newWsIcon, setNewWsIcon] = useState('🏠');
  const [newWsDesc, setNewWsDesc] = useState('');
  const [creatingWs, setCreatingWs] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile({ name, preferences: { theme } });
      if (theme === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleStartEdit = (ws) => {
    setEditingWsId(ws._id);
    setEditWsName(ws.name);
    setEditWsIcon(ws.icon || '🏠');
    setEditWsDesc(ws.description || '');
  };

  const handleSaveWs = async (wsId) => {
    if (!editWsName.trim()) { toast.error('Name cannot be empty'); return; }
    try {
      await updateWorkspace(wsId, { name: editWsName.trim(), icon: editWsIcon, description: editWsDesc });
      setEditingWsId(null);
    } catch (err) {
      toast.error(err.message || 'Failed to update workspace');
    }
  };

  const handleCreateWs = async () => {
    if (!newWsName.trim()) { toast.error('Enter a workspace name'); return; }
    setCreatingWs(true);
    try {
      await createWorkspace(newWsName.trim(), newWsIcon || '🏠', newWsDesc.trim());
      setNewWsName('');
      setNewWsIcon('🏠');
      setNewWsDesc('');
      setShowNewWsForm(false);
      toast.success('Workspace created!');
    } catch (err) {
      toast.error(err.message || 'Failed to create workspace');
    } finally {
      setCreatingWs(false);
    }
  };

  const handleDeleteWs = async (ws) => {
    if (workspaces.length <= 1) { toast.error("You can't delete your only workspace"); return; }
    if (!window.confirm(`Delete workspace "${ws.name}"? All pages will be permanently deleted.`)) return;
    try {
      await deleteWorkspace(ws._id);
    } catch (err) {
      toast.error(err.message || 'Failed to delete workspace');
    }
  };

  const tabs = [
    { id: 'profile', label: '👤 Profile' },
    { id: 'workspace', label: '🏠 Workspaces' },
    { id: 'appearance', label: '🎨 Appearance' },
  ];

  const sectionLabel = {
    fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)',
    textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px'
  };

  return (
    <div className="editor-canvas" style={{ overflowY: 'auto' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '64px 48px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>⚙️ Settings</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '32px' }}>
          Manage your account, workspaces, and preferences.
        </p>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: '2px', marginBottom: '32px', background: 'var(--bg-secondary)', padding: '4px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', width: 'fit-content' }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '6px 14px', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                background: tab === t.id ? 'var(--bg-primary)' : 'none',
                color: tab === t.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: tab === t.id ? '1px solid var(--border-light)' : '1px solid transparent',
                boxShadow: tab === t.id ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s', fontFamily: 'inherit'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ══════════════ PROFILE TAB ══════════════ */}
        {tab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Avatar + info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #5E6AD2, #7B5EA7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px', fontWeight: 700, flexShrink: 0 }}>
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '16px', color: 'var(--text-primary)' }}>{user?.name}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{user?.email}</div>
              </div>
            </div>

            <div>
              <div style={sectionLabel}>Display Name</div>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <div style={sectionLabel}>Email Address</div>
              <input type="email" className="form-input" value={user?.email} disabled style={{ width: '100%', opacity: 0.6 }} />
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>Email cannot be changed</div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-primary" onClick={handleSaveProfile} disabled={saving}>
                {saving ? '⟳ Saving…' : 'Save Changes'}
              </button>
              <button className="btn btn-danger" onClick={() => { if (window.confirm('Log out?')) logout(); }}>
                Log Out
              </button>
            </div>
          </div>
        )}

        {/* ══════════════ WORKSPACE TAB ══════════════ */}
        {tab === 'workspace' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <div style={sectionLabel}>Your Workspaces ({workspaces.length})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {workspaces.map(ws => (
                  <div
                    key={ws._id}
                    style={{
                      background: 'var(--bg-secondary)', border: activeWorkspace === ws._id ? '2px solid var(--accent)' : '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-xl)', overflow: 'hidden',
                      boxShadow: activeWorkspace === ws._id ? '0 0 0 3px var(--accent-light)' : 'none',
                      transition: 'all 0.15s'
                    }}
                  >
                    {/* Header row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px' }}>
                      <span style={{ fontSize: '24px', flexShrink: 0 }}>{ws.icon || '🏠'}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{ws.name}</div>
                        {ws.description && <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{ws.description}</div>}
                        {activeWorkspace === ws._id && (
                          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent)', background: 'var(--accent-light)', padding: '1px 7px', borderRadius: '999px', display: 'inline-block', marginTop: '4px' }}>
                            Active
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                        {activeWorkspace !== ws._id && (
                          <button className="btn btn-secondary btn-sm" onClick={() => switchWorkspace(ws._id)}>
                            Switch
                          </button>
                        )}
                        <button className="btn btn-secondary btn-sm" onClick={() => handleStartEdit(ws)}>
                          ✎ Rename
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteWs(ws)}
                          disabled={workspaces.length <= 1}
                          title={workspaces.length <= 1 ? "Can't delete your only workspace" : 'Delete workspace'}
                        >
                          🗑
                        </button>
                      </div>
                    </div>

                    {/* Inline edit form */}
                    {editingWsId === ws._id && (
                      <div style={{ padding: '12px 16px 16px', borderTop: '1px solid var(--border-light)', background: 'var(--bg-tertiary)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={sectionLabel}>Edit Workspace</div>

                        {/* Icon picker row */}
                        <div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Icon</div>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {WORKSPACE_ICONS.map(icon => (
                              <button
                                key={icon}
                                onClick={() => setEditWsIcon(icon)}
                                style={{
                                  fontSize: '20px', width: '36px', height: '36px', borderRadius: '8px',
                                  background: editWsIcon === icon ? 'var(--accent-light)' : 'var(--bg-secondary)',
                                  border: editWsIcon === icon ? '2px solid var(--accent)' : '1px solid var(--border-light)',
                                  cursor: 'pointer', transition: 'all 0.12s'
                                }}
                              >
                                {icon}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Name */}
                        <div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Name</div>
                          <input
                            autoFocus
                            type="text"
                            className="form-input"
                            value={editWsName}
                            onChange={e => setEditWsName(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleSaveWs(ws._id);
                              if (e.key === 'Escape') setEditingWsId(null);
                            }}
                            style={{ width: '100%' }}
                          />
                        </div>

                        {/* Description */}
                        <div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Description (optional)</div>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="A short description…"
                            value={editWsDesc}
                            onChange={e => setEditWsDesc(e.target.value)}
                            style={{ width: '100%' }}
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-primary btn-sm" onClick={() => handleSaveWs(ws._id)}>
                            Save Changes
                          </button>
                          <button className="btn btn-ghost btn-sm" onClick={() => setEditingWsId(null)}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Create new workspace */}
            {!showNewWsForm ? (
              <button
                className="btn btn-secondary"
                onClick={() => setShowNewWsForm(true)}
                style={{ width: 'fit-content' }}
              >
                ＋ Create New Workspace
              </button>
            ) : (
              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xl)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>New Workspace</div>

                {/* Icon picker */}
                <div>
                  <div style={sectionLabel}>Icon</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {WORKSPACE_ICONS.map(icon => (
                      <button
                        key={icon}
                        onClick={() => setNewWsIcon(icon)}
                        style={{
                          fontSize: '20px', width: '36px', height: '36px', borderRadius: '8px',
                          background: newWsIcon === icon ? 'var(--accent-light)' : 'var(--bg-primary)',
                          border: newWsIcon === icon ? '2px solid var(--accent)' : '1px solid var(--border-light)',
                          cursor: 'pointer', transition: 'all 0.12s'
                        }}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={sectionLabel}>Name *</div>
                  <input
                    autoFocus
                    type="text"
                    className="form-input"
                    placeholder="My Workspace"
                    value={newWsName}
                    onChange={e => setNewWsName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCreateWs()}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <div style={sectionLabel}>Description (optional)</div>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="What's this workspace for?"
                    value={newWsDesc}
                    onChange={e => setNewWsDesc(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-primary" onClick={handleCreateWs} disabled={creatingWs}>
                    {creatingWs ? '⟳ Creating…' : '＋ Create Workspace'}
                  </button>
                  <button className="btn btn-ghost" onClick={() => setShowNewWsForm(false)}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════ APPEARANCE TAB ══════════════ */}
        {tab === 'appearance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <div style={sectionLabel}>Color Theme</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                {[
                  { id: 'light', icon: '☀️', label: 'Light', desc: 'Clean and bright' },
                  { id: 'dark', icon: '🌙', label: 'Dark', desc: 'Easy on the eyes' },
                  { id: 'system', icon: '💻', label: 'System', desc: 'Follows OS' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                      padding: '20px 12px', borderRadius: 'var(--radius-xl)', cursor: 'pointer', fontFamily: 'inherit',
                      background: theme === t.id ? 'var(--accent-light)' : 'var(--bg-secondary)',
                      border: theme === t.id ? '2px solid var(--accent)' : '2px solid var(--border-light)',
                      color: theme === t.id ? 'var(--accent)' : 'var(--text-secondary)',
                      fontWeight: 500, fontSize: '13px', transition: 'all 0.15s'
                    }}
                  >
                    <span style={{ fontSize: '28px' }}>{t.icon}</span>
                    <span style={{ fontWeight: 600 }}>{t.label}</span>
                    <span style={{ fontSize: '11px', opacity: 0.7 }}>{t.desc}</span>
                  </button>
                ))}
              </div>
              <button className="btn btn-primary" onClick={handleSaveProfile} disabled={saving} style={{ width: 'fit-content' }}>
                {saving ? '⟳ Saving…' : 'Apply Theme'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
