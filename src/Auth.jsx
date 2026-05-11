import { useState, useEffect, createContext, useContext } from "react";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://yfjxuokihdlawrjtxtgb.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlmanh1b2tpaGRsYXdyanR4dGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwODQwNjMsImV4cCI6MjA5MzY2MDA2M30.y9ll24SmJ4B16p1OUMFSjUG7v8N3SkOaYZt-lEv73wQ";
const STRIPE_PRO_LINK = "https://buy.stripe.com/7sY9AMajN3GN7HLajs97G00";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// ── Auth Context ───────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check huidige sessie
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });

    // Luister naar auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    setProfile(data);
  };

  const signUp = async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return error;
  };

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const isPro = profile?.is_pro === true;

  return (
    <AuthContext.Provider value={{ user, profile, loading, isPro, signUp, signIn, signOut, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

// ── Auth Modal ─────────────────────────────────────────────
const C = {
  bg: "#080811", card: "#13132a", border: "rgba(255,255,255,0.08)",
  green: "#00e87a", text: "#fff", textSub: "rgba(255,255,255,0.5)",
  textDim: "rgba(255,255,255,0.25)",
};

export function AuthModal({ onClose }) {
  const [mode, setMode] = useState("signin"); // signin | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { signIn, signUp } = useAuth();

  const handleSubmit = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError("");
    setSuccess("");

    if (mode === "signin") {
      const err = await signIn(email, password);
      if (err) setError("Verkeerd email of wachtwoord");
      else onClose();
    } else {
      const err = await signUp(email, password);
      if (err) setError(err.message);
      else setSuccess("Check je email voor een bevestigingslink!");
    }
    setLoading(false);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "1rem",
    }} onClick={onClose}>
      <div style={{
        background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 20, padding: "1.75rem", width: "100%", maxWidth: 380,
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>⚽</div>
          <div style={{ fontSize: "1.1rem", fontWeight: 800 }}>
            {mode === "signin" ? "Inloggen" : "Account aanmaken"}
          </div>
          <div style={{ fontSize: "0.75rem", color: C.textSub, marginTop: "0.3rem" }}>
            {mode === "signin" ? "Welkom terug bij NeurBet" : "Gratis starten — geen creditcard nodig"}
          </div>
        </div>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", marginBottom: "1rem" }}>
          <input
            type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              padding: "0.8rem 1rem", background: "rgba(255,255,255,0.06)",
              border: `1px solid ${C.border}`, borderRadius: 10,
              color: C.text, fontSize: "0.9rem", outline: "none",
            }}
          />
          <input
            type="password" placeholder="Wachtwoord (min. 6 tekens)" value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            style={{
              padding: "0.8rem 1rem", background: "rgba(255,255,255,0.06)",
              border: `1px solid ${C.border}`, borderRadius: 10,
              color: C.text, fontSize: "0.9rem", outline: "none",
            }}
          />
        </div>

        {/* Error/Success */}
        {error && <div style={{ padding: "0.5rem 0.75rem", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, fontSize: "0.75rem", color: "#f87171", marginBottom: "0.75rem" }}>{error}</div>}
        {success && <div style={{ padding: "0.5rem 0.75rem", background: "rgba(0,232,122,0.1)", border: "1px solid rgba(0,232,122,0.2)", borderRadius: 8, fontSize: "0.75rem", color: C.green, marginBottom: "0.75rem" }}>{success}</div>}

        {/* Submit */}
        <button onClick={handleSubmit} disabled={loading || !email || !password} style={{
          width: "100%", padding: "0.85rem", background: C.green,
          border: "none", borderRadius: 12, color: "#000",
          fontWeight: 700, fontSize: "0.9rem", cursor: "pointer",
          opacity: loading ? 0.7 : 1, marginBottom: "0.75rem",
        }}>
          {loading ? "Bezig..." : mode === "signin" ? "Inloggen" : "Account aanmaken"}
        </button>

        {/* Toggle mode */}
        <div style={{ textAlign: "center", fontSize: "0.75rem", color: C.textSub }}>
          {mode === "signin" ? (
            <>Nog geen account? <span onClick={() => setMode("signup")} style={{ color: C.green, cursor: "pointer", fontWeight: 600 }}>Aanmaken</span></>
          ) : (
            <>Al een account? <span onClick={() => setMode("signin")} style={{ color: C.green, cursor: "pointer", fontWeight: 600 }}>Inloggen</span></>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Pro Modal ──────────────────────────────────────────────
export function ProModal({ onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "1rem",
    }} onClick={onClose}>
      <div style={{
        background: "linear-gradient(135deg,#0a2a1a,#0d1f2d)",
        border: "1.5px solid rgba(0,232,122,0.3)",
        borderRadius: 20, padding: "1.75rem", width: "100%", maxWidth: 380,
      }} onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🚀</div>
          <div style={{ fontSize: "1.1rem", fontWeight: 800 }}>NeurBet Pro</div>
          <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginTop: "0.3rem" }}>
            Alles wat je nodig hebt voor het WK
          </div>
        </div>

        {[
          "⚡ Automatische bookmaker odds",
          "🔥 Value bet alerts",
          "📊 O/U confidence model",
          "🧠 AI wedstrijd analyse",
          "📈 Bet tracker + ROI",
          "🏆 Alle 72 WK wedstrijden",
        ].map((f, i) => (
          <div key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "center", padding: "0.35rem 0", fontSize: "0.82rem" }}>
            <span>{f}</span>
          </div>
        ))}

        <div style={{ textAlign: "center", margin: "1.25rem 0 0.5rem" }}>
          <span style={{ fontSize: "2rem", fontWeight: 800, color: C.green }}>€9.99</span>
          <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>/mnd</span>
        </div>

        <button onClick={() => window.open(STRIPE_PRO_LINK, "_blank")} style={{
          width: "100%", padding: "0.85rem", background: C.green,
          border: "none", borderRadius: 12, color: "#000",
          fontWeight: 700, fontSize: "0.9rem", cursor: "pointer",
          marginBottom: "0.5rem",
        }}>
          Pro starten — €9.99/mnd
        </button>

        <div style={{ textAlign: "center", fontSize: "0.68rem", color: "rgba(255,255,255,0.25)" }}>
          Annuleer altijd · Stripe betaling · Veilig
        </div>
      </div>
    </div>
  );
}

