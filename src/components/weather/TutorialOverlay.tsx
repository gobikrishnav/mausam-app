import React, { useState } from 'react';
import { Sparkles, X, ChevronRight, Check } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

const TUTORIAL_STEPS = [
  {
    title: 'Condition-Reactive Hero',
    desc: 'The top header dynamically transforms its color gradients and animated weather based on live meteorological conditions and time of day.',
  },
  {
    title: 'AI Smart Brief',
    desc: 'Powered by 100% Offline AI, MAUSAM creates a personalized narrative each morning answering how today’s weather specifically impacts your chosen lifestyle without needing any API key.',
  },
  {
    title: 'Persona Weather Feed',
    desc: 'Forget cluttered charts! Your feed presents custom cards prioritized for your active personas (running windows, commute delays, crop soil moisture, etc.).',
  },
  {
    title: 'Safety-First Alert Override',
    desc: 'In severe conditions like cyclones, heavy storms, or extreme heatwaves, critical IMD alerts will automatically pin above all other content.',
  },
  {
    title: 'Ask MAUSAM Assistant',
    desc: 'Tap the sparkling center button anytime to ask questions like "Should I run tomorrow morning?" or "What should I pack for my trip to Manali?".',
  },
];

export const TutorialOverlay: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const setTutorialCompleted = useAppStore(state => state.setTutorialCompleted);
  const hasCompleted = useAppStore(state => state.hasCompletedTutorial);

  if (hasCompleted) return null;

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setTutorialCompleted(true);
    }
  };

  const handleSkip = () => {
    setTutorialCompleted(true);
  };

  const step = TUTORIAL_STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6 animate-fadeIn">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl relative text-slate-100 flex flex-col">
        {/* Close / Skip button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Skip Tutorial"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step Badge */}
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-xl bg-primary/20 text-primary">
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            Feature Guide • {currentStep + 1} of {TUTORIAL_STEPS.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full mb-4 overflow-hidden flex gap-1">
          {TUTORIAL_STEPS.map((_, i) => (
            <div 
              key={i} 
              className={`h-full flex-1 rounded-full transition-all duration-300 ${
                i <= currentStep ? 'bg-primary' : 'bg-slate-700'
              }`} 
            />
          ))}
        </div>

        {/* Content */}
        <h3 className="text-lg font-bold font-sans text-white mb-2">{step.title}</h3>
        <p className="text-xs text-slate-300 leading-relaxed min-h-[60px] font-sans">
          {step.desc}
        </p>

        {/* Action buttons */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800">
          <button
            onClick={handleSkip}
            className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
          >
            Skip Tutorial
          </button>

          <button
            onClick={handleNext}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-primary/30 transition-all"
          >
            {currentStep === TUTORIAL_STEPS.length - 1 ? (
              <>
                <span>Get Started</span>
                <Check className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
