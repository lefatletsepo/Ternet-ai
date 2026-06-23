import { useEffect, useRef, useState } from 'react';

export default function ProgressCounter() {
  const [count, setCount] = useState(0);
  const frameRef = useRef(0);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    const target = 444;
    const duration = 8000; // 8 seconds to reach 444

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      setCount(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const formatted = String(count).padStart(3, '0');

  return (
    <div
      className="text-white/60 text-[14px] tracking-wider select-none"
      style={{ fontFamily: '"JetBrains Mono", monospace' }}
    >
      <span className="text-white/30">[</span>
      <span className="text-[#64F7FF]">{formatted}</span>
      <span className="text-white/30"> / 444 ]</span>
    </div>
  );
}
