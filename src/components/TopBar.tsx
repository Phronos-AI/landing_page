import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings, Play, Zap } from "lucide-react";
import { openRouterClient } from "@/lib/openRouterClient";
import { toast } from "@/hooks/use-toast";

interface TopBarProps {
  onRunClick: () => void;
}

export function TopBar({ onRunClick }: TopBarProps) {
  const [apiKey, setApiKey] = useState(openRouterClient.getApiKey() || "");
  const [open, setOpen] = useState(false);

  const handleSaveApiKey = () => {
    openRouterClient.setApiKey(apiKey);
    setOpen(false);
    toast({
      title: "API Key saved",
      description: "OpenRouter API key has been configured successfully.",
    });
  };

  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold">Phronos IDE</h1>
        </div>
        <span className="text-xs text-muted-foreground">AI-Powered Development</span>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={onRunClick} variant="default" className="gap-2">
          <Play className="w-4 h-4" />
          Run Competition
        </Button>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">OpenRouter API Key</label>
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-or-..."
                />
                <p className="text-xs text-muted-foreground">
                  Get your API key from{" "}
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    openrouter.ai
                  </a>
                </p>
              </div>
              <Button onClick={handleSaveApiKey} className="w-full">
                Save Settings
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
