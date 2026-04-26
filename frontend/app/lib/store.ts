import type { Campaign, CampaignRequest } from "./types";

const CAMPAIGN_KEY = "blaze_ugc_campaign";
const CONFIG_KEY   = "blaze_ugc_config";

export function saveCampaign(data: Campaign): void {
  try { sessionStorage.setItem(CAMPAIGN_KEY, JSON.stringify(data)); } catch {}
}

export function loadCampaign(): Campaign | null {
  try {
    const raw = sessionStorage.getItem(CAMPAIGN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveConfig(config: Partial<CampaignRequest>): void {
  try {
    const existing = loadConfig();
    sessionStorage.setItem(CONFIG_KEY, JSON.stringify({ ...existing, ...config }));
  } catch {}
}

export function loadConfig(): Partial<CampaignRequest> {
  try {
    const raw = sessionStorage.getItem(CONFIG_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function clearConfig(): void {
  try { sessionStorage.removeItem(CONFIG_KEY); } catch {}
}
