'use client';

import { InputHTMLAttributes, forwardRef, useId } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  /** Keep the label for screen readers but hide it visually. */
  hideLabel?: boolean;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, hideLabel, error, helperText, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={hideLabel ? 'sr-only' : 'block text-sm font-semibold text-muted mb-2'}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          className={`
            w-full h-13 px-4 rounded-2xl border bg-surface-2 text-fg text-base
            placeholder:text-subtle transition-colors duration-200
            focus:outline-none focus:ring-2
            ${
              error
                ? 'border-danger-fg focus:ring-danger-fg/40'
                : 'border-accent-soft/30 focus:border-accent-soft focus:ring-accent-soft/30'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-danger-fg">{error}</p>}
        {helperText && !error && <p className="mt-1.5 text-sm text-muted">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
