interface CalloutProps {
  type?: "info" | "warning" | "tip" | "important";
  title?: string;
  children: React.ReactNode;
}

const styles = {
  info: {
    border: "border-accent/30",
    bg: "bg-accent-light/50",
    icon: "💡",
    titleColor: "text-accent-text",
    defaultTitle: "Good to know",
  },
  warning: {
    border: "border-warning/30",
    bg: "bg-warning-light/50",
    icon: "⚠️",
    titleColor: "text-warning-text",
    defaultTitle: "Warning",
  },
  tip: {
    border: "border-success/30",
    bg: "bg-success-light/50",
    icon: "✅",
    titleColor: "text-success-text",
    defaultTitle: "Pro tip",
  },
  important: {
    border: "border-important-border",
    bg: "bg-important-bg",
    icon: "🔑",
    titleColor: "text-important-text",
    defaultTitle: "Key concept",
  },
};

export function Callout({ type = "info", title, children }: CalloutProps) {
  const s = styles[type];
  return (
    <div className={`my-6 rounded-xl border ${s.border} ${s.bg} p-5`}>
      <div className={`flex items-center gap-2 font-semibold text-sm ${s.titleColor} mb-2`}>
        <span>{s.icon}</span>
        {title || s.defaultTitle}
      </div>
      <div className="text-[0.9375rem] leading-relaxed [&>p]:mb-2 [&>p:last-child]:mb-0">
        {children}
      </div>
    </div>
  );
}
