import { useState, useRef } from "react";

// ── palette & constants ──────────────────────────────────────────────────────
const COLORS = {
  bg: "#0f1117",
  surface: "#1a1d27",
  border: "#2a2d3a",
  accent: "#6366f1",       // indigo
  accentGlow: "#818cf8",
  positive: "#22d3a5",
  negative: "#f43f5e",
  neutral: "#f59e0b",
  text: "#e2e8f0",
  muted: "#64748b",
};

const SAMPLE_FEEDBACKS = [
  "The onboarding experience was absolutely seamless. Got set up in under 5 minutes and the UI is incredibly intuitive.",
  "This is the third time my order arrived damaged. Customer support took 4 days to respond. Completely unacceptable.",
  "Delivery was on time I guess. Product is fine. Nothing special but does what it says.",
  "Oh sure, the app 'works great' — if you enjoy watching loading spinners for 30 seconds. Absolutely stellar experience.",
  "The new dashboard update is a game changer. Finally I can see all my analytics in one place.",
  "Cancelled my subscription after 2 years. The price hike with zero added value is insulting.",
];

const CATEGORIES = ["Product Quality", "Customer Support", "Delivery", "UI/UX", "Pricing", "Onboarding", "General"];

// ── helpers ──────────────────────────────────────────────────────────────────
function scoreToColor(score) {
  if (score >= 65) return COLORS.positive;
  if (score >= 40) return COLORS.neutral;
  return COLORS.negative;
}

function MiniBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: COLORS.muted, marginBottom: 4 }}>
        <span>{label}</span><span>{value}</span>
      </div>
      <div style={{ background: COLORS.border, borderRadius: 4, height: 6 }}>
        <div style={{ width: `${pct}%`, height: 6, borderRadius: 4, background: color, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

function SentimentBadge({ sentiment, confidence }) {
  const color = sentiment === "Positive" ? COLORS.positive : sentiment === "Negative" ? COLORS.negative : COLORS.neutral;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: color + "22", border: `1px solid ${color}44`,
      color, borderRadius: 20, padding: "3px 12px", fontSize: 13, fontWeight: 600
    }}>
      <span style={{ fontSize: 9, opacity: 0.7 }}>●</span>
      {sentiment} {confidence && <span style={{ opacity: 0.7, fontWeight: 400 }}>({confidence}%)</span>}
    </span>
  );
}

