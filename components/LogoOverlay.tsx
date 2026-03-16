import React from 'react';

interface LogoOverlayProps {
  hidden?: boolean;
}

export const LogoOverlay: React.FC<LogoOverlayProps> = ({ hidden = false }) => {
  if (hidden) return null;

  return (
    <img
      src="./5dVR 10 years logo.png"
      alt="5dVR 10 Years Logo"
      className="absolute z-[100] pointer-events-none"
      style={{
        width: '30%',
        right: '12%',
        bottom: '4.68%',
      }}
    />
  );
};
