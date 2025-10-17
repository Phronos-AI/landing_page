import { useState } from "react";
import { FileTree } from "@/components/FileTree";
import { CodeEditor } from "@/components/CodeEditor";
import { Terminal } from "@/components/Terminal";
import { TopBar } from "@/components/TopBar";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { terminal } from "@/lib/terminalRenderer";

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const handleRunClick = () => {
    terminal.addCommand("phronos run");
  };

  return (
    <div className="flex flex-col h-screen w-full bg-background">
      <TopBar onRunClick={handleRunClick} />

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Sidebar - File Tree */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <div className="h-full bg-sidebar border-r border-sidebar-border overflow-y-auto">
            <div className="p-4 border-b border-sidebar-border">
              <h2 className="text-sm font-semibold text-sidebar-foreground">Explorer</h2>
            </div>
            <FileTree onFileSelect={setSelectedFile} selectedFile={selectedFile} />
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* Main Content - Editor + Terminal */}
        <ResizablePanel defaultSize={80}>
          <ResizablePanelGroup direction="vertical">
            {/* Code Editor */}
            <ResizablePanel defaultSize={60} minSize={30}>
              <div className="h-full bg-card">
                <CodeEditor filePath={selectedFile} />
              </div>
            </ResizablePanel>

            <ResizableHandle />

            {/* Terminal */}
            <ResizablePanel defaultSize={40} minSize={20}>
              <Terminal />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Index;
