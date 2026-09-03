import Link from 'next/link';
import { TopBar } from '../components/Nav';
import BottomNav from '../components/Nav';

export const metadata = { title: 'Denah Parkir — Wheel Spot' };

export default function MapPage() {
  return (
    <div className="page page--app">
      <TopBar title="Denah Parkir" backHref="/find" />
      <main className="container" style={{ paddingTop: 20 }}>
        <div className="page-head">
          <h1>Denah Parkir — Miko Mall</h1>
          <p>Klik slot untuk melihat detail dan booking.</p>
        </div>
        {/* Map legend */}
        <div style={{ marginTop: 16, marginBottom: 16, display: 'flex', gap: 16, fontSize: 12, color: 'var(--muted)' }}>
          <span><i style={{ width: 12, height: 12, borderRadius: 3, background: '#43D17F', display: 'inline-block', marginRight: 6, verticalAlign: 'middle' }}/>Tersedia</span>
          <span><i style={{ width: 12, height: 12, borderRadius: 3, background: '#F0554E', display: 'inline-block', marginRight: 6, verticalAlign: 'middle' }}/>Terisi</span>
          <span><i style={{ width: 12, height: 12, borderRadius: 3, background: '#E6B31E', display: 'inline-block', marginRight: 6, verticalAlign: 'middle' }}/>Nonaktif</span>
        </div>
        {/* Static simplified parking grid */}
        <div className="card" style={{ background: '#12141C', border: 'none', padding: 24 }}>
          <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 13, textAlign: 'center', padding: '60px 0' }}>
            Denah parkir interaktif tersedia di aplikasi mobile Wheel Spot.<br/>
            <Link href="/dashboard" className="btn" style={{ marginTop: 16, display: 'inline-flex' }}>Lihat Status Booking →</Link>
          </p>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
