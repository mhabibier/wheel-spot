'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TopBar } from '../components/Nav';
import BottomNav from '../components/Nav';
import { LOCATIONS } from '../data/locations';

export default function FindPage() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua Status');
  const [minSlots, setMinSlots] = useState('');

  const filtered = LOCATIONS.filter((loc) => {
    const matchQ = !query || loc.name.toLowerCase().includes(query.toLowerCase());
    const matchStatus =
      statusFilter === 'Semua Status' ||
      (statusFilter === 'Tersedia' && loc.status === 'ok') ||
      (statusFilter === 'Hampir Penuh' && loc.status === 'warn') ||
      (statusFilter === 'Penuh' && loc.status === 'danger');
    const matchMin = !minSlots || loc.available >= Number(minSlots);
    return matchQ && matchStatus && matchMin;
  });

  return (
    <div className="page page--app">
      <TopBar title="Lokasi Parkir" />

      <main className="container" style={{ paddingTop: 20 }}>
        <div className="split-side">

          {/* Filter sidebar */}
          <aside className="card stack gap-4">
            <h2 className="card-title" style={{ fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 5h18M6 12h12M10 19h4"/>
              </svg>
              Filter Pencarian
            </h2>
            <div className="field">
              <label className="label" htmlFor="q">Nama Lokasi</label>
              <input
                className="input" id="q" placeholder="Cari nama/gedung…"
                value={query} onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="field">
              <label className="label" htmlFor="st">Status</label>
              <select className="select" id="st" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option>Semua Status</option>
                <option>Tersedia</option>
                <option>Hampir Penuh</option>
                <option>Penuh</option>
              </select>
            </div>
            <div className="field">
              <label className="label" htmlFor="mn">Slot Kosong Minimal</label>
              <input
                className="input" id="mn" type="number" min="0" placeholder="Contoh: 10"
                value={minSlots} onChange={(e) => setMinSlots(e.target.value)}
              />
            </div>
            <div className="small muted" style={{ paddingTop: 4 }}>
              {filtered.length} lokasi ditemukan
            </div>
          </aside>

          {/* Results grid */}
          <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {filtered.length === 0 && (
              <p className="muted small" style={{ gridColumn: '1/-1' }}>Tidak ada lokasi yang cocok.</p>
            )}
            {filtered.map((loc) => (
              <article key={loc.id} className="card card-hover loc-card">
                <div className="thumb" style={{ position: 'relative' }}>
                  <Image
                    src={loc.image}
                    alt={`Foto ${loc.name}`}
                    fill
                    sizes="(max-width:680px) 50vw, 260px"
                    style={{ objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                  />
                  <span className={`badge ${loc.status} thumb__tag`}>{loc.statusLabel}</span>
                </div>
                <div>
                  <h3>{loc.name}</h3>
                  <p className="tiny muted">{loc.address}</p>
                </div>
                <div className="loc-meta">
                  <span>Kosong<b className={loc.status}>{loc.available}</b></span>
                  <span>Total<b>{loc.capacity}</b></span>
                </div>
                <Link className="btn btn--block" href={`/location/${loc.id}`}>Cek Slot</Link>
              </article>
            ))}
          </div>
        </div>

        <p className="center mt-6">
          <Link className="linkbtn" href="/find-history">Lihat Riwayat Pengecekan Ketersediaan →</Link>
        </p>
      </main>

      <BottomNav />
    </div>
  );
}
