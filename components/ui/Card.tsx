'use client';

import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'accent' | 'danger' | 'success';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variants = {
  default: 'bg-surface border border-line',
  elevated: 'bg-surface border border-line shadow-[0_24px_60px_rgba(0,0,0,0.45)]',
  outlined: 'bg-transparent border border-line-strong',
  accent: 'bg-accent/16 border border-accent-soft/35',
  danger: 'bg-danger/12 border border-danger-fg/40',
  success: 'bg-success/10 border border-success/35',
};

const paddings = {
  none: '',
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-5',
  lg: 'p-5 sm:p-8',
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', variant = 'default', padding = 'md', children, ...props }, ref) => (
    <div
      ref={ref}
      className={`rounded-[20px] ${variants[variant]} ${paddings[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);

Card.displayName = 'Card';

export default Card;
