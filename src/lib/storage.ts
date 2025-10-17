// Local storage manager for project files and state
export interface ProjectFile {
  name: string;
  content: string;
  path: string;
}

export interface ProjectState {
  projectName: string;
  files: Record<string, string>;
  lastWinner?: {
    model: string;
    timestamp: string;
  };
}

const STORAGE_KEY = "phronos_project";

export const storage = {
  saveProject(state: ProjectState): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  },

  loadProject(): ProjectState | null {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  },

  clearProject(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  saveFile(path: string, content: string): void {
    const project = this.loadProject();
    if (project) {
      project.files[path] = content;
      this.saveProject(project);
    }
  },

  getFile(path: string): string | null {
    const project = this.loadProject();
    return project?.files[path] || null;
  },

  deleteFile(path: string): void {
    const project = this.loadProject();
    if (project) {
      delete project.files[path];
      this.saveProject(project);
    }
  },

  listFiles(): string[] {
    const project = this.loadProject();
    return project ? Object.keys(project.files) : [];
  },
};
