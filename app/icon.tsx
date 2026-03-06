import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Image metadata
export const size = {
    width: 32,
    height: 32,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: 24,
                    background: 'transparent',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L3 7L12 12V2Z" fill="#6366F1" fillOpacity="0.4" />
                    <path d="M12 2L21 7L12 12V2Z" fill="#6366F1" fillOpacity="0.8" />
                    <path d="M3 17L12 22V12L3 7V17Z" fill="#8B5CF6" fillOpacity="1" />
                    <path d="M21 17L12 22V12L21 7V17Z" fill="#8B5CF6" fillOpacity="0.6" />
                </svg>
            </div>
        ),
        {
            ...size,
        }
    );
}
