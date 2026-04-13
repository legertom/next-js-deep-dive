interface DiagramProps {
  children: React.ReactNode;
  caption?: string;
}

export function Diagram({ children, caption }: DiagramProps) {
  return (
    <figure className="my-8">
      <div className="rounded-xl border border-card-border bg-card p-6 flex items-center justify-center overflow-x-auto">
        {children}
      </div>
      {caption && (
        <figcaption className="text-center text-sm text-muted mt-3 italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// Arrow box diagram component for visual flows
type FlowStep = string | { label: string; sublabel?: string; color?: string };

export function FlowDiagram({ steps, title }: { steps: FlowStep[]; title?: string }) {
  const normalized = steps.map((s) => (typeof s === "string" ? { label: s } : s));
  return (
    <div className="my-6">
      {title && <div className="text-xs font-semibold text-muted text-center mb-2 uppercase tracking-wider">{title}</div>}
    <div className="flex flex-wrap items-center justify-center gap-2 py-4">
      {normalized.map((step, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`px-4 py-3 rounded-lg border-2 text-center min-w-[120px] ${step.color || "border-accent bg-accent-light text-accent-text"}`}>
            <div className="font-semibold text-sm">{step.label}</div>
            {step.sublabel && <div className="text-xs mt-0.5 opacity-75">{step.sublabel}</div>}
          </div>
          {i < steps.length - 1 && (
            <svg className="w-5 h-5 text-muted flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          )}
        </div>
      ))}
    </div>
    </div>
  );
}
