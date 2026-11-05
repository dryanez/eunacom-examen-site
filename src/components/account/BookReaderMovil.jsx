import React, { useEffect, useMemo, useRef, useState } from 'react'
import { X, Loader2, List, Search, ChevronLeft, ChevronRight, Moon, Sun, FileText, ZoomIn, ZoomOut } from 'lucide-react'
import { useAccount } from '../../lib/account'
import '../../styles/lector-movil.css'

// Modo celular (copiado del lector de eunacomapp: src/components/tienda/LectorMovil.jsx): el manual como texto adaptable.
// El contenido (JSON generado por books/scripts/build_movil.cjs) llega por un link temporal que el
// servidor firma solo si el usuario tiene el libro (/api/library?mode=movil). Mismos bloqueos que el
// lector PDF: sin copiar, seleccionar, clic derecho ni imprimir, y marca de agua con el correo.
const SIZES = [15, 16.5, 18, 20, 22, 25]
// sin tildes ni mayúsculas, conservando el largo (los índices sirven para el texto original)
const norm = s => s.replace(/[^\x00-\x7f]/g, c => c.normalize('NFD')[0]).toLowerCase()
const block = e => e.preventDefault()
const pref = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v) } catch { return d } }
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* modo privado */ } }

// marca de agua repetida (SVG de fondo, no seleccionable)
function markUrl(text, dark) {
  const t = text.replace(/[<&>"]/g, '')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200"><text x="160" y="100" text-anchor="middle" transform="rotate(-28 160 100)" font-family="sans-serif" font-size="12" font-weight="700" fill="${dark ? 'rgba(148,163,184,0.10)' : 'rgba(30,58,138,0.09)'}">${t}</text></svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

export default function LectorMovil({ item, title, fileIdx = 0, equipo = 'telefono', onClose, onPdf }) {
  const { user, authHeader } = useAccount()
  const [book, setBook] = useState(null)
  const [error, setError] = useState(null)
  const [cur, setCur] = useState(() => pref(`lm-pos-${item}`, 0))
  const [size, setSize] = useState(() => pref('lm-size', 1))
  const [dark, setDark] = useState(() => pref('lm-dark', false))
  const [panel, setPanel] = useState(null) // 'toc' | 'search' | null
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [hl, setHl] = useState('')
  const [tablas, setTablas] = useState(() => pref('lm-tablas', 'tarjetas')) // 'tarjetas' | 'tabla'
  // aviso «versión celular / la completa está en el computador»: una vez por sesión
  const [aviso, setAviso] = useState(() => { try { return !sessionStorage.getItem('lm-aviso') } catch { return true } })
  const cerrarAviso = () => { setAviso(false); try { sessionStorage.setItem('lm-aviso', '1') } catch { /* modo privado */ } }
  const [zoomed, setZoomed] = useState(null) // { svg } | { img } : visor a pantalla completa
  const boxRef = useRef(null)
  const bodyRef = useRef(null)
  const mark = `${user?.email || 'Examen EUNACOM'} · ${new Date().toLocaleDateString('es-CL')} · Examen EUNACOM`

  useEffect(() => {
    const onKey = e => {
      const k = e.key?.toLowerCase()
      if ((e.metaKey || e.ctrlKey) && ['s', 'p', 'c', 'a', 'x'].includes(k)) { e.preventDefault(); e.stopPropagation() }
      if ((e.metaKey || e.ctrlKey) && k === 'f') { e.preventDefault(); setPanel('search') }
      if (k === 'escape') onClose()
    }
    window.addEventListener('keydown', onKey, true)
    const style = document.createElement('style')
    style.textContent = '@media print { body * { visibility: hidden !important; } }'
    document.head.appendChild(style)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey, true); style.remove(); document.body.style.overflow = prev }
  }, [onClose])

  useEffect(() => {
    let cancelled = false
    setBook(null); setError(null)
    ;(async () => {
      try {
        const a = await fetch(`/api/library?item=${encodeURIComponent(item)}&file=${fileIdx}&mode=movil`, { headers: authHeader() })
        if (!a.ok) throw new Error(String(a.status))
        const { url } = await a.json()
        const r = await fetch(url)
        if (!r.ok) throw new Error(String(r.status))
        const j = await r.json()
        if (!cancelled) setBook(j)
      } catch (err) {
        if (cancelled) return
        const m = String(err.message || '')
        setError(m.includes('403') ? 'No tienes este libro en tu cuenta.' : m.includes('404') ? 'Este libro todavía no está en modo celular.' : 'No pudimos abrir el libro. Inténtalo de nuevo en un momento.')
      }
    })()
    return () => { cancelled = true }
  }, [item, fileIdx, user?.email])

  const topics = useMemo(() => (book?.blocks || []).flatMap(b => b.topics.map(t => ({ ...t, block: b }))), [book])
  const idx = Math.min(Math.max(0, cur), Math.max(0, topics.length - 1))
  const topic = topics[idx]

  // texto plano por tema para el buscador
  const plain = useMemo(() => topics.map(t => {
    const d = document.createElement('div')
    d.innerHTML = t.html.replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/<img[^>]*>/g, ' ')
    return t.title + ' · ' + d.textContent.replace(/\s+/g, ' ')
  }), [topics])

  useEffect(() => { save(`lm-pos-${item}`, idx) }, [item, idx])
  useEffect(() => { save('lm-size', size) }, [size])
  useEffect(() => { save('lm-dark', dark) }, [dark])
  useEffect(() => { save('lm-tablas', tablas) }, [tablas])

  // tablas: cada celda sabe su encabezado (para verlas como tarjetas) + botón para cambiar de vista
  useEffect(() => {
    const body = bodyRef.current
    if (!body) return
    body.querySelectorAll('.m-tbl').forEach(t => {
      const hs = [...t.querySelectorAll('thead th')].map(th => th.textContent.trim())
      t.querySelectorAll('tbody tr').forEach(tr => [...tr.children].forEach((td, i) => td.setAttribute('data-label', hs[i] || '')))
      const h = t.querySelector('.m-tbl-h')
      if (h && !h.querySelector('.m-tbl-mode')) {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'm-tbl-mode'; h.appendChild(b)
      }
    })
    body.querySelectorAll('.m-algo-b, .m-fig').forEach(el => el.setAttribute('data-zoom', ''))
  }, [idx, hl, book])

  // clics dentro del texto: cambiar vista de tabla o ampliar algoritmo/foto
  const onBodyClick = e => {
    if (e.target.closest('.m-tbl-mode')) { setTablas(t => t === 'tabla' ? 'tarjetas' : 'tabla'); return }
    const algo = e.target.closest('.m-algo-b')
    if (algo) { const svg = algo.querySelector('svg'); if (svg) setZoomed({ svg: svg.outerHTML, title: algo.previousElementSibling?.textContent || '' }); return }
    const fig = e.target.closest('.m-fig')
    if (fig) { const img = fig.querySelector('img'); if (img) setZoomed({ img: img.src, title: fig.querySelector('figcaption')?.textContent || '' }) }
  }

  const open = (i, q = '') => {
    setCur(i); setHl(q); setPanel(null)
    if (!q && boxRef.current) boxRef.current.scrollTop = 0
  }

  // al cambiar de tema: arriba, o al primer resultado resaltado
  useEffect(() => {
    const body = bodyRef.current, box = boxRef.current
    if (!body || !box) return
    if (!hl) { box.scrollTop = 0; return }
    const q = norm(hl)
    const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT)
    const hits = []
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (n.parentElement?.closest('svg')) continue
      if (norm(n.data).includes(q)) hits.push(n)
    }
    let first = null
    hits.forEach(n => {
      const t = norm(n.data)
      const frag = document.createDocumentFragment()
      let at = 0, i = t.indexOf(q)
      while (i >= 0) {
        frag.append(n.data.slice(at, i))
        const m = document.createElement('mark'); m.className = 'lm-hit'; m.textContent = n.data.slice(i, i + q.length)
        frag.append(m); first = first || m
        at = i + q.length; i = t.indexOf(q, at)
      }
      frag.append(n.data.slice(at))
      n.replaceWith(frag)
    })
    if (first) {
      first.closest('details')?.setAttribute('open', '')
      requestAnimationFrame(() => first.scrollIntoView({ block: 'center' }))
    } else box.scrollTop = 0
  }, [idx, hl, book])

  const runSearch = e => {
    e?.preventDefault()
    const q = norm(query.trim())
    if (q.length < 2) { setResults(null); return }
    const list = []
    plain.forEach((txt, i) => {
      const n = norm(txt)
      const first = n.indexOf(q)
      if (first < 0) return
      let count = 0
      for (let at = first; at >= 0; at = n.indexOf(q, at + q.length)) count++
      list.push({ i, count, snippet: txt.slice(Math.max(0, first - 50), first + q.length + 70) })
    })
    list.sort((a, b) => b.count - a.count)
    setResults({ q: query.trim(), list })
  }

  const fs = SIZES[Math.min(SIZES.length - 1, Math.max(0, size))]
  const themeStyle = book?.theme || {}

  return (
    <div className={`lm ${dark ? 'lm-dark' : ''}`} data-version="celular" data-equipo={equipo} onContextMenu={block} onDragStart={block} onCopy={block} onCut={block}>
      <div className="lm-bar">
        <button onClick={() => setPanel(p => p === 'toc' ? null : 'toc')} aria-label="Índice" className={`lm-btn ${panel === 'toc' ? 'on' : ''}`}><List size={18} /></button>
        <button onClick={() => setPanel(p => p === 'search' ? null : 'search')} aria-label="Buscar" className={`lm-btn ${panel === 'search' ? 'on' : ''}`}><Search size={17} /></button>
        <strong className="lm-title">{title}</strong>
        <button onClick={() => setSize(s => Math.max(0, s - 1))} disabled={size <= 0} aria-label="Letra más chica" className="lm-btn lm-a">A<small>−</small></button>
        <button onClick={() => setSize(s => Math.min(SIZES.length - 1, s + 1))} disabled={size >= SIZES.length - 1} aria-label="Letra más grande" className="lm-btn lm-a big">A<small>+</small></button>
        <button onClick={() => setDark(d => !d)} aria-label={dark ? 'Modo claro' : 'Modo oscuro'} className="lm-btn">{dark ? <Sun size={17} /> : <Moon size={17} />}</button>
        {onPdf && <button onClick={onPdf} aria-label="Ver en PDF" className="lm-btn lm-pdf"><FileText size={16} /><span>PDF</span></button>}
        <button onClick={onClose} aria-label="Cerrar lector" className="lm-btn"><X size={18} /></button>
      </div>

      <div className="lm-main">
        {panel && (
          <div className="lm-panel">
            <div className="lm-panel-h">
              <strong>{panel === 'toc' ? 'Índice' : 'Buscar en el libro'}</strong>
              <button onClick={() => setPanel(null)} aria-label="Cerrar panel" className="lm-btn"><X size={16} /></button>
            </div>
            {panel === 'toc' && (book?.blocks || []).map(b => (
              <div key={b.n}>
                <div className="lm-toc-b">Bloque {b.n} · {b.name}</div>
                {b.topics.map(t => {
                  const i = topics.findIndex(x => x.id === t.id)
                  return (
                    <button key={t.id} onClick={() => open(i)} className={`lm-toc-t ${i === idx ? 'cur' : ''}`}>
                      <span className="lm-toc-n">{t.label}</span><span>{t.title}</span>
                    </button>
                  )
                })}
              </div>
            ))}
            {panel === 'search' && (
              <>
                <form onSubmit={runSearch} className="lm-search">
                  <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Ej: levotiroxina" enterKeyHint="search" />
                  <button type="submit" className="lm-btn on" aria-label="Buscar"><Search size={16} /></button>
                </form>
                {results && <p className="lm-muted">{results.list.length ? `${results.list.length} tema${results.list.length === 1 ? '' : 's'} con «${results.q}»` : 'Sin resultados'}</p>}
                {results?.list.map(r => (
                  <button key={r.i} onClick={() => open(r.i, results.q)} className="lm-res">
                    <span className="lm-res-h">{topics[r.i].label} · {topics[r.i].title} <em>({r.count})</em></span>
                    <span className="lm-res-s">…{r.snippet}…</span>
                  </button>
                ))}
              </>
            )}
          </div>
        )}

        <div ref={boxRef} className="lm-scroll" style={{ backgroundImage: markUrl(mark, dark) }}>
          {error && (
            <div className="lm-msg">
              <p>{error}</p>
              {onPdf && <button onClick={onPdf} className="lm-btn on lm-pdf"><FileText size={16} /><span>Abrir en PDF</span></button>}
            </div>
          )}
          {!book && !error && <div className="lm-msg"><Loader2 size={18} className="spin" /> Abriendo libro...</div>}
          {topic && (
            <article className={`lm-doc ${tablas === 'tabla' ? 'lm-tabla' : 'lm-cards'}`} style={{ ...themeStyle, fontSize: fs }} onClick={onBodyClick}>
              {aviso && (
                <div className="lm-aviso" data-version="celular">
                  <b>📱 Estás en la versión celular</b>
                  <p>{equipo === 'telefono'
                    ? 'Es el mismo contenido del libro, adaptado a la pantalla del teléfono. La versión completa, con el diseño original de cada página, se ve mejor en el computador: entra a tu cuenta en el sitio desde el computador (Mi cuenta → Libros).'
                    : 'Es el mismo contenido del libro en texto adaptable. Para ver la versión completa con el diseño original de cada página, toca «PDF».'}</p>
                  <div className="lm-aviso-b">
                    {onPdf && <button onClick={onPdf} className="lm-navb">Ver PDF completo</button>}
                    <button onClick={cerrarAviso} className="lm-navb ok">Entendido</button>
                  </div>
                </div>
              )}
              <div className="lm-kicker">Bloque {topic.block.n} · {topic.block.name}</div>
              <h2><span className="lm-num">{topic.label}</span> {topic.title}</h2>
              <div ref={bodyRef} key={`${topic.id}-${hl}`} className="lm-body" dangerouslySetInnerHTML={{ __html: topic.html }} />
              <nav className="lm-nav">
                <button onClick={() => open(idx - 1)} disabled={idx <= 0} className="lm-navb"><ChevronLeft size={18} /><span>{idx > 0 ? topics[idx - 1].label : ''}</span></button>
                <span className="lm-muted">{idx + 1} / {topics.length}</span>
                <button onClick={() => open(idx + 1)} disabled={idx >= topics.length - 1} className="lm-navb"><span>{idx < topics.length - 1 ? topics[idx + 1].label : ''}</span><ChevronRight size={18} /></button>
              </nav>
            </article>
          )}
        </div>
      </div>
      {zoomed && <Visor z={zoomed} style={themeStyle} mark={mark} onClose={() => setZoomed(null)} />}
    </div>
  )
}

