import { useState, useEffect, useRef } from 'react';
import PromptCard from './PromptCard';
import NotesEditor from './NotesEditor';

export type WizardStep = {
  title: string;
  objective: string;
  prompt: string;
  example: string;
  dueDate?: string;
};

type StepWizardProps = {
  steps: WizardStep[];
  initialStep?: number;
  onStepChange?: (index: number) => void;
};

export default function StepWizard({ steps, initialStep = 0, onStepChange }: StepWizardProps) {
  const [current, setCurrent] = useState(initialStep);
  const [direction, setDirection] = useState<'left' | 'right'>('left');
  const [animating, setAnimating] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrent(initialStep);
  }, [initialStep]);

  function goTo(index: number) {
    if (index === current || animating) return;
    setDirection(index > current ? 'left' : 'right');
    setAnimating(true);
    setTimeout(() => {
      setCurrent(index);
      onStepChange?.(index);
      setAnimating(false);
      panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 250);
  }

  const step = steps[current];
  const slideClass = animating
    ? direction === 'left'
      ? 'wizard-slide-out-left'
      : 'wizard-slide-out-right'
    : 'wizard-slide-in';

  return (
    <div ref={panelRef}>
      {/* Progress bar */}
      <div className="wizard-progress">
        {steps.map((s, i) => (
          <button
            key={i}
            className={`wizard-dot ${i === current ? 'active' : ''} ${i < current ? 'done' : ''}`}
            onClick={() => goTo(i)}
            title={s.title}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Current step content */}
      <div className={`wizard-panel ${slideClass}`}>
        <div className="wizard-step-header">
          <p className="badge">
            Step {current + 1} of {steps.length}
          </p>
        </div>
        <h3>{step.title}</h3>
        <p className="section-objective">{step.objective}</p>

        <PromptCard label="Prompt to Use" content={step.prompt} tone="prompt" />
        <PromptCard label="Example Output" content={step.example} tone="example" />

        <NotesEditor defaultFileName={`step-${current + 1}-notes`} />
      </div>

      {/* Navigation */}
      <div className="pager">
        {current > 0 ? (
          <button className="step-btn" onClick={() => goTo(current - 1)}>
            ← Previous
          </button>
        ) : (
          <span />
        )}

        {current < steps.length - 1 ? (
          <button className="step-btn" onClick={() => goTo(current + 1)}>
            Next Step →
          </button>
        ) : (
          <p className="wizard-done-label">✓ All steps complete</p>
        )}
      </div>
    </div>
  );
}
