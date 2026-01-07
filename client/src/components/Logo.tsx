import React, { useState } from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

/**
 * Logo component - uses actual image file
 * Place your logo image in: client/public/logo.png (or .svg, .jpg)
 */
export default function Logo({ className = '', size = 48 }: LogoProps) {
  const [imageError, setImageError] = useState(false);
  
  // Try different possible logo file names
  const possibleLogoSrcs = ['/logo.png', '/logo.svg', '/logo.jpg', '/logo.jpeg'];
  const logoSrc = '/logo.png';

  if (imageError) {
    // Fallback: Show a placeholder or return null
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '16px',
          background: '#1e3a8a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '10px',
        }}
        title="Logo image not found. Please add logo.png to client/public/"
      >
        Logo
      </div>
    );
  }

  return (
    <img
      src={logoSrc}
      alt="Logo"
      width={size}
      height={size}
      className={className}
      style={{
        borderRadius: '16px',
        objectFit: 'contain',
        display: 'block',
      }}
      onError={(e) => {
        console.warn('Logo image not found at /logo.png');
        console.warn('Please place your logo file in: candidate-360-nps/client/public/logo.png');
        setImageError(true);
      }}
    />
  );
}

