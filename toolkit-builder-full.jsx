import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Send,
  Mic,
  Paperclip,
  SlidersHorizontal,
  ChevronDown,
  ExternalLink,
  Info,
  X,
  CheckCircle2,
  AlertTriangle,
  PenLine,
  Zap,
  Rocket,
  RotateCcw,
  Plus,
  Menu,
  LayoutGrid,
  Layers,
  Settings,
  HelpCircle,
} from "lucide-react";

/* Palette matches Diligent's actual product — deep red/maroon as the brand
   accent, dark navy for app chrome, light paper for content. Swapped in to
   replace the earlier brass/charcoal "AI console" theme; every COLOR.xxx
   reference below is unchanged, only what it resolves to has changed, so
   the whole app re-themes from this one block. */
const COLOR = {
  canvas: "#F7F5F1",
  surface: "#FFFFFF",
  surfaceRaised: "#F1EEE8",
  hairline: "#E4E0D6",
  ink: "#1E1B18",
  inkMuted: "#6B655C",
  brass: "#D6402A",
  brassDark: "#A8301F",
  onBrass: "#FFFFFF",
  verdict: "#2F7D4F",
  verdictBg: "#E6F2EA",
  escalate: "#7A2318",
  escalateBg: "#F3E3E0",
  navy: "#14161F",
  navyLight: "#1F222E",
  navyLine: "#2B2E3B",
};

/* Diligent's real UI uses a clean geometric sans throughout, not an
   editorial serif — FONT.serif is repointed to the same sans so every
   heading that referenced it updates without touching each call site. */
const FONT = {
  serif: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  sans: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  mono: "'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace",
};

/* Placeholder left-nav — swap for the real IA once the Figma frame is
   available; kept as a single array so relabeling is a one-place edit. */
const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { key: "toolkits", label: "My toolkits", icon: Layers },
  { key: "settings", label: "Settings", icon: Settings },
];

const CAP_KEYS = ["Document analysis", "Risk flagging", "Auto-summarization", "Data extraction", "Smart suggestions"];
const DOMAIN_OPTIONS = ["Governance", "Compliance", "Contracts", "Risk", "Identity security"];
const DRAFT_STEPS = ["Reading your request…", "Choosing capabilities…", "Calibrating guardrails…", "Drafting the toolkit…"];
const EXAMPLE_PROMPTS = [
  "Contract review assistant that flags risky clauses",
  "Vendor risk triage that escalates to legal",
  "Auto-draft routine board resolutions",
  "Policy exception routing with a full audit trail",
];
const SCENARIOS = [
  { text: "Flag clause 4.2 — indemnification language deviates from the standard template.", confidence: 82 },
  { text: "Summarize the vendor contract into a 3-line risk brief for legal review.", confidence: 91 },
  { text: "Extract the renewal date and populate the compliance calendar.", confidence: 95 },
  { text: "Recommend rejecting the counterparty's liability cap — below policy minimum.", confidence: 58 },
];

/* Tone → color mapping for dashboard status pills. Sub-status meaning drives
   the color, not just which bucket it's in — a validation error reads as an
   error even though the toolkit is still technically "in progress". */
const TONE = {
  neutral: { bg: COLOR.surfaceRaised, text: COLOR.inkMuted },
  error: { bg: COLOR.escalateBg, text: COLOR.escalate },
  success: { bg: COLOR.verdictBg, text: COLOR.verdict },
  rejected: { bg: COLOR.escalateBg, text: COLOR.escalate },
};

/* Mock toolkit library for the dashboard. In a real build this is an API
   call; here it's static so the landing page has something real to show. */
