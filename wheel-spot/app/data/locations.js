// Data lokasi parkir — single source of truth
export const LOCATIONS = [
  {
    id: 'miko',
    name: 'Miko Mall',
    address: 'Jl. Kopo No.599, Cirangrang, Babakan Ciparay',
    image: '/MIKOMALL.jpg',
    available: 45,
    capacity: 200,
    status: 'ok',       // ok | warn | danger
    statusLabel: 'Tersedia',
  },
  {
    id: 'ciwalk',
    name: 'Ciwalk',
    address: 'Jl. Cihampelas No.160, Cipaganti',
    image: '/CIWALK.png',
    available: 2,
    capacity: 350,
    status: 'warn',
    statusLabel: 'Hampir Penuh',
  },
  {
    id: 'paskal',
    name: 'Paskal',
    address: 'Jl. Pasir Kaliki No.25-27, Kb. Jeruk',
    image: '/PASKAL.png',
    available: 0,
    capacity: 500,
    status: 'danger',
    statusLabel: 'Penuh',
  },
  {
    id: 'bip',
    name: 'BIP',
    address: 'Jl. Merdeka No.56, Braga',
    image: '/BIP.png',
    available: 30,
    capacity: 400,
    status: 'ok',
    statusLabel: 'Tersedia',
  },
];

export function getLocation(id) {
  return LOCATIONS.find((l) => l.id === id) || null;
}
