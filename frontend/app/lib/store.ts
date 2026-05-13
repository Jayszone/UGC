import type { Campaign, CompanyProfile, WizardConfig } from "./types";

const CAMPAIGN_KEY      = "ugc_campaign";
const COMPANY_KEY       = "ugc_company";
const WIZARD_CONFIG_KEY = "ugc_wizard_config";
const WIZARD_ANS_KEY    = "ugc_wizard_answers";

// ── Campaign ──────────────────────────────────────────────────────────────────
export function saveCampaign(data: Campaign): void {
  try { sessionStorage.setItem(CAMPAIGN_KEY, JSON.stringify(data)); } catch {}
}
export function loadCampaign(): Campaign | null {
  try { const r = sessionStorage.getItem(CAMPAIGN_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
}

// ── Company ───────────────────────────────────────────────────────────────────
export function saveCompany(c: CompanyProfile): void {
  try { sessionStorage.setItem(COMPANY_KEY, JSON.stringify(c)); } catch {}
}
export function loadCompany(): CompanyProfile | null {
  try { const r = sessionStorage.getItem(COMPANY_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
}

// ── Wizard config ─────────────────────────────────────────────────────────────
export function saveWizardConfig(cfg: WizardConfig): void {
  try { sessionStorage.setItem(WIZARD_CONFIG_KEY, JSON.stringify(cfg)); } catch {}
}
export function loadWizardConfig(): WizardConfig | null {
  try { const r = sessionStorage.getItem(WIZARD_CONFIG_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
}

// ── Wizard answers ────────────────────────────────────────────────────────────
export function saveWizardAnswers(ans: Record<string, string>): void {
  try { sessionStorage.setItem(WIZARD_ANS_KEY, JSON.stringify(ans)); } catch {}
}
export function loadWizardAnswers(): Record<string, string> {
  try { const r = sessionStorage.getItem(WIZARD_ANS_KEY); return r ? JSON.parse(r) : {}; } catch { return {}; }
}
export function saveWizardAnswer(fieldId: string, value: string): void {
  saveWizardAnswers({ ...loadWizardAnswers(), [fieldId]: value });
}

// ── Clear ─────────────────────────────────────────────────────────────────────
export function clearSession(): void {
  try {
    [CAMPAIGN_KEY, COMPANY_KEY, WIZARD_CONFIG_KEY, WIZARD_ANS_KEY].forEach(k => sessionStorage.removeItem(k));
  } catch {}
}

// Legacy alias
export const clearConfig = clearSession;
