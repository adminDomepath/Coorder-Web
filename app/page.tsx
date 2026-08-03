import type { Metadata } from "next";
import SiteHeader from "./SiteHeader";
import { sitePath } from "./site-path";

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
    title: "Build complete tickets",
    text: "Add menu items, quantities, modifiers, notes, order type, and customer context without losing the details the kitchen needs.",
  },
  {
    color: "green",
    eyebrow: "Visual",
    symbol: "▦",
    title: "Move work through Kanban",
    text: "Take each order from new to preparing, ready, and delivered while every station sees the same current status.",
  },
  {
    color: "orange",
    eyebrow: "Focused",
    symbol: "◎",
    title: "Run a focused live display",
    text: "Give the kitchen or service team a clean view of active tickets, elapsed time, item progress, and the next handoff.",
  },
  {
    color: "purple",
    eyebrow: "Flexible",
    symbol: "⌁",
    title: "Match your actual operation",
    text: "Configure work areas, order types, colors, statuses, and board organization around your floor and kitchen.",
  },
  {
    color: "teal",
    eyebrow: "Structured",
    symbol: "◇",
    title: "Maintain a structured menu",
    text: "Keep categories, items, modifiers, inventory context, work areas, and order types organized in one system.",
  },
  {
    color: "red",
    eyebrow: "Optional",
    symbol: "↻",
    title: "Receive Clover orders automatically",
    text: "Optionally connect a merchant account so eligible Clover orders enter the same Coorder workflow without manual re-entry.",
  },
];

const workflow = [
  {
    number: "01",
    title: "Configure the menu and stations",
    text: "Set up items, modifiers, order types, work areas, statuses, colors, and the inventory context your team uses.",
  },
  {
    number: "02",
    title: "Capture and route each order",
    text: "Build the ticket once, preserve its notes and modifiers, and make the work visible to the correct preparation area.",
  },
  {
    number: "03",
    title: "Track preparation to handoff",
    text: "Move tickets through Kanban, monitor elapsed time on Display, and keep service aligned through completion.",
  },
];

function Brand() {
  return (
    <a className="brand" href="#top" aria-label="Coorder home">
      <span className="brand-mark">
        <img src={sitePath("/assets/coorder-logo.png")} alt="" />
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
      <img className="hero-wordmark-logo" src={sitePath("/assets/coorder-logo.png")} alt="" aria-hidden="true" />
      <span className="hero-wordmark-text" aria-hidden="true">
        <span className="wordmark-blue">CO</span>
        <span className="wordmark-purple">O</span>
        <span className="wordmark-teal">R</span>
        <span className="wordmark-green">D</span>
        <span className="wordmark-orange">E</span>
        <span className="wordmark-red">R</span>
      </span>
    </div>
  );
}

function ProductPreview() {
  return (
    <div className="product-preview" aria-label="Real Coorder Kanban running as an iPad app">
      <img
        className="real-ipad-capture"
        src={sitePath("/assets/coorder-kanban-ipad.png")}
        alt="Coorder Kanban on iPad showing a live restaurant order, the Coorder logo, current time, and date"
      />
    </div>
  );
}

export default function Home() {
  return (
    <main id="top">
      <SiteHeader />

      <section className="hero page-shell">
        <HeroWordmark />
        <ProductPreview />
        <div className="hero-copy">
          <h1>One clear flow,<br /><em>from order entry</em><br />to final handoff.</h1>
          <p>Build orders from your menu, route each ticket to the right work area, follow preparation on Kanban, and give the team a focused live display. Coorder keeps items, modifiers, notes, timers, inventory context, and status updates together from entry to handoff.</p>
          <div className="availability"><span>Designed for iPad and compatible Apple devices</span><i /></div>
          <ColorRibbon />
        </div>
      </section>

      <section className="statement-section">
        <div
          className="pattern-strip"
          style={{ backgroundImage: `url(${sitePath("/assets/coorder-pattern.png")})` }}
          aria-hidden="true"
        />
        <div className="statement page-shell">
          <h2>From order entry to handoff, every station sees the same live work.</h2>
          <p>Tickets retain their items, modifiers, notes, order type, preparation state, and elapsed time while they move through the restaurant.</p>
        </div>
      </section>

      <section className="features-section page-shell" id="features">
        <div className="section-heading">
          <h2>The tools behind each active shift.</h2>
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
            <h2>A working path for every ticket.</h2>
            <p>Coorder turns menu structure and restaurant settings into a live operational flow: tickets carry the right details into preparation, remain visible while work advances, and finish with a clear status for service.</p>
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
            <h2>Coorder works on its own.<br />Clover can make intake automatic.</h2>
            <p>Coorder handles the restaurant workflow independently. When a Clover merchant is connected, eligible point-of-sale orders can enter that same workflow automatically while Clover remains the source for payments.</p>
            <ul>
              <li><span>✓</span> Full Coorder workflow without Clover</li>
              <li><span>✓</span> Optional automatic order synchronization</li>
              <li><span>✓</span> Secure, merchant-controlled connection</li>
            </ul>
          </div>
          <div className="connection-visual" aria-label="Clover connected to Coorder">
            <div className="connection-node clover-node"><img className="clover-logo" src={sitePath("/assets/clover-logo.png")} alt="Clover logo" /><span>Clover</span><small>Point of sale</small></div>
            <div className="connection-line"><i /><i /><i /></div>
            <div className="connection-node coorder-node"><img src={sitePath("/assets/coorder-logo.png")} alt="" /><span>Coorder</span><small>Order workflow</small></div>
          </div>
        </div>
      </section>

      <section className="final-cta page-shell">
        <img className="cta-logo" src={sitePath("/assets/coorder-logo.png")} alt="" aria-hidden="true" />
        <div>
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
            <a href={sitePath("/legal/privacy/")}>Privacy</a>
            <a href={sitePath("/legal/eula/")}>EULA</a>
          </div>
          <small>© 2026 DomePath. Clover and Apple are trademarks of their respective owners.</small>
        </div>
      </footer>
    </main>
  );
}
