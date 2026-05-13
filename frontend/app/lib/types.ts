export interface CompanyOption {
  identifier: string;
  name: string;
  type: string;
  description: string;
}

export interface CompanyProfile {
  identifier: string;
  name: string;
  type: string;
  description: string;
  usp: string;
  key_facts: string[];
  url?: string;
}

export interface WizardOption {
  label: string;
  value: string;
}

export interface WizardField {
  id: string;
  label: string;
  description?: string;
  options: WizardOption[];
}

export interface WizardStep {
  id: string;
  title: string;
  fields: WizardField[];
}

export interface WizardConfig {
  steps: WizardStep[];
}

export interface CreativeBrief {
  vibe: string;
  setup: string;
  props: string[];
  hook_ideas: string[];
}

export interface Script {
  id: number;
  title: string;
  angle: string;
  hook: string;
  script: string;
  scene_breakdown: string[];
  cta: string;
  creator_direction: string;
  hashtags: string[];
  estimated_duration: string;
  emotion_trigger: string;
}

export interface ExperimentPlan {
  hypothesis: string;
  test_design: string;
  primary_metric: string;
  metrics: string[];
  winning_signal: string;
  timeline: string;
}

export interface Campaign {
  campaign_name: string;
  target_insight: string;
  creative_brief: CreativeBrief;
  scripts: Script[];
  experiment_plan: ExperimentPlan;
  company?: CompanyProfile;
  wizard_answers?: Record<string, string>;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
