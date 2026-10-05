import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Badge = ({ 
  children, 
  variant = 'info', 
  className,
  size = 'md',
  ...props 
}) => {
  const variants = {
    info: 'bg-primary-50 text-primary-700 border-primary-100',
    success: 'bg-success-50 text-success-700 border-success-100',
    warning: 'bg-warning-50 text-warning-700 border-warning-100',
    danger: 'bg-danger-50 text-danger-700 border-danger-100',
    neutral: 'bg-brand-50 text-brand-700 border-brand-100',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-semibold',
  };

  return (
    <span 
      className={twMerge(
        'inline-flex items-center rounded-full border',
        variants[variant],
        sizes[size],
        className
      )} 
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