function ResultCard({ result, onRemove, index }) {
  const [expanded, setExpanded] = useState(false);
  if (!result) return null;
  const bgColor = result.sentiment === "Positive" ? COLORS.positive : result.sentiment === "Negative" ? COLORS.negative : COLORS.neutral;

  return (
    <div style={{
      background: COLORS.surface, border: `1px solid ${COLORS.border}`,
      borderLeft: `3px solid ${bgColor}`,
      borderRadius: 10, padding: "16px 18px", marginBottom: 12,
      animation: "slideIn 0.3s ease"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <p style={{ color: COLORS.text, fontSize: 14, lineHeight: 1.5, margin: 0, flex: 1 }}>
          {result.feedback}
        </p>
        <button onClick={onRemove} style={{ background: "none", border: "none", color: COLORS.muted, cursor: "pointer", fontSize: 18, padding: 0, flexShrink: 0 }}>×</button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10, alignItems: "center" }}>
        <SentimentBadge sentiment={result.sentiment} confidence={result.confidence} />
        {result.sarcasm && (
          <span style={{ fontSize: 12, color: COLORS.neutral, background: COLORS.neutral + "18", border: `1px solid ${COLORS.neutral}33`, borderRadius: 20, padding: "3px 10px" }}>
            ⚡ {result.sarcasm}
          </span>
        )}
        {result.category && (
          <span style={{ fontSize: 12, color: COLORS.accentGlow, background: COLORS.accent + "18", border: `1px solid ${COLORS.accent}33`, borderRadius: 20, padding: "3px 10px" }}>
            🏷 {result.category}
          </span>
        )}
        <button onClick={() => setExpanded(!expanded)} style={{ marginLeft: "auto", background: "none", border: "none", color: COLORS.muted, cursor: "pointer", fontSize: 12 }}>
          {expanded ? "▲ Less" : "▼ Details"}
        </button>
      </div>
      {expanded && result.summary && (
        <div style={{ marginTop: 12, padding: 12, background: COLORS.bg, borderRadius: 8, fontSize: 13, color: COLORS.muted, lineHeight: 1.6 }}>
          <strong style={{ color: COLORS.text, display: "block", marginBottom: 6 }}>AI Reasoning</strong>
          {result.summary}
          {result.keywords?.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <strong style={{ color: COLORS.text }}>Key signals: </strong>
              {result.keywords.map((k, i) => (
                <span key={i} style={{ background: COLORS.border, borderRadius: 4, padding: "2px 7px", margin: "0 3px", fontSize: 12 }}>{k}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── gauge ─────────────────────────────────────────────────────────────────────
function SentimentGauge({ score }) {
  const angle = -90 + (score / 100) * 180;
  const color = scoreToColor(score);
  const cx = 80, cy = 75, r = 55;
  const toRad = (d) => (d * Math.PI) / 180;
  const arcX = cx + r * Math.cos(toRad(-180));
  const arcXEnd = cx + r * Math.cos(toRad(0));
  const arcDesc = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  const needleX = cx + r * 0.82 * Math.cos(toRad(angle));
  const needleY = cy + r * 0.82 * Math.sin(toRad(angle));

  return (
    <svg viewBox="0 0 160 90" style={{ width: "100%", maxWidth: 200 }}>
      <defs>
        <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={COLORS.negative} />
          <stop offset="50%" stopColor={COLORS.neutral} />
          <stop offset="100%" stopColor={COLORS.positive} />
        </linearGradient>
      </defs>
      <path d={arcDesc} fill="none" stroke={COLORS.border} strokeWidth="14" strokeLinecap="round" />
      <path d={arcDesc} fill="none" stroke="url(#gaugeGrad)" strokeWidth="10" strokeLinecap="round" opacity="0.7" />
      <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke={color} strokeWidth="3" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={5} fill={color} />
      <text x={cx} y={cy + 20} textAnchor="middle" fill={color} fontSize="18" fontWeight="700">{score}</text>
      <text x={cx} y={cy + 32} textAnchor="middle" fill={COLORS.muted} fontSize="8">Sentiment Score</text>
    </svg>
  );
}

// ── main app ──────────────────────────────────────────────────────────────────
export default function ICFA() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("analyze"); // analyze | dashboard
  const textRef = useRef();

  // ── call local FastAPI backend ─────────────────────────────────
  async function analyzeText(text) {
    try {
      const response = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${response.status}`);
      }

      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error("Backend Error:", error);
      throw new Error("Could not connect to backend. Is uvicorn running on port 8000?");
    }
  }

  async function handleAnalyze() {
    const text = input.trim();
    if (!text) return;
    setLoading(true);
    setError("");
    try {
      const analysis = await analyzeText(text);
      const newResult = { id: Date.now(), feedback: text, ...analysis };
      setResults((prev) => [newResult, ...prev]);
      setInput("");
      if (results.length >= 2) setActiveTab("dashboard");
    } catch (e) {
      setError(`Analysis failed: ${e.message}`);
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function loadSample() {
    const unused = SAMPLE_FEEDBACKS.filter(
      (s) => !results.some((r) => r.feedback === s)
    );
    if (unused.length === 0) return;
    setInput(unused[Math.floor(Math.random() * unused.length)]);
    textRef.current?.focus();
  }

  async function analyzeAll() {
    setActiveTab("analyze");
    for (const sample of SAMPLE_FEEDBACKS) {
      if (results.some((r) => r.feedback === sample)) continue;
      setLoading(true);
      setInput(sample);
      try {
        const analysis = await analyzeText(sample);
        setResults((prev) => [...prev, { id: Date.now() + Math.random(), feedback: sample, ...analysis }]);
        
        // CHANGED: Wait 4 seconds between batches to respect free-tier rate limits
        await new Promise((r) => setTimeout(r, 4000)); 
        
      } catch (e) {
        console.error(e);
      }
    }
    setLoading(false);
    setInput("");
    setActiveTab("dashboard");
  }

  // ── derived stats ─────────────────────────────────────────────────────────
  const totalPos = results.filter((r) => r.sentiment === "Positive").length;
  const totalNeg = results.filter((r) => r.sentiment === "Negative").length;
  const totalNeu = results.filter((r) => r.sentiment === "Neutral").length;
  const totalSarcasm = results.filter((r) => r.sarcasm === "Sarcastic").length;
  const total = results.length;
  const sentimentScore = total === 0 ? 50 : Math.round(((totalPos + totalNeu * 0.5) / total) * 100);
  const avgConf = total === 0 ? 0 : Math.round(results.reduce((s, r) => s + (r.confidence || 0), 0) / total);

  const catCounts = {};
  results.forEach((r) => {
    if (r.category) catCounts[r.category] = (catCounts[r.category] || 0) + 1;
  });
  const topCategory = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0];

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: COLORS.bg, minHeight: "100vh", color: COLORS.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@700&display=swap');
        * { box-sizing: border-box; }
        textarea:focus { outline: none; }
        button:focus-visible { outline: 2px solid ${COLORS.accent}; outline-offset: 2px; }
        @keyframes slideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${COLORS.bg}; }
        ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 3px; }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${COLORS.border}`, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.positive})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⚡</div>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 700, letterSpacing: "-0.3px" }}>ICFA</div>
            <div style={{ fontSize: 11, color: COLORS.muted, marginTop: -2 }}>Intelligent Customer Feedback Analyser</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {["analyze", "dashboard"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              background: activeTab === tab ? COLORS.accent : "none",
              border: `1px solid ${activeTab === tab ? COLORS.accent : COLORS.border}`,
              color: activeTab === tab ? "#fff" : COLORS.muted,
              borderRadius: 8, padding: "6px 14px", fontSize: 13, cursor: "pointer",
              textTransform: "capitalize", fontWeight: 500, transition: "all 0.15s"
            }}>
              {tab === "analyze" ? "✏️ Analyse" : "📊 Dashboard"}
              {tab === "dashboard" && total > 0 && <span style={{ marginLeft: 6, background: COLORS.accentGlow + "33", borderRadius: 10, padding: "1px 6px", fontSize: 11 }}>{total}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 16px" }}>

        {/* ─── ANALYSE TAB ─── */}
        {activeTab === "analyze" && (
          <div>
            {/* Input area */}
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
              <textarea
                ref={textRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleAnalyze(); }}
                placeholder="Paste customer feedback here — a review, support ticket, survey response, or any free-text input…"
                rows={4}
                style={{
                  width: "100%", background: "transparent", border: "none",
                  color: COLORS.text, padding: "16px 18px", fontSize: 14,
                  lineHeight: 1.6, resize: "vertical", fontFamily: "inherit"
                }}
              />
              <div style={{ borderTop: `1px solid ${COLORS.border}`, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={loadSample} style={{ background: "none", border: `1px solid ${COLORS.border}`, color: COLORS.muted, borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer" }}>
                    ↺ Sample
                  </button>
                  <button onClick={analyzeAll} disabled={loading} style={{ background: "none", border: `1px solid ${COLORS.border}`, color: COLORS.muted, borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer" }}>
                    ⚡ Run all samples
                  </button>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 11, color: COLORS.muted }}>⌘↵ to run</span>
                  <button
                    onClick={handleAnalyze}
                    disabled={loading || !input.trim()}
                    style={{
                      background: loading || !input.trim() ? COLORS.border : `linear-gradient(135deg, ${COLORS.accent}, #7c3aed)`,
                      border: "none", color: "#fff", borderRadius: 8,
                      padding: "8px 20px", fontSize: 14, fontWeight: 600,
                      cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                      opacity: loading || !input.trim() ? 0.6 : 1,
                      transition: "all 0.15s"
                    }}
                  >
                    {loading ? <span style={{ animation: "pulse 1s infinite" }}>Analysing…</span> : "Analyse →"}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div style={{ background: COLORS.negative + "18", border: `1px solid ${COLORS.negative}33`, borderRadius: 8, padding: "10px 14px", fontSize: 13, color: COLORS.negative, marginBottom: 16 }}>
                ⚠ {error}
              </div>
            )}

            {/* Results */}
            {results.length === 0 && !loading && (
              <div style={{ textAlign: "center", padding: "60px 20px", color: COLORS.muted }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
                <div style={{ fontSize: 15, marginBottom: 6 }}>No feedback analysed yet</div>
                <div style={{ fontSize: 13 }}>Type something above or click "Sample" to load a demo review</div>
              </div>
            )}

            {results.map((r, i) => (
              <ResultCard key={r.id} result={r} index={i} onRemove={() => setResults((prev) => prev.filter((x) => x.id !== r.id))} />
            ))}
          </div>
        )}

        {/* ─── DASHBOARD TAB ─── */}
        {activeTab === "dashboard" && (
          <div>
            {total === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: COLORS.muted }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
                <div style={{ fontSize: 15 }}>Analyse some feedback first to see your dashboard</div>
                <button onClick={() => setActiveTab("analyze")} style={{ marginTop: 16, background: COLORS.accent, border: "none", color: "#fff", borderRadius: 8, padding: "8px 20px", fontSize: 14, cursor: "pointer" }}>Go to Analyse</button>
              </div>
            ) : (
              <div>
                {/* Top KPIs */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
                  {[
                    { label: "Total Analysed", value: total, color: COLORS.accent },
                    { label: "Positive", value: totalPos, color: COLORS.positive },
                    { label: "Negative", value: totalNeg, color: COLORS.negative },
                    { label: "Sarcastic", value: totalSarcasm, color: COLORS.neutral },
                    { label: "Avg. Confidence", value: `${avgConf}%`, color: COLORS.accentGlow },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "16px 18px" }}>
                      <div style={{ fontSize: 24, fontWeight: 700, color, fontFamily: "'Space Grotesk', sans-serif" }}>{value}</div>
                      <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 4 }}>{label}</div>
                    </div>
                  ))}
                </div>

                {/* Gauge + Category breakdown */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 16, marginBottom: 20 }}>
                  <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Overall Sentiment</div>
                    <SentimentGauge score={sentimentScore} />
                    <div style={{ textAlign: "center", marginTop: 8 }}>
                      <span style={{ fontSize: 12, color: COLORS.muted }}>
                        {sentimentScore >= 65 ? "👍 Trending Positive" : sentimentScore >= 40 ? "😐 Mixed Signals" : "👎 Needs Attention"}
                      </span>
                    </div>
                  </div>
                  <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Sentiment Breakdown</div>
                    <MiniBar label="Positive" value={totalPos} max={total} color={COLORS.positive} />
                    <MiniBar label="Negative" value={totalNeg} max={total} color={COLORS.negative} />
                    <MiniBar label="Neutral" value={totalNeu} max={total} color={COLORS.neutral} />
                    <MiniBar label="Sarcastic" value={totalSarcasm} max={total} color={COLORS.neutral} />
                  </div>
                </div>

                {/* Category breakdown */}
                {Object.keys(catCounts).length > 0 && (
                  <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 20, marginBottom: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Feedback by Category</div>
                    {Object.entries(catCounts).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
                      <MiniBar key={cat} label={cat} value={count} max={total} color={COLORS.accent} />
                    ))}
                    {topCategory && (
                      <div style={{ marginTop: 12, padding: 10, background: COLORS.accent + "15", borderRadius: 8, fontSize: 13, color: COLORS.accentGlow }}>
                        🔍 Most discussed: <strong>{topCategory[0]}</strong> ({topCategory[1]} mentions)
                      </div>
                    )}
                  </div>
                )}

                {/* Recent results table */}
                <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ padding: "14px 18px", borderBottom: `1px solid ${COLORS.border}`, fontSize: 13, fontWeight: 600 }}>All Analysed Feedback</div>
                  <div style={{ maxHeight: 320, overflowY: "auto" }}>
                    {results.map((r) => (
                      <div key={r.id} style={{ padding: "12px 18px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", gap: 12, alignItems: "flex-start" }}>
                        <div style={{ flexShrink: 0, marginTop: 2 }}>
                          <SentimentBadge sentiment={r.sentiment} />
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: 13, color: COLORS.text, lineHeight: 1.5 }}>{r.feedback}</p>
                          <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 4 }}>
                            {r.category && `🏷 ${r.category}`}{r.sarcasm === "Sarcastic" && " · ⚡ Sarcasm detected"}
                            {r.confidence && ` · ${r.confidence}% confidence`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${COLORS.border}`, padding: "12px 24px", textAlign: "center", fontSize: 11, color: COLORS.muted }}>
        ICFA v2.0 · Built on Gemini API · Evolved from a 2022 Bachelor's sentiment analysis project
      </div>
    </div>
  );
}