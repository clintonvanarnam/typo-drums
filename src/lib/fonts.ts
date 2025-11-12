import { Inter, Orbitron, Courier_Prime } from 'next/font/google';

export const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
});

export const courierPrime = Courier_Prime({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-courier',
});