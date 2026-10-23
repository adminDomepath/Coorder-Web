"use client";

import { useEffect, useState } from "react";
import { sitePath } from "./site-path";

export default function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const updateHeader = () => setIsScrolled(window.scrollY > 96);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  return (
    <header className={`site-header page-shell${isScrolled ? " is-scrolled" : ""}`}>
      <a className="brand header-brand" href="#top" aria-label="Coorder home">
        <span className="brand-mark">
          <img src={sitePath("/assets/coorder-logo.png")} alt="" />
        </span>
        <span>
          <strong>Coorder</strong>
          <small>by DomePath</small>
        </span>
      </a>
      <nav aria-label="Main navigation">
        <a href="#features">Features</a>
        <a href="#workflow">How it works</a>
        <a href="#clover">Clover</a>
        <a href={sitePath("/connect/doordash/")}>DoorDash</a>
      </nav>
    </header>
  );
}
