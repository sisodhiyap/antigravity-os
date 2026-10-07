"use client";

import { create } from "zustand";
import { PresentationProject, Slide, VisualDirection, SlideLayout } from "../types";
import { PresentXDesignSystem } from "../engine/PresentXDesignSystem";
import { PresentXAuditor } from "../engine/PresentXAuditor";

interface PresentXStore {
  project: PresentationProject | null;
  activeSlideIndex: number;
  isGenerating: boolean;
  generationStep: string;
  isPresenting: boolean;
  history: PresentationProject[];
  historyIndex: number;

  // Actions
  setProject: (project: PresentationProject) => void;
  setActiveSlideIndex: (index: number) => void;
  setIsGenerating: (isGenerating: boolean, step?: string) => void;
  setIsPresenting: (isPresenting: boolean) => void;
  
  // Slide modifications
  updateActiveSlide: (updates: Partial<Slide>) => void;
  addSlide: (layout?: SlideLayout) => void;
  deleteSlide: (index: number) => void;
  reorderSlides: (startIndex: number, endIndex: number) => void;
  changeVisualDirection: (direction: VisualDirection) => void;

  // Undo / Redo
  undo: () => void;
  redo: () => void;
}

export const usePresentXStore = create<PresentXStore>((set, get) => ({
  project: null,
  activeSlideIndex: 0,
  isGenerating: false,
  generationStep: "",
  isPresenting: false,
  history: [],
  historyIndex: -1,

  setProject: (project) => {
    set({
      project,
      activeSlideIndex: 0,
      history: [project],
      historyIndex: 0,
    });
  },

  setActiveSlideIndex: (index) => {
    const { project } = get();
    if (!project) return;
    const bounded = Math.max(0, Math.min(index, project.slides.length - 1));
    set({ activeSlideIndex: bounded });
  },

  setIsGenerating: (isGenerating, step = "") => {
    set({ isGenerating, generationStep: step });
  },

  setIsPresenting: (isPresenting) => {
    set({ isPresenting });
  },

  updateActiveSlide: (updates) => {
    const { project, activeSlideIndex, history, historyIndex } = get();
    if (!project || !project.slides[activeSlideIndex]) return;

    const newSlides = [...project.slides];
    const current = newSlides[activeSlideIndex]!;
    newSlides[activeSlideIndex] = {
      ...current,
      ...updates,
      headline: updates.headline !== undefined ? updates.headline : current.headline,
      layout: updates.layout !== undefined ? updates.layout : current.layout,
      visualStrategy: updates.visualStrategy !== undefined ? updates.visualStrategy : current.visualStrategy,
      speakerNotes: updates.speakerNotes !== undefined ? updates.speakerNotes : current.speakerNotes,
      citations: updates.citations !== undefined ? updates.citations : current.citations,
      facts: updates.facts !== undefined ? updates.facts : current.facts,
      designTokens: updates.designTokens !== undefined ? updates.designTokens : current.designTokens,
    };

    const updatedProject: PresentationProject = {
      ...project,
      slides: newSlides,
      updatedAt: new Date().toISOString(),
      version: project.version + 1,
    };

    updatedProject.qualityAudit = PresentXAuditor.auditPresentation(updatedProject);

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(updatedProject);

    set({
      project: updatedProject,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  addSlide: (layout = "TITLE_CONTENT") => {
    const { project, activeSlideIndex } = get();
    if (!project) return;

    const newSlide: Slide = {
      id: `slide_${Date.now()}`,
      slideNumber: project.slides.length + 1,
      layout,
      headline: "New Key Strategic Section",
      subheadline: "Supporting context and takeaways",
      bodyContent: "Describe the core thesis and strategic objectives for this topic.",
      bulletPoints: ["Primary impact point", "Secondary operational driver", "Defensive moat"],
      visualStrategy: "Clean balanced card composition",
      speakerNotes: "[Presenter Notes]: Guide the audience through key takeaways.",
      citations: ["PresentX Studio — V7 Grounded"],
      facts: [],
      designTokens: {},
    };

    const newSlides = [...project.slides];
    newSlides.splice(activeSlideIndex + 1, 0, newSlide);
    newSlides.forEach((s, idx) => { s.slideNumber = idx + 1; });

    const updatedProject: PresentationProject = {
      ...project,
      slides: newSlides,
      updatedAt: new Date().toISOString(),
      version: project.version + 1,
    };

    set({
      project: updatedProject,
      activeSlideIndex: activeSlideIndex + 1,
    });
  },

  deleteSlide: (index) => {
    const { project, activeSlideIndex } = get();
    if (!project || project.slides.length <= 1) return;

    const newSlides = project.slides.filter((_, i) => i !== index);
    newSlides.forEach((s, idx) => { s.slideNumber = idx + 1; });

    const newActiveIndex = Math.min(activeSlideIndex, newSlides.length - 1);

    const updatedProject: PresentationProject = {
      ...project,
      slides: newSlides,
      updatedAt: new Date().toISOString(),
      version: project.version + 1,
    };

    set({
      project: updatedProject,
      activeSlideIndex: newActiveIndex,
    });
  },

  reorderSlides: (startIndex, endIndex) => {
    const { project } = get();
    if (!project) return;

    const newSlides = [...project.slides];
    const [moved] = newSlides.splice(startIndex, 1);
    if (!moved) return;
    newSlides.splice(endIndex, 0, moved);
    newSlides.forEach((s, idx) => { s.slideNumber = idx + 1; });

    const updatedProject: PresentationProject = {
      ...project,
      slides: newSlides,
      updatedAt: new Date().toISOString(),
    };

    set({ project: updatedProject, activeSlideIndex: endIndex });
  },

  changeVisualDirection: (direction) => {
    const { project } = get();
    if (!project) return;

    const tokens = PresentXDesignSystem.getTokensForDirection(direction);
    const updatedProject: PresentationProject = {
      ...project,
      visualDirection: direction,
      designTokens: tokens,
      updatedAt: new Date().toISOString(),
    };

    set({ project: updatedProject });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      if (prev) {
        set({ project: prev, historyIndex: historyIndex - 1 });
      }
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      if (next) {
        set({ project: next, historyIndex: historyIndex + 1 });
      }
    }
  },
}));
