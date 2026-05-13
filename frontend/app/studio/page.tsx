"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { loadCampaign, loadCompany, saveCampaign } from "../lib/store";
import type { Campaign, Script, CompanyProfile, ChatMessage, CreativeBrief } from "../lib/types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8003";

// ── Color maps ─────────────────────────────────────────────────────────────────
const ANGLE_COLOR: Record<string, { bg: string; text: string }> = {
  Savings:       { bg: "rgba(22,163,74,0.15)",   text: "#4ade80" },
  Speed:         { bg: "rgba(37,99,235,0.15)",    text: "#60a5fa" },
  Emotional:     { bg: "rgba(255,45,85,0.15)",    text: "#FF2D55" },
  Controversial: { bg: "rgba(234,88,12,0.15)",    text: "#fb923c" },
  Educational:   { bg: "rgba(147,51,234,0.15)",   text: "#c084fc" },
  Relatable:     { bg: "rgba(13,148,136,0.15)",   text: "#2dd4bf" },
  FOMO:          { bg: "rgba(202,138,4,0.15)",    text: "#fbbf24" },
};
const ac = (angle: string) => ANGLE_COLOR[angle] ?? { bg: "rgba(255,45,85,0.1)", text: "#FF2D55" };

const EMOTION_ICON: Record<string, string> = {
  fear: "😰", curiosity: "🤔", relatability: "😅", aspiration: "🚀", humor: "😂",
};

// ── Personas ───────────────────────────────────────────────────────────────────
const PERSONAS = [
  { id: "gen_z",        label: "🧠 Gen Z",         desc: "Casual, slang-heavy, super relatable, no cap" },
  { id: "comedy",       label: "😂 Comedy",         desc: "Funny, self-deprecating, light-touch humor" },
  { id: "professional", label: "👔 Pro",            desc: "Calm, data-driven, authoritative delivery" },
  { id: "character",    label: "🎭 Character",       desc: "Strong persona — Obama, influencer, celeb" },
  { id: "sassy",        label: "💅 Sassy",           desc: "Bold, confident, zero filter" },
  { id: "storyteller",  label: "📖 Storyteller",     desc: "Narrative arc, emotional build-up" },
  { id: "hype",         label: "🔥 Hype",            desc: "Max energy, FOMO-heavy, loud" },
  { id: "skeptic",      label: "😤 Skeptic",         desc: "Doubt → proof → conversion arc" },
];

// ── Grid helpers ───────────────────────────────────────────────────────────────
function getGridTemplate(count: number): { cols: string; rows: string } {
  if (count === 1) return { cols: "1fr",         rows: "1fr" };
  if (count === 2) return { cols: "1fr 1fr",     rows: "1fr" };
  if (count === 3) return { cols: "1fr 1fr 1fr", rows: "1fr" };
  if (count === 4) return { cols: "1fr 1fr",     rows: "1fr 1fr" };
  if (count === 5) return { cols: "1fr 1fr 1fr", rows: "1fr 1fr" };
  return              { cols: "1fr 1fr 1fr", rows: "1fr 1fr" };
}

// ── Export ─────────────────────────────────────────────────────────────────────
function exportMarkdown(campaign: Campaign) {
  const brief = campaign.creative_brief;
  const ep = campaign.experiment_plan;
  const lines = [
    `# ${campaign.campaign_name}`, ``,
    `> ${campaign.target_insight}`, ``,
    `## Creative Brief`,
    `**Vibe:** ${brief?.vibe ?? "—"}`,
    `**Setup:** ${brief?.setup ?? "—"}`,
    `**Props:** ${brief?.props?.join(", ") ?? "—"}`,
    ...(brief?.hook_ideas ?? []).map(h => `- ${h}`), ``, `---`, ``,
    ...campaign.scripts.flatMap(s => [
      `## Script ${s.id}: ${s.title}`,
      `**Angle:** ${s.angle}  |  **Duration:** ${s.estimated_duration}`, ``,
      `**Hook:** "${s.hook}"`, ``,
      s.script, ``,
      ...s.scene_breakdown.map((sc, i) => `${i + 1}. ${sc}`), ``,
      `**CTA:** "${s.cta}"`, ``,
      `${s.hashtags.join(" ")}`, ``, `---`, ``,
    ]),
    `## Experiment Plan`,
    `**Hypothesis:** ${ep.hypothesis}`, ``,
    `**Winning Signal:** ${ep.winning_signal}`,
  ];
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/markdown" }));
  a.download = `${campaign.campaign_name.replace(/\s+/g, "_")}.md`;
  a.click();
}

