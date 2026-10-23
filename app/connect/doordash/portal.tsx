"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { sitePath } from "../../site-path";

const endpoint = "https://us-west1-domepath-coorder.cloudfunctions.net/doorDashPortal";
const sessionKey = "coorder.doordash.portal.session";
const days = [
  ["MON", "Lunes"], ["TUE", "Martes"], ["WED", "Miércoles"],
  ["THU", "Jueves"], ["FRI", "Viernes"], ["SAT", "Sábado"], ["SUN", "Domingo"],
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
  INTEGRATION_REQUESTED: "Vinculación solicitada", STORE_CONNECTED: "Sucursal vinculada",
  MENU_REQUESTED: "DoorDash está importando tu menú", MENU_IMPORTED: "Menú importado",
  MENU_AUDIT: "DoorDash está revisando tu menú", MENU_BLOCK: "Tu menú necesita atención",
  MENU_QUALIFIED: "Tu menú está listo para revisar", ACTIVATION_BLOCK: "La activación necesita atención",
  INTEGRATION_ACTIVATED: "Integración activada", ABANDONED: "No se completó la vinculación",
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
      throw new PortalError(typeof data.error === "string" ? data.error : "No se pudo completar la operación.", typeof data.code === "string" ? data.code : "portal_error");
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
      setError(failure instanceof Error ? failure.message : "No se pudo completar la operación.");
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
      if (exchangeCode || state) setError("Tu sesión venció. Abre el portal con un código nuevo de Coorder.");
      return;
    }
    tokenRef.current = stored; setToken(stored);
    void run("load", async () => {
      if (params.get("error")) throw new Error("La autorización se canceló. Puedes volver a conectar DoorDash.");
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
    <main className="dd-portal" lang="es">
      <header className="dd-header">
        <a className="brand" href={sitePath("/")} aria-label="Inicio de Coorder">
          <span className="brand-mark"><img src={sitePath("/assets/coorder-logo.png")} alt="" /></span>
          <span><strong>Coorder</strong><small>by DomePath</small></span>
        </a>
        <a href={sitePath("/connect/doordash/help/")}>Ayuda con la conexión ↗</a>
      </header>
      <div className="dd-intro">
        <span className="dd-badge">DoorDash · Sandbox</span>
        <h1>Tu restaurante,<br /><span>conectado con DoorDash.</span></h1>
        <p>Revisa tu menú de Clover, elige tu sucursal y sigue la vinculación desde un solo lugar.</p>
      </div>
      <ol className="dd-steps" aria-label="Pasos de la conexión">
        {["Acceso a Coorder", "Preparar menú", "Elegir sucursal", "Revisar y activar"].map((label, i) => (
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
              <span className="dd-eyebrow">01 / Acceso a Coorder</span>
              <h2>Empieza desde tu cuenta.</h2>
              <p>En la app Coorder, abre <strong>Settings → DoorDash</strong> y selecciona <strong>Generate access code</strong>.</p>
              <form onSubmit={claim}>
                <label htmlFor="portal-code">Código temporal de Coorder</label>
                <input id="portal-code" value={code} onChange={(e) => setCode(e.target.value)}
                  placeholder="XXXX-XXXX-XXXX-XXXX" autoComplete="off" spellCheck={false}
                  autoCapitalize="characters" maxLength={32} required />
                <p className="dd-caption">Se usa una sola vez y vence en 10 minutos. No compartas tu código.</p>
                <button className="dd-primary" disabled={Boolean(busy) || !code.trim()}>
                  {busy ? "Abriendo tu restaurante…" : "Continuar con mi restaurante →"}
                </button>
              </form>
            </div>
          ) : !status ? (
            <div className="dd-card"><h2>Abriendo tu restaurante…</h2>
              <button disabled={Boolean(busy)} onClick={() => void run("load", async () => { await loadStatus(); })}>Volver a cargar</button>
              <button className="dd-text-button" disabled={Boolean(busy)} onClick={() => void run("logout", async () => { try { await api("logout"); } finally { clearSession(); } })}>Cerrar sesión</button>
            </div>
          ) : (
            <>
              <div className="dd-restaurant">
                <div><span className="dd-eyebrow">Tu restaurante en Coorder</span><h2>{status.merchant.name}</h2>
                  <p>{status.merchant.environment === "sandbox" ? "Entorno de pruebas" : "Entorno de producción"}</p></div>
                <button className="dd-text-button" disabled={Boolean(busy)} onClick={() => void run("logout", async () => { try { await api("logout"); } finally { clearSession(); } })}>Cerrar sesión</button>
              </div>
              <div className="dd-card">
                <span className="dd-eyebrow">02 / Preparar menú</span>
                <h2>El mismo menú. Tus horarios.</h2>
                <p>Usaremos los artículos, precios y modificadores de Clover. Los horarios y exclusiones que elijas aquí se aplican únicamente a DoorDash.</p>
                <form onSubmit={(e) => { e.preventDefault(); void run("configure", async () => {
                  await api("configure_menu", { openHours: hours, excludedItemIds: excluded });
                  await loadStatus(); setPreview(await api<Menu>("preview"));
                  setNotice("Menú preparado. Revisa los artículos antes de continuar.");
                }); }}>
                  <fieldset disabled={Boolean(busy) || status.onboarding?.status === "INTEGRATION_ACTIVATED"}>
                    <legend>Horario del menú en DoorDash</legend>
                    <div className="dd-hours">
                      {days.map(([day, label]) => <div className="dd-day" key={day}>
                        <strong>{label}</strong><div className="dd-intervals">
                          {hours.map((hour, index) => hour.day_index !== day ? null : <div className="dd-interval" key={index}>
                            <input type="time" aria-label={`${label}, abre`} value={hour.start_time} required
                              onChange={(e) => setHours(hours.map((h, i) => i === index ? { ...h, start_time: e.target.value } : h))} />
                            <span>–</span>
                            <input type="time" aria-label={`${label}, cierra`} value={hour.end_time} required
                              onChange={(e) => setHours(hours.map((h, i) => i === index ? { ...h, end_time: e.target.value } : h))} />
                            <button type="button" className="dd-remove" aria-label={`Quitar horario de ${label}`} onClick={() => setHours(hours.filter((_, i) => i !== index))}>×</button>
                          </div>)}
                          {!hours.some((h) => h.day_index === day) && <span className="dd-caption">Cerrado</span>}
                        </div>
                        <button type="button" className="dd-add" aria-label={`Agregar horario de ${label}`}
                          disabled={hours.length >= 21} onClick={() => setHours([...hours, { day_index: day, start_time: "", end_time: "" }])}>+</button>
                      </div>)}
                    </div>
                    {hours.length === 1 && <button type="button" className="dd-text-button" onClick={() => setHours(days.map(([day]) => ({ ...hours[0], day_index: day })))}>Usar este horario todos los días</button>}
                    {status.preparation.reviewItems.length > 0 && <div className="dd-exclusions">
                      <h3>Artículos para revisar</h3>
                      <p className="dd-caption">Los artículos con importe variable o que necesitan una clasificación especial deben quedar fuera de este menú de pruebas.</p>
                      {status.preparation.reviewItems.map((item) => <label className="dd-check" key={item.id}>
                        <input type="checkbox" checked={excluded.includes(item.id)} onChange={(e) => setExcluded(e.target.checked ? [...excluded, item.id] : excluded.filter((id) => id !== item.id))} />
                        <span>Excluir <strong>{item.name}</strong><small>{item.reason === "variable_price" ? "Importe variable" : item.reason === "age_restricted" ? "Requiere clasificación de edad" : "Artículo sin ingreso"}</small></span>
                      </label>)}
                    </div>}
                    <button className="dd-primary" disabled={!hours.length}>{busy === "configure" ? "Preparando menú…" : "Guardar y revisar menú"}</button>
                  </fieldset>
                </form>
                {status.preparation.configured && <button className="dd-text-button" disabled={Boolean(busy)} onClick={() => void run("preview", async () => { setPreview(await api<Menu>("preview")); })}>Ver menú actual de DoorDash</button>}
                {hasOnboarding && <p className="dd-caption">Después de corregir el menú, solicita de nuevo su importación. Una integración activada conserva sus horarios en este portal de pruebas.</p>}
              </div>
              {preview && <div className="dd-card dd-menu-preview">
                <span className="dd-eyebrow">Vista previa de Coorder</span><h2>{allItems.length} productos para DoorDash</h2>
                <p>Estos son los datos que recibirá DoorDash. La vista previa final aparecerá después de la importación.</p>
                {preview.menus.flatMap((menu) => menu.menu.categories).map((category) => <details key={category.merchant_supplied_id}>
                  <summary>{category.name} <span>{category.items.length}</span></summary>
                  {category.items.map((item) => <div className="dd-menu-item" key={item.merchant_supplied_id}>
                    <div><strong>{item.name}</strong>{!item.active && <small>No disponible</small>}
                      {item.extras.map((extra) => <small key={extra.merchant_supplied_id}>{extra.name}: {extra.options.map((option) => `${option.name} (+${(option.price / 100).toFixed(2)})`).join(", ")}</small>)}
                    </div><span>{(item.price / 100).toFixed(2)}</span>
                  </div>)}
                </details>)}
              </div>}
              {!status.providerReady ? <div className="dd-card dd-pending">
                <span className="dd-eyebrow">Siguiente paso</span><h2>Estamos preparando la autorización con DoorDash.</h2>
                <p>Puedes guardar y revisar tu menú. La conexión con tu cuenta de DoorDash se habilitará cuando termine la configuración de Sandbox.</p>
                <a href="mailto:admin@domepath.com?subject=Conexi%C3%B3n%20DoorDash%20Coorder">Consultar el estado con DomePath ↗</a>
              </div> : !hasOnboarding ? <div className="dd-card">
                <span className="dd-eyebrow">03 / Elegir sucursal</span>
                <h2>Autoriza tu cuenta de DoorDash.</h2>
                <p>Entra con una cuenta que tenga permisos para administrar el restaurante. Tu contraseña se introduce únicamente en DoorDash.</p>
                <button className="dd-primary dd-doordash" disabled={Boolean(busy) || !status.preparation.configured} onClick={() => void run("authorize", async () => {
                  const result = await api<{ authorizationURL: string }>("authorize");
                  window.location.assign(result.authorizationURL);
                })}>{status.authorized ? "Volver a autorizar DoorDash" : "Conectar con DoorDash →"}</button>
                {status.authorized && <>
                  <button className="dd-text-button" disabled={Boolean(busy)} onClick={() => void run("stores", async () => { setStores((await api<{ stores: Store[] }>("stores")).stores); })}>Cargar sucursales de DoorDash</button>
                  {stores && stores.length === 0 && <p>No hay sucursales disponibles en esta cuenta. Si ya tienes un restaurante en DoorDash, vuelve a entrar con una cuenta autorizada. <a href="https://help.doordash.com/merchants/" target="_blank" rel="noopener noreferrer">Ayuda de DoorDash ↗</a></p>}
                  {stores && stores.length > 0 && <fieldset className="dd-stores" disabled={Boolean(busy)}>
                    <legend>Conectar {status.merchant.name} con:</legend>
                    {stores.map((store) => <label className={`dd-store ${selected === store.doordash_store_uuid ? "selected" : ""}`} key={store.doordash_store_uuid}>
                      <input type="radio" name="doordash-store" value={store.doordash_store_uuid} checked={selected === store.doordash_store_uuid}
                        disabled={!store.is_eligible_to_onboard || store.is_active_on_integration}
                        onChange={() => { setSelected(store.doordash_store_uuid); setConfirmed(false); }} />
                      <span><strong>{store.name}</strong><small>{store.address}</small>
                        {(!store.is_eligible_to_onboard || store.is_active_on_integration) && <small>{store.is_active_on_integration ? "Ya está activa en esta integración" : "No disponible para vincular"}</small>}
                      </span>
                    </label>)}
                    {selected && <label className="dd-check"><input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} /><span>Confirmo que esta sucursal corresponde a <strong>{status.merchant.name}</strong>.</span></label>}
                    <button className="dd-primary" disabled={!selected || !confirmed} onClick={() => void run("start", async () => { await api("start", { storeId: selected }); await loadStatus(); setNotice("Vinculación solicitada. DoorDash comenzará a importar tu menú."); })}>Vincular sucursal e importar menú</button>
                  </fieldset>}
                </>}
              </div> : <div className="dd-card">
                <span className="dd-eyebrow">04 / Revisar y activar</span>
                <h2>{status.onboarding ? statusLabels[status.onboarding.status] ?? status.onboarding.status : "Vinculación en proceso"}</h2>
                {status.onboarding?.details && <p>{status.onboarding.details}</p>}
                {status.onboarding?.exclusionCode && <p className="dd-caption">Referencia de DoorDash: {status.onboarding.exclusionCode}</p>}
                {status.onboarding?.menus.map((menu) => <div className="dd-menu-status" key={menu.menu_uuid}>
                  {menu.menu_preview_link && <a href={menu.menu_preview_link} target="_blank" rel="noopener noreferrer">Revisar menú en DoorDash ↗</a>}
                  {menu.menu_error && <p className="dd-alert error">{menu.menu_error}</p>}
                </div>)}
                <button disabled={Boolean(busy)} onClick={refresh}>Actualizar estado</button>
                {["MENU_BLOCK", "MENU_QUALIFIED", "MENU_REQUESTED"].includes(status.onboarding?.status ?? "") && <button className="dd-text-button" disabled={Boolean(busy)} onClick={() => void run("retry", async () => { await api("retry_menu"); setNotice("DoorDash recibió la solicitud para volver a importar el menú."); })}>Reintentar importación de menú</button>}
                {status.onboarding?.status === "MENU_QUALIFIED" && <div className="dd-activation">
                  <label className="dd-check"><input type="checkbox" checked={reviewed} onChange={(e) => setReviewed(e.target.checked)} /><span>Revisé los menús de DoorDash y confirmo que los precios, artículos y horarios son correctos.</span></label>
                  <p className="dd-caption">Activar reemplaza los menús anteriores de esta sucursal y cambia su conexión de pedidos a Coorder. Esta operación se realiza en Sandbox.</p>
                  <button className="dd-primary" disabled={Boolean(busy) || !reviewed || !status.onboarding.menus.some((m) => m.menu_preview_link)} onClick={() => void run("activate", async () => { await api("activate", { menuReviewed: reviewed }); setNotice("Activación solicitada. Actualiza el estado para confirmar el resultado."); setReviewed(false); })}>Activar integración de pruebas</button>
                </div>}
                {status.onboarding?.status === "INTEGRATION_ACTIVATED" && <p>La integración está activa en Sandbox. Puedes pausar el restaurante y administrar su disponibilidad desde DoorDash Merchant Portal.</p>}
              </div>}
            </>
          )}
        </section>
        <aside className="dd-sidebar">
          <div className="dd-note"><span aria-hidden="true">↔</span><h3>Clover conserva tu menú.</h3><p>Leemos tus productos para preparar el menú de DoorDash. No cambiamos los precios ni los horarios guardados en Clover.</p></div>
          <div className="dd-note"><span aria-hidden="true">◇</span><h3>Empieza con pruebas.</h3><p>Este flujo está en Sandbox. Los pedidos de DoorDash todavía no aparecen en el tablero de Coorder.</p></div>
          <a href={sitePath("/connect/doordash/help/")}>Cómo funciona la vinculación →</a>
        </aside>
      </div>
      <footer className="dd-footer"><span>Coorder by DomePath</span><nav aria-label="Información legal"><a href={sitePath("/legal/privacy/")}>Privacidad</a><a href={sitePath("/legal/eula/")}>Condiciones de uso</a><a href="mailto:admin@domepath.com">Contacto</a></nav></footer>
    </main>
  );
}
