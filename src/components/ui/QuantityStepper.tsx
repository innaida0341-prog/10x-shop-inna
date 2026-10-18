interface QuantityStepperProps {
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  label?: string;
}

const btn =
  'inline-flex size-11 items-center justify-center rounded-lg border border-gray-300 text-lg font-semibold transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:hover:bg-gray-700';

export function QuantityStepper({
  value,
  min = 1,
  max,
  onChange,
  disabled = false,
  label = 'quantity',
}: QuantityStepperProps) {
  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        aria-label={`Decrease ${label}`}
        disabled={disabled || value <= min}
        onClick={() => onChange(value - 1)}
        className={btn}
      >
        −
      </button>
      <span className="w-8 text-center font-medium" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        aria-label={`Increase ${label}`}
        disabled={disabled || value >= max}
        onClick={() => onChange(value + 1)}
        className={btn}
      >
        +
      </button>
    </div>
  );
}
