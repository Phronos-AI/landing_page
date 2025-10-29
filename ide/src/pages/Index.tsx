import { useState, useEffect } from "react";
import { FileTree } from "@/components/FileTree";
import { CodeEditor } from "@/components/CodeEditor";
import { Terminal } from "@/components/Terminal";
import { ActivityBar } from "@/components/ActivityBar";
import { ChatPanel } from "@/components/ChatPanel";
import { StatusBar } from "@/components/StatusBar";
import { TabBar } from "@/components/TabBar";
import { LandingPage } from "@/components/LandingPage";
import { chatManager } from "@/lib/chatManager";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

const Index = () => {
  const [projectName, setProjectName] = useState<string | null>(null);
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

  const handleCloseAllTabs = () => {
    setOpenTabs([]);
    setSelectedFile(null);
  };

  const handleCreateProject = (name: string) => {
    // Clear any existing project data from localStorage
    localStorage.removeItem("phronos_project");
    
    // Clear chat history
    chatManager.clearHistory();
    
    // Close all tabs
    setOpenTabs([]);
    setSelectedFile(null);
    
    // Set the new project name
    setProjectName(name);
    sessionStorage.setItem("phronos_project_name", name);
  };

  // Check for existing project on mount (but don't persist across refresh)
  useEffect(() => {
    const savedProject = sessionStorage.getItem("phronos_project_name");
    if (savedProject) {
      setProjectName(savedProject);
    }
  }, []);

  // Show landing page if no project
  if (!projectName) {
    return <LandingPage onCreateProject={handleCreateProject} />;
  }

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
              {activeView === "explorer" ? (
                <FileTree onFileSelect={handleFileSelect} selectedFile={selectedFile} />
              ) : (
                <>
                  <div className="px-3 py-2.5 border-b border-border">
                    <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {activeView === "search" && "Search"}
                      {activeView === "git" && "Source Control"}
                      {activeView === "debug" && "Run and Debug"}
                    </h2>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 text-[13px] text-muted-foreground">
                    {activeView} panel - Coming soon
                  </div>
                </>
              )}
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
                <Terminal onCloseAllTabs={handleCloseAllTabs} projectName={projectName} />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle />

          {/* AI Chat Panel */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
            <ChatPanel currentFile={selectedFile} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Status Bar */}
      <StatusBar />
    </div>
  );
};

export default Index;
