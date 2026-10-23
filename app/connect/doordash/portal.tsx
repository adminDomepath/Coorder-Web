"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { sitePath } from "../../site-path";
import DoorDashOperations from "./operations";

const endpoint = "https://us-west1-domepath-coorder.cloudfunctions.net/doorDashPortal";
const sessionKey = "coorder.doordash.portal.session";
const days = [
  ["MON", "Monday"], ["TUE", "Tuesday"], ["WED", "Wednesday"],
  ["THU", "Thursday"], ["FRI", "Friday"], ["SAT", "Saturday"], ["SUN", "Sunday"],
];
type Hour = { day_index: string; start_time: string; end_time: string };
type ReviewItem = { id: string; name: string; reason: string };
type MenuStatus = {
  status: string; exclusionCode: string | null; details: string | null;
  menus: { menu_uuid: string; menu_preview_link?: string; menu_error?: string }[];
};
type PortalStatus = {
  merchant: { id: string; name: string; environment: string };
  providerReady: boolean; authorized: boolean;
  onboarding: MenuStatus | null; onboardingPending: boolean;
  preparation: { configured: boolean; openHours: Hour[]; excludedItemIds: string[];
    sourceItemCount: number; reviewItems: ReviewItem[] };
};
type Store = { name: string; address: string; doordash_store_uuid: string;
  business_name: string; is_active_on_integration: boolean; is_eligible_to_onboard: boolean };
type Menu = { menus: { menu: { name: string; categories: {
  merchant_supplied_id: string; name: string; items: {
    merchant_supplied_id: string; name: string; price: number; active: boolean;
    extras: { merchant_supplied_id: string; name: string; options: { name: string; price: number }[] }[];
  }[] }[] } }[] };
const statusLabels: Record<string, string> = {
  INTEGRATION_REQUESTED: "Connection requested", STORE_CONNECTED: "Location connected",
  MENU_REQUESTED: "DoorDash is importing your menu", MENU_IMPORTED: "Menu imported",
  MENU_AUDIT: "DoorDash is reviewing your menu", MENU_BLOCK: "Your menu needs attention",
  MENU_QUALIFIED: "Your menu is ready to review", ACTIVATION_BLOCK: "Activation needs attention",
  INTEGRATION_ACTIVATED: "Integration activated", ABANDONED: "Connection was not completed",
};

class PortalError extends Error {
  constructor(message: string, readonly code: string) { super(message); }
}

