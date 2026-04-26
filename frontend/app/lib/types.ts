export interface CampaignRequest {
  corridor: string;
  audience: string;
  pain_point: string;
  tone: string;
  platform: string;
  campaign_goal: string;
  number_of_scripts: number;
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
  corridor_context: string;
  scripts: Script[];
  experiment_plan: ExperimentPlan;
  config?: CampaignRequest;
}
