import { useEffect, useState } from "react";
import { projectManager } from "@/lib/projectManager";
import { toast } from "@/hooks/use-toast";

interface CodeEditorProps {
  filePath: string | null;
}

export function CodeEditor({ filePath }: CodeEditorProps) {
  const [content, setContent] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (filePath) {
      const fileContent = projectManager.getFile(filePath);
      setContent(fileContent || "");
      setHasChanges(false);
    }
  }, [filePath]);

  useEffect(() => {
    const handleSave = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (filePath && hasChanges) {
          projectManager.saveFile(filePath, content);
          setHasChanges(false);
          toast({
            title: "File saved",
            description: `${filePath} saved`,
          });
        }
      }
    };

    window.addEventListener("keydown", handleSave);
    return () => window.removeEventListener("keydown", handleSave);
  }, [filePath, content, hasChanges]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setHasChanges(true);
  };

  if (!filePath) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        Select a file to edit
      </div>
    );
  }

  // Add line numbers
  const lines = content.split("\n");
  
  return (
    <div className="flex h-full bg-code-bg">
      {/* Line numbers */}
      <div className="py-3 px-2 bg-code-bg text-muted-foreground text-xs font-mono select-none border-r border-border/50">
        {lines.map((_, i) => (
          <div key={i} className="text-right pr-2 leading-[1.6]">
            {i + 1}
          </div>
        ))}
      </div>
      
      {/* Editor */}
      <textarea
        value={content}
        onChange={handleChange}
        className="flex-1 p-3 bg-code-bg text-foreground font-mono text-xs resize-none focus:outline-none leading-[1.6]"
        spellCheck={false}
        style={{ tabSize: 2 }}
      />
    </div>
  );
}
