import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import StepWizard from '../components/StepWizard';
import { trainingSteps } from '../data/trainingSteps';

// Group steps by due date, preserving order
function groupByDue() {
  const groups: { due: string; steps: { step: (typeof trainingSteps)[0]; idx: number }[] }[] = [];
  trainingSteps.forEach((s, i) => {
    const due = s.dueDate ?? '';
    const last = groups[groups.length - 1];
    if (last && last.due === due) {
      last.steps.push({ step: s, idx: i });
    } else {
      groups.push({ due, steps: [{ step: s, idx: i }] });
    }
  });
  return groups;
}

const dueDateGroups = groupByDue();

const DUE_CLASS: Record<string, string> = {
  'Due April 10': 'due-group--april10',
  'Due April 17': 'due-group--april17',
  'Due May 1':    'due-group--may1',
};

export default function BusinessTrainingPage() {
  const [searchParams] = useSearchParams();
  const stepParam = searchParams.get('step');
  const activeStep = stepParam !== null ? Math.max(0, parseInt(stepParam, 10)) : 0;
  const started = stepParam !== null;

  const [manualStarted, setManualStarted] = useState(false);
  const showWizard = started || manualStarted;

  const [currentStep, setCurrentStep] = useState(activeStep);
  const dueDate = trainingSteps[currentStep]?.dueDate;

  if (!showWizard) {
    return (
      <div className="page-bg-white">
        <section className="training-hero">
          <span className="training-hero-icon">🚀</span>
          <h2>How a Business Works with Generative AI</h2>
          <p className="training-hero-sub">
            Start by reviewing the Lithia investor report and conducting market
            research. Meet with Lithia leadership to align priorities, then define
            your business goal, map it to the innovation framework, build artifacts,
            and identify best-fit industries — all with AI as your co-pilot.
          </p>
        </section>

        <section className="overview-list">
          <h3>Your 9-step journey</h3>
          {dueDateGroups.map((group) => (
            <div key={group.due} className={`due-group ${DUE_CLASS[group.due] ?? ''}`}>
              {group.due ? <><hr className="due-group-rule" /><h4 className="due-group-heading">{group.due}</h4></> : null}
              <div className="due-group-row">
                {group.steps.map(({ step: s, idx: i }) => (
                  <article key={i} className="training-card">
                    <div className="training-card-num">STEP {i + 1}</div>
                    <h4>{s.title.replace(/^Step \d+\.\s*/, '')}</h4>
                    <p>{s.objective}</p>
                  </article>
                ))}
              </div>
            </div>
          ))}
          <button className="step-btn start-btn pulse" onClick={() => setManualStarted(true)}>
            Let's Go →
          </button>
        </section>
      </div>
    );
  }

  return (
    <div>
      <section className="training-hero training-hero--compact">
        <h2>How a Business Works with Generative AI</h2>
      </section>
      <StepWizard steps={trainingSteps} initialStep={activeStep} onStepChange={setCurrentStep} />
    </div>
  );
}
