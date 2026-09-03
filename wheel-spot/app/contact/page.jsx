import Link from 'next/link';
import { TopBar } from '../components/Nav';
import BottomNav from '../components/Nav';

export const metadata = { title: 'Kontak — Wheel Spot' };

export default function ContactPage() {
  return (
    <div className="page page--app">
      <TopBar title="Hubungi Kami" backHref="/home" />
      <main className="container stack gap-4" style={{ paddingTop: 20 }}>
        <div className="page-head">
          <h1>Hubungi Kami</h1>
          <p>Ada pertanyaan atau masalah? Kirimkan pesan kepada kami.</p>
        </div>
        <div className="card stack gap-4">
          <form className="stack gap-4" action="/home">
            <div className="field">
              <label className="label" htmlFor="name">Nama <span className="req">*</span></label>
              <input className="input" id="name" placeholder="Nama lengkap kamu" required/>
            </div>
            <div className="field">
              <label className="label" htmlFor="email">Email <span className="req">*</span></label>
              <input className="input" id="email" type="email" placeholder="kamu@email.com" required/>
            </div>
            <div className="field">
              <label className="label" htmlFor="subject">Subjek</label>
              <input className="input" id="subject" placeholder="Masalah login / slot parkir / dll"/>
            </div>
            <div className="field">
              <label className="label" htmlFor="message">Pesan <span className="req">*</span></label>
              <textarea className="textarea" id="message" placeholder="Ceritakan masalah atau pertanyaan kamu…" required/>
            </div>
            <button className="btn btn--lg btn--block" type="submit">Kirim Pesan</button>
          </form>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
