import { VisualDirection, PresentationType } from "./types";

export interface ProTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  slideCount: number;
  visualDirection: VisualDirection;
  presentationType: PresentationType;
  prompt: string;
  badge: string;
}

export const PRO_TEMPLATES: ProTemplate[] = [
  {
    id: "tpl_ai_creative_studio",
    name: "AI Creative Studio Vision",
    category: "Agency & Creative",
    description: "Transforming creative production workflows over the next 5 years with generative automation.",
    slideCount: 8,
    visualDirection: "CREATIVE",
    presentationType: "STORYTELLING",
    prompt: "Create an 8-slide presentation explaining how AI will transform creative agencies over the next five years.",
    badge: "Most Popular",
  },
  {
    id: "tpl_saas_investor_pitch",
    name: "SaaS Series A Investor Deck",
    category: "Fundraising",
    description: "Defensive technical moats, ARR growth metrics, market opportunity, and capital allocation strategy.",
    slideCount: 10,
    visualDirection: "CORPORATE",
    presentationType: "INVESTOR_DECK",
    prompt: "Create a 10-slide high-conviction investor pitch deck for an autonomous AI software platform.",
    badge: "Investor Ready",
  },
  {
    id: "tpl_healthcare_ux_case",
    name: "Healthcare UX Case Study",
    category: "Product & Design",
    description: "User research, accessibility compliance, workflow reduction, and patient outcome data.",
    slideCount: 8,
    visualDirection: "EDITORIAL",
    presentationType: "CASE_STUDY",
    prompt: "Create an 8-slide UX case study for an AI-assisted healthcare diagnostics application.",
    badge: "WCAG AA",
  },
  {
    id: "tpl_vfx_pipeline",
    name: "VFX Production Architecture",
    category: "Engineering & Technical",
    description: "Real-time rendering pipelines, USD asset integration, compute distribution, and GPU clustering.",
    slideCount: 8,
    visualDirection: "TECH",
    presentationType: "REPORT",
    prompt: "Create an 8-slide technical architecture overview for a real-time cloud VFX production pipeline.",
    badge: "Technical",
  },
  {
    id: "tpl_enterprise_ai_gov",
    name: "Enterprise Sovereign AI Governance",
    category: "Enterprise",
    description: "Zero-trust model routing, local hardware inference, data isolation, and cryptographic audit ledgers.",
    slideCount: 8,
    visualDirection: "FUTURISTIC",
    presentationType: "PITCH_DECK",
    prompt: "Create an 8-slide presentation on enterprise sovereign AI governance and zero-data-loss architecture.",
    badge: "Signature V7",
  },
  {
    id: "tpl_generative_ai_edu",
    name: "Generative AI Foundations",
    category: "Education & Workshop",
    description: "Multi-modal model architectures, diffusion mechanisms, reasoning DAGs, and practical deployment.",
    slideCount: 8,
    visualDirection: "ACADEMIC",
    presentationType: "EDUCATIONAL",
    prompt: "Create an 8-slide educational course deck on modern generative AI foundation models.",
    badge: "Academic",
  },
];
