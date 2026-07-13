import { useState, useCallback, useRef } from 'react';

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

export function useRipple(color = 'rgba(255,255,255,0.25)') {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const idRef = useRef(0);

  const createRipple = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.2;
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      const id = ++idRef.current;
      setRipples((prev) => [...prev, { id, x, y, size }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 600);
    },
    [],
  );

  const rippleElements = ripples.map((r) => (
    <span
      key={r.id}
      className="pointer-events-none absolute rounded-full"
      style={{
        width: r.size,
        height: r.size,
        left: r.x,
        top: r.y,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        transform: 'scale(0)',
        animation: 'ripple-anim 0.6s ease-out forwards',
      }}
    />
  ));

  return { createRipple, rippleElements };
}
