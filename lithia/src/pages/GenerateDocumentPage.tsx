// All localStorage note keys used across the app, mapped to human labels and document sections.
// Storage key format: notes:${defaultFileName}
import {
  Document, Packer, Paragraph, TextRun,
  PageBreak, ShadingType, UnderlineType,
} from 'docx';

type NoteEntry = {
  key: string;        // localStorage key (without "notes:" prefix)
  label: string;      // human label shown in preview
};

type DocSection = {
  id: string;
  title: string;
  notes: NoteEntry[];
};

const DOC_STRUCTURE: DocSection[] = [
  {
    id: 'business-analysis',
    title: '1. Business Analysis',
    notes: [
      { key: 'step-1-notes', label: 'Step 1 — Review Lithia Investor Report' },
      { key: 'step-2-notes', label: 'Step 2 — Market Research' },
    ],
  },
  {
    id: 'stakeholder-alignment',
    title: '2. Stakeholder Alignment',
    notes: [
      { key: 'step-3-notes', label: 'Step 3 — Review with Lithia Leaders' },
      { key: 'step-4-notes', label: 'Step 4 — Business Case' },
    ],
  },
  {
    id: 'product-strategy',
    title: '3. Product Strategy',
    notes: [
      { key: 'step-5-notes', label: 'Step 5 — Team Discussion Pack' },
      { key: 'step-6-notes', label: 'Step 6 — Align Product Understanding' },
      { key: 'step-7-notes', label: 'Step 7 — Innovation Framework' },
      { key: 'step-8-notes', label: 'Step 8 — Core Team Artifacts' },
      { key: 'step-9-notes', label: 'Step 9 — Industry Fit & Prioritization' },
    ],
  },
  {
    id: 'product-design',
    title: '4. Product Design',
    notes: [
      { key: 'design:class',  label: 'Design Together in Class' },
      { key: 'design:build',  label: 'Build with Lovable or Base44' },
    ],
  },
  {
    id: 'functional-specs',
    title: '5. Functional Specifications',
    notes: [
      { key: 'specs:feature-scenarios', label: 'Feature Scenarios' },
      { key: 'specs:use-cases',         label: 'Use Cases' },
      { key: 'specs:data-schemas',      label: 'Data Schemas' },
      { key: 'specs:compliance',        label: 'Compliance Review' },
    ],
  },
  {
    id: 'regulatory',
    title: '6. Regulatory & Compliance Evaluation',
    notes: [
      { key: 'specs:regulations', label: 'Regulation Evaluation & Metadata Changes' },
    ],
  },
  {
    id: 'data-architecture',
    title: '7. Data Architecture & Datasets',
    notes: [
      { key: 'specs:create-data', label: 'Dataset Design & Data Dictionary' },
    ],
  },
  {
    id: 'business-docs',
    title: '8. Enhanced Business Documentation',
    notes: [
      { key: 'design:docs', label: 'Business Documentation & Go-to-Market' },
    ],
  },
];

// ────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────

function readNote(key: string): string {
  return localStorage.getItem(`notes:${key}`) ?? '';
}

function hasContent(html: string): boolean {
  // Strip tags and check if there's any visible text
  return html.replace(/<[^>]*>/g, '').trim().length > 0;
}

function buildJSON(): object {
  const doc: Record<string, unknown> = {
    generated: new Date().toISOString(),
    title: 'AI Product Design Document — Lithia Motors',
    sections: DOC_STRUCTURE.map((section) => ({
      id: section.id,
      title: section.title,
      notes: section.notes.map((n) => ({
        label: n.label,
        content: readNote(n.key),
      })),
    })),
  };
  return doc;
}

