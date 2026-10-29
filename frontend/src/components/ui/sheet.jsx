import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

export const Sheet = ({ open, onOpenChange, children }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && open) {
        onOpenChange?.(false);
      }
    };
    if (open) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={() => onOpenChange?.(false)}
      />
      {/* Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 pointer-events-none">
        {React.Children.map(children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(child, { onOpenChange })
            : child
        )}
      </div>
    </div>
  );
};

export const SheetContent = ({ className = '', children, onOpenChange, ...props }) => {
  return (
    <div
      className={cn(
        'w-screen max-w-md bg-[#ffffff] border-l border-[#e8e8e8] shadow-2xl flex flex-col pointer-events-auto relative transform transition-transform animate-slide-in-right',
        className
      )}
      {...props}
    >
      <button
        onClick={() => onOpenChange?.(false)}
        className="absolute top-4 right-4 p-1.5 rounded-[6px] text-[#71737a] hover:text-[#1b1b1b] hover:bg-[#ececef] transition-colors"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
      {children}
    </div>
  );
};

export const SheetHeader = ({ className = '', children, ...props }) => (
  <div className={cn('p-6 border-b border-[#e8e8e8] space-y-1', className)} {...props}>
    {children}
  </div>
);

export const SheetTitle = ({ className = '', children, ...props }) => (
  <h3 className={cn('text-lg font-semibold text-[#1b1b1b] font-display', className)} {...props}>
    {children}
  </h3>
);

export const SheetDescription = ({ className = '', children, ...props }) => (
  <p className={cn('text-xs text-[#71737a] font-mono-code', className)} {...props}>
    {children}
  </p>
);

export const SheetFooter = ({ className = '', children, ...props }) => (
  <div className={cn('p-4 border-t border-[#e8e8e8] bg-[#fbfbfb] flex items-center justify-end gap-2 mt-auto', className)} {...props}>
    {children}
  </div>
);

export default {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
};

