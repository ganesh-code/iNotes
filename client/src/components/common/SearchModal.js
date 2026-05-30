import React, { useState, useEffect, useRef } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { usePage } from '../../context/PageContext';
import { useNavigate } from 'react-router-dom';

export default function SearchModal({ onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState(0);
  const { activeWorkspace } = useWorkspace();
  const { searchPages } = usePage();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  // Keyboard shortcut to open - handled in App.js

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    setSearching(true);
    const timer = setTimeout(async () => {
      const data = await searchPages(activeWorkspace, query);
      setResults(data || []);
      setSelected(0);
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, activeWorkspace, searchPages]);

  const handleSelect = (page) => {
    navigate(`/page/${page._id}`);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    else if (e.key === 'Enter' && results[selected]) { handleSelect(results[selected]); }
    else if (e.key === 'Escape') { onClose(); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-primary)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          width: '90%',
          maxWidth: '560px',
          overflow: 'hidden',
          animation: 'slideUp 0.15s ease'
        }}
      >
        {/* Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', borderBottom: '1px solid var(--border-light)' }}>
          <span style={{ fontSize: '18px', color: 'var(--text-tertiary)' }}>🔍</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search pages…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1, border: 'none', background: 'none', fontSize: '16px',
              color: 'var(--text-primary)', outline: 'none'
            }}
          />
          {searching && <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Searching…</span>}
          <button
            onClick={onClose}
            style={{ background: 'var(--bg-tertiary)', border: 'none', borderRadius: '4px', padding: '2px 8px', fontSize: '12px', color: 'var(--text-tertiary)', cursor: 'pointer' }}
          >
            Esc
          </button>
        </div>

        {/* Results */}
        <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '6px' }}>
          {results.length > 0 ? (
            results.map((page, i) => (
              <div
                key={page._id}
                className={`slash-menu-item ${i === selected ? 'selected' : ''}`}
                onClick={() => handleSelect(page)}
                onMouseEnter={() => setSelected(i)}
              >
                <div className="slash-menu-icon" style={{ fontSize: '20px', background: 'none', border: 'none' }}>
                  {page.icon || '📄'}
                </div>
                <div className="slash-menu-info">
                  <div className="slash-menu-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {page.title || 'Untitled'}
                    {page.parent && (
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 400 }}>
                        in {page.parent.icon || '📄'} {page.parent.title || 'Untitled'}
                      </span>
                    )}
                  </div>
                  {page.excerpt && <div className="slash-menu-desc">{page.excerpt.substring(0, 80)}…</div>}
                </div>

              </div>
            ))
          ) : query.trim() ? (
            <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
              <div>No pages found for "{query}"</div>
            </div>
          ) : (
            <div style={{ padding: '24px 16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                Quick Tips
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                <div>🔍 Start typing to search pages</div>
                <div>↑↓ Navigate • Enter to open • Esc to close</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
