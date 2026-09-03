'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { TopBar } from '../components/Nav';
import BottomNav from '../components/Nav';

/* ── Zone definitions matching the reference screenshot ── */
const ZONES = [
  ['zTop',    4,   36,  null,       true ],  // reversed → 36..4
  ['zLeft',   40,  47,  null,       false],  // 40..47 top→bottom
  ['zRight',  1,   8,   'inactive', true ],  // reversed → 8..1 top→bottom
  ['zRowA',   93,  120, null,       false],  // 93..120 left→right
  ['zRowB',   59,  86,  null,       true ],  // reversed → 86..59 left→right
  ['zBottom', 48,  80,  null,       false],  // 48..80 left→right
];

function pickKind() {
  const r = Math.random();
  return r < 0.05 ? 'inactive' : r < 0.42 ? 'full' : 'empty';
}

function buildSlots() {
  const all = [];
  ZONES.forEach(([id, from, to, forced, rev]) => {
    const nums = [];
    for (let n = from; n <= to; n++) nums.push(n);
    if (rev) nums.reverse();
    nums.forEach(n => all.push({ n, zoneId: id, kind: forced || pickKind() }));
  });
  return all;
}

/* ── Colours ── */
const WALL   = '#1B5E3B';
const FLOOR  = '#151A24';
const ROAD   = '#1C2230';

/* ── Slot button ── */
function Slot({ slot, sel, dim, onSelect }) {
  const bg = slot.kind === 'empty' ? '#2ECC71' : slot.kind === 'full' ? '#E74C3C' : '#F0A500';
  const fg = slot.kind === 'full' ? '#fff' : '#000';
  return (
    <button
      type="button"
      onClick={() => onSelect(slot)}
      style={{
        width: 26, height: 32, borderRadius: 5, border: 'none', cursor: dim ? 'default' : 'pointer',
        background: bg, color: fg, fontSize: 8, fontWeight: 800,
        display: 'grid', placeItems: 'end center', paddingBottom: 2,
        outline: sel ? '2.5px solid #fff' : '2px solid transparent',
        outlineOffset: 1,
        opacity: dim ? 0.15 : 1,
        transform: sel ? 'translateY(-2px)' : undefined,
        transition: 'transform .1s, opacity .1s',
        pointerEvents: dim ? 'none' : 'auto',
      }}
      aria-label={`Slot ${slot.n}`}
    >{slot.n}</button>
  );
}

/* ── Arrows ── */
function Arrows({ dir, count = 3 }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-around', padding: '8px 80px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} style={{ color: '#8899BB', fontSize: 20, fontWeight: 700, userSelect: 'none' }}>
          {dir === 'left' ? '←' : '→'}
        </span>
      ))}
    </div>
  );
}

