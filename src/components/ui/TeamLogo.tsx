import React, { useState, useEffect } from 'react';

/**
 * Helper to check if a string looks like an image URL or image asset path
 */
export function isImageUrl(value?: string): boolean {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('./')
  ) {
    return true;
  }
  // Check common image file extensions
  if (/\.(png|jpe?g|svg|webp|gif|ico|avif|bmp)(\?.*)?$/i.test(trimmed)) {
    return true;
  }
  return false;
}

/**
 * Format and convert cloud image links (such as Google Drive sharing URLs, Imgur, GitHub)
 * into direct embeddable image source URLs.
 */
export function formatImageUrl(url?: string): string {
  if (!url || typeof url !== 'string') return '';
  const cleanUrl = url.trim();

  // Convert Google Drive share link to direct image link
  const driveFileMatch = cleanUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (driveFileMatch && driveFileMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveFileMatch[1]}`;
  }

  // Convert Google Drive open?id= or uc?id= or any query parameter id=
  const driveIdMatch = cleanUrl.match(/(?:drive|docs)\.google\.com\/(?:open|uc)\?.*id=([a-zA-Z0-9_-]+)/i) || cleanUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/i);
  if (driveIdMatch && driveIdMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveIdMatch[1]}`;
  }

  // Convert GitHub blob links to raw
  if (cleanUrl.includes('github.com') && cleanUrl.includes('/blob/')) {
    return cleanUrl.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
  }

  // Convert Dropbox share links with dl=0 to raw=1
  if (cleanUrl.includes('dropbox.com') && cleanUrl.includes('dl=0')) {
    return cleanUrl.replace('dl=0', 'raw=1');
  }

  return cleanUrl;
}

export interface TeamLogoProps {
  logo?: string;
  logoUrl?: string;
  name?: string;
  teamName?: string;
  color?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  fallbackEmoji?: string;
  roundedClassName?: string;
}

/**
 * Dynamic Team / House Logo Component
 * Automatically detects whether the logo is an Image URL (HTTP/HTTPS/Data URI/Local)
 * or an Emoji / Unicode Symbol / House Initials, and gracefully handles broken images.
 */
export const TeamLogo: React.FC<TeamLogoProps> = ({
  logo,
  logoUrl,
  name = '',
  teamName,
  color,
  className = '',
  size = 'md',
  fallbackEmoji = '🛡️',
  roundedClassName = 'rounded-xl',
}) => {
  const [hasError, setHasError] = useState(false);
  const effectiveLogo = logo || logoUrl;
  const effectiveName = name || teamName || '';
  const rawLogo = effectiveLogo?.trim();

  // Reset error if logo prop changes
  useEffect(() => {
    setHasError(false);
  }, [effectiveLogo]);

  const isImg = Boolean(rawLogo && isImageUrl(rawLogo) && !hasError);

  // Responsive and fixed size presets
  const sizeClasses: Record<string, { img: string; text: string; box: string; font: string }> = {
    xs: { img: 'w-4 h-4 object-contain', text: 'text-xs', box: 'w-4 h-4', font: 'text-[9px]' },
    sm: { img: 'w-6 h-6 object-contain', text: 'text-sm', box: 'w-6 h-6', font: 'text-[10px]' },
    md: { img: 'w-8 h-8 object-contain', text: 'text-xl', box: 'w-8 h-8', font: 'text-xs' },
    lg: { img: 'w-10 h-10 object-contain', text: 'text-2xl', box: 'w-10 h-10', font: 'text-sm' },
    xl: { img: 'w-12 h-12 object-contain', text: 'text-3xl', box: 'w-12 h-12', font: 'text-base' },
    '2xl': { img: 'w-16 h-16 object-contain', text: 'text-4xl', box: 'w-16 h-16', font: 'text-xl' },
    '3xl': { img: 'w-20 h-20 object-contain', text: 'text-5xl', box: 'w-20 h-20', font: 'text-2xl' },
    '4xl': { img: 'w-24 h-24 object-contain', text: 'text-6xl', box: 'w-24 h-24', font: 'text-3xl' },
    '5xl': { img: 'w-28 h-28 object-contain', text: 'text-7xl', box: 'w-28 h-28', font: 'text-4xl' },
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  if (isImg && rawLogo) {
    return (
      <img
        src={formatImageUrl(rawLogo)}
        alt={effectiveName ? `${effectiveName} crest` : 'Team crest'}
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className={`${currentSize.img} ${roundedClassName} shrink-0 transition-transform ${className}`}
      />
    );
  }

  // If emoji or symbol string and not a broken URL
  if (rawLogo && !isImageUrl(rawLogo)) {
    return (
      <span className={`inline-flex items-center justify-center select-none shrink-0 transition-transform ${currentSize.text} ${className}`}>
        {rawLogo}
      </span>
    );
  }

  // Fallback to stylized team letter badge if color or name is available
  if (effectiveName) {
    return (
      <span
        className={`inline-flex items-center justify-center font-black font-mono text-white select-none shrink-0 shadow-xs ${roundedClassName} ${currentSize.box} ${currentSize.font} ${className}`}
        style={{ backgroundColor: color || '#4f46e5' }}
      >
        {effectiveName.slice(0, 2).toUpperCase()}
      </span>
    );
  }

  // Default fallback emoji
  return (
    <span className={`inline-flex items-center justify-center select-none shrink-0 ${currentSize.text} ${className}`}>
      {fallbackEmoji}
    </span>
  );
};

export interface ParticipantAvatarProps {
  photo?: string;
  name?: string;
  className?: string;
}

export const ParticipantAvatar: React.FC<ParticipantAvatarProps> = ({
  photo,
  name = 'Participant',
  className = 'w-8 h-8 rounded-full object-cover border border-slate-200',
}) => {
  const [hasError, setHasError] = useState(false);
  const rawPhoto = photo?.trim();
  const formattedUrl = formatImageUrl(rawPhoto);

  const isImg = Boolean(formattedUrl && isImageUrl(formattedUrl) && !hasError);

  if (isImg) {
    return (
      <img
        src={formattedUrl}
        alt={name}
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className={className}
      />
    );
  }

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <span
      className={`inline-flex items-center justify-center font-bold font-mono text-indigo-700 bg-indigo-50 border border-indigo-200 select-none shrink-0 ${className}`}
    >
      {initials || '👤'}
    </span>
  );
};
