import { useState } from 'react';
import { steps } from '../data/steps';
import StepWizard from '../components/StepWizard';

export default function Home() {
  const [started, setStarted] = useState(false);

  if (!started) {
    return (
      <div>
        <section className="hero-panel">
          <p className="badge">Page 3 of 3</p>
          <h2>Business Foundations Prompt Guide</h2>
          <p>
            After training and framework mapping, each team will use the prompts below to build a
            complete business package for its product idea. Work through each step in order.
          </p>
        </section>

        <section className="overview-list">
          <h3>What you will do</h3>
          {steps.map((step) => (
            <article key={step.id} className="step-row">
              <div>
                <h4>{step.title}</h4>
                <p>{step.objective}</p>
              </div>
            </article>
          ))}
          <button className="step-btn start-btn" onClick={() => setStarted(true)}>
            Begin Steps
          </button>
        </section>
      </div>
    );
  }

  return (
    <div>
      <section className="hero-panel">
        <p className="badge">Page 3 of 3</p>
        <h2>Business Foundations Prompt Guide</h2>
      </section>
      <StepWizard steps={steps} />
    </div>
  );
}
