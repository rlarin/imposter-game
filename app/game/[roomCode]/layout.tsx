import type { Metadata } from 'next';

// Game rooms are private and short-lived: keep them out of search results.
export const metadata: Metadata = {
  title: 'Game room',
  robots: { index: false, follow: false },
};

export default function GameRoomLayout({ children }: { children: React.ReactNode }) {
  return children;
}
