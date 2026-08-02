import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coorder — A clearer workflow for every order",
  description:
    "Connect Clover with Coorder on Apple devices and give your restaurant team a visual workspace for every order.",
};

const features = [
  {
    color: "blue",
    eyebrow: "Connected",
    symbol: "↻",
    title: "Clover orders, automatically in Coorder",
    text: "Order items, quantities, modifiers, notes, and order types arrive in the workspace your team already uses.",
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
    eyebrow: "Mapped",
    symbol: "◇",
    title: "Connect menu items to inventory",
    text: "Match Clover items with Coorder inventory so every synchronized order lands in the right operational context.",
  },
  {
    color: "red",
    eyebrow: "Recoverable",
    symbol: "✓",
    title: "Know when attention is needed",
    text: "Connection checks and recovery tools help your team identify unresolved items or retry failed order syncs.",
  },
];

const workflow = [
  {
    number: "01",
    title: "Authorize Coorder in Clover",
    text: "Install Coorder from the Clover App Market and authorize the restaurant merchant account.",
  },
  {
    number: "02",
    title: "Connect the Apple app",
    text: "Enter the Merchant ID and one-time connection code in Coorder on your iPad or compatible Apple device.",
  },
  {
    number: "03",
    title: "Let orders find their place",
    text: "New Clover orders are organized in Coorder, ready for your team to prepare, track, and complete.",
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

function ProductPreview() {
  return (
    <div className="product-preview" aria-label="Coorder Kanban as shown on iPad">
      <div className="ipad-frame">
        <div className="ipad-camera" />
        <div className="ipad-screen">
          <div className="ipad-tabbar" aria-hidden="true">
            <span>New</span>
            <span>Orders</span>
            <span>Display</span>
            <span className="active">Kanban</span>
            <span>Inventory</span>
            <span>Settings</span>
          </div>
          <div className="real-kanban">
            <div className="kanban-ambient" aria-hidden="true">
              <img src="/assets/coorder-logo.png" alt="" />
              <div><strong>10:38</strong><span>August 2</span></div>
            </div>
            <div className="kanban-order-row">
              <article className="ipad-order-card blue-order">
                <header><strong>#1042 · Dine In</strong><span>2:18</span></header>
                <div className="ipad-item"><b>2</b><span>Chicken Tacos<small>No onions</small></span><i>Preparing</i></div>
                <div className="ipad-item"><b>1</b><span>Citrus Soda</span><i>Preparing</i></div>
              </article>
              <article className="ipad-order-card orange-order">
                <header><strong>#1040 · Online</strong><span>8:04</span></header>
                <div className="ipad-item"><b>1</b><span>House Burger<small>Truffle fries</small></span><i>Cooking</i></div>
                <div className="ipad-item cooked"><b>1</b><span>Garden Salad</span><i>Cooked</i></div>
              </article>
              <article className="ipad-order-card green-order">
                <header><strong>#1039 · Pickup</strong><span>12:31</span></header>
                <div className="ipad-item cooked"><b>2</b><span>Margherita Pizza</span><i>Cooked</i></div>
                <button type="button" tabIndex={-1}>Complete</button>
              </article>
            </div>
          </div>
        </div>
      </div>
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
          <div className="hero-kicker"><span className="kicker-dot" /> Built for restaurant rhythm</div>
          <h1>Every order,<br /><em>exactly where</em><br />your team needs it.</h1>
          <p>Coorder connects Clover with a clear, visual workspace on Apple devices—so your restaurant can organize, prepare, and track every order without losing the flow.</p>
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
          <h2>Your Clover orders become a workspace the whole team can understand.</h2>
          <p>From the first item to the final handoff, Coorder keeps the operational details visible and organized.</p>
        </div>
      </section>

      <section className="features-section page-shell" id="features">
        <div className="section-heading">
          <div>
            <span className="section-label">Made for the work between order and handoff</span>
            <h2>Clarity in every part of the shift.</h2>
          </div>
          <p>Coorder complements Clover with the visual tools restaurant teams need after an order is placed.</p>
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
            <span className="section-label">A simple connection</span>
            <h2>From Clover to Coorder in three clear steps.</h2>
            <p>Your credentials and Clover tokens stay in the secure backend. The Apple app only needs the Merchant ID and one-time connection code to complete setup.</p>
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
            <span className="section-label">Clover connected</span>
            <h2>Clover handles the order.<br />Coorder helps your team move it.</h2>
            <p>Keep Clover as the source of your restaurant’s orders and payments while Coorder gives preparation teams a focused operational view.</p>
            <ul>
              <li><span>✓</span> Secure OAuth authorization</li>
              <li><span>✓</span> Automatic order synchronization</li>
              <li><span>✓</span> Merchant-controlled connection</li>
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
          <p>Review how Coorder handles merchant information and the terms that govern use of the Clover-connected service.</p>
        </div>
        <div className="legal-grid">
          <a className="legal-card privacy-card" href="/legal/privacy/">
            <span className="legal-icon">◉</span>
            <div>
              <small>Privacy Policy</small>
              <h3>Understand how Coorder protects your data.</h3>
              <p>See what information is processed when Coorder connects with Clover, how it is used, and the controls available to merchants.</p>
            </div>
            <span className="legal-arrow">↗</span>
          </a>
          <a className="legal-card eula-card" href="/legal/eula/">
            <span className="legal-icon">✓</span>
            <div>
              <small>End User License Agreement</small>
              <h3>Review the terms for using Coorder.</h3>
              <p>Read the license, service responsibilities, acceptable-use terms, and conditions for the Coorder Clover integration.</p>
            </div>
            <span className="legal-arrow">↗</span>
          </a>
        </div>
      </section>

      <section className="final-cta page-shell">
        <div className="cta-colors" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
        <div>
          <span className="section-label">Ready when your team is</span>
          <h2>Give every order a clearer path.</h2>
          <p>Connect Clover with Coorder and bring your restaurant workflow to Apple devices.</p>
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
