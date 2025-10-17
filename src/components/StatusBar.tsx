import { GitBranch, AlertCircle, Info } from "lucide-react";

export function StatusBar() {
  return (
    <div className="flex items-center justify-between px-3 py-1 bg-statusBar-bg border-t border-border text-xs">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 text-foreground">
          <GitBranch className="w-3 h-3" />
          <span>main</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <AlertCircle className="w-3 h-3" />
          <span>0 Errors</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Info className="w-3 h-3" />
          <span>0 Warnings</span>
        </div>
      </div>
      <div className="flex items-center gap-4 text-muted-foreground">
        <span>UTF-8</span>
        <span>LF</span>
        <span>TypeScript</span>
        <span>Ln 1, Col 1</span>
      </div>
    </div>
  );
}
