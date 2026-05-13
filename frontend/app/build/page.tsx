"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadCompany, loadWizardConfig, saveWizardAnswers, saveCampaign } from "../lib/store";
import type { CompanyProfile, WizardConfig, WizardStep, Campaign } from "../lib/types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8003";
const SCRIPT_COUNTS = [2, 3, 4, 5, 6];

const LOADING_MSGS = [
  "Analyzing your campaign brief...",
  "Researching your audience...",
  "Crafting script angles...",
  "Writing hooks...",
  "Adding creator direction...",
  "Finalizing your scripts...",
];

function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <div style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg, #FF2D55, #FFE234)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 15 }}>🎬</span>
      </div>
      <span style={{ fontSize: 15, fontWeight: 900, color: "#fff", letterSpacing: "-0.04em" }}>UGC Studio</span>
    </div>
  );
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
      {Array.from({ length: total }, (_, i) => i + 1).map(step => (
        <div key={step} style={{ display: "flex", alignItems: "center" }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%", fontSize: 11, fontWeight: 800,
            display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s",
            background: step < current ? "#FF2D55" : step === current ? "#FFE234" : "#1a1a1a",
            color: step < current ? "#fff" : step === current ? "#0a0a0a" : "#444",
            border: step === current ? "2px solid #FFE234" : "none",
          }}>
            {step < current ? "✓" : step}
          </div>
          {step < total && <div style={{ width: 36, height: 2, background: step < current ? "#FF2D55" : "#1a1a1a", transition: "background 0.2s" }} />}
        </div>
      ))}
    </div>
  );
}

