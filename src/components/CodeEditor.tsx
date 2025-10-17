import { useEffect, useState } from "react";
import { projectManager } from "@/lib/projectManager";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
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

  const handleSave = () => {
    if (filePath) {
      projectManager.saveFile(filePath, content);
      setHasChanges(false);
      toast({
        title: "File saved",
        description: `${filePath} has been saved successfully.`,
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setHasChanges(true);
  };

  if (!filePath) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Select a file to edit
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
        <span className="text-sm font-medium">{filePath}</span>
        <Button
          onClick={handleSave}
          disabled={!hasChanges}
          size="sm"
          variant="default"
          className="gap-2"
        >
          <Save className="w-4 h-4" />
          Save
        </Button>
      </div>
      <textarea
        value={content}
        onChange={handleChange}
        className="flex-1 p-4 bg-code-bg text-foreground font-mono text-sm resize-none focus:outline-none"
        spellCheck={false}
      />
    </div>
  );
}
