import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Image from '@tiptap/extension-image';
import { Extension } from '@tiptap/core';
import { usePage } from '../../context/PageContext';
import SlashMenu from './SlashMenu';
import '../../styles/editor.css';

/* ── Slash Command Extension ──
   Intercepts '/' typed at start of an empty line and shows the command palette.
   Returns true (suppresses char) only when the line is empty. */
const SlashExtension = (onSlash) => Extension.create({
  name: 'slashCommand',
  addKeyboardShortcuts() {
    return {
      '/': ({ editor }) => {
        const { state } = editor;
        const { from } = state.selection;
        // Get text on the current line
        const textBefore = state.doc.textBetween(
          Math.max(0, from - 200), from, '\n', '\0'
        );
        const lastNewline = textBefore.lastIndexOf('\n');
        const textOnLine = lastNewline === -1 ? textBefore : textBefore.slice(lastNewline + 1);

        if (textOnLine.trim() === '') {
          // Empty line — show menu and suppress the '/' character
          try {
            const coords = editor.view.coordsAtPos(from);
            onSlash({ x: coords.left, y: coords.bottom + 6 });
          } catch (_) {
            onSlash({ x: 200, y: 200 });
          }
          return true;
        }
        return false; // non-empty line — let '/' be typed normally
      },
    };
  },
});

export default function BlockEditor({ pageId }) {
  const { activePage, scheduleAutosave } = usePage();
  const [slashPos, setSlashPos] = useState(null); // null = hidden
  const lastPageId = useRef(null);

  const handleSlashOpen = useCallback((pos) => {
    setSlashPos(pos);
  }, []);

  const closeSlash = useCallback(() => setSlashPos(null), []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        // codeBlock is included in StarterKit — no external dep needed
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') return 'Heading…';
          return "Type '/' for commands, or start writing…";
        },
        showOnlyCurrent: true,
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Image,
      SlashExtension(handleSlashOpen),
    ],
    content: activePage?.content || { type: 'doc', content: [{ type: 'paragraph' }] },
    onUpdate: ({ editor }) => {
      if (!pageId) return;
      scheduleAutosave(pageId, { content: editor.getJSON() });
    },
  }, [pageId]); // recreate editor when page changes

  // Sync content when switching pages
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    if (pageId === lastPageId.current) return;
    lastPageId.current = pageId;
    if (activePage?.content) {
      editor.commands.setContent(activePage.content, false);
    }
  }, [editor, pageId, activePage?.content]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSlashCommand = useCallback((command) => {
    if (!editor) return;
    setSlashPos(null);
    editor.chain().focus().run();

    switch (command) {
      case 'h1':       editor.chain().focus().setHeading({ level: 1 }).run(); break;
      case 'h2':       editor.chain().focus().setHeading({ level: 2 }).run(); break;
      case 'h3':       editor.chain().focus().setHeading({ level: 3 }).run(); break;
      case 'bullet':   editor.chain().focus().toggleBulletList().run(); break;
      case 'numbered': editor.chain().focus().toggleOrderedList().run(); break;
      case 'todo':     editor.chain().focus().toggleTaskList().run(); break;
      case 'quote':    editor.chain().focus().toggleBlockquote().run(); break;
      case 'code':     editor.chain().focus().toggleCodeBlock().run(); break;
      case 'divider':  editor.chain().focus().setHorizontalRule().run(); break;
      default: break;
    }
  }, [editor]);

  return (
    <div
      style={{ position: 'relative', minHeight: 'calc(100vh - 300px)', cursor: 'text' }}
      onClick={() => editor?.chain().focus().run()}
    >
      <EditorContent editor={editor} className="tiptap-editor" />

      {slashPos && (
        <SlashMenu
          position={slashPos}
          onSelect={handleSlashCommand}
          onClose={closeSlash}
        />
      )}
    </div>
  );
}
