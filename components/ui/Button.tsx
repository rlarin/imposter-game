'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { useTranslations } from 'next-intl';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'soft';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const variants = {
  primary:
    'bg-accent hover:bg-accent-hover text-white shadow-[0_10px_28px_rgba(124,58,237,0.35)] disabled:shadow-none',
  secondary: 'bg-white/6 hover:bg-white/10 border border-line-strong text-fg',
  danger:
    'bg-danger hover:bg-danger-hover text-white shadow-[0_10px_28px_rgba(225,29,72,0.30)] disabled:shadow-none',
  ghost: 'bg-transparent hover:bg-white/6 text-fg-soft',
  soft: 'bg-accent/18 hover:bg-accent/26 border border-accent-soft/40 text-accent-fg',
};

const sizes = {
  sm: 'h-10 px-3.5 text-sm rounded-xl gap-1.5',
  md: 'h-11 px-5 text-[15px] rounded-xl gap-2',
  lg: 'h-14 px-7 text-base rounded-2xl gap-2',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className = '', variant = 'primary', size = 'md', isLoading, children, disabled, ...props },
    ref
  ) => {
    const t = useTranslations();

    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin size-4" viewBox="0 0 24 24" aria-hidden="true">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {t('common.loading')}
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
