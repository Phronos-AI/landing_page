import { GitBranch, AlertCircle, Info } from "lucide-react";

export function StatusBar() {
  return (
    <div className="flex items-center justify-between px-3 py-0.5 bg-statusBar-bg text-white text-xs font-medium">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 hover:bg-white/10 px-1.5 py-0.5 rounded cursor-pointer transition-colors">
          <GitBranch className="w-3.5 h-3.5" />
          <span>main</span>
        </div>
        <div className="flex items-center gap-1.5 hover:bg-white/10 px-1.5 py-0.5 rounded cursor-pointer transition-colors">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>0</span>
        </div>
        <div className="flex items-center gap-1.5 hover:bg-white/10 px-1.5 py-0.5 rounded cursor-pointer transition-colors">
          <Info className="w-3.5 h-3.5" />
          <span>0</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="hover:bg-white/10 px-1.5 py-0.5 rounded cursor-pointer transition-colors">UTF-8</span>
        <span className="hover:bg-white/10 px-1.5 py-0.5 rounded cursor-pointer transition-colors">LF</span>
        <span className="hover:bg-white/10 px-1.5 py-0.5 rounded cursor-pointer transition-colors">TypeScript</span>
        <span className="hover:bg-white/10 px-1.5 py-0.5 rounded cursor-pointer transition-colors">Ln 1, Col 1</span>
      </div>
    </div>
  );
}