export default function DoorDashPortal() {
  const [token, setToken] = useState("");
  const tokenRef = useRef("");
  const initialized = useRef(false);
  const [status, setStatus] = useState<PortalStatus | null>(null);
  const [code, setCode] = useState("");
  const [hours, setHours] = useState<Hour[]>([]);
  const [excluded, setExcluded] = useState<string[]>([]);
  const [stores, setStores] = useState<Store[] | null>(null);
  const [selected, setSelected] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [preview, setPreview] = useState<Menu | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const clearSession = useCallback(() => {
    sessionStorage.removeItem(sessionKey);
    tokenRef.current = ""; setToken(""); setStatus(null); setPreview(null); setStores(null);
    setCode(""); setHours([]); setExcluded([]); setSelected(""); setConfirmed(false); setReviewed(false);
  }, []);

  const api = useCallback(async <T,>(action: string, body: Record<string, unknown> = {}): Promise<T> => {
    const response = await fetch(endpoint, {
      method: "POST", headers: { "Content-Type": "application/json",
        ...(tokenRef.current ? { Authorization: `Bearer ${tokenRef.current}` } : {}) },
      body: JSON.stringify({ action, ...body }), cache: "no-store", credentials: "omit",
      signal: AbortSignal.timeout(120000),
    });
    const data = await response.json() as Record<string, unknown>;
    if (!response.ok) {
      if (data.code === "portal_session_expired") clearSession();
      if (data.code === "doordash_authorization_expired") {
        setStatus((value) => value ? { ...value, authorized: false } : value);
      }
      throw new PortalError(typeof data.error === "string" ? data.error : "The operation could not be completed.", typeof data.code === "string" ? data.code : "portal_error");
    }
    return data as T;
  }, [clearSession]);

  const loadStatus = useCallback(async () => {
    const value = await api<PortalStatus>("status");
    setStatus(value); setHours(value.preparation.openHours); setExcluded(value.preparation.excludedItemIds);
    return value;
  }, [api]);

  const run = useCallback(async (name: string, work: () => Promise<void>) => {
    setBusy(name); setError(""); setNotice("");
    try { await work(); } catch (failure) {
      setError(failure instanceof Error ? failure.message : "The operation could not be completed.");
    } finally { setBusy(""); }
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const params = new URLSearchParams(window.location.search);
    const exchangeCode = params.get("code"), state = params.get("state");
    // Remove authorization codes before any further navigation or requests.
    if (window.location.search) window.history.replaceState(null, "", window.location.pathname);
    const stored = sessionStorage.getItem(sessionKey);
    if (!stored) {
      if (exchangeCode || state) setError("Your session has expired. Open the portal with a new code from Coorder.");
      return;
    }
    tokenRef.current = stored; setToken(stored);
    void run("load", async () => {
      if (params.get("error")) throw new Error("Authorization was canceled. You can connect to DoorDash again.");
      if (exchangeCode && state) await api("exchange", { code: exchangeCode, state });
      const value = await loadStatus();
      if (value.authorized && !value.onboarding && !value.onboardingPending) {
        setStores((await api<{ stores: Store[] }>("stores")).stores);
      }
    });
  }, [api, loadStatus, run]);

  const claim = (event: FormEvent) => {
    event.preventDefault();
    void run("claim", async () => {
      const result = await api<{ sessionToken: string }>("claim", { code });
      tokenRef.current = result.sessionToken;
      sessionStorage.setItem(sessionKey, result.sessionToken);
      setToken(result.sessionToken); setCode(""); await loadStatus();
    });
  };

  const refresh = () => void run("refresh", async () => {
    const result = await api<{ onboarding: MenuStatus }>("refresh");
    setStatus((value) => value ? { ...value, onboarding: result.onboarding, onboardingPending: false } : value);
    setReviewed(false);
  });
  const hasOnboarding = Boolean(status?.onboarding || status?.onboardingPending);
  const currentStep = !token ? 0 : !hasOnboarding ? (status?.authorized ? 2 : 1) : 3;
  const allItems = preview?.menus.flatMap((menu) => menu.menu.categories.flatMap((category) => category.items)) ?? [];

  return (
    <main className="dd-portal" lang="en">
      <header className="dd-header">
        <a className="brand" href={sitePath("/")} aria-label="Coorder home">
          <span className="brand-mark"><img src={sitePath("/assets/coorder-logo.png")} alt="" /></span>
          <span><strong>Coorder</strong><small>by DomePath</small></span>
        </a>
        <a href={sitePath("/connect/doordash/help/")}>Connection help ↗</a>
      </header>
      <div className="dd-intro">
        <span className="dd-badge">DoorDash · Sandbox</span>
        <h1>Your restaurant,<br /><span>connected to DoorDash.</span></h1>
        <p>Review your Clover menu, choose your location, and follow your connection progress in one place.</p>
      </div>
      <ol className="dd-steps" aria-label="Connection steps">
        {["Access Coorder", "Prepare menu", "Choose location", "Review and activate"].map((label, i) => (
          <li key={label} className={currentStep === i ? "current" : currentStep > i ? "complete" : ""}
            aria-current={currentStep === i ? "step" : undefined}>
            <span>{currentStep > i ? "✓" : i + 1}</span>{label}
          </li>
        ))}
      </ol>
      <div className="dd-layout">
        <section className="dd-workspace" aria-busy={Boolean(busy)}>
          {error && <div className="dd-alert error" role="alert">{error}</div>}
          {notice && <div className="dd-alert" role="status">{notice}</div>}
          {!token ? (
            <div className="dd-card">
              <span className="dd-eyebrow">01 / Access Coorder</span>
              <h2>Start with your account.</h2>
              <p>In the Coorder app, open <strong>Settings → DoorDash</strong> and select <strong>Generate access code</strong>.</p>
              <form onSubmit={claim}>
                <label htmlFor="portal-code">Temporary Coorder code</label>
                <input id="portal-code" value={code} onChange={(e) => setCode(e.target.value)}
                  placeholder="XXXX-XXXX-XXXX-XXXX" autoComplete="off" spellCheck={false}
                  autoCapitalize="characters" maxLength={32} required />
                <p className="dd-caption">Single use. Expires in 10 minutes. Keep your code private.</p>
                <button className="dd-primary" disabled={Boolean(busy) || !code.trim()}>
                  {busy ? "Opening your restaurant…" : "Continue with my restaurant →"}
                </button>
              </form>
            </div>
          ) : !status ? (
            <div className="dd-card"><h2>Opening your restaurant…</h2>
              <button disabled={Boolean(busy)} onClick={() => void run("load", async () => { await loadStatus(); })}>Reload</button>
              <button className="dd-text-button" disabled={Boolean(busy)} onClick={() => void run("logout", async () => { try { await api("logout"); } finally { clearSession(); } })}>Sign out</button>
            </div>
          ) : (
            <>
              <div className="dd-restaurant">
                <div><span className="dd-eyebrow">Your restaurant in Coorder</span><h2>{status.merchant.name}</h2>
                  <p>{status.merchant.environment === "sandbox" ? "Test environment" : "Production environment"}</p></div>
                <button className="dd-text-button" disabled={Boolean(busy)} onClick={() => void run("logout", async () => { try { await api("logout"); } finally { clearSession(); } })}>Sign out</button>
              </div>
              <div className="dd-card">
                <span className="dd-eyebrow">02 / Prepare menu</span>
                <h2>Your menu. Your hours.</h2>
                <p>We will use your Clover items, prices, and modifiers. The hours and exclusions you choose here apply only to DoorDash.</p>
                <form onSubmit={(e) => { e.preventDefault(); void run("configure", async () => {
                  await api("configure_menu", { openHours: hours, excludedItemIds: excluded });
                  await loadStatus(); setPreview(await api<Menu>("preview"));
                  setNotice("Your menu is prepared. Review the items before continuing.");
                }); }}>
                  <fieldset disabled={Boolean(busy) || status.onboarding?.status === "INTEGRATION_ACTIVATED"}>
                    <legend>DoorDash menu hours</legend>
                    <div className="dd-hours">
                      {days.map(([day, label]) => <div className="dd-day" key={day}>
                        <strong>{label}</strong><div className="dd-intervals">
                          {hours.map((hour, index) => hour.day_index !== day ? null : <div className="dd-interval" key={index}>
                            <input type="time" aria-label={`${label}, opening time`} value={hour.start_time} required
                              onChange={(e) => setHours(hours.map((h, i) => i === index ? { ...h, start_time: e.target.value } : h))} />
                            <span>–</span>
                            <input type="time" aria-label={`${label}, closing time`} value={hour.end_time} required
                              onChange={(e) => setHours(hours.map((h, i) => i === index ? { ...h, end_time: e.target.value } : h))} />
                            <button type="button" className="dd-remove" aria-label={`Remove hours for ${label}`} onClick={() => setHours(hours.filter((_, i) => i !== index))}>×</button>
                          </div>)}
                          {!hours.some((h) => h.day_index === day) && <span className="dd-caption">Closed</span>}
                        </div>
                        <button type="button" className="dd-add" aria-label={`Add hours for ${label}`}
                          disabled={hours.length >= 21} onClick={() => setHours([...hours, { day_index: day, start_time: "", end_time: "" }])}>+</button>
                      </div>)}
                    </div>
                    {hours.length === 1 && <button type="button" className="dd-text-button" onClick={() => setHours(days.map(([day]) => ({ ...hours[0], day_index: day })))}>Use these hours every day</button>}
                    {status.preparation.reviewItems.length > 0 && <div className="dd-exclusions">
                      <h3>Items to review</h3>
                      <p className="dd-caption">Items with variable prices or those requiring special classification must be excluded from this test menu.</p>
                      {status.preparation.reviewItems.map((item) => <label className="dd-check" key={item.id}>
                        <input type="checkbox" checked={excluded.includes(item.id)} onChange={(e) => setExcluded(e.target.checked ? [...excluded, item.id] : excluded.filter((id) => id !== item.id))} />
                        <span>Exclude <strong>{item.name}</strong><small>{item.reason === "variable_price" ? "Variable price" : item.reason === "age_restricted" ? "Requires age classification" : "Non-revenue item"}</small></span>
                      </label>)}
                    </div>}
                    <button className="dd-primary" disabled={!hours.length}>{busy === "configure" ? "Preparing menu…" : "Save and review menu"}</button>
                  </fieldset>
                </form>
                {status.preparation.configured && <button className="dd-text-button" disabled={Boolean(busy)} onClick={() => void run("preview", async () => { setPreview(await api<Menu>("preview")); })}>View current DoorDash menu</button>}
                {hasOnboarding && <p className="dd-caption">After correcting the menu, request another import. Once the integration is activated, its hours are locked in this test portal.</p>}
              </div>
              {status.preparation.configured && <DoorDashOperations request={api} />}
              {preview && <div className="dd-card dd-menu-preview">
                <span className="dd-eyebrow">Coorder preview</span><h2>{allItems.length} items for DoorDash</h2>
                <p>This is the menu data DoorDash will receive. The final preview will be available after the import.</p>
                {preview.menus.flatMap((menu) => menu.menu.categories).map((category) => <details key={category.merchant_supplied_id}>
                  <summary>{category.name} <span>{category.items.length}</span></summary>
                  {category.items.map((item) => <div className="dd-menu-item" key={item.merchant_supplied_id}>
                    <div><strong>{item.name}</strong>{!item.active && <small>Unavailable</small>}
                      {item.extras.map((extra) => <small key={extra.merchant_supplied_id}>{extra.name}: {extra.options.map((option) => `${option.name} (+${(option.price / 100).toFixed(2)})`).join(", ")}</small>)}
                    </div><span>{(item.price / 100).toFixed(2)}</span>
                  </div>)}
                </details>)}
              </div>}
              {!status.providerReady ? <div className="dd-card dd-pending">
                <span className="dd-eyebrow">Next step</span><h2>DoorDash authorization is being set up.</h2>
                <p>You can save and review your menu. Connecting your DoorDash account will be available once Sandbox setup is complete.</p>
                <a href="mailto:leonardo.arias@domepath.com?subject=Coorder%20DoorDash%20connection">Ask DomePath for an update ↗</a>
              </div> : !hasOnboarding ? <div className="dd-card">
                <span className="dd-eyebrow">03 / Choose location</span>
                <h2>Authorize your DoorDash account.</h2>
                <p>Sign in with an account authorized to manage the restaurant. You enter your password only on DoorDash.</p>
                <button className="dd-primary dd-doordash" disabled={Boolean(busy) || !status.preparation.configured} onClick={() => void run("authorize", async () => {
                  const result = await api<{ authorizationURL: string }>("authorize");
                  window.location.assign(result.authorizationURL);
                })}>{status.authorized ? "Reauthorize DoorDash" : "Connect with DoorDash →"}</button>
                {status.authorized && <>
                  <button className="dd-text-button" disabled={Boolean(busy)} onClick={() => void run("stores", async () => { setStores((await api<{ stores: Store[] }>("stores")).stores); })}>Load DoorDash locations</button>
                  {stores && stores.length === 0 && <p>No locations are available for this account. If you already have a restaurant on DoorDash, sign in again with an authorized account. <a href="https://help.doordash.com/merchants/" target="_blank" rel="noopener noreferrer">DoorDash help ↗</a></p>}
                  {stores && stores.length > 0 && <fieldset className="dd-stores" disabled={Boolean(busy)}>
                    <legend>Connect {status.merchant.name} to:</legend>
                    {stores.map((store) => <label className={`dd-store ${selected === store.doordash_store_uuid ? "selected" : ""}`} key={store.doordash_store_uuid}>
                      <input type="radio" name="doordash-store" value={store.doordash_store_uuid} checked={selected === store.doordash_store_uuid}
                        disabled={!store.is_eligible_to_onboard || store.is_active_on_integration}
                        onChange={() => { setSelected(store.doordash_store_uuid); setConfirmed(false); }} />
                      <span><strong>{store.name}</strong><small>{store.address}</small>
                        {(!store.is_eligible_to_onboard || store.is_active_on_integration) && <small>{store.is_active_on_integration ? "Already active on this integration" : "Not available to connect"}</small>}
                      </span>
                    </label>)}
                    {selected && <label className="dd-check"><input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} /><span>I confirm that this location belongs to <strong>{status.merchant.name}</strong>.</span></label>}
                    <button className="dd-primary" disabled={!selected || !confirmed} onClick={() => void run("start", async () => { await api("start", { storeId: selected }); await loadStatus(); setNotice("Connection requested. DoorDash will start importing your menu."); })}>Connect location and import menu</button>
                  </fieldset>}
                </>}
              </div> : <div className="dd-card">
                <span className="dd-eyebrow">04 / Review and activate</span>
                <h2>{status.onboarding ? statusLabels[status.onboarding.status] ?? status.onboarding.status : "Connection in progress"}</h2>
                {status.onboarding?.details && <p>{status.onboarding.details}</p>}
                {status.onboarding?.exclusionCode && <p className="dd-caption">DoorDash reference: {status.onboarding.exclusionCode}</p>}
                {status.onboarding?.menus.map((menu) => <div className="dd-menu-status" key={menu.menu_uuid}>
                  {menu.menu_preview_link && <a href={menu.menu_preview_link} target="_blank" rel="noopener noreferrer">Review menu on DoorDash ↗</a>}
                  {menu.menu_error && <p className="dd-alert error">{menu.menu_error}</p>}
                </div>)}
                <button disabled={Boolean(busy)} onClick={refresh}>Refresh status</button>
                {["MENU_BLOCK", "MENU_QUALIFIED", "MENU_REQUESTED"].includes(status.onboarding?.status ?? "") && <button className="dd-text-button" disabled={Boolean(busy)} onClick={() => void run("retry", async () => { await api("retry_menu"); setNotice("DoorDash received the request to import the menu again."); })}>Retry menu import</button>}
                {status.onboarding?.status === "MENU_QUALIFIED" && <div className="dd-activation">
                  <label className="dd-check"><input type="checkbox" checked={reviewed} onChange={(e) => setReviewed(e.target.checked)} /><span>I have reviewed the DoorDash menus and confirm that the prices, items, and hours are correct.</span></label>
                  <p className="dd-caption">Activating replaces the previous menus for this location and switches its order connection to Coorder. This action takes place in Sandbox.</p>
                  <button className="dd-primary" disabled={Boolean(busy) || !reviewed || !status.onboarding.menus.some((m) => m.menu_preview_link)} onClick={() => void run("activate", async () => { await api("activate", { menuReviewed: reviewed }); setNotice("Activation requested. Refresh the status to confirm the result."); setReviewed(false); })}>Activate test integration</button>
                </div>}
                {status.onboarding?.status === "INTEGRATION_ACTIVATED" && <p>The integration is active in Sandbox. You can pause the restaurant and manage its availability in DoorDash Merchant Portal.</p>}
              </div>}
            </>
          )}
        </section>
        <aside className="dd-sidebar">
          <div className="dd-note"><span aria-hidden="true">↔</span><h3>Your Clover menu stays intact.</h3><p>We read your items to prepare the DoorDash menu. Prices and hours saved in Clover stay unchanged.</p></div>
          <div className="dd-note"><span aria-hidden="true">◇</span><h3>Start in Sandbox.</h3><p>This flow runs in Sandbox. Prepare item routing before receiving orders. Order ready signals and availability updates require DoorDash Marketplace credentials.</p></div>
          <a href={sitePath("/connect/doordash/help/")}>How the connection works →</a>
        </aside>
      </div>
      <footer className="dd-footer"><span>Coorder by DomePath</span><nav aria-label="Legal information"><a href={sitePath("/legal/privacy/")}>Privacy</a><a href={sitePath("/legal/eula/")}>Terms of use</a><a href="mailto:leonardo.arias@domepath.com">Contact</a></nav></footer>
    </main>
  );
}
