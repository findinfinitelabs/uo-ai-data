import { useRef, useState, useCallback, useEffect } from 'react';
import { useNotesFs } from '../context/useNotesFs';
import { writeNote } from '../lib/notesFs';

type NotesEditorProps = {
  defaultFileName?: string;
  /** Human-readable title shown above the editor and used in the document generator. */
  title?: string;
};

export default function NotesEditor({ defaultFileName = 'my-notes', title }: NotesEditorProps) {
  const [open, setOpen] = useState(false);
  const [fileSaved, setFileSaved] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const storageKey = `notes:${defaultFileName}`;
  const displayTitle = title ?? defaultFileName;
  const { dirHandle, status } = useNotesFs();

  // Load from localStorage when editor opens or when the storage key changes (e.g. step navigation)
  useEffect(() => {
    if (open && editorRef.current) {
      editorRef.current.innerHTML = localStorage.getItem(storageKey) ?? '';
    }
  }, [open, storageKey]);

  // Save to localStorage on every input, and to file if folder is connected
  function handleInput() {
    const html = editorRef.current?.innerHTML ?? '';
    localStorage.setItem(storageKey, html);

    if (dirHandle && status === 'connected') {
      writeNote(dirHandle, defaultFileName, displayTitle, html)
        .then(() => {
          setFileSaved(true);
          setTimeout(() => setFileSaved(false), 2000);
        })
        .catch(console.warn);
    }
  }

  const exec = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  }, []);

  function handleSave() {
    const html = editorRef.current?.innerHTML ?? '';
    const blob = new Blob(
      [
        `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${displayTitle}</title>` +
          '<style>body{font-family:sans-serif;max-width:720px;margin:2rem auto;padding:0 1rem;line-height:1.6}</style>' +
          `</head><body><h1>${displayTitle}</h1>${html}</body></html>`,
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
        type="button"
      >
        {open ? '▾' : '▸'} Notes — {displayTitle}
      </button>

      {open && (
        <div className="notes-editor">
          {/* Section label */}
          <div className="notes-section-label">
            <span className="notes-section-title">{displayTitle}</span>
            {status === 'connected' && (
              <span className={`notes-file-indicator ${fileSaved ? 'notes-file-indicator--saved' : ''}`}>
                {fileSaved ? '● Saved to folder' : '○ Folder connected'}
              </span>
            )}
          </div>

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
            aria-label={`Notes for ${displayTitle}`}
            data-placeholder="Start typing your notes here…"
            onInput={handleInput}
          />

          {/* Footer */}
          <div className="notes-footer">
            <button className="step-btn notes-save" onClick={handleSave}>
              💾 Download as HTML
            </button>
            <span className="notes-hint">
              {status === 'connected'
                ? `Auto-saving to folder • Download for a portable copy`
                : `Connect a save folder in the header to auto-save to your computer`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
