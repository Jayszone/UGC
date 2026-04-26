"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadCampaign } from "../lib/store";
import type { Campaign } from "../lib/types";
import ScriptCard from "../components/ScriptCard";

export default function StudioPage() {
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const data = loadCampaign();
    if (!data) { router.replace("/"); return; }
    setCampaign(data);
  }, [router]);

  if (!campaign) return null;

  const { campaign_name, target_insight, corridor_context, scripts, experiment_plan, config } = campaign;

  function exportMarkdown() {
    const lines = [
      `# ${campaign_name}`,
      ``,
      `**Corridor:** ${config?.corridor ?? "—"}  |  **Audience:** ${config?.audience ?? "—"}  |  **Platform:** ${config?.platform ?? "—"}`,
      ``,
      `## Target Insight`,
      target_insight,
      ``,
      `## Corridor Context`,
      corridor_context,
      ``,
      `---`,
      ``,
      ...scripts.flatMap(s => [
        `## Script ${s.id}: ${s.title}`,
        `**Angle:** ${s.angle}  |  **Duration:** ${s.estimated_duration}  |  **Emotion:** ${s.emotion_trigger}`,
        ``,
        `**Hook:** "${s.hook}"`,
        ``,
        `**Script:**`,
        s.script,
        ``,
        `**Scenes:**`,
        ...s.scene_breakdown.map((sc, i) => `${i + 1}. ${sc}`),
        ``,
        `**CTA:** "${s.cta}"`,
        ``,
        `**Creator Direction:** ${s.creator_direction}`,
        ``,
        `**Hashtags:** ${s.hashtags.join(" ")}`,
        ``,
        `---`,
        ``,
      ]),
      `## Experiment Plan`,
      `**Hypothesis:** ${experiment_plan.hypothesis}`,
      ``,
      `**Test Design:** ${experiment_plan.test_design}`,
      ``,
      `**Primary Metric:** ${experiment_plan.primary_metric}`,
      ``,
      `**Metrics:** ${experiment_plan.metrics.join(", ")}`,
      ``,
      `**Winning Signal:** ${experiment_plan.winning_signal}`,
      ``,
      `**Timeline:** ${experiment_plan.timeline}`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${campaign_name.replace(/\s+/g, "_")}.md`;
    a.click();
  }

  function copyAll() {
    const text = scripts.map(s =>
      `--- Script ${s.id}: ${s.title} ---\nHook: "${s.hook}"\n\n${s.script}\n\nCTA: "${s.cta}"\n`
    ).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fff", color: "#0a0a0a" }}>
      {/* Nav */}
      <header style={{ borderBottom: "1px solid #f0f0f0", padding: "0 32px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "#fff", zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "#FFE234", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(255,226,52,0.4)" }}>
            <span style={{ fontSize: 15 }}>⚡</span>
          </div>
          <span style={{ fontSize: 15, fontWeight: 900, color: "#0a0a0a", letterSpacing: "-0.03em" }}>Blaze</span>
          <span style={{ fontSize: 13, color: "#ddd", margin: "0 2px" }}>/</span>
          <span style={{ fontSize: 13, color: "#999" }}>UGC Growth Lab</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={copyAll}
            style={{ background: copied ? "#f0fdf4" : "#f5f5f5", color: copied ? "#16a34a" : "#555", border: `1px solid ${copied ? "#bbf7d0" : "#e8e8e8"}`, borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
          >
            {copied ? "✓ All copied" : "Copy all scripts"}
          </button>
          <button onClick={exportMarkdown}
            style={{ background: "#fffbde", color: "#0a0a0a", border: "1.5px solid #FFE234", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
          >
            Export .md
          </button>
          <Link href="/" style={{ background: "#0a0a0a", color: "#FFE234", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", textDecoration: "none", display: "flex", alignItems: "center" }}>
            + New campaign
          </Link>
        </div>
      </header>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "36px 32px 80px" }}>
        {/* Campaign header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {config && [config.corridor, config.audience, config.platform, config.tone].map((tag, i) => (
              <span key={i} style={{ fontSize: 11, color: "#888", background: "#f5f5f5", border: "1px solid #e8e8e8", padding: "3px 10px", borderRadius: 99 }}>{tag}</span>
            ))}
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0a0a0a", letterSpacing: "-0.03em", margin: "0 0 10px 0", lineHeight: 1.2 }}>
            {campaign_name}
          </h1>
          <p style={{ fontSize: 14, color: "#555", maxWidth: 680, lineHeight: 1.7, margin: "0 0 6px 0" }}>{target_insight}</p>
          <p style={{ fontSize: 13, color: "#aaa", fontStyle: "italic", margin: 0 }}>{corridor_context}</p>
        </div>

        {/* Stats bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 36 }}>
          {[
            { label: "Scripts",  value: scripts.length,                          sub: "variants to test",     accent: "#FF2D55" },
            { label: "Angles",   value: new Set(scripts.map(s => s.angle)).size, sub: "distinct approaches",  accent: "#FFE234" },
            { label: "Platform", value: config?.platform ?? "—",                 sub: "primary channel",      accent: "#0a0a0a" },
            { label: "Goal",     value: "Downloads",                             sub: config?.campaign_goal?.slice(0, 24) ?? "—", accent: "#FF2D55" },
          ].map(({ label, value, sub, accent }) => (
            <div key={label} style={{ background: "#fafafa", border: "1.5px solid #f0f0f0", borderRadius: 14, padding: "18px 20px" }}>
              <p style={{ fontSize: 11, color: "#aaa", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 6px 0" }}>{label}</p>
              <p style={{ fontSize: 26, fontWeight: 900, color: accent, letterSpacing: "-0.03em", margin: "0 0 4px 0" }}>{value}</p>
              <p style={{ fontSize: 11, color: "#bbb", margin: 0 }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* Script cards */}
        <div style={{ marginBottom: 44 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0a0a0a", margin: "0 0 3px 0" }}>Script Variants</h2>
              <p style={{ fontSize: 13, color: "#aaa", margin: 0 }}>Scroll to browse · click any card to expand script</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 16, scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}>
            <style>{`
              ::-webkit-scrollbar { height: 4px; }
              ::-webkit-scrollbar-track { background: #f5f5f5; border-radius: 99px; }
              ::-webkit-scrollbar-thumb { background: #FF2D55; border-radius: 99px; }
            `}</style>
            {scripts.map((script, i) => (
              <div key={script.id} style={{ scrollSnapAlign: "start" }}>
                <ScriptCard script={script} index={i} />
              </div>
            ))}
          </div>
        </div>

        {/* Experiment plan */}
        <div style={{ background: "#fafafa", border: "1.5px solid #f0f0f0", borderRadius: 20, padding: "28px 32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "#fffbde", border: "1.5px solid #FFE234", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🧪</div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "#0a0a0a", margin: 0 }}>Growth Experiment Plan</h2>
              <p style={{ fontSize: 12, color: "#aaa", margin: 0 }}>How to run and measure this campaign</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
            <div>
              <p style={{ fontSize: 11, color: "#aaa", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 6px 0" }}>Hypothesis</p>
              <p style={{ fontSize: 14, color: "#333", lineHeight: 1.75, margin: "0 0 20px 0" }}>{experiment_plan.hypothesis}</p>

              <p style={{ fontSize: 11, color: "#aaa", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 6px 0" }}>Test Design</p>
              <p style={{ fontSize: 13, color: "#555", lineHeight: 1.65, margin: "0 0 20px 0" }}>{experiment_plan.test_design}</p>

              <p style={{ fontSize: 11, color: "#aaa", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 6px 0" }}>Timeline</p>
              <p style={{ fontSize: 13, color: "#555", margin: 0 }}>{experiment_plan.timeline}</p>
            </div>

            <div>
              <p style={{ fontSize: 11, color: "#aaa", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 10px 0" }}>Metrics to Track</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {experiment_plan.metrics.map((m, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", border: `1.5px solid ${i === 0 ? "#FF2D55" : "#e8e8e8"}`, borderRadius: 8, padding: "9px 12px" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: i === 0 ? "#FF2D55" : "#ddd", flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: i === 0 ? "#FF2D55" : "#666", fontWeight: i === 0 ? 700 : 400 }}>
                      {m}{i === 0 && <span style={{ fontSize: 10, color: "#aaa", fontWeight: 400 }}> — primary</span>}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ background: "#fffbde", border: "1.5px solid #FFE234", borderRadius: 12, padding: "14px 16px" }}>
                <p style={{ fontSize: 11, color: "#aaa", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 6px 0" }}>Winning Signal</p>
                <p style={{ fontSize: 13, color: "#0a0a0a", fontWeight: 600, lineHeight: 1.55, margin: 0 }}>{experiment_plan.winning_signal}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
