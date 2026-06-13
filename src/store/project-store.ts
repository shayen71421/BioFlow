'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Project } from '@/types/sequence';
import { generateId } from '@/lib/utils';

interface ProjectState {
  projects: Project[];
  activeProjectId: string | null;
  recentProjects: string[];

  createProject: (name: string, description?: string) => string;
  deleteProject: (id: string) => void;
  saveProject: (id: string, workflow: string, sequenceIds: string[]) => void;
  loadProject: (id: string) => Project | null;
  getActiveProject: () => Project | null;
  setActiveProject: (id: string | null) => void;
  getRecentProjects: () => Project[];
  exportProject: (id: string) => string;
  importProject: (json: string) => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      activeProjectId: null,
      recentProjects: [],

      createProject: (name: string, description: string = '') => {
        const id = generateId();
        const now = Date.now();
        const project: Project = {
          id,
          name,
          description,
          createdAt: now,
          updatedAt: now,
          workflow: '',
          sequenceIds: [],
        };
        set((s) => ({
          projects: [...s.projects, project],
          activeProjectId: id,
          recentProjects: [id, ...s.recentProjects.filter((pid) => pid !== id)].slice(0, 10),
        }));
        return id;
      },

      deleteProject: (id: string) => {
        set((s) => ({
          projects: s.projects.filter((p) => p.id !== id),
          activeProjectId: s.activeProjectId === id ? null : s.activeProjectId,
          recentProjects: s.recentProjects.filter((pid) => pid !== id),
        }));
      },

      saveProject: (id: string, workflow: string, sequenceIds: string[]) => {
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, workflow, sequenceIds, updatedAt: Date.now() } : p,
          ),
          recentProjects: [id, ...s.recentProjects.filter((pid) => pid !== id)].slice(0, 10),
        }));
      },

      loadProject: (id: string) => {
        const project = get().projects.find((p) => p.id === id);
        if (project) {
          set({ activeProjectId: id });
          return project;
        }
        return null;
      },

      getActiveProject: () => {
        const { projects, activeProjectId } = get();
        if (!activeProjectId) return null;
        return projects.find((p) => p.id === activeProjectId) || null;
      },

      setActiveProject: (id: string | null) => {
        set({ activeProjectId: id });
      },

      getRecentProjects: () => {
        const { projects, recentProjects } = get();
        return recentProjects
          .map((id) => projects.find((p) => p.id === id))
          .filter((p): p is Project => p !== undefined);
      },

      exportProject: (id: string) => {
        const project = get().projects.find((p) => p.id === id);
        if (!project) return '{}';
        return JSON.stringify(project, null, 2);
      },

      importProject: (json: string) => {
        try {
          const project = JSON.parse(json) as Project;
          if (project && project.name) {
            project.id = generateId();
            project.updatedAt = Date.now();
            set((s) => ({
              projects: [...s.projects, project],
              activeProjectId: project.id,
            }));
          }
        } catch {
          throw new Error('Invalid project JSON');
        }
      },
    }),
    {
      name: 'bioflow-projects',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        projects: state.projects,
        activeProjectId: state.activeProjectId,
        recentProjects: state.recentProjects,
      }),
    },
  ),
);
