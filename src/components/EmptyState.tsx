import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  desc?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, desc, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      {icon && <div className="w-16 h-16 rounded-2xl bg-ink-800 flex items-center justify-center text-zinc-500 mb-4">{icon}</div>}
      <p className="text-zinc-300 font-medium">{title}</p>
      {desc && <p className="text-sm text-zinc-500 mt-1 max-w-xs">{desc}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
