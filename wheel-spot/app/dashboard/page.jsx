'use client';
import { useState } from 'react';
import Link from 'next/link';
import { TopBar } from '../components/Nav';
import BottomNav from '../components/Nav';

const STATES = ['menuju', 'verifikasi', 'valid', 'salah', 'denda'];
const STATE_LABELS = { menuju: 'Menuju', verifikasi: 'Verifikasi', valid: 'Terparkir', salah: 'Salah Slot', denda: 'Kena Denda' };

export default function DashboardPage() {
  const [state, setState] = useState('valid');

  return (
    <div className="page page--app">
      <TopBar title="Dashboard Saya" />
      <main className="container stack gap-4" style={{ paddingTop: 20 }}>

        {/* State switcher */}
        <div className="segmented" role="tablist">
          {STATES.map((s) => (
            <button key={s} role="tab" className={state === s ? 'on' : ''} onClick={() => setState(s)}>
              {STATE_LABELS[s]}
            </button>
          ))}
        </div>

        <div className="split-2">
          <div className="stack gap-4">

            {/* Status card */}
            <div className="card card--tint">
              {state === 'menuju' && <span className="badge info">Menuju Slot</span>}
              {state === 'verifikasi' && <span className="badge neutral">Memverifikasi Ulang…</span>}
              {state === 'valid' && <span className="badge ok">Terparkir · Valid</span>}
              {state === 'salah' && <span className="badge danger">Alarm — Salah Slot</span>}
              {state === 'denda' && <span className="badge warn">Kena Denda — Alarm Nonaktif</span>}

              <h1 style={{ fontSize: 24, marginTop: 12 }}>Miko Mall — Slot A1</h1>

              {['valid', 'salah', 'denda'].includes(state) && (
                <div className="loc-meta mt-3">
                  <span>Durasi Parkir<b>01:24:10</b></span>
                  <span>Estimasi Biaya<b>Rp 12.000</b></span>
                </div>
              )}
              {state === 'menuju' && (
                <div className="loc-meta mt-3">
                  <span>Estimasi Sampai<b>3 menit</b></span>
                  <span>Jarak ke Slot<b>120 m</b></span>
                </div>
              )}

              {state === 'valid' && (
                <div className="qr-block mt-4">
                  <span className="qr"/>
                  <div><p style={{ fontWeight: 700 }}>QR Sesi Parkir</p><p className="tiny muted">Tunjukkan ke petugas jika diminta verifikasi ulang.</p></div>
                </div>
              )}
              {state === 'salah' && (
                <div className="qr-block mt-4">
                  <span className="qr dim"/>
                  <div><p style={{ fontWeight: 700 }}>QR Tidak Berlaku</p><p className="tiny muted">Pindahkan mobil ke slot terdaftar untuk mengaktifkan kembali.</p></div>
                </div>
              )}
              {state === 'verifikasi' && <p className="small muted mt-3">Mohon tunggu sebentar…</p>}
            </div>

            {/* Alerts */}
            {state === 'verifikasi' && (
              <div className="alert" style={{ background: 'var(--line-soft)', borderColor: 'var(--line)' }}>
                <p className="alert__title" style={{ color: 'var(--ink-soft)' }}>🔄 Mendeteksi Posisi Mobil</p>
                <p className="alert__body">Kami sedang memastikan mobil kamu berada di slot yang benar.</p>
              </div>
            )}
            {state === 'salah' && (
              <div className="alert danger">
                <p className="alert__title">⚠️ Slot Tidak Sesuai — Alarm Aktif</p>
                <p className="alert__body">Mobil terdeteksi di slot berbeda dari QR kamu. Pindahkan dalam 5 menit untuk menghindari denda.</p>
                <p style={{ fontWeight: 800, marginTop: 8 }}>Sisa waktu: 04:32</p>
              </div>
            )}
            {state === 'denda' && (
              <div className="alert warn">
                <p className="alert__title">⏱️ Waktu Toleransi Habis</p>
                <p className="alert__body">Kamu tidak memindahkan mobil dalam 5 menit. Tarif per jam kamu sekarang lebih mahal.</p>
                <p style={{ fontWeight: 800, marginTop: 8 }}>Tarif berlaku: Rp 8.000/jam</p>
              </div>
            )}

            {/* Detail table */}
            {['menuju', 'valid', 'salah', 'denda'].includes(state) && (
              <div className="card">
                <p className="card-title" style={{ fontSize: 16, marginBottom: 8 }}>Detail Sesi Parkir</p>
                <div className="datalist">
                  <div><span className="k">Lokasi</span><span className="v">Parkiran Miko Mall</span></div>
                  <div><span className="k">Nomor Slot</span><span className="v">A1</span></div>
                  <div><span className="k">Waktu Masuk</span><span className="v">24 Okt 2023, 13:06</span></div>
                  <div><span className="k">Kendaraan</span><span className="v">B 1234 SPOT</span></div>
                </div>
              </div>
            )}

            {/* Actions */}
            {state === 'valid' && <Link className="btn btn--lg btn--block" href="/receipt">Tap Kartu / Scan untuk Keluar →</Link>}
            {['salah', 'denda'].includes(state) && <Link className="btn btn--lg btn--block" href="/map">Lihat Rute ke Slot yang Benar →</Link>}
            {state === 'menuju' && (
              <div className="stack gap-2">
                <Link className="btn btn--lg btn--block" href="/map">Lihat Rute ke Slot →</Link>
                <Link className="linkbtn center" href="/find">Batalkan Booking</Link>
              </div>
            )}
            {state === 'verifikasi' && <button className="btn btn--lg btn--block" disabled>Menunggu Verifikasi…</button>}
          </div>

          {/* Right — recent history */}
          <aside>
            <h2 className="section-title">Riwayat Terbaru</h2>
            <div className="stack gap-3">
              <Link className="rowitem" href="/receipt?state=success">
                <span><span className="rowitem__t">Parkiran Ciwalk</span><br/><span className="rowitem__s">23 Okt 2023 · 18:45</span></span>
                <span className="small muted">Selesai</span>
              </Link>
              <Link className="rowitem" href="/receipt">
                <span><span className="rowitem__t">Parkiran Paskal</span><br/><span className="rowitem__s">20 Okt 2023 · 09:15</span></span>
                <span className="small" style={{ color: 'var(--danger)', fontWeight: 700 }}>Kena Denda</span>
              </Link>
            </div>
          </aside>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
