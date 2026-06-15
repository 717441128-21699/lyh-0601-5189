import { useMemo } from 'react';

interface Particle {
  id: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
  opacity: number;
}

const particleColors = [
  'rgba(234, 179, 8, 0.6)',
  'rgba(139, 92, 246, 0.5)',
  'rgba(250, 204, 21, 0.4)',
  'rgba(167, 139, 250, 0.4)',
  'rgba(245, 158, 11, 0.5)',
  'rgba(192, 132, 252, 0.35)',
];

export default function MagicParticles() {
  const particles = useMemo<Particle[]>(() => {
    const count = 40;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 8,
      duration: Math.random() * 6 + 6,
      color: particleColors[Math.floor(Math.random() * particleColors.length)],
      opacity: Math.random() * 0.5 + 0.3,
    }));
  }, []);

  return (
    <div className="magic-particles" aria-hidden="true">
      {particles.map((particle) => (
        <span
          key={particle.id}
          style={{
            left: `${particle.left}%`,
            bottom: `-20px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: particle.color,
            opacity: particle.opacity,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
          }}
        />
      ))}
      <style>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-100vh) translateX(${Math.random() > 0.5 ? '' : '-'}${Math.random() * 100 + 50}px) scale(0);
            opacity: 0;
          }
        }
        .magic-particles span {
          animation: float-up linear infinite;
        }
      `}</style>
    </div>
  );
}
