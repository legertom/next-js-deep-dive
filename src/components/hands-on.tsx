interface HandsOnProps {
  title: string;
  steps: string[];
  projectContext?: string;
  projectStep?: string;
}

export function HandsOn({ title, steps, projectContext, projectStep }: HandsOnProps) {
  return (
    <div className="my-8 rounded-xl border-2 border-dashed border-accent/30 bg-accent-light/20 overflow-hidden">
      <div className="px-6 py-4 bg-accent/5 border-b border-accent/10">
        <div className="flex items-center gap-2 text-sm font-bold text-accent">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.71-3.3a1 1 0 01-.5-.87V5.83a1 1 0 01.5-.87l5.71-3.3a1 1 0 011 0l5.71 3.3a1 1 0 01.5.87v5.17a1 1 0 01-.5.87l-5.71 3.3a1 1 0 01-1 0z" />
          </svg>
          Hands-On Exercise
          {projectStep && (
            <span className="ml-auto bg-accent/10 text-accent text-xs font-semibold px-2 py-0.5 rounded-full">
              {projectStep}
            </span>
          )}
        </div>
        <p className="text-foreground font-semibold mt-1">{title}</p>
      </div>
      {projectContext && (
        <div className="px-6 py-3 bg-accent/[0.03] border-b border-accent/10 flex items-start gap-2">
          <svg className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          <p className="text-sm text-muted italic">{projectContext}</p>
        </div>
      )}
      <div className="p-6">
        <ol className="space-y-3">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <span className="text-[0.9375rem] leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
