import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LandingPageProps {
  onCreateProject: (projectName: string) => void;
}

export function LandingPage({ onCreateProject }: LandingPageProps) {
  const [projectName, setProjectName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = projectName.trim();
    
    if (!trimmedName) {
      setError("Please enter a project name");
      return;
    }
    
    if (trimmedName.length < 3) {
      setError("Project name must be at least 3 characters");
      return;
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmedName)) {
      setError("Project name can only contain letters, numbers, hyphens, and underscores");
      return;
    }
    
    onCreateProject(trimmedName);
  };

  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center">
      <div className="max-w-md w-full px-6">
        {/* Logo/Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">
            Phronos IDE
          </h1>
          <p className="text-muted-foreground text-sm">
            AI-powered competitive coding environment
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="projectName" className="text-sm font-medium text-foreground">
              Project Name
            </label>
            <Input
              id="projectName"
              type="text"
              value={projectName}
              onChange={(e) => {
                setProjectName(e.target.value);
                setError("");
              }}
              placeholder="my-awesome-project"
              className="h-12 bg-muted/10 border-border text-foreground placeholder:text-muted-foreground"
              autoFocus
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <Button 
            type="submit"
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base"
          >
            Create New Project
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-xs text-muted-foreground">
            Press Enter to create • Project stored locally in browser
          </p>
        </div>
      </div>
    </div>
  );
}

