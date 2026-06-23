type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <header>
      <div className="text-[#8fc8ff] text-[0.8rem] font-bold tracking-[0.14em] uppercase">
        {eyebrow}
      </div>
      <h1 className="mt-1 mb-2 text-[clamp(1.9rem,3vw,2.5rem)] tracking-[-0.04em]">
        {title}
      </h1>
      {/* <p className="text-[#aeb9ca]">{description}</p> */}
    </header>
  );
}
