import { useEffect, useRef } from 'react';
import { GalleryVerticalEnd, User, Settings, Github, Twitter } from 'lucide-react';
import gsap from 'gsap';
import FluidBackground from './components/FluidBackground';
import PerlInput from './components/PerlInput';
import InfoCard from './components/InfoCard';
import ProgressCounter from './components/ProgressCounter';

export default function App() {
  const logoRef = useRef<HTMLDivElement>(null);
  const bottomLeftRef = useRef<HTMLDivElement>(null);
  const bottomRightRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.to(logoRef.current, {
      opacity: 1,
      y: 0,
      duration: 1.0,
      delay: 0.1,
    })
    .to(taglineRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8,
    }, '-=0.6')
    .to(bottomLeftRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8,
    }, '-=0.5')
    .to(bottomRightRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8,
    }, '-=0.6');

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* Three.js Fluid Background */}
      <FluidBackground />

      {/* Main Content */}
      <div
        className="relative z-10 flex flex-col justify-between w-full h-full"
        style={{ padding: '40px' }}
      >
        {/* Top Section */}
        <div className="flex items-start justify-between">
          {/* Logo */}
          <div
            ref={logoRef}
            className="opacity-0 -translate-y-4 flex items-center gap-3"
          >
            <div className="w-8 h-8 relative">
              <img
                src="/images/info_card_icon.png"
                alt="Ternet"
                className="w-full h-full object-contain"
              />
            </div>
            <span
              className="text-white text-[18px] font-bold tracking-tight"
              style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            >
              Ternet
            </span>
          </div>

          {/* Top Right Actions */}
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 hover:bg-white/10">
              <Settings className="w-4 h-4 text-white/50" />
              <span className="text-white/50 text-[13px]">Settings</span>
            </button>
            <button className="p-2 rounded-full transition-all duration-200 hover:bg-white/10">
              <Github className="w-4 h-4 text-white/50" />
            </button>
            <button className="p-2 rounded-full transition-all duration-200 hover:bg-white/10">
              <Twitter className="w-4 h-4 text-white/50" />
            </button>
          </div>
        </div>

        {/* Center Section */}
        <div className="flex flex-col items-center justify-center flex-1 gap-8">
          {/* Tagline */}
          <div
            ref={taglineRef}
            className="opacity-0 translate-y-4 text-center mb-4"
          >
            <h1
              className="text-white/90 text-[42px] font-semibold tracking-tight leading-tight"
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                letterSpacing: '-0.03em',
              }}
            >
              What do you want to know?
            </h1>
            <p
              className="text-white/40 text-[16px] mt-3"
              style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            >
              Built by Lefatle Studios
            </p>
          </div>

          {/* Perl Input */}
          <PerlInput />

          {/* Suggestion pills */}
          <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
            {['Write a poem', 'Explain quantum physics', 'Code review', 'Brainstorm ideas'].map(
              (suggestion) => (
                <button
                  key={suggestion}
                  className="px-4 py-2 rounded-full text-[13px] text-white/40 transition-all duration-200 hover:text-white/70 hover:bg-white/5"
                  style={{
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    fontFamily: 'Inter, system-ui, sans-serif',
                  }}
                >
                  {suggestion}
                </button>
              )
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex items-end justify-between w-full">
          {/* Bottom Left - Navigation */}
          <div
            ref={bottomLeftRef}
            className="opacity-0 translate-y-4 flex items-center gap-3"
          >
            <button
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 hover:bg-white/10"
              style={{
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <GalleryVerticalEnd className="w-4 h-4 text-white/50" />
              <span
                className="text-white/60 text-[13px]"
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
              >
                Gallery
              </span>
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 hover:bg-white/10"
              style={{
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <User className="w-4 h-4 text-white/50" />
              <span
                className="text-white/60 text-[13px]"
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
              >
                Profile
              </span>
            </button>
          </div>

          {/* Bottom Right - Progress + Info Card */}
          <div
            ref={bottomRightRef}
            className="opacity-0 translate-y-4 flex flex-col items-end gap-3"
          >
            <ProgressCounter />
            <InfoCard />
          </div>
        </div>
      </div>

      {/* CSS for gradient animation */}
      <style>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
