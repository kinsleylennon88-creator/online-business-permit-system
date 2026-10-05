import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Button = React.forwardRef(({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  isLoading = false, 
  leftIcon, 
  rightIcon, 
  children, 
  ...props 
}, ref) => {
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm active:bg-primary-800',
    secondary: 'bg-brand-100 text-brand-900 hover:bg-brand-200 active:bg-brand-300',
    accent: 'bg-accent-600 text-white hover:bg-accent-700 shadow-sm active:bg-accent-800',
    outline: 'border-2 border-brand-200 bg-transparent hover:bg-brand-50 text-brand-700',
    ghost: 'bg-transparent hover:bg-brand-100 text-brand-600',
    danger: 'bg-danger-600 text-white hover:bg-danger-700 shadow-sm',
  };

  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs rounded-md',
    sm: 'px-3 py-2 text-sm rounded-lg',
    md: 'px-4 py-2.5 text-sm font-medium rounded-xl',
    lg: 'px-6 py-3.5 text-base font-semibold rounded-2xl',
    xl: 'px-8 py-4 text-lg font-bold rounded-3xl',
  };

  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      disabled={isLoading || props.disabled}
      className={twMerge(
        'inline-flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;
