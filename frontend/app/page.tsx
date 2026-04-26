"use client";

import React from "react";
import Link from "next/link";
import { clearConfig } from "./lib/store";
import { useEffect } from "react";

export default function LandingPage() {
  useEffect(() => { clearConfig(); }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#fff", color: "#0a0a0a", overflowX: "hidden" }}>

      {/* ── NAV ── */}
      <header style={{
        borderBottom: "1px solid #f0f0f0", padding: "0 56px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, background: "#fff", zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "#FFE234", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 10px rgba(255,226,52,0.5)" }}>
            <span style={{ fontSize: 16 }}>⚡</span>
          </div>
          <span style={{ fontSize: 17, fontWeight: 900, color: "#0a0a0a", letterSpacing: "-0.04em" }}>Blaze</span>
          <span style={{ fontSize: 12, color: "#bbb", marginLeft: 2 }}>UGC Growth Lab</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#FF2D55", background: "#FFF0F3", border: "1px solid #FFD6DE", borderRadius: 99, padding: "3px 10px" }}>INTERNAL TOOL</span>
          <Link href="/build/1" style={{
            background: "#0a0a0a", color: "#FFE234", borderRadius: 10, padding: "8px 20px",
            fontSize: 13, fontWeight: 700, textDecoration: "none", letterSpacing: "-0.02em",
          }}>
            Start Building ⚡
          </Link>
        </div>
      </header>

      {/* ── HERO ── */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        {/* Yellow gradient glow */}
        <div style={{
          position: "absolute", top: -120, left: "50%", transform: "translateX(-50%)",
          width: 800, height: 500,
          background: "radial-gradient(ellipse, rgba(255,226,52,0.18) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />

        <div style={{
          maxWidth: 1100, margin: "0 auto", padding: "96px 56px 80px",
          display: "grid", gridTemplateColumns: "1fr 420px", gap: 60, alignItems: "center",
        }}>
          {/* Left: text */}
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#FFF0F3", border: "1px solid #FFD6DE", borderRadius: 99, padding: "5px 14px", marginBottom: 28 }}>
              <span style={{ fontSize: 12 }}>🎬</span>
              <span style={{ fontSize: 11, color: "#FF2D55", fontWeight: 700, letterSpacing: "0.07em" }}>AI-POWERED UGC GENERATOR</span>
            </div>

            <h1 style={{ fontSize: 58, fontWeight: 900, color: "#0a0a0a", letterSpacing: "-0.05em", lineHeight: 1.05, margin: "0 0 24px 0" }}>
              Turn pain points<br />
              into{" "}
              <span style={{ color: "#FF2D55" }}>viral</span>{" "}
              <span style={{
                background: "#FFE234", borderRadius: 8, padding: "0 6px",
                display: "inline-block", transform: "rotate(-1deg)",
                boxShadow: "inset 0 -3px 0 rgba(0,0,0,0.15)",
              }}>scripts.</span>
            </h1>

            <p style={{ fontSize: 17, color: "#555", lineHeight: 1.75, margin: "0 0 40px 0", maxWidth: 520 }}>
              Blaze UGC Growth Lab generates hyper-specific TikTok and Reels creator scripts for cross-border payment audiences — corridor-aware, tone-matched, and ready to ship.
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40, flexWrap: "wrap" }}>
              <Link href="/build/1" style={{
                background: "#0a0a0a", color: "#FFE234",
                borderRadius: 14, padding: "17px 44px",
                fontSize: 17, fontWeight: 800, letterSpacing: "-0.02em",
                textDecoration: "none",
                boxShadow: "0 6px 28px rgba(0,0,0,0.18)",
              }}>
                Start Building ⚡
              </Link>
              <p style={{ fontSize: 12, color: "#ccc", margin: 0 }}>3 quick steps · takes under a minute</p>
            </div>

            {/* Stat row */}
            <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
              {[["12", "corridors"], ["8", "audiences"], ["8", "content tones"], ["3", "platforms"]].map(([n, label]) => (
                <div key={label}>
                  <p style={{ fontSize: 26, fontWeight: 900, color: "#0a0a0a", letterSpacing: "-0.04em", margin: "0 0 1px 0" }}>{n}</p>
                  <p style={{ fontSize: 11, color: "#aaa", margin: 0 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Phone mockup */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <PhoneMockup />
          </div>
        </div>
      </div>

      {/* ── DIVIDER ── */}
      <div style={{ borderTop: "1px solid #f0f0f0" }} />

      {/* ── CHALLENGE + OUTPUT (2-col, full width) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>

        {/* LEFT — The Challenge */}
        <div style={{ padding: "72px 72px 72px 56px", borderRight: "1px solid #f0f0f0" }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "#FF2D55", textTransform: "uppercase", margin: "0 0 16px 0" }}>The challenge</p>

          {/* Big visual element */}
          <div style={{ fontSize: 64, lineHeight: 1, marginBottom: 20 }}>💸</div>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: "#0a0a0a", letterSpacing: "-0.04em", margin: "0 0 8px 0" }}>Cross-border payments<br />are still broken.</h2>
          <p style={{ fontSize: 14, color: "#888", lineHeight: 1.7, margin: "0 0 32px 0" }}>
            Millions of immigrants send money home every month — and most lose 4–8% to fees, bad exchange rates, and unreliable services.
          </p>

          {/* Pain point rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 36 }}>
            {[
              ["💸", "High transfer fees (4–8% industry average)"],
              ["🐢", "Multi-day waiting times"],
              ["🕵️", "Hidden FX markups disguised as 'free'"],
              ["🏥", "Family emergencies need money NOW"],
              ["😤", "Failed transfers, frozen accounts"],
            ].map(([icon, text]) => (
              <div key={text as string} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#fafafa", border: "1.5px solid #f0f0f0", borderRadius: 10 }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
                <span style={{ fontSize: 13, color: "#444" }}>{text as string}</span>
              </div>
            ))}
          </div>

          {/* Corridors */}
          <p style={{ fontSize: 11, fontWeight: 700, color: "#aaa", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 12px 0" }}>Active corridors</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {["🇺🇸→🇲🇽 US→Mexico", "🇺🇸→🇮🇳 US→India", "🇺🇸→🇵🇭 US→Philippines", "🇺🇸→🇳🇬 US→Nigeria", "🇺🇸→🇻🇳 US→Vietnam", "🇬🇧→🇮🇳 UK→India", "+ 6 more"].map((c) => (
              <span key={c} style={{ fontSize: 11, color: "#555", background: "#fff", border: "1px solid #e8e8e8", padding: "5px 11px", borderRadius: 99 }}>{c}</span>
            ))}
          </div>
        </div>

        {/* RIGHT — The Output */}
        <div style={{ padding: "72px 56px 72px 72px" }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "#16a34a", textTransform: "uppercase", margin: "0 0 16px 0" }}>What you get</p>

          <div style={{ fontSize: 64, lineHeight: 1, marginBottom: 20 }}>🎬</div>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: "#0a0a0a", letterSpacing: "-0.04em", margin: "0 0 8px 0" }}>Ready-to-ship creator<br />briefs and scripts.</h2>
          <p style={{ fontSize: 14, color: "#888", lineHeight: 1.7, margin: "0 0 32px 0" }}>
            Each campaign pack includes multiple script variants — different angles, hooks, and tones — plus a built-in A/B experiment plan.
          </p>

          {/* What's included cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 36 }}>
            {[
              { icon: "🪝", title: "Viral-optimized hooks", desc: "Attention-grabbing first 3 seconds for each angle" },
              { icon: "📋", title: "Full creator briefs", desc: "Scene-by-scene breakdown + on-camera direction" },
              { icon: "📣", title: "CTAs that convert", desc: "Corridor-specific calls to action per script" },
              { icon: "🧪", title: "A/B experiment plan", desc: "Hypothesis, metrics, winning signals & timeline" },
              { icon: "#️⃣", title: "Platform hashtag sets", desc: "TikTok, Reels, and Shorts-optimized tags" },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#fafafa", border: "1.5px solid #f0f0f0", borderRadius: 10 }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#0a0a0a", margin: "0 0 1px 0" }}>{title}</p>
                  <p style={{ fontSize: 11, color: "#aaa", margin: 0 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Angle chips */}
          <p style={{ fontSize: 11, fontWeight: 700, color: "#aaa", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 12px 0" }}>Script angles</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {[
              { label: "Emotional", color: "#FF2D55", bg: "#FFF0F3" },
              { label: "Savings",   color: "#16a34a", bg: "#f0fdf4" },
              { label: "Speed",     color: "#2563eb", bg: "#eff6ff" },
              { label: "Funny",     color: "#ca8a04", bg: "#fefce8" },
              { label: "Relatable", color: "#0d9488", bg: "#f0fdfa" },
              { label: "FOMO",      color: "#9333ea", bg: "#faf5ff" },
            ].map(({ label, color, bg }) => (
              <span key={label} style={{ fontSize: 11, fontWeight: 600, color, background: bg, padding: "5px 12px", borderRadius: 99 }}>{label}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div style={{ borderTop: "1px solid #f0f0f0", background: "#fafafa" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "72px 56px" }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "#aaa", textTransform: "uppercase", textAlign: "center", margin: "0 0 48px 0" }}>How it works</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr", alignItems: "center", gap: 16 }}>
            {[
              { n: "01", icon: "🎯", title: "Configure", desc: "Choose your corridor, audience, pain point, and tone" },
              { n: "02", icon: "🤖", title: "AI Generates", desc: "LLM builds scripts with critic review and self-correction" },
              { n: "03", icon: "🚀", title: "Ship & Test", desc: "Export creator briefs, run your experiment, measure results" },
            ].map(({ n, icon, title, desc }, i) => (
              <React.Fragment key={n}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: i === 1 ? "#FFE234" : "#fff", border: `2px solid ${i === 1 ? "#0a0a0a" : "#e8e8e8"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 16px" }}>
                    {icon}
                  </div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#ccc", letterSpacing: "0.1em", margin: "0 0 6px 0" }}>{n}</p>
                  <p style={{ fontSize: 15, fontWeight: 800, color: "#0a0a0a", margin: "0 0 6px 0" }}>{title}</p>
                  <p style={{ fontSize: 12, color: "#888", lineHeight: 1.6, margin: 0 }}>{desc}</p>
                </div>
                {i < 2 && <div style={{ fontSize: 20, color: "#ddd", textAlign: "center" }}>→</div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTTOM CTA ── */}
      <div style={{ borderTop: "1px solid #f0f0f0", padding: "72px 56px", textAlign: "center" }}>
        <h2 style={{ fontSize: 36, fontWeight: 900, color: "#0a0a0a", letterSpacing: "-0.04em", margin: "0 0 16px 0" }}>
          Ready to build your next campaign?
        </h2>
        <p style={{ fontSize: 15, color: "#888", margin: "0 0 36px 0" }}>Configure your corridor, pick your angle, get your scripts in under a minute.</p>
        <Link href="/build/1" style={{
          background: "#0a0a0a", color: "#FFE234",
          borderRadius: 14, padding: "18px 52px",
          fontSize: 17, fontWeight: 800, letterSpacing: "-0.02em",
          textDecoration: "none", display: "inline-block",
          boxShadow: "0 6px 28px rgba(0,0,0,0.18)",
        }}>
          Start Building ⚡
        </Link>
      </div>

      {/* ── FOOTER STRIP ── */}
      <div style={{ borderTop: "1px solid #f0f0f0", padding: "20px 56px", display: "flex", justifyContent: "center", gap: 44 }}>
        {[["🎯", "Corridor-specific scripts"], ["🧠", "AI + critic-reviewed"], ["📋", "Copy-ready briefs"], ["📊", "Built-in experiment plans"]].map(([icon, label]) => (
          <div key={label as string} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 15 }}>{icon}</span>
            <span style={{ fontSize: 12, color: "#999", fontWeight: 500 }}>{label as string}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PhoneMockup() {
  return (
    <div style={{ position: "relative" }}>
      {/* Glow behind phone */}
      <div style={{
        position: "absolute", inset: -30,
        background: "radial-gradient(ellipse, rgba(255,45,85,0.1) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Phone shell */}
      <div style={{
        width: 260,
        background: "#0a0a0a",
        borderRadius: 44,
        border: "8px solid #1c1c1c",
        boxShadow: "0 40px 80px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.06)",
        overflow: "hidden",
        position: "relative",
      }}>
        {/* Dynamic island */}
        <div style={{
          margin: "12px auto 0", width: 88, height: 26,
          background: "#000", borderRadius: 13,
        }} />

        {/* TikTok header */}
        <div style={{ padding: "10px 16px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 9, color: "#555", fontWeight: 600 }}>For You</span>
          <span style={{ fontSize: 9, color: "#fff", fontWeight: 600, borderBottom: "1.5px solid #FF2D55", paddingBottom: 2 }}>Following</span>
          <span style={{ fontSize: 9, color: "#555", fontWeight: 600 }}>Friends</span>
        </div>

        {/* Script card content */}
        <div style={{ padding: "14px 16px 10px" }}>
          {/* Gradient accent bar */}
          <div style={{ height: 2, background: "linear-gradient(90deg, #FF2D55, #FFE234)", borderRadius: 99, marginBottom: 14 }} />

          {/* Badges */}
          <div style={{ display: "flex", gap: 5, marginBottom: 12 }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: "#000", background: "#FFE234", padding: "2px 7px", borderRadius: 99 }}>#1</span>
            <span style={{ fontSize: 9, color: "#FF2D55", background: "#FFF0F3", padding: "2px 7px", borderRadius: 99, fontWeight: 600 }}>Emotional</span>
            <span style={{ fontSize: 9, color: "#2563eb", background: "#eff6ff", padding: "2px 7px", borderRadius: 99, fontWeight: 600 }}>US→MX</span>
          </div>

          <p style={{ fontSize: 8, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 4px 0" }}>Hook</p>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#fff", lineHeight: 1.45, margin: "0 0 14px 0" }}>
            &ldquo;I used to lose $30 every time I sent money home. Then I found Blaze.&rdquo;
          </p>

          <p style={{ fontSize: 8, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 8px 0" }}>Scenes</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 12 }}>
            {["Creator reacts to $28 bank fee receipt", "Shows Blaze — sends $200 for $1.20", "Reveals amount saved this year"].map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 7, alignItems: "flex-start" }}>
                <span style={{ width: 13, height: 13, borderRadius: "50%", background: i === 0 ? "#FF2D55" : "#FFE234", color: "#000", fontSize: 7, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                <span style={{ fontSize: 9, color: "#888", lineHeight: 1.4 }}>{s}</span>
              </div>
            ))}
          </div>

          <div style={{ background: "#1a1a00", border: "1px solid rgba(255,226,52,0.25)", borderRadius: 7, padding: "7px 10px", marginBottom: 12 }}>
            <p style={{ fontSize: 9, color: "#aaa", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 3px 0" }}>CTA</p>
            <p style={{ fontSize: 10, color: "#FFE234", fontWeight: 700, margin: 0 }}>&ldquo;Download Blaze before your next transfer.&rdquo;</p>
          </div>

          {/* Hashtags */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 14 }}>
            {["#remittance", "#sendmoneyhome", "#blaze", "#usamx"].map(tag => (
              <span key={tag} style={{ fontSize: 8, color: "#2563eb", background: "#eff6ff", padding: "2px 6px", borderRadius: 99 }}>{tag}</span>
            ))}
          </div>
        </div>

        {/* TikTok side buttons */}
        <div style={{ position: "absolute", right: 12, top: "45%", display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
          {[["❤️", "24K"], ["💬", "890"], ["↗️", "3.2K"]].map(([icon, count]) => (
            <div key={count} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 16 }}>{icon}</div>
              <div style={{ fontSize: 7, color: "#555", marginTop: 1 }}>{count}</div>
            </div>
          ))}
        </div>

        {/* Bottom nav bar */}
        <div style={{ borderTop: "1px solid #1c1c1c", padding: "8px 0 16px", display: "flex", justifyContent: "space-around" }}>
          {["🏠", "🔍", "➕", "📬", "👤"].map(icon => (
            <span key={icon} style={{ fontSize: 16 }}>{icon}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
