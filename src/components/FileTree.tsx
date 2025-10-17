import { useState, useEffect } from "react";
import { ChevronRight, ChevronDown, File, Folder } from "lucide-react";
import { projectManager } from "@/lib/projectManager";
import { cn } from "@/lib/utils";

interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileNode[];
}

interface FileTreeProps {
  onFileSelect: (path: string) => void;
  selectedFile: string | null;
}

export function FileTree({ onFileSelect, selectedFile }: FileTreeProps) {
  const [tree, setTree] = useState<FileNode[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["tests", "src"]));

  useEffect(() => {
    loadFileTree();
    const interval = setInterval(loadFileTree, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadFileTree = () => {
    const files = projectManager.listFiles();
    const root = buildTree(files);
    setTree(root);
  };

  const buildTree = (paths: string[]): FileNode[] => {
    const root: FileNode[] = [];
    const map = new Map<string, FileNode>();

    paths.forEach((path) => {
      const parts = path.split("/");
      let currentPath = "";

      parts.forEach((part, index) => {
        const parentPath = currentPath;
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        if (!map.has(currentPath)) {
          const node: FileNode = {
            name: part,
            path: currentPath,
            type: index === parts.length - 1 ? "file" : "directory",
            children: index === parts.length - 1 ? undefined : [],
          };

          map.set(currentPath, node);

          if (parentPath) {
            const parent = map.get(parentPath);
            parent?.children?.push(node);
          } else {
            root.push(node);
          }
        }
      });
    });

    return root;
  };

  const toggleExpand = (path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const renderNode = (node: FileNode, depth = 0) => {
    const isExpanded = expanded.has(node.path);
    const isSelected = selectedFile === node.path;

    return (
      <div key={node.path}>
        <div
          className={cn(
            "flex items-center gap-1 px-2 py-0.5 cursor-pointer hover:bg-sidebar-hover text-sidebar-foreground",
            isSelected && "bg-sidebar-hover"
          )}
          style={{ paddingLeft: `${depth * 16 + 4}px` }}
          onClick={() => {
            if (node.type === "directory") {
              toggleExpand(node.path);
            } else {
              onFileSelect(node.path);
            }
          }}
        >
          {node.type === "directory" ? (
            <>
              {isExpanded ? (
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
              )}
              <Folder className="w-3 h-3 text-muted-foreground" />
            </>
          ) : (
            <File className="w-3 h-3 text-muted-foreground ml-4" />
          )}
          <span className="text-xs">{node.name}</span>
        </div>
        {node.type === "directory" && isExpanded && node.children && (
          <div>{node.children.map((child) => renderNode(child, depth + 1))}</div>
        )}
      </div>
    );
  };

  if (tree.length === 0) {
    return (
      <div className="p-3 text-xs text-muted-foreground">
        No files yet. Run <code className="text-primary text-xs">phronos init</code>
      </div>
    );
  }

  return <div className="py-1">{tree.map((node) => renderNode(node))}</div>;
}
