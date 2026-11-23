import { ImageResponse } from 'next/og';

// Social preview image (Open Graph / Twitter) generated at build time.
export const alt = 'El Impostor (The Imposter) – free online word game for groups';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px',
        background:
          'radial-gradient(circle at 50% -20%, rgba(124,58,237,0.55), rgba(11,10,20,1) 60%)',
        backgroundColor: '#0b0a14',
        color: '#f4f2ff',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignSelf: 'flex-start',
          padding: '10px 22px',
          borderRadius: 999,
          border: '2px solid rgba(167,139,250,0.6)',
          color: '#c4b5fd',
          fontSize: 28,
          fontWeight: 600,
        }}
      >
        Free · 3–15 players · No sign-up
      </div>
      <div style={{ display: 'flex', marginTop: 36, fontSize: 104, fontWeight: 800 }}>
        El Impostor
      </div>
      <div style={{ display: 'flex', fontSize: 52, fontWeight: 700, color: '#c4b5fd' }}>
        The Imposter word game
      </div>
      <div
        style={{
          display: 'flex',
          marginTop: 32,
          fontSize: 34,
          lineHeight: 1.35,
          color: '#d6d3e6',
          maxWidth: 950,
        }}
      >
        Everyone knows the secret word except the imposter. Give clues, vote, and unmask them — in
        person or over video.
      </div>
    </div>,
    size
  );
}
