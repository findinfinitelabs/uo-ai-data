import { useState } from 'react';

type BoxDef = { title: string; prompt: string; example: string };

const boxes: BoxDef[] = [
  {
    title: 'Bias Detection',
    prompt:
      `You are an AI ethics reviewer. Analyze this dataset or model output for potential bias.

Product or model: [PRODUCT / MODEL NAME]
Dataset description: [What data was used to train or evaluate the model]
Target population: [Who the model makes decisions about]
Output type: [Prediction / Recommendation / Score / Classification]

Identify:
1. Which demographic groups may be underrepresented in the training data
2. Any features that could act as proxies for protected attributes (e.g., zip code for race)
3. Whether the error rate or accuracy differs significantly across groups
4. The type of bias present: historical, measurement, aggregation, or deployment bias
5. Two concrete steps to reduce the most significant bias found`,
    example:
      `Dataset: Lithia vehicle financing approval data (2018–2023)
Target population: Dealership customers applying for auto loans

Findings:
1. Underrepresented groups: Applicants from rural zip codes and non-English-speaking customers represent under 8% of training samples despite being 22% of the customer base.
2. Proxy features: Zip code correlates with race at r=0.61. "Employment type: gig" correlates with income instability in ways that may disproportionately affect younger and minority applicants.
3. Error rate disparity: False denial rate is 14% for Hispanic applicants vs. 6% for non-Hispanic White applicants — a 2.3x gap.
4. Bias type: Historical bias (past lending decisions encoded into training data) and measurement bias (gig economy income measured inconsistently).

Recommended steps:
- Re-weight training samples to match the actual applicant population distribution
- Remove zip code as a direct feature; replace with income-level index not tied to geography`,
  },
  {
    title: 'Ethical Frameworks',
    prompt:
      `You are an applied ethics advisor. Evaluate this AI feature using established ethical frameworks.

Feature: [DESCRIBE THE AI FEATURE — what it does, what data it uses, what decisions it influences]
Stakeholders: [Who is affected: customers, employees, third parties]
Deployment context: [Where and how this feature is used]

Apply each of these four frameworks:
1. Utilitarianism — Does this feature produce the greatest good for the greatest number? Who benefits and who bears the cost?
2. Deontology — Does this feature respect individual rights and duties regardless of outcomes? Are any rights violated?
3. Fairness / Justice — Are benefits and burdens distributed equitably across groups?
4. Virtue Ethics — Would a person of good character be proud to deploy this feature?

For each framework, give a one-paragraph assessment and a risk rating: Low / Medium / High.`,
    example:
      `Feature: AI-generated trade-in value estimate shown to customers before negotiation
Stakeholders: Customers, sales staff, Lithia business
Deployment: Customer-facing web portal before dealership visit

1. Utilitarianism — Medium risk
The feature benefits most customers by providing a baseline, reducing information asymmetry. However, if estimates are consistently low, the system may subtly favor Lithia's margin over customer value at scale.

2. Deontology — Low risk
No rights are violated as long as the estimate is clearly labeled as non-binding and the customer retains full negotiation rights. Risk increases if customers believe the AI estimate is a firm offer.

3. Fairness / Justice — Medium risk
If the model was trained on historical trade-in data that undervalued vehicles in certain regions or from certain demographics, some customers will receive systematically lower estimates. Requires audit by zip code and vehicle type.

4. Virtue Ethics — Low risk
A fair-minded person would support giving customers information they currently lack. The feature is defensible as long as the model is transparent about its methodology and limitations are disclosed.`,
  },
  {
    title: 'Documenting Decisions',
    prompt:
      `You are a responsible AI documentation specialist. Create a decision log for this AI feature.

Feature name: [NAME]
Date of decision: [DATE]
Decision makers: [ROLES]
Feature description: [What it does]
Alternatives considered: [Other approaches evaluated]
Final decision: [What was chosen]
Rationale: [Why this approach was selected]
Risks acknowledged: [Known risks at time of decision]
Mitigation plan: [How risks are being addressed]
Review schedule: [When this decision will be re-evaluated]

Format this as a structured AI Decision Record (ADR) suitable for inclusion in a model card or compliance audit.`,
    example:
      `AI Decision Record — LeadPilot Lead Scoring Model v1.2

Feature name: Inbound Lead Priority Score
Date: March 14, 2026
Decision makers: Product Lead, ML Engineer, Compliance Officer

Description:
Assigns a 1–100 priority score to each inbound web lead based on browsing behavior, vehicle interest, and time-on-site signals. Score determines queue order for sales rep follow-up.

Alternatives considered:
- Rule-based scoring (FIFO with manual override) — rejected: too slow, no personalization
- Third-party credit score signals — rejected: regulatory risk under ECOA, FCRA
- Random assignment — rejected: no business value

Final decision: Gradient-boosted model trained on 18 months of internal lead-to-close data.

Rationale: Highest precision on high-intent leads (0.81 AUC). No use of protected-class proxies. Fully explainable via SHAP values per lead.

Risks acknowledged:
- Model may perpetuate past rep behavior biases
- Score could be gamed if exposed to customers

Mitigation:
- Monthly drift monitoring with demographic parity check
- Score kept internal; never shown to customers

Review schedule: Quarterly re-evaluation. Full retrain every 6 months or when AUC drops below 0.74.`,
  },
  {
    title: 'Human-in-the-Loop',
    prompt:
      `You are an AI safety architect. Design a human-in-the-loop (HITL) process for this AI system.

System: [NAME AND PURPOSE OF THE AI SYSTEM]
Decision type: [What decisions or actions the AI takes or recommends]
Consequence level: [Low / Medium / High — what happens if the AI is wrong]
Current automation level: [Fully automated / Recommended only / Human-confirmed]

Design a HITL protocol that includes:
1. Decision thresholds — at what confidence level should a human review be triggered?
2. Escalation path — who reviews, in what timeframe, using what information?
3. Override mechanism — how does a human override the AI decision, and is it logged?
4. Feedback loop — how does human judgment flow back to improve the model?
5. Audit trail — what records are kept and for how long?`,
    example:
      `System: Lithia AI Financing Recommendation Engine
Decision type: Recommends loan tier and terms to sales staff during customer F&I conversation
Consequence level: High — incorrect recommendations can cause financial harm to customers and regulatory exposure for Lithia

1. Decision thresholds:
- Confidence ≥ 85%: Recommendation displayed directly to sales rep
- Confidence 65–84%: Recommendation flagged with "Review Suggested" — rep must confirm before presenting to customer
- Confidence < 65%: AI withholds recommendation; Finance Manager must manually determine terms

2. Escalation path:
- Flagged decisions reviewed by Finance Manager within the same customer session
- If Finance Manager is unavailable, rep must use standard manual rate sheet
- Response time target: under 3 minutes during business hours

3. Override mechanism:
- Rep or Finance Manager can override any recommendation via a one-click "Override & Document" button
- Override reason is required (dropdown + optional free text)
- All overrides logged to compliance database with timestamp, rep ID, and reason code

4. Feedback loop:
- Override decisions and final loan outcomes feed into monthly model retraining batch
- Human-approved overrides with positive outcomes are labeled as preferred examples
- Overrides are reviewed quarterly for patterns indicating model drift

5. Audit trail:
- All AI recommendations, confidence scores, human actions, and outcomes retained for 7 years per CFPB recordkeeping requirements
- Exportable report available for regulatory audit within 48 hours`,
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }
  return (
    <button className="design-prompt-copy" onClick={handleCopy}>
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

export default function EthicalAIPage() {
  return (
    <div>
      <section className="training-hero">
        <div className="training-hero-text">
          <h2>Ethical AI</h2>
          <p className="training-hero-sub">
            Apply ethical reasoning to your AI product. Use these prompts to detect bias,
            evaluate your design against ethical frameworks, document key decisions, and
            define where humans stay in control.
          </p>
        </div>
        <div className="hero-due-box">
          <span>May 8</span>
        </div>
      </section>

      <div className="design-page-body">
        <p className="design-phase-intro">
          Each section below addresses a core pillar of responsible AI. Start with bias detection
          to audit your data, then evaluate your feature against ethical frameworks, document your
          decisions for accountability, and define your human oversight process.
        </p>

        <div className="design-prompts-list">
          {boxes.map((box, i) => (
            <div key={box.title} className="design-prompt-block">
              <div className="design-prompt-header">
                <span className="design-prompt-num">{i + 1}</span>
                <span className="design-prompt-title">{box.title}</span>
                <CopyButton text={box.prompt} />
              </div>

              <h4 className="design-section-heading" style={{ marginTop: '0.75rem', marginBottom: '0.25rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#555' }}>Prompt</h4>
              <p className="design-prompt-text">{box.prompt}</p>

              <h4 className="design-section-heading" style={{ marginTop: '1rem', marginBottom: '0.25rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#555' }}>Example Output</h4>
              <p className="design-prompt-text" style={{ background: '#f8f8f4', borderLeft: '3px solid #007030', paddingLeft: '0.75rem' }}>{box.example}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
