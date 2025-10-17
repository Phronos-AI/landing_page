import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Tab {
  path: string;
  name: string;
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: string | null;
  onTabClick: (path: string) => void;
  onTabClose: (path: string) => void;
}

export function TabBar({ tabs, activeTab, onTabClick, onTabClose }: TabBarProps) {
  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center bg-tabBar-bg border-b border-border overflow-x-auto">
      {tabs.map((tab) => (
        <div
          key={tab.path}
          className={cn(
            "flex items-center gap-2 px-3 py-2 border-r border-border cursor-pointer group min-w-[120px] max-w-[200px]",
            activeTab === tab.path ? "bg-tabBar-active text-foreground" : "bg-tabBar-inactive text-muted-foreground hover:bg-tabBar-active/50"
          )}
          onClick={() => onTabClick(tab.path)}
        >
          <span className="text-xs truncate flex-1">{tab.name}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTabClose(tab.path);
            }}
            className="opacity-0 group-hover:opacity-100 hover:bg-muted/20 rounded p-0.5"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
