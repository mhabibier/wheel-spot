import Link from 'next/link';
import { TopBar } from '../components/Nav';
import BottomNav from '../components/Nav';

export const metadata = { title: 'Riwayat Cek Ketersediaan — Wheel Spot' };

const HISTORY = [
  { id: 1, loc: 'Miko Mall',  date: '24 Okt 2023', time: '13:45', available: 45, status: 'ok' },
  { id: 2, loc: 'Ciwalk',     date: '23 Okt 2023', time: '18:30', available: 8,  status: 'warn' },
  { id: 3, loc: 'Paskal',     date: '22 Okt 2023', time: '09:00', available: 0,  status: 'danger' },
  { id: 4, loc: 'BIP',        date: '20 Okt 2023', time: '11:15', available: 30, status: 'ok' },
];

export default function FindHistoryPage() {
  return (
    <div className="page page--app">
      <TopBar title="Riwayat Cek" backHref="/find" />
      <main className="container stack gap-4" style={{ paddingTop: 20 }}>
        <div className="page-head">
          <h1>Riwayat Pengecekan</h1>
          <p>Lokasi yang pernah kamu cek ketersediaannya.</p>
        </div>
        <div className="stack gap-3">
          {HISTORY.map((h) => (
            <Link key={h.id} className="rowitem" href={`/location/${h.loc.toLowerCase().replace(' ','')}`}>
              <span>
                <span className="rowitem__t">{h.loc}</span>
                <br/>
                <span className="rowitem__s">{h.date} · {h.time} WIB</span>
              </span>
              <span className={`badge ${h.status}`}>
                {h.available > 0 ? `${h.available} Slot` : 'Penuh'}
              </span>
            </Link>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
