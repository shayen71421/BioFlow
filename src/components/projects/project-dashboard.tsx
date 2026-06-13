'use client';

import { useState } from 'react';
import { Plus, FolderOpen, Trash2, Download, Upload, Dna } from 'lucide-react';
import { useProjectStore } from '@/store/project-store';
import { useWorkflowStore } from '@/store/workflow-store';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function ProjectDashboard() {
  const projects = useProjectStore((s) => s.projects);
  const recentProjects = useProjectStore((s) => s.getRecentProjects());
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const createProject = useProjectStore((s) => s.createProject);
  const deleteProject = useProjectStore((s) => s.deleteProject);
  const saveProject = useProjectStore((s) => s.saveProject);
  const loadProject = useProjectStore((s) => s.loadProject);
  const exportProject = useProjectStore((s) => s.exportProject);
  const importProject = useProjectStore((s) => s.importProject);
  const setActiveProject = useProjectStore((s) => s.setActiveProject);

  const workflowExport = useWorkflowStore((s) => s.exportWorkflow);
  const importWorkflow = useWorkflowStore((s) => s.importWorkflow);

  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleCreate = () => {
    if (!newName.trim()) return;
    createProject(newName.trim(), newDesc.trim());
    setNewName('');
    setNewDesc('');
    setShowNew(false);
    toast.success('Project created');
  };

  const handleSave = () => {
    const active = useProjectStore.getState().getActiveProject();
    if (!active) {
      toast.error('No active project');
      return;
    }
    const workflow = workflowExport();
    saveProject(active.id, workflow, []);
    toast.success('Project saved');
  };

  const handleLoad = (id: string) => {
    const project = loadProject(id);
    if (project && project.workflow) {
      try {
        importWorkflow(project.workflow);
        toast.success(`Loaded project: ${project.name}`);
      } catch {
        toast.error('Failed to load workflow');
      }
    } else {
      setActiveProject(id);
      toast.success('Project opened');
    }
  };

  const handleExport = (id: string) => {
    const json = exportProject(id);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-${id}.bioflow.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Project exported');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          importProject(ev.target?.result as string);
          toast.success('Project imported');
        } catch {
          toast.error('Invalid project file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Projects</h2>
          <p className="text-sm text-muted-foreground">Manage your analysis projects</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={handleImport}>
            <Upload size={14} className="mr-1" />
            Import
          </Button>
          <Button size="sm" variant="primary" onClick={() => setShowNew(true)}>
            <Plus size={14} className="mr-1" />
            New Project
          </Button>
        </div>
      </div>

      {/* Active Project */}
      {(() => {
        const active = useProjectStore.getState().getActiveProject();
        if (!active) return null;
        return (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <FolderOpen size={18} className="text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">{active.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Updated {new Date(active.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={handleSave}>
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleExport(active.id)}>
                  <Download size={14} />
                </Button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Recent Projects */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-foreground">Recent Projects</h3>
        {recentProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
            <FolderOpen size={32} className="text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No projects yet</p>
            <p className="text-xs text-muted-foreground mt-1">Create a project to save your work</p>
            <Button size="sm" variant="primary" className="mt-4" onClick={() => setShowNew(true)}>
              <Plus size={14} className="mr-1" />
              New Project
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => handleLoad(project.id)}
                className={cn(
                  'group cursor-pointer rounded-xl border border-border bg-surface p-4 transition-all hover:border-primary/50 hover:shadow-md',
                  activeProjectId === project.id && 'border-primary/50 ring-1 ring-primary/30',
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background">
                    <Dna size={16} className="text-primary" />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProject(project.id);
                      toast.success('Project deleted');
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity rounded p-1 hover:bg-surface-hover"
                  >
                    <Trash2 size={12} className="text-muted-foreground hover:text-danger" />
                  </button>
                </div>
                <div className="mt-3">
                  <div className="text-sm font-medium text-foreground truncate">{project.name}</div>
                  {project.description && (
                    <div className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{project.description}</div>
                  )}
                  <div className="mt-2 text-[10px] text-muted-foreground font-mono">
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Project Dialog */}
      {showNew && (
        <Dialog open={showNew} onClose={() => setShowNew(false)}>
          <div className="space-y-4 p-4">
            <h3 className="text-base font-semibold text-foreground">New Project</h3>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Project name"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
            <Input
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Description (optional)"
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setShowNew(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" onClick={handleCreate} disabled={!newName.trim()}>
                Create
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}

function cn(...inputs: (string | false | null | undefined)[]) {
  return inputs.filter(Boolean).join(' ');
}
