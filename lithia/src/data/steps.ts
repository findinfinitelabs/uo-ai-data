import type { CourseStep } from '../types';

export const steps: CourseStep[] = [
  {
    id: 'business-case',
    title: '1. Write the Business Case',
    objective:
      'Define the problem, why it matters, and why your product should exist now.',
    prompt:
      `You are my startup strategy coach. Help me write a concise one-page business case for this product idea.

Product name: [PRODUCT NAME]
Target customer: [CUSTOMER TYPE]
Core problem: [PROBLEM]
Proposed solution: [SOLUTION]

Please produce:
1) Problem statement
2) Current alternatives and gaps
3) Why now (market timing)
4) Expected outcomes and impact
5) Risks and assumptions
6) Recommendation: go / no-go with rationale`,
    example:
      `Problem statement:
Mid-size auto dealerships lose revenue due to slow follow-up on inbound leads.

Current alternatives and gaps:
They rely on manual CRM updates and phone calls, causing delays and inconsistent contact quality.

Why now:
AI-assisted sales workflows and lower cloud costs make intelligent lead handling practical for smaller teams.

Expected outcomes:
- 20% faster first response time
- 10% higher appointment booking rate
- Better manager visibility into pipeline activity

Risks and assumptions:
- Sales reps adopt the tool consistently
- CRM integration quality is high
- Data privacy controls are implemented correctly

Recommendation:
Go. The business upside and operational efficiencies justify a pilot with one dealership group.`
  },
  {
    id: 'digital-product',
    title: '2. Describe the Digital Product',
    objective: 'Describe what your team is building and how users interact with it.',
    prompt:
      `Act as a product manager. Write a product description for this digital product.

Product: [PRODUCT NAME]
Primary users: [USERS]
Main job-to-be-done: [JTBD]
Top 3 features: [FEATURES]

Output format:
- Product summary (5-7 sentences)
- User journey (from first login to value delivered)
- Feature list with business value per feature
- Non-goals (what this product does not do in phase 1)`,
    example:
      `Product summary:
LeadPilot is a web app that helps dealership sales teams prioritize and respond to inbound leads.
It scores leads, recommends next-best actions, and tracks follow-up quality.
The product integrates with existing CRM systems and highlights where reps are falling behind.
Managers get real-time dashboards for coaching and performance.

User journey:
A rep logs in, sees prioritized leads, opens a lead card, gets an AI-generated outreach suggestion, sends follow-up, and records outcome.

Feature list + value:
- AI lead scoring: focuses effort on high-value prospects
- Guided outreach templates: improves speed and consistency
- Manager dashboard: drives accountability and coaching

Non-goals:
- No outbound campaign automation in phase 1
- No finance-office workflow support yet`
  },
  {
    id: 'pitch',
    title: '3. Create a 30-Second Pitch',
    objective: 'Craft a short verbal pitch that clearly communicates value.',
    prompt:
      `You are a venture pitch coach. Write a 30-second spoken pitch.

Inputs:
- Product: [PRODUCT NAME]
- Customer: [CUSTOMER]
- Problem: [PROBLEM]
- Benefit: [BIGGEST BENEFIT]
- Differentiator: [WHY UNIQUE]

Constraints:
- 75 to 95 words
- Plain language
- End with a clear call to action`,
    example:
      `"LeadPilot helps dealership sales teams turn more internet leads into booked appointments.
Today, reps waste time chasing low-quality leads and miss high-intent buyers.
Our platform scores each lead, recommends the next best action, and gives managers visibility into follow-up quality.
Teams respond faster, book more test drives, and coach reps with data instead of guesswork.
If you're running multi-store sales operations, let's pilot LeadPilot for 30 days and measure lift together."`
  },
  {
    id: 'org-chart',
    title: '4. Develop the Org Chart',
    objective: 'Define roles and reporting structure needed to build and run the product.',
    prompt:
      `Act as a startup operations advisor. Build a phase-1 org chart for this product.

Product stage: [EARLY / GROWTH]
Team size target: [NUMBER]
Functions needed: Product, Engineering, Design, GTM, Operations

Return:
1) Org chart by function
2) Role titles and reporting lines
3) Which roles are full-time vs part-time/contract
4) Hiring sequence over first 12 months`,
    example:
      `Org chart:
- Product Lead (reports to founder)
- Tech Lead
- 2 Full-Stack Engineers
- UX Designer (part-time first 6 months)
- Customer Success Manager
- Sales/GTM Lead

Hiring sequence:
Q1: Product Lead, Tech Lead, Engineer #1
Q2: Engineer #2, UX Designer (contract)
Q3: GTM Lead
Q4: Customer Success Manager`
  },
  {
    id: 'value-capabilities',
    title: '5. Value Statements and Business Capabilities',
    objective: 'Define customer value statements and key business capabilities required.',
    prompt:
      `You are a business architect. Create value statements and capability map.

Inputs:
- Product: [PRODUCT]
- Customer segments: [SEGMENTS]
- Outcomes promised: [OUTCOMES]

Output:
- 3 to 5 value statements (customer-facing)
- Capability list grouped by: Must-have, Should-have, Later
- For each capability: owner function + KPI`,
    example:
      `Value statements:
1) "We help sales teams respond to hot leads first."
2) "We reduce lead leakage with guided daily workflows."
3) "We give managers visibility to coach with confidence."

Must-have capabilities:
- Lead scoring (Owner: Engineering, KPI: precision on high-intent leads)
- Task orchestration (Owner: Product, KPI: completion rate)
- CRM sync (Owner: Engineering, KPI: sync success rate)

Should-have:
- Rep performance insights (Owner: Ops, KPI: improvement in response SLA)

Later:
- Predictive staffing recommendations (Owner: Data, KPI: forecast accuracy)`
  },
  {
    id: 'define-value',
    title: '6. Understand and Define Value',
    objective: 'Translate product impact into measurable customer and business value.',
    prompt:
      `Act as a value strategist. Define value in measurable terms.

Inputs:
- Baseline metrics today: [CURRENT METRICS]
- Target metrics after adoption: [TARGET METRICS]
- Cost to customer: [PRICE / EFFORT]

Return:
1) Value equation (benefit - cost)
2) Leading and lagging indicators
3) 90-day success criteria
4) Executive summary for decision makers`,
    example:
      `Value equation:
Value = (Higher appointment conversion + Lower labor waste + Better sales forecasting) - (software fee + onboarding effort)

Leading indicators:
- First-response time
- Daily follow-up completion rate
- Lead-to-appointment ratio

Lagging indicators:
- Monthly gross profit per store
- Cost per booked appointment

90-day success criteria:
- 15% faster response time
- 8% increase in appointment bookings
- 90% daily usage by sales reps`
  },
  {
    id: 'marketing-plan',
    title: '7. Document the Marketing Plan',
    objective: 'Create a practical go-to-market and messaging plan.',
    prompt:
      `Act as a B2B marketing lead. Draft a first-phase marketing plan.

Inputs:
- ICP: [IDEAL CUSTOMER PROFILE]
- Core pain: [PAIN]
- Channels: [CHANNELS]
- Budget range: [BUDGET]

Output:
- Positioning statement
- Channel strategy (3 channels max)
- Campaign ideas by funnel stage
- Content plan for first 8 weeks
- KPIs and reporting cadence`,
    example:
      `Positioning:
LeadPilot helps dealership sales teams improve lead follow-up speed and conversion with AI-guided workflows.

Channels:
1) LinkedIn outbound to sales directors
2) Dealer conference demos
3) Partner referrals from CRM consultants

Campaign plan:
- TOFU: "Lead leakage calculator" content
- MOFU: case study webinar
- BOFU: 30-day pilot offer

KPIs:
- MQLs/week
- Demo-to-pilot conversion
- Pilot-to-paid conversion`
  },
  {
    id: 'job-descriptions',
    title: '8. Develop Job Descriptions',
    objective: 'Define role expectations, skills, and outcomes for hiring.',
    prompt:
      `Act as an HR and talent advisor. Write job descriptions for these roles.

Roles: [LIST ROLES]
Company stage: [STAGE]
Work model: [REMOTE/HYBRID/ONSITE]

For each role include:
- Mission of role
- Top responsibilities
- Required skills
- Preferred skills
- 90-day success outcomes`,
    example:
      `Role: Product Lead
Mission:
Turn customer pain points into a focused, measurable product roadmap.

Responsibilities:
- Own roadmap and release priorities
- Run customer discovery interviews
- Define product KPIs with leadership

Required skills:
- 4+ years B2B SaaS product management
- Strong analytics and experimentation skills

90-day outcomes:
- Deliver v1 roadmap
- Launch first pilot cohort
- Establish baseline KPI dashboard`
  },
  {
    id: 'money-effort',
    title: '9. Estimate Money and Effort',
    objective: 'Estimate budget, staffing effort, and timeline for launching the product.',
    prompt:
      `Act as a startup CFO + delivery manager. Estimate the money and effort to launch v1.

Inputs:
- Team roles and salaries: [ROLES + COSTS]
- Tooling/infrastructure costs: [COSTS]
- Timeline target: [MONTHS]

Output:
1) Cost model (one-time + monthly)
2) Effort model (person-months by function)
3) Delivery phases and timeline
4) Break-even scenarios (best/base/worst)
5) Recommendation for pilot budget approval`,
    example:
      `Cost model:
- One-time: $45K (design, setup, integration)
- Monthly burn: $78K (team + cloud + tools)

Effort model:
- Engineering: 10 person-months
- Product/Design: 4 person-months
- GTM: 3 person-months

Timeline:
- Discovery: 4 weeks
- Build v1: 10 weeks
- Pilot rollout: 6 weeks

Break-even (base case):
- 18 paying customers at $5K/month within 12 months

Recommendation:
Approve a 6-month pilot budget with stage-gates at months 2 and 4.`
  }
];
