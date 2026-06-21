import type { PropsWithChildren } from "react";

export function SurfaceCard({ children }: PropsWithChildren) {
  return <section className="surface-card">{children}</section>;
}
