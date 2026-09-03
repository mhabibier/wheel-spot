import './globals.css';

export const metadata = {
  title: 'Wheel Spot — Cek Slot Parkir Real-Time',
  description: 'Cek ketersediaan slot parkir di Bandung secara real-time. BIP, Ciwalk, Miko Mall, Paskal, dan lebih banyak lokasi.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
