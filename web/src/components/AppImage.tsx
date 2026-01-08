import React from 'react';
import Image from 'next/image';

interface AppImageProps {
  src: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  [key: string]: any;
}

export default function AppImage({
  src,
  alt = 'Image',
  className = '',
  width,
  height,
  ...props
}: AppImageProps) {
  if (src?.startsWith('http') || src?.startsWith('/')) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/assets/images/no_image.png';
        }}
        {...props}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 40}
      height={height || 40}
      className={className}
      {...props}
    />
  );
}

