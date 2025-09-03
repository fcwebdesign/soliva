import { ImageResponse } from 'next/og';
import { SITE_NAME } from '@/lib/seo';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          padding: '64px',
        }}
      >
        {/* Logo/Titre du site */}
        <div
          style={{
            fontSize: '72px',
            fontWeight: 'bold',
            color: '#0a0a0a',
            marginBottom: '32px',
            textAlign: 'center',
          }}
        >
          {SITE_NAME}
        </div>
        
        {/* Description */}
        <div
          style={{
            fontSize: '32px',
            color: '#666666',
            textAlign: 'center',
            maxWidth: '800px',
            lineHeight: '1.4',
          }}
        >
          AI-Native Studio
        </div>
        
        {/* Point décoratif */}
        <div
          style={{
            width: '24px',
            height: '24px',
            backgroundColor: '#0066CC',
            borderRadius: '50%',
            marginTop: '48px',
          }}
        />
      </div>
    ),
    { ...size }
  );
} 