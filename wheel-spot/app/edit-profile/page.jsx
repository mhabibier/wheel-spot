'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { TopBar } from '../components/Nav';
import BottomNav from '../components/Nav';

/* ── Daftar jenis mobil ── */
const CAR_TYPES = [
  'Sedan','Hatchback','SUV','MPV','Crossover','Pickup Truck',
  'Minivan','Coupe','Convertible','Sports Car','Wagon',
  'Electric Vehicle (EV)','Hybrid','City Car','Double Cabin',
  'Off-Road 4x4','Van','Bus Kecil','Microbus',
];

/* ── Searchable car dropdown ── */
function CarDropdown({ value, onChange }) {
  const [open, setOpen]   = useState(false);
  const [q, setQ]         = useState('');
  const inputRef          = useRef(null);

  const filtered = CAR_TYPES.filter(c => c.toLowerCase().includes(q.toLowerCase()));

  const pick = (car) => {
    onChange(car);
    setQ('');
    setOpen(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Trigger */}
      <div
        className="input"
        style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 8 }}
        onClick={() => { setOpen(o => !o); setTimeout(() => inputRef.current?.focus(), 50); }}
      >
        <span style={{ flex: 1, color: value ? 'inherit' : 'var(--muted-2)' }}>
          {value || 'Pilih atau ketik jenis mobil…'}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? 'rotate(180deg)' : undefined, transition: 'transform .2s', flexShrink: 0 }}>
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </div>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 50,
          background: '#fff', border: '1px solid var(--line)', borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,.12)', overflow: 'hidden',
        }}>
          {/* Search inside dropdown */}
          <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--line)' }}>
            <input
              ref={inputRef}
              className="input"
              style={{ padding: '8px 12px', fontSize: 13 }}
              placeholder="Cari jenis mobil…"
              value={q}
              onChange={e => setQ(e.target.value)}
            />
          </div>
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            {filtered.length === 0 && (
              <div style={{ padding: '10px 14px', color: 'var(--muted)', fontSize: 13 }}>
                Tidak ditemukan — ketik untuk menambahkan
              </div>
            )}
            {filtered.map(c => (
              <button key={c} type="button"
                onClick={() => pick(c)}
                style={{
                  width: '100%', textAlign: 'left', background: c === value ? 'var(--red-tint)' : 'none',
                  border: 'none', padding: '10px 14px', fontSize: 13,
                  fontWeight: c === value ? 700 : 400, cursor: 'pointer',
                  color: c === value ? 'var(--red)' : 'var(--ink)',
                }}
                onMouseEnter={e => { if (c !== value) e.currentTarget.style.background = 'var(--bg-alt)'; }}
                onMouseLeave={e => { if (c !== value) e.currentTarget.style.background = 'none'; }}
              >
                {c}
              </button>
            ))}
            {/* Allow typing custom value not in list */}
            {q && !CAR_TYPES.includes(q) && (
              <button type="button"
                onClick={() => pick(q)}
                style={{
                  width: '100%', textAlign: 'left', background: 'none',
                  border: 'none', borderTop: '1px solid var(--line)',
                  padding: '10px 14px', fontSize: 13, cursor: 'pointer', color: 'var(--red)',
                }}
              >
                ＋ Tambahkan &ldquo;{q}&rdquo;
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════ PAGE ═══════════ */
export default function EditProfilePage() {
  /* Profile photo */
  const [photo, setPhoto]   = useState(null); // data URL
  const photoRef            = useRef(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  /* Form state */
  const [form, setForm] = useState({
    fname: 'Budi', lname: 'Santoso',
    email: 'budi@email.com', phone: '081234567890',
    plat: 'B 1234 SPOT', carType: 'Sedan', carColor: 'Hitam',
  });
  const [toast, setToast] = useState(null);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setToast('✅ Profil berhasil disimpan!');
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <div className="page page--app">
      <TopBar title="Edit Profil" backHref="/profile" />

      <main className="container stack gap-4" style={{ paddingTop: 20 }}>
        <form className="stack gap-4" onSubmit={handleSubmit}>

          {/* ── Photo upload ── */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {/* Avatar preview */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%', overflow: 'hidden',
                background: photo ? 'transparent' :
                  'radial-gradient(120% 120% at 30% 20%, #E23 0%, var(--red) 55%, var(--red-700) 100%)',
                border: '3px solid var(--red-tint-2)',
                display: 'grid', placeItems: 'center',
              }}>
                {photo
                  ? <img src={photo} alt="Foto profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ color: '#fff', fontWeight: 800, fontSize: 22 }}>
                      {form.fname[0]}{form.lname[0]}
                    </span>
                }
              </div>
              {/* Camera badge — hidden, click avatar to upload */}
              <button type="button"
                onClick={() => photoRef.current?.click()}
                style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'transparent', border: 'none', cursor: 'pointer' }}
                aria-label="Ubah foto profil"
              />
              <input ref={photoRef} type="file" accept="image/*" hidden onChange={handlePhotoChange} />
            </div>

            <div>
              <p style={{ fontWeight: 800, fontSize: 16 }}>{form.fname} {form.lname}</p>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{form.email}</p>
            </div>
          </div>

          {/* ── Personal info ── */}
          <div className="card stack gap-4">
            <p className="card-title" style={{ fontSize: 16 }}>Informasi Pribadi</p>
            <div className="form-grid">
              <div className="field">
                <label className="label" htmlFor="fname">Nama Depan <span className="req">*</span></label>
                <input className="input" id="fname" value={form.fname} onChange={set('fname')} required />
              </div>
              <div className="field">
                <label className="label" htmlFor="lname">Nama Belakang <span className="req">*</span></label>
                <input className="input" id="lname" value={form.lname} onChange={set('lname')} required />
              </div>
              <div className="field col-span-2">
                <label className="label" htmlFor="email">Email <span className="req">*</span></label>
                <input className="input" id="email" type="email" value={form.email} onChange={set('email')} required />
              </div>
              <div className="field col-span-2">
                <label className="label" htmlFor="phone">Nomor HP</label>
                <input className="input" id="phone" type="tel" value={form.phone} onChange={set('phone')} placeholder="08xxxxxxxxxx" />
              </div>
            </div>
          </div>

          {/* ── Vehicle info ── */}
          <div className="card stack gap-4">
            <p className="card-title" style={{ fontSize: 16 }}>Informasi Kendaraan</p>
            <div className="form-grid">
              <div className="field col-span-2">
                <label className="label" htmlFor="plat">Plat Nomor <span className="req">*</span></label>
                <input className="input" id="plat"
                  value={form.plat} onChange={set('plat')}
                  placeholder="Contoh: B 1234 XYZ"
                  style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
                  required />
              </div>

              <div className="field col-span-2">
                <label className="label">Jenis Mobil <span className="req">*</span></label>
                <CarDropdown
                  value={form.carType}
                  onChange={v => setForm(f => ({ ...f, carType: v }))}
                />
                {form.carType && (
                  <p className="tiny muted" style={{ marginTop: 4 }}>
                    Dipilih: <strong>{form.carType}</strong>
                  </p>
                )}
              </div>

              <div className="field col-span-2">
                <label className="label" htmlFor="carColor">Warna Kendaraan</label>
                <input className="input" id="carColor" value={form.carColor} onChange={set('carColor')} placeholder="Contoh: Merah, Putih, Hitam…" />
              </div>
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="form-actions">
            <button className="btn btn--lg" type="submit">Simpan Perubahan</button>
            <Link className="btn btn--ghost btn--lg" href="/profile">Batal</Link>
          </div>

        </form>
      </main>

      {/* Toast */}
      {toast && (
        <div className="toast-wrap">
          <div className="toast ok">{toast}</div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
