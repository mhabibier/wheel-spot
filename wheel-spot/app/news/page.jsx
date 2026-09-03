import { TopBar } from '../components/Nav';
import BottomNav from '../components/Nav';

export const metadata = { title: 'Berita Parkir — Wheel Spot' };

const NEWS = [
  { id: 1, cls: 'full',   loc: 'Paskal',   title: 'Paskal 23 Fully Occupied',       body: 'Seluruh 500 slot terisi sejak pukul 12.30 WIB. Estimasi kosong kembali 16.00 WIB.', time: '14:30 WIB' },
  { id: 2, cls: 'almost', loc: 'Ciwalk',   title: 'Ciwalk — Hampir Penuh (97%)',    body: 'Hanya 8 slot tersisa. Sistem akan memblokir booking baru jika slot habis.', time: '14:15 WIB' },
  { id: 3, cls: 'avail',  loc: 'Miko Mall',title: 'Miko Mall Buka Area Basement B', body: 'Tambahan 35 slot tersedia mulai pukul 10.00 WIB di Basement B.', time: '10:02 WIB' },
  { id: 4, cls: 'avail',  loc: 'BIP',      title: 'BIP — Slot EV Dibuka',           body: '5 slot pengisian kendaraan listrik sudah aktif di lantai P2.', time: '09:00 WIB' },
];

export default function NewsPage() {
  return (
    <div className="page page--app">
      <TopBar title="Berita Parkir" />
      <main className="container stack gap-4" style={{ paddingTop: 20 }}>
        <div className="page-head">
          <h1>Berita & Update</h1>
          <p>Informasi terkini dari setiap lokasi parkir.</p>
        </div>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          {NEWS.map((n) => (
            <div key={n.id} className={`card news-card ${n.cls}`}>
              <span className="overline">{n.loc}</span>
              <h3>{n.title}</h3>
              <p className="tiny muted mt-2">{n.body}</p>
              <p className="loc">{n.time}</p>
            </div>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