/* ── Door card ── */
function DoorCard({ label, side, icon }) {
  return (
    <div style={{
      background: '#0F1A14', border: `2px solid ${WALL}`,
      borderRadius: 6, padding: '5px 10px', fontSize: 10,
      fontWeight: 800, color: '#C8E6C9', whiteSpace: 'nowrap',
      display: 'flex', flexDirection: 'column', alignItems: side === 'left' ? 'flex-start' : 'flex-end',
      gap: 2, minWidth: 72,
    }}>
      {icon}
      <span style={{ fontSize: 9, lineHeight: 1.2 }}>{label}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════ */
export default function MapPage() {
  const [allSlots] = useState(buildSlots);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [autoFit, setAutoFit] = useState(true);

  const vpRef   = useRef(null);
  const planRef = useRef(null);

  /* group by zone */
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

  /* zoom */
  const applyZoom = useCallback(v => {
    const z = Math.min(3, Math.max(0.3, +v.toFixed(2)));
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

  /* wheel zoom */
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

  /* drag */
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

  const renderZone = id =>
    (byZone[id] || []).map(s => (
      <Slot key={s.n} slot={s} sel={selected?.n === s.n} dim={isDim(s)}
        onSelect={sl => { setSelected(sl); setSearch(''); }} />
    ));

  const FILTERS = [
    ['all','All Spots'], ['available','Available'],
    ['occupied','Occupied'], ['ev','EV Charging'], ['accessible','Accessible']
  ];

  /* ── Zoom bar button ── */
  const ZBtn = ({ onClick, children }) => (
    <button type="button" onClick={onClick} style={{
      width: 30, height: 30, border: 'none', background: '#fff', cursor: 'pointer',
      display: 'grid', placeItems: 'center', fontSize: 14, color: '#14171F',
      borderBottom: '1px solid #E7E8EC',
    }}>{children}</button>
  );

  return (
    <div className="page page--app">
      <TopBar title="Live Parking Map" showLogo />

      <main className="container stack gap-4" style={{ paddingTop: 20 }}>

        {/* ── Controls ── */}
        <div className="hero" style={{ padding: '18px 22px' }}>
          <h1 style={{ fontSize: 20 }}>Live Parking Map — Level B1</h1>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 14, alignItems: 'center' }}>
            <input className="input" style={{ maxWidth: 220, marginTop: 0 }}
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
            { label: 'Available', val: avail, color: '#2ECC71' },
            { label: 'Occupied',  val: occ,   color: '#E74C3C' },
            { label: 'Inactive',  val: inact,  color: '#F0A500' },
            { label: 'Total',     val: allSlots.length, color: '#fff' },
          ].map(s => (
            <div key={s.label} className="card" style={{ flex: 1, textAlign: 'center', padding: '14px 10px' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Selected slot info ── */}
        {selected && (
          <div className="card" style={{ borderColor: 'var(--red-tint-2)', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div>
              <p style={{ fontWeight: 800, fontSize: 15 }}>Slot {selected.n}</p>
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

          {/* Zoom bar */}
          <div style={{
            position: 'absolute', top: 14, right: 14, zIndex: 10,
            display: 'flex', flexDirection: 'column',
            background: '#fff', borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,.15)', overflow: 'hidden',
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
            border: '1px solid #222A38', borderRadius: 12,
            maxHeight: '72vh', cursor: 'grab',
          }}
            onPointerDown={onPD} onPointerMove={onPM}
            onPointerUp={endDrag} onPointerCancel={endDrag}
          >

            {/* ══ ARENA ══ */}
            <div ref={planRef} style={{ display: 'inline-block', padding: 16 }}>
              <div style={{
                background: FLOOR,
                borderLeft:   `4px solid ${WALL}`,
                borderRight:  `4px solid ${WALL}`,
                borderBottom: `4px solid ${WALL}`,
                borderRadius: '0 0 10px 10px',
                minWidth: 1300,
              }}>

                {/* ── TOP WALL with door cards ── */}
                <div style={{ display: 'flex', alignItems: 'center', borderTop: `4px solid ${WALL}` }}>

                  {/* Pintu Masuk */}
                  <div style={{
                    background: '#0A1A0F', border: `2px solid ${WALL}`,
                    borderTop: 'none', borderLeft: 'none',
                    borderRadius: '0 0 8px 0',
                    padding: '8px 14px', minWidth: 90,
                    display: 'flex', flexDirection: 'column', gap: 4,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round">
                        <path d="M14 21V4H6v17M14 8h4v13M10 12h.01"/>
                      </svg>
                      <span style={{ fontSize: 9, fontWeight: 800, color: '#81C784', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Pintu Masuk
                      </span>
                    </div>
                    <span style={{ fontSize: 8, color: '#4CAF50', fontWeight: 700 }}>Mall ↗</span>
                  </div>

                  {/* Middle wall segment */}
                  <div style={{ flex: 1, height: 4, background: WALL, marginTop: -4 }} />

                  {/* Pintu Keluar */}
                  <div style={{
                    background: '#1A0A0A', border: `2px solid ${WALL}`,
                    borderTop: 'none', borderRight: 'none',
                    borderRadius: '0 0 0 8px',
                    padding: '8px 14px', minWidth: 90,
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ fontSize: 9, fontWeight: 800, color: '#EF9A9A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Pintu Keluar
                      </span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF5350" strokeWidth="2" strokeLinecap="round">
                        <path d="M10 21V4h8v17M10 8H6v13M14 12h-.01"/>
                      </svg>
                    </div>
                    <span style={{ fontSize: 8, color: '#EF5350', fontWeight: 700 }}>↗ Mall</span>
                  </div>
                </div>

                {/* ── Padding inside ── */}
                <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 0 }}>

                  {/* TOP ROW slots */}
                  <div style={{ background: ROAD, borderRadius: 6, padding: '10px 8px', display: 'flex', gap: 4, flexWrap: 'nowrap', justifyContent: 'center' }}>
                    {renderZone('zTop')}
                  </div>

                  {/* Road + arrows ← */}
                  <Arrows dir="left" count={3} />

                  {/* MIDDLE SECTION */}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>

                    {/* Left vertical column */}
                    <div style={{
                      background: ROAD, borderRadius: 6,
                      padding: '8px 6px', display: 'flex', flexDirection: 'column', gap: 4,
                      flexShrink: 0, justifyContent: 'center',
                    }}>
                      {renderZone('zLeft')}
                    </div>

                    {/* Center: Row A + yellow strip + Row B */}
                    <div style={{ flex: 1, background: ROAD, borderRadius: 6, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                        {renderZone('zRowA')}
                      </div>
                      {/* Yellow island */}
                      <div style={{ height: 10, background: '#E6B31E', borderRadius: 3, margin: '4px 0' }} />
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                        {renderZone('zRowB')}
                      </div>
                    </div>

                    {/* Right vertical column */}
                    <div style={{
                      background: ROAD, borderRadius: 6,
                      padding: '8px 6px', display: 'flex', flexDirection: 'column', gap: 4,
                      flexShrink: 0, justifyContent: 'center',
                    }}>
                      {renderZone('zRight')}
                    </div>
                  </div>

                  {/* Road + arrows → */}
                  <Arrows dir="right" count={2} />

                  {/* BOTTOM ROW slots */}
                  <div style={{ background: ROAD, borderRadius: 6, padding: '10px 8px', display: 'flex', gap: 4, flexWrap: 'nowrap', justifyContent: 'center' }}>
                    {renderZone('zBottom')}
                  </div>

                </div>{/* /inner padding */}

                {/* ── BOTTOM WALL ── */}
                <div style={{ borderTop: `4px solid ${WALL}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 24px' }}>

                  {/* KELUAR gate */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 90, height: 7, borderRadius: 3, background: 'repeating-linear-gradient(90deg,#E74C3C 0 12px,#ccc 12px 24px)' }} />
                    <span style={{ color: '#E74C3C', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14M6 13l6 6 6-6"/>
                      </svg>
                      KELUAR
                    </span>
                  </div>

                  {/* Center label */}
                  <span style={{ color: '#4A5568', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em' }}>
                    JALUR KENDARAAN
                  </span>

                  {/* MASUK gate */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 90, height: 7, borderRadius: 3, background: 'repeating-linear-gradient(90deg,#2ECC71 0 12px,#ccc 12px 24px)' }} />
                    <span style={{ color: '#2ECC71', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 19V5M6 11l6-6 6 6"/>
                      </svg>
                      MASUK
                    </span>
                  </div>
                </div>

              </div>{/* /arena */}
            </div>{/* /plan */}
          </div>{/* /viewport */}

          {/* Hint */}
          <p style={{ fontSize: 11, color: '#4A5568', marginTop: 8, paddingLeft: 4 }}>
            Ctrl + scroll untuk zoom &nbsp;·&nbsp; drag untuk geser &nbsp;·&nbsp; klik slot untuk detail
          </p>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 20, marginTop: 10, fontSize: 12, color: 'var(--muted)' }}>
            {[['#2ECC71','Empty'],['#E74C3C','Full'],['#F0A500','Inactive']].map(([c,l]) => (
              <span key={l} style={{ display:'flex', alignItems:'center', gap:6 }}>
                <i style={{ width:12,height:12,borderRadius:3,background:c,display:'inline-block' }}/>
                {l}
              </span>
            ))}
          </div>
        </div>

      </main>
      <BottomNav />
    </div>
  );
}
