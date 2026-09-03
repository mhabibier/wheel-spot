import Link from 'next/link';
import Image from 'next/image';

export const metadata = { title: 'Masuk — Wheel Spot' };

export default function LoginPage() {
  return (
    <div className="auth">
      <div className="auth__brand">
        <span className="logo logo--lg">
          <Image src="/logo.png" alt="Wheel Spot" width={96} height={96} style={{ objectFit: 'contain' }}/>
        </span>
        <h1>Wheel Spot</h1>
        <p>Pantau ketersediaan slot parkir di pusat perbelanjaan Bandung secara real-time.</p>
      </div>
      <div className="auth__panel">
        <div className="auth__card">
          <h2>Masuk ke Akun</h2>
          <p className="auth__foot">Belum punya akun? <Link href="/register">Daftar sekarang</Link></p>
          <form className="stack gap-4" style={{ marginTop: 24 }} action="/home">
            <div className="field">
              <label className="label" htmlFor="email">Email <span className="req">*</span></label>
              <input className="input" id="email" type="email" placeholder="kamu@email.com" required/>
            </div>
            <div className="field">
              <label className="label" htmlFor="pwd">Password <span className="req">*</span></label>
              <input className="input" id="pwd" type="password" placeholder="••••••••" required/>
            </div>
            <button className="btn btn--lg btn--block" type="submit">Masuk</button>
            <p className="center tiny muted">
              <Link href="#" className="linkbtn" style={{ fontSize: 12 }}>Lupa password?</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
