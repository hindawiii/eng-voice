import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

interface AppShellProps {
  children: ReactNode;
  hideNav?: boolean;
}

export const AppShell = ({ children, hideNav }: AppShellProps) => (
  <div className="min-h-screen bg-gradient-room pb-24">
    <div className="mx-auto max-w-2xl">{children}</div>
    {!hideNav && <BottomNav />}
  </div>
);
