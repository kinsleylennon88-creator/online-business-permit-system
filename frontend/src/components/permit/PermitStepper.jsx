import React from 'react';
import { Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PermitStepper = ({ steps, currentStep }) => {
  const activeStepObj = steps[currentStep - 1] || steps[0];

  return (
    <div className="w-full py-4 sm:py-6">
      {/* Step Circles & Progress Bar */}
      <div className="flex items-center justify-between relative px-2 sm:px-6">
        {/* Background Track Line */}
        <div className="absolute top-4 sm:top-5 left-4 right-4 sm:left-8 sm:right-8 h-[3px] bg-slate-200 -z-0 rounded-full" />
        
        {/* Animated Active Progress Line */}
        <motion.div 
          initial={{ width: "0%" }}
          animate={{ 
            width: `${((currentStep - 1) / Math.max(steps.length - 1, 1)) * 100}%` 
          }}
          className="absolute top-4 sm:top-5 left-4 sm:left-8 h-[3px] bg-sky-600 -z-0 rounded-full transition-all duration-500"
          style={{ maxWidth: 'calc(100% - 2rem)' }}
        />

        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = currentStep > stepNumber;
          const isActive = currentStep === stepNumber;
          
          return (
            <div key={index} className="relative z-10 flex flex-col items-center">
              {/* Step Circle */}
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.15 : 1
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 sm:border-[3px] border-white shadow-md transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-emerald-600 text-white' 
                    : isActive 
                    ? 'bg-sky-600 text-white ring-4 ring-sky-100' 
                    : 'bg-slate-100 text-slate-400 border-slate-200'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3px]" />
                ) : (
                  <span className="text-xs sm:text-sm font-black">{stepNumber}</span>
                )}
              </motion.div>

              {/* Desktop/Tablet Labels (Centered under each step, bounded width to prevent overlapping) */}
              <div className="hidden sm:block absolute top-12 left-1/2 -translate-x-1/2 w-32 md:w-36 text-center pointer-events-none">
                <p className={`text-[11px] md:text-xs font-extrabold uppercase tracking-tight leading-tight transition-colors duration-200 ${
                  isActive 
                    ? 'text-sky-700 font-black' 
                    : isCompleted 
                    ? 'text-slate-800' 
                    : 'text-slate-400'
                }`}>
                  {step.title}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 font-medium">
                  {step.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop label height spacer */}
      <div className="hidden sm:block h-10" />

      {/* Mobile-Optimized Active Step Card (Fixes text collision/merging on phones) */}
      <div className="sm:hidden mt-5 px-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="bg-white border border-sky-100 rounded-xl p-3 shadow-2xs flex items-center justify-between"
          >
            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-center space-x-1.5">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black bg-sky-100 text-sky-800 uppercase tracking-wide">
                  Step {currentStep} of {steps.length}
                </span>
                <span className="text-[11px] font-bold text-slate-400 truncate">
                  {activeStepObj.subtitle}
                </span>
              </div>
              <h4 className="text-xs font-extrabold text-slate-900 mt-1 truncate">
                {activeStepObj.title}
              </h4>
            </div>
            <div className="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-sky-50 text-sky-600 font-bold text-xs">
              {Math.round((currentStep / steps.length) * 100)}%
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PermitStepper;
