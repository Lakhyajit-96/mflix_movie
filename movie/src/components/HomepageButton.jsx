import React from 'react';

const HomepageButton = ({ href, className = '' }) => {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`
                group relative overflow-hidden
                inline-flex items-center justify-center px-5 py-3 h-11 rounded-lg w-auto
                border backdrop-blur-sm
                transition-all duration-300 ease-out
                transform hover:scale-105 hover:-translate-y-0.5
                border-cyan-400/40 hover:border-cyan-300/70
                text-black hover:text-gray-800
                hover:shadow-cyan-500/30 hover:shadow-lg
                bg-gradient-to-br from-cyan-400/80 via-cyan-300/70 to-cyan-200/60
                hover:from-cyan-300/90 hover:via-cyan-200/80 hover:to-cyan-100/70
                ${className}
            `}
        >
            {/* Glassmorphic background effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Homepage Text */}
            <span className="relative z-10 font-bold text-base text-black group-hover:text-gray-800">
                Visit Homepage
            </span>
            
            {/* Glow effect on hover */}
            <div 
                className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-xl"
                style={{ background: '#06b6d4' }}
            />
        </a>
    );
};

export default HomepageButton;