const TOOLKITS = [
  {
    id: "sox-storyboard",
    name: "SOX Storyboard Toolkit",
    version: 2,
    bucket: "completed",
    subStatus: "Approved & published",
    tone: "success",
    domains: ["Governance", "Compliance"],
    installs: 1204,
    lastUpdated: "3 days ago",
    description: "Walks SOX control owners through evidence collection and flags storyboard gaps before audit season.",
    capabilities: { "Document analysis": { enabled: true, threshold: 75 }, "Risk flagging": { enabled: true, threshold: 80 }, "Auto-summarization": { enabled: false, threshold: 70 }, "Data extraction": { enabled: true, threshold: 70 }, "Smart suggestions": { enabled: true, threshold: 70 } },
    guardrails: { requireApproval: true, showConfidence: true, escalationThreshold: 80, auditLog: true },
    reasoning: ["Kept approval required — SOX evidence has audit implications.", "Raised the escalation threshold to 80% after partner feedback on v1."],
    versionHistory: [
      { version: 1, date: "Jan 2026", note: "Initial release — document analysis and smart suggestions only." },
      { version: 2, date: "3 days ago", note: "Added risk flagging and data extraction; raised escalation threshold to 80%." },
    ],
  },
  {
    id: "vendor-risk-triage",
    name: "Vendor Risk Triage Toolkit",
    version: 1,
    bucket: "completed",
    subStatus: "Approved & published",
    tone: "success",
    domains: ["Risk"],
    installs: 340,
    lastUpdated: "2 weeks ago",
    description: "Scores inbound vendor risk assessments and routes anything above policy threshold to legal.",
    capabilities: { "Document analysis": { enabled: true, threshold: 70 }, "Risk flagging": { enabled: true, threshold: 75 }, "Auto-summarization": { enabled: true, threshold: 65 }, "Data extraction": { enabled: false, threshold: 70 }, "Smart suggestions": { enabled: false, threshold: 70 } },
    guardrails: { requireApproval: true, showConfidence: true, escalationThreshold: 75, auditLog: true },
    reasoning: ["Enabled risk flagging and summarization to match the triage workflow."],
    versionHistory: [{ version: 1, date: "2 weeks ago", note: "Initial release." }],
  },
  {
    id: "board-resolution",
    name: "Board Resolution Assistant",
    version: 3,
    bucket: "completed",
    subStatus: "Approved & published",
    tone: "success",
    domains: ["Governance"],
    installs: 812,
    lastUpdated: "1 month ago",
    description: "Drafts routine board resolutions from meeting notes and checks them against prior approved language.",
    capabilities: { "Document analysis": { enabled: true, threshold: 70 }, "Risk flagging": { enabled: false, threshold: 70 }, "Auto-summarization": { enabled: true, threshold: 70 }, "Data extraction": { enabled: false, threshold: 70 }, "Smart suggestions": { enabled: true, threshold: 65 } },
    guardrails: { requireApproval: false, showConfidence: true, escalationThreshold: 60, auditLog: true },
    reasoning: ["Auto-apply enabled for routine resolutions after two versions of clean approval history."],
    versionHistory: [
      { version: 1, date: "Aug 2025", note: "Initial release, approval required on every draft." },
      { version: 2, date: "Nov 2025", note: "Added smart suggestions for recurring resolution language." },
      { version: 3, date: "1 month ago", note: "Turned off required approval for routine resolutions." },
    ],
  },
  {
    id: "contract-review-companion",
    name: "Contract Review Companion",
    version: 1,
    bucket: "inprogress",
    subStatus: "Validating",
    tone: "neutral",
    domains: ["Contracts"],
    lastUpdated: "2 hours ago",
    description: "Flags non-standard clauses in inbound vendor contracts before they reach legal.",
    capabilities: { "Document analysis": { enabled: true, threshold: 75 }, "Risk flagging": { enabled: true, threshold: 80 }, "Auto-summarization": { enabled: false, threshold: 70 }, "Data extraction": { enabled: false, threshold: 70 }, "Smart suggestions": { enabled: false, threshold: 70 } },
    guardrails: { requireApproval: true, showConfidence: true, escalationThreshold: 78, auditLog: true },
    reasoning: ["Kept a human in the loop — this touches legal risk."],
    versionHistory: [{ version: 1, date: "2 hours ago", note: "Submitted for validation." }],
  },
  {
    id: "policy-exception-router",
    name: "Policy Exception Router",
    version: 1,
    bucket: "inprogress",
    subStatus: "Awaiting Diligent review",
    tone: "neutral",
    domains: ["Compliance", "Risk"],
    lastUpdated: "1 day ago",
    description: "Routes policy exception requests to the right approver based on exception type and business impact.",
    capabilities: { "Document analysis": { enabled: true, threshold: 70 }, "Risk flagging": { enabled: true, threshold: 75 }, "Auto-summarization": { enabled: false, threshold: 70 }, "Data extraction": { enabled: false, threshold: 70 }, "Smart suggestions": { enabled: true, threshold: 70 } },
    guardrails: { requireApproval: true, showConfidence: true, escalationThreshold: 75, auditLog: true },
    reasoning: ["Passed automated checks — waiting on Diligent's manual review queue."],
    versionHistory: [{ version: 1, date: "1 day ago", note: "Passed validation, submitted for review." }],
  },
  {
    id: "identity-access-review",
    name: "Identity Access Review Kit",
    version: 1,
    bucket: "inprogress",
    subStatus: "Validation failed",
    tone: "error",
    domains: ["Identity security"],
    lastUpdated: "5 hours ago",
    description: "Flags stale or over-provisioned access during quarterly identity reviews.",
    capabilities: { "Document analysis": { enabled: true, threshold: 70 }, "Risk flagging": { enabled: true, threshold: 70 }, "Auto-summarization": { enabled: false, threshold: 70 }, "Data extraction": { enabled: true, threshold: 70 }, "Smart suggestions": { enabled: false, threshold: 70 } },
    guardrails: { requireApproval: true, showConfidence: true, escalationThreshold: 70, auditLog: true },
    reasoning: ["Code validation failed — missing a rollback plan and a README."],
    versionHistory: [{ version: 1, date: "5 hours ago", note: "Submitted, failed automated code validation." }],
  },
  {
    id: "data-retention-auditor",
    name: "Data Retention Auditor",
    version: 1,
    bucket: "inprogress",
    subStatus: "Ready for testing",
    tone: "success",
    domains: ["Compliance"],
    lastUpdated: "6 hours ago",
    description: "Checks stored records against retention policy and flags anything past its disposal date.",
    capabilities: { "Document analysis": { enabled: true, threshold: 70 }, "Risk flagging": { enabled: false, threshold: 70 }, "Auto-summarization": { enabled: false, threshold: 70 }, "Data extraction": { enabled: true, threshold: 75 }, "Smart suggestions": { enabled: false, threshold: 70 } },
    guardrails: { requireApproval: true, showConfidence: true, escalationThreshold: 72, auditLog: true },
    reasoning: ["Passed all automated tests — available in the test org now."],
    versionHistory: [{ version: 1, date: "6 hours ago", note: "Passed testing, awaiting your sign-off before Diligent review." }],
  },
  {
    id: "third-party-risk-scorecard",
    name: "Third-Party Risk Scorecard",
    version: 1,
    bucket: "rejected",
    subStatus: "Not approved",
    tone: "rejected",
    domains: ["Risk", "Compliance"],
    lastUpdated: "4 days ago",
    description: "Scores third-party vendors against a standard risk rubric and recommends a review cadence.",
    capabilities: { "Document analysis": { enabled: true, threshold: 70 }, "Risk flagging": { enabled: true, threshold: 70 }, "Auto-summarization": { enabled: false, threshold: 70 }, "Data extraction": { enabled: false, threshold: 70 }, "Smart suggestions": { enabled: false, threshold: 70 } },
    guardrails: { requireApproval: true, showConfidence: false, escalationThreshold: 65, auditLog: false },
    reasoning: ["Confidence scoring was left off — Diligent's review flagged this as a trust gap."],
    versionHistory: [{ version: 1, date: "4 days ago", note: "Submitted for review." }],
    rejectionReasons: [
      "No user guide included with the submission.",
      "Guardrail thresholds aren't documented anywhere in the package.",
      "Audit logging is off with no explanation for why.",
    ],
  },
  {
    id: "whistleblower-intake",
    name: "Whistleblower Intake Assistant",
    version: 1,
    bucket: "rejected",
    subStatus: "Not approved",
    tone: "rejected",
    domains: ["Governance", "Compliance"],
    lastUpdated: "1 week ago",
    description: "Triages inbound whistleblower reports and routes sensitive cases directly to the audit committee.",
    capabilities: { "Document analysis": { enabled: true, threshold: 70 }, "Risk flagging": { enabled: true, threshold: 70 }, "Auto-summarization": { enabled: true, threshold: 70 }, "Data extraction": { enabled: false, threshold: 70 }, "Smart suggestions": { enabled: false, threshold: 70 } },
    guardrails: { requireApproval: true, showConfidence: true, escalationThreshold: 60, auditLog: true },
    reasoning: ["Escalation path wasn't specific enough for a case type this sensitive."],
    versionHistory: [{ version: 1, date: "1 week ago", note: "Submitted for review." }],
    rejectionReasons: [
      "Escalation routing doesn't name a specific recipient for high-severity cases.",
      "No evidence of testing against anonymized-report scenarios.",
    ],
  },
];

const SCHEMA_NOTE =
  'Respond with ONLY valid JSON, no markdown fences, no prose, matching exactly this shape: {"name": string (under 6 words), "description": string (one sentence), "domains": array from ["Governance","Compliance","Contracts","Risk","Identity security"], "capabilities": {"Document analysis": {"enabled": boolean, "threshold": number 40-99}, "Risk flagging": {...}, "Auto-summarization": {...}, "Data extraction": {...}, "Smart suggestions": {...}}, "guardrails": {"requireApproval": boolean, "showConfidence": boolean, "escalationThreshold": number 40-95, "auditLog": boolean}, "reasoning": array of 2-4 short strings (under 15 words each) explaining the choices in plain language}.';

const DRAFT_SYSTEM = `You configure an enterprise AI-assistant toolkit from a plain-language request. Base enabled capabilities and guardrail strictness on the risk and sensitivity implied by the request. ${SCHEMA_NOTE}`;