function buildHTML(): string {
  const sections = DOC_STRUCTURE.map((section) => {
    const noteBlocks = section.notes
      .map((n) => {
        const html = readNote(n.key);
        if (!hasContent(html)) return '';
        return `
          <div class="note-block">
            <h3 class="note-block-label">${n.label}</h3>
            <div class="note-block-content">${html}</div>
          </div>`;
      })
      .join('');

    if (!noteBlocks.trim()) return '';

    return `
      <section class="doc-section">
        <h2 class="doc-section-heading">${section.title}</h2>
        ${noteBlocks}
      </section>`;
  }).join('');

  const ipNotice = `This document contains intellectual property created by students of the Lundquist College of Business, University of Oregon, in partnership with Lithia Motors. All work, analyses, frameworks, and product concepts herein are the original work of the student team and are protected under applicable intellectual property laws. Unauthorized reproduction, distribution, or commercial use without written permission is prohibited.`;
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>AI Product Design Document — Lithia Motors</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { font-family: 'Georgia', serif; max-width: 820px; margin: 0 auto; padding: 0; color: #1a1a1a; line-height: 1.7; }

    /* ── Cover band ── */
    .doc-cover { background: #007030; padding: 2.5rem 2.5rem 0; }
    .doc-cover-wordmark { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.6rem; }
    .doc-cover-uo { font-family: Arial Black, Arial, sans-serif; font-size: 2.4rem; font-weight: 900; color: #FEE11A; letter-spacing: -1px; line-height: 1; }
    .doc-cover-school { font-family: Arial, sans-serif; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255,255,255,0.75); line-height: 1.4; }
    .doc-cover-title { font-family: Arial, sans-serif; font-size: 2rem; font-weight: 900; color: #fff; margin: 0 0 0.3rem; }
    .doc-cover-sub { font-family: Arial, sans-serif; font-size: 0.95rem; color: rgba(255,255,255,0.8); margin: 0; }
    .doc-cover-bar { height: 8px; background: #FEE11A; margin-top: 2rem; }

    /* ── IP notice band ── */
    .doc-ip-notice { background: #fff8dc; border-left: 4px solid #FEE11A; margin: 1.75rem 2.5rem; padding: 0.75rem 1rem; font-family: Arial, sans-serif; font-size: 0.78rem; color: #555; line-height: 1.55; }
    .doc-ip-notice strong { color: #333; display: block; margin-bottom: 0.2rem; }

    /* ── Body ── */
    .doc-body { padding: 0 2.5rem 2.5rem; }
    .doc-section { margin-bottom: 3rem; page-break-inside: avoid; }
    .doc-section-heading { font-family: Arial, sans-serif; font-size: 1.05rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: #fff; background: #007030; padding: 0.45rem 1rem; margin: 0 0 1.25rem; }
    .note-block { margin-bottom: 1.75rem; padding-bottom: 1.75rem; border-bottom: 1px solid #e8e8e8; }
    .note-block:last-child { border-bottom: none; }
    .note-block-label { font-family: Arial, sans-serif; font-size: 0.82rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #004F6E; margin: 0 0 0.6rem; border-left: 3px solid #FEE11A; padding-left: 0.5rem; }
    .note-block-content { font-size: 0.95rem; }
    .note-block-content h3 { font-size: 1rem; color: #007030; }
    .note-block-content ul, .note-block-content ol { padding-left: 1.4rem; }
    .note-block-content p { margin: 0.4rem 0; }

    /* ── Footer ── */
    .doc-footer { margin-top: 3rem; border-top: 3px solid #007030; font-family: Arial, sans-serif; font-size: 0.75rem; color: #888; display: flex; justify-content: space-between; align-items: center; padding-top: 0.75rem; }
    .doc-footer-uo { font-weight: 800; color: #007030; font-size: 0.9rem; }

    @media print {
      .doc-cover { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .doc-section-heading { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .doc-ip-notice { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .doc-section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="doc-cover">
    <div class="doc-cover-wordmark">
      <span class="doc-cover-uo">UO</span>
      <span class="doc-cover-school">University of Oregon<br>Lundquist College of Business<br>Product Studio</span>
    </div>
    <p class="doc-cover-title">AI Product Design Document</p>
    <p class="doc-cover-sub">Lithia Motors &nbsp;&middot;&nbsp; ${dateStr}</p>
    <div class="doc-cover-bar"></div>
  </div>

  <div class="doc-ip-notice">
    <strong>&#9632; Intellectual Property Notice</strong>
    ${ipNotice}
  </div>

  <div class="doc-body">
    ${sections || '<p style="color:#888">No notes found. Add notes on each page as you work through the course.</p>'}

    <div class="doc-footer">
      <span class="doc-footer-uo">UO</span>
      <span>Generated by the UO AI Product Studio &nbsp;&middot;&nbsp; University of Oregon &nbsp;&middot;&nbsp; Lundquist College of Business</span>
      <span>${dateStr}</span>
    </div>
  </div>
</body>
</html>`;
}

/** Strip HTML tags and decode basic entities to plain text */
function htmlToPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function buildDocx(): Promise<Blob> {
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const ipNotice =
    'This document contains intellectual property created by students of the Lundquist College of Business, ' +
    'University of Oregon, in partnership with Lithia Motors. All work, analyses, frameworks, and product concepts ' +
    'herein are the original work of the student team and are protected under applicable intellectual property laws. ' +
    'Unauthorized reproduction, distribution, or commercial use without written permission is prohibited.';

  const children: Paragraph[] = [
    // ── Header block ──
    new Paragraph({
      children: [
        new TextRun({ text: 'UNIVERSITY OF OREGON', bold: true, size: 18, color: 'FFFFFF', allCaps: true }),
        new TextRun({ text: '  ·  LUNDQUIST COLLEGE OF BUSINESS  ·  PRODUCT STUDIO', size: 16, color: 'FFFFFF', allCaps: true }),
      ],
      shading: { type: ShadingType.SOLID, color: '007030', fill: '007030' },
      spacing: { before: 0, after: 0 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'AI Product Design Document', bold: true, size: 52, color: 'FFFFFF' }),
      ],
      shading: { type: ShadingType.SOLID, color: '007030', fill: '007030' },
      spacing: { after: 0 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Lithia Motors  ·  ${dateStr}`, size: 20, color: 'FFFFFF', italics: true }),
      ],
      shading: { type: ShadingType.SOLID, color: '007030', fill: '007030' },
      spacing: { after: 0 },
    }),
    // Yellow accent bar (simulated with a yellow shaded empty paragraph)
    new Paragraph({
      children: [new TextRun({ text: '\u00A0' })],
      shading: { type: ShadingType.SOLID, color: 'FEE11A', fill: 'FEE11A' },
      spacing: { before: 0, after: 240 },
    }),

    // ── IP Notice ──
    new Paragraph({
      children: [
        new TextRun({ text: '\u25A0 INTELLECTUAL PROPERTY NOTICE', bold: true, size: 18, color: '7B6200', allCaps: true }),
      ],
      shading: { type: ShadingType.SOLID, color: 'FFF8DC', fill: 'FFF8DC' },
      spacing: { before: 0, after: 0 },
      border: { left: { style: 'single', size: 12, color: 'FEE11A' } },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: ipNotice, size: 16, color: '555555', italics: true }),
      ],
      shading: { type: ShadingType.SOLID, color: 'FFF8DC', fill: 'FFF8DC' },
      spacing: { after: 360 },
      border: { left: { style: 'single', size: 12, color: 'FEE11A' } },
    }),
  ];

  for (const section of DOC_STRUCTURE) {
    const sectionNotes = section.notes.filter((n) => hasContent(readNote(n.key)));
    if (sectionNotes.length === 0) continue;

    // Section heading with green shading
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: section.title.toUpperCase(),
            bold: true,
            color: 'FFFFFF',
            size: 22,
          }),
        ],
        shading: { type: ShadingType.SOLID, color: '007030', fill: '007030' },
        spacing: { before: 400, after: 200 },
      }),
    );

    for (const note of sectionNotes) {
      const plain = htmlToPlainText(readNote(note.key));

      // Note label
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: note.label,
              bold: true,
              color: '004F6E',
              underline: { type: UnderlineType.SINGLE },
            }),
          ],
          spacing: { before: 300, after: 100 },
        }),
      );

      // Note content — one paragraph per non-empty line
      for (const line of plain.split('\n')) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: line.trim() })],
            spacing: { after: 60 },
          }),
        );
      }

      children.push(new Paragraph({ text: '' }));
    }
  }

  children.push(new Paragraph({ children: [new PageBreak()] }));
  // ── Footer ──
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'UO  ', bold: true, color: '007030', size: 22 }),
        new TextRun({
          text: `Generated by the UO AI Product Studio · University of Oregon · Lundquist College of Business · ${dateStr}`,
          italics: true,
          color: '888888',
          size: 16,
        }),
      ],
      border: { top: { style: 'single', size: 6, color: '007030' } },
      spacing: { before: 240 },
    }),
  );
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '\u00A9 ' + new Date().getFullYear() + ' Student Team — Lundquist College of Business, University of Oregon. All rights reserved.',
          italics: true,
          color: 'AAAAAA',
          size: 14,
        }),
      ],
    }),
  );

  const doc = new Document({ sections: [{ children }] });
  return Packer.toBlob(doc);
}

