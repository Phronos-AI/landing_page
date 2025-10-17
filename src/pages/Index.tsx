import { useState } from "react";
import { FileTree } from "@/components/FileTree";
import { CodeEditor } from "@/components/CodeEditor";
import { Terminal } from "@/components/Terminal";
import { ActivityBar } from "@/components/ActivityBar";
import { ChatPanel } from "@/components/ChatPanel";
import { StatusBar } from "@/components/StatusBar";
import { TabBar } from "@/components/TabBar";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"explorer" | "search" | "git" | "debug" | "chat">("explorer");
  const [openTabs, setOpenTabs] = useState<Array<{ path: string; name: string }>>([]);

  const handleFileSelect = (path: string) => {
    setSelectedFile(path);
    const fileName = path.split("/").pop() || path;
    
    if (!openTabs.find((tab) => tab.path === path)) {
      setOpenTabs((prev) => [...prev, { path, name: fileName }]);
    }
  };

  const handleTabClose = (path: string) => {
    setOpenTabs((prev) => prev.filter((tab) => tab.path !== path));
    if (selectedFile === path) {
      const remainingTabs = openTabs.filter((tab) => tab.path !== path);
      setSelectedFile(remainingTabs.length > 0 ? remainingTabs[0].path : null);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-background text-foreground">
      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Activity Bar */}
        <ActivityBar activeView={activeView} onViewChange={setActiveView} />

        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* Sidebar */}
          <ResizablePanel defaultSize={15} minSize={10} maxSize={25}>
            <div className="h-full bg-sidebar border-r border-border overflow-hidden flex flex-col">
              <div className="px-3 py-2 border-b border-border">
                <h2 className="text-xs font-semibold text-sidebar-foreground uppercase tracking-wide">
                  {activeView === "explorer" && "Explorer"}
                  {activeView === "search" && "Search"}
                  {activeView === "git" && "Source Control"}
                  {activeView === "debug" && "Run and Debug"}
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto">
                {activeView === "explorer" && (
                  <FileTree onFileSelect={handleFileSelect} selectedFile={selectedFile} />
                )}
                {activeView !== "explorer" && (
                  <div className="p-3 text-xs text-muted-foreground">
                    {activeView} panel - Coming soon
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Main Editor Area */}
          <ResizablePanel defaultSize={60}>
            <ResizablePanelGroup direction="vertical">
              {/* Editor */}
              <ResizablePanel defaultSize={65} minSize={30}>
                <div className="flex flex-col h-full">
                  <TabBar
                    tabs={openTabs}
                    activeTab={selectedFile}
                    onTabClick={setSelectedFile}
                    onTabClose={handleTabClose}
                  />
                  <div className="flex-1 overflow-hidden">
                    <CodeEditor filePath={selectedFile} />
                  </div>
                </div>
              </ResizablePanel>

              <ResizableHandle />

              {/* Terminal */}
              <ResizablePanel defaultSize={35} minSize={20}>
                <Terminal />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle />

          {/* AI Chat Panel */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
            <ChatPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Status Bar */}
      <StatusBar />
    </div>
  );
};

export default Index;
