import Link from 'next/link';
import { TopBar } from '../components/Nav';
import BottomNav from '../components/Nav';

export const metadata = { title: 'Struk Parkir — Wheel Spot' };

export default function ReceiptPage() {
  return (
    <div className="page page--app">
      <TopBar title="Struk Parkir" backHref="/dashboard" />
      <main className="container stack gap-4" style={{ paddingTop: 20 }}>
        <div className="card stack gap-4" style={{ textAlign: 'center' }}>
          <div className="receipt-icon ok" style={{ marginTop: 8 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
          </div>
          <div>
            <h1 style={{ fontSize: 22 }}>Parkir Selesai!</h1>
            <p className="muted small mt-2">Terima kasih telah menggunakan Wheel Spot.</p>
          </div>

          <div className="datalist" style={{ textAlign: 'left' }}>
            <div><span className="k">Lokasi</span><span className="v">Parkiran Miko Mall</span></div>
            <div><span className="k">Slot</span><span className="v">A1</span></div>
            <div><span className="k">Masuk</span><span className="v">24 Okt 2023, 13:06</span></div>
            <div><span className="k">Keluar</span><span className="v">24 Okt 2023, 14:30</span></div>
            <div><span className="k">Durasi</span><span className="v">1 jam 24 menit</span></div>
            <div><span className="k">Total Biaya</span><span className="v accent" style={{ color: 'var(--red)', fontSize: 18 }}>Rp 12.000</span></div>
          </div>

          <Link className="btn btn--lg btn--block" href="/home">Kembali ke Beranda</Link>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
