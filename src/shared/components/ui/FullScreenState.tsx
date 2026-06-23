type FullScreenStateProps = {
  title: string;
  description: string;
};

export function FullScreenState({ title, description }: FullScreenStateProps) {
  return (
    <main className="grid min-h-screen items-center justify-center gap-6 p-8">
      <section
        className="max-w-[460px] text-center rounded-[1.35rem] border border-[rgba(127,150,186,0.14)]
          bg-gradient-to-b from-[rgba(13,24,41,0.94)] to-[rgba(8,15,27,0.9)]
          p-8 shadow-[0_28px_80px_rgba(0,0,0,0.28)]"
      >
        <div className="text-[#8fc8ff] text-4xl font-semibold tracking-[0.14em] uppercase">
          CareerGraph Admin
        </div>
        <h1 className="mt-1 mb-2 text-[2rem] tracking-[-0.04em]">{title}</h1>
        <p className="text-[#aeb9ca]">{description}</p>
      </section>
    </main>
  );
}