function GeneratingScreen({ companyName }: { companyName: string }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => Math.min(i + 1, LOADING_MSGS.length - 1)), 1600);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40 }}>
      <div style={{ marginBottom: 48 }}><Logo /></div>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <p style={{ fontSize: 12, color: "#444", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 8px 0" }}>Creating scripts for</p>
        <h2 style={{ fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", margin: 0 }}>{companyName}</h2>
      </div>
      <div style={{ width: 40, height: 40, border: "3px solid #1a1a1a", borderTop: "3px solid #FF2D55", borderRadius: "50%", animation: "spin 0.7s linear infinite", marginBottom: 40 }} />
      <div style={{ maxWidth: 400, width: "100%", background: "#111", border: "1px solid #1a1a1a", borderRadius: 14, padding: "20px 24px" }}>
        {LOADING_MSGS.map((msg, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", opacity: i > idx ? 0.2 : 1, transition: "opacity 0.3s" }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, flexShrink: 0, transition: "background 0.3s",
              background: i < idx ? "#FF2D55" : i === idx ? "#FFE234" : "#1a1a1a",
              color: i < idx ? "#fff" : "#0a0a0a",
            }}>
              {i < idx ? "✓" : i + 1}
            </div>
            <span style={{ fontSize: 13, color: i === idx ? "#fff" : "#444" }}>{msg}</span>
          </div>
        ))}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function BuildPage() {
  const router = useRouter();
  const [company, setCompany]       = useState<CompanyProfile | null>(null);
  const [config, setConfig]         = useState<WizardConfig | null>(null);
  const [step, setStep]             = useState(0);
  const [answers, setAnswers]       = useState<Record<string, string>>({});
  const [scriptCount, setScriptCount] = useState(3);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const c = loadCompany(); const cfg = loadWizardConfig();
    if (!c || !cfg) { router.replace("/"); return; }
    setCompany(c); setConfig(cfg);
  }, [router]);

  if (!company || !config) return null;
  if (generating) return <GeneratingScreen companyName={company.name} />;

  const steps: WizardStep[] = config.steps ?? [];
  const total = steps.length;
  const cur: WizardStep = steps[step];
  const isLast = step === total - 1;
  const stepOk = cur?.fields.every(f => answers[f.id] !== undefined) ?? false;

  function getGridCols(n: number) {
    if (n <= 3) return "1fr 1fr";
    if (n <= 6) return "1fr 1fr 1fr";
    return "1fr 1fr 1fr 1fr";
  }

  async function handleContinue() {
    if (isLast) {
      setGenerating(true);
      saveWizardAnswers(answers);
      try {
        const resp = await fetch(`${API}/api/generate`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ company, wizard_answers: answers, number_of_scripts: scriptCount }),
        });
        if (!resp.ok) { const e = await resp.json().catch(() => ({ detail: `HTTP ${resp.status}` })); throw new Error(e?.detail ?? `HTTP ${resp.status}`); }
        const data: Campaign = await resp.json();
        saveCampaign({ ...data, company: company ?? undefined, wizard_answers: answers });
        router.push("/studio");
      } catch (e) { setGenerating(false); alert(`Generation failed.\n\n${e instanceof Error ? e.message : e}`); }
    } else {
      setStep(s => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid #1a1a1a", padding: "0 32px", height: 62, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "#0a0a0a", zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Logo />
          <span style={{ color: "#222" }}>/</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{company.name}</span>
          <span style={{ fontSize: 11, color: "#555", background: "#111", border: "1px solid #1a1a1a", padding: "2px 8px", borderRadius: 99 }}>{company.type}</span>
        </div>
        <StepIndicator current={step + 1} total={total} />
      </header>

      {/* Content */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "56px 32px 120px" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#444", textTransform: "uppercase", margin: "0 0 10px 0" }}>Step {step + 1} of {total}</p>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", margin: "0 0 48px 0" }}>{cur.title}</h1>

        {cur.fields.map((field, fi) => (
          <div key={field.id} style={{ marginBottom: fi < cur.fields.length - 1 ? 52 : 0 }}>
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", margin: "0 0 4px 0" }}>{field.label}</p>
              {field.description && <p style={{ fontSize: 13, color: "#555", margin: 0 }}>{field.description}</p>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: getGridCols(field.options.length), gap: 10 }}>
              {field.options.map(opt => {
                const sel = answers[field.id] === opt.value;
                return (
                  <button key={opt.value} onClick={() => setAnswers(p => ({ ...p, [field.id]: opt.value }))}
                    style={{
                      background: sel ? "#FFE234" : "#111",
                      border: `1.5px solid ${sel ? "#FFE234" : "#1a1a1a"}`,
                      borderRadius: 12, padding: "14px 16px", textAlign: "left", cursor: "pointer",
                      fontSize: 13, fontWeight: sel ? 800 : 500,
                      color: sel ? "#0a0a0a" : "#888",
                      transition: "all 0.15s", outline: "none",
                      boxShadow: sel ? "0 4px 16px rgba(255,226,52,0.25)" : "none",
                    }}
                    onMouseEnter={e => { if (!sel) { e.currentTarget.style.borderColor = "#333"; e.currentTarget.style.color = "#fff"; } }}
                    onMouseLeave={e => { if (!sel) { e.currentTarget.style.borderColor = "#1a1a1a"; e.currentTarget.style.color = "#888"; } }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {isLast && (
          <div style={{ marginTop: 52 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", margin: "0 0 4px 0" }}>Number of scripts</p>
            <p style={{ fontSize: 13, color: "#555", margin: "0 0 16px 0" }}>How many script variants do you want?</p>
            <div style={{ display: "flex", gap: 10 }}>
              {SCRIPT_COUNTS.map(n => (
                <button key={n} onClick={() => setScriptCount(n)}
                  style={{ width: 52, height: 52, borderRadius: 12, border: `1.5px solid ${scriptCount === n ? "#FF2D55" : "#1a1a1a"}`, background: scriptCount === n ? "#FF2D55" : "#111", color: scriptCount === n ? "#fff" : "#555", fontSize: 16, fontWeight: 800, cursor: "pointer", transition: "all 0.15s", outline: "none", boxShadow: scriptCount === n ? "0 4px 16px rgba(255,45,85,0.3)" : "none" }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#0a0a0a", borderTop: "1px solid #1a1a1a", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={() => step > 0 ? setStep(s => s - 1) : router.push("/")}
          style={{ background: "none", border: "1.5px solid #1a1a1a", borderRadius: 10, padding: "11px 22px", fontSize: 13, fontWeight: 600, color: "#555", cursor: "pointer", transition: "border-color 0.15s", outline: "none" }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = "#333")}
          onMouseLeave={e => (e.currentTarget.style.borderColor = "#1a1a1a")}
        >
          ← Back
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {!stepOk && <p style={{ fontSize: 12, color: "#333", margin: 0 }}>Select all options to continue</p>}
          <button onClick={handleContinue} disabled={!stepOk}
            style={{ background: stepOk ? "#FF2D55" : "#111", color: stepOk ? "#fff" : "#333", border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 14, fontWeight: 800, cursor: stepOk ? "pointer" : "not-allowed", letterSpacing: "-0.01em", transition: "background 0.15s", boxShadow: stepOk ? "0 4px 16px rgba(255,45,85,0.3)" : "none" }}
          >
            {isLast ? `Generate ${scriptCount} scripts →` : "Continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}
