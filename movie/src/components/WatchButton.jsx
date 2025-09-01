import React from 'react';

// Platform configuration with official logo URLs
const platforms = [
  {
    name: "Netflix",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
    service: "netflix",
  },
  {
    name: "Disney+",
    logo: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg",
    service: "disney",
  },
  {
    name: "Prime Video",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/f1/Prime_Video.png",
    service: "prime",
  },
  {
    name: "HBO Max",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/17/HBO_Max_Logo.svg",
    service: "hbo",
  },
  {
    name: "Amazon",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    service: "amazon",
  },
  {
    name: "Google Play",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg",
    service: "googleplay",
  },
];

// Create a mapping object for easy lookup
const platformMap = platforms.reduce((acc, platform) => {
  acc[platform.service] = platform;
  return acc;
}, {});

const WatchButton = ({ href, service, className = '' }) => {
  // Get platform info
  const platform = platformMap[service];

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        group relative overflow-hidden
        inline-flex items-center justify-center gap-2
        px-3 py-2 h-9 w-32
        rounded-full border backdrop-blur-sm
        transition-all duration-300 ease-out
        transform hover:scale-105 transition-transform duration-200
        border-white/10 hover:border-white/20
        text-white text-sm font-medium
        bg-gradient-to-br from-black via-[#0a0a0a] to-[#1a1a1a]
        hover:shadow-lg hover:shadow-purple-500/30
        ${className}
      `}
    >
      {/* Glassmorphic background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Official Logo Only */}
      {platform && (
        <div className="relative z-10 flex-shrink-0">
          <img
            src={platform.logo}
            alt={`${platform.name} logo`}
            className="h-5 w-auto object-contain drop-shadow-sm"
            style={{
              filter: platform.service === 'amazon' ? 'brightness(0) invert(1)' : 'none'
            }}
            onError={(e) => {
              // Fallback to text if image fails to load
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          {/* Fallback text */}
          <span className="hidden text-sm font-bold text-white drop-shadow-sm">
            {platform.name.charAt(0)}
          </span>
        </div>
      )}

      {/* Glow effect on hover */}
      <div
        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"
        style={{ background: '#8b5cf6' }} // unified purple glow
      ></div>
    </a>
  );
};

export default WatchButton;