// ── Script grid card ───────────────────────────────────────────────────────────
function ScriptGridCard({ script, index, onClick }: { script: Script; index: number; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  const col = ac(script.angle);
  const borderColor = hov ? col.text : "#1a1a1a";

  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ position: "relative", cursor: "pointer", display: "flex", flexDirection: "column", overflow: "hidden", background: "#0a0a0a", border: `2px solid ${borderColor}`, transition: "border-color 0.15s", boxShadow: hov ? `0 0 0 1px ${col.text}20, 0 8px 32px ${col.text}18` : "none" }}
    >
      {/* Colored top bar */}
      <div style={{ height: 3, background: col.text, flexShrink: 0 }} />

      {/* Header */}
      <div style={{ padding: "18px 20px 14px", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <span style={{ fontSize: 28, fontWeight: 900, color: "#1a1a1a", lineHeight: 1 }}>#{String(index + 1).padStart(2, "0")}</span>
          <span style={{ fontSize: 11, fontWeight: 700, background: col.bg, color: col.text, padding: "3px 10px", borderRadius: 99 }}>{script.angle}</span>
        </div>
        <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.45, margin: "0 0 6px 0", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          "{script.hook}"
        </p>
        <p style={{ fontSize: 11, color: "#444", margin: 0 }}>{script.title}</p>
      </div>

      {/* Preview */}
      <div style={{ padding: "12px 20px", flex: 1, overflow: "hidden", position: "relative", borderTop: "1px solid #111" }}>
        <p style={{ fontSize: 12, color: "#555", lineHeight: 1.7, margin: 0 }}>{script.script.slice(0, 180)}...</p>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 50, background: "linear-gradient(transparent, #0a0a0a)", pointerEvents: "none" }} />
      </div>

      {/* Footer */}
      <div style={{ padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #111", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
          <span style={{ fontSize: 10, color: "#444", background: "#111", border: "1px solid #1a1a1a", padding: "2px 8px", borderRadius: 99 }}>{script.estimated_duration}</span>
          <span style={{ fontSize: 13 }}>{EMOTION_ICON[script.emotion_trigger] ?? "✨"}</span>
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: hov ? col.text : "#333", transition: "color 0.15s" }}>
          {hov ? "Open →" : "Tap to expand →"}
        </span>
      </div>
    </div>
  );
}

