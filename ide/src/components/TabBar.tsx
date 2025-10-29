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
            "flex items-center gap-2 px-3 py-1.5 border-r border-border/50 cursor-pointer group min-w-[120px] max-w-[200px] relative",
            activeTab === tab.path 
              ? "bg-tabBar-active text-foreground" 
              : "bg-tabBar-inactive text-muted-foreground hover:text-foreground"
          )}
          onClick={() => onTabClick(tab.path)}
        >
          {activeTab === tab.path && (
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary"></div>
          )}
          <span className="text-[13px] truncate flex-1">{tab.name}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTabClose(tab.path);
            }}
            className={cn(
              "hover:bg-muted/30 rounded p-0.5 transition-all",
              activeTab === tab.path ? "opacity-60 hover:opacity-100" : "opacity-0 group-hover:opacity-60 group-hover:hover:opacity-100"
            )}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
