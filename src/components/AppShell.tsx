import BottomNav from "@/components/BottomNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return <><main className="lineupShell">{children}</main><BottomNav /></>;
}