function printAsPdf() {
  const html = buildHTML();
  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  // Small delay lets the browser render styles before print dialog opens
  setTimeout(() => { win.print(); }, 400);
}

// ────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────

function SectionPreview({ section }: { section: DocSection }) {
  const entries = section.notes.map((n) => ({
    ...n,
    html: readNote(n.key),
  }));
  const filledCount = entries.filter((e) => hasContent(e.html)).length;

  return (
    <div className={`gendoc-section ${filledCount === 0 ? 'gendoc-section--empty' : ''}`}>
      <div className="gendoc-section-header">
        <span className="gendoc-section-title">{section.title}</span>
        <span className={`gendoc-badge ${filledCount > 0 ? 'gendoc-badge--filled' : ''}`}>
          {filledCount} / {entries.length} notes
        </span>
      </div>

      {entries.map((e) => (
        <div key={e.key} className={`gendoc-note-row ${hasContent(e.html) ? 'gendoc-note-row--has-content' : ''}`}>
          <span className="gendoc-note-dot">{hasContent(e.html) ? '●' : '○'}</span>
          <span className="gendoc-note-label">{e.label}</span>
          {hasContent(e.html) && (
            <span className="gendoc-note-preview">
              {e.html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80)}…
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────────────────────

export default function GenerateDocumentPage() {
  const totalNotes = DOC_STRUCTURE.flatMap((s) => s.notes).length;
  const filledNotes = DOC_STRUCTURE.flatMap((s) => s.notes).filter((n) =>
    hasContent(readNote(n.key)),
  ).length;

  function downloadHTML() {
    const html = buildHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lithia-ai-product-design-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadJSON() {
    const json = JSON.stringify(buildJSON(), null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lithia-ai-product-design-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function downloadDocx() {
    const blob = await buildDocx();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lithia-ai-product-design-${Date.now()}.docx`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <section className="training-hero">
        <div className="training-hero-text">
          <h2>Generate Product Design Document</h2>
          <p className="training-hero-sub">
            Compile all of your notes from every section into a single, comprehensive AI Product Design Document.
          </p>
        </div>
        <div className="hero-due-box">
          <span>Final</span>
        </div>
      </section>

      <div className="design-page-body">
        <div className="gendoc-status-bar">
          <div className="gendoc-status-text">
            <strong>{filledNotes}</strong> of <strong>{totalNotes}</strong> sections have notes
          </div>
          <div className="gendoc-progress-track">
            <meter className="gendoc-progress-meter" value={filledNotes} max={totalNotes} />
          </div>
        </div>

        <div className="gendoc-actions">
          <button className="gendoc-btn-primary" onClick={downloadHTML}>
            ↓ Download as HTML
          </button>
          <button className="gendoc-btn-primary" onClick={downloadDocx}>
            ↓ Download as Word (.docx)
          </button>
          <button className="gendoc-btn-primary" onClick={printAsPdf}>
            ↓ Download as PDF
          </button>
          <button className="gendoc-btn-secondary" onClick={downloadJSON}>
            ↓ Export All Notes as JSON
          </button>
        </div>

        <p className="design-phase-intro gendoc-intro-gap">
          Every section below pulls from the notes you saved while working through the course.
          Sections with no notes will be omitted from the final document. Add notes on any page
          and come back here to regenerate.
        </p>

        <h3 className="design-section-heading">Notes Coverage</h3>
        <div className="gendoc-sections-list">
          {DOC_STRUCTURE.map((section) => (
            <SectionPreview key={section.id} section={section} />
          ))}
        </div>

        <div className="gendoc-actions gendoc-actions--bottom">
          <button className="gendoc-btn-primary" onClick={downloadHTML}>
            ↓ Download as HTML
          </button>
          <button className="gendoc-btn-primary" onClick={downloadDocx}>
            ↓ Download as Word (.docx)
          </button>
          <button className="gendoc-btn-primary" onClick={printAsPdf}>
            ↓ Download as PDF
          </button>
          <button className="gendoc-btn-secondary" onClick={downloadJSON}>
            ↓ Export All Notes as JSON
          </button>
        </div>
      </div>
    </div>
  );
}
