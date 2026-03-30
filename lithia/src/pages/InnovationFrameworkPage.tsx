import { useState } from 'react';
import StepWizard from '../components/StepWizard';
import { frameworkSteps } from '../data/frameworkSteps';

const stepIcons = ['📄', '💼', '📦'];

export default function InnovationFrameworkPage() {
  const [started, setStarted] = useState(false);

  if (!started) {
    return (
      <div>
        <section className="training-hero training-hero--framework">
          <span className="training-hero-icon">🧪</span>
          <p className="badge">Page 2 of 3</p>
          <h2>Innovation Framework Lab</h2>
          <p className="training-hero-sub">
            Connect the Lithia investor plan to the innovation framework, draft a
            sample business case, and build a team discussion pack before entering
            the full foundations workflow.
          </p>
        </section>

        <section className="overview-list">
          <h3>Your 3-step lab</h3>
          <div className="training-cards">
            {frameworkSteps.map((s, i) => (
              <article key={i} className="training-card">
                <span className="training-card-icon">{stepIcons[i]}</span>
                <div className="training-card-num">Step {i + 1}</div>
                <h4>{s.title.replace(/^Step \d+\.\s*/, '')}</h4>
                <p>{s.objective}</p>
                {s.dueDate ? <p className="card-due">{s.dueDate}</p> : null}
              </article>
            ))}
          </div>
          <button className="step-btn start-btn pulse" onClick={() => setStarted(true)}>
            Let's Go →
          </button>
        </section>
      </div>
    );
  }

  return (
    <div>
      <section className="training-hero training-hero--framework training-hero--compact">
        <p className="badge">Page 2 of 3</p>
        <h2>Innovation Framework Lab</h2>
      </section>
      <StepWizard steps={frameworkSteps} />
    </div>
  );
}
