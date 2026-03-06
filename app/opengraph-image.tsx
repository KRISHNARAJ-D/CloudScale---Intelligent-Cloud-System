import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'CloudScale Genius - Enterprise Cloud Cost Optimizer';
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = 'image/png';

export default function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: '#0F172A',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif',
                }}
            >
                {/* Glow effect */}
                <div style={{ position: 'absolute', top: -300, left: 300, width: 600, height: 600, background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, rgba(99,102,241,0) 70%)' }}></div>

                {/* Logo Container */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
                    <div style={{
                        width: 140,
                        height: 140,
                        borderRadius: 36,
                        background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 20px 60px rgba(99,102,241,0.5)',
                        marginBottom: 40
                    }}>
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L3 7L12 12V2Z" fill="#ffffff" fillOpacity="0.4" />
                            <path d="M12 2L21 7L12 12V2Z" fill="#ffffff" fillOpacity="0.8" />
                            <path d="M3 17L12 22V12L3 7V17Z" fill="#ffffff" fillOpacity="1" />
                            <path d="M21 17L12 22V12L21 7V17Z" fill="#ffffff" fillOpacity="0.6" />
                        </svg>
                    </div>

                    <div style={{ display: 'flex', color: 'white', fontSize: 72, fontWeight: 800, letterSpacing: '-0.04em' }}>
                        CloudScale <span style={{ color: '#A5B4FC', marginLeft: 16 }}>Genius</span>
                    </div>

                    <div style={{ color: '#94A3B8', fontSize: 32, marginTop: 24, fontWeight: 500, letterSpacing: '-0.01em' }}>
                        Enterprise Cloud Cost Optimizer
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
