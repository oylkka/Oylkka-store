'use client';

import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

interface ColorSwatchProps {
  color: string;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  label?: string;
  disabled?: boolean;
}

export const ColorSwatch = ({
  color,
  isSelected,
  onClick,
  onMouseEnter,
  onMouseLeave,
  label,
  disabled = false,
}: ColorSwatchProps) => {
  // Determine if the color is light to use dark text for the checkmark
  const isLightColor = (color: string): boolean => {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = Number.parseInt(hex.substr(0, 2), 16);
    const g = Number.parseInt(hex.substr(2, 2), 16);
    const b = Number.parseInt(hex.substr(4, 2), 16);

    // Calculate brightness
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128;
  };

  const isDark = !isLightColor(color);

  return (
    <div className='flex flex-col items-center gap-1'>
      <button
        type='button'
        className={cn(
          'relative h-10 w-10 rounded-full border-2 transition-all',
          isSelected ? 'ring-primary ring-2 ring-offset-2' : 'ring-offset-0',
          disabled
            ? 'cursor-not-allowed opacity-50'
            : 'cursor-pointer hover:opacity-90',
        )}
        style={{ backgroundColor: color }}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        aria-label={`Color: ${label || color}`}
        disabled={disabled}
      >
        {isSelected && (
          <div className='absolute inset-0 flex items-center justify-center'>
            <Check
              className={cn(
                'h-5 w-5 drop-shadow-md',
                isDark ? 'text-white' : 'text-black',
              )}
            />
          </div>
        )}
      </button>
      {label && <span className='text-xs'>{label}</span>}
    </div>
  );
};
