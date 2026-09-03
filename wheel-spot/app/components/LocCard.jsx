import Image from 'next/image';
import Link from 'next/link';

// Location card component shared between home and find pages
export default function LocCard({ loc, href, showStatus = false }) {
  return (
    <Link className="card card-hover loc-card" href={href || `/location/${loc.id}`}>
      <div className="thumb">
        <Image
          src={loc.image}
          alt={`Foto ${loc.name}`}
          fill
          sizes="(max-width: 680px) 50vw, 280px"
          style={{ objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
          priority={false}
        />
        {showStatus && (
          <span className={`badge ${loc.status} thumb__tag`}>{loc.statusLabel}</span>
        )}
      </div>
      <div>
        <h3>{loc.name}</h3>
        <p className="tiny muted">{loc.address}</p>
      </div>
      <div className="loc-meta">
        <span>Tersedia<b className={loc.status === 'danger' ? 'red' : 'ok'}>{loc.available}</b></span>
        <span>Kapasitas<b>{loc.capacity}</b></span>
      </div>
    </Link>
  );
}
