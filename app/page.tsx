import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coorder — A clearer workflow for every order",
  description:
    "Organize, prepare, and track restaurant orders in a visual workspace for Apple devices—with an optional Clover integration.",
};

const features = [
  {
    color: "blue",
    eyebrow: "Organized",
    symbol: "+",
    title: "Every order in one workspace",
    text: "Create and organize orders with items, quantities, modifiers, notes, order types, and the details your team needs.",
  },
  {
    color: "green",
    eyebrow: "Visual",
    symbol: "▦",
    title: "A workflow everyone can read",
    text: "Move work from new to preparing to delivered with a clear Kanban board built for restaurant pace.",
  },
  {
    color: "orange",
    eyebrow: "Focused",
    symbol: "◎",
    title: "A dedicated order display",
    text: "Give the kitchen or service team a focused view of active orders, preparation time, and item progress.",
  },
  {
    color: "purple",
    eyebrow: "Flexible",
    symbol: "⌁",
    title: "Your restaurant, your structure",
    text: "Customize work areas, order types, colors, statuses, and board organization around the way your team operates.",
  },
  {
    color: "teal",
    eyebrow: "Structured",
    symbol: "◇",
    title: "Connect orders to your inventory",
    text: "Structure categories, menu items, modifiers, work areas, and order types around your restaurant’s operation.",
  },
  {
    color: "red",
    eyebrow: "Optional",
    symbol: "↻",
    title: "Add Clover when it fits your operation",
    text: "Coorder works independently. Restaurants using Clover can also connect their merchant account for automatic order synchronization.",
  },
];

const workflow = [
  {
    number: "01",
    title: "Shape your restaurant workspace",
    text: "Configure order types, menu items, work areas, colors, inventory, and the workflow that matches your team.",
  },
  {
    number: "02",
    title: "Create and move every order",
    text: "Add orders in Coorder, follow preparation in Kanban, and give service or kitchen teams a focused display.",
  },
  {
    number: "03",
    title: "Connect Clover if you choose",
    text: "Clover merchants can enable optional automatic order sync. Everyone else can continue using the complete Coorder workflow on its own.",
  },
];

function Brand() {
  return (
    <a className="brand" href="#top" aria-label="Coorder home">
      <span className="brand-mark">
        <img src="/assets/coorder-logo.png" alt="" />
      </span>
      <span>
        <strong>Coorder</strong>
        <small>by DomePath</small>
      </span>
    </a>
  );
}

function ColorRibbon() {
  return (
    <div className="color-ribbon" aria-label="Coorder color palette">
      <span className="blue" />
      <span className="green" />
      <span className="orange" />
      <span className="purple" />
      <span className="teal" />
      <span className="red" />
    </div>
  );
}

function HeroWordmark() {
  return (
    <div className="hero-wordmark" aria-label="Coorder">
      <span className="wordmark-blue" aria-hidden="true">C</span>
      <span className="wordmark-green" aria-hidden="true">OO</span>
      <span className="wordmark-orange" aria-hidden="true">R</span>
      <span className="wordmark-purple" aria-hidden="true">D</span>
      <span className="wordmark-teal" aria-hidden="true">E</span>
      <span className="wordmark-red" aria-hidden="true">R</span>
    </div>
  );
}

function ProductPreview() {
  return (
    <div className="product-preview" aria-label="Real Coorder Kanban running as an iPad app">
      <img
        className="real-ipad-capture"
        src="/assets/coorder-kanban-ipad.png"
        alt="Coorder Kanban on iPad showing a live restaurant order, the Coorder logo, current time, and date"
      />
    </div>
  );
}

