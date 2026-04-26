"use client";

import { useState } from "react";
import type { Script } from "../lib/types";

const ANGLE_COLOR: Record<string, { bg: string; text: string; border: string }> = {
  Savings:       { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0" },
  Speed:         { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" },
  Emotional:     { bg: "#FFF0F3", text: "#FF2D55", border: "#FFD6DE" },
  Controversial: { bg: "#fff7ed", text: "#ea580c", border: "#fed7aa" },
  Educational:   { bg: "#faf5ff", text: "#9333ea", border: "#e9d5ff" },
  Relatable:     { bg: "#f0fdfa", text: "#0d9488", border: "#99f6e4" },
  FOMO:          { bg: "#fefce8", text: "#ca8a04", border: "#fef08a" },
};

const EMOTION_ICON: Record<string, string> = {
  fear: "😰", curiosity: "🤔", relatability: "😅", aspiration: "🚀", humor: "😂",
};

export default function ScriptCard({ script, index }: { script: Script; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied]     = useState(false);
  const angle = ANGLE_COLOR[script.angle] ?? { bg: "#fafafa", text: "#FF2D55", border: "#ffe4e8" };

  function copyScript() {
    const text = `HOOK:\n${script.hook}\n\nSCRIPT:\n${script.script}\n\nCTA:\n${script.cta}\n\nCREATOR DIRECTION:\n${script.creator_direction}\n\nHASHTAGS:\n${script.hashtags.join(" ")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{
      width: 300,
      flexShrink: 0,
      background: "#fff",
      border: "1.5px solid #f0f0f0",
      borderRadius: 20,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
      transition: "transform 0.2s, box-shadow 0.2s",
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 40px rgba(255,45,85,0.12)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 16px rgba(0,0,0,0.06)"; }}
    >
      {/* TikTok-style header */}
      <div style={{
        background: "linear-gradient(160deg, #0a0a0a 0%, #1a1a1a 100%)",
        padding: "20px 20px 18px",
        position: "relative",
        minHeight: 170,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}>
        {/* Top badges */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#000", background: "#FFE234", padding: "2px 8px", borderRadius: 99 }}>
              #{index + 1}
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, color: angle.text, background: angle.bg, border: `1px solid ${angle.border}`, padding: "2px 8px", borderRadius: 99 }}>
              {script.angle}
            </span>
          </div>
          <span style={{ fontSize: 18 }}>{EMOTION_ICON[script.emotion_trigger] ?? "✨"}</span>
        </div>

        {/* Hook text */}
        <div>
          <p style={{ fontSize: 10, color: "#555", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 6px 0" }}>Hook</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#fff", lineHeight: 1.45, margin: 0 }}>
            &ldquo;{script.hook}&rdquo;
          </p>
        </div>

        {/* TikTok-style side actions */}
        <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
          {[["❤️", "likes"], ["💬", "cmts"], ["↗️", "share"]].map(([icon, label]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18 }}>{icon}</div>
              <div style={{ fontSize: 8, color: "#555", marginTop: 1 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "16px 18px", flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Title + duration */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#0a0a0a", margin: 0, flex: 1, lineHeight: 1.4 }}>{script.title}</p>
          <span style={{ fontSize: 10, color: "#aaa", background: "#f5f5f5", border: "1px solid #e8e8e8", padding: "2px 7px", borderRadius: 6, flexShrink: 0 }}>{script.estimated_duration}</span>
        </div>

        {/* Scenes */}
        <div>
          <p style={{ fontSize: 10, color: "#aaa", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 8px 0" }}>Scenes</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {script.scene_breakdown.map((scene, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ width: 16, height: 16, borderRadius: "50%", background: i === 0 ? "#FF2D55" : "#FFE234", color: "#000", fontSize: 8, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                <span style={{ fontSize: 11, color: "#555", lineHeight: 1.5 }}>{scene}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Script — expandable */}
        <div>
          <p style={{ fontSize: 10, color: "#aaa", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 6px 0" }}>Script</p>
          <p style={{ fontSize: 12, color: "#444", lineHeight: 1.65, margin: 0 }}>
            {expanded ? script.script : `${script.script.slice(0, 130)}...`}
          </p>
          <button onClick={() => setExpanded(e => !e)}
            style={{ background: "none", border: "none", color: "#FF2D55", fontSize: 11, fontWeight: 600, cursor: "pointer", padding: "4px 0", marginTop: 2 }}
          >
            {expanded ? "Show less ↑" : "Read full script ↓"}
          </button>
        </div>

        {/* CTA */}
        <div style={{ background: "#fffbde", border: "1.5px solid #FFE234", borderRadius: 10, padding: "10px 12px" }}>
          <p style={{ fontSize: 10, color: "#aaa", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 4px 0" }}>CTA</p>
          <p style={{ fontSize: 12, color: "#0a0a0a", fontWeight: 700, margin: 0 }}>&ldquo;{script.cta}&rdquo;</p>
        </div>

        {/* Creator direction */}
        <div>
          <p style={{ fontSize: 10, color: "#aaa", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 4px 0" }}>Creator Direction</p>
          <p style={{ fontSize: 11, color: "#888", fontStyle: "italic", lineHeight: 1.55, margin: 0 }}>{script.creator_direction}</p>
        </div>

        {/* Hashtags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {script.hashtags.map((tag, i) => (
            <span key={i} style={{ fontSize: 10, color: "#2563eb", background: "#eff6ff", border: "1px solid #bfdbfe", padding: "2px 7px", borderRadius: 99 }}>{tag}</span>
          ))}
        </div>
      </div>

      {/* Copy button */}
      <div style={{ padding: "0 18px 18px" }}>
        <button onClick={copyScript}
          style={{
            width: "100%",
            background: copied ? "#f0fdf4" : "#0a0a0a",
            color: copied ? "#16a34a" : "#FFE234",
            border: copied ? "1.5px solid #bbf7d0" : "none",
            borderRadius: 10, padding: "11px",
            fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
          }}
        >
          {copied ? "✓ Copied!" : "Copy Creator Brief"}
        </button>
      </div>
    </div>
  );
}
