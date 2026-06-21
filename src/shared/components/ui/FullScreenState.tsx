type FullScreenStateProps = {
  title: string;
  description: string;
};

export function FullScreenState({
  title,
  description,
}: FullScreenStateProps) {
  return (
    <main className="fullscreen-state">
      <section className="surface-card state-card">
        <div className="eyebrow">CareerGraph Admin</div>
        <h1>{title}</h1>
        <p className="lead">{description}</p>
      </section>
    </main>
  );
}
