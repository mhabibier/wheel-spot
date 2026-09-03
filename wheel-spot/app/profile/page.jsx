import Link from 'next/link';
import { TopBar } from '../components/Nav';
import BottomNav from '../components/Nav';

export const metadata = { title: 'Profil Saya — Wheel Spot' };

export default function ProfilePage() {
  return (
    <div className="page page--app">
      <TopBar title="Profil Saya" />
      <main className="container stack gap-4" style={{ paddingTop: 20 }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span className="avatar" style={{ width: 64, height: 64, fontSize: 22 }}>WS</span>
          <div>
            <p style={{ fontWeight: 800, fontSize: 18 }}>Budi Santoso</p>
            <p className="small muted">budi@email.com</p>
            <p className="tiny muted mt-2">Anggota sejak Oktober 2023</p>
          </div>
        </div>

        <div className="card stack gap-3">
          <p className="card-title" style={{ fontSize: 16 }}>Kendaraan Terdaftar</p>
          <div className="datalist">
            <div><span className="k">Plat Nomor</span><span className="v">B 1234 SPOT</span></div>
            <div><span className="k">Jenis</span><span className="v">Mobil — Sedan</span></div>
            <div><span className="k">Warna</span><span className="v">Hitam</span></div>
          </div>
        </div>

        <div className="card stack gap-3">
          <p className="card-title" style={{ fontSize: 16 }}>Statistik</p>
          <div className="stat-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="stat"><div className="stat__label">Total Parkir</div><div className="stat__value">24</div></div>
            <div className="stat"><div className="stat__label">Berhasil</div><div className="stat__value ok">22</div></div>
            <div className="stat"><div className="stat__label">Denda</div><div className="stat__value red">2</div></div>
          </div>
        </div>

        <div className="stack gap-2">
          <Link className="btn btn--ghost btn--block" href="/edit-profile">Edit Profil</Link>
          <Link className="btn btn--muted btn--block" href="/login">Keluar</Link>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
