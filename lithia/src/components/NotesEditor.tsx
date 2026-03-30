import { useRef, useState, useCallback, useEffect } from 'react';

type NotesEditorProps = {
  /** Default file name when saving */
  defaultFileName?: string;
};

export default function NotesEditor({ defaultFileName = 'my-notes' }: NotesEditorProps) {
  const [open, setOpen] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const storageKey = `notes:${defaultFileName}`;

  // Load from localStorage when editor opens
  useEffect(() => {
    if (open && editorRef.current) {
      const saved = localStorage.getItem(storageKey);
      if (saved && editorRef.current.innerHTML === '') {
        editorRef.current.innerHTML = saved;
      }
    }
  }, [open, storageKey]);

  // Save to localStorage on every input
  function handleInput() {
    localStorage.setItem(storageKey, editorRef.current?.innerHTML ?? '');
  }

  const exec = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  }, []);

  function handleSave() {
    const html = editorRef.current?.innerHTML ?? '';
    const blob = new Blob(
      [
        `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${defaultFileName}</title>` +
          '<style>body{font-family:sans-serif;max-width:720px;margin:2rem auto;padding:0 1rem;line-height:1.6}</style>' +
          `</head><body>${html}</body></html>`,
      ],
      { type: 'text/html' },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${defaultFileName}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="notes-wrap">
      <button
        className="notes-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {open ? '▾' : '▸'} My Notes
      </button>

      {open && (
        <div className="notes-editor">
          {/* Toolbar */}
          <div className="notes-toolbar">
            <button title="Bold" onMouseDown={(e) => { e.preventDefault(); exec('bold'); }}>
              <strong>B</strong>
            </button>
            <button title="Italic" onMouseDown={(e) => { e.preventDefault(); exec('italic'); }}>
              <em>I</em>
            </button>
            <button title="Underline" onMouseDown={(e) => { e.preventDefault(); exec('underline'); }}>
              <u>U</u>
            </button>
            <span className="notes-toolbar-sep" />
            <button title="Heading" onMouseDown={(e) => { e.preventDefault(); exec('formatBlock', 'h3'); }}>
              H
            </button>
            <button title="Bullet list" onMouseDown={(e) => { e.preventDefault(); exec('insertUnorderedList'); }}>
              •&nbsp;List
            </button>
            <button title="Numbered list" onMouseDown={(e) => { e.preventDefault(); exec('insertOrderedList'); }}>
              1.&nbsp;List
            </button>
            <span className="notes-toolbar-sep" />
            <button title="Clear formatting" onMouseDown={(e) => { e.preventDefault(); exec('removeFormat'); }}>
              ✕
            </button>
          </div>

          {/* Editable area */}
          <div
            ref={editorRef}
            className="notes-body"
            contentEditable
            role="textbox"
            aria-multiline="true"
            data-placeholder="Start typing your notes here…"
            onInput={handleInput}
          />

          {/* Save */}
          <div className="notes-footer">
            <button className="step-btn notes-save" onClick={handleSave}>
              💾 Save Notes
            </button>
            <span className="notes-hint">Downloads as an HTML file you can open anywhere</span>
          </div>
        </div>
      )}
    </div>
  );
}
