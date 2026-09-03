import Link from 'next/link';
import Image from 'next/image';

export const metadata = { title: 'Daftar — Wheel Spot' };

export default function RegisterPage() {
  return (
    <div className="auth">
      <div className="auth__brand">
        <span className="logo logo--lg">
          <Image src="/logo.png" alt="Wheel Spot" width={96} height={96} style={{ objectFit: 'contain' }}/>
        </span>
        <h1>Wheel Spot</h1>
        <p>Daftar gratis dan nikmati kemudahan cek parkir real-time di Bandung.</p>
      </div>
      <div className="auth__panel">
        <div className="auth__card">
          <h2>Buat Akun Baru</h2>
          <p className="auth__foot">Sudah punya akun? <Link href="/login">Masuk</Link></p>
          <form className="stack gap-4" style={{ marginTop: 24 }} action="/home">
            <div className="form-grid">
              <div className="field">
                <label className="label" htmlFor="fname">Nama Depan <span className="req">*</span></label>
                <input className="input" id="fname" placeholder="Budi" required/>
              </div>
              <div className="field">
                <label className="label" htmlFor="lname">Nama Belakang</label>
                <input className="input" id="lname" placeholder="Santoso"/>
              </div>
              <div className="field col-span-2">
                <label className="label" htmlFor="email">Email <span className="req">*</span></label>
                <input className="input" id="email" type="email" placeholder="kamu@email.com" required/>
              </div>
              <div className="field col-span-2">
                <label className="label" htmlFor="pwd">Password <span className="req">*</span></label>
                <input className="input" id="pwd" type="password" placeholder="Min. 8 karakter" required/>
              </div>
            </div>
            <button className="btn btn--lg btn--block" type="submit">Daftar Sekarang</button>
          </form>
        </div>
      </div>
    </div>
  );
}
