import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Card = ({ children, className, ...props }) => {
  return (
    <div 
      className={twMerge(
        'bg-white border border-brand-100 rounded-2xl shadow-premium overflow-hidden transition-all duration-300 hover:shadow-premium-lg',
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className, title, subtitle, icon, ...props }) => {
  return (
    <div className={twMerge('px-6 py-5 border-b border-brand-50', className)} {...props}>
      <div className="flex items-center space-x-3">
        {icon && <div className="p-2 bg-brand-50 rounded-xl text-primary-600">{icon}</div>}
        <div>
          {title && <h3 className="text-lg font-display font-semibold text-brand-900">{title}</h3>}
          {subtitle && <p className="text-sm text-brand-500">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
};

const CardBody = ({ children, className, ...props }) => {
  return (
    <div className={twMerge('px-6 py-6', className)} {...props}>
      {children}
    </div>
  );
};

const CardFooter = ({ children, className, ...props }) => {
  return (
    <div className={twMerge('px-6 py-4 bg-brand-50 border-t border-brand-100', className)} {...props}>
      {children}
    </div>
  );
};

export { Card, CardHeader, CardBody, CardFooter };