export default function Home() {
  return (
    <main id="top">
      <header className="site-header page-shell">
        <Brand />
        <nav aria-label="Main navigation">
          <a href="#features">Features</a>
          <a href="#workflow">How it works</a>
          <a href="#clover">Clover</a>
          <a href="#legal">Legal</a>
        </nav>
      </header>

      <section className="hero page-shell">
        <div className="hero-copy">
          <HeroWordmark />
          <div className="hero-kicker"><span className="kicker-dot" /> Built for restaurant rhythm</div>
          <h1>Every order,<br /><em>exactly where</em><br />your team needs it.</h1>
          <p>Coorder gives restaurant teams a clear, visual workspace on Apple devices to organize, prepare, and track every order—whether it is entered directly or synchronized through an optional integration.</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#workflow">See how it works <span>↓</span></a>
          </div>
          <div className="availability"><span>Designed for iPad and compatible Apple devices</span><i /></div>
          <ColorRibbon />
        </div>
        <ProductPreview />
      </section>

      <section className="statement-section">
        <div className="pattern-strip" aria-hidden="true" />
        <div className="statement page-shell">
          <span className="section-label">One shared picture</span>
          <h2>Every order becomes a workspace the whole team can understand.</h2>
          <p>From the first item to the final handoff, Coorder keeps the operational details visible and organized.</p>
        </div>
      </section>

      <section className="features-section page-shell" id="features">
        <div className="section-heading">
          <div>
            <span className="section-label">Made for the work between order and handoff</span>
            <h2>Clarity in every part of the shift.</h2>
          </div>
          <p>Coorder brings orders, preparation, inventory context, and team handoffs into one visual operating system for the shift.</p>
        </div>
        <div className="feature-grid">
          {features.map((feature) => (
            <article className={`feature-card ${feature.color}`} key={feature.title}>
              <div className="feature-topline"><span className="feature-icon">{feature.symbol}</span><small>{feature.eyebrow}</small></div>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="workflow-section" id="workflow">
        <div className="page-shell workflow-layout">
          <div className="workflow-intro">
            <span className="section-label">A simple workflow</span>
            <h2>From a new order to a clear handoff.</h2>
            <p>Start with Coorder on your Apple devices and adapt the workspace to the way your restaurant already operates. Clover can be added later when automatic synchronization is useful.</p>
          </div>
          <div className="workflow-steps">
            {workflow.map((step, index) => (
              <article className="workflow-step" key={step.number}>
                <span className={`step-number step-${index + 1}`}>{step.number}</span>
                <div><h3>{step.title}</h3><p>{step.text}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="clover-section page-shell" id="clover">
        <div className="clover-card">
          <div className="clover-copy">
            <span className="section-label">Optional Clover integration</span>
            <h2>Coorder works on its own.<br />Clover can make intake automatic.</h2>
            <p>Use the complete Coorder workflow independently, or connect a Clover merchant account so eligible orders arrive automatically while Clover remains the source for point-of-sale and payments.</p>
            <ul>
              <li><span>✓</span> Full Coorder workflow without Clover</li>
              <li><span>✓</span> Optional automatic order synchronization</li>
              <li><span>✓</span> Secure, merchant-controlled connection</li>
            </ul>
          </div>
          <div className="connection-visual" aria-label="Clover connected to Coorder">
            <div className="connection-node clover-node"><span>clover</span><small>Point of sale</small></div>
            <div className="connection-line"><i /><i /><i /></div>
            <div className="connection-node coorder-node"><img src="/assets/coorder-logo.png" alt="" /><span>Coorder</span><small>Order workflow</small></div>
          </div>
        </div>
      </section>

      <section className="legal-section page-shell" id="legal">
        <div className="legal-heading">
          <span className="section-label">Legal &amp; privacy</span>
          <h2>Clear terms. Transparent data practices.</h2>
          <p>Review how Coorder handles account, restaurant, order, and optional integration information, along with the terms governing the service.</p>
        </div>
        <div className="legal-grid">
          <a className="legal-card privacy-card" href="/legal/privacy/">
            <span className="legal-icon">◉</span>
            <div>
              <small>Privacy Policy</small>
              <h3>Understand how Coorder protects your data.</h3>
              <p>See what Coorder processes to provide the app, how optional integrations are handled, and the controls available to merchants.</p>
            </div>
            <span className="legal-arrow">↗</span>
          </a>
          <a className="legal-card eula-card" href="/legal/eula/">
            <span className="legal-icon">✓</span>
            <div>
              <small>End User License Agreement</small>
              <h3>Review the terms for using Coorder.</h3>
              <p>Read the license, service responsibilities, acceptable-use terms, and conditions for Coorder and its optional integrations.</p>
            </div>
            <span className="legal-arrow">↗</span>
          </a>
        </div>
      </section>

      <section className="final-cta page-shell">
        <img className="cta-logo" src="/assets/coorder-logo.png" alt="" aria-hidden="true" />
        <div>
          <span className="section-label">Ready when your team is</span>
          <h2>Give every order a clearer path.</h2>
          <p>Bring your restaurant workflow to Apple devices with Coorder—and connect Clover only when it adds value to your operation.</p>
        </div>
        <a className="button button-dark" href="mailto:leonardo.arias@domepath.com">Contact us <span>↗</span></a>
      </section>

      <footer className="site-footer">
        <div className="page-shell footer-inner">
          <Brand />
          <p>Visual order management for modern restaurant teams.</p>
          <div className="footer-links">
            <a href="mailto:leonardo.arias@domepath.com">Contact</a>
            <a href="/legal/privacy/">Privacy</a>
            <a href="/legal/eula/">EULA</a>
          </div>
          <small>© 2026 DomePath. Clover and Apple are trademarks of their respective owners.</small>
        </div>
      </footer>
    </main>
  );
}
