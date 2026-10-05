import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Input = React.forwardRef(({ 
  label, 
  error, 
  icon, 
  className, 
  helperText,
  containerClassName,
  ...props 
}, ref) => {
  return (
    <div className={twMerge('w-full space-y-1.5', containerClassName)}>
      {label && (
        <label className="block text-sm font-semibold text-brand-700 ml-1">
          {label}
        </label>
      )}
      
      <div className="relative group">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400 group-focus-within:text-primary-500 transition-colors">
            {icon}
          </div>
        )}
        
        <input
          ref={ref}
          className={twMerge(
            'block w-full transition-all duration-200 outline-none sm:text-sm rounded-xl border-2',
            'bg-white text-brand-900 placeholder:text-brand-300',
            icon ? 'pl-11 pr-4' : 'px-4',
            'py-3 border-brand-100 hover:border-brand-200',
            'focus:border-primary-500 focus:ring-4 focus:ring-primary-50',
            error ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-50' : '',
            className
          )}
          {...props}
        />
      </div>

      {error && (
        <p className="text-xs font-medium text-danger-600 ml-1 animate-slide-up">
          {error}
        </p>
      )}
      
      {!error && helperText && (
        <p className="text-xs text-brand-400 ml-1">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
