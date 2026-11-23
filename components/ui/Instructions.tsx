'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, Button } from '@/components/ui';

interface InstructionsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Instructions({ isOpen, onClose }: InstructionsProps) {
  const t = useTranslations('instructions');
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: '🎯',
      title: t('steps.objective.title'),
      content: t('steps.objective.content'),
    },
    {
      icon: '👥',
      title: t('steps.setup.title'),
      content: t('steps.setup.content'),
    },
    {
      icon: '🔤',
      title: t('steps.secretWord.title'),
      content: t('steps.secretWord.content'),
    },
    {
      icon: '🕵️',
      title: t('steps.imposter.title'),
      content: t('steps.imposter.content'),
    },
    {
      icon: '💬',
      title: t('steps.clues.title'),
      content: t('steps.clues.content'),
    },
    {
      icon: '🗳️',
      title: t('steps.voting.title'),
      content: t('steps.voting.content'),
    },
    {
      icon: '🏆',
      title: t('steps.winning.title'),
      content: t('steps.winning.content'),
    },
    {
      icon: '💡',
      title: t('steps.tips.title'),
      content: t('steps.tips.content'),
    },
  ];

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
      setCurrentStep(0);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    onClose();
    setCurrentStep(0);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="max-w-lg w-full shadow-[0_24px_60px_rgba(0,0,0,0.55)] animate-rise max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
          <h2 className="text-xl font-bold text-fg flex items-center gap-2">
            <span>📖</span> {t('title')}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg
              className="w-6 h-6 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Progress indicators */}
        <div className="flex gap-1 mb-4">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                index === currentStep
                  ? 'bg-accent-soft'
                  : index < currentStep
                    ? 'bg-accent/45'
                    : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="text-center mb-4">
            <span className="text-5xl">{steps[currentStep].icon}</span>
          </div>
          <h3 className="text-lg font-semibold text-fg text-center mb-3">
            {steps[currentStep].title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed whitespace-pre-line">
            {steps[currentStep].content}
          </p>
        </div>

        {/* Step counter */}
        <div className="text-center text-sm text-gray-400 dark:text-gray-500 mt-4">
          {currentStep + 1} / {steps.length}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="secondary"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex-1"
          >
            {t('prev')}
          </Button>
          <Button variant="primary" onClick={handleNext} className="flex-1">
            {currentStep === steps.length - 1 ? t('gotIt') : t('next')}
          </Button>
        </div>
      </Card>
    </div>
  );
}
