import { useState, useEffect, useRef } from "react";
import { Send, Sparkles, FileText, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CodeDiff } from "@/components/ui/code-diff";
import { chatManager, ChatMessage } from "@/lib/chatManager";
import { cn } from "@/lib/utils";

interface ChatPanelProps {
  currentFile: string | null;
}

export function ChatPanel({ currentFile }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = chatManager.subscribe(setMessages);
    return unsubscribe;
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const context = chatManager.buildContext(currentFile);
      await chatManager.sendMessage(userInput, context);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyChange = (messageId: string, changeId: string) => {
    chatManager.applyCodeChange(messageId, changeId);
  };

  const handleRejectChange = (messageId: string, changeId: string) => {
    chatManager.rejectCodeChange(messageId, changeId);
  };

  const handleNewChat = () => {
    chatManager.clearHistory();
  };

  return (
    <div className="flex flex-col h-full bg-chat-bg border-l border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-[13px] font-semibold">AI Assistant</span>
        </div>
        <div className="flex items-center gap-2">
          {currentFile && (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <FileText className="w-3 h-3" />
              <span className="truncate max-w-[120px]">{currentFile.split("/").pop()}</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNewChat}
            className="h-7 px-2 text-[11px] hover:bg-muted"
            title="New Chat"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            New Chat
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-8 px-4 text-muted-foreground text-[13px]">
              <Sparkles className="w-8 h-8 mx-auto mb-3 text-primary/50" />
              <p className="font-medium text-foreground mb-3">I can help you with your code</p>
              <div className="text-left space-y-2 text-[12px] max-w-xs mx-auto">
                <p className="opacity-70">Try asking me to:</p>
                <ul className="space-y-1 pl-4">
                  <li className="opacity-70">• "Make the description more detailed"</li>
                  <li className="opacity-70">• "Add error handling to this code"</li>
                  <li className="opacity-70">• "Fix the typo in line 5"</li>
                  <li className="opacity-70">• "Improve the function comments"</li>
                </ul>
                <p className="opacity-50 mt-3 text-[11px]">I'll automatically create edits you can accept or reject</p>
              </div>
            </div>
          )}
          
          {messages.map((message) => (
            <div key={message.id} className="space-y-2">
              <div
                className={cn(
                  "flex gap-2",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-lg p-3 text-[13px]",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/40 text-foreground border border-border/50"
                  )}
                >
                  <div className="whitespace-pre-wrap break-words leading-relaxed">
                    {message.content.replace(/```filepath:.*?\n[\s\S]*?```/g, '')}
                  </div>
                  
                  {message.fileContext && message.fileContext.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border/30 text-[11px] text-muted-foreground flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {message.fileContext.join(", ")}
                    </div>
                  )}
                </div>
              </div>

              {/* Code Changes */}
              {message.codeChanges && message.codeChanges.length > 0 && (
                <div className="pl-4">
                  {message.codeChanges.map((change) => (
                    <CodeDiff
                      key={change.id}
                      filePath={change.filePath}
                      oldContent={change.oldContent}
                      newContent={change.newContent}
                      applied={change.applied}
                      onAccept={() => handleApplyChange(message.id, change.id)}
                      onReject={() => handleRejectChange(message.id, change.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2 justify-start">
              <div className="bg-muted/40 border border-border/50 rounded-lg p-3 text-[13px] flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-muted-foreground">Thinking...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={currentFile ? "Ask me to modify this file..." : "Ask me anything..."}
            disabled={isLoading}
            className="flex-1 bg-input border border-border rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 placeholder:text-muted-foreground/50"
          />
          <Button 
            onClick={handleSend} 
            size="sm" 
            className="px-3 h-9"
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        {currentFile && (
          <div className="mt-2 text-[11px] text-muted-foreground flex items-center gap-1">
            <FileText className="w-3 h-3" />
            <span>Editing: {currentFile}</span>
          </div>
        )}
      </div>
    </div>
  );
}
