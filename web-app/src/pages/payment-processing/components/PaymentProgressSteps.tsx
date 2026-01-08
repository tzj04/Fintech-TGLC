import React from 'react';
import Icon from '../../../components/AppIcon';

const PaymentProgressSteps = ({ currentStep }) => {
  const steps = [
    { id: 1, label: 'Review Details', icon: 'FileText' },
    { id: 2, label: 'Confirm Payment', icon: 'CheckCircle2' },
    { id: 3, label: 'Blockchain Submit', icon: 'Send' },
    { id: 4, label: 'Verification', icon: 'Shield' }
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6 lg:p-8 shadow-glow-md">
      <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-foreground mb-6 md:mb-8">Payment Process</h2>
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted hidden md:block" style={{ top: '20px' }} />
        <div 
          className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500 hidden md:block" 
          style={{ 
            width: `${((currentStep - 1) / (steps?.length - 1)) * 100}%`,
            top: '20px'
          }} 
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-0 relative">
          {steps?.map((step, index) => {
            const isCompleted = currentStep > step?.id;
            const isCurrent = currentStep === step?.id;
            const isPending = currentStep < step?.id;

            return (
              <div key={step?.id} className="flex flex-col items-center relative">
                <div className={`
                  w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 relative z-10
                  ${isCompleted ? 'bg-success text-success-foreground' : ''}
                  ${isCurrent ? 'bg-primary text-primary-foreground animate-pulse' : ''}
                  ${isPending ? 'bg-muted text-muted-foreground' : ''}
                `}>
                  {isCompleted ? (
                    <Icon name="Check" size={20} className="md:w-6 md:h-6" />
                  ) : (
                    <Icon name={step?.icon} size={20} className="md:w-6 md:h-6" />
                  )}
                </div>
                <div className="mt-3 text-center">
                  <p className={`text-xs md:text-sm font-medium transition-colors ${
                    isCurrent ? 'text-primary' : isCompleted ? 'text-success' : 'text-muted-foreground'
                  }`}>
                    {step?.label}
                  </p>
                  {isCurrent && (
                    <p className="text-xs text-muted-foreground mt-1">In Progress</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PaymentProgressSteps;