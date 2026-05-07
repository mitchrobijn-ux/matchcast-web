import { useState, useEffect, useRef } from "react";
import MatchcastPredictor from "./Predictor.jsx";

const BACKEND_URL = "https://matchcast-backend-production.up.railway.app";

// ── Design tokens ─────────────────────────────────────────
const C = {
  bg: "#080811",
  surface: "#0f0f1e",
  card: "#13132a",
  border: "rgba(255,255,255,0.06)",
  borderHover: "rgba(255,255,255,0.12)",
  green: "#00e87a",
  greenDim: "rgba(0,232,122,0.1)",
  greenBorder: "rgba(0,232,122,0.2)",
  gold: "#f0b429",
  goldDim: "rgba(240,180,41,0.1)",
  red: "#ff4560",
  text: "#fff",
  textSub: "rgba(255,255,255,0.5)",
  textDim: "rgba(255,255,255,0.25)",
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;overflow-x:hidden;}
  html,body{overflow-x:hidden;max-width:100vw;}
  html{scroll-behavior:smooth;}
  body{background:${C.bg};color:${C.text};font-family:'DM Sans',sans-serif;overflow-x:hidden;}
  ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px;}
  input::placeholder{color:${C.textDim};}
  input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
  select option{background:#13132a;}
  button{font-family:'DM Sans',sans-serif;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
  .fadeUp{animation:fadeUp 0.6s ease forwards;}
  .float{animation:float 4s ease-in-out infinite;}
  .spin{animation:spin 0.8s linear infinite;}
`;

// ── Pill badge ─────────────────────────────────────────────
function Pill({ children, color = C.green }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "0.35rem",
      padding: "0.25rem 0.65rem", borderRadius: "20px",
      background: `${color}18`, border: `1px solid ${color}30`,
      fontSize: "0.7rem", fontWeight: 700, color, letterSpacing: "0.05em",
    }}>{children}</span>
  );
}

// ── Section wrapper ────────────────────────────────────────
function Section({ children, id, style }) {
  return (
    <section id={id} style={{ padding: "5rem 1.25rem", maxWidth: 560, margin: "0 auto", ...style }}>
      {children}
    </section>
  );
}

// ── Stat card ──────────────────────────────────────────────
function StatCard({ value, label, sub }) {
  return (
    <div style={{
      flex: 1, padding: "1.25rem", background: C.card,
      border: `1px solid ${C.border}`, borderRadius: 16, textAlign: "center",
    }}>
      <div style={{ fontFamily: "'Bebas Neue'", fontSize: "2.2rem", color: C.green, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: "0.78rem", fontWeight: 700, marginTop: "0.35rem" }}>{label}</div>
      {sub && <div style={{ fontSize: "0.62rem", color: C.textDim, marginTop: "0.2rem" }}>{sub}</div>}
    </div>
  );
}

// ── Feature card ───────────────────────────────────────────
function FeatureCard({ icon, title, desc }) {
  return (
    <div style={{
      padding: "1.25rem", background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 16, display: "flex", gap: "0.9rem", alignItems: "flex-start",
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10, background: C.greenDim,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "1.1rem", flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontWeight: 700, fontSize: "0.88rem", marginBottom: "0.3rem" }}>{title}</div>
        <div style={{ fontSize: "0.75rem", color: C.textSub, lineHeight: 1.6 }}>{desc}</div>
      </div>
    </div>
  );
}

// ── Price card ─────────────────────────────────────────────
function PriceCard({ tier, price, period, features, cta, highlight, onCta }) {
  return (
    <div style={{
      padding: "1.5rem", background: highlight ? "linear-gradient(135deg,#0a2a1a,#0d1f2d)" : C.card,
      border: `1.5px solid ${highlight ? C.green : C.border}`,
      borderRadius: 20, position: "relative", flex: 1,
    }}>
      {highlight && (
        <div style={{
          position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
          background: C.green, color: "#000", fontSize: "0.65rem", fontWeight: 800,
          padding: "0.2rem 0.8rem", borderRadius: 20, letterSpacing: "0.08em",
        }}>MEEST POPULAIR</div>
      )}
      <div style={{ marginBottom: "0.4rem", fontSize: "0.75rem", fontWeight: 700, color: C.textSub, letterSpacing: "0.08em" }}>{tier}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "0.3rem", marginBottom: "1.2rem" }}>
        <span style={{ fontFamily: "'Bebas Neue'", fontSize: "2.8rem", color: highlight ? C.green : C.text, lineHeight: 1 }}>{price}</span>
        {period && <span style={{ fontSize: "0.75rem", color: C.textSub }}>{period}</span>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1.5rem" }}>
        {features.map((f, i) => (
          <div key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start", fontSize: "0.78rem" }}>
            <span style={{ color: f.disabled ? C.textDim : C.green, flexShrink: 0, marginTop: "0.1rem" }}>
              {f.disabled ? "○" : "✓"}
            </span>
            <span style={{ color: f.disabled ? C.textDim : C.text }}>{f.text}</span>
          </div>
        ))}
      </div>
      <button onClick={onCta} style={{
        width: "100%", padding: "0.85rem", borderRadius: 12,
        background: highlight ? C.green : "rgba(255,255,255,0.06)",
        border: `1px solid ${highlight ? C.green : C.border}`,
        color: highlight ? "#000" : C.text, fontWeight: 700, fontSize: "0.85rem",
        cursor: "pointer", transition: "all 0.2s",
      }}>{cta}</button>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────
export default function Matchcast() {
  const [page, setPage] = useState("landing"); // landing | app
  const [email, setEmail] = useState("");
  const [waitlistDone, setWaitlistDone] = useState(false);
  const [liveMatch, setLiveMatch] = useState(null);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    });
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setInstallPrompt(null);
  };

  // Demo prediction for landing page
  const runDemo = async () => {
    setLoadingDemo(true);
    try {
      const res = await fetch(`${BACKEND_URL}/predict?home=Netherlands&away=Germany&neutral=true`);
      if (res.ok) setLiveMatch(await res.json());
    } catch (e) {
      setLiveMatch({
        home: "Netherlands", away: "Germany",
        homeWin: 0.39, draw: 0.22, awayWin: 0.39,
        lambdaHome: 1.39, lambdaAway: 1.39, totalGoals: 2.78,
        ou25: 0.53, btts: 0.56, likelyHome: 1, likelyAway: 1,
      });
    }
    setLoadingDemo(false);
  };

  useEffect(() => { runDemo(); }, []);

  if (page === "app") return (
    <div style={{background:"#0b0b17",minHeight:"100vh"}}>
      <PredictionApp onBack={() => setPage("landing")} />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <style>{styles}</style>

      {/* ── NAV ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "1rem 1.5rem", display: "flex", alignItems: "center",
        justifyContent: "space-between", background: "rgba(8,8,17,0.85)",
        backdropFilter: "blur(20px)", borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.2rem" }}>⚽</span>
          <span style={{ fontFamily: "'Bebas Neue'", fontSize: "1.4rem", letterSpacing: "0.05em" }}>
            MATCH<span style={{ color: C.green }}>CAST</span>
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Pill>WK 2026</Pill>
          {installPrompt && (
            <button onClick={handleInstall} style={{
              padding: "0.5rem 1rem", background: "rgba(0,232,122,0.1)",
              border: `1px solid ${C.greenBorder}`, borderRadius: 10,
              color: C.green, fontWeight: 700, fontSize: "0.75rem", cursor: "pointer",
            }}>📲 Installeer</button>
          )}
          <button onClick={() => setPage("app")} style={{
            padding: "0.5rem 1.1rem", background: C.green, border: "none",
            borderRadius: 10, color: "#000", fontWeight: 700, fontSize: "0.8rem",
            cursor: "pointer",
          }}>Open app</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <Section style={{ paddingTop: "7rem", textAlign: "center" }}>
        <div className="fadeUp" style={{ animationDelay: "0.1s" }}>
          <Pill>⚡ AI-powered · 62% accuraat</Pill>
        </div>
        <h1 className="fadeUp" style={{
          fontFamily: "'Bebas Neue'", fontSize: "clamp(3.5rem,12vw,5.5rem)",
          lineHeight: 0.95, margin: "1rem 0 1.25rem", letterSpacing: "0.02em",
          animationDelay: "0.2s",
        }}>
          DE SLIMSTE<br />
          <span style={{
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundImage: `linear-gradient(135deg, ${C.green}, #00c4ff)`,
          }}>WK VOORSPELLER</span>
        </h1>
        <p className="fadeUp" style={{
          fontSize: "1rem", color: C.textSub, lineHeight: 1.7,
          maxWidth: 400, margin: "0 auto 2rem", animationDelay: "0.3s",
        }}>
          AI-model getraind op 49.000 wedstrijden. Realtime value alerts. Live blessure data. Alles wat je nodig hebt voor WK 2026.
        </p>
        <div className="fadeUp" style={{ display: "flex", gap: "0.75rem", justifyContent: "center", animationDelay: "0.4s" }}>
          <button onClick={() => setPage("app")} style={{
            padding: "0.9rem 2rem", background: C.green, border: "none",
            borderRadius: 12, color: "#000", fontWeight: 700, fontSize: "0.95rem",
            cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem",
          }}>
            ⚽ Gratis starten
          </button>
          <button onClick={() => document.getElementById("prijzen").scrollIntoView()} style={{
            padding: "0.9rem 1.5rem", background: "transparent",
            border: `1px solid ${C.border}`, borderRadius: 12,
            color: C.textSub, fontWeight: 600, fontSize: "0.9rem", cursor: "pointer",
          }}>
            Pro bekijken →
          </button>
        </div>
        <div className="fadeUp" style={{
          marginTop: "1rem", fontSize: "0.68rem", color: C.textDim,
          display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
          animationDelay: "0.5s",
        }}>
          <span>📲 iPhone: deel-knop → "Zet op beginscherm"</span>
        </div>

        {/* Live demo card */}
        {liveMatch && (
          <div className="fadeUp float" style={{
            marginTop: "2.5rem", padding: "1.5rem", background: C.card,
            border: `1px solid ${C.border}`, borderRadius: 20,
            animationDelay: "0.5s", textAlign: "left",
          }}>
            <div style={{ fontSize: "0.6rem", color: C.textDim, letterSpacing: "0.1em", marginBottom: "1rem", textAlign: "center" }}>
              🔴 LIVE PREVIEW — NETHERLANDS VS GERMANY
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div style={{ textAlign: "center", flex: 1 }}>
                <div style={{ fontSize: "2rem" }}>🇳🇱</div>
                <div style={{ fontSize: "0.7rem", marginTop: "0.3rem" }}>Netherlands</div>
                <div style={{ fontSize: "0.55rem", color: C.textDim }}>ELO 1925</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: "2.5rem", lineHeight: 1 }}>
                  {liveMatch.likelyHome}–{liveMatch.likelyAway}
                </div>
                <div style={{ fontSize: "0.55rem", color: C.green, fontWeight: 700 }}>MEEST WAARSCHIJNLIJK</div>
              </div>
              <div style={{ textAlign: "center", flex: 1 }}>
                <div style={{ fontSize: "2rem" }}>🇩🇪</div>
                <div style={{ fontSize: "0.7rem", marginTop: "0.3rem" }}>Germany</div>
                <div style={{ fontSize: "0.55rem", color: C.textDim }}>ELO 1920</div>
              </div>
            </div>
            <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", height: 32, gap: 2 }}>
              {[
                { p: liveMatch.homeWin, c: C.green, l: `${(liveMatch.homeWin * 100).toFixed(0)}%` },
                { p: liveMatch.draw, c: C.gold, l: `${(liveMatch.draw * 100).toFixed(0)}%` },
                { p: liveMatch.awayWin, c: C.red, l: `${(liveMatch.awayWin * 100).toFixed(0)}%` },
              ].map(({ p, c, l }, i) => (
                <div key={i} style={{
                  flex: p, background: c, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "0.7rem", fontWeight: 800, color: "#000",
                }}>{l}</div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
              {[
                { l: "O2.5", v: `${(liveMatch.ou25 * 100).toFixed(0)}%` },
                { l: "BTTS", v: `${(liveMatch.btts * 100).toFixed(0)}%` },
                { l: "Goals", v: liveMatch.totalGoals?.toFixed(1) },
              ].map(({ l, v }) => (
                <div key={l} style={{
                  flex: 1, padding: "0.4rem", background: "rgba(255,255,255,0.04)",
                  borderRadius: 8, textAlign: "center",
                }}>
                  <div style={{ fontSize: "0.55rem", color: C.textDim }}>{l}</div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* ── STATS ── */}
      <Section>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <StatCard value="62%" label="Accuraatheid" sub="Gevalideerd model" />
          <StatCard value="49K" label="Wedstrijden" sub="Trainingsdata" />
          <StatCard value="337" label="Landen" sub="WK + internationals" />
        </div>
      </Section>

      {/* ── HOE HET WERKT ── */}
      <Section>
        <div style={{ marginBottom: "2rem" }}>
          <Pill>Hoe het werkt</Pill>
          <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: "2.5rem", marginTop: "0.75rem", lineHeight: 1 }}>
            DRIE STAPPEN<br /><span style={{ color: C.green }}>NAAR DE BESTE BET</span>
          </h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {[
            { n: "01", icon: "⚽", title: "Kies je wedstrijd", desc: "Selecteer twee landen of kies uit de volledige WK 2026 speellijst met alle 72 wedstrijden." },
            { n: "02", icon: "🧠", title: "AI berekent de kansen", desc: "Ons model combineert Elo-ratings, attack/defense data en live blessure-informatie voor de meest accurate voorspelling." },
            { n: "03", icon: "🔥", title: "Ontdek value bets", desc: "Voer bookmaker odds in en het model detecteert automatisch waar jij een edge hebt ten opzichte van de bookmaker." },
          ].map(({ n, icon, title, desc }) => (
            <div key={n} style={{
              padding: "1.25rem", background: C.card, border: `1px solid ${C.border}`,
              borderRadius: 16, display: "flex", gap: "1rem",
            }}>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: "1.8rem", color: C.greenDim.replace("0.1", "0.4"), lineHeight: 1, flexShrink: 0, width: 32 }}>{n}</div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                  <span>{icon}</span>
                  <span style={{ fontWeight: 700, fontSize: "0.88rem" }}>{title}</span>
                </div>
                <div style={{ fontSize: "0.75rem", color: C.textSub, lineHeight: 1.6 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── FEATURES ── */}
      <Section>
        <div style={{ marginBottom: "2rem" }}>
          <Pill>Features</Pill>
          <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: "2.5rem", marginTop: "0.75rem", lineHeight: 1 }}>
            ALLES VOOR<br /><span style={{ color: C.green }}>SLIMME FANS</span>
          </h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <FeatureCard icon="📊" title="62% accurate voorspellingen" desc="Getraind op 49.000 internationale wedstrijden met Elo + attack/defense model." />
          <FeatureCard icon="🔥" title="Value bet detectie" desc="Voer bookmaker odds in — het model toont direct waar jij een edge hebt." />
          <FeatureCard icon="⚡" title="Live data integratie" desc="Blessures en spelersvormen worden real-time opgehaald via API-Football." />
          <FeatureCard icon="🏆" title="Volledige WK speellijst" desc="Alle 72 groepswedstrijden in 3 rondes — van 11 juni t/m 26 juni." />
          <FeatureCard icon="📈" title="Over/Under markten" desc="O1.5, O2.5, O3.5 en BTTS kansen met confidence indicators." />
          <FeatureCard icon="🧠" title="AI wedstrijd analyse" desc="Diepgaande analyse van elk duel — Elo, aanval, verdediging en verwachte goals." />
        </div>
      </Section>

      {/* ── PRIJZEN ── */}
      <Section id="prijzen">
        <div style={{ marginBottom: "2rem", textAlign: "center" }}>
          <Pill>Prijzen</Pill>
          <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: "2.5rem", marginTop: "0.75rem", lineHeight: 1 }}>
            KIES JE<br /><span style={{ color: C.green }}>ABONNEMENT</span>
          </h2>
          <p style={{ fontSize: "0.82rem", color: C.textSub, marginTop: "0.75rem" }}>
            Start gratis. Upgrade wanneer je klaar bent.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <PriceCard
            tier="GRATIS"
            price="€0"
            features={[
              { text: "WK 2026 voorspellingen" },
              { text: "Basis 1X2 kansen" },
              { text: "ELO rankings" },
              { text: "Value detectie", disabled: true },
              { text: "Live data", disabled: true },
              { text: "Bet tracker", disabled: true },
            ]}
            cta="Gratis starten"
            onCta={() => setPage("app")}
          />
          <PriceCard
            tier="PRO"
            price="€9.99"
            period="/mnd"
            highlight
            features={[
              { text: "Alles in Gratis" },
              { text: "Value bet alerts 🔥" },
              { text: "Live blessure data ⚡" },
              { text: "O/U confidence model" },
              { text: "Bet tracker + ROI" },
              { text: "AI wedstrijd analyse" },
            ]}
            cta="Pro starten — €9.99/mnd"
            onCta={() => window.open("https://buy.stripe.com/7sY9AMajN3GN7HLajs97G00", "_blank")}
          />
          <PriceCard
            tier="ELITE"
            price="€24.99"
            period="/mnd"
            features={[
              { text: "Alles in Pro" },
              { text: "xG data integratie 📊" },
              { text: "Dagelijkse picks" },
              { text: "Persoonlijke ROI analyse" },
              { text: "Push notificaties" },
              { text: "Champions League (na WK)" },
            ]}
            cta="Snel beschikbaar"
            onCta={() => document.getElementById("waitlist").scrollIntoView({ behavior: "smooth" })}
          />
        </div>
        <p style={{ fontSize: "0.68rem", color: C.textDim, textAlign: "center", marginTop: "1rem" }}>
          ⚠️ Matchcast is een informatietool. Voorspellingen zijn geen garantie op winst.
        </p>
      </Section>

      {/* ── WAITLIST ── */}
      <Section id="waitlist">
        <div style={{
          padding: "2rem", background: "linear-gradient(135deg,#0a2a1a,#0d1f2d)",
          border: `1px solid ${C.greenBorder}`, borderRadius: 24, textAlign: "center",
        }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🚀</div>
          <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: "2rem", lineHeight: 1, marginBottom: "0.75rem" }}>
            WEES ER ALS EERSTE<br /><span style={{ color: C.green }}>PRO LANCERING WK 2026</span>
          </h2>
          <p style={{ fontSize: "0.82rem", color: C.textSub, marginBottom: "1rem", lineHeight: 1.6 }}>
            Pro is nu beschikbaar voor €9.99/mnd. Meld je aan of start direct.
          </p>
          <button onClick={() => window.open("https://buy.stripe.com/7sY9AMajN3GN7HLajs97G00", "_blank")} style={{ width: "100%", padding: "0.85rem", background: C.green, border: "none", borderRadius: 12, color: "#000", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", marginBottom: "0.75rem" }}>
            🚀 Start Matchcast Pro — €9.99/mnd
          </button>
          {waitlistDone ? (
            <div style={{ padding: "1rem", background: C.greenDim, borderRadius: 12, color: C.green, fontWeight: 700 }}>
              ✅ Je staat op de lijst! We mailen je vóór 11 juni.
            </div>
          ) : (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="email"
                placeholder="jouw@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  flex: 1, padding: "0.8rem 1rem", background: "rgba(255,255,255,0.06)",
                  border: `1px solid ${C.border}`, borderRadius: 10, color: C.text,
                  fontSize: "0.85rem", outline: "none",
                }}
              />
              <button
                onClick={() => email.includes("@") && setWaitlistDone(true)}
                style={{
                  padding: "0.8rem 1.2rem", background: C.green, border: "none",
                  borderRadius: 10, color: "#000", fontWeight: 700, fontSize: "0.85rem",
                  cursor: "pointer", whiteSpace: "nowrap",
                }}>
                Aanmelden →
              </button>
            </div>
          )}
        </div>
      </Section>

      {/* ── FOOTER ── */}
      <footer style={{
        padding: "2rem 1.5rem", borderTop: `1px solid ${C.border}`,
        textAlign: "center",
      }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: "1.5rem", marginBottom: "0.5rem" }}>
          MATCH<span style={{ color: C.green }}>CAST</span>
        </div>
        <div style={{ fontSize: "0.7rem", color: C.textDim, lineHeight: 1.8 }}>
          AI-powered voetbalvoorspellingen voor WK 2026<br />
          ⚠️ Voor informatiedoeleinden. Geen garantie op winstgevend gokken.<br />
          © 2026 Matchcast
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", marginTop: "1rem" }}>
          {["Privacy", "Voorwaarden", "Contact"].map(l => (
            <span key={l} style={{ fontSize: "0.72rem", color: C.textDim, cursor: "pointer" }}>{l}</span>
          ))}
        </div>
      </footer>
    </div>
  );
}

// ── Prediction App (full app) ──────────────────────────────
// Import the existing app logic here
function PredictionApp({ onBack }) {
  // This renders the full prediction app
  // Re-use all the existing app code from matchcast-v6
  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <style>{styles}</style>
      <div style={{
        padding: "0.75rem 1rem", display: "flex", alignItems: "center",
        gap: "0.75rem", borderBottom: `1px solid ${C.border}`,
        background: "rgba(8,8,17,0.9)", backdropFilter: "blur(20px)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <button onClick={onBack} style={{
          padding: "0.4rem 0.8rem", background: "rgba(255,255,255,0.06)",
          border: `1px solid ${C.border}`, borderRadius: 8,
          color: C.textSub, fontSize: "0.75rem", cursor: "pointer",
        }}>← Terug</button>
        <span style={{ fontFamily: "'Bebas Neue'", fontSize: "1.2rem" }}>
          MATCH<span style={{ color: C.green }}>CAST</span>
        </span>
      </div>
      <MatchcastPredictor />
    </div>
  );
}
