import React, { useState, useEffect, useRef, forwardRef } from 'react';
import '../../styles/editor.css';

const COMMANDS = [
  {
    group: 'Text',
    items: [
      { id: 'h1',       icon: 'H1', label: 'Heading 1',     desc: 'Large section title' },
      { id: 'h2',       icon: 'H2', label: 'Heading 2',     desc: 'Medium section title' },
      { id: 'h3',       icon: 'H3', label: 'Heading 3',     desc: 'Small section title' },
      { id: 'bullet',   icon: '•',  label: 'Bullet List',   desc: 'Unordered list' },
      { id: 'numbered', icon: '1.', label: 'Numbered List', desc: 'Ordered list' },
      { id: 'todo',     icon: '☑',  label: 'To-do',         desc: 'Checklist with checkboxes' },
    ],
  },
  {
    group: 'Blocks',
    items: [
      { id: 'quote',   icon: '❝',  label: 'Quote',      desc: 'Highlighted blockquote' },
      { id: 'code',    icon: '<>', label: 'Code Block', desc: 'Syntax-highlighted code' },
      { id: 'divider', icon: '—',  label: 'Divider',    desc: 'Horizontal separator' },
    ],
  },
];

const ALL_ITEMS = COMMANDS.flatMap(g => g.items);

const SlashMenu = forwardRef(function SlashMenu({ position, onSelect, onClose }, ref) {
  const [filter, setFilter] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const innerRef = useRef(null);

  const filteredItems = filter.trim()
    ? ALL_ITEMS.filter(i =>
        i.label.toLowerCase().includes(filter.toLowerCase()) ||
        i.desc.toLowerCase().includes(filter.toLowerCase())
      )
    : null;

  const displayGroups = filteredItems
    ? [{ group: 'Results', items: filteredItems }]
    : COMMANDS;

  const allDisplayed = displayGroups.flatMap(g => g.items);

  // Reset selection on filter change
  useEffect(() => { setSelectedIdx(0); }, [filter]);

  // Auto-scroll selected item into view
  useEffect(() => {
    const el = innerRef.current?.querySelector('.slash-menu-item.selected');
    if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selectedIdx]);

  // Keyboard navigation — must capture before TipTap
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault(); e.stopPropagation();
        setSelectedIdx(i => Math.min(i + 1, allDisplayed.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault(); e.stopPropagation();
        setSelectedIdx(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault(); e.stopPropagation();
        if (allDisplayed[selectedIdx]) onSelect(allDisplayed[selectedIdx].id);
      } else if (e.key === 'Escape') {
        e.preventDefault(); e.stopPropagation();
        onClose();
      } else if (e.key === 'Backspace') {
        setFilter(f => f.slice(0, -1));
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        // Accumulate filter characters
        setFilter(f => f + e.key);
      }
    };
    document.addEventListener('keydown', handler, true); // capture phase
    return () => document.removeEventListener('keydown', handler, true);
  }, [allDisplayed, selectedIdx, onSelect, onClose]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (innerRef.current && !innerRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  // Calculate viewport-safe position
  const menuWidth = 280;
  const menuMaxHeight = 320;
  const vpW = window.innerWidth;
  const vpH = window.innerHeight;
  let left = position.x;
  let top = position.y;
  if (left + menuWidth > vpW - 16) left = vpW - menuWidth - 16;
  if (top + menuMaxHeight > vpH - 16) top = position.y - menuMaxHeight - 4;

  let globalIdx = 0;

  return (
    <div
      ref={(el) => {
        innerRef.current = el;
        if (typeof ref === 'function') ref(el);
        else if (ref) ref.current = el;
      }}
      className="slash-menu"
      style={{ position: 'fixed', left, top, width: menuWidth, zIndex: 9000 }}
    >
      {/* Search/filter indicator */}
      {filter && (
        <div style={{
          padding: '6px 10px 4px',
          fontSize: '12px',
          color: 'var(--text-secondary)',
          borderBottom: '1px solid var(--border-light)',
          marginBottom: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span style={{ color: 'var(--text-tertiary)' }}>🔍</span>
          <span>Filter: <strong style={{ color: 'var(--text-primary)' }}>{filter}</strong></span>
        </div>
      )}

      {allDisplayed.length === 0 && (
        <div style={{ padding: '20px 12px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>
          No results for "{filter}"
        </div>
      )}

      {displayGroups.map(group => (
        <React.Fragment key={group.group}>
          {group.items.length > 0 && (
            <div className="slash-menu-group-label">{group.group}</div>
          )}
          {group.items.map((item) => {
            const idx = globalIdx++;
            const isSelected = idx === selectedIdx;
            return (
              <div
                key={item.id}
                className={`slash-menu-item ${isSelected ? 'selected' : ''}`}
                onMouseDown={(e) => {
                  e.preventDefault(); // prevent blur
                  onSelect(item.id);
                }}
                onMouseEnter={() => setSelectedIdx(idx)}
              >
                <div className="slash-menu-icon">{item.icon}</div>
                <div className="slash-menu-info">
                  <div className="slash-menu-title">{item.label}</div>
                  <div className="slash-menu-desc">{item.desc}</div>
                </div>
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
});

export default SlashMenu;
