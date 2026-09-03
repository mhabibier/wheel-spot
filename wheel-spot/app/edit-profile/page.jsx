import Link from 'next/link';
import { TopBar } from '../components/Nav';
import BottomNav from '../components/Nav';

export const metadata = { title: 'Edit Profil — Wheel Spot' };

export default function EditProfilePage() {
  return (
    <div className="page page--app">
      <TopBar title="Edit Profil" backHref="/profile" />
      <main className="container stack gap-4" style={{ paddingTop: 20 }}>
        <div className="card stack gap-4">
          <h1 style={{ fontSize: 20 }}>Edit Profil</h1>
          <form className="stack gap-4" action="/profile">
            <div className="form-grid">
              <div className="field">
                <label className="label" htmlFor="fname">Nama Depan</label>
                <input className="input" id="fname" defaultValue="Budi"/>
              </div>
              <div className="field">
                <label className="label" htmlFor="lname">Nama Belakang</label>
                <input className="input" id="lname" defaultValue="Santoso"/>
              </div>
              <div className="field col-span-2">
                <label className="label" htmlFor="email">Email</label>
                <input className="input" id="email" type="email" defaultValue="budi@email.com"/>
              </div>
              <div className="field col-span-2">
                <label className="label" htmlFor="plat">Plat Nomor</label>
                <input className="input" id="plat" defaultValue="B 1234 SPOT"/>
              </div>
            </div>
            <div className="form-actions">
              <button className="btn btn--lg" type="submit">Simpan Perubahan</button>
              <Link className="btn btn--ghost btn--lg" href="/profile">Batal</Link>
            </div>
          </form>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
