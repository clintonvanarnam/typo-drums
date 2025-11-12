'use client';

import Link from 'next/link';
import { instruments } from '@/lib/instruments';

export default function HomePage() {
  return (
    <main style={{ 
      width: '100vw', 
      minHeight: '100vh',
      padding: '40px',
      boxSizing: 'border-box',
    }}>
      <h1 style={{ 
        fontSize: '3rem', 
        fontWeight: '900',
        marginBottom: '1rem',
      }}>
        Typo Drums
      </h1>
      
      <p style={{ 
        fontSize: '1.2rem',
        marginBottom: '3rem',
        color: '#666',
      }}>
        A collection of interactive musical instruments and sketches
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '30px',
      }}>
        {instruments.map((instrument) => (
          <Link 
            key={instrument.id}
            href={`/instruments/${instrument.id}`}
            style={{
              padding: '30px',
              border: '3px solid #000',
              textDecoration: 'none',
              color: '#000',
              transition: 'background-color 0.2s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f0f0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <h2 style={{ 
              fontSize: '1.5rem',
              fontWeight: '700',
              marginBottom: '0.5rem',
            }}>
              {instrument.name}
            </h2>
            <p style={{ 
              fontSize: '1rem',
              color: '#666',
            }}>
              {instrument.description}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}