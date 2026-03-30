import { Link, useParams } from 'react-router-dom';
import PromptCard from '../components/PromptCard';
import { steps } from '../data/steps';

export default function ModulePage() {
  const { id } = useParams<{ id: string }>();
  const idx = steps.findIndex((step) => step.id === id);

  if (idx === -1) {
    return (
      <section className="hero-panel">
        <h2>Step not found</h2>
        <p>Select a step from the left navigation.</p>
        <Link className="step-btn" to="/foundations">
          Back to Overview
        </Link>
      </section>
    );
  }

  const step = steps[idx];
  const prev = idx > 0 ? steps[idx - 1] : null;
  const next = idx < steps.length - 1 ? steps[idx + 1] : null;

  return (
    <div className="module-page">
      <section className="hero-panel">
        <p className="badge">Step {idx + 1} of {steps.length}</p>
        <h2>{step.title}</h2>
        <p>{step.objective}</p>
      </section>

      <PromptCard label="Prompt to Use" content={step.prompt} tone="prompt" />
      <PromptCard label="Example Output" content={step.example} tone="example" />

      <div className="pager">
        {prev ? (
          <Link className="step-btn" to={`/foundations/module/${prev.id}`}>
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}

        {next ? (
          <Link className="step-btn" to={`/foundations/module/${next.id}`}>
            {next.title} →
          </Link>
        ) : (
          <Link className="step-btn" to="/foundations">
            Finish → Overview
          </Link>
        )}
      </div>
    </div>
  );
}
