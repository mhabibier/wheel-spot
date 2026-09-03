'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { TopBar } from '../components/Nav';
import BottomNav from '../components/Nav';

const ZONES = [
  ['zTop',    9,   40,  null,       true ],
  ['zLeft',   41,  48,  null,       false],
  ['zRight',  1,   8,   'inactive', true ],
  ['zRowA',   49,  86,  null,       false],
  ['zRowB',   87,  120, null,       true ],
  ['zBottom', 121, 150, null,       false],
];

function pickKind() {
  const r = Math.random();
  return r < 0.05 ? 'inactive' : r < 0.46 ? 'full' : 'empty';
}

function buildSlots() {
  const all = [];
  ZONES.forEach(([zoneId, from, to, forced, reversed]) => {
    const nums = [];
    for (let n = from; n <= to; n++) nums.push(n);
    if (reversed) nums.reverse();
    nums.forEach(n => all.push({ n, zoneId, kind: forced || pickKind() }));
  });
  return all;
}

const STAR_SVG = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
    <path d="M12 5v14M6 13l6 6 6-6"/>
  </svg>
);

export default function MapPage() {
  const [allSlots]  = useState(buildSlots);
  const [filter, setFilter]     = useState('all');
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState(null);
  const [zoom, setZoom]         = useState(1);
  const [autoFit, setAutoFit]   = useState(true);

  const vpRef   = useRef(null);
  const pmapRef = useRef(null);

  const slotsByZone = {};
  ZONES.forEach(([id]) => (slotsByZone[id] = []));
  allSlots.forEach(s => slotsByZone[s.zoneId]?.push(s));

  const isDimmed = useCallback(slot => {
    if (search) return String(slot.n) !== search;
    if (filter === 'all')        return false;
    if (filter === 'available')  return slot.kind !== 'empty';
    if (filter === 'occupied')   return slot.kind !== 'full';
    if (filter === 'ev')         return !(slot.kind === 'empty' && slot.n % 7 === 0);
    if (filter === 'accessible') return !(slot.kind === 'empty' && slot.n % 11 === 0);
    return false;
  }, [filter, search]);

  const applyZoom = useCallback(v => {
    const z = Math.min(2.6, Math.max(0.3, Math.round(v * 100) / 100));
    setZoom(z);
    if (pmapRef.current) pmapRef.current.style.zoom = z;
  }, []);

  const fitToWidth = useCallback(() => {
    if (!vpRef.current || !pmapRef.current) return;
    const fit = (vpRef.current.clientWidth - 8) / pmapRef.current.offsetWidth;
    applyZoom(fit < 1 ? fit : 1);
  }, [applyZoom]);

  useEffect(() => {
    requestAnimationFrame(fitToWidth);
    const onResize = () => { if (autoFit) fitToWidth(); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [fitToWidth, autoFit]);

  /* drag-to-pan */
  const drag = useRef({ on: false, sx: 0, sy: 0, l: 0, t: 0 });
  const onPD = e => {
    if (e.target.closest('.pslot')) return;
    drag.current = { on: true, sx: e.clientX, sy: e.clientY, l: vpRef.current.scrollLeft, t: vpRef.current.scrollTop };
    vpRef.current.classList.add('grabbing');
    vpRef.current.setPointerCapture(e.pointerId);
  };
  const onPM = e => {
    if (!drag.current.on) return;
    vpRef.current.scrollLeft = drag.current.l - (e.clientX - drag.current.sx);
    vpRef.current.scrollTop  = drag.current.t  - (e.clientY - drag.current.sy);
  };
  const endDrag = () => { drag.current.on = false; vpRef.current?.classList.remove('grabbing'); };

  const onWheel = useCallback(e => {
    if (!e.ctrlKey) return;
    e.preventDefault();
    setAutoFit(false);
    applyZoom(zoom - Math.sign(e.deltaY) * 0.15);
  }, [zoom, applyZoom]);

  useEffect(() => {
    const el = vpRef.current;
    if (!el) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  const avail = allSlots.filter(s => s.kind === 'empty').length;
  const inact = allSlots.filter(s => s.kind === 'inactive').length;
  const occ   = allSlots.length - avail - inact;

  const renderZone = id =>
    (slotsByZone[id] || []).map(slot => (
      <button
        key={slot.n}
        type="button"
        className={[
          'pslot', slot.kind,
          selected?.n === slot.n ? 'sel' : '',
          isDimmed(slot) ? 'dim' : '',
        ].join(' ')}
        aria-label={`Slot ${slot.n}`}
        onClick={() => { setSelected(slot); setSearch(''); }}
      >
        {slot.n}
      </button>
    ));

  const ArrowRow = ({ dir, count = 3 }) => (
    <div style={{ display: 'flex', justifyContent: 'space-around', padding: '6px 60px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} style={{ color: '#F4F6F8', fontSize: 18, fontWeight: 700, letterSpacing: 2 }}>
          {dir === 'left' ? '←' : '→'}
        </span>
      ))}
    </div>
  );

  const FILTERS = ['all','available','occupied','ev','accessible'];
  const FILTER_LABELS = { all:'All Spots', available:'Available', occupied:'Occupied', ev:'EV Charging', accessible:'Accessible' };

  return (
    <div className="page page--app">
      <TopBar title="Live Parking Map" showLogo />

      <main className="container stack gap-4" style={{ paddingTop: 20 }}>

        {/* Search + filters */}
        <div className="hero" style={{ padding: 22 }}>
          <h1 style={{ fontSize: 22 }}>Live Parking Map</h1>
          <p className="muted small mt-2">Level B1 · Main Facility</p>
          <input
            className="input mt-3"
            placeholder="🔍 Cari nomor slot…"
            inputMode="numeric"
            value={search}
            onChange={e => setSearch(e.target.value.replace(/\D/g, ''))}
          />
          <p className="overline mt-4">Filters</p>
          <div className="filter-chips mt-2">
            {FILTERS.map(f => (
              <button key={f} className={filter === f ? 'on' : ''} onClick={() => { setFilter(f); setSearch(''); }}>
                {FILTER_LABELS[f]}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="card card--tint" style={{ display:'flex', justifyContent:'space-around', textAlign:'center' }}>
          <div><p style={{ fontSize:26, fontWeight:800, color:'var(--ok)' }}>{avail}</p><p className="overline">Available</p></div>
          <div><p style={{ fontSize:26, fontWeight:800, color:'var(--red)' }}>{occ}</p><p className="overline">Occupied</p></div>
        </div>

        {/* Slot info card */}
        <div className="card" style={{ borderColor:'var(--red-tint-2)' }}>
          {selected ? (
            <>
              <p style={{ fontWeight:800 }}>Slot {selected.n}</p>
              <p className="mt-2">
                <span className={`badge ${selected.kind === 'empty' ? 'ok' : selected.kind === 'full' ? 'danger' : 'warn'}`}>
                  {selected.kind === 'empty' ? 'Available' : selected.kind === 'full' ? 'Occupied' : 'Inactive'}
                </span>
              </p>
              <p className="small muted mt-2">
                {selected.kind === 'empty' ? 'Slot bisa dibooking sekarang.' : selected.kind === 'full' ? 'Slot sedang terisi.' : 'Sedang maintenance.'}
              </p>
              {selected.kind === 'empty' && (
                <Link className="btn btn--block mt-3" href="/dashboard">Booking Slot Ini →</Link>
              )}
            </>
          ) : (
            <p className="muted small">Klik slot pada denah untuk melihat detail.</p>
          )}
        </div>

        {/* ===== FLOOR PLAN ===== */}
        <div className="pmap-wrap">
          {/* Zoom bar */}
          <div className="zoombar">
            <button type="button" onClick={() => { setAutoFit(false); applyZoom(zoom + 0.2); }}>+</button>
            <button type="button" onClick={() => { setAutoFit(false); applyZoom(zoom - 0.2); }}>−</button>
            <button type="button" onClick={() => { setAutoFit(true); fitToWidth(); vpRef.current?.scrollTo({ left:0, top:0, behavior:'smooth' }); }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="3.5"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>
              </svg>
            </button>
          </div>
          <span className="zoom-hint">Ctrl+scroll untuk zoom · drag untuk geser</span>

          <div
            className="pmap-viewport"
            ref={vpRef}
            onPointerDown={onPD}
            onPointerMove={onPM}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            {/* ---- THE PLAN ---- */}
            <div ref={pmapRef} style={{
              width: 1380,
              background: '#12141C',
              margin: 0,
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 0,
              color: '#fff',
              borderRadius: 10,
            }}>

              {/* TOP WALL — green line + door labels */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'3px solid #1A8C4E', paddingBottom:8, marginBottom:10 }}>
                <span style={{
                  background:'#0E1016', border:'1px solid #414757', borderRadius:6,
                  padding:'6px 10px', fontSize:10, fontWeight:800, color:'#D6DAE2',
                  display:'flex', alignItems:'center', gap:6,
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M14 21V4H6v17M14 8h4v13M10 12h.01"/>
                  </svg>
                  Pintu masuk mall
                </span>
                <span style={{
                  background:'#0E1016', border:'1px solid #414757', borderRadius:6,
                  padding:'6px 10px', fontSize:10, fontWeight:800, color:'#D6DAE2',
                  display:'flex', alignItems:'center', gap:6,
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M10 21V4h8v17M10 8H6v13M14 12h-.01"/>
                  </svg>
                  Pintu keluar mall
                </span>
              </div>

              {/* TOP ROW of slots */}
              <div style={{ display:'flex', justifyContent:'center', gap:4, paddingLeft:50, paddingRight:50 }}>
                {renderZone('zTop')}
              </div>

              {/* Arrow row ← */}
              <ArrowRow dir="left" count={3} />

              {/* MIDDLE: left col | center rows | right col */}
              <div style={{ display:'flex', alignItems:'center', gap:8, paddingLeft:4, paddingRight:4 }}>

                {/* Left vertical column */}
                <div style={{ display:'flex', flexDirection:'column', gap:4, flexShrink:0 }}>
                  {renderZone('zLeft')}
                </div>

                {/* Center: Row A + yellow strip + Row B */}
                <div style={{ flex:1, display:'flex', flexDirection:'column', gap:4 }}>
                  <div style={{ display:'flex', gap:4, justifyContent:'center' }}>
                    {renderZone('zRowA')}
                  </div>
                  {/* Yellow island strip */}
                  <div style={{ height:10, background:'#E6B31E', borderRadius:3, margin:'2px 0' }}/>
                  <div style={{ display:'flex', gap:4, justifyContent:'center' }}>
                    {renderZone('zRowB')}
                  </div>
                </div>

                {/* Right vertical column */}
                <div style={{ display:'flex', flexDirection:'column', gap:4, flexShrink:0 }}>
                  {renderZone('zRight')}
                </div>
              </div>

              {/* Arrow row → */}
              <ArrowRow dir="right" count={2} />

              {/* BOTTOM ROW of slots */}
              <div style={{ display:'flex', justifyContent:'center', gap:4, paddingLeft:50, paddingRight:50 }}>
                {renderZone('zBottom')}
              </div>

              {/* BOTTOM WALL — green line + gates */}
              <div style={{ marginTop:10, borderTop:'3px solid #1A8C4E', paddingTop:8, display:'flex', justifyContent:'space-between', alignItems:'center', paddingLeft:10, paddingRight:10 }}>
                {/* Exit gate */}
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                  <div style={{ width:80, height:7, borderRadius:3, background:'repeating-linear-gradient(90deg,#F0554E 0 11px,#F4F4F4 11px 22px)' }}/>
                  <span style={{ color:'#FF6A63', fontSize:10, fontWeight:800, display:'flex', alignItems:'center', gap:4 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M6 13l6 6 6-6"/>
                    </svg>
                    KELUAR
                  </span>
                </div>
                {/* Enter gate */}
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                  <div style={{ width:80, height:7, borderRadius:3, background:'repeating-linear-gradient(90deg,#38D67A 0 11px,#F4F4F4 11px 22px)' }}/>
                  <span style={{ color:'#38D67A', fontSize:10, fontWeight:800, display:'flex', alignItems:'center', gap:4 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 19V5M6 11l6-6 6 6"/>
                    </svg>
                    MASUK
                  </span>
                </div>
              </div>

            </div>{/* /plan */}
          </div>{/* /viewport */}

          {/* Legend */}
          <div className="map-legend">
            <span><i style={{ background:'#43D17F' }}/> Empty</span>
            <span><i style={{ background:'#F0554E' }}/> Full</span>
            <span><i style={{ background:'#E6B31E' }}/> Inactive</span>
          </div>
        </div>

      </main>
      <BottomNav />
    </div>
  );
}
