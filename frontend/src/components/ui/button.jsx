import React from 'react';
import { cn } from '@/utils/cn';

export const Button = React.forwardRef(({
  className = '',
  variant = 'default',
  size = 'default',
  type = 'button',
  children,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-[6px] font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6e78d5] disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] cursor-pointer';

  const variants = {
    default: 'bg-[#6e78d5] text-white hover:bg-[#5d67c8] shadow-2xs border border-[#6e78d5]',
    primary: 'bg-[#6e78d5] text-white hover:bg-[#5d67c8] shadow-2xs border border-[#6e78d5]',
    secondary: 'bg-[#1b1b1b] text-[#fbfbfb] hover:bg-[#2d2d2d] shadow-2xs border border-[#1b1b1b]',
    outline: 'border border-[#e8e8e8] bg-[#ffffff] hover:bg-[#ececef] text-[#1b1b1b] shadow-2xs',
    ghost: 'hover:bg-[#ececef] text-[#1b1b1b]',
    destructive: 'bg-[#92681b] text-white hover:bg-[#7d5714] shadow-2xs',
  };

  const sizes = {
    default: 'h-9 px-4 py-2 text-sm',
    sm: 'h-8 px-3 text-xs',
    lg: 'h-10 px-6 text-base',
    icon: 'h-9 w-9 p-0',
    'icon-sm': 'h-7 w-7 p-0 text-xs',
  };

  return (
    <button
      ref={ref}
      type={type}
      className={cn(baseStyles, variants[variant] || variants.default, sizes[size] || sizes.default, className)}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;

