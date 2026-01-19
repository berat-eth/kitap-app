'use client';

import { useEffect, useRef } from 'react';

interface ParallaxSectionProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  id?: string;
}

export default function ParallaxSection({ 
  children, 
  className = '', 
  speed = 0.5,
  id = `parallax-${Math.random().toString(36).substr(2, 9)}`
}: ParallaxSectionProps) {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Parallax && parallaxRef.current) {
      const parallax = new (window as any).Parallax(parallaxRef.current, {
        relativeInput: true,
        clipRelativeInput: false,
        hoverOnly: false,
        inputElement: null,
        calibrateX: false,
        calibrateY: true,
        invertX: false,
        invertY: true,
        limitX: false,
        limitY: false,
        scalarX: 10,
        scalarY: 10,
        frictionX: 0.1,
        frictionY: 0.1,
        originX: 0.5,
        originY: 0.5,
        pointerEvents: true,
        precision: 1,
        selector: null,
        onReady: null,
      });

      return () => {
        if (parallax && parallax.destroy) {
          parallax.destroy();
        }
      };
    }
  }, []);

  return (
    <div ref={parallaxRef} className={className} data-parallax-id={id}>
      {children}
    </div>
  );
}

