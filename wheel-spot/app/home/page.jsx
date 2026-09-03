import Link from 'next/link';
import Image from 'next/image';
import { TopBar } from '../components/Nav';
import BottomNav from '../components/Nav';
import { LOCATIONS } from '../data/locations';

export const metadata = {
  title: 'Home — Wheel Spot',
  description: 'Cek slot parkir kosong dengan cepat di Wheel Spot. Data ketersediaan diperbarui langsung dari gate tiap lokasi.',
};

export default function HomePage() {
  return (
    <div className="page page--app">
      <TopBar title="Wheel Spot" showLogo />

      <main className="container stack gap-8" style={{ paddingTop: 20 }}>

        {/* Hero */}
        <section className="hero">
          <h1>Cek Slot Parkir Kosong dengan Cepat di Wheel Spot</h1>
          <p className="muted mt-2">Data ketersediaan diperbarui langsung dari gate tiap lokasi.</p>
          <div className="hero__actions">
            <Link className="btn" href="/find">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z"/>
                <circle cx="12" cy="10" r="2.5"/>
              </svg>
              Cek Lokasi
            </Link>
            <Link className="btn btn--ghost" href="/map">Lihat Slot</Link>
          </div>
        </section>

        {/* Stats */}
        <section>
          <h2 className="section-title">Ringkasan Sistem</h2>
          <div className="stat-row">
            <div className="stat"><div className="stat__label">Total Lokasi</div><div className="stat__value">12</div></div>
            <div className="stat"><div className="stat__label">Slot Tersedia</div><div className="stat__value ok">428</div></div>
            <div className="stat"><div className="stat__label">Slot Terisi</div><div className="stat__value red">1.890</div></div>
            <div className="stat"><div className="stat__label">Update Terakhir</div><div className="stat__value" style={{fontSize:19}}>Baru saja</div></div>
            <div className="stat"><div className="stat__label">Akurasi</div><div className="stat__value">99%</div></div>
          </div>
        </section>

        {/* Location grid with real photos */}
        <section>
          <h2 className="section-title">Lokasi Pantauan</h2>
          <div className="grid loc-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {LOCATIONS.map((loc) => (
              <Link key={loc.id} className="card card-hover loc-card" href={`/location/${loc.id}`}>
                <div className="thumb" style={{ position: 'relative' }}>
                  <Image
                    src={loc.image}
                    alt={`Foto ${loc.name}`}
                    fill
                    sizes="(max-width:680px) 50vw, 280px"
                    style={{ objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                    priority
                  />
                </div>
                <div>
                  <h3>{loc.name}</h3>
                  <p className="tiny muted">{loc.address}</p>
                </div>
                <div className="loc-meta">
                  <span>Tersedia<b className="ok">{loc.available}</b></span>
                  <span>Kapasitas<b>{loc.capacity}</b></span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
