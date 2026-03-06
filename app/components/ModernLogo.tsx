import React from 'react';

export function ModernLogo({ size = 24, color = "#ffffff", className }: { size?: number | string; color?: string; className?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            {/* Top Left Face */}
            <path d="M12 2L3 7L12 12V2Z" fill={color} fillOpacity="0.4" />
            {/* Top Right Face */}
            <path d="M12 2L21 7L12 12V2Z" fill={color} fillOpacity="0.8" />
            {/* Bottom Left Face */}
            <path d="M3 17L12 22V12L3 7V17Z" fill={color} fillOpacity="1" />
            {/* Bottom Right Face */}
            <path d="M21 17L12 22V12L21 7V17Z" fill={color} fillOpacity="0.6" />
        </svg>
    );
}