// ── Expanded view ──────────────────────────────────────────────────────────────
function ExpandedView({ script, brief, company, targetInsight, chats, onClose, onRefine, refining }: {
  script: Script; brief: CreativeBrief | undefined; company: CompanyProfile | null;
  targetInsight: string; chats: ChatMessage[]; onClose: () => void;
  onRefine: (msg: string) => void; refining: boolean;
}) {
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const [customStyle, setCustomStyle]          = useState("");
  const [chatInput, setChatInput]              = useState("");
  const [briefOpen, setBriefOpen]              = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const col = ac(script.angle);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chats]);

  function personalize() {
    const persona = PERSONAS.find(p => p.id === selectedPersona);
    const msg = persona
      ? `Rewrite this script in ${persona.label} style (${persona.desc}).${customStyle ? ` Additional creator style notes: ${customStyle}` : ""} Keep the same product facts, angle and content — only change the voice, language and delivery style.`
      : `Rewrite this script to match this creator's personal style: "${customStyle}". Keep the same product facts and content — only change the voice and delivery.`;
    onRefine(msg);
  }

  function sendChat() {
    if (!chatInput.trim() || refining) return;
    onRefine(chatInput.trim()); setChatInput("");
  }

  const canPersonalize = (selectedPersona !== null || customStyle.trim().length > 0) && !refining;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "#0a0a0a", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ height: 60, borderBottom: "1px solid #1a1a1a", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, background: "#111" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onClose}
            style={{ background: "#1a1a1a", border: "1px solid #222", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 600, color: "#888", cursor: "pointer", outline: "none" }}
          >← All scripts</button>
          <span style={{ color: "#222" }}>|</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{script.title}</span>
          <span style={{ fontSize: 11, fontWeight: 700, background: col.bg, color: col.text, padding: "2px 9px", borderRadius: 99 }}>{script.angle}</span>
          <span style={{ fontSize: 11, color: "#444", background: "#1a1a1a", border: "1px solid #222", padding: "2px 9px", borderRadius: 99 }}>{script.estimated_duration}</span>
        </div>
        <span style={{ fontSize: 12, color: "#333" }}>Script #{script.id}</span>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* LEFT: script content */}
        <div style={{ flex: "0 0 60%", overflowY: "auto", padding: "32px 36px", borderRight: "1px solid #1a1a1a" }}>
          {/* Hook */}
          <div style={{ background: col.bg, border: `1px solid ${col.text}40`, borderRadius: 14, padding: "18px 22px", marginBottom: 24 }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: col.text, textTransform: "uppercase", margin: "0 0 8px 0" }}>Hook</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: "#fff", lineHeight: 1.5, margin: 0 }}>"{script.hook}"</p>
          </div>

          {/* Script */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#444", textTransform: "uppercase", margin: "0 0 12px 0" }}>Full Script</p>
            <p style={{ fontSize: 15, color: "#ccc", lineHeight: 1.85, margin: 0, whiteSpace: "pre-wrap" }}>{script.script}</p>
          </div>

          {/* Scenes */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#444", textTransform: "uppercase", margin: "0 0 12px 0" }}>Scene Breakdown</p>
            {script.scene_breakdown.map((sc, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10 }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", background: i === 0 ? "#FF2D55" : "#1a1a1a", color: "#fff", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>{i + 1}</span>
                <span style={{ fontSize: 14, color: "#888", lineHeight: 1.6 }}>{sc}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ background: "rgba(255,226,52,0.08)", border: "1px solid rgba(255,226,52,0.3)", borderRadius: 12, padding: "14px 18px", marginBottom: 24 }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#FFE234", textTransform: "uppercase", margin: "0 0 6px 0" }}>CTA</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: 0 }}>"{script.cta}"</p>
          </div>

          {/* Creator direction */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#444", textTransform: "uppercase", margin: "0 0 8px 0" }}>Creator Direction</p>
            <p style={{ fontSize: 14, color: "#666", fontStyle: "italic", lineHeight: 1.7, margin: 0 }}>{script.creator_direction}</p>
          </div>

          {/* Hashtags */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {script.hashtags.map((tag, i) => (
              <span key={i} style={{ fontSize: 12, color: "#60a5fa", background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.2)", padding: "3px 10px", borderRadius: 99 }}>{tag}</span>
            ))}
          </div>
        </div>

        {/* RIGHT: personalization + brief + chat */}
        <div style={{ flex: "0 0 40%", display: "flex", flexDirection: "column", overflow: "hidden", background: "#0a0a0a" }}>
          {/* MAKE IT YOURS */}
          <div style={{ padding: "24px 24px 20px", borderBottom: "1px solid #1a1a1a", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 14 }}>✨</span>
              <p style={{ fontSize: 13, fontWeight: 800, color: "#fff", margin: 0 }}>Make it yours</p>
            </div>
            <p style={{ fontSize: 12, color: "#555", margin: "0 0 16px 0" }}>Personalize this script to your creator style.</p>

            {/* Persona chips */}
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#444", textTransform: "uppercase", margin: "0 0 8px 0" }}>Pick a style</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 14 }}>
              {PERSONAS.map(p => {
                const sel = selectedPersona === p.id;
                return (
                  <button key={p.id} onClick={() => setSelectedPersona(sel ? null : p.id)}
                    style={{ background: sel ? "rgba(255,226,52,0.12)" : "#111", border: `1.5px solid ${sel ? "#FFE234" : "#1a1a1a"}`, borderRadius: 8, padding: "8px 10px", cursor: "pointer", textAlign: "left", outline: "none", transition: "all 0.15s" }}
                    title={p.desc}
                  >
                    <span style={{ fontSize: 12, fontWeight: sel ? 700 : 500, color: sel ? "#FFE234" : "#888" }}>{p.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom input */}
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#444", textTransform: "uppercase", margin: "0 0 8px 0" }}>Or describe your style</p>
            <textarea
              value={customStyle}
              onChange={e => setCustomStyle(e.target.value)}
              placeholder={`e.g. "I'm known for my Obama impressions and dad jokes" or "I speak very fast with lots of Gen Z slang"`}
              rows={3}
              style={{ width: "100%", background: "#111", border: "1.5px solid #1a1a1a", borderRadius: 10, padding: "10px 12px", fontSize: 12, color: "#ccc", outline: "none", fontFamily: "inherit", resize: "none", boxSizing: "border-box", lineHeight: 1.5, transition: "border-color 0.15s" }}
              onFocus={e => (e.currentTarget.style.borderColor = "#FF2D55")}
              onBlur={e => (e.currentTarget.style.borderColor = "#1a1a1a")}
            />

            <button onClick={personalize} disabled={!canPersonalize}
              style={{ marginTop: 10, width: "100%", background: canPersonalize ? "linear-gradient(135deg, #FF2D55, #FFE234)" : "#111", color: canPersonalize ? "#fff" : "#333", border: "none", borderRadius: 10, padding: "11px", fontSize: 13, fontWeight: 800, cursor: canPersonalize ? "pointer" : "not-allowed", letterSpacing: "-0.01em", transition: "opacity 0.15s", opacity: canPersonalize ? 1 : 0.5 }}
            >
              {refining ? "Personalizing..." : "Personalize script →"}
            </button>
          </div>

          {/* Creative brief accordion */}
          <div style={{ borderBottom: "1px solid #1a1a1a", flexShrink: 0 }}>
            <button onClick={() => setBriefOpen(o => !o)}
              style={{ width: "100%", background: "none", border: "none", padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", outline: "none" }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#444", textTransform: "uppercase" }}>Creative Brief</span>
              <span style={{ fontSize: 14, color: "#444", transition: "transform 0.2s", display: "inline-block", transform: briefOpen ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
            </button>
            {briefOpen && brief && (
              <div style={{ padding: "0 24px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                <div><span style={{ fontSize: 10, fontWeight: 700, color: "#444" }}>VIBE </span><span style={{ fontSize: 12, color: "#888" }}>{brief.vibe}</span></div>
                <div><span style={{ fontSize: 10, fontWeight: 700, color: "#444" }}>SETUP </span><span style={{ fontSize: 12, color: "#888" }}>{brief.setup}</span></div>
                <div><span style={{ fontSize: 10, fontWeight: 700, color: "#444" }}>PROPS </span><span style={{ fontSize: 12, color: "#888" }}>{brief.props?.join(" · ")}</span></div>
                {brief.hook_ideas?.length > 0 && (
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, color: "#444", margin: "0 0 4px 0" }}>HOOK IDEAS</p>
                    {brief.hook_ideas.map((h, i) => <p key={i} style={{ fontSize: 11, color: "#666", margin: 0, lineHeight: 1.5 }}>• {h}</p>)}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Chat */}
          <div style={{ flex: 1, overflowY: "auto", padding: "14px 24px" }}>
            {chats.length === 0 ? (
              <p style={{ fontSize: 12, color: "#333", textAlign: "center", marginTop: 16, lineHeight: 1.7 }}>
                Personalize above, or type a specific request below<br />
                <span style={{ fontSize: 11, color: "#222" }}>e.g. "make the hook punchier" or "add more urgency"</span>
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {chats.map((msg, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                    <div style={{ maxWidth: "85%", padding: "9px 13px", borderRadius: 10, fontSize: 12, lineHeight: 1.55, background: msg.role === "user" ? "#FF2D55" : "#111", color: msg.role === "user" ? "#fff" : "#888", border: msg.role === "assistant" ? "1px solid #1a1a1a" : "none" }}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {refining && (
                  <div style={{ display: "flex", gap: 4, padding: "6px 0" }}>
                    {[0, 150, 300].map(delay => (
                      <div key={delay} style={{ width: 5, height: 5, borderRadius: "50%", background: "#444", animation: `bounce 0.8s infinite ${delay}ms` }} />
                    ))}
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {/* Chat input */}
          <div style={{ padding: "12px 20px", borderTop: "1px solid #1a1a1a", flexShrink: 0 }}>
            <div style={{ display: "flex", gap: 7 }}>
              <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendChat()} disabled={refining}
                placeholder="Refine further… e.g. make it shorter"
                style={{ flex: 1, background: "#111", border: "1.5px solid #1a1a1a", borderRadius: 9, padding: "9px 12px", fontSize: 12, color: "#ccc", outline: "none", fontFamily: "inherit" }}
              />
              <button onClick={sendChat} disabled={!chatInput.trim() || refining}
                style={{ background: chatInput.trim() && !refining ? "#1a1a1a" : "#0a0a0a", color: chatInput.trim() && !refining ? "#fff" : "#333", border: `1px solid ${chatInput.trim() && !refining ? "#333" : "#111"}`, borderRadius: 9, padding: "9px 14px", fontSize: 12, fontWeight: 700, cursor: chatInput.trim() && !refining ? "pointer" : "not-allowed", whiteSpace: "nowrap", transition: "all 0.15s" }}
              >
                {refining ? "..." : "→"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }`}</style>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function StudioPage() {
  const router = useRouter();
  const [campaign, setCampaignState] = useState<Campaign | null>(null);
  const [company, setCompany]        = useState<CompanyProfile | null>(null);
  const [scripts, setScripts]        = useState<Script[]>([]);
  const [expandedId, setExpandedId]  = useState<number | null>(null);
  const [chats, setChats]            = useState<Record<number, ChatMessage[]>>({});
  const [refining, setRefining]      = useState(false);
  const [gridInput, setGridInput]    = useState("");
  const [gridScriptId, setGridScriptId] = useState<number>(0);

  useEffect(() => {
    const data = loadCampaign(); const comp = loadCompany();
    if (!data) { router.replace("/"); return; }
    setCampaignState(data); setCompany(comp);
    setScripts(data.scripts ?? []);
    setGridScriptId(data.scripts?.[0]?.id ?? 0);
  }, [router]);

  if (!campaign) return null;

  const expandedScript = scripts.find(s => s.id === expandedId) ?? null;
  const { cols, rows } = getGridTemplate(scripts.length);

  async function handleRefine(scriptId: number, message: string) {
    const script = scripts.find(s => s.id === scriptId);
    if (!script || !message.trim() || refining) return;
    setRefining(true);
    setChats(prev => ({ ...prev, [scriptId]: [...(prev[scriptId] ?? []), { role: "user", content: message }] }));
    try {
      const resp = await fetch(`${API}/api/refine`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script, message, company: company ?? {}, campaign_context: campaign.target_insight ?? "" }),
      });
      const data = await resp.json();
      const updated: Script = data.script;
      setScripts(prev => prev.map(s => s.id === scriptId ? updated : s));
      saveCampaign({ ...campaign, scripts: scripts.map(s => s.id === scriptId ? updated : s) });
      setChats(prev => ({ ...prev, [scriptId]: [...(prev[scriptId] ?? []), { role: "assistant", content: "✓ Script updated — changes applied on the left." }] }));
    } catch {
      setChats(prev => ({ ...prev, [scriptId]: [...(prev[scriptId] ?? []), { role: "assistant", content: "Refinement failed. Please try again." }] }));
    } finally { setRefining(false); }
  }

  async function handleGridChat() {
    if (!gridInput.trim() || gridScriptId === 0) return;
    const msg = gridInput.trim(); setGridInput("");
    setExpandedId(gridScriptId);
    setTimeout(() => handleRefine(gridScriptId, msg), 80);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff" }}>
      {expandedScript && (
        <ExpandedView
          script={expandedScript} brief={campaign.creative_brief} company={company}
          targetInsight={campaign.target_insight}
          chats={chats[expandedScript.id] ?? []}
          onClose={() => setExpandedId(null)}
          onRefine={msg => handleRefine(expandedScript.id, msg)}
          refining={refining}
        />
      )}

      {/* Nav */}
      <header style={{ height: 60, borderBottom: "1px solid #1a1a1a", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "#111", zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#FF2D55,#FFE234)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 14 }}>🎬</span>
          </div>
          <span style={{ fontSize: 15, fontWeight: 900, letterSpacing: "-0.04em" }}>UGC Studio</span>
          {company && <><span style={{ color: "#222" }}>/</span><span style={{ fontSize: 14, fontWeight: 700 }}>{company.name}</span></>}
          <span style={{ fontSize: 11, color: "#444", background: "#1a1a1a", border: "1px solid #222", padding: "2px 9px", borderRadius: 99, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{campaign.campaign_name}</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => { const t = scripts.map(s => `--- Script ${s.id}: ${s.title} ---\nHook: "${s.hook}"\n\n${s.script}\n\nCTA: "${s.cta}"\n`).join("\n"); navigator.clipboard.writeText(t); }}
            style={{ background: "#1a1a1a", color: "#888", border: "1px solid #222", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
          >Copy all</button>
          <button onClick={() => exportMarkdown(campaign)}
            style={{ background: "rgba(255,226,52,0.08)", color: "#FFE234", border: "1px solid rgba(255,226,52,0.2)", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
          >Export .md</button>
          <button onClick={() => router.push("/")}
            style={{ background: "linear-gradient(135deg,#FF2D55,#FFE234)", color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 800, cursor: "pointer" }}
          >+ New campaign</button>
        </div>
      </header>

      {/* Instruction banner */}
      <div style={{ background: "linear-gradient(90deg, rgba(255,45,85,0.12), rgba(255,226,52,0.08))", borderBottom: "1px solid rgba(255,45,85,0.15)", padding: "9px 24px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 13 }}>👇</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#888" }}>
          Select any script below to expand, personalize to your creator style, and export
        </span>
      </div>

      {/* Script grid */}
      <div style={{ display: "grid", gridTemplateColumns: cols, gridTemplateRows: rows, height: "calc(100vh - 60px - 38px - 72px)" }}>
        {scripts.map((s, i) => (
          <ScriptGridCard key={s.id} script={s} index={i} onClick={() => setExpandedId(s.id)} />
        ))}
      </div>

      {/* Experiment plan (below fold) */}
      <div style={{ padding: "48px 36px 108px", background: "#0a0a0a", borderTop: "1px solid #111" }}>
        <div style={{ maxWidth: 800, marginBottom: 40 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#333", textTransform: "uppercase", margin: "0 0 10px 0" }}>Target Insight</p>
          <p style={{ fontSize: 16, color: "#666", lineHeight: 1.8, margin: 0 }}>{campaign.target_insight}</p>
        </div>
        <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 20, padding: "28px 32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,226,52,0.1)", border: "1px solid rgba(255,226,52,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🧪</div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "#fff", margin: 0 }}>Growth Experiment Plan</h2>
              <p style={{ fontSize: 12, color: "#444", margin: 0 }}>How to run and measure this campaign</p>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
            <div>
              {[["Hypothesis", campaign.experiment_plan.hypothesis], ["Test Design", campaign.experiment_plan.test_design], ["Timeline", campaign.experiment_plan.timeline]].map(([label, val]) => (
                <div key={label} style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#333", textTransform: "uppercase", margin: "0 0 6px 0" }}>{label}</p>
                  <p style={{ fontSize: 14, color: "#666", lineHeight: 1.7, margin: 0 }}>{val}</p>
                </div>
              ))}
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#333", textTransform: "uppercase", margin: "0 0 10px 0" }}>Metrics</p>
              {campaign.experiment_plan.metrics.map((m, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", background: "#0a0a0a", border: `1px solid ${i === 0 ? "#FF2D55" : "#1a1a1a"}`, borderRadius: 8, padding: "9px 12px", marginBottom: 7 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: i === 0 ? "#FF2D55" : "#222", flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: i === 0 ? "#FF2D55" : "#555", fontWeight: i === 0 ? 700 : 400 }}>{m}{i === 0 && <span style={{ fontSize: 10, color: "#333", fontWeight: 400 }}> — primary</span>}</span>
                </div>
              ))}
              <div style={{ background: "rgba(255,226,52,0.06)", border: "1px solid rgba(255,226,52,0.15)", borderRadius: 12, padding: "14px 16px", marginTop: 14 }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#FFE234", textTransform: "uppercase", margin: "0 0 6px 0" }}>Winning Signal</p>
                <p style={{ fontSize: 13, color: "#ccc", fontWeight: 600, lineHeight: 1.55, margin: 0 }}>{campaign.experiment_plan.winning_signal}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed chat bar */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 72, background: "#111", borderTop: "1px solid #1a1a1a", padding: "0 24px", display: "flex", alignItems: "center", gap: 10, zIndex: 40 }}>
        <span style={{ fontSize: 12, color: "#444", fontWeight: 600, flexShrink: 0 }}>Refine:</span>
        <select value={gridScriptId} onChange={e => setGridScriptId(Number(e.target.value))}
          style={{ background: "#1a1a1a", border: "1px solid #222", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#888", cursor: "pointer", outline: "none", fontFamily: "inherit", flexShrink: 0 }}
        >
          {scripts.map(s => <option key={s.id} value={s.id}>Script {s.id}: {s.title.slice(0, 28)}{s.title.length > 28 ? "…" : ""}</option>)}
        </select>
        <input value={gridInput} onChange={e => setGridInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleGridChat()}
          placeholder="What would you like to change? e.g. make it more emotional, shorter hook, Gen Z style…"
          style={{ flex: 1, background: "#1a1a1a", border: "1px solid #222", borderRadius: 9, padding: "10px 14px", fontSize: 13, color: "#ccc", outline: "none", fontFamily: "inherit" }}
        />
        <button onClick={handleGridChat} disabled={!gridInput.trim()}
          style={{ background: gridInput.trim() ? "#FF2D55" : "#1a1a1a", color: gridInput.trim() ? "#fff" : "#333", border: "none", borderRadius: 9, padding: "10px 22px", fontSize: 13, fontWeight: 700, cursor: gridInput.trim() ? "pointer" : "not-allowed", whiteSpace: "nowrap", transition: "background 0.15s", boxShadow: gridInput.trim() ? "0 4px 14px rgba(255,45,85,0.3)" : "none" }}
        >Send →</button>
      </div>
    </div>
  );
}
