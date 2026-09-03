'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { TopBar } from '../components/Nav';
import BottomNav from '../components/Nav';

/* ── Zone definitions ── */
const ZONES = [
  ['zTop',    4,   36,  null,       true ],
  ['zLeft',   40,  47,  null,       false],
  ['zRight',  1,   8,   'inactive', true ],
  ['zRowA',   93,  120, null,       false],
  ['zRowB',   59,  86,  null,       true ],
  ['zBottom', 48,  80,  null,       false],
];

/* ── Floor levels A–Z ── */
const FLOORS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((l, i) => ({
  id: l, label: `Lantai ${l}`, desc: `Level ${l} — Basement ${i + 1}`,
}));

function pickKind() {
  const r = Math.random();
  return r < 0.05 ? 'inactive' : r < 0.42 ? 'full' : 'empty';
}

function buildSlots(seed = 0) {
  const all = [];
  ZONES.forEach(([id, from, to, forced, rev]) => {
    const nums = [];
    for (let n = from; n <= to; n++) nums.push(n);
    if (rev) nums.reverse();
    nums.forEach(n => all.push({ n, zoneId: id, kind: forced || pickKind() }));
  });
  return all;
}

const FLOOR_BG = '#151A24';
const ROAD_BG  = '#1C2230';

/* ── Slot button ── */
function Slot({ slot, sel, dim, onSelect }) {
  const bg = slot.kind === 'empty' ? '#2ECC71' : slot.kind === 'full' ? '#E74C3C' : '#F0A500';
  const fg = slot.kind === 'full' ? '#fff' : 'rgba(0,0,0,0.7)';
  return (
    <button type="button" onClick={() => onSelect(slot)} style={{
      width: 26, height: 32, borderRadius: 5, border: 'none',
      cursor: dim ? 'default' : 'pointer', background: bg, color: fg,
      fontSize: 8, fontWeight: 800, display: 'grid',
      placeItems: 'end center', paddingBottom: 2,
      outline: sel ? '2.5px solid #fff' : '2px solid transparent',
      outlineOffset: 1, opacity: dim ? 0.13 : 1,
      transform: sel ? 'translateY(-2px)' : undefined,
      transition: 'transform .1s, opacity .1s',
      pointerEvents: dim ? 'none' : 'auto', flexShrink: 0,
    }} aria-label={`Slot ${slot.n}`}>{slot.n}</button>
  );
}

/* ── Arrow row ── */
function Arrows({ dir, count = 3 }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-around', padding: '10px 100px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} style={{ color: '#556070', fontSize: 22, fontWeight: 700 }}>
          {dir === 'left' ? '←' : '→'}
        </span>
      ))}
    </div>
  );
}

