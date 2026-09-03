'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { TopBar } from '../components/Nav';
import BottomNav from '../components/Nav';

/* ------------------------------------------------------------------ */
/*  Zone configuration: [id, from, to, forced?, reversed?]            */
/* ------------------------------------------------------------------ */
const ZONES = [
  ['zRight',  1,   8,   'inactive', false],
  ['zTop',    9,   40,  null,       true ],
  ['zLeft',   41,  48,  null,       false],
  ['zRowA',   49,  86,  null,       false],
  ['zRowB',   87,  120, null,       true ],
  ['zBottom', 121, 150, null,       false],
];

function pickKind() {
  const r = Math.random();
  return r < 0.05 ? 'inactive' : r < 0.46 ? 'full' : 'empty';
}

/* ------------------------------------------------------------------ */
/*  Generate slot data once (stable across renders)                    */
/* ------------------------------------------------------------------ */
function buildSlots() {
  const slots = [];
  ZONES.forEach(([zoneId, from, to, forced]) => {
    const nums = [];
    for (let n = from; n <= to; n++) nums.push(n);
    nums.forEach((n) => {
      slots.push({ n, zoneId, kind: forced || pickKind() });
    });
  });
  return slots;
}

/* ------------------------------------------------------------------ */
/*  ParkingSlot button                                                  */
/* ------------------------------------------------------------------ */
function ParkingSlot({ slot, selected, dimmed, onSelect }) {
  return (
    <button
      type="button"
      className={`pslot ${slot.kind}${selected ? ' sel' : ''}${dimmed ? ' dim' : ''}`}
      aria-label={`Slot ${slot.n} — ${slot.kind}`}
      onClick={() => onSelect(slot)}
      style={{ cursor: dimmed ? 'default' : 'pointer' }}
    >
      {slot.n}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Arrow helper                                                        */
/* ------------------------------------------------------------------ */
function Arrow({ d, style }) {
  const paths = {
    right: 'm10 6 6 6-6 6',
    left:  'm14 6-6 6 6 6',
    down:  'm6 10 6 6 6-6',
    up:    'm18 14-6-6-6 6',
  };
  return (
    <span className={`rarrow ${d[0]}`} style={style}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d={paths[d]}/>
      </svg>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page component                                                 */
/* ------------------------------------------------------------------ */
export default function MapPage() {
  const [allSlots]     = useState(buildSlots);
  const [filter, setFilter]   = useState('all');
  const [search, setSearch]   = useState('');
  const [selected, setSelected] = useState(null);
  const [zoom, setZoom]        = useState(1);
  const [autoFit, setAutoFit]  = useState(true);

  const vpRef   = useRef(null);
  const pmapRef = useRef(null);

  /* ---------- derived lists ---------- */
  const slotsByZone = {};
  ZONES.forEach(([id]) => (slotsByZone[id] = []));
  allSlots.forEach((s) => slotsByZone[s.zoneId]?.push(s));

  const isDimmed = useCallback((slot) => {
    if (search) return String(slot.n) !== search;
    if (filter === 'all') return false;
    if (filter === 'available')  return slot.kind !== 'empty';
    if (filter === 'occupied')   return slot.kind !== 'full';
    if (filter === 'ev')         return !(slot.kind === 'empty' && slot.n % 7 === 0);
    if (filter === 'accessible') return !(slot.kind === 'empty' && slot.n % 11 === 0);
    return false;
  }, [filter, search]);

  /* ---------- zoom / fit ---------- */
  const applyZoom = useCallback((v) => {
    const clamped = Math.min(2.6, Math.max(0.4, Math.round(v * 100) / 100));
    setZoom(clamped);
    if (pmapRef.current) pmapRef.current.style.zoom = clamped;
  }, []);

  const fitToWidth = useCallback(() => {
    if (!vpRef.current || !pmapRef.current) return;
    const fit = (vpRef.current.clientWidth - 8) / pmapRef.current.offsetWidth;
    applyZoom(fit < 1 ? fit : 1);
  }, [applyZoom]);

  /* initial fit */
  useEffect(() => {
    requestAnimationFrame(fitToWidth);
    const onResize = () => { if (autoFit) fitToWidth(); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [fitToWidth, autoFit]);

  /* ---------- drag-to-pan ---------- */
  const drag = useRef({ on: false, sx: 0, sy: 0, l: 0, t: 0 });
  const onPointerDown = (e) => {
    if (e.target.closest('.pslot')) return;
    drag.current = { on: true, sx: e.clientX, sy: e.clientY, l: vpRef.current.scrollLeft, t: vpRef.current.scrollTop };
    vpRef.current.classList.add('grabbing');
    vpRef.current.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!drag.current.on) return;
    vpRef.current.scrollLeft = drag.current.l - (e.clientX - drag.current.sx);
    vpRef.current.scrollTop  = drag.current.t  - (e.clientY - drag.current.sy);
  };
  const endDrag = () => { drag.current.on = false; vpRef.current?.classList.remove('grabbing'); };

  /* Ctrl+Wheel zoom */
  const onWheel = useCallback((e) => {
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

  /* ---------- stats ---------- */
  const avail = allSlots.filter((s) => s.kind === 'empty').length;
  const inact = allSlots.filter((s) => s.kind === 'inactive').length;
  const occ   = allSlots.length - avail - inact;

  /* ---------- render zone ---------- */
  const renderZone = (id) =>
    (slotsByZone[id] || []).map((slot) => (
      <ParkingSlot
        key={slot.n}
        slot={slot}
        selected={selected?.n === slot.n}
        dimmed={isDimmed(slot)}
        onSelect={(s) => {
          setSelected(s);
          if (search) setSearch('');
        }}
      />
    ));

  const FILTERS = [
    { id: 'all', label: 'All Spots' },
    { id: 'available', label: 'Available' },
    { id: 'occupied', label: 'Occupied' },
    { id: 'ev', label: 'EV Charging' },
    { id: 'accessible', label: 'Accessible' },
  ];

  return (
    <div className="page page--app">
      <TopBar title="Live Parking Map" showLogo />

      <main className="container stack gap-4" style={{ paddingTop: 20 }}>

        {/* ---- Hero / search / filters ---- */}
        <div className="hero" style={{ padding: 22 }}>
          <h1 style={{ fontSize: 22 }}>Live Parking Map</h1>
          <p className="muted small mt-2">Level B1 · Main Facility</p>
          <input
            id="mapSearch"
            className="input mt-3"
            placeholder="🔍 Cari nomor slot…"
            inputMode="numeric"
            value={search}
            onChange={(e) => setSearch(e.target.value.replace(/\D/g, ''))}
          />
          <p className="overline mt-4">Filters</p>
          <div id="mapFilters" className="filter-chips mt-2">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                className={filter === f.id ? 'on' : ''}
                data-filter={f.id}
                onClick={() => { setFilter(f.id); setSearch(''); }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ---- Availability summary ---- */}
        <div className="card card--tint" style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
          <div>
            <p style={{ fontSize: 26, fontWeight: 800, color: 'var(--ok)' }} id="mapAvail">{avail}</p>
            <p className="overline">Available</p>
          </div>
          <div>
            <p style={{ fontSize: 26, fontWeight: 800, color: 'var(--red)' }} id="mapOcc">{occ}</p>
            <p className="overline">Occupied</p>
          </div>
        </div>

        {/* ---- Selected slot info ---- */}
        <div id="slotInfo" className="card" style={{ borderColor: 'var(--red-tint-2)' }}>
          {selected ? (
            <>
              <p style={{ fontWeight: 800 }}>Slot {selected.n}</p>
              <p className="mt-2">
                <span className={`badge ${selected.kind === 'empty' ? 'ok' : selected.kind === 'full' ? 'danger' : 'warn'}`}>
                  {selected.kind === 'empty' ? 'Available' : selected.kind === 'full' ? 'Occupied' : 'Inactive'}
                </span>
              </p>
              <p className="small muted mt-2">
                {selected.kind === 'empty'
                  ? 'Standard car size. Slot bisa dibooking sekarang.'
                  : selected.kind === 'full'
                  ? 'Standard car size. Not equipped with EV charging.'
                  : 'Sedang maintenance — tidak tersedia.'}
              </p>
              {selected.kind === 'empty' && (
                <Link className="btn btn--block mt-3" href="/dashboard">Booking Slot Ini →</Link>
              )}
            </>
          ) : (
            <>
              <p style={{ fontWeight: 800, color: 'var(--muted)' }}>Pilih slot untuk melihat detail</p>
              <p className="small muted mt-2">Klik salah satu slot pada denah di bawah.</p>
            </>
          )}
        </div>

        {/* ---- Parking floor plan ---- */}
        <div className="pmap-wrap">
          {/* Zoom controls */}
          <div className="zoombar">
            <button id="zoomIn" type="button" aria-label="Perbesar" onClick={() => { setAutoFit(false); applyZoom(zoom + 0.2); }}>+</button>
            <button id="zoomOut" type="button" aria-label="Perkecil" onClick={() => { setAutoFit(false); applyZoom(zoom - 0.2); }}>−</button>
            <button id="zoomReset" type="button" aria-label="Atur ulang tampilan" onClick={() => { setAutoFit(true); fitToWidth(); vpRef.current?.scrollTo({ left: 0, top: 0, behavior: 'smooth' }); }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="3.5"/>
                <path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>
              </svg>
            </button>
          </div>
          <span className="zoom-hint">Ctrl + scroll untuk zoom · drag untuk geser</span>

          {/* Viewport */}
          <div
            className="pmap-viewport"
            id="pmapViewport"
            ref={vpRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            <div className="pmap" id="pmap" ref={pmapRef}>

              {/* Mall wall — pedestrian doors */}
              <div className="pmap__mallwall">
                <span className="pdoor">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M14 21V4H6v17M14 8h4v13M10 12h.01"/>
                  </svg>
                  PINTU MASUK MALL
                </span>
                <span className="pdoor">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M10 21V4h8v17M10 8H6v13M14 12h-.01"/>
                  </svg>
                  PINTU KELUAR MALL
                </span>
              </div>

              {/* Parking field */}
              <div className="pmap__field">

                {/* Top row */}
                <div className="pmap__row">
                  <div className="pbay" id="zTop">{renderZone('zTop')}</div>
                </div>

                {/* Middle ring: left | island | right */}
                <div className="pmap__ring">
                  <div className="pmap__side" id="zLeft">{renderZone('zLeft')}</div>

                  <div className="ring">
                    <div className="ring__island">
                      <div className="pbay" id="zRowA">{renderZone('zRowA')}</div>
                      <div className="pisland"/>
                      <div className="pbay" id="zRowB">{renderZone('zRowB')}</div>
                    </div>
                    {/* Clockwise traffic arrows */}
                    <Arrow d="right" style={{ top: 'calc(var(--road)/2 * -1 - 9px)', left: '30%' }}/>
                    <Arrow d="right" style={{ top: 'calc(var(--road)/2 * -1 - 9px)', left: '50%' }}/>
                    <Arrow d="right" style={{ top: 'calc(var(--road)/2 * -1 - 9px)', left: '70%' }}/>
                    <Arrow d="down"  style={{ right: 'calc(var(--road)/2 * -1 - 9px)', top: '50%' }}/>
                    <Arrow d="left"  style={{ bottom: 'calc(var(--road)/2 * -1 - 9px)', left: '30%' }}/>
                    <Arrow d="left"  style={{ bottom: 'calc(var(--road)/2 * -1 - 9px)', left: '50%' }}/>
                    <Arrow d="left"  style={{ bottom: 'calc(var(--road)/2 * -1 - 9px)', left: '70%' }}/>
                    <Arrow d="up"    style={{ left: 'calc(var(--road)/2 * -1 - 9px)', top: '50%' }}/>
                  </div>

                  <div className="pmap__side" id="zRight">{renderZone('zRight')}</div>
                </div>

                {/* Bottom row + lift */}
                <div className="pmap__row pmap__row--core">
                  <div className="plift"><i/></div>
                  <div className="pbay" id="zBottom">{renderZone('zBottom')}</div>
                </div>
              </div>

              {/* Green boundary wall */}
              <div className="greenwall">
                <span className="gap"/>
                <span className="seg"/>
                <span className="gap"/>
              </div>

              {/* Vehicle gates */}
              <div className="pmap__gates">
                <div className="pgate exit">
                  <span className="pgate__arm"/>
                  <span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M6 13l6 6 6-6"/>
                    </svg>
                    KELUAR KENDARAAN
                  </span>
                </div>
                <div className="pgate enter">
                  <span className="pgate__arm"/>
                  <span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 19V5M6 11l6-6 6 6"/>
                    </svg>
                    MASUK KENDARAAN
                  </span>
                </div>
              </div>

            </div>{/* /pmap */}
          </div>{/* /pmap-viewport */}

          {/* Legend */}
          <div className="map-legend">
            <span><i style={{ background: '#43D17F' }}/> Empty</span>
            <span><i style={{ background: '#F0554E' }}/> Full</span>
            <span><i style={{ background: '#E6B31E' }}/> Inactive</span>
          </div>
        </div>

      </main>
      <BottomNav />
    </div>
  );
}
