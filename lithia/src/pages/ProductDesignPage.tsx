import { useSearchParams } from 'react-router-dom';
import NotesEditor from '../components/NotesEditor';

type Prompt = {
  title: string;
  prompt: string;
};

type Phase = {
  id: number;
  title: string;
  intro: string;
  prompts: Prompt[];
  notesKey: string;
};

const phases: Phase[] = [
  {
    id: 0,
    title: 'Design Together in Class',
    intro:
      'In these sessions your instructor will guide each team through core product design activities. Use the prompts below with a vibe coding tool like Lovable or Base44 to map out what you will build before writing a single line of code.',
    notesKey: 'design:class',
    prompts: [
      {
        title: 'User Journey Mapping',
        prompt:
          'I am designing a digital AI product for Lithia Motors. My target user is [describe user — e.g., a used-car buyer, a service advisor, a dealership manager]. Map out a step-by-step journey this user takes from first interaction to completed goal. For each step, identify: what the user is trying to do, what frustration or friction they currently face, and how an AI feature could reduce that friction. Format the output as a numbered journey with 5–8 steps.',
      },
      {
        title: 'Screen-by-Screen Flow Design',
        prompt:
          'Based on this user journey: [paste your journey map here]. Design a screen-by-screen flow for a mobile or web app that supports this experience. For each screen, describe: the screen name, the primary action the user takes, the key information displayed, and any AI-generated content or recommendation shown. List 4–8 screens in order.',
      },
      {
        title: 'AI Feature Scoping & Data Inputs',
        prompt:
          'I am building a digital AI product for Lithia Motors with these screens: [paste your screen list here]. For each screen that includes an AI feature, identify: what the AI does (summarize, recommend, predict, generate, or classify), what data it needs as input, where that data comes from (user input, vehicle database, service history, market data, etc.), and what the output looks like to the user. Keep each feature description to 2–3 sentences.',
      },
    ],
  },
  {
    id: 1,
    title: 'Build with Lovable or Base44',
    intro:
      'Use your design artifacts from class to generate a working app prototype. Paste your screen flow and feature descriptions directly into Lovable or Base44 and let the AI build the first version. Iterate from there using the prompts below.',
    notesKey: 'design:build',
    prompts: [
      {
        title: 'Generate the Initial App',
        prompt:
          'Build a web app for Lithia Motors with the following screens: [paste your screen list]. For each screen, use this layout and functionality: [paste your screen descriptions]. Use a clean, professional design with a dark header and card-based layout. The app should feel like an internal enterprise tool used by dealership staff. Start with the home screen and navigation.',
      },
      {
        title: 'Add the AI Feature',
        prompt:
          'Add an AI-powered feature to this app: [describe the screen and feature]. The feature should take [input data] and display [output — recommendation, summary, prediction, etc.] to the user. Use a placeholder AI response for now that shows realistic example output. Make the AI result visually distinct — use a highlighted card or badge to show it is AI-generated.',
      },
      {
        title: 'Polish and Share',
        prompt:
          'Review the current app and suggest 3 specific UI improvements that would make it feel more polished and professional. Then apply those improvements. After that, add a shareable demo mode that pre-fills the app with realistic sample data so a stakeholder can click through the full workflow without needing to log in or enter data.',
      },
    ],
  },
  {
    id: 2,
    title: 'Enhance Business Documentation',
    intro:
      'With a working prototype in hand, use AI to generate the full business package your team needs to present. These documents prove you understand both the product and the business case behind it.',
    notesKey: 'design:docs',
    prompts: [
      {
        title: 'One-Page Business Case & Product Description',
        prompt:
          'Write a one-page business case for this digital AI product for Lithia Motors: [describe your product in 2–3 sentences]. Include: the problem it solves, the target user, the AI capability at the core of the product, the expected business impact (time saved, revenue opportunity, or cost reduction), and a 30-second pitch that a non-technical executive could deliver. Format it with clear headings and keep the total under 400 words.',
      },
      {
        title: 'Org Chart, Hiring Plan & Value Statements',
        prompt:
          'For this digital AI product: [describe your product]. Create: (1) an org chart showing the 5–8 roles needed to build and operate this product — include a product manager, AI/ML engineer, and business stakeholder; (2) a hiring plan with a one-sentence description and estimated salary range for each role; (3) three value statements — one for the end user, one for dealership management, and one for Lithia Motors corporate. Keep each value statement to one sentence.',
      },
      {
        title: 'Pilot Roadmap & Go-to-Market Summary',
        prompt:
          'Create a 90-day pilot roadmap for launching this AI product at two Lithia Motors dealerships: [product name and description]. Include: Week 1–2 setup activities, Week 3–6 pilot rollout milestones, Week 7–10 feedback and iteration, Week 11–12 evaluation and go/no-go decision. Then write a one-paragraph go-to-market summary describing how you would scale from 2 pilot locations to national rollout, including training, change management, and success metrics.',
      },
    ],
  },
];

function PromptBlock({ prompt, index }: { prompt: Prompt; index: number }) {
  function handleCopy() {
    navigator.clipboard.writeText(prompt.prompt);
  }

  return (
    <div className="design-prompt-block">
      <div className="design-prompt-header">
        <span className="design-prompt-num">{index + 1}</span>
        <span className="design-prompt-title">{prompt.title}</span>
        <button className="design-prompt-copy" onClick={handleCopy}>Copy</button>
      </div>
      <p className="design-prompt-text">{prompt.prompt}</p>
    </div>
  );
}

export default function ProductDesignPage() {
  const [searchParams] = useSearchParams();
  const phaseParam = searchParams.get('phase');
  const phaseIndex = phaseParam !== null ? parseInt(phaseParam, 10) : 0;
  const phase = phases[phaseIndex] ?? phases[0];

  return (
    <div>
      <section className="training-hero">
        <div className="training-hero-text">
          <h2>Product Design</h2>
          <p className="training-hero-sub">{phase.title}</p>
        </div>
        <div className="hero-due-box">
          <span>Phase {phase.id + 1} of 3</span>
        </div>
      </section>

      <div className="design-page-body">
        <p className="design-phase-intro">{phase.intro}</p>

        <h3 className="design-section-heading">Prompts</h3>
        <div className="design-prompts-list">
          {phase.prompts.map((p, i) => (
            <PromptBlock key={p.title} prompt={p} index={i} />
          ))}
        </div>

        <h3 className="design-section-heading">Notes</h3>
        <NotesEditor defaultFileName={phase.notesKey} title={phase.title} />
      </div>
    </div>
  );
}