// ── User Menu ──────────────────────────────────────────────
export function UserMenu({ onShowAuth, onShowPro }) {
  const { user, isPro, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) {
    return (
      <button onClick={onShowAuth} style={{
        padding: "0.4rem 0.8rem", background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
        color: "rgba(255,255,255,0.6)", fontSize: "0.72rem",
        fontWeight: 600, cursor: "pointer",
      }}>
        Inloggen
      </button>
    );
  }

  const name = user.email?.split("@")[0];

  return (
    <div style={{ position: "relative", zIndex: 999 }}>
      <button onClick={() => setOpen(!open)} style={{
        padding: "0.35rem 0.7rem", borderRadius: 8, cursor: "pointer",
        background: isPro ? "rgba(0,232,122,0.1)" : "rgba(255,255,255,0.06)",
        border: `1px solid ${isPro ? "rgba(0,232,122,0.3)" : "rgba(255,255,255,0.1)"}`,
        color: isPro ? "#00e87a" : "rgba(255,255,255,0.6)",
        fontSize: "0.72rem", fontWeight: 700,
      }}>
        {isPro ? "⚡" : "👤"} {name}
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 997 }} />
          <div style={{
            position: "fixed",
            top: "56px",
            right: "12px",
            background: "#13132a",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12, minWidth: 190, zIndex: 998,
            boxShadow: "0 20px 60px rgba(0,0,0,0.9)",
          }}>
            <div style={{ padding: "0.7rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>{user.email}</div>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: isPro ? "#00e87a" : "rgba(255,255,255,0.4)", marginTop: "0.2rem" }}>
                {isPro ? "⚡ Pro lid" : "Gratis account"}
              </div>
            </div>
            {!isPro && (
              <button onClick={() => { setOpen(false); onShowPro(); }} style={{
                width: "100%", padding: "0.7rem 1rem", background: "transparent",
                border: "none", borderBottom: "1px solid rgba(255,255,255,0.08)",
                color: "#00e87a", fontSize: "0.78rem",
                fontWeight: 700, cursor: "pointer", textAlign: "left",
              }}>
                🚀 Upgrade naar Pro
              </button>
            )}
            <button onClick={() => { setOpen(false); signOut(); }} style={{
              width: "100%", padding: "0.7rem 1rem", background: "transparent",
              border: "none", color: "#f87171", fontSize: "0.78rem",
              cursor: "pointer", textAlign: "left", fontWeight: 600,
            }}>
              Uitloggen
            </button>
          </div>
        </>
      )}
    </div>
  );
}