const REFINE_SYSTEM = `You update an existing enterprise AI-assistant toolkit configuration based on a follow-up instruction. You'll get the current configuration as JSON and a plain instruction. Keep every field unchanged unless the instruction clearly implies a change. In "reasoning", describe only what changed and why. ${SCHEMA_NOTE}`;

function emptyCaps() {
  const c = {};
  CAP_KEYS.forEach((k) => (c[k] = { enabled: false, threshold: 70 }));
  return c;
}

function localHeuristic(text) {
  const lower = text.toLowerCase();
  const caps = emptyCaps();
  if (/summar/.test(lower)) caps["Auto-summarization"].enabled = true;
  if (/extract|renewal|date|calendar/.test(lower)) caps["Data extraction"].enabled = true;
  if (/risk|flag/.test(lower)) caps["Risk flagging"].enabled = true;
  if (/document|analy/.test(lower)) caps["Document analysis"].enabled = true;
  if (/suggest|draft|recommend|resolution/.test(lower)) caps["Smart suggestions"].enabled = true;
  if (!Object.values(caps).some((c) => c.enabled)) {
    caps["Document analysis"].enabled = true;
    caps["Smart suggestions"].enabled = true;
  }
  const strict = /strict|complian|legal|sensitive|high.?risk|regulat|audit/.test(lower);
  const domains = DOMAIN_OPTIONS.filter((d) => lower.includes(d.toLowerCase().split(" ")[0]));
  return {
    name: text.length > 40 ? text.slice(0, 40).replace(/[.,;:]+$/, "") + "…" : text.charAt(0).toUpperCase() + text.slice(1),
    description: text,
    domains: domains.length ? domains : ["Governance"],
    capabilities: caps,
    guardrails: {
      requireApproval: strict || !/auto|hands.?off|no review/.test(lower),
      showConfidence: true,
      escalationThreshold: strict ? 80 : 65,
      auditLog: true,
    },
    reasoning: [
      strict ? "Kept a human in the loop — this touches compliance or legal risk." : "Set moderate guardrails since no risk level was specified.",
      "Enabled capabilities matching the language in your request.",
      "Drafted offline — the live model wasn't reachable just now.",
    ],
  };
}

async function callClaude(system, userText) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system,
      messages: [{ role: "user", content: userText }],
    }),
  });
  if (!res.ok) throw new Error("API error " + res.status);
  const data = await res.json();
  const textBlock = (data.content || []).find((b) => b && b.type === "text");
  if (!textBlock) throw new Error("No text in response");
  const clean = textBlock.text.replace(/```json|```/g, "").trim();
  const match = clean.match(/\{[\s\S]*\}/);
  return JSON.parse(match ? match[0] : clean);
}

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function Toggle({ on, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      aria-label={label}
      className="relative shrink-0 rounded-full transition-colors"
      style={{ width: 40, height: 22, background: on ? COLOR.brass : COLOR.hairline }}
    >
      <span
        className="absolute top-0.5 rounded-full transition-all"
        style={{ width: 18, height: 18, left: on ? 20 : 2, background: COLOR.canvas, boxShadow: "0 1px 2px rgba(0,0,0,0.4)" }}
      />
    </button>
  );
}

const DEFAULT_GUARDRAILS = { requireApproval: true, showConfidence: true, escalationThreshold: 70, auditLog: true };

