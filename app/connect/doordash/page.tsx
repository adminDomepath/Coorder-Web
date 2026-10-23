import type { Metadata } from "next";
import DoorDashPortal from "./portal";
import "./portal.css";

export const metadata: Metadata = {
  title: "Conectar DoorDash",
  description: "Vincula tu restaurante de Coorder con DoorDash y revisa tu menú antes de activar la integración.",
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};

export default function ConnectDoorDashPage() {
  return <DoorDashPortal />;
}
