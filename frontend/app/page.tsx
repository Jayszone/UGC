"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveCompany, saveWizardConfig, clearSession } from "./lib/store";
import type { CompanyOption, CompanyProfile } from "./lib/types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8003";
const EXAMPLES = ["Duolingo", "DoorDash", "Hims & Hers", "Notion", "Stripe", "Blaze"];

function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sz = size === "lg" ? 42 : size === "md" ? 34 : 26;
  const fs = size === "lg" ? 20 : size === "md" ? 16 : 13;
  const em = size === "lg" ? 21 : size === "md" ? 17 : 13;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: sz, height: sz, borderRadius: sz * 0.26, background: "linear-gradient(135deg, #FF2D55 0%, #FFE234 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 14px rgba(255,45,85,0.35)" }}>
        <span style={{ fontSize: em }}>🎬</span>
      </div>
      <span style={{ fontSize: fs, fontWeight: 900, color: "#fff", letterSpacing: "-0.04em" }}>UGC Studio</span>
    </div>
  );
}

function Loading({ msg }: { msg: string }) {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 22 }}>
      <Logo size="md" />
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 36, height: 36, border: "3px solid #222", borderTop: "3px solid #FF2D55", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 14px" }} />
        <p style={{ fontSize: 15, fontWeight: 600, color: "#aaa", margin: 0 }}>{msg}</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Disambiguate({ rawName, options, onSelect, onBack }: {
  rawName: string; options: CompanyOption[]; onSelect: (o: CompanyOption) => void; onBack: () => void;
}) {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 32px" }}>
      <div style={{ marginBottom: 44 }}><Logo size="md" /></div>
      <div style={{ textAlign: "center", marginBottom: 32, maxWidth: 520 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#555", textTransform: "uppercase", margin: "0 0 8px 0" }}>You searched for</p>
        <h2 style={{ fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", margin: "0 0 10px 0" }}>{rawName}</h2>
        <p style={{ fontSize: 14, color: "#666", margin: 0 }}>Select the exact product so we can build your tailored UGC wizard.</p>
      </div>
      <div style={{ display: "grid", gap: 10, maxWidth: 580, width: "100%" }}>
        {options.map((opt, i) => (
          <button key={i} onClick={() => onSelect(opt)}
            style={{ background: "#111", border: "1.5px solid #222", borderRadius: 14, padding: "18px 22px", textAlign: "left", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, transition: "all 0.15s", outline: "none" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#FF2D55"; e.currentTarget.style.background = "#1a0006"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#222"; e.currentTarget.style.background = "#111"; }}
          >
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 3 }}>{opt.name}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#FF2D55", marginBottom: 5 }}>{opt.type}</div>
              <div style={{ fontSize: 13, color: "#666", lineHeight: 1.6 }}>{opt.description}</div>
            </div>
            <span style={{ fontSize: 20, color: "#333", flexShrink: 0 }}>→</span>
          </button>
        ))}
        <button onClick={onBack}
          style={{ background: "none", border: "1.5px solid #222", borderRadius: 14, padding: "13px 22px", textAlign: "center", cursor: "pointer", fontSize: 13, color: "#555", fontWeight: 600, transition: "border-color 0.15s", outline: "none" }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = "#444")}
          onMouseLeave={e => (e.currentTarget.style.borderColor = "#222")}
        >
          Search for a different company
        </button>
      </div>
    </div>
  );
}

function PhoneMockup() {
  return (
    <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
      <div style={{ width: 220, height: 440, background: "#111", borderRadius: 36, padding: "14px 10px 20px", boxShadow: "0 40px 80px rgba(255,45,85,0.15), 0 0 0 2px #222", position: "relative", overflow: "hidden" }}>
        <div style={{ width: 72, height: 22, background: "#000", borderRadius: 12, margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#1a1a1a", border: "1px solid #333" }} />
        </div>
        <div style={{ background: "#0a0a0a", borderRadius: 24, height: "100%", padding: "14px 12px", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 10, color: "#555", fontWeight: 700, letterSpacing: "0.1em" }}>SCRIPT #1</span>
            <span style={{ fontSize: 10, background: "linear-gradient(135deg,#FF2D55,#FFE234)", color: "#000", fontWeight: 800, padding: "2px 7px", borderRadius: 99 }}>Emotional</span>
          </div>
          <div style={{ fontSize: 11, color: "#fff", fontWeight: 700, lineHeight: 1.4, marginBottom: 10 }}>
            "My mom cried the first time the money arrived before I even hung up the phone."
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {["Scene 1: Creator in bedroom, soft lighting", "Scene 2: Live app screen, $300 transfer", "Scene 3: FaceTime — mom hears the ping"].map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                <span style={{ width: 14, height: 14, borderRadius: "50%", background: i === 0 ? "#FF2D55" : "#222", color: "#fff", fontSize: 7, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                <span style={{ fontSize: 9, color: "#666", lineHeight: 1.5 }}>{s}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, background: "linear-gradient(135deg,rgba(255,45,85,0.15),rgba(255,226,52,0.1))", border: "1px solid #FF2D55", borderRadius: 8, padding: "7px 10px" }}>
            <p style={{ fontSize: 8, color: "#FF2D55", fontWeight: 700, letterSpacing: "0.08em", margin: "0 0 2px 0" }}>CTA</p>
            <p style={{ fontSize: 10, color: "#fff", fontWeight: 700, margin: 0 }}>"Download Blaze. She'll have it before you finish saying goodbye."</p>
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: -40, left: "50%", transform: "translateX(-50%)", width: 200, height: 80, background: "radial-gradient(ellipse, rgba(255,45,85,0.25) 0%, transparent 70%)", pointerEvents: "none" }} />
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [screen, setScreen]       = useState<"landing" | "loading" | "disambiguating">("landing");
  const [company, setCompany]     = useState("");
  const [url, setUrl]             = useState("");
  const [options, setOptions]     = useState<CompanyOption[]>([]);
  const [loadingMsg, setLoadingMsg] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => { clearSession(); ref.current?.focus(); }, []);

  async function handleSearch(name: string, urlVal?: string) {
    if (name.trim().length < 2) return;
    setCompany(name); setScreen("loading"); setLoadingMsg(`Identifying "${name}"...`);
    try {
      const resp = await fetch(`${API}/api/company-options`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), url: urlVal?.trim() || undefined }),
      });
      const data = await resp.json();
      const opts: CompanyOption[] = data.options ?? [];
      if (opts.length <= 1) { await loadContext(opts[0] ?? { identifier: name, name, type: "", description: "" }, urlVal); }
      else { setOptions(opts); setScreen("disambiguating"); }
    } catch { await loadContext({ identifier: name, name, type: "", description: "" }, urlVal); }
  }

  async function loadContext(opt: CompanyOption, urlVal?: string) {
    setScreen("loading"); setLoadingMsg(`Building your ${opt.name} wizard...`);
    try {
      const resp = await fetch(`${API}/api/company-context`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: opt.identifier, name: opt.name, url: urlVal?.trim() || undefined }),
      });
      const data = await resp.json();
      saveCompany({ ...data.company, url: urlVal?.trim() || undefined } as CompanyProfile);
      saveWizardConfig(data.wizard);
      router.push("/build");
    } catch (e) { alert(`Could not load context.\n\n${e instanceof Error ? e.message : e}`); setScreen("landing"); }
  }

  if (screen === "loading") return <Loading msg={loadingMsg} />;
  if (screen === "disambiguating") return <Disambiguate rawName={company} options={options} onSelect={o => loadContext(o, url)} onBack={() => setScreen("landing")} />;

  const ready = company.trim().length >= 2;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", overflowX: "hidden" }}>
      {/* Nav */}
      <header style={{ borderBottom: "1px solid #1a1a1a", padding: "0 56px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "#0a0a0a", zIndex: 50 }}>
        <Logo size="md" />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, color: "#444" }}>Works for any brand</span>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#FF2D55", background: "rgba(255,45,85,0.1)", border: "1px solid rgba(255,45,85,0.3)", borderRadius: 99, padding: "3px 10px" }}>BETA</span>
        </div>
      </header>

      {/* Hero */}
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "72px 56px 80px", display: "flex", alignItems: "center", gap: 72, minHeight: "calc(100vh - 64px)" }}>
        {/* Left */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,45,85,0.1)", border: "1px solid rgba(255,45,85,0.3)", borderRadius: 99, padding: "5px 14px", marginBottom: 24 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF2D55" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#FF2D55", letterSpacing: "0.08em" }}>AI-POWERED UGC SCRIPTS</span>
          </div>

          <h1 style={{ fontSize: 52, fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", margin: "0 0 18px 0", lineHeight: 1.1 }}>
            Creator scripts for<br />
            <span style={{ background: "linear-gradient(90deg, #FF2D55, #FFE234)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>any brand.</span>
          </h1>
          <p style={{ fontSize: 17, color: "#666", margin: "0 0 36px 0", lineHeight: 1.7, maxWidth: 460 }}>
            Enter any company name. We build a custom campaign wizard and generate platform-ready UGC scripts — in 30 seconds.
          </p>

          {/* Form */}
          <form onSubmit={e => { e.preventDefault(); handleSearch(company, url); }} style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
              <div style={{ display: "flex", background: "#111", border: `1.5px solid ${ready ? "#FF2D55" : "#222"}`, borderRadius: 14, overflow: "hidden", transition: "border-color 0.2s", boxShadow: ready ? "0 0 0 3px rgba(255,45,85,0.12)" : "none" }}>
                <input
                  ref={ref} value={company} onChange={e => setCompany(e.target.value)}
                  placeholder="Enter company or product… e.g. Duolingo, DoorDash, Blaze"
                  style={{ flex: 1, background: "none", border: "none", padding: "14px 18px", fontSize: 15, color: "#fff", outline: "none", fontFamily: "inherit" }}
                />
                <button type="submit" disabled={!ready}
                  style={{ background: ready ? "#FF2D55" : "#1a1a1a", color: ready ? "#fff" : "#444", border: "none", padding: "14px 26px", fontSize: 14, fontWeight: 800, cursor: ready ? "pointer" : "not-allowed", whiteSpace: "nowrap", letterSpacing: "-0.01em", transition: "background 0.15s" }}
                >
                  Generate →
                </button>
              </div>
              <input
                value={url} onChange={e => setUrl(e.target.value)}
                placeholder="Product URL (optional — adds real pricing, specs & branding)"
                style={{ width: "100%", background: "#111", border: "1.5px solid #1a1a1a", borderRadius: 14, padding: "12px 18px", fontSize: 13, color: "#888", outline: "none", fontFamily: "inherit", boxSizing: "border-box", transition: "border-color 0.2s" }}
                onFocus={e => (e.currentTarget.style.borderColor = "#333")}
                onBlur={e => (e.currentTarget.style.borderColor = "#1a1a1a")}
              />
            </div>
            <p style={{ fontSize: 12, color: "#333", margin: 0 }}>Works for any US, EU, or global brand — consumer, B2B, startup, or enterprise.</p>
          </form>

          {/* Examples */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#444", textTransform: "uppercase", margin: "0 0 10px 0" }}>Try an example</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {EXAMPLES.map(c => (
                <button key={c} onClick={() => handleSearch(c)}
                  style={{ background: "#111", border: "1.5px solid #222", borderRadius: 99, padding: "7px 16px", fontSize: 13, color: "#888", fontWeight: 600, cursor: "pointer", transition: "all 0.15s", outline: "none" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#FF2D55"; e.currentTarget.style.color = "#FF2D55"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#222"; e.currentTarget.style.color = "#888"; }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right */}
        <div style={{ flexShrink: 0, width: 260 }}>
          <PhoneMockup />
        </div>
      </div>
    </div>
  );
}
