import { Button } from "./button";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeDiffProps {
  filePath: string;
  oldContent: string;
  newContent: string;
  applied: boolean;
  onAccept: () => void;
  onReject: () => void;
}

export function CodeDiff({
  filePath,
  oldContent,
  newContent,
  applied,
  onAccept,
  onReject,
}: CodeDiffProps) {
  const oldLines = oldContent.split("\n");
  const newLines = newContent.split("\n");

  // Simple line-by-line diff (for a real implementation, use a diff library)
  const getDiffLines = () => {
    const maxLines = Math.max(oldLines.length, newLines.length);
    const diffLines: Array<{
      type: "unchanged" | "removed" | "added";
      oldLine?: string;
      newLine?: string;
      lineNum: number;
    }> = [];

    for (let i = 0; i < maxLines; i++) {
      const oldLine = oldLines[i];
      const newLine = newLines[i];

      if (oldLine === newLine) {
        diffLines.push({ type: "unchanged", oldLine, lineNum: i + 1 });
      } else if (oldLine && !newLine) {
        diffLines.push({ type: "removed", oldLine, lineNum: i + 1 });
      } else if (!oldLine && newLine) {
        diffLines.push({ type: "added", newLine, lineNum: i + 1 });
      } else {
        // Both exist but different
        if (oldLine) {
          diffLines.push({ type: "removed", oldLine, lineNum: i + 1 });
        }
        if (newLine) {
          diffLines.push({ type: "added", newLine, lineNum: i + 1 });
        }
      }
    }

    return diffLines;
  };

  const diffLines = getDiffLines();

  return (
    <div className="border border-border/50 rounded-md overflow-hidden my-2">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/40 border-b border-border/50">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-mono text-muted-foreground">
            {filePath}
          </span>
          {applied && (
            <span className="text-[11px] text-success font-medium">Applied</span>
          )}
        </div>
        {!applied && (
          <div className="flex gap-1.5">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-[12px] gap-1 hover:bg-success/20 hover:text-success"
              onClick={onAccept}
            >
              <Check className="w-3 h-3" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-[12px] gap-1 hover:bg-destructive/20 hover:text-destructive"
              onClick={onReject}
            >
              <X className="w-3 h-3" />
              Reject
            </Button>
          </div>
        )}
      </div>

      {/* Diff Content */}
      <div className="bg-code-bg overflow-x-auto max-h-96">
        <div className="font-mono text-[12px]">
          {diffLines.map((line, idx) => (
            <div
              key={idx}
              className={cn(
                "px-3 py-0.5 leading-relaxed",
                line.type === "removed" && "bg-destructive/10 text-destructive/90",
                line.type === "added" && "bg-success/10 text-success/90",
                line.type === "unchanged" && "text-muted-foreground/70"
              )}
            >
              <span className="inline-block w-8 text-right mr-3 select-none opacity-40 text-[11px]">
                {line.lineNum}
              </span>
              <span className="inline-block w-4 select-none font-semibold">
                {line.type === "removed" && "-"}
                {line.type === "added" && "+"}
                {line.type === "unchanged" && " "}
              </span>
              {line.oldLine || line.newLine || ""}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

