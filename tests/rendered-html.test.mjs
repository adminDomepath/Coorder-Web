import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the finished Coorder landing page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Every order,/);
  assert.match(html, /Every order in one workspace/);
  assert.match(html, /hero-wordmark/);
  assert.match(html, /Coorder works on its own/);
  assert.match(html, /optional Clover integration/i);
  assert.doesNotMatch(html, /Coorder connects Clover with a clear/);
  assert.match(html, /Real Coorder Kanban running as an iPad app/);
  assert.match(html, /\/assets\/coorder-kanban-ipad\.png/);
  assert.match(html, /Contact us/);
  assert.doesNotMatch(html, /Contact Leonardo/);
  assert.match(html, /Clear terms\. Transparent data practices\./);
  assert.match(html, /End User License Agreement/);
  assert.match(html, /leonardo\.arias@domepath\.com/);
  assert.match(html, /\/legal\/privacy\//);
  assert.match(html, /\/legal\/eula\//);
  assert.match(html, /\/og\.png/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
});

test("ships the complete Coorder brand and legal surface", async () => {
  const [css, privacy, eula] = await Promise.all([
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../public/legal/privacy/index.html", import.meta.url), "utf8"),
    readFile(new URL("../public/legal/eula/index.html", import.meta.url), "utf8"),
  ]);

  for (const color of ["#71a5ec", "#a5c75a", "#f2ab46", "#a38abd", "#77b69a", "#ec785f"]) {
    assert.match(css, new RegExp(color, "i"));
  }
  assert.match(css, /--page:\s*#f2f2f6/i);
  assert.match(css, /h1, h2, h3\s*\{\s*font-weight:\s*700/i);

  for (const legalPage of [privacy, eula]) {
    assert.match(legalPage, /https:\/\/coorder\.domepath\.com/);
    assert.match(legalPage, /leonardo\.arias@domepath\.com/);
    assert.match(legalPage, /\/assets\/coorder-logo\.png/);
    assert.doesNotMatch(legalPage, /admin@domepath\.com/);
  }

  await Promise.all([
    access(new URL("../public/assets/coorder-logo.png", import.meta.url)),
    access(new URL("../public/assets/coorder-pattern.png", import.meta.url)),
    access(new URL("../public/assets/coorder-kanban-ipad.png", import.meta.url)),
    access(new URL("../public/og.png", import.meta.url)),
  ]);
});
