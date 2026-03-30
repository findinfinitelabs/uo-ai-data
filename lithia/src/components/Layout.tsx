import { Link, Outlet } from 'react-router-dom';
import { steps } from '../data/steps';

export default function Layout() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <div>
          <p className="eyebrow">Lithia Product Studio</p>
          <h1>Business Foundations Prompt Guide</h1>
          <p className="subtitle">
            Step-by-step prompts and examples for each team to define and pitch its product.
          </p>
        </div>
        <Link className="home-link" to="/">
          Overview
        </Link>
      </header>

      <div className="content-grid">
        <aside className="step-nav">
          <p className="nav-title">Course Steps</p>
          <ul>
            {steps.map((step) => (
              <li key={step.id}>
                <Link to={`/module/${step.id}`}>{step.title}</Link>
              </li>
            ))}
          </ul>
        </aside>

        <main className="main-panel">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
