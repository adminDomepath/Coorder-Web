import type { Metadata } from "next";
import { sitePath } from "../../../site-path";
import "../portal.css";

export const metadata: Metadata = {
  title: "DoorDash connection help",
  description: "How to open the Coorder portal, prepare your Clover menu, and connect your DoorDash location.",
};

export default function DoorDashHelp() {
  return <main className="dd-portal" lang="en">
    <header className="dd-header"><a className="brand" href={sitePath("/")}><span className="brand-mark"><img src={sitePath("/assets/coorder-logo.png")} alt="" /></span><span><strong>Coorder</strong><small>by DomePath</small></span></a><a href={sitePath("/connect/doordash/")}>Open portal →</a></header>
    <article className="dd-help">
      <span className="dd-badge">DoorDash · Sandbox</span>
      <h1>Connect your restaurant, step by step.</h1>
      <p>Use this flow to prepare and review a test connection between Coorder and DoorDash using your Clover menu. Production connections are not available yet, and DoorDash orders do not yet appear on the Coorder board.</p>
      <section><h2>1. Open the portal from Coorder</h2><p>In Coorder, sign in with the account connected to your Clover restaurant. Open <strong>Settings → DoorDash → Generate access code</strong>. Copy the code and open the portal. If DoorDash does not appear in Settings, you need the version of Coorder that includes this flow.</p><p>Enter the code in the portal. It can be used once and expires after 10 minutes. Keep it private: the code grants access to your restaurant’s connection settings. Portal sessions last one hour. Select <strong>Sign out</strong> to end your session.</p></section>
      <section><h2>2. Review your menu and hours</h2><p>Coorder reads the item names, prices, and modifiers from your connected Clover restaurant. Confirm when you want to offer this menu on DoorDash. You can add multiple time intervals per day or leave a day closed.</p><p>Items with variable prices or those requiring special classification need review before they can be sent to DoorDash. You can exclude them from the test menu. Then select <strong>Save and review menu</strong> and open each category to check its items.</p><p>These options affect only the menu prepared for DoorDash. Your inventory, prices, and hours saved in Clover stay unchanged.</p></section>
      <section><h2>3. Authorize DoorDash and choose your location</h2><p>Once authorization is available, select <strong>Connect with DoorDash</strong>. You will sign in directly on DoorDash; Coorder does not ask for your DoorDash password. Use an account authorized to manage the restaurant.</p><p>Compare your restaurant’s name in Coorder with the name and address of the DoorDash location. Locations marked as unavailable by DoorDash are shown but cannot be selected. Confirm your choice and select <strong>Connect location and import menu</strong>.</p><p>If the portal says authorization is being set up, you can save your menu and return later. A DoorDash account is not connected until you complete authorization and select a location.</p></section>
      <section><h2>4. Review the result</h2><p>Select <strong>Refresh status</strong> to check the import. If DoorDash reports a menu problem, review its message and use <strong>Retry menu import</strong> when available. Contact DomePath if you need to correct the menu source or cannot resolve a problem.</p><p>Once the menu is ready, open every <strong>Review menu on DoorDash</strong> link. Check the items, prices, and hours. Activation becomes available only after DoorDash approves the menu and you confirm your review.</p><p>Activating replaces the location’s previous menus and switches its order connection to Coorder. This flow operates exclusively in Sandbox. The integration is not ready to receive production orders.</p></section>
      <section><h2>If your restaurant is missing or you do not have permission</h2><p>Authorize again with an account that has management access to that location. If the location is still missing, contact DoorDash to review your access. An account without the required permissions should not be treated as a new restaurant.</p><p>If you do not yet have a restaurant on DoorDash, contact DomePath before continuing with signup. This version of the portal supports existing restaurants in DoorDash Sandbox.</p></section>
      <section><h2>Availability and support</h2><p>To pause your restaurant or manage its availability, use <a href="https://www.doordash.com/merchant/" target="_blank" rel="noopener noreferrer">DoorDash Merchant Portal</a>. Signing out of Coorder does not pause DoorDash.</p><p>For help with Coorder or your menu, email <a href="mailto:leonardo.arias@domepath.com?subject=Coorder%20DoorDash%20help">leonardo.arias@domepath.com</a>. Include the restaurant’s name and the message shown in the portal. Do not send passwords or access codes.</p></section>
      <a className="dd-help-cta" href={sitePath("/connect/doordash/")}>Open the connection portal →</a>
    </article>
    <footer className="dd-footer"><span>Coorder by DomePath</span><nav aria-label="Legal information"><a href={sitePath("/legal/privacy/")}>Privacy</a><a href={sitePath("/legal/eula/")}>Terms of use</a></nav></footer>
  </main>;
}
