import React from 'react';
import logoImg from '../assets/logo.png';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark'; // dark = original image, light = text only for dark backgrounds
  width?: number;
}

const Logo: React.FC<LogoProps> = ({ className = '', variant = 'dark', width = 220 }) => {
  const isLightVariant = variant === 'light';

  if (isLightVariant) {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        <span
          className="text-white font-display font-black tracking-tight"
          style={{ fontSize: `${width / 7}px` }}
        >
          <span className="text-primary">SOL</span>
          <span className="text-white">INVEST</span>
          <span className="text-primary">TI</span>
        </span>
        <span
          className="text-white/50 text-[10px] uppercase tracking-[0.3em] mt-2 font-bold"
        >
          Digital Energy Wealth
        </span>
      </div>
    );
  }

  // Dark variant = dark text for light backgrounds (header/footer)
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <span
        className="font-display font-black tracking-tight"
        style={{ fontSize: `${width / 7}px` }}
      >
        <span className="text-primary">SOL</span>
        <span className="text-brand-navy">INVEST</span>
        <span className="text-primary">TI</span>
      </span>
      <span
        className="text-brand-slate text-[10px] uppercase tracking-[0.3em] mt-1 font-bold"
      >
        Digital Energy Wealth
      </span>
    </div>
  );
};

export default Logo;
