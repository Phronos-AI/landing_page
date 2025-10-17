import { Files, Search, GitBranch, Bug, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityBarProps {
  activeView: "explorer" | "search" | "git" | "debug" | "chat";
  onViewChange: (view: "explorer" | "search" | "git" | "debug" | "chat") => void;
}

export function ActivityBar({ activeView, onViewChange }: ActivityBarProps) {
  const items = [
    { id: "explorer" as const, icon: Files, label: "Explorer" },
    { id: "search" as const, icon: Search, label: "Search" },
    { id: "git" as const, icon: GitBranch, label: "Source Control" },
    { id: "debug" as const, icon: Bug, label: "Run and Debug" },
  ];

  return (
    <div className="w-12 bg-activityBar-bg border-r border-border flex flex-col items-center py-2">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onViewChange(item.id)}
          className={cn(
            "w-full h-12 flex items-center justify-center hover:bg-muted/20 transition-colors relative",
            activeView === item.id && "text-foreground",
            activeView !== item.id && "text-muted-foreground"
          )}
          title={item.label}
        >
          <item.icon className="w-6 h-6" />
          {activeView === item.id && (
            <div className="absolute left-0 w-0.5 h-12 bg-primary" />
          )}
        </button>
      ))}
    </div>
  );
}
