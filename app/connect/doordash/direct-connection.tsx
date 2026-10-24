"use client";

import { useState } from "react";

type DirectStatus = {
  registered: boolean; locationId: string; providerType: string;
  isActive?: boolean | null; isPOS?: boolean; storeURL?: string | null;
  lastImport?: { status: string; menuId: string | null; receivedAt: number } | null;
  menus: { id: string; name: string; isActive: boolean; isPOS: boolean;
    previewURL: string | null; latestStatus: string | null;
    lastSuccessfulUpdate: string | null }[];
};
type Props = {
  locationId: string; providerType: string;
  request: <T>(action: string, body?: Record<string, unknown>) => Promise<T>;
};

export default function DirectConnection({ locationId, providerType, request }: Props) {
  const [status, setStatus] = useState<DirectStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function refresh() {
    setBusy(true); setError("");
    try { setStatus(await request<DirectStatus>("direct_status")); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "Could not read DoorDash status."); }
    finally { setBusy(false); }
  }

  return <section className="dd-card" aria-busy={busy}>
    <span className="dd-eyebrow">Your own restaurants · Direct merchant</span>
    <h2>Manage your DoorDash Sandbox location.</h2>
    <p>This installation connects restaurants in your own business. Sandbox store setup and activation are managed through DoorDash Developer Portal.</p>
    <dl><dt>Location ID</dt><dd><code>{locationId}</code></dd>
      <dt>Provider</dt><dd><code>{providerType}</code></dd></dl>
    <p>Use these identifiers to find the matching Sandbox store in DoorDash.</p>
    {error && <p className="dd-alert error" role="alert">{error}</p>}
    <button type="button" disabled={busy} onClick={() => void refresh()}>
      {busy ? "Checking DoorDash…" : "Check store and menu status"}
    </button>
    <p><a href="https://developer.doordash.com/portal/integration/marketplace/stores" target="_blank" rel="noopener noreferrer">Open DoorDash Sandbox stores ↗</a></p>
    {status && <div role="status">
      <h3>{status.registered ? "Location registered on DoorDash" : "Location has not been registered on this provider"}</h3>
      {status.registered && <>
        <p>{status.isActive === true ? "Store active" : status.isActive === false ? "Store inactive" : "DoorDash did not report the store’s activation status."}
          {status.isPOS ? " · POS order protocol enabled" : " · POS order protocol is not enabled"}</p>
        {status.storeURL && <p><a href={status.storeURL} target="_blank" rel="noopener noreferrer">Open this store on DoorDash ↗</a></p>}
        {status.lastImport && <p>Last menu import callback: <strong>{status.lastImport.status}</strong>{status.lastImport.menuId && <> · Menu ID <code>{status.lastImport.menuId}</code></>}</p>}
        {status.menus.length === 0 && status.lastImport ? <p>The menu is not listed in DoorDash’s store response yet. Review the existing import in DoorDash Developer Portal. A successful import still needs menu review and activation after preparation routing is ready.</p> : status.menus.length === 0 ? <p>No imported menus are reported yet. In DoorDash Developer Portal, open this store’s menu and select <strong>Ingest menu</strong>. Then return here and check its status again.</p> : status.menus.map(menu => <div className="dd-menu-status" key={menu.id}>
          <h4>{menu.name}</h4>
          <p>{menu.isActive ? "Menu active" : "Menu inactive"} · {menu.isPOS ? "POS menu" : "Not a POS menu"}</p>
          {menu.latestStatus && <p>Latest menu update: <strong>{menu.latestStatus}</strong></p>}
          {menu.lastSuccessfulUpdate && <p className="dd-caption">Last successful import: {menu.lastSuccessfulUpdate}</p>}
          {menu.previewURL && <a href={menu.previewURL} target="_blank" rel="noopener noreferrer">Review menu on DoorDash ↗</a>}
        </div>)}
      </>}
    </div>}
    <h3>Before activating the test store</h3>
    <ol><li>Save and review your Clover menu and DoorDash hours above.</li>
      <li>Open Restaurant operations and assign every item to a preparation area.</li>
      <li>Review the imported menu on DoorDash, then activate the menu and test store from DoorDash Developer Portal.</li></ol>
    <p className="dd-caption">Production is not enabled. Your production locations must be onboarded with your DoorDash representative or an approved Store Onboarding flow.</p>
  </section>;
}
