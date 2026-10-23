import type { Metadata } from "next";
import DoorDashPortal from "./portal";
import "./portal.css";

export const metadata: Metadata = {
  title: "Connect DoorDash",
  description: "Connect your Coorder restaurant to DoorDash and review your menu before activating the integration.",
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};

export default function ConnectDoorDashPage() {
  return <DoorDashPortal />;
}
