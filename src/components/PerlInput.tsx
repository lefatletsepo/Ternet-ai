import { useState, useRef, useEffect } from 'react';
import { Sparkles, ArrowRight, Image, Paperclip, Mic } from 'lucide-react';
import gsap from 'gsap';

export default function PerlInput() {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    gsap.to(containerRef.current, {
      opacity: 1,
      y: 0,
      duration: 1.0,
      delay: 0.3,
      ease: 'power3.out',
    });
  }, []);

  useEffect(() => {
    if (!glowRef.current) return;
    if (isFocused || value.length > 0) {
      gsap.to(glowRef.current, {
        opacity: 1,
        scale: 1.02,
        duration: 0.4,
        ease: 'power2.out',
      });
    } else {
      gsap.to(glowRef.current, {
        opacity: 0,
        scale: 1,
        duration: 0.4,
        ease: 'power2.out',
      });
    }
  }, [isFocused, value]);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[900px] mx-auto opacity-0 translate-y-5"
    >
      {/* Glow effect */}
      <div
        ref={glowRef}
        className="absolute -inset-1 rounded-full opacity-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, #00F260, #0575E6, #64F7FF)',
          filter: 'blur(20px)',
          zIndex: 0,
        }}
      />

      {/* Main input container */}
      <div
        className="relative flex items-center gap-3 px-6 py-4 rounded-full"
        style={{
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          zIndex: 1,
        }}
      >
        {/* Sparkles icon */}
        <Sparkles className="w-5 h-5 text-[#64F7FF] flex-shrink-0 opacity-70" />

        {/* Input field */}
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Where knowledge begins"
          className="flex-1 bg-transparent text-white text-[16px] placeholder-white/30 outline-none"
          style={{
            caretColor: '#00F260',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        />

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-full transition-all duration-200 hover:bg-white/10"
            title="Attach file"
          >
            <Paperclip className="w-4 h-4 text-white/50" />
          </button>
          <button
            className="p-2 rounded-full transition-all duration-200 hover:bg-white/10"
            title="Upload image"
          >
            <Image className="w-4 h-4 text-white/50" />
          </button>
          <button
            className="p-2 rounded-full transition-all duration-200 hover:bg-white/10"
            title="Voice input"
          >
            <Mic className="w-4 h-4 text-white/50" />
          </button>
          <button
            className="p-2.5 rounded-full transition-all duration-200 ml-1"
            style={{
              background: value.length > 0
                ? 'linear-gradient(135deg, #00F260, #0575E6)'
                : 'rgba(255, 255, 255, 0.1)',
            }}
          >
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