// Visor a pantalla completa de un algoritmo o foto: pellizco o botones para acercar, se mueve con el dedo.
function Visor({ z, style, mark, onClose }) {
  const [k, setK] = useState(1)
  const boxRef = useRef(null)
  const kRef = useRef(1)
  kRef.current = k
  const clamp = v => Math.min(4, Math.max(1, Math.round(v * 100) / 100))
  useEffect(() => {
    const box = boxRef.current
    if (!box) return
    let p = null
    const d = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY)
    const start = e => { if (e.touches.length === 2) p = { d: d(e.touches), k: kRef.current } }
    const move = e => { if (p && e.touches.length === 2) { e.preventDefault(); setK(clamp(p.k * d(e.touches) / p.d)) } }
    const end = e => { if (e.touches.length < 2) p = null }
    box.addEventListener('touchstart', start, { passive: true })
    box.addEventListener('touchmove', move, { passive: false })
    box.addEventListener('touchend', end)
    return () => { box.removeEventListener('touchstart', start); box.removeEventListener('touchmove', move); box.removeEventListener('touchend', end) }
  }, [])
  // al acercar con botones, mantener el centro
  const zoomBy = f => {
    const box = boxRef.current
    const cx = box ? (box.scrollLeft + box.clientWidth / 2) / box.scrollWidth : 0.5
    const cy = box ? (box.scrollTop + box.clientHeight / 2) / box.scrollHeight : 0.5
    setK(v => clamp(v * f))
    requestAnimationFrame(() => { if (box) { box.scrollLeft = cx * box.scrollWidth - box.clientWidth / 2; box.scrollTop = cy * box.scrollHeight - box.clientHeight / 2 } })
  }
  return (
    <div className="lm-visor" style={style}>
      <div className="lm-visor-bar">
        <span className="lm-visor-t">{z.title}</span>
        <button onClick={() => zoomBy(1 / 1.5)} disabled={k <= 1} aria-label="Alejar" className="lm-btn"><ZoomOut size={17} /></button>
        <button onClick={() => zoomBy(1.5)} disabled={k >= 4} aria-label="Acercar" className="lm-btn"><ZoomIn size={17} /></button>
        <button onClick={onClose} aria-label="Cerrar" className="lm-btn"><X size={18} /></button>
      </div>
      <div ref={boxRef} className="lm-visor-box" style={{ backgroundImage: markUrl(mark, false) }}>
        <div className="lm-visor-in" style={{ width: `${k * 100}%` }}>
          {z.svg ? <div className="lm-visor-svg" dangerouslySetInnerHTML={{ __html: z.svg }} /> : <img src={z.img} alt="" draggable={false} />}
        </div>
      </div>
      <p className="lm-visor-hint">Pellizca para acercar · gira el teléfono para verlo más grande</p>
    </div>
  )
}
