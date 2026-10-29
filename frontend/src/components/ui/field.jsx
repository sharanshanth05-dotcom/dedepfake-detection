import React from 'react';
import { cn } from '@/utils/cn';

export const FieldGroup = ({ className = '', children, ...props }) => (
  <div className={cn('space-y-4 py-2', className)} {...props}>
    {children}
  </div>
);

export const Field = ({ className = '', children, 'data-invalid': isInvalid, ...props }) => (
  <div
    className={cn('space-y-1.5', isInvalid && 'text-[#92681b]', className)}
    data-invalid={isInvalid}
    {...props}
  >
    {children}
  </div>
);

export const FieldLabel = ({ className = '', htmlFor, children, ...props }) => (
  <label
    htmlFor={htmlFor}
    className={cn('block text-xs font-medium text-[#71737a] tracking-wide font-mono-code uppercase', className)}
    {...props}
  >
    {children}
  </label>
);

export const FieldDescription = ({ className = '', children, ...props }) => (
  <p className={cn('text-xs text-[#71737a] font-mono-code', className)} {...props}>
    {children}
  </p>
);

export default {
  FieldGroup,
  Field,
  FieldLabel,
  FieldDescription,
};

