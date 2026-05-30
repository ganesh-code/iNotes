import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePage } from '../../context/PageContext';
import BlockEditor from '../editor/BlockEditor';
import '../../styles/editor.css';

const COVER_COLORS = [
  '#5E6AD2', '#2563EB', '#7C3AED', '#DB2777', '#DC2626',
  '#EA580C', '#16A34A', '#0E7490', '#374151', '#92400E'
];

const EMOJI_SUGGESTIONS = ['📄', '📝', '💡', '🎯', '🔥', '⭐', '✅', '🚀', '📊', '🧠', '📚', '💼', '🎨', '🔧', '🌟', '🏆', '💎', '🌈'];

export default function PageView() {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const { activePage, fetchPage, updatePage, setActivePage } = usePage();
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [hasCover, setHasCover] = useState(false);
  const titleRef = useRef(null);
  const titleSaveTimer = useRef(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setShowEmojiPicker(false);
    setShowCoverPicker(false);
    fetchPage(pageId).then(page => {
      if (mounted && page) {
        setTitle(page.title || '');
        setHasCover(!!(page.coverColor || page.coverImage));
        setLoading(false);
      } else if (mounted) {
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [pageId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (titleSaveTimer.current) clearTimeout(titleSaveTimer.current);
    titleSaveTimer.current = setTimeout(() => {
      updatePage(pageId, { title: newTitle }, true);
    }, 800);
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.querySelector('.tiptap-editor')?.focus();
    }
  };

  const handleSetIcon = async (emoji) => {
    setShowEmojiPicker(false);
    await updatePage(pageId, { icon: emoji }, true);
  };

  // Set a solid color as cover (no image)
  const handleSetCoverColor = async (color) => {
    setHasCover(true);
    setShowCoverPicker(false);
    await updatePage(pageId, { coverColor: color, coverImage: '' }, true);
  };

  // Set an image (base64 from upload, or URL) as cover
  const handleSetCoverImage = async (imageData) => {
    setHasCover(true);
    setShowCoverPicker(false);
    await updatePage(pageId, { coverImage: imageData, coverColor: '' }, true);
  };

  const handleRemoveCover = async () => {
    setHasCover(false);
    await updatePage(pageId, { coverColor: '', coverImage: '' }, true);
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="editor-canvas">
        <div className="page-header">
          <div className="skeleton" style={{ width: '60px', height: '60px', borderRadius: '8px', marginBottom: '16px' }} />
          <div className="skeleton" style={{ width: '60%', height: '40px', borderRadius: '6px' }} />
        </div>
        <div className="editor-content-wrapper">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton" style={{ height: '20px', marginBottom: '12px', width: `${100 - i * 10}%`, borderRadius: '4px' }} />
          ))}
        </div>
      </div>
    );
  }

  // Page not found
  if (!activePage) {
    return (
      <div className="editor-empty">
        <div className="editor-empty-icon">📭</div>
        <div className="editor-empty-title">Page not found</div>
        <div className="editor-empty-desc">This page may have been deleted or doesn't exist.</div>
        <button className="btn btn-secondary" style={{ marginTop: '16px' }} onClick={() => { setActivePage(null); navigate('/'); }}>
          Go Home
        </button>
      </div>
    );
  }

  // Build the cover style: image takes priority over color
  const coverBgStyle = activePage.coverImage
    ? { backgroundImage: `url(${activePage.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: activePage.coverColor || 'linear-gradient(135deg, #5E6AD2, #7B5EA7)' };

  return (
    <div className="editor-canvas">

      {/* ─── Cover Banner ─── */}
      {hasCover && (
        <div className="page-cover">
          <div className="page-cover-gradient" style={coverBgStyle} />
          <div className="page-cover-actions">
            <button className="btn btn-secondary btn-sm" onClick={() => setShowCoverPicker(true)}>
              Change cover
            </button>
            <button className="btn btn-secondary btn-sm" onClick={handleRemoveCover}>
              Remove
            </button>
          </div>
        </div>
      )}

      {/* ─── Page Header ─── */}
      <div className="page-header">

        {/* Icon */}
        <div className="page-icon-wrapper">
          {activePage.icon ? (
            <span className="page-icon" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
              {activePage.icon}
            </span>
          ) : (
            <button
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--text-tertiary)', fontSize: '13px' }}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              + Add icon
            </button>
          )}

          {showEmojiPicker && (
            <div style={{
              position: 'absolute', zIndex: 500, background: 'var(--bg-primary)',
              border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-lg)',
              padding: '12px', boxShadow: 'var(--shadow-xl)', display: 'flex', flexWrap: 'wrap',
              gap: '6px', width: '240px', marginTop: '8px'
            }}>
              {EMOJI_SUGGESTIONS.map(e => (
                <button key={e} style={{ fontSize: '22px', cursor: 'pointer', background: 'none', border: 'none', borderRadius: '4px', padding: '4px', transition: 'transform 0.1s' }}
                  onClick={() => handleSetIcon(e)}
                  onMouseEnter={ev => ev.currentTarget.style.transform = 'scale(1.2)'}
                  onMouseLeave={ev => ev.currentTarget.style.transform = 'scale(1)'}>
                  {e}
                </button>
              ))}
              <hr style={{ width: '100%', border: 'none', borderTop: '1px solid var(--border-light)', margin: '4px 0' }} />
              <button className="btn btn-ghost btn-sm" style={{ width: '100%' }} onClick={() => handleSetIcon('')}>Remove icon</button>
            </div>
          )}
        </div>

        {/* Add Cover button — only shown when no cover */}
        {!hasCover && (
          <div className="page-add-prop-row">
            <button className="page-add-prop-btn" onClick={() => setShowCoverPicker(true)}>
              🖼 Add cover
            </button>
          </div>
        )}

        {/* Cover Picker dropdown */}
        {showCoverPicker && (
          <CoverPicker
            activePage={activePage}
            onColor={handleSetCoverColor}
            onImage={handleSetCoverImage}
            onClose={() => setShowCoverPicker(false)}
          />
        )}

        {/* Auto-resizing title */}
        <textarea
          ref={titleRef}
          className="page-title-input"
          placeholder="Untitled"
          value={title}
          onChange={handleTitleChange}
          onKeyDown={handleTitleKeyDown}
          rows={1}
          style={{ resize: 'none', overflow: 'hidden' }}
          onInput={e => {
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
        />
      </div>

      {/* ─── Block Editor ─── */}
      <div className="editor-content-wrapper">
        <BlockEditor pageId={pageId} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   CoverPicker — Color + Image Upload / URL
═══════════════════════════════════════════ */
function CoverPicker({ activePage, onColor, onImage, onClose }) {
  const [tab, setTab] = useState('color');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Convert local file to base64 and pass up
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, GIF, WebP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be under 5 MB');
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      onImage(ev.target.result); // base64 data URL
      setUploading(false);
    };
    reader.onerror = () => {
      alert('Failed to read image file');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlApply = () => {
    const url = imageUrl.trim();
    if (!url) return;
    onImage(url);
  };

  const tabBtn = (id, label) => ({
    padding: '5px 14px', borderRadius: 'var(--radius-md)', fontSize: '13px',
    fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
    background: tab === id ? 'var(--bg-primary)' : 'transparent',
    color: tab === id ? 'var(--text-primary)' : 'var(--text-secondary)',
    border: tab === id ? '1px solid var(--border-light)' : '1px solid transparent',
    boxShadow: tab === id ? 'var(--shadow-sm)' : 'none',
    transition: 'all 0.12s'
  });

  return (
    <div style={{
      position: 'absolute', zIndex: 600, background: 'var(--bg-primary)',
      border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-xl)',
      padding: '18px', boxShadow: 'var(--shadow-xl)', marginTop: '8px', width: '300px'
    }}>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-secondary)', padding: '3px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
        <button style={tabBtn('color', '🎨 Color')} onClick={() => setTab('color')}>🎨 Color</button>
        <button style={tabBtn('image', '🖼 Image')} onClick={() => setTab('image')}>🖼 Image</button>
      </div>

      {/* ── Color tab ── */}
      {tab === 'color' && (
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Solid colors
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {COVER_COLORS.map(c => (
              <div
                key={c}
                title={c}
                onClick={() => onColor(c)}
                style={{
                  width: '34px', height: '34px', borderRadius: '50%', background: c,
                  cursor: 'pointer',
                  border: activePage.coverColor === c ? '3px solid var(--accent)' : '2.5px solid transparent',
                  outline: activePage.coverColor === c ? '2px solid var(--accent-light)' : '2px solid transparent',
                  transition: 'transform 0.12s, outline 0.1s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.18)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Image tab ── */}
      {tab === 'image' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Upload from device */}
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Upload from device
            </div>
            <div
              onClick={() => !uploading && fileInputRef.current?.click()}
              style={{
                border: '2px dashed var(--border-medium)', borderRadius: 'var(--radius-lg)',
                padding: '20px 12px', textAlign: 'center',
                cursor: uploading ? 'wait' : 'pointer',
                color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6,
                transition: 'all 0.15s'
              }}
              onMouseEnter={e => {
                if (!uploading) {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.background = 'var(--accent-light)';
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border-medium)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {uploading ? (
                <span>⟳ Reading image…</span>
              ) : (
                <>
                  <div style={{ fontSize: '30px', marginBottom: '6px' }}>📁</div>
                  <div style={{ fontWeight: 500 }}>Click to choose file</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                    PNG · JPG · GIF · WebP · max 5 MB
                  </div>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
          </div>

          {/* URL input */}
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Or paste image URL
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="url"
                className="form-input"
                placeholder="https://example.com/photo.jpg"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleUrlApply()}
                style={{ flex: 1, fontSize: '12px', padding: '7px 10px' }}
              />
              <button
                className="btn btn-primary btn-sm"
                onClick={handleUrlApply}
                disabled={!imageUrl.trim()}
                style={{ flexShrink: 0, padding: '7px 12px' }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        className="btn btn-ghost btn-sm"
        style={{ marginTop: '14px', width: '100%' }}
        onClick={onClose}
      >
        Cancel
      </button>
    </div>
  );
}
