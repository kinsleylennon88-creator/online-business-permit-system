import React from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

const PermitStepper = ({ steps, currentStep }) => {
  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between relative">
        {/* Connection Line */}
        <div className="absolute top-5 left-0 w-full h-[2px] bg-brand-100 -z-0" />
        <motion.div 
          initial={{ width: "0%" }}
          animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          className="absolute top-5 left-0 h-[2px] bg-primary-600 -z-0 transition-all duration-500"
        />

        {steps.map((step, index) => {
          const isCompleted = currentStep > index + 1;
          const isActive = currentStep === index + 1;
          
          return (
            <div key={index} className="relative z-10 flex flex-col items-center group">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: isCompleted || isActive ? "var(--tw-primary-600)" : "var(--tw-brand-100)",
                  scale: isActive ? 1.2 : 1
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-colors duration-300 ${
                  isCompleted || isActive ? 'bg-primary-600 text-white' : 'bg-brand-100 text-brand-400'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 stroke-[3px]" />
                ) : (
                  <span className="text-sm font-bold">{index + 1}</span>
                )}
              </motion.div>
              <div className="absolute top-12 whitespace-nowrap text-center">
                <p className={`text-xs font-bold uppercase tracking-widest ${
                  isActive ? 'text-primary-600' : isCompleted ? 'text-brand-900' : 'text-brand-300'
                }`}>
                  {step.title}
                </p>
                <p className="text-[10px] text-brand-400 hidden md:block">
                  {step.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="h-10" /> {/* Spacer for labels */}
    </div>
  );
};

export default PermitStepper;
