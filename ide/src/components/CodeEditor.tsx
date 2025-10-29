import { useEffect, useState, useRef } from "react";
import { projectManager } from "@/lib/projectManager";
import { storage } from "@/lib/storage";
import { toast } from "@/hooks/use-toast";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-python";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-json";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-yaml";
import "prismjs/themes/prism-tomorrow.css";

interface CodeEditorProps {
  filePath: string | null;
}

const getLanguageFromFilePath = (filePath: string): string => {
  const ext = filePath.split(".").pop()?.toLowerCase();
  
  const languageMap: Record<string, string> = {
    py: "python",
    js: "javascript",
    jsx: "jsx",
    ts: "typescript",
    tsx: "tsx",
    md: "markdown",
    json: "json",
    sh: "bash",
    bash: "bash",
    yml: "yaml",
    yaml: "yaml",
    nix: "bash", // Close enough for nix files
  };
  
  return languageMap[ext || ""] || "python";
};

export function CodeEditor({ filePath }: CodeEditorProps) {
  const [content, setContent] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const isExternalChange = useRef(false);

  // Load file when filePath changes
  useEffect(() => {
    if (filePath) {
      const fileContent = projectManager.getFile(filePath);
      setContent(fileContent || "");
      setHasChanges(false);
    }
  }, [filePath]);

  // Listen for external file changes
  useEffect(() => {
    const unsubscribe = storage.onFileChange((changedPath, newContent) => {
      // Only update if it's the currently open file and we don't have unsaved changes
      if (changedPath === filePath && !hasChanges) {
        isExternalChange.current = true;
        setContent(newContent);
        // Silently update the file content without showing toast
      }
    });

    return unsubscribe;
  }, [filePath, hasChanges]);

  useEffect(() => {
    const handleSave = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (filePath && hasChanges) {
          // Mark this as our own save to avoid showing "external update" toast
          isExternalChange.current = false;
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

  const handleChange = (newContent: string) => {
    setContent(newContent);
    setHasChanges(true);
  };

  const highlight = (code: string) => {
    if (!filePath) return code;
    const language = getLanguageFromFilePath(filePath);
    try {
      return Prism.highlight(code, Prism.languages[language], language);
    } catch {
      return code;
    }
  };

  if (!filePath) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        Select a file to edit
      </div>
    );
  }

  const lineCount = content.split('\n').length;

  return (
    <div className="h-full bg-code-bg overflow-auto flex">
      {/* Line Numbers */}
      <div 
        className="flex-shrink-0 bg-[hsl(var(--line-number-bg))] text-[hsl(var(--line-number))] select-none pt-3 pb-3 pr-3 pl-4"
        style={{
          fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          fontSize: 14,
          lineHeight: 1.6,
          textAlign: 'right',
          minWidth: '50px',
          borderRight: '1px solid hsl(var(--border))',
        }}
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i + 1} style={{ height: '22.4px' }}>
            {i + 1}
          </div>
        ))}
      </div>
      
      {/* Code Editor */}
      <div className="flex-1">
        <Editor
          value={content}
          onValueChange={handleChange}
          highlight={highlight}
          padding={12}
          style={{
            fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            fontSize: 14,
            lineHeight: 1.6,
            minHeight: "100%",
            backgroundColor: "hsl(var(--code-bg))",
            color: "hsl(var(--foreground))",
          }}
          textareaClassName="focus:outline-none"
          preClassName="language-python"
        />
      </div>
    </div>
  );
}
