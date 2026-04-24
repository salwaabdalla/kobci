import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SplashScreen() {
  const navigate = useNavigate();
  const barRef = useRef(null);
  const containerRef = useRef(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 100);
    const t2 = setTimeout(() => setStep(2), 600);
    const t3 = setTimeout(() => setStep(3), 1200);
    const t4 = setTimeout(() => setStep(4), 1800);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (barRef.current) barRef.current.style.width = '100%';
      });
    });

    const end = setTimeout(() => {
      if (containerRef.current) containerRef.current.style.opacity = '0';
      setTimeout(() => {
        const profile = localStorage.getItem('kobcin_profile');
        navigate(profile ? '/dashboard' : '/landing');
      }, 600);
    }, 4000);

    return () => [t1,t2,t3,t4,end].forEach(clearTimeout);
  }, [navigate]);

  return (
    <div ref={containerRef} style={{
      position: 'fixed', inset: 0,
      background: '#C2185B',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      transition: 'opacity 0.6s ease', opacity: 1, zIndex: 9999,
      overflow: 'hidden'
    }}>

      <style>{`
        @keyframes slam {
          0% { transform: scale(4) translateY(-60px); opacity: 0; filter: blur(8px); }
          60% { transform: scale(0.95) translateY(4px); opacity: 1; filter: blur(0); }
          80% { transform: scale(1.04) translateY(-2px); }
          100% { transform: scale(1) translateY(0); opacity: 1; filter: blur(0); }
        }
        @keyframes slideUp {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes expandWidth {
          from { width: 0; opacity: 0; }
          to { width: 120px; opacity: 1; }
        }
        @keyframes flashBg {
          0% { background: #C2185B; }
          10% { background: #ffffff; }
          20% { background: #C2185B; }
          100% { background: #C2185B; }
        }
      `}</style>

      {/* Flash effect when text slams in */}
      {step >= 1 && (
        <div style={{
          position: 'absolute', inset: 0,
          animation: 'flashBg 0.4s ease forwards',
          zIndex: -1
        }} />
      )}

      {/* Big white block behind text for impact */}
      {step >= 1 && (
        <div style={{
          position: 'absolute',
          width: '110%', height: '220px',
          background: 'rgba(255,255,255,0.07)',
          transform: 'skewY(-3deg)'
        }} />
      )}

      {/* Main KOBCIN text */}
      {step >= 1 && (
        <h1 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 'clamp(80px, 15vw, 140px)',
          fontWeight: '700',
          color: 'white',
          letterSpacing: '8px',
          margin: 0,
          lineHeight: 1,
          textAlign: 'center',
          animation: 'slam 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
          textShadow: '0 8px 40px rgba(0,0,0,0.3), 0 2px 0 rgba(0,0,0,0.2)'
        }}>KOBCIN</h1>
      )}

      {/* Divider line */}
      {step >= 2 && (
        <div style={{
          height: '3px',
          background: 'white',
          marginTop: '20px',
          marginBottom: '20px',
          animation: 'expandWidth 0.4s ease forwards',
          width: 0, opacity: 0,
          borderRadius: '2px'
        }} />
      )}

      {/* Tagline */}
      {step >= 3 && (
        <p style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '14px',
          fontWeight: '400',
          color: 'rgba(255,255,255,0.9)',
          letterSpacing: '5px',
          textTransform: 'uppercase',
          margin: 0,
          animation: 'slideUp 0.5s ease forwards'
        }}>Ganacsigaaga kor u qaad</p>
      )}

      {/* Subtitle */}
      {step >= 4 && (
        <p style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '12px',
          fontWeight: '300',
          color: 'rgba(255,255,255,0.6)',
          letterSpacing: '2px',
          margin: '10px 0 0 0',
          animation: 'slideUp 0.5s ease forwards'
        }}>AI-ga Haweenka Ganacsiga Soomaaliyeed</p>
      )}

      {/* Bottom progress bar */}
      <div style={{
        position: 'absolute', bottom: 0,
        left: 0, right: 0, height: '4px',
        background: 'rgba(255,255,255,0.2)'
      }}>
        <div ref={barRef} style={{
          height: '100%', width: '0%',
          background: 'white',
          transition: 'width 4s linear'
        }} />
      </div>

    </div>
  );
}