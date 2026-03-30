export default function Home() {
  return (
    <div>
      <section className="training-hero">
        <h2>Design — Build Your Digital AI Product</h2>
        <p className="training-hero-sub">
          In this final phase you will move from plans to product. Work through the three stages below,
          starting with in-class design sessions and finishing with complete business documentation.
        </p>
      </section>

      <section className="overview-list">

        <div className="design-phase">
          <div className="design-phase-num">01</div>
          <div className="design-phase-body">
            <h3>Design Together in Class</h3>
            <p>
              Your instructor will lead structured design sessions where each team defines the user
              experience, maps key screens, and establishes the core workflow of their digital AI product.
              These sessions happen live and collaboratively — bring your business case and be ready to sketch.
            </p>
            <ul>
              <li>User journey mapping</li>
              <li>Screen-by-screen flow design</li>
              <li>AI feature scoping and data inputs</li>
              <li>Team alignment on what to build first</li>
            </ul>
          </div>
        </div>

        <div className="design-phase">
          <div className="design-phase-num">02</div>
          <div className="design-phase-body">
            <h3>Build the App with Lovable or Base44</h3>
            <p>
              Use an AI-native app builder to bring your product to life. Your team will use
              <strong> Lovable</strong> or <strong>Base44</strong> to generate a working prototype
              from your design specs — no prior coding experience required.
            </p>
            <ul>
              <li>Translate your flow design into prompts</li>
              <li>Generate screens and connect data logic</li>
              <li>Iterate quickly with AI-assisted edits</li>
              <li>Publish and share a live working demo</li>
            </ul>
            <div className="design-phase-tools">
              <a className="tool-link" href="https://lovable.dev" target="_blank" rel="noopener noreferrer">↗ Lovable</a>
              <a className="tool-link" href="https://base44.com" target="_blank" rel="noopener noreferrer">↗ Base44</a>
            </div>
          </div>
        </div>

        <div className="design-phase">
          <div className="design-phase-num">03</div>
          <div className="design-phase-body">
            <h3>Create the Business Documentation</h3>
            <p>
              With a working product in hand, use AI to produce the full business package your team
              needs to present. This documentation proves you understand both the product and the business
              case behind it.
            </p>
            <ul>
              <li>One-page business case</li>
              <li>Digital product description</li>
              <li>30-second pitch</li>
              <li>Org chart and hiring plan</li>
              <li>Value statements and capability map</li>
              <li>Pilot roadmap and go-to-market summary</li>
            </ul>
          </div>
        </div>

      </section>
    </div>
  );
}
