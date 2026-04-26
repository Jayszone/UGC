"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveConfig, loadConfig } from "../../lib/store";

const CORRIDORS = [
  "🇺🇸→🇲🇽 US → Mexico",
  "🇺🇸→🇮🇳 US → India",
  "🇺🇸→🇵🇭 US → Philippines",
  "🇺🇸→🇳🇬 US → Nigeria",
  "🇺🇸→🇻🇳 US → Vietnam",
  "🇺🇸→🇩🇴 US → Dominican Republic",
  "🇺🇸→🇬🇹 US → Guatemala",
  "🇺🇸→🇨🇴 US → Colombia",
  "🇬🇧→🇮🇳 UK → India",
  "🇬🇧→🇳🇬 UK → Nigeria",
  "🇨🇦→🇮🇳 Canada → India",
  "🇦🇪→🇵🇰 UAE → Pakistan",
];

const AUDIENCES = [
  { label: "First-time senders", icon: "👋", desc: "People new to international transfers" },
  { label: "Frequent senders", icon: "🔁", desc: "Send money monthly or more" },
  { label: "Students abroad", icon: "🎓", desc: "International students receiving support" },
  { label: "Family supporters", icon: "👨‍👩‍👧", desc: "Sending remittances to support family" },
  { label: "Seasonal workers", icon: "🌾", desc: "Migrant workers sending wages home" },
  { label: "Small business owners", icon: "💼", desc: "Cross-border business payments" },
  { label: "Gig economy workers", icon: "📱", desc: "Freelancers receiving international pay" },
  { label: "Diaspora community", icon: "🌍", desc: "Immigrants staying connected financially" },
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

export default function BuildStep1() {
  const router = useRouter();
  const [corridor, setCorridor] = useState("");
  const [audience, setAudience] = useState("");

  useEffect(() => {
    const config = loadConfig();
    if (config.corridor) setCorridor(config.corridor);
    if (config.audience) setAudience(config.audience);
  }, []);

  function handleNext() {
    if (!corridor || !audience) return;
    saveConfig({ corridor, audience });
    router.push("/build/2");
  }

  const canNext = !!corridor && !!audience;

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
        <StepIndicator current={1} />
      </header>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "56px 40px 80px" }}>
        {/* Step label */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#FF2D55", textTransform: "uppercase", margin: "0 0 8px 0" }}>Step 1 of 3</p>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: "#0a0a0a", letterSpacing: "-0.04em", margin: "0 0 10px 0" }}>Who are you targeting?</h1>
          <p style={{ fontSize: 15, color: "#666", margin: 0 }}>Pick the payment corridor and audience for this campaign.</p>
        </div>

        {/* Corridor */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#0a0a0a", margin: "0 0 14px 0" }}>Payment Corridor</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {CORRIDORS.map((c) => {
              const selected = corridor === c;
              return (
                <button key={c} onClick={() => setCorridor(c)} style={{
                  background: selected ? "#0a0a0a" : "#fafafa",
                  color: selected ? "#FFE234" : "#444",
                  border: selected ? "1.5px solid #0a0a0a" : "1.5px solid #f0f0f0",
                  borderRadius: 10, padding: "10px 14px",
                  fontSize: 12, fontWeight: selected ? 700 : 500,
                  cursor: "pointer", textAlign: "left",
                  transition: "all 0.15s",
                }}>
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        {/* Audience */}
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#0a0a0a", margin: "0 0 14px 0" }}>Target Audience</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
            {AUDIENCES.map(({ label, icon, desc }) => {
              const selected = audience === label;
              return (
                <button key={label} onClick={() => setAudience(label)} style={{
                  background: selected ? "#0a0a0a" : "#fafafa",
                  color: selected ? "#fff" : "#0a0a0a",
                  border: selected ? "1.5px solid #0a0a0a" : "1.5px solid #f0f0f0",
                  borderRadius: 12, padding: "14px 16px",
                  cursor: "pointer", textAlign: "left",
                  transition: "all 0.15s", display: "flex", alignItems: "flex-start", gap: 12,
                }}>
                  <span style={{ fontSize: 22, lineHeight: 1 }}>{icon}</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 3px 0", color: selected ? "#FFE234" : "#0a0a0a" }}>{label}</p>
                    <p style={{ fontSize: 11, color: selected ? "#aaa" : "#888", margin: 0 }}>{desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer nav */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ fontSize: 13, color: "#aaa", textDecoration: "none", fontWeight: 500 }}>← Back</Link>
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
