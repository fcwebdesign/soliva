'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';

interface FloatingImage {
  id?: string;
  src: string;
  alt?: string;
  hidden?: boolean;
}

interface FloatingGalleryData {
  title?: string;
  subtitle?: string;
  intensity?: number; // 0-100, contrôle la vitesse
  images?: FloatingImage[];
  theme?: 'light' | 'dark' | 'auto';
}

export default function FloatingImageGalleryBlock({ data }: { data: FloatingGalleryData | any }) {
  const blockData = useMemo(() => (data as any).data || data, [data]);
  const images = useMemo(
    () => (blockData.images || []).filter((img: FloatingImage) => img?.src && !img.hidden),
    [blockData]
  );

  const title = blockData.title || 'Floating Images Gallery';
  const subtitle = blockData.subtitle || 'Next.js and GSAP';
  const intensity = typeof blockData.intensity === 'number' ? blockData.intensity : 50;

  const plane1Ref = useRef<HTMLDivElement>(null);
  const plane2Ref = useRef<HTMLDivElement>(null);
  const plane3Ref = useRef<HTMLDivElement>(null);

  const requestIdRef = useRef<number | null>(null);
  const xForceRef = useRef(0);
  const yForceRef = useRef(0);

  // Positions exactes de la démo (3 plans)
  const plane1Positions = [
    { left: '90%', top: '70%', width: 300 },
    { left: '5%', top: '65%', width: 300 },
    { left: '35%', top: '0%', width: 225 },
  ];
  const plane2Positions = [
    { left: '5%', top: '10%', width: 250 },
    { left: '80%', top: '5%', width: 200 },
    { left: '60%', top: '60%', width: 225 },
  ];
  const plane3Positions = [
    { left: '65%', top: '2.5%', width: 150 },
    { left: '40%', top: '75%', width: 200 },
  ];

  // Répartition des images suivant le pattern original (8 visuels)
  const planes = useMemo(() => {
    const p1: FloatingImage[] = [];
    const p2: FloatingImage[] = [];
    const p3: FloatingImage[] = [];
    const pattern = [
      { plane: 'p1', slot: 0 },
      { plane: 'p1', slot: 1 },
      { plane: 'p1', slot: 2 },
      { plane: 'p2', slot: 0 },
      { plane: 'p2', slot: 1 },
      { plane: 'p2', slot: 2 },
      { plane: 'p3', slot: 0 },
      { plane: 'p3', slot: 1 },
    ];

    images.forEach((img, idx) => {
      const target = pattern[idx % pattern.length];
      if (target.plane === 'p1') p1.push(img);
      if (target.plane === 'p2') p2.push(img);
      if (target.plane === 'p3') p3.push(img);
    });

    return { p1, p2, p3 };
  }, [images]);

  const easing = 0.08;
  const speed = (intensity / 100) * 0.02 || 0.01; // 0.01 = valeur du repo
  const lerp = (start: number, target: number, amount: number) => start * (1 - amount) + target * amount;

  const animate = () => {
    xForceRef.current = lerp(xForceRef.current, 0, easing);
    yForceRef.current = lerp(yForceRef.current, 0, easing);

    if (plane1Ref.current) {
      gsap.set(plane1Ref.current, { x: `+=${xForceRef.current}`, y: `+=${yForceRef.current}` });
    }
    if (plane2Ref.current) {
      gsap.set(plane2Ref.current, { x: `+=${xForceRef.current * 0.5}`, y: `+=${yForceRef.current * 0.5}` });
    }
    if (plane3Ref.current) {
      gsap.set(plane3Ref.current, { x: `+=${xForceRef.current * 0.25}`, y: `+=${yForceRef.current * 0.25}` });
    }

    if (Math.abs(xForceRef.current) < 0.01) xForceRef.current = 0;
    if (Math.abs(yForceRef.current) < 0.01) yForceRef.current = 0;

    if (xForceRef.current !== 0 || yForceRef.current !== 0) {
      requestAnimationFrame(animate);
    } else if (requestIdRef.current) {
      cancelAnimationFrame(requestIdRef.current);
      requestIdRef.current = null;
    }
  };

  const manageMouseMove = (event: React.MouseEvent) => {
    if (!images.length) return;
    const { movementX, movementY } = event;
    xForceRef.current += movementX * speed;
    yForceRef.current += movementY * speed;

    if (requestIdRef.current == null) {
      requestIdRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    return () => {
      if (requestIdRef.current) cancelAnimationFrame(requestIdRef.current);
    };
  }, []);

  // Déterminer la couleur de fond selon le thème
  const getBackgroundColor = () => {
    const theme = blockData.theme || 'auto';
    if (theme === 'light') {
      return '#ffffff';
    } else if (theme === 'dark') {
      return '#050505';
    } else {
      // Auto : utiliser la variable CSS de la palette
      return 'var(--background)';
    }
  };

  const getTextColor = () => {
    const theme = blockData.theme || 'auto';
    if (theme === 'light') {
      return '#000000';
    } else if (theme === 'dark') {
      return '#ffffff';
    } else {
      // Auto : utiliser la variable CSS de la palette
      return 'var(--foreground)';
    }
  };

  // Aucun visuel -> placeholder simple
  if (!images.length) {
    return (
      <section
        className="floating-gallery-section"
        data-block-type="floating-gallery"
        data-block-theme={blockData.theme || 'auto'}
        style={{
          width: '100%',
          height: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: getBackgroundColor(),
          color: getTextColor(),
        }}
      >
        <div style={{ textAlign: 'center', color: 'var(--muted-foreground)' }}>Ajoutez des images pour voir la galerie flottante.</div>
      </section>
    );
  }

  return (
    <section
      className="floating-gallery-section"
      data-block-type="floating-gallery"
      data-block-theme={blockData.theme || 'auto'}
      style={{
        width: '100%',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: getBackgroundColor(),
        color: getTextColor(),
      }}
      onMouseMove={manageMouseMove}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <div
          ref={plane1Ref}
          style={{ position: 'absolute', width: '100%', height: '100%', filter: 'brightness(0.7)' }}
        >
          {planes.p1.map((img, idx) => {
            const pos = plane1Positions[idx % plane1Positions.length];
            return (
              <img
                key={img.id || `p1-${idx}`}
                src={img.src}
                alt={img.alt || ''}
                style={{
                  position: 'absolute',
                  left: pos.left,
                  top: pos.top,
                  width: pos.width,
                }}
              />
            );
          })}
        </div>

        <div
          ref={plane2Ref}
          style={{ position: 'absolute', width: '100%', height: '100%', filter: 'brightness(0.6)' }}
        >
          {planes.p2.map((img, idx) => {
            const pos = plane2Positions[idx % plane2Positions.length];
            return (
              <img
                key={img.id || `p2-${idx}`}
                src={img.src}
                alt={img.alt || ''}
                style={{
                  position: 'absolute',
                  left: pos.left,
                  top: pos.top,
                  width: pos.width,
                }}
              />
            );
          })}
        </div>

        <div
          ref={plane3Ref}
          style={{ position: 'absolute', width: '100%', height: '100%', filter: 'brightness(0.5)' }}
        >
          {planes.p3.map((img, idx) => {
            const pos = plane3Positions[idx % plane3Positions.length];
            return (
              <img
                key={img.id || `p3-${idx}`}
                src={img.src}
                alt={img.alt || ''}
                style={{
                  position: 'absolute',
                  left: pos.left,
                  top: pos.top,
                  width: pos.width,
                }}
              />
            );
          })}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '45%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          fontSize: '18px',
        }}
      >
        <h1 style={{ margin: 0, fontWeight: 400, color: getTextColor() }}>{title}</h1>
        <p style={{ margin: '10px 0 0', color: 'var(--muted-foreground)' }}>{subtitle}</p>
      </div>
    </section>
  );
}
