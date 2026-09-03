import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TopBar } from '../../components/Nav';
import BottomNav from '../../components/Nav';
import { LOCATIONS, getLocation } from '../../data/locations';

export async function generateStaticParams() {
  return LOCATIONS.map((loc) => ({ id: loc.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const loc = getLocation(id);
  if (!loc) return {};
  return { title: `Parkiran ${loc.name} — Wheel Spot` };
}

export default async function LocationPage({ params }) {
  const { id } = await params;
  const loc = getLocation(id);
  if (!loc) notFound();

  const statusMap = {
    ok: { label: 'Tersedia', cls: 'ok', alert: null },
    warn: { label: 'Hampir Penuh', cls: 'warn', alert: null },
    danger: { label: 'FULL', cls: 'danger', alert: 'Parkiran ini penuh. Coba alternatif lokasi terdekat.' },
  };
  const s = statusMap[loc.status];

  const alternatives = LOCATIONS.filter((l) => l.id !== loc.id && l.status !== 'danger').slice(0, 1);

  return (
    <div className="page page--app">
      <TopBar backHref="/find" />

      <main className="container" style={{ paddingTop: 22 }}>
        <div className="split-2">

          {/* Photo */}
          <div>
            <div className="thumb thumb--tall" style={{ position: 'relative' }}>
              <Image
                src={loc.image}
                alt={`Foto ${loc.name}`}
                fill
                sizes="(max-width:900px) 100vw, 55vw"
                style={{ objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                priority
              />
              <span className={`badge ${s.cls} thumb__tag`}>{s.label}</span>
            </div>
          </div>

          {/* Info */}
          <div className="stack gap-4">
            <div>
              <h1 style={{ fontSize: 24 }}>Parkiran {loc.name}</h1>
              <p className="muted small mt-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', verticalAlign: -2 }}>
                  <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z"/>
                  <circle cx="12" cy="10" r="2.5"/>
                </svg>{' '}
                {loc.address}
              </p>
              <div className="stack gap-2 mt-3" style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                <span className="chip">Real-time</span>
                <span className="chip">14:30 WIB</span>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
              <div>
                <p style={{ fontWeight: 800 }}>Kapasitas Slot</p>
                <p className="small" style={{ color: `var(--${loc.status === 'danger' ? 'danger' : 'ok'})`, fontWeight: 700 }}>
                  {loc.status === 'danger' ? 'Kapasitas Maksimal Tercapai' : `${loc.available} Slot Tersedia`}
                </p>
              </div>
              <p style={{ fontSize: 26, fontWeight: 800, color: 'var(--red)' }}>
                {loc.capacity - loc.available} / {loc.capacity}
              </p>
            </div>

            <Link className="btn btn--lg btn--block" href="/map">Lihat Denah Parkir</Link>

            {s.alert && (
              <div className="alert danger">
                <p className="alert__title">🚫 {s.alert}</p>
                <p className="alert__body">Kami merekomendasikan alternatif lokasi terdekat dengan ketersediaan slot yang memadai.</p>
              </div>
            )}

            {alternatives.map((alt) => (
              <Link key={alt.id} className="card card-hover" href={`/location/${alt.id}`} style={{ display: 'block' }}>
                <p style={{ fontWeight: 800 }}>
                  Alternatif: {alt.name}{' '}
                  <span className="badge ok" style={{ marginLeft: 6 }}>TERSEDIA</span>
                </p>
                <p className="tiny muted mt-2">{alt.address}</p>
                <p style={{ color: 'var(--ok)', fontWeight: 800 }} className="mt-2">{alt.available} Slot Kosong</p>
              </Link>
            ))}

            {alternatives.length > 0 && (
              <Link className="btn btn--outline btn--block" href={`/dashboard`}>
                Booking Slot di {alternatives[0].name} →
              </Link>
            )}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
