import { useState, useEffect } from "react";
import { ChevronRight, ChevronDown, File, Folder, FilePlus, FolderPlus, Trash2, MoreHorizontal } from "lucide-react";
import { projectManager } from "@/lib/projectManager";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

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
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const [contextMenuFile, setContextMenuFile] = useState<string | null>(null);

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

  const handleNewFile = () => {
    if (newFileName.trim()) {
      projectManager.createFile(newFileName.trim(), "");
      setNewFileName("");
      setShowNewFileDialog(false);
      loadFileTree();
    }
  };

  const handleDeleteFile = () => {
    if (fileToDelete) {
      projectManager.deleteFile(fileToDelete);
      setFileToDelete(null);
      setShowDeleteDialog(false);
      loadFileTree();
    }
  };

  const confirmDelete = (path: string) => {
    setFileToDelete(path);
    setShowDeleteDialog(true);
  };

  const renderNode = (node: FileNode, depth = 0) => {
    const isExpanded = expanded.has(node.path);
    const isSelected = selectedFile === node.path;

    return (
      <div key={node.path}>
        <div
          className={cn(
            "group flex items-center gap-1.5 px-2 py-0.5 cursor-pointer hover:bg-sidebar-hover text-sidebar-foreground text-[13px] rounded-sm mx-1 transition-colors relative",
            isSelected && "bg-sidebar-hover"
          )}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
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
                <ChevronDown className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              ) : (
                <ChevronRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              )}
              <Folder className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            </>
          ) : (
            <>
              <span className="w-3 flex-shrink-0"></span>
              <File className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            </>
          )}
          <span className="truncate flex-1">{node.name}</span>
          
          {node.type === "file" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <button className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-muted/30 rounded transition-opacity">
                  <MoreHorizontal className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmDelete(node.path);
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-3 h-3 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        {node.type === "directory" && isExpanded && node.children && (
          <div>{node.children.map((child) => renderNode(child, depth + 1))}</div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with Actions */}
      <div className="px-3 py-2.5 border-b border-border flex items-center justify-between">
        <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Explorer
        </h2>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setShowNewFileDialog(true)}
            className="p-1 hover:bg-sidebar-hover rounded transition-colors"
            title="New File"
          >
            <FilePlus className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button
            onClick={() => {
              const folderName = prompt("Enter folder name:");
              if (folderName) {
                projectManager.createFile(`${folderName}/.gitkeep`, "");
                loadFileTree();
              }
            }}
            className="p-1 hover:bg-sidebar-hover rounded transition-colors"
            title="New Folder"
          >
            <FolderPlus className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto">
        {tree.length === 0 ? (
          <div className="p-3 text-[13px] text-muted-foreground">
            No files yet. Run <code className="text-primary text-[13px] px-1 py-0.5 bg-muted/30 rounded">phronos init</code>
          </div>
        ) : (
          <div className="py-1.5">{tree.map((node) => renderNode(node))}</div>
        )}
      </div>

      {/* New File Dialog */}
      <AlertDialog open={showNewFileDialog} onOpenChange={setShowNewFileDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create New File</AlertDialogTitle>
            <AlertDialogDescription>
              Enter the file name (with extension)
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="example.py"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleNewFile();
            }}
            autoFocus
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleNewFile}>Create</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{fileToDelete}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFile} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
