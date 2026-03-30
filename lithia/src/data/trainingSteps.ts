import type { WizardStep } from '../components/StepWizard';

export const trainingSteps: WizardStep[] = [
  {
    title: 'Step 1. Review the Lithia Investors Report',
    dueDate: 'Due April 10',
    objective:
      'Read the Lithia investor report provided by the instructor. Identify the company vision, strategic pillars, growth drivers, and key financial goals.',
    prompt:
      'Act as a business analyst reviewing an investor report for a student team.\n\nUsing the Lithia Motors investor report, identify and summarize:\n1) Company vision and mission\n2) Strategic growth pillars (e.g. acquisitions, digital retailing, fleet management)\n3) Key financial metrics and growth targets\n4) Technology investments mentioned\n5) Risks and challenges acknowledged by leadership\n\nFormat as a one-page executive brief a team could reference throughout the course.',
    example:
      'Company vision:\nBecome the leading diversified automotive retailer by combining local market relationships with national scale and digital innovation.\n\nStrategic pillars:\n- Acquisitions and market consolidation\n- Driveway digital retailing platform\n- Fleet management services via GreenCars\n- After-sale service and parts growth\n\nKey metrics:\n- Revenue target: $30B+\n- 300+ locations across North America\n- Digital retailing as % of total transactions growing YoY\n\nRisks:\n- Interest rate sensitivity on floor-plan financing\n- Integration complexity with rapid acquisitions\n- EV transition timing uncertainty',
  },
  {
    title: 'Step 2. Conduct Market Research',
    dueDate: 'Due April 10',
    objective:
      'Use AI to research the automotive retail market, competitive landscape, and technology trends that relate to opportunities inside the investor report.',
    prompt:
      'Act as a market research analyst for a student team evaluating product opportunities at a large automotive retailer.\n\nResearch and provide:\n1) Current trends in automotive retail technology\n2) Top 3 competitor strategies (e.g. AutoNation, Penske, Carvana)\n3) Customer pain points in the car-buying and service experience\n4) Emerging AI/ML use cases in dealership operations\n5) Market size estimates for the top opportunity area\n\nCite specific data points where possible. Format as a research brief.',
    example:
      'Trends:\n- Shift to omni-channel (online browse → in-store close)\n- AI-powered lead scoring and follow-up automation\n- Service lane scheduling and predictive maintenance\n\nCompetitor snapshot:\n- AutoNation: investing in AutoNation Express online sales\n- Carvana: fully digital purchase, reconditioning at scale\n- Penske: focusing on premium brands and service retention\n\nCustomer pain points:\n- Lengthy F&I process\n- Poor follow-up after initial inquiry\n- Lack of price transparency\n\nAI use cases:\n- Chatbot-assisted lead qualification\n- Predictive inventory stocking\n- Dynamic pricing for used vehicles',
  },
  {
    title: 'Step 3. Review with Lithia Leaders',
    dueDate: 'Due April 17',
    objective:
      'Prepare questions and a discussion framework to align your team ideas with what Lithia leadership wants to accomplish. Understand their priorities before entering the idea phase.',
    prompt:
      'Act as a facilitator preparing a student team for a leadership review session.\n\nBased on the investor report findings and market research, create:\n1) A one-paragraph summary of the team read on Lithia strategic direction\n2) 5 targeted questions for Lithia leadership to clarify priorities\n3) A simple scoring rubric the team can use to evaluate which product ideas align best with leadership goals\n4) A list of "must-know" constraints (budget, timeline, tech stack, compliance)\n\nTone: respectful, concise, ready for a 15-minute leadership conversation.',
    example:
      'Team summary:\nLithia is focused on scaling through acquisition while modernizing the customer experience via digital retailing. The biggest internal opportunities appear to be in lead management, service retention, and operational efficiency across newly acquired stores.\n\nQuestions for leadership:\n1. Which business unit has the most urgent unmet technology need?\n2. Are there existing pilots or tools we should build on rather than replace?\n3. What does a successful 90-day proof-of-concept look like to you?\n4. Are there compliance or data restrictions we need to design around from day one?\n5. How do you prioritize speed-to-value vs. long-term platform investment?\n\nScoring rubric:\n- Strategic alignment (1-5)\n- Feasibility in 90 days (1-5)\n- Leadership enthusiasm (1-5)\n- Data availability (1-5)',
  },
  {
    title: 'Step 4. Create a Sample Business Case from the Plan',
    dueDate: 'Due April 17',
    objective:
      'Use insights from the investor plan to draft a concise business case for the selected team product.',
    prompt:
      'Using the mapped framework, write a sample business case for [TEAM PRODUCT].\n\nInclude:\n1) Executive summary\n2) Problem and opportunity\n3) Solution concept\n4) Value drivers\n5) Cost and effort estimate (high-level)\n6) Risks, controls, and compliance notes\n7) Recommendation for pilot',
    example:
      'Executive summary:\nThis product addresses lead leakage by providing AI-guided follow-up execution.\n\nValue drivers:\n- Faster response times\n- Higher conversion to appointments\n- Better manager coaching data\n\nRecommendation:\nApprove a controlled 90-day pilot with stage-gate review every 30 days.',
  },
  {
    title: 'Step 5. Build the Team Discussion Pack',
    dueDate: 'Due May 1',
    objective:
      'Prepare a short package each team can present and refine before moving to the foundations page.',
    prompt:
      'Create a team discussion pack with:\n- One-page business case draft\n- 30-second pitch\n- Top 5 assumptions and validation plan\n- 90-day pilot roadmap\n- Open questions for instructor review\n\nTone: concise, business-facing, presentation-ready.',
    example:
      'Open questions for instructor:\n- Which KPI should be considered the primary north-star for pilot approval?\n- What legal/compliance checks are mandatory before customer data integration?\n- Which capabilities should move from phase 2 into phase 1?',
  },
  {
    title: 'Step 6. Align Your Product Understanding',
    dueDate: 'Due May 1',
    objective:
      'Now that you understand the company, market, and leadership priorities, define what business problem your product will solve and what success looks like.',
    prompt:
      'Act as a business strategy coach for a student team.\n\nContext:\n- Product idea: [PRODUCT]\n- Customer segment: [CUSTOMER]\n- Business pain: [PAIN]\n- Desired business result: [RESULT]\n\nCreate:\n1) A plain-language problem statement\n2) A measurable business goal\n3) 3 success metrics\n4) Key assumptions to test in the first 30 days',
    example:
      'Problem statement:\nDealership managers cannot consistently see where internet leads stall, causing lost sales.\n\nBusiness goal:\nImprove lead-to-appointment conversion by improving follow-up quality and speed.\n\nSuccess metrics:\n- First response time\n- Appointment booking rate\n- Lead drop-off rate by stage\n\nAssumptions:\n- Teams will use daily task recommendations\n- CRM sync can be completed in phase 1\n- Managers will review dashboards weekly',
  },
  {
    title: 'Step 7. Apply Innovation Framework Sections',
    dueDate: 'Due May 1',
    objective:
      'Map the product to the innovation framework areas taught by the instructor.',
    prompt:
      'Use the AI Innovation Framework categories and map this product into each section:\n- Business domains\n- Business processes\n- Program management\n- Change management\n- Continuous improvement\n- Compliance and legal\n- Data management and intelligence\n\nFor each section, provide:\n1) Why it matters to this product\n2) One practical requirement\n3) One risk if ignored',
    example:
      'Business domains:\n- Why it matters: determines where product creates value first\n- Requirement: prioritize dealership sales operations as initial domain\n- Risk: vague scope and poor adoption\n\nCompliance and legal:\n- Why it matters: customer and employee data is sensitive\n- Requirement: define data access and retention rules\n- Risk: legal exposure and loss of trust',
  },
  {
    title: 'Step 8. Create Core Team Artifacts',
    dueDate: 'Due May 1',
    objective:
      'Produce the initial artifacts highlighted in class using AI as assistant.',
    prompt:
      'Act as a startup advisor. Generate these artifacts for [PRODUCT]:\n1) Business case (concise, executive style)\n2) Tagline (max 12 words)\n3) 30-second pitch\n4) List of jobs needed to build and launch v1\n\nAudience: investors and C-suite leaders.\nTone: professional and specific.\n\nAlso include one paragraph explaining the strategic value of each artifact.',
    example:
      'Tagline:\n"Turn every lead into a guided revenue opportunity."\n\n30-second pitch:\nLeadPilot helps dealership sales teams focus on the right leads and act quickly with AI-guided next steps. It improves response speed, manager visibility, and booking conversion. Teams spend less time guessing and more time selling. Start with one-store pilot, measure lift, then scale confidently.\n\nJobs list:\n- Product lead\n- Full-stack engineer\n- Data engineer\n- UX designer\n- Customer success manager',
  },
  {
    title: 'Step 9. Industry Fit and Prioritization',
    dueDate: 'Due May 1',
    objective:
      'Determine which industries and use cases have the strongest impact potential.',
    prompt:
      'Act as a marketing executive analyzing market fit.\n\nAnalyze [PRODUCT] and produce a ranked table with:\n- Industry\n- Primary use case\n- Estimated impact (High/Medium/Low)\n- Revenue potential\n- Adoption difficulty\n- Why this ranking is reasonable',
    example:
      'Top-ranked industries:\n1) Auto retail: immediate workflow pain + measurable sales outcomes\n2) Equipment dealerships: similar lead management process\n3) Home services franchises: high lead volume and inconsistent follow-up',
  },
];
