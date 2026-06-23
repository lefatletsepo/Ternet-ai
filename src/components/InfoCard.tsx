import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function InfoCard() {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      opacity: 1,
      x: 0,
      duration: 1.0,
      delay: 0.8,
      ease: 'power3.out',
    });
  }, []);

  return (
    <div
      ref={cardRef}
      className="flex items-center gap-3 px-4 py-3 rounded-xl opacity-0 translate-x-4"
      style={{
        background: 'rgba(255, 255, 255, 0.06)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <div className="w-8 h-8 relative flex-shrink-0">
        <img
          src="/images/info_card_icon.png"
          alt="Ternet"
          className="w-full h-full object-contain"
        />
      </div>
      <div className="flex flex-col">
        <span
          className="text-[13px] text-white/80 font-medium leading-tight"
          style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
        >
          A graphical interface of Ternet
        </span>
        <span
          className="text-[11px] text-white/40 leading-tight mt-0.5"
          style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
        >
          by Lefatle Studios
        </span>
      </div>
    </div>
  );
}
