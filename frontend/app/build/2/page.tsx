"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveConfig, loadConfig } from "../../lib/store";

const PAIN_POINTS = [
  { label: "High transfer fees", icon: "💸", desc: "Bank and wire fees eating into transfers" },
  { label: "Slow transactions", icon: "🐢", desc: "Days-long waits for money to arrive" },
  { label: "Hidden exchange rate charges", icon: "🕵️", desc: "Bad FX rates disguised as 'no fees'" },
  { label: "Family support urgency", icon: "🏥", desc: "Emergency situations need instant transfers" },
  { label: "Unreliable services", icon: "😤", desc: "Failed transfers and frozen accounts" },
  { label: "No transparency", icon: "🔒", desc: "Can't track where money is mid-transfer" },
  { label: "Limited cash pickup options", icon: "🏧", desc: "Recipient can't access digital payments" },
  { label: "Complex verification", icon: "📋", desc: "Excessive docs and slow KYC processes" },
];

const TONES = [
  { label: "Emotional", color: "#FF2D55", bg: "#FFF0F3", border: "#FFD6DE", icon: "❤️", desc: "Personal stories that connect deeply" },
  { label: "Educational", color: "#9333ea", bg: "#faf5ff", border: "#e9d5ff", icon: "📚", desc: "Teach viewers something valuable" },
  { label: "Savings", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", icon: "💰", desc: "Focus on money saved vs competitors" },
  { label: "Speed", color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe", icon: "⚡", desc: "Emphasize instant transfers" },
  { label: "Funny", color: "#ca8a04", bg: "#fefce8", border: "#fef08a", icon: "😂", desc: "Relatable humor about bad services" },
  { label: "Controversial", color: "#ea580c", bg: "#fff7ed", border: "#fed7aa", icon: "🔥", desc: "Hot takes that spark conversation" },
  { label: "Relatable", color: "#0d9488", bg: "#f0fdfa", border: "#99f6e4", icon: "😅", desc: "Everyday struggles people recognize" },
  { label: "FOMO", color: "#ca8a04", bg: "#fefce8", border: "#fef08a", icon: "👀", desc: "Everyone else is already using Blaze" },
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
      {[1, 2, 3].map((step) => (
        <div key={step} style={{ display: "flex", alignItems: "center" }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: step < current ? "#0a0a0a" : step === current ? "#FFE234" : "#f0f0f0",
            color: step < current ? "#FFE234" : step === current ? "#0a0a0a" : "#bbb",
            fontSize: 11, fontWeight: 800,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: step === current ? "2px solid #0a0a0a" : "none",
          }}>
            {step < current ? "✓" : step}
          </div>
          {step < 3 && (
            <div style={{ width: 40, height: 2, background: step < current ? "#0a0a0a" : "#f0f0f0" }} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function BuildStep2() {
  const router = useRouter();
  const [painPoint, setPainPoint] = useState("");
  const [tone, setTone] = useState("");

  useEffect(() => {
    const config = loadConfig();
    if (!config.corridor) { router.replace("/build/1"); return; }
    if (config.pain_point) setPainPoint(config.pain_point);
    if (config.tone) setTone(config.tone);
  }, [router]);

  function handleNext() {
    if (!painPoint || !tone) return;
    saveConfig({ pain_point: painPoint, tone });
    router.push("/build/3");
  }

  const canNext = !!painPoint && !!tone;

  return (
    <div style={{ minHeight: "100vh", background: "#fff", color: "#0a0a0a" }}>
      {/* Nav */}
      <header style={{ borderBottom: "1px solid #f0f0f0", padding: "0 40px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "#FFE234", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(255,226,52,0.4)" }}>
            <span style={{ fontSize: 15 }}>⚡</span>
          </div>
          <span style={{ fontSize: 16, fontWeight: 900, color: "#0a0a0a", letterSpacing: "-0.03em" }}>Blaze</span>
          <span style={{ fontSize: 12, color: "#999", marginLeft: 2 }}>UGC Growth Lab</span>
        </Link>
        <StepIndicator current={2} />
      </header>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "56px 40px 80px" }}>
        {/* Step label */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#FF2D55", textTransform: "uppercase", margin: "0 0 8px 0" }}>Step 2 of 3</p>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: "#0a0a0a", letterSpacing: "-0.04em", margin: "0 0 10px 0" }}>What's the hook?</h1>
          <p style={{ fontSize: 15, color: "#666", margin: 0 }}>Choose the core pain point to address and the tone that'll resonate.</p>
        </div>

        {/* Pain Point */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#0a0a0a", margin: "0 0 14px 0" }}>Core Pain Point</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
            {PAIN_POINTS.map(({ label, icon, desc }) => {
              const selected = painPoint === label;
              return (
                <button key={label} onClick={() => setPainPoint(label)} style={{
                  background: selected ? "#0a0a0a" : "#fafafa",
                  color: selected ? "#fff" : "#0a0a0a",
                  border: selected ? "1.5px solid #0a0a0a" : "1.5px solid #f0f0f0",
                  borderRadius: 12, padding: "14px 16px",
                  cursor: "pointer", textAlign: "left",
                  transition: "all 0.15s", display: "flex", alignItems: "flex-start", gap: 12,
                }}>
                  <span style={{ fontSize: 20, lineHeight: 1 }}>{icon}</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 3px 0", color: selected ? "#FFE234" : "#0a0a0a" }}>{label}</p>
                    <p style={{ fontSize: 11, color: selected ? "#aaa" : "#888", margin: 0 }}>{desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tone */}
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#0a0a0a", margin: "0 0 14px 0" }}>Content Tone</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {TONES.map(({ label, color, bg, border, icon, desc }) => {
              const selected = tone === label;
              return (
                <button key={label} onClick={() => setTone(label)} style={{
                  background: selected ? bg : "#fafafa",
                  color: selected ? color : "#555",
                  border: `1.5px solid ${selected ? border : "#f0f0f0"}`,
                  borderRadius: 12, padding: "14px 12px",
                  cursor: "pointer", textAlign: "center",
                  transition: "all 0.15s", display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                }}>
                  <span style={{ fontSize: 22 }}>{icon}</span>
                  <p style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>{label}</p>
                  <p style={{ fontSize: 10, color: selected ? color : "#bbb", margin: 0, lineHeight: 1.4 }}>{desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer nav */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/build/1" style={{ fontSize: 13, color: "#aaa", textDecoration: "none", fontWeight: 500 }}>← Back</Link>
          <button onClick={handleNext} disabled={!canNext} style={{
            background: canNext ? "#0a0a0a" : "#f0f0f0",
            color: canNext ? "#FFE234" : "#bbb",
            border: "none", borderRadius: 12,
            padding: "14px 36px", fontSize: 15, fontWeight: 800,
            cursor: canNext ? "pointer" : "not-allowed",
            letterSpacing: "-0.02em", transition: "all 0.15s",
          }}>
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}
