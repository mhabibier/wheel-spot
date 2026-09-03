'use client';
import { useState } from 'react';
import Link from 'next/link';
import { TopBar } from '../components/Nav';
import BottomNav from '../components/Nav';

const STAR_PATH = 'm12 2 3 6.9 7.5.6-5.7 4.9 1.8 7.3L12 17.8 5.4 21.7l1.8-7.3L1.5 9.5 9 8.9z';

function StarIcon({ filled }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 1.6} width="22" height="22">
      <path d={STAR_PATH}/>
    </svg>
  );
}

function StarRow({ count }) {
  return (
    <span className="stars">
      {[1,2,3,4,5].map((i) => (
        <svg key={i} viewBox="0 0 24 24" fill={i <= count ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={i <= count ? 0 : 1.6} width="16" height="16">
          <path d={STAR_PATH}/>
        </svg>
      ))}
    </span>
  );
}

const INITIAL_REVIEWS = [
  {
    id: 1, initials: 'JD', name: 'John Doe', loc: 'Ciwalk', stars: 5,
    text: 'Fasilitas parkir sangat baik. Tata letaknya logis dan saya cepat dapat tempat meski jam ramai.',
    color: '#7EAADC',
  },
  {
    id: 2, initials: 'AS', name: 'Aria Santoso', loc: 'Paskal', stars: 3,
    text: 'Ruang parkir agak sempit untuk SUV besar di lantai bawah.',
    color: '#7ECBAA',
  },
  {
    id: 3, initials: 'RM', name: 'Rina M.', loc: 'Miko Mall', stars: 4,
    text: 'Petunjuk arah di dalam parkiran sudah jelas. Harga juga masih wajar.',
    color: '#C5A7E8',
  },
  {
    id: 4, initials: 'FH', name: 'Fariz H.', loc: 'BIP', stars: 5,
    text: 'Selalu ada slot tersedia setiap saya ke sini. Sistem online sangat membantu!',
    color: '#F4A57A',
  },
];

export default function RatingsPage() {
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [loc, setLoc]   = useState('');
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [toast, setToast]  = useState(null);

  const showToast = (msg, kind = '') => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 2800);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!loc || !stars || !comment.trim()) {
      showToast('Lengkapi semua field sebelum mengirim.', 'err');
      return;
    }
    const newReview = {
      id: Date.now(),
      initials: 'YO',
      name: 'Kamu',
      loc,
      stars,
      text: comment.trim(),
      color: '#C10018',
    };
    setReviews([newReview, ...reviews]);
    setLoc(''); setStars(0); setComment('');
    showToast('Review kamu terkirim. Terima kasih! 🎉', 'ok');
  };

  return (
    <div className="page page--app">
      <TopBar title="Location Ratings" />

      <main className="container stack gap-4" style={{ paddingTop: 20 }}>

        {/* Sub-nav tabs */}
        <div className="segmented">
          <Link href="/news">Updates</Link>
          <a className="on" href="#">Ratings</a>
          <Link href="/contact">Hubungi Kami</Link>
        </div>

        <div className="split-side">

          {/* ---- Review form ---- */}
          <form className="card stack gap-4" onSubmit={handleSubmit}>
            <h2 className="card-title" style={{ fontSize: 16 }}>📝 Submit a Review</h2>

            <div className="field">
              <label className="label" htmlFor="loc-sel">Select Location</label>
              <select className="select" id="loc-sel" value={loc} onChange={(e) => setLoc(e.target.value)} required>
                <option value="" disabled>Choose a parking facility…</option>
                <option>Miko Mall</option>
                <option>Ciwalk</option>
                <option>Paskal</option>
                <option>BIP</option>
              </select>
            </div>

            <div className="field">
              <label className="label">Rating</label>
              <div
                className="star-input"
                aria-label="Beri rating bintang"
                onMouseLeave={() => setHover(0)}
              >
                {[1,2,3,4,5].map((i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`${i} bintang`}
                    className={i <= (hover || stars) ? 'on' : ''}
                    onMouseEnter={() => setHover(i)}
                    onClick={() => setStars(i)}
                  >
                    <StarIcon filled={i <= (hover || stars)}/>
                  </button>
                ))}
              </div>
              {stars > 0 && (
                <p className="tiny muted" style={{ marginTop: 4 }}>
                  {['', 'Sangat buruk', 'Kurang baik', 'Cukup', 'Baik', 'Sangat baik'][stars]} · {stars}/5
                </p>
              )}
            </div>

            <div className="field">
              <label className="label" htmlFor="cmt">Comment</label>
              <textarea
                className="textarea"
                id="cmt"
                placeholder="Describe your parking experience…"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              />
            </div>

            <button className="btn btn--block" type="submit">➤ Kirim Review</button>
          </form>

          {/* ---- Review list ---- */}
          <div>
            <h2 className="section-title">Recent Reviews ({reviews.length})</h2>
            <div className="stack gap-3">
              {reviews.map((r) => (
                <article key={r.id} className="card" style={{ animation: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                      className="avatar"
                      style={{ background: r.color, width: 38, height: 38, fontSize: 13 }}
                    >
                      {r.initials}
                    </span>
                    <div>
                      <p style={{ fontWeight: 800 }}>
                        {r.name} <span className="tiny muted">· {r.loc}</span>
                      </p>
                      <StarRow count={r.stars}/>
                    </div>
                  </div>
                  <p className="small mt-3">{r.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className="toast-wrap">
          <div className={`toast ${toast.kind}`}>{toast.msg}</div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
