"use client";

import { useState } from "react";

type Entity = { id: string; name: string; type: "item" | "item_option"; isActive: boolean;
  availableInClover: boolean; syncStatus: string | null; syncError: string | null };
type Operations = {
  menuPublished: boolean;
  areas: { id: string; name: string }[]; totalItems: number; unroutedCount: number; unrouted: string[];
  entities: Entity[];
  actions: { id: string; kind: string; state: string; error: string | null; itemId: string | null; orderId: string | null }[];
};
type Props = { request: <T>(action: string, body?: Record<string, unknown>) => Promise<T> };
const labels: Record<string, string> = {
  queued: "Queued", pending: "Retry queued", processing: "Sending", sent: "Sent to DoorDash",
  waiting_configuration: "Waiting for DoorDash credentials", failed: "Needs attention",
};

export default function DoorDashOperations({ request }: Props) {
  const [data, setData] = useState<Operations | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [areaId, setAreaId] = useState("");
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState("all");

  async function run(work: () => Promise<void>) {
    setBusy(true); setError(""); setNotice("");
    try { await work(); } catch (failure) {
      setError(failure instanceof Error ? failure.message : "The operation failed.");
    } finally { setBusy(false); }
  }
  async function load() { setData(await request<Operations>("operations")); }
  const filtered = (data?.entities ?? []).filter((entity) =>
    (kind === "all" || entity.type === kind) && entity.name.toLowerCase().includes(search.toLowerCase()),
  );

  return <section className="dd-card dd-operations" aria-busy={busy}>
    <span className="dd-eyebrow">Restaurant operations · Sandbox</span>
    <h2>Prepare your kitchen. Keep your menu available.</h2>
    <p>Assign preparation areas before accepting orders. Availability changes here apply to DoorDash only.</p>
    {error && <p className="dd-alert error" role="alert">{error}</p>}
    {notice && <p className="dd-alert" role="status">{notice}</p>}
    <button type="button" disabled={busy} onClick={() => void run(load)}>
      {busy ? "Loading…" : data ? "Refresh restaurant operations" : "Load restaurant operations"}
    </button>
    {data && <>
      <div className="dd-routing">
        <h3>Preparation areas</h3>
        <p><strong>{data.totalItems - data.unroutedCount} of {data.totalItems}</strong> menu items have a unique Coorder item and a valid preparation area.</p>
        {data.unroutedCount > 0 ? <>
          <p>{data.unroutedCount} items still need routing. Orders containing them will be declined with a detailed reason until routing is ready.</p>
          <details><summary>Items to review</summary><ul>{data.unrouted.map((name, i) => <li key={i}>{name}</li>)}</ul>{data.unroutedCount > 15 && <p>Showing the first 15 items.</p>}</details>
          {data.areas.length > 0 ? <>
            <label htmlFor="dd-preparation-area">Preparation area for missing or unrouted items</label>
            <select id="dd-preparation-area" value={areaId} onChange={(e) => setAreaId(e.target.value)} disabled={busy}>
              <option value="">Choose an area</option>
              {data.areas.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}
            </select>
            <p className="dd-caption">This adds missing items to Coorder and assigns unrouted items to the area you choose. Existing valid assignments stay in place. Clover stays unchanged.</p>
            <button type="button" className="dd-primary" disabled={busy || !areaId} onClick={() => void run(async () => {
              await request("import_items", { areaId }); await load();
              setNotice("Coorder item routing updated. Review any remaining items for duplicate Clover mappings.");
            })}>Import missing items and assign this area</button>
          </> : <p>Create a preparation area in Coorder’s Inventory section, then refresh this page.</p>}
        </> : <p>Your menu items are routed to Coorder’s preparation areas.</p>}
      </div>
      <div className="dd-stock">
        <h3>DoorDash availability</h3>
        <p>Mark an item or modifier out of stock, then restore it when it is available. Each change is queued for DoorDash; check its delivery status below.</p>
        {!data.menuPublished && <p className="dd-alert">Availability controls become available after DoorDash confirms a successful menu import.</p>}
        <label htmlFor="dd-stock-search">Find an item or modifier</label>
        <input id="dd-stock-search" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name" />
        <label htmlFor="dd-stock-kind">Show</label>
        <select id="dd-stock-kind" value={kind} onChange={(e) => setKind(e.target.value)}>
          <option value="all">Items and modifiers</option><option value="item">Items</option><option value="item_option">Modifiers</option>
        </select>
        <p className="dd-caption">{filtered.length} results. Showing up to 30; narrow your search to find more.</p>
        <div className="dd-stock-list">{filtered.slice(0, 30).map((entity) => <div className="dd-stock-row" key={`${entity.type}:${entity.id}`}>
          <div><strong>{entity.name}</strong><small>{entity.type === "item" ? "Item" : "Modifier"} · {entity.isActive ? "Available" : "Out of stock"}</small>
            {entity.syncStatus && <small>{labels[entity.syncStatus] ?? entity.syncStatus}</small>}
            {!entity.availableInClover && <small>Unavailable in Clover</small>}
            {entity.syncError && <small className="dd-stock-error">{entity.syncError}</small>}
          </div>
          <button type="button" disabled={busy || !data.menuPublished || (!entity.isActive && !entity.availableInClover)} onClick={() => void run(async () => {
            await request("set_availability", { id: entity.id, type: entity.type, isActive: !entity.isActive });
            await load(); setNotice("Availability change queued. A queued change has not yet been confirmed by DoorDash.");
          })}>{entity.isActive ? "Mark out of stock" : "Mark available"}</button>
        </div>)}</div>
      </div>
      <div className="dd-signal-status">
        <h3>Order ready and availability updates</h3>
        <p>When every item in a DoorDash order is marked cooked or delivered in Coorder, its ready signal is queued automatically. This does not require a separate switch.</p>
        {data.actions.length ? <ul>{data.actions.map((action) => <li key={action.id}>
          <strong>{action.kind === "ready" ? "Order ready signal" : "Availability change"}</strong> · {labels[action.state] ?? action.state}
          {(action.orderId || action.itemId) && <small>{action.orderId ?? action.itemId}</small>}
          {action.error && <small>{action.error}</small>}
        </li>)}</ul> : <p className="dd-caption">No updates have been queued yet.</p>}
        <p className="dd-caption">Updates stay pending until valid DoorDash Marketplace credentials are configured. “Sent to DoorDash” means its API accepted the request; review the order or menu in DoorDash to check the visible result.</p>
      </div>
    </>}
  </section>;
}
