import { Link } from 'react-router-dom';
import { steps } from '../data/steps';

export default function Home() {
  return (
    <div>
      <section className="hero-panel">
        <p className="badge">Team Workflow</p>
        <h2>Build your product case from idea to execution plan</h2>
        <p>
          Each team will use the prompts below to produce business-ready deliverables for its own
          product concept. Start at Step 1 and work in order.
        </p>
      </section>

      <section className="steps-list">
        {steps.map((step) => (
          <article key={step.id} className="step-row">
            <div>
              <h3>{step.title}</h3>
              <p>{step.objective}</p>
            </div>
            <Link className="step-btn" to={`/module/${step.id}`}>
              Open Step
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}
