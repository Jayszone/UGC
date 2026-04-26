"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveConfig, loadConfig, saveCampaign } from "../../lib/store";

const PLATFORMS = [
  { label: "TikTok", icon: "🎵", desc: "Vertical short-form, 15–60s" },
  { label: "Instagram Reels", icon: "📸", desc: "Reels-optimized hooks & CTAs" },
  { label: "YouTube Shorts", icon: "▶️", desc: "Shorts format, slightly longer" },
];

const GOALS = [
  { label: "Drive app downloads", icon: "📲" },
  { label: "Increase sign-ups", icon: "✍️" },
  { label: "Build brand awareness", icon: "📣" },
  { label: "Promote a specific corridor", icon: "🌐" },
  { label: "Retarget existing users", icon: "🔄" },
  { label: "Launch seasonal campaign", icon: "🎯" },
];

const SCRIPT_COUNTS = [2, 3, 4, 5, 6];

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

const LOADING_STATES = [
  "Analyzing corridor dynamics...",
  "Building audience personas...",
  "Generating script hooks...",
  "Writing full scripts...",
  "Crafting scene breakdowns...",
  "Designing experiment plan...",
  "Critic-reviewing scripts...",
  "Finalizing campaign pack...",
];

export default function BuildStep3() {
  const router = useRouter();
  const [platform, setPlatform] = useState("");
  const [goal, setGoal] = useState("");
  const [scriptCount, setScriptCount] = useState(4);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_STATES[0]);
  const [error, setError] = useState("");

  useEffect(() => {
    const config = loadConfig();
    if (!config.corridor) { router.replace("/build/1"); return; }
    if (!config.pain_point) { router.replace("/build/2"); return; }
    if (config.platform) setPlatform(config.platform);
    if (config.campaign_goal) setGoal(config.campaign_goal);
    if (config.number_of_scripts) setScriptCount(config.number_of_scripts);
  }, [router]);

  useEffect(() => {
    if (!loading) return;
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % LOADING_STATES.length;
      setLoadingMsg(LOADING_STATES[i]);
    }, 2200);
    return () => clearInterval(interval);
  }, [loading]);

  async function handleLaunch() {
    if (!platform || !goal) return;
    const config = loadConfig();
    const fullConfig = { ...config, platform, campaign_goal: goal, number_of_scripts: scriptCount };
    saveConfig({ platform, campaign_goal: goal, number_of_scripts: scriptCount });

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8003/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullConfig),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail ?? `Server error ${res.status}`);
      }

      const data = await res.json();
      saveCampaign({ ...data, config: fullConfig });
      router.push("/studio");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const canLaunch = !!platform && !!goal && !loading;

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
        <StepIndicator current={3} />
      </header>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "56px 40px 80px" }}>
        {/* Step label */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#FF2D55", textTransform: "uppercase", margin: "0 0 8px 0" }}>Step 3 of 3</p>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: "#0a0a0a", letterSpacing: "-0.04em", margin: "0 0 10px 0" }}>Where & what for?</h1>
          <p style={{ fontSize: 15, color: "#666", margin: 0 }}>Set your platform, campaign goal, and how many script variants to generate.</p>
        </div>

        {/* Platform */}
        <div style={{ marginBottom: 36 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#0a0a0a", margin: "0 0 14px 0" }}>Platform</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {PLATFORMS.map(({ label, icon, desc }) => {
              const selected = platform === label;
              return (
                <button key={label} onClick={() => setPlatform(label)} style={{
                  background: selected ? "#0a0a0a" : "#fafafa",
                  color: selected ? "#fff" : "#0a0a0a",
                  border: selected ? "1.5px solid #0a0a0a" : "1.5px solid #f0f0f0",
                  borderRadius: 14, padding: "20px 16px",
                  cursor: "pointer", textAlign: "center",
                  transition: "all 0.15s", display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                }}>
                  <span style={{ fontSize: 28 }}>{icon}</span>
                  <p style={{ fontSize: 13, fontWeight: 700, margin: 0, color: selected ? "#FFE234" : "#0a0a0a" }}>{label}</p>
                  <p style={{ fontSize: 11, color: selected ? "#aaa" : "#888", margin: 0 }}>{desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Campaign Goal */}
        <div style={{ marginBottom: 36 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#0a0a0a", margin: "0 0 14px 0" }}>Campaign Goal</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {GOALS.map(({ label, icon }) => {
              const selected = goal === label;
              return (
                <button key={label} onClick={() => setGoal(label)} style={{
                  background: selected ? "#0a0a0a" : "#fafafa",
                  color: selected ? "#FFE234" : "#444",
                  border: selected ? "1.5px solid #0a0a0a" : "1.5px solid #f0f0f0",
                  borderRadius: 10, padding: "12px 14px",
                  fontSize: 12, fontWeight: selected ? 700 : 500,
                  cursor: "pointer", textAlign: "left",
                  transition: "all 0.15s", display: "flex", alignItems: "center", gap: 8,
                }}>
                  <span style={{ fontSize: 16 }}>{icon}</span>
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Script Count */}
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#0a0a0a", margin: "0 0 6px 0" }}>Number of Script Variants</p>
          <p style={{ fontSize: 12, color: "#aaa", margin: "0 0 14px 0" }}>More variants = more angles to A/B test</p>
          <div style={{ display: "flex", gap: 8 }}>
            {SCRIPT_COUNTS.map((n) => {
              const selected = scriptCount === n;
              return (
                <button key={n} onClick={() => setScriptCount(n)} style={{
                  width: 52, height: 52,
                  background: selected ? "#FFE234" : "#fafafa",
                  color: selected ? "#0a0a0a" : "#555",
                  border: selected ? "2px solid #0a0a0a" : "1.5px solid #f0f0f0",
                  borderRadius: 12,
                  fontSize: 18, fontWeight: 800,
                  cursor: "pointer", transition: "all 0.15s",
                }}>
                  {n}
                </button>
              );
            })}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "#FFF0F3", border: "1.5px solid #FFD6DE", borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
            <p style={{ fontSize: 13, color: "#FF2D55", margin: 0, fontWeight: 600 }}>⚠ {error}</p>
          </div>
        )}

        {/* Loading overlay message */}
        {loading && (
          <div style={{ background: "#fafafa", border: "1.5px solid #f0f0f0", borderRadius: 14, padding: "20px 24px", marginBottom: 20, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 20, height: 20, border: "2.5px solid #FFE234", borderTopColor: "#0a0a0a", borderRadius: "50%", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#0a0a0a", margin: "0 0 2px 0" }}>Generating your campaign...</p>
              <p style={{ fontSize: 12, color: "#aaa", margin: 0 }}>{loadingMsg}</p>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Footer nav */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/build/2" style={{ fontSize: 13, color: "#aaa", textDecoration: "none", fontWeight: 500 }}>← Back</Link>
          <button onClick={handleLaunch} disabled={!canLaunch} style={{
            background: canLaunch ? "#0a0a0a" : "#f0f0f0",
            color: canLaunch ? "#FFE234" : "#bbb",
            border: "none", borderRadius: 12,
            padding: "15px 40px", fontSize: 16, fontWeight: 800,
            cursor: canLaunch ? "pointer" : "not-allowed",
            letterSpacing: "-0.02em", transition: "all 0.15s",
            boxShadow: canLaunch ? "0 4px 24px rgba(0,0,0,0.15)" : "none",
          }}>
            {loading ? "Generating..." : "🚀 Launch Campaign"}
          </button>
        </div>
      </div>
    </div>
  );
}
