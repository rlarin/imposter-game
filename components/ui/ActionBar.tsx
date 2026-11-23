'use client';

import { ReactNode } from 'react';

interface ActionBarProps {
  children: ReactNode;
  className?: string;
}

/**
 * Primary actions for a phase. Fixed to the bottom of the viewport on mobile/tablet so the
 * main call to action is always reachable; rendered inline (in flow) on desktop.
 */
export default function ActionBar({ children, className = '' }: ActionBarProps) {
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-line bg-ink/92 backdrop-blur-lg px-4 pt-3 pb-safe lg:static lg:z-auto lg:border-0 lg:bg-transparent lg:backdrop-blur-none lg:p-0 ${className}`}
    >
      <div className="mx-auto w-full max-w-2xl lg:max-w-none">{children}</div>
    </div>
  );
}

/** Spacer that keeps scrollable content clear of the fixed ActionBar on mobile. */
export function ActionBarSpacer() {
  return <div aria-hidden="true" className="h-24 lg:hidden" />;
}
