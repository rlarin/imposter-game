'use client';

interface SegmentedOption<T> {
  value: T;
  label: string;
}

interface SegmentedProps<T> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  disabled?: boolean;
}

export default function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  label,
  disabled,
}: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="grid gap-1 p-1 rounded-xl bg-white/4 border border-white/6"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={`h-10 rounded-[9px] text-sm font-semibold transition-colors disabled:cursor-not-allowed ${
              selected
                ? 'bg-accent text-white'
                : 'text-muted hover:text-fg enabled:hover:bg-white/5'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
