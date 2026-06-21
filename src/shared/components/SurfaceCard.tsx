import type { PropsWithChildren } from "react";

export function SurfaceCard({ children }: PropsWithChildren) {
  return (
    <section
      className="flex flex-col gap-4 rounded-[1.35rem] border border-[rgba(127,150,186,0.14)]
        bg-gradient-to-b from-[rgba(19,31,53,0.9)] to-[rgba(11,20,37,0.86)]
        p-5 shadow-[0_24px_70px_rgba(0,0,0,0.22)]"
    >
      {children}
    </section>
  );
}
