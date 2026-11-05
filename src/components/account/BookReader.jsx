import React, { useEffect, useRef, useState } from 'react';
import { X, ZoomIn, ZoomOut, Loader2, Smartphone } from 'lucide-react';
import { useAccount } from '../../lib/account';
import BookReaderMovil from './BookReaderMovil';

// Online-only reader (ported from eunacomapp's LectorLibro): pages are drawn on <canvas> (no text to copy), with
// the reader's email as a watermark; right-click, drag, selection and save/print/copy shortcuts are blocked.
// The PDF comes from a 10-minute link that /api/library only signs for owners.
let pdfjsPromise = null;
function loadPdfjs() {
  pdfjsPromise ||= Promise.all([import('pdfjs-dist'), import('pdfjs-dist/build/pdf.worker.min.mjs?url')]).then(([lib, worker]) => {
    lib.GlobalWorkerOptions.workerSrc = worker.default;
    return lib;
  });
  return pdfjsPromise;
}
const block = e => e.preventDefault();

function Page({ pdf, n, width, ratio, mark }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { rootMargin: '800px 0px' });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!visible || !width) return;
    let task, cancelled = false;
    pdf.getPage(n).then(page => {
      if (cancelled) return;
      const base = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: (width / base.width) * Math.min(devicePixelRatio || 1, 2) });
      const canvas = ref.current?.querySelector('canvas');
      if (!canvas) return;
      canvas.width = viewport.width; canvas.height = viewport.height;
      task = page.render({ canvasContext: canvas.getContext('2d'), viewport });
    });
    return () => { cancelled = true; task?.cancel?.(); };
  }, [visible, width, pdf, n]);
  return (
    <div ref={ref} className="rd-page" style={{ width, height: width * ratio }}>
      <canvas style={{ width: '100%', height: '100%', display: 'block' }} />
      <div className="rd-mark">{mark}</div>
    </div>
  );
}

// Modo celular para los manuales (tomo-*): en el teléfono parte en ese modo, en el computador en el PDF.
// Teléfono = pantalla táctil y chica. La elección se recuerda por separado en cada tipo de equipo.
export function tipoEquipo() {
  if (!window.matchMedia) return window.innerWidth < 640 ? 'telefono' : 'computador';
  const corto = Math.min(window.screen?.width || 9999, window.screen?.height || 9999);
  return window.matchMedia('(pointer: coarse)').matches && corto < 600 ? 'telefono' : 'computador';
}
export default function BookReader(props) {
  const movilOk = /^tomo-/.test(props.item);
  const equipo = tipoEquipo();
  const key = `lector-modo-${equipo}`;
  const [modo, setModo] = useState(() => {
    let p = null;
    try { p = localStorage.getItem(key); } catch { /* modo privado */ }
    return movilOk && (p ? p === 'movil' : equipo === 'telefono') ? 'movil' : 'pdf';
  });
  const cambiar = m => { setModo(m); try { localStorage.setItem(key, m); } catch { /* modo privado */ } };
  if (movilOk && modo === 'movil') return <BookReaderMovil item={props.item} title={props.title} equipo={equipo} onClose={props.onClose} onPdf={() => cambiar('pdf')} />;
  return <BookReaderPdf {...props} onMovil={movilOk ? () => cambiar('movil') : null} />;
}

function BookReaderPdf({ item, title, onClose, onMovil }) {
  const { user, authHeader } = useAccount();
  const [pdf, setPdf] = useState(null);
  const [error, setError] = useState(null);
  const [ratio, setRatio] = useState(1.414);
  const [zoom, setZoom] = useState(1);
  const [boxW, setBoxW] = useState(800);
  const boxRef = useRef(null);

  useEffect(() => {
    const measure = () => setBoxW(Math.min((boxRef.current?.clientWidth || 800) - 24, 900));
    measure(); addEventListener('resize', measure);
    const keys = e => { if ((e.metaKey || e.ctrlKey) && /^[spc]$/i.test(e.key)) e.preventDefault(); if (e.key === 'Escape') onClose(); };
    addEventListener('keydown', keys);
    document.body.style.overflow = 'hidden';
    return () => { removeEventListener('resize', measure); removeEventListener('keydown', keys); document.body.style.overflow = ''; };
  }, [onClose]);

  useEffect(() => {
    let doc, task, cancelled = false;
    (async () => {
      try {
        const r = await fetch(`/api/library?item=${encodeURIComponent(item)}`, { headers: authHeader() });
        if (!r.ok) throw new Error(String(r.status));
        const { url } = await r.json();
        const lib = await loadPdfjs();
        task = lib.getDocument({ url, disableAutoFetch: true });
        doc = await task.promise;
        const first = (await doc.getPage(1)).getViewport({ scale: 1 });
        if (cancelled) return task.destroy?.();
        setRatio(first.height / first.width); setPdf(doc);
      } catch (e) {
        if (!cancelled) setError(e.message === '403' ? 'Este libro no está en tu cuenta.' : e.message === '503' ? 'El lector se está configurando. Vuelve en un rato.' : 'No pudimos abrir el libro. Inténtalo de nuevo.');
      }
    })();
    // pdf.js 6: se libera con la tarea de carga (el documento ya no tiene destroy())
    return () => { cancelled = true; task?.destroy?.(); };
  }, [item]);

  const width = Math.round(boxW * zoom);
  return (
    <div className="rd" onContextMenu={block} onDragStart={block} onCopy={block} data-version="pdf">
      <div className="rd-bar">
        <b>{title}</b>
        <span className="rd-tools">
          <button onClick={() => setZoom(z => Math.max(.6, z - .2))} aria-label="Alejar"><ZoomOut size={18} /></button>
          <button onClick={() => setZoom(z => Math.min(2, z + .2))} aria-label="Acercar"><ZoomIn size={18} /></button>
          {onMovil && <button onClick={onMovil} aria-label="Modo celular" style={{ gap: 5, alignItems: 'center', background: '#2563eb', fontWeight: 700, fontSize: 13, padding: '7px 10px' }}><Smartphone size={16} />Celular</button>}
          <button onClick={onClose} aria-label="Cerrar"><X size={20} /></button>
        </span>
      </div>
      <div className="rd-body" ref={boxRef}>
        {error ? <p className="rd-msg">{error}</p>
          : !pdf ? <p className="rd-msg"><Loader2 size={18} className="spin" /> Abriendo libro…</p>
          : Array.from({ length: pdf.numPages }, (_, i) => <Page key={i} pdf={pdf} n={i + 1} width={width} ratio={ratio} mark={user?.email} />)}
      </div>
    </div>
  );
}
