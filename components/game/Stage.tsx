import { ReactNode } from 'react';
import { Icon, IconName } from '@/components/ui';

/** Centered "moment" layout used by result-style phases. */
export function Stage({ children }: { children: ReactNode }) {
  return (
    <section className="mx-auto flex w-full max-w-xl flex-col items-center gap-5 py-6 text-center lg:rounded-3xl lg:border lg:border-line lg:bg-surface lg:p-8">
      {children}
    </section>
  );
}

const tones = {
  accent: 'bg-accent/18 text-accent-fg',
  danger: 'bg-danger/18 text-danger-fg',
  success: 'bg-success/16 text-success',
  hint: 'bg-hint/14 text-hint',
  muted: 'bg-white/6 text-muted',
};

export function StageIcon({
  name,
  tone = 'accent',
  className = '',
}: {
  name: IconName;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <div
      className={`flex size-18 items-center justify-center rounded-full ${tones[tone]} ${className}`}
    >
      <Icon name={name} className="size-9" />
    </div>
  );
}
