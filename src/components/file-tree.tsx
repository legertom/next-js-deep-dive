interface FileTreeItem {
  name: string;
  type?: "file" | "folder";
  highlight?: boolean;
  children?: FileTreeItem[];
  annotation?: string;
}

interface FileTreeProps {
  items: FileTreeItem[];
  title?: string;
}

function TreeItem({ item, depth = 0 }: { item: FileTreeItem; depth?: number }) {
  const indent = depth * 1.25;
  const isFolder = item.type === "folder" || (!item.type && !!item.children) || (!item.type && !item.name.includes("."));

  return (
    <>
      <div
        className={`flex items-center gap-2 py-1 px-3 text-sm font-mono ${item.highlight ? "bg-accent-light/60 text-accent-text font-semibold rounded" : "text-muted"}`}
        style={{ paddingLeft: `${indent + 0.75}rem` }}
      >
        {isFolder ? (
          <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-muted flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        )}
        <span>{item.name}</span>
        {item.annotation && (
          <span className="text-xs text-muted ml-auto">{item.annotation}</span>
        )}
      </div>
      {item.children?.map((child, i) => (
        <TreeItem key={i} item={child} depth={depth + 1} />
      ))}
    </>
  );
}

export function FileTree({ items, title }: FileTreeProps) {
  return (
    <div className="my-6 rounded-xl border border-card-border bg-card overflow-hidden">
      {title && (
        <div className="px-4 py-2.5 bg-subtle border-b border-card-border text-xs font-semibold text-muted uppercase tracking-wider">
          {title}
        </div>
      )}
      <div className="py-2">
        {items.map((item, i) => (
          <TreeItem key={i} item={item} />
        ))}
      </div>
    </div>
  );
}