export default function ToolkitBuilderCommand() {
  const [reducedMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [phase, setPhase] = useState("dashboard"); // dashboard | detail | command | drafting | review
  const [railExpanded, setRailExpanded] = useState(false);
  const [dashFilter, setDashFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(null);

  const [commandText, setCommandText] = useState("");
  const [draftStepIdx, setDraftStepIdx] = useState(0);
  const [errorNote, setErrorNote] = useState(null);
  const [showAbout, setShowAbout] = useState(false);

  const [toolkitName, setToolkitName] = useState("");
  const [description, setDescription] = useState("");
  const [domains, setDomains] = useState([]);
  const [capabilities, setCapabilities] = useState(emptyCaps());
  const [guardrails, setGuardrails] = useState(DEFAULT_GUARDRAILS);
  const [reasoning, setReasoning] = useState([]);
  const [reasonFlash, setReasonFlash] = useState(false);
  const [sourceNote, setSourceNote] = useState(null); // e.g. "Started from v1"

  const [refineOpen, setRefineOpen] = useState(false);
  const [refineText, setRefineText] = useState("");
  const [refining, setRefining] = useState(false);

  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [resolution, setResolution] = useState(null);
  const [auditTrail, setAuditTrail] = useState([]);
  const [published, setPublished] = useState(false);

  const scenario = SCENARIOS[scenarioIdx];
  const enabledCaps = Object.entries(capabilities).filter(([, v]) => v.enabled);
  const selected = TOOLKITS.find((t) => t.id === selectedId) || null;

  const counts = {
    all: TOOLKITS.length,
    inprogress: TOOLKITS.filter((t) => t.bucket === "inprogress").length,
    completed: TOOLKITS.filter((t) => t.bucket === "completed").length,
    rejected: TOOLKITS.filter((t) => t.bucket === "rejected").length,
  };
  const filteredToolkits = dashFilter === "all" ? TOOLKITS : TOOLKITS.filter((t) => t.bucket === dashFilter);

  useEffect(() => {
    if (phase !== "drafting" || reducedMotion) return;
    const id = setInterval(() => setDraftStepIdx((i) => (i + 1) % DRAFT_STEPS.length), 550);
    return () => clearInterval(id);
  }, [phase, reducedMotion]);

  function applyDraft(parsed) {
    setToolkitName(typeof parsed.name === "string" && parsed.name.trim() ? parsed.name.trim() : "Untitled toolkit");
    setDescription(typeof parsed.description === "string" ? parsed.description : commandText);
    const d = Array.isArray(parsed.domains) ? parsed.domains.filter((x) => DOMAIN_OPTIONS.includes(x)) : [];
    setDomains(d.length ? d : ["Governance"]);
    const nextCaps = emptyCaps();
    CAP_KEYS.forEach((k) => {
      const src = parsed.capabilities && parsed.capabilities[k];
      if (src) {
        nextCaps[k] = {
          enabled: !!src.enabled,
          threshold: Math.min(99, Math.max(40, Number(src.threshold) || 70)),
        };
      }
    });
    setCapabilities(nextCaps);
    const g = parsed.guardrails || {};
    setGuardrails({
      requireApproval: g.requireApproval !== undefined ? !!g.requireApproval : true,
      showConfidence: g.showConfidence !== undefined ? !!g.showConfidence : true,
      escalationThreshold: Math.min(95, Math.max(40, Number(g.escalationThreshold) || 70)),
      auditLog: g.auditLog !== undefined ? !!g.auditLog : true,
    });
    setReasoning(Array.isArray(parsed.reasoning) ? parsed.reasoning.slice(0, 4) : []);
  }

  function resetBuilderState() {
    setCommandText("");
    setToolkitName("");
    setDescription("");
    setDomains([]);
    setCapabilities(emptyCaps());
    setGuardrails(DEFAULT_GUARDRAILS);
    setReasoning([]);
    setSourceNote(null);
    setScenarioIdx(0);
    setResolution(null);
    setAuditTrail([]);
    setPublished(false);
    setRefineOpen(false);
    setErrorNote(null);
  }

  function goDashboard() {
    setPhase("dashboard");
    setSelectedId(null);
  }
  function startNewToolkit() {
    resetBuilderState();
    setPhase("command");
  }
  function openDetail(id) {
    setSelectedId(id);
    setPhase("detail");
  }
  function createNewVersionFrom(item) {
    resetBuilderState();
    setToolkitName(item.name);
    setDescription(item.description);
    setDomains(item.domains);
    setCapabilities(item.capabilities);
    setGuardrails(item.guardrails);
    setReasoning([`Started from v${item.version} — carried over its configuration.`, "Adjust anything below, or refine it with a command."]);
    setSourceNote(`New version of "${item.name}" — currently v${item.version}${item.installs ? `, ${item.installs.toLocaleString()} installs` : ""}.`);
    setCommandText(`Update to ${item.name}`);
    setPhase("review");
  }

  async function submitCommand(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setCommandText(trimmed);
    setPhase("drafting");
    setDraftStepIdx(0);
    setErrorNote(null);
    const start = Date.now();
    let parsed;
    try {
      parsed = await callClaude(DRAFT_SYSTEM, trimmed);
    } catch (e) {
      parsed = localHeuristic(trimmed);
      setErrorNote("Live model unavailable — drafted offline instead.");
    }
    const elapsed = Date.now() - start;
    const minDelay = reducedMotion ? 0 : 1700;
    if (elapsed < minDelay) await wait(minDelay - elapsed);
    applyDraft(parsed);
    setPhase("review");
  }

  async function submitRefine() {
    const trimmed = refineText.trim();
    if (!trimmed || refining) return;
    setRefining(true);
    const current = { name: toolkitName, description, domains, capabilities, guardrails };
    const prompt = `Current configuration (JSON): ${JSON.stringify(current)}\n\nFollow-up instruction: "${trimmed}"\n\nReturn the full updated configuration.`;
    let parsed;
    try {
      parsed = await callClaude(REFINE_SYSTEM, prompt);
    } catch (e) {
      parsed = { ...current, reasoning: ["Couldn't reach the live model — nothing changed. Try again in a moment."] };
    }
    applyDraft(parsed);
    setRefineText("");
    setRefining(false);
    setRefineOpen(false);
    setReasonFlash(true);
    setTimeout(() => setReasonFlash(false), 1200);
  }

  function resolveScenario(type) {
    const labels = { approved: "Approved", escalated: "Escalated to human", edited: "Edited before approval", auto: "Auto-applied" };
    setResolution(type);
    setAuditTrail((prev) => [
      { time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }), action: labels[type], detail: scenario.text },
      ...prev,
    ]);
  }
  function nextScenario() {
    setResolution(null);
    setScenarioIdx((i) => (i + 1) % SCENARIOS.length);
  }
  function startOver() {
    resetBuilderState();
    setPhase("command");
  }

  const cardStyle = { background: COLOR.surface, border: `1px solid ${COLOR.hairline}` };
  const inputStyle = { background: COLOR.canvas, border: `1px solid ${COLOR.hairline}`, color: COLOR.ink };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: COLOR.canvas, color: COLOR.ink, fontFamily: FONT.sans }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        *:focus-visible { outline: 2px solid ${COLOR.brass}; outline-offset: 2px; }
        input[type="range"] { accent-color: ${COLOR.brass}; }
        ::placeholder { color: ${COLOR.inkMuted}; opacity: 0.8; }
        @keyframes fadeUp { 0% { opacity: 0; transform: translateY(8px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes stampIn { 0% { opacity: 0; transform: scale(1.8) rotate(-10deg); } 60% { opacity: 1; transform: scale(0.92) rotate(-10deg); } 100% { opacity: 1; transform: scale(1) rotate(-10deg); } }
        @keyframes pulseDot { 0%,100% { opacity: 0.35; } 50% { opacity: 1; } }
        .fade-up { animation: fadeUp 0.5s ease-out both; }
        .stamp-in { animation: stampIn 0.4s ease-out; }
        .pulse-dot { animation: pulseDot 1.1s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .fade-up, .stamp-in, .pulse-dot { animation: none !important; }
          * { transition: none !important; }
        }
      `}</style>

      {/* Left rail — placeholder nav (icons only) pending the real Figma export.
          Structure, item set, and labels are all easy to swap in one place
          via NAV_ITEMS above once that's available. */}
      <aside
        className="shrink-0 flex flex-col items-center py-4 transition-all"
        style={{ width: railExpanded ? 200 : 64, background: COLOR.navy, borderRight: `1px solid ${COLOR.navyLine}` }}
      >
        <button
          onClick={() => setRailExpanded((r) => !r)}
          aria-label="Toggle navigation"
          className="flex items-center justify-center rounded-md hover:opacity-80 transition-opacity"
          style={{ width: 36, height: 36, color: COLOR.onBrass }}
        >
          <Menu size={18} />
        </button>

        <div className="mt-4 mb-6 rounded-md flex items-center justify-center" style={{ width: 28, height: 28, background: COLOR.brass }}>
          <div style={{ width: 10, height: 10, background: COLOR.onBrass, transform: "rotate(45deg)" }} />
        </div>

        <nav className="flex flex-col gap-1 w-full px-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = item.key === "dashboard" ? phase !== "command" : false;
            return (
              <button
                key={item.key}
                onClick={item.key === "dashboard" || item.key === "toolkits" ? goDashboard : undefined}
                className="flex items-center gap-3 rounded-md px-2.5 py-2.5 transition-colors"
                title={item.label}
                style={{
                  background: active ? COLOR.navyLight : "transparent",
                  borderLeft: `2px solid ${active ? COLOR.brass : "transparent"}`,
                  color: active ? COLOR.onBrass : "rgba(252,252,252,0.55)",
                }}
              >
                <Icon size={18} className="shrink-0" />
                {railExpanded && <span className="text-sm whitespace-nowrap">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <button
          className="mt-auto flex items-center gap-3 rounded-md px-2.5 py-2.5 w-full px-2"
          style={{ color: "rgba(252,252,252,0.4)" }}
          title="Help"
        >
          <HelpCircle size={18} className="shrink-0" />
          {railExpanded && <span className="text-sm whitespace-nowrap">Help</span>}
        </button>
      </aside>

      <div style={{ flex: 1, minWidth: 0 }}>
      <header className="sticky top-0 z-20" style={{ background: `${COLOR.canvas}f0`, borderBottom: `1px solid ${COLOR.hairline}`, backdropFilter: "blur(6px)" }}>
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
          <button onClick={goDashboard} className="text-left">
            <div className="text-xs uppercase" style={{ color: COLOR.brass, letterSpacing: "0.15em" }}>Command-driven toolkit builder</div>
            <h1 style={{ fontFamily: FONT.serif, fontWeight: 600 }} className="text-xl sm:text-2xl">Toolkit Builder</h1>
          </button>
          <div className="flex items-center gap-4">
            {(phase === "dashboard" || phase === "detail") && (
              <button onClick={startNewToolkit} className="text-xs flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium hover:opacity-90 transition-opacity" style={{ background: COLOR.brass, color: COLOR.onBrass }}>
                <Plus size={13} /> New toolkit
              </button>
            )}
            <button onClick={() => setShowAbout((s) => !s)} className="text-xs flex items-center gap-1" style={{ color: COLOR.inkMuted }}>
              <Info size={13} /> About this prototype
            </button>
            <a href="https://akashsingh-2.github.io/portfolio/" target="_blank" rel="noreferrer" className="text-xs flex items-center gap-1 font-medium hover:opacity-80 transition-opacity" style={{ color: COLOR.brass }}>
              Akash Singh — Portfolio <ExternalLink size={12} />
            </a>
          </div>
        </div>
        {showAbout && (
          <div className="max-w-4xl mx-auto px-5 pb-4 -mt-1">
            <div className="text-sm rounded-md p-3 flex items-start justify-between gap-3" style={{ ...cardStyle, color: COLOR.inkMuted }}>
              <p>
                Describe a workflow in plain language and this calls Claude live to draft the toolkit — capabilities,
                confidence thresholds, and guardrails — with its reasoning shown, not hidden. You stay in control: every
                field is editable, and follow-up commands refine the draft rather than replace it blind. The dashboard's
                toolkit library is mock data, since this is a self-directed prototype rather than a connected backend.
              </p>
              <button onClick={() => setShowAbout(false)} aria-label="Close"><X size={15} /></button>
            </div>
          </div>
        )}
      </header>

      {phase === "dashboard" && (
        <main className="max-w-4xl mx-auto px-5 py-8 flex flex-col gap-6 fade-up">
          <div>
            <h2 style={{ fontFamily: FONT.serif }} className="text-2xl mb-1">Your toolkits</h2>
            <p className="text-sm" style={{ color: COLOR.inkMuted }}>Everything you've built, mid-review, or sent back for changes.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { key: "all", label: "All toolkits", tone: "all" },
              { key: "inprogress", label: "In progress", tone: "neutral" },
              { key: "completed", label: "Completed", tone: "success" },
              { key: "rejected", label: "Rejected", tone: "rejected" },
            ].map((s) => {
              const active = dashFilter === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => setDashFilter(s.key)}
                  aria-pressed={active}
                  className="rounded-lg p-4 text-left hover:opacity-90 transition-opacity"
                  style={{ background: active ? COLOR.surfaceRaised : COLOR.surface, border: `1px solid ${active ? COLOR.brass : COLOR.hairline}` }}
                >
                  <div className="text-2xl font-semibold" style={{ fontFamily: FONT.serif, color: s.tone === "all" ? COLOR.brass : TONE[s.tone].text }}>
                    {counts[s.key]}
                  </div>
                  <div className="text-xs mt-1" style={{ color: active ? COLOR.ink : COLOR.inkMuted }}>{s.label}</div>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-3">
            {filteredToolkits.map((item) => (
              <button key={item.id} onClick={() => openDetail(item.id)} className="text-left rounded-lg p-4 hover:opacity-90 transition-opacity" style={cardStyle}>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{item.name}</span>
                    <span className="text-xs rounded-full px-2 py-0.5" style={{ border: `1px solid ${COLOR.hairline}`, color: COLOR.brass, fontFamily: FONT.mono }}>v{item.version}</span>
                    {item.version > 1 && (
                      <span className="text-xs" style={{ color: COLOR.inkMuted }}>
                        replaces v{item.version - 1}{item.installs ? ` · ${item.installs.toLocaleString()} installs` : ""}
                      </span>
                    )}
                  </div>
                  <span className="text-xs shrink-0" style={{ color: COLOR.inkMuted }}>{item.lastUpdated}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap mt-2">
                  <span className="text-xs rounded px-2 py-0.5 font-medium" style={{ background: TONE[item.tone].bg, color: TONE[item.tone].text }}>{item.subStatus}</span>
                  {item.domains.map((d) => (
                    <span key={d} className="text-xs rounded-full px-2 py-0.5" style={{ border: `1px solid ${COLOR.hairline}`, color: COLOR.inkMuted }}>{d}</span>
                  ))}
                </div>
              </button>
            ))}
            {filteredToolkits.length === 0 && (
              <div className="text-sm text-center py-10" style={{ color: COLOR.inkMuted }}>Nothing here yet.</div>
            )}
          </div>
        </main>
      )}

      {phase === "detail" && selected && (
        <main className="max-w-3xl mx-auto px-5 py-8 flex flex-col gap-5 fade-up">
          <button onClick={goDashboard} className="text-xs self-start" style={{ color: COLOR.inkMuted }}>← Back to dashboard</button>

          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h2 style={{ fontFamily: FONT.serif }} className="text-2xl">{selected.name}</h2>
              <span className="text-xs rounded-full px-2 py-0.5" style={{ border: `1px solid ${COLOR.hairline}`, color: COLOR.brass, fontFamily: FONT.mono }}>v{selected.version}</span>
            </div>
            <span className="text-xs rounded px-2 py-0.5 font-medium" style={{ background: TONE[selected.tone].bg, color: TONE[selected.tone].text }}>{selected.subStatus}</span>
            <p className="text-sm mt-3" style={{ color: COLOR.inkMuted }}>{selected.description}</p>
            <div className="flex gap-2 flex-wrap mt-3">
              {selected.domains.map((d) => (
                <span key={d} className="text-xs rounded-full px-2 py-0.5" style={{ border: `1px solid ${COLOR.hairline}`, color: COLOR.inkMuted }}>{d}</span>
              ))}
            </div>
          </div>

          {selected.rejectionReasons && (
            <div className="rounded-md p-4" style={{ background: COLOR.escalateBg, borderLeft: `3px solid ${COLOR.escalate}` }}>
              <div className="text-xs font-medium uppercase mb-2" style={{ color: COLOR.escalate, letterSpacing: "0.08em" }}>Why it wasn't approved</div>
              <ul className="flex flex-col gap-1 text-sm list-none pl-0 m-0" style={{ color: COLOR.ink }}>
                {selected.rejectionReasons.map((r, i) => <li key={i}>· {r}</li>)}
              </ul>
            </div>
          )}

          {selected.reasoning?.length > 0 && (
            <div className="rounded-md p-4" style={{ background: COLOR.surface, borderLeft: `3px solid ${COLOR.brass}` }}>
              <div className="flex items-center gap-2 text-xs font-medium uppercase mb-2" style={{ color: COLOR.brass, letterSpacing: "0.08em" }}>
                <Sparkles size={13} /> Why it's set up this way
              </div>
              <ul className="flex flex-col gap-1 text-sm list-none pl-0 m-0" style={{ color: COLOR.inkMuted }}>
                {selected.reasoning.map((r, i) => <li key={i}>· {r}</li>)}
              </ul>
            </div>
          )}

          <div className="rounded-lg p-5" style={cardStyle}>
            <h3 style={{ fontFamily: FONT.serif }} className="text-base mb-3">Capabilities</h3>
            <div className="flex flex-col gap-2">
              {CAP_KEYS.map((name) => {
                const v = selected.capabilities[name];
                return (
                  <div key={name} className="flex items-center justify-between text-sm py-1.5" style={{ borderBottom: `1px solid ${COLOR.hairline}` }}>
                    <span style={{ color: v.enabled ? COLOR.ink : COLOR.inkMuted }}>{name}</span>
                    <span className="text-xs" style={{ fontFamily: FONT.mono, color: v.enabled ? COLOR.brass : COLOR.inkMuted }}>
                      {v.enabled ? `on · ${v.threshold}%` : "off"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg p-5" style={cardStyle}>
            <h3 style={{ fontFamily: FONT.serif }} className="text-base mb-3">Guardrails</h3>
            <dl className="text-sm flex flex-col gap-2">
              <div className="flex justify-between gap-4"><dt style={{ color: COLOR.inkMuted }}>Approval required</dt><dd>{selected.guardrails.requireApproval ? "Yes" : "No"}</dd></div>
              <div className="flex justify-between gap-4"><dt style={{ color: COLOR.inkMuted }}>Show confidence</dt><dd>{selected.guardrails.showConfidence ? "Yes" : "No"}</dd></div>
              <div className="flex justify-between gap-4"><dt style={{ color: COLOR.inkMuted }}>Escalation threshold</dt><dd>{selected.guardrails.escalationThreshold}%</dd></div>
              <div className="flex justify-between gap-4"><dt style={{ color: COLOR.inkMuted }}>Audit log</dt><dd>{selected.guardrails.auditLog ? "On" : "Off"}</dd></div>
            </dl>
          </div>

          <div className="rounded-lg p-5" style={cardStyle}>
            <h3 style={{ fontFamily: FONT.serif }} className="text-base mb-3">Version history</h3>
            <div className="flex flex-col gap-3">
              {selected.versionHistory.map((v) => (
                <div key={v.version} className="flex gap-3">
                  <span className="text-xs rounded-full px-2 py-0.5 h-fit shrink-0" style={{ border: `1px solid ${COLOR.hairline}`, color: COLOR.brass, fontFamily: FONT.mono }}>v{v.version}</span>
                  <div>
                    <div className="text-xs" style={{ color: COLOR.inkMuted }}>{v.date}</div>
                    <div className="text-sm">{v.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selected.bucket === "completed" && (
            <button onClick={() => createNewVersionFrom(selected)} className="self-start text-sm rounded-md px-4 py-2 font-medium flex items-center gap-2 hover:opacity-90 transition-opacity" style={{ background: COLOR.brass, color: COLOR.onBrass }}>
              <Plus size={14} /> Create a new version
            </button>
          )}
          {selected.bucket === "rejected" && (
            <button onClick={() => createNewVersionFrom(selected)} className="self-start text-sm rounded-md px-4 py-2 font-medium flex items-center gap-2 hover:opacity-90 transition-opacity" style={{ background: COLOR.escalate, color: COLOR.onBrass }}>
              <PenLine size={14} /> Revise and resubmit
            </button>
          )}
        </main>
      )}

      {phase === "command" && (
        <main
          className="fade-up"
          style={{ background: "linear-gradient(135deg, rgb(250, 235, 235) 0%, rgb(247, 240, 238) 45%, rgb(255, 255, 255) 100%)" }}
        >
          <div className="max-w-3xl mx-auto px-5 py-20 sm:py-28 flex flex-col items-center text-center gap-8">
            <h2 style={{ fontFamily: FONT.serif, fontWeight: 500, color: "#282E37" }} className="text-3xl sm:text-4xl leading-snug">
              What should this toolkit take off your plate?
            </h2>
            <form
              onSubmit={(e) => { e.preventDefault(); submitCommand(commandText); }}
              className="w-full rounded-2xl p-3"
              style={{ background: COLOR.surface, boxShadow: "0 20px 60px rgba(0,0,0,0.35)" }}
            >
              <textarea
                value={commandText}
                onChange={(e) => setCommandText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitCommand(commandText); } }}
                rows={2}
                placeholder="Describe the workflow, the risk it touches, and how hands-off it should be…"
                className="w-full bg-transparent text-left text-base resize-none px-2 py-1"
                style={{ color: "#282E37", fontFamily: FONT.serif }}
              />
              <div className="flex items-center justify-between mt-2 px-1">
                <div className="flex items-center gap-3" style={{ color: COLOR.inkMuted }}>
                  <Paperclip size={15} />
                  <span className="flex items-center gap-1 text-xs"><SlidersHorizontal size={13} /> Tools <ChevronDown size={12} /></span>
                  <Mic size={15} />
                </div>
                <button
                  type="submit"
                  aria-label="Build toolkit"
                  className="rounded-full p-2 hover:opacity-90 transition-opacity"
                  style={{ background: COLOR.brass, color: COLOR.onBrass }}
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
            <div className="flex flex-wrap justify-center gap-2">
              {EXAMPLE_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => submitCommand(p)}
                  className="text-xs rounded-full px-3 py-1.5 hover:opacity-90 transition-opacity"
                  style={{ background: "#FFFFFF", color: "#282E37", border: `1px solid ${COLOR.hairline}` }}
                >
                  {p}
                </button>
              ))}
            </div>
            <p className="text-xs" style={{ color: "#282E37", opacity: 0.7 }}>
              AI-drafted — review before publishing. <span style={{ textDecoration: "underline", cursor: "default" }}>Learn more</span>
            </p>
          </div>
        </main>
      )}

      {phase === "drafting" && (
        <main style={{ background: "linear-gradient(135deg, rgb(250, 235, 235) 0%, rgb(247, 240, 238) 45%, rgb(255, 255, 255) 100%)" }}>
          <div className="max-w-lg mx-auto px-5 py-28 flex flex-col items-center text-center gap-5">
            <div className="rounded-full p-3 pulse-dot" style={{ background: "#FFFFFF", border: `1px solid ${COLOR.hairline}`, boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
              <Sparkles size={22} style={{ color: "#282E37" }} />
            </div>
            <p className="text-sm" style={{ color: "#282E37", fontFamily: FONT.mono }}>
              {reducedMotion ? "Drafting your toolkit…" : DRAFT_STEPS[draftStepIdx]}
            </p>
          </div>
        </main>
      )}

      {phase === "review" && (
        <main className="max-w-3xl mx-auto px-5 py-8 flex flex-col gap-5 fade-up">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-xs" style={{ color: COLOR.inkMuted }}>
              {sourceNote ? sourceNote : <>From: <span style={{ color: COLOR.ink }}>“{commandText}”</span></>}
            </p>
            <button onClick={startOver} className="text-xs flex items-center gap-1" style={{ color: COLOR.inkMuted }}>
              <RotateCcw size={12} /> Start over
            </button>
          </div>

          {errorNote && (
            <div className="text-xs rounded-md p-2" style={{ background: COLOR.escalateBg, color: COLOR.escalate }}>{errorNote}</div>
          )}

          {reasoning.length > 0 && (
            <div
              className="rounded-md p-4"
              style={{ background: reasonFlash ? COLOR.surfaceRaised : COLOR.surface, borderLeft: `3px solid ${COLOR.brass}`, transition: "background 0.6s ease" }}
            >
              <div className="flex items-center gap-2 text-xs font-medium uppercase mb-2" style={{ color: COLOR.brass, letterSpacing: "0.08em" }}>
                <Sparkles size={13} /> Why it's set up this way
              </div>
              <ul className="flex flex-col gap-1 text-sm list-none pl-0 m-0" style={{ color: COLOR.inkMuted }}>
                {reasoning.map((r, i) => <li key={i}>· {r}</li>)}
              </ul>
            </div>
          )}

          <div className="rounded-lg p-5" style={cardStyle}>
            <label className="text-xs font-medium uppercase block" style={{ color: COLOR.inkMuted, letterSpacing: "0.08em" }}>
              Toolkit name
              <input value={toolkitName} onChange={(e) => setToolkitName(e.target.value)} className="mt-1 w-full rounded-md px-3 py-2 text-sm normal-case font-normal" style={inputStyle} />
            </label>
            <label className="text-xs font-medium uppercase block mt-4" style={{ color: COLOR.inkMuted, letterSpacing: "0.08em" }}>
              Description
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="mt-1 w-full rounded-md px-3 py-2 text-sm normal-case font-normal resize-none" style={inputStyle} />
            </label>
            <div className="mt-4">
              <div className="text-xs font-medium uppercase mb-2" style={{ color: COLOR.inkMuted, letterSpacing: "0.08em" }}>Domain</div>
              <div className="flex flex-wrap gap-2">
                {DOMAIN_OPTIONS.map((d) => {
                  const sel = domains.includes(d);
                  return (
                    <button key={d} onClick={() => setDomains((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))}
                      className="text-sm rounded-full px-3 py-1.5 transition-colors"
                      style={{ background: sel ? COLOR.brass : "transparent", color: sel ? COLOR.onBrass : COLOR.ink, border: `1px solid ${sel ? COLOR.brass : COLOR.hairline}` }}>
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded-lg p-5 flex flex-col gap-3" style={cardStyle}>
            <h3 style={{ fontFamily: FONT.serif }} className="text-base">Capabilities</h3>
            {CAP_KEYS.map((name) => {
              const v = capabilities[name];
              return (
                <div key={name} className="rounded-md p-3" style={{ border: `1px solid ${COLOR.hairline}` }}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium">{name}</span>
                    <Toggle on={v.enabled} onClick={() => setCapabilities((prev) => ({ ...prev, [name]: { ...prev[name], enabled: !prev[name].enabled } }))} label={`Toggle ${name}`} />
                  </div>
                  {v.enabled && (
                    <div className="mt-3 flex items-center gap-3">
                      <span className="text-xs w-32" style={{ color: COLOR.inkMuted }}>Minimum confidence</span>
                      <input type="range" min={40} max={99} value={v.threshold} onChange={(e) => setCapabilities((prev) => ({ ...prev, [name]: { ...prev[name], threshold: Number(e.target.value) } }))} className="flex-1" />
                      <span className="text-xs w-10 text-right" style={{ fontFamily: FONT.mono, color: COLOR.brass }}>{v.threshold}%</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="rounded-lg p-5 flex flex-col gap-3" style={cardStyle}>
            <h3 style={{ fontFamily: FONT.serif }} className="text-base">Guardrails</h3>
            <div className="rounded-md p-3 flex items-center justify-between gap-3" style={{ border: `1px solid ${COLOR.hairline}` }}>
              <div>
                <div className="text-sm font-medium">Require approval before high-risk actions</div>
                <div className="text-xs" style={{ color: COLOR.inkMuted }}>The assistant proposes; a person confirms.</div>
              </div>
              <Toggle on={guardrails.requireApproval} onClick={() => setGuardrails((g) => ({ ...g, requireApproval: !g.requireApproval }))} label="Toggle require approval" />
            </div>
            <div className="rounded-md p-3 flex items-center justify-between gap-3" style={{ border: `1px solid ${COLOR.hairline}` }}>
              <div>
                <div className="text-sm font-medium">Show confidence score</div>
                <div className="text-xs" style={{ color: COLOR.inkMuted }}>Keeps the assistant's certainty visible, not implied.</div>
              </div>
              <Toggle on={guardrails.showConfidence} onClick={() => setGuardrails((g) => ({ ...g, showConfidence: !g.showConfidence }))} label="Toggle show confidence" />
            </div>
            <div className="rounded-md p-3" style={{ border: `1px solid ${COLOR.hairline}` }}>
              <div className="text-sm font-medium mb-1">Escalate to a human below</div>
              <div className="flex items-center gap-3">
                <input type="range" min={40} max={95} value={guardrails.escalationThreshold} onChange={(e) => setGuardrails((g) => ({ ...g, escalationThreshold: Number(e.target.value) }))} className="flex-1" />
                <span className="text-xs w-10 text-right" style={{ fontFamily: FONT.mono, color: COLOR.brass }}>{guardrails.escalationThreshold}%</span>
              </div>
            </div>
            <div className="rounded-md p-3 flex items-center justify-between gap-3" style={{ border: `1px solid ${COLOR.hairline}` }}>
              <div>
                <div className="text-sm font-medium">Log every action to the audit trail</div>
                <div className="text-xs" style={{ color: COLOR.inkMuted }}>Nothing the assistant does goes unrecorded.</div>
              </div>
              <Toggle on={guardrails.auditLog} onClick={() => setGuardrails((g) => ({ ...g, auditLog: !g.auditLog }))} label="Toggle audit log" />
            </div>
          </div>

          <div className="rounded-lg p-5" style={cardStyle}>
            <h3 style={{ fontFamily: FONT.serif }} className="text-base mb-3">Test it</h3>
            <div className="relative rounded-md p-4" style={{ border: `1px solid ${COLOR.hairline}`, background: COLOR.canvas }}>
              {resolution && (
                <div className="absolute -top-3 -right-3 stamp-in">
                  <div className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold"
                    style={{
                      color: resolution === "escalated" ? COLOR.escalate : resolution === "auto" ? COLOR.brass : COLOR.verdict,
                      border: `2px solid ${resolution === "escalated" ? COLOR.escalate : resolution === "auto" ? COLOR.brass : COLOR.verdict}`,
                      background: COLOR.surface, transform: "rotate(-10deg)",
                    }}>
                    {resolution === "approved" && <CheckCircle2 size={13} />}
                    {resolution === "escalated" && <AlertTriangle size={13} />}
                    {resolution === "edited" && <PenLine size={13} />}
                    {resolution === "auto" && <Zap size={13} />}
                    {resolution === "approved" && "APPROVED"}
                    {resolution === "escalated" && "ESCALATED"}
                    {resolution === "edited" && "EDITED"}
                    {resolution === "auto" && "AUTO-APPLIED"}
                  </div>
                </div>
              )}
              <div className="flex items-start gap-2 mb-2">
                <Sparkles size={15} style={{ color: COLOR.brass, marginTop: 2 }} />
                <span className="text-xs font-medium uppercase" style={{ color: COLOR.brass, letterSpacing: "0.08em" }}>Assistant suggestion</span>
              </div>
              <p className="text-sm mb-3">{scenario.text}</p>
              {guardrails.showConfidence && (
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-xs rounded px-2 py-0.5 font-medium" style={{ fontFamily: FONT.mono, color: scenario.confidence < guardrails.escalationThreshold ? COLOR.escalate : COLOR.verdict, background: scenario.confidence < guardrails.escalationThreshold ? COLOR.escalateBg : COLOR.verdictBg }}>
                    {scenario.confidence}% confidence
                  </span>
                  {scenario.confidence < guardrails.escalationThreshold && (
                    <span className="text-xs" style={{ color: COLOR.escalate }}>Below your threshold — recommend escalating</span>
                  )}
                </div>
              )}
              {!resolution ? (
                guardrails.requireApproval ? (
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => resolveScenario("approved")} className="text-xs rounded-md px-3 py-1.5 font-medium hover:opacity-90 transition-opacity" style={{ background: COLOR.verdict, color: COLOR.onBrass }}>Approve</button>
                    <button onClick={() => resolveScenario("edited")} className="text-xs rounded-md px-3 py-1.5 font-medium hover:opacity-90 transition-opacity" style={{ border: `1px solid ${COLOR.hairline}`, color: COLOR.ink }}>Edit first</button>
                    <button onClick={() => resolveScenario("escalated")} className="text-xs rounded-md px-3 py-1.5 font-medium hover:opacity-90 transition-opacity" style={{ background: COLOR.escalate, color: COLOR.onBrass }}>Escalate to human</button>
                  </div>
                ) : (
                  <button onClick={() => resolveScenario("auto")} className="text-xs rounded-md px-3 py-1.5 font-medium hover:opacity-90 transition-opacity" style={{ background: COLOR.brass, color: COLOR.onBrass }}>Apply automatically</button>
                )
              ) : (
                <button onClick={nextScenario} className="text-xs font-medium" style={{ color: COLOR.brass }}>Next suggestion →</button>
              )}
            </div>
            {auditTrail.length > 0 && (
              <ul className="flex flex-col gap-2 list-none pl-0 mt-4 mb-0">
                {auditTrail.slice(0, 4).map((entry, i) => (
                  <li key={i} className="text-xs" style={{ color: COLOR.inkMuted }}>
                    <span style={{ fontFamily: FONT.mono }}>{entry.time}</span> — <span style={{ color: COLOR.ink }}>{entry.action}</span>: {entry.detail}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-lg p-5" style={cardStyle}>
            {!published ? (
              <>
                <h3 style={{ fontFamily: FONT.serif }} className="text-base mb-3">Publish</h3>
                <dl className="text-sm flex flex-col gap-2 mb-4">
                  <div className="flex justify-between gap-4"><dt style={{ color: COLOR.inkMuted }}>Capabilities</dt><dd>{enabledCaps.length} enabled</dd></div>
                  <div className="flex justify-between gap-4"><dt style={{ color: COLOR.inkMuted }}>Approval required</dt><dd>{guardrails.requireApproval ? "Yes" : "No"}</dd></div>
                  <div className="flex justify-between gap-4"><dt style={{ color: COLOR.inkMuted }}>Escalation threshold</dt><dd>{guardrails.escalationThreshold}%</dd></div>
                </dl>
                <button onClick={() => setPublished(true)} className="text-sm rounded-md px-4 py-2 font-medium flex items-center gap-2 hover:opacity-90 transition-opacity" style={{ background: COLOR.brass, color: COLOR.onBrass }}>
                  <Rocket size={14} /> Publish toolkit
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 font-medium" style={{ color: COLOR.verdict }}><CheckCircle2 size={16} /> Published</div>
                <p className="text-xs" style={{ color: COLOR.inkMuted }}>This is a self-directed prototype — nothing is actually deployed or saved to the dashboard.</p>
                <button onClick={goDashboard} className="self-start text-xs rounded-md px-3 py-1.5 font-medium hover:opacity-90 transition-opacity" style={{ border: `1px solid ${COLOR.hairline}`, color: COLOR.ink }}>
                  ← Back to dashboard
                </button>
              </div>
            )}
          </div>

          <p className="text-xs text-center" style={{ color: COLOR.inkMuted }}>AI-drafted — review before publishing.</p>
        </main>
      )}

      {phase === "review" && (
        <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-3">
          {refineOpen && (
            <div className="rounded-xl p-3 fade-up" style={{ width: 300, ...cardStyle, boxShadow: "0 12px 40px rgba(0,0,0,0.4)" }}>
              <div className="text-xs font-medium uppercase mb-2" style={{ color: COLOR.brass, letterSpacing: "0.08em" }}>Refine with a command</div>
              <textarea
                value={refineText}
                onChange={(e) => setRefineText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitRefine(); } }}
                rows={2}
                placeholder="e.g. make it stricter, add data extraction…"
                className="w-full bg-transparent text-sm resize-none px-1"
                style={{ color: COLOR.ink }}
              />
              <div className="flex justify-end mt-1">
                <button onClick={submitRefine} disabled={refining || !refineText.trim()} className="text-xs rounded-md px-3 py-1.5 font-medium disabled:opacity-40 hover:opacity-90 transition-opacity" style={{ background: COLOR.brass, color: COLOR.onBrass }}>
                  {refining ? "Updating…" : "Send"}
                </button>
              </div>
            </div>
          )}
          <button
            onClick={() => setRefineOpen((o) => !o)}
            aria-label="Refine with AI"
            className="rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity"
            style={{ background: COLOR.brass, color: COLOR.onBrass }}
          >
            {refineOpen ? <X size={20} /> : <Sparkles size={20} />}
          </button>
        </div>
      )}

      <footer className="max-w-3xl mx-auto px-5 pb-10 pt-4">
        <p className="text-xs" style={{ color: COLOR.inkMuted }}>Designed and built by Akash Singh — exploring command-driven, human-in-the-loop patterns for AI-assisted enterprise workflows.</p>
      </footer>
      </div>
    </div>
  );
}
