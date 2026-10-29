import React from 'react';
import { cn } from '@/utils/cn';

export const Textarea = React.forwardRef(({
  className = '',
  rows = 3,
  ...props
}, ref) => {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        'flex w-full rounded-[6px] border border-[#e8e8e8] bg-[#ffffff] px-3 py-2 text-sm text-[#1b1b1b] shadow-2xs transition-colors',
        'placeholder:text-[#71737a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6e78d5] focus-visible:border-transparent',
        'disabled:cursor-not-allowed disabled:opacity-50 font-sans',
        className
      )}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';
export default Textarea;