/* ══════════ PAGE ══════════ */
export default function MapPage() {
  const [floor, setFloor]       = useState('A');
  const [allSlots, setAllSlots] = useState(() => buildSlots());
  const [filter, setFilter]     = useState('all');
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState(null);
  const [zoom, setZoom]         = useState(1);
  const [autoFit, setAutoFit]   = useState(true);

  const vpRef   = useRef(null);
  const planRef = useRef(null);

  /* Re-randomise when floor changes */
  useEffect(() => {
    setAllSlots(buildSlots(floor.charCodeAt(0)));
    setSelected(null);
  }, [floor]);

  /* group slots by zone */
  const byZone = {};
  ZONES.forEach(([id]) => (byZone[id] = []));
  allSlots.forEach(s => byZone[s.zoneId]?.push(s));

  const isDim = useCallback(s => {
    if (search) return String(s.n) !== search;
    if (filter === 'available')  return s.kind !== 'empty';
    if (filter === 'occupied')   return s.kind !== 'full';
    if (filter === 'ev')         return !(s.kind === 'empty' && s.n % 7 === 0);
    if (filter === 'accessible') return !(s.kind === 'empty' && s.n % 11 === 0);
    return false;
  }, [filter, search]);

  /* zoom helpers */
  const applyZoom = useCallback(v => {
    const z = Math.min(3, Math.max(0.25, +v.toFixed(2)));
    setZoom(z);
    if (planRef.current) planRef.current.style.zoom = z;
  }, []);

  const fitToWidth = useCallback(() => {
    if (!vpRef.current || !planRef.current) return;
    const ratio = (vpRef.current.clientWidth - 16) / planRef.current.offsetWidth;
    applyZoom(ratio < 1 ? ratio : 1);
  }, [applyZoom]);

  useEffect(() => {
    requestAnimationFrame(fitToWidth);
    const h = () => { if (autoFit) fitToWidth(); };
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [fitToWidth, autoFit]);

  const onWheel = useCallback(e => {
    if (!e.ctrlKey) return;
    e.preventDefault();
    setAutoFit(false);
    applyZoom(zoom - Math.sign(e.deltaY) * 0.15);
  }, [zoom, applyZoom]);
  useEffect(() => {
    const el = vpRef.current; if (!el) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  /* drag-to-pan */
  const drag = useRef({ on: false });
  const onPD = e => {
    if (e.target.closest('button[aria-label]')) return;
    drag.current = { on: true, sx: e.clientX, sy: e.clientY, l: vpRef.current.scrollLeft, t: vpRef.current.scrollTop };
    vpRef.current.style.cursor = 'grabbing';
    vpRef.current.setPointerCapture(e.pointerId);
  };
  const onPM = e => {
    if (!drag.current.on) return;
    vpRef.current.scrollLeft = drag.current.l - (e.clientX - drag.current.sx);
    vpRef.current.scrollTop  = drag.current.t  - (e.clientY - drag.current.sy);
  };
  const endDrag = () => { drag.current.on = false; if (vpRef.current) vpRef.current.style.cursor = 'grab'; };

  const avail = allSlots.filter(s => s.kind === 'empty').length;
  const inact = allSlots.filter(s => s.kind === 'inactive').length;
  const occ   = allSlots.length - avail - inact;

  const renderZone = id => (byZone[id] || []).map(s => (
    <Slot key={s.n} slot={s} sel={selected?.n === s.n} dim={isDim(s)}
      onSelect={sl => { setSelected(sl); setSearch(''); }} />
  ));

  const FILTERS = [['all','All Spots'],['available','Available'],['occupied','Occupied'],['ev','EV Charging'],['accessible','Accessible']];

  const ZBtn = ({ onClick, children }) => (
    <button type="button" onClick={onClick} style={{
      width: 30, height: 30, border: 'none', background: '#fff', cursor: 'pointer',
      display: 'grid', placeItems: 'center', fontSize: 14, color: '#14171F',
      borderBottom: '1px solid #E7E8EC',
    }}>{children}</button>
  );

  const curFloor = FLOORS.find(f => f.id === floor);

  return (
    <div className="page page--app">
      <TopBar title="Live Parking Map" showLogo />

      <main className="container stack gap-4" style={{ paddingTop: 20 }}>

        {/* ── Controls ── */}
        <div className="hero" style={{ padding: '18px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 20, flex: 1, minWidth: 200 }}>Live Parking Map</h1>

            {/* Floor dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                Pilih Lantai:
              </label>
              <select
                className="select"
                value={floor}
                onChange={e => setFloor(e.target.value)}
                style={{ minWidth: 160, paddingTop: 8, paddingBottom: 8 }}
              >
                {FLOORS.map(f => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
            </div>
          </div>

          <p className="muted small mt-2">{curFloor?.desc} · Data real-time</p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 14, alignItems: 'center' }}>
            <input className="input" style={{ maxWidth: 200 }}
              placeholder="🔍 Cari nomor slot…" inputMode="numeric"
              value={search} onChange={e => setSearch(e.target.value.replace(/\D/g, ''))} />
            <div className="filter-chips">
              {FILTERS.map(([id, lbl]) => (
                <button key={id} className={filter === id ? 'on' : ''}
                  onClick={() => { setFilter(id); setSearch(''); }}>{lbl}</button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            { label: 'Available', val: avail, c: '#2ECC71' },
            { label: 'Occupied',  val: occ,   c: '#E74C3C' },
            { label: 'Inactive',  val: inact,  c: '#F0A500' },
            { label: 'Total',     val: allSlots.length, c: '#fff' },
          ].map(s => (
            <div key={s.label} className="card" style={{ flex: 1, textAlign: 'center', padding: '14px 10px' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.c }}>{s.val}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Selected slot card ── */}
        {selected && (
          <div className="card" style={{ borderColor: 'var(--red-tint-2)', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div>
              <p style={{ fontWeight: 800, fontSize: 15 }}>Slot {selected.n} — {curFloor?.label}</p>
              <span className={`badge ${selected.kind === 'empty' ? 'ok' : selected.kind === 'full' ? 'danger' : 'warn'}`}
                style={{ marginTop: 6 }}>
                {selected.kind === 'empty' ? 'Available' : selected.kind === 'full' ? 'Occupied' : 'Inactive'}
              </span>
            </div>
            {selected.kind === 'empty' && (
              <Link className="btn" style={{ marginLeft: 'auto' }} href="/dashboard">Booking →</Link>
            )}
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 18 }}
              onClick={() => setSelected(null)}>✕</button>
          </div>
        )}

        {/* ══ FLOOR PLAN ══ */}
        <div style={{ position: 'relative' }}>

          {/* Zoom controls */}
          <div style={{
            position: 'absolute', top: 14, right: 14, zIndex: 10,
            display: 'flex', flexDirection: 'column',
            background: '#fff', borderRadius: 8,
            boxShadow: '0 4px 14px rgba(0,0,0,.2)', overflow: 'hidden',
          }}>
            <ZBtn onClick={() => { setAutoFit(false); applyZoom(zoom + 0.15); }}>+</ZBtn>
            <ZBtn onClick={() => { setAutoFit(false); applyZoom(zoom - 0.15); }}>−</ZBtn>
            <ZBtn onClick={() => { setAutoFit(true); fitToWidth(); vpRef.current?.scrollTo({ left:0,top:0,behavior:'smooth'}); }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>
              </svg>
            </ZBtn>
          </div>

          {/* Viewport */}
          <div ref={vpRef} style={{
            overflow: 'auto', background: '#0C1018',
            border: '1px solid #1E2535', borderRadius: 12,
            maxHeight: '72vh', cursor: 'grab',
          }}
            onPointerDown={onPD} onPointerMove={onPM}
            onPointerUp={endDrag} onPointerCancel={endDrag}
          >
            {/* ══ ARENA (no border walls) ══ */}
            <div ref={planRef} style={{ display: 'inline-block', minWidth: 1300 }}>
              <div style={{ background: FLOOR_BG, borderRadius: 10, position: 'relative' }}>

                {/* ── TOP LABEL BAR (Pintu Masuk left, Pintu Keluar right) ── */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                  padding: '10px 14px 4px',
                }}>
                  {/* Pintu Masuk */}
                  <div style={{
                    background: '#0A130E', border: '1px solid #2E5A3A',
                    borderRadius: 6, padding: '6px 12px',
                    display: 'flex', flexDirection: 'column', gap: 2,
                  }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#81C784', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M14 21V4H6v17M14 8h4v13"/>
                      </svg>
                      PINTU MASUK
                    </span>
                    <span style={{ fontSize: 9, color: '#4CAF50' }}>Mall ↑</span>
                  </div>

                  {/* Pintu Keluar */}
                  <div style={{
                    background: '#130A0A', border: '1px solid #5A2E2E',
                    borderRadius: 6, padding: '6px 12px',
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2,
                  }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#EF9A9A', display: 'flex', alignItems: 'center', gap: 5 }}>
                      PINTU KELUAR
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M10 21V4h8v17M10 8H6v13"/>
                      </svg>
                    </span>
                    <span style={{ fontSize: 9, color: '#EF5350' }}>↑ Mall</span>
                  </div>
                </div>

                {/* Inner content */}
                <div style={{ padding: '8px 14px 0', display: 'flex', flexDirection: 'column', gap: 0 }}>

                  {/* TOP ROW */}
                  <div style={{
                    background: ROAD_BG, borderRadius: 6,
                    padding: '10px 8px', display: 'flex', gap: 4, justifyContent: 'center',
                  }}>
                    {renderZone('zTop')}
                  </div>

                  {/* Arrows ← */}
                  <Arrows dir="left" count={3} />

                  {/* MIDDLE SECTION: [Left col] [road] [island: RowA+wall+RowB] [road] [Right col] */}
                  <div style={{ display: 'flex', alignItems: 'stretch', background: ROAD_BG, borderRadius: 6 }}>

                    {/* Left column slots */}
                    <div style={{
                      padding: '8px 6px', display: 'flex', flexDirection: 'column',
                      gap: 4, flexShrink: 0, justifyContent: 'flex-start',
                    }}>
                      {renderZone('zLeft')}
                    </div>

                    {/* Left road lane (circular traffic flows here, up/down) */}
                    <div style={{ flex: '0 0 52px' }} />

                    {/* CENTER ISLAND: Row A + yellow wall + Row B */}
                    {/* Yellow only spans the island width, NOT the road lanes */}
                    <div style={{
                      flex: 1, display: 'flex', flexDirection: 'column',
                      justifyContent: 'flex-start', padding: '10px 0',
                    }}>
                      {/* Row A */}
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                        {renderZone('zRowA')}
                      </div>

                      {/* Yellow center WALL — only spans island, road on left/right is open */}
                      <div style={{
                        height: 12, background: '#E6B31E', borderRadius: 2,
                        margin: '6px 0', flexShrink: 0,
                        /* No negative margin — stays within island bounds */
                      }} />

                      {/* Row B */}
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                        {renderZone('zRowB')}
                      </div>

                      {/* Road space below island for circular loop bottom */}
                      <div style={{ flex: 1, minHeight: 60 }} />
                    </div>

                    {/* Right road lane */}
                    <div style={{ flex: '0 0 52px' }} />

                    {/* Right column slots */}
                    <div style={{
                      padding: '8px 6px', display: 'flex', flexDirection: 'column',
                      gap: 4, flexShrink: 0, justifyContent: 'flex-start',
                    }}>
                      {renderZone('zRight')}
                    </div>
                  </div>

                  {/* Arrows → */}
                  <Arrows dir="right" count={2} />

                  {/* BOTTOM ROW */}
                  <div style={{
                    background: ROAD_BG, borderRadius: 6,
                    padding: '10px 8px', display: 'flex', gap: 4, justifyContent: 'center',
                  }}>
                    {renderZone('zBottom')}
                  </div>

                </div>

                {/* ── BOTTOM BAR (KELUAR / MASUK) ── */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 24px 12px',
                }}>
                  {/* KELUAR */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 100, height: 7, borderRadius: 3, background: 'repeating-linear-gradient(90deg,#E74C3C 0 12px,#555 12px 24px)' }} />
                    <span style={{ color: '#E74C3C', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14M6 13l6 6 6-6"/>
                      </svg>
                      KELUAR
                    </span>
                  </div>

                  <span style={{ color: '#3A4558', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em' }}>JALUR KENDARAAN</span>

                  {/* MASUK */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 100, height: 7, borderRadius: 3, background: 'repeating-linear-gradient(90deg,#2ECC71 0 12px,#555 12px 24px)' }} />
                    <span style={{ color: '#2ECC71', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 19V5M6 11l6-6 6 6"/>
                      </svg>
                      MASUK
                    </span>
                  </div>
                </div>

              </div>{/* /arena */}
            </div>{/* /plan */}
          </div>{/* /viewport */}

          <p style={{ fontSize: 11, color: '#6B7280', marginTop: 8, paddingLeft: 2 }}>
            Ctrl + scroll untuk zoom · drag untuk geser · klik slot untuk detail
          </p>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 20, marginTop: 8, fontSize: 12, color: 'var(--muted)' }}>
            {[['#2ECC71','Empty'],['#E74C3C','Full'],['#F0A500','Inactive']].map(([c,l]) => (
              <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <i style={{ width:12,height:12,borderRadius:3,background:c,display:'inline-block' }}/>{l}
              </span>
            ))}
          </div>
        </div>

      </main>
      <BottomNav />
    </div>
  );
}
