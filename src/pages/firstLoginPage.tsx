import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { me as apiMe, setAuthToken, firstLoginVerify, firstLoginSetPassword } from "../lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
const ADMIN_ROLES = [
  "vendor","group_admin","group_exe","group_hr","group_finance",
  "group_operation","group_production","group_marketing","group_legal",
  "sub_admin","sub_md","sub_hr","sub_finance","sub_operations",
];

// ─── Sub-components ───────────────────────────────────────────────────────────
function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

function PasswordStrength({ password }: { password: string }) {
  const checks: { label: string; ok: boolean }[] = [
    { label: "8+ characters", ok: password.length >= 8 },
    { label: "Uppercase",     ok: /[A-Z]/.test(password) },
    { label: "Number",        ok: /[0-9]/.test(password) },
    { label: "Symbol",        ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const colors = ["#f87171","#fb923c","#facc15","#34d399"];
  const bar    = colors[score - 1] ?? "#e2e8f0";
  const labels = ["","Weak","Fair","Good","Strong"];
  if (!password) return null;
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", gap: 4, height: 4, marginBottom: 6 }}>
        {[1,2,3,4].map((i) => (
          <div key={i} style={{
            flex: 1, borderRadius: 4,
            background: i <= score ? bar : "#e2e8f0",
            transition: "background .3s",
          }} />
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {checks.map((c) => (
            <span key={c.label} style={{
              fontSize: 10,
              color: c.ok ? "#059669" : "#94a3b8",
              display: "flex", alignItems: "center", gap: 2,
              transition: "color .2s",
            }}>
              {c.ok ? "✓" : "○"} {c.label}
            </span>
          ))}
        </div>
        {labels[score] && (
          <span style={{ fontSize: 10, fontWeight: 600, color: bar }}>{labels[score]}</span>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function FirstLoginPage() {
  const [searchParams]  = useSearchParams();
  const navigate        = useNavigate();

  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState<string | null>(null);
  const [password, setPassword]             = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw]                 = useState(false);
  const [showConfirm, setShowConfirm]       = useState(false);
  const [submitting, setSubmitting]         = useState(false);
  const [done, setDone]                     = useState(false);
  const [mounted, setMounted]               = useState(false);

  const token = searchParams.get("token");
  const pwRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    if (!token) {
      setError("Invalid or missing first-time login link.");
      setLoading(false);
      return;
    }
    firstLoginVerify({ token })
      .then(() => { setLoading(false); setTimeout(() => pwRef.current?.focus(), 50); })
      .catch(() => {
        setError("This link is invalid or has expired. Please request a new one.");
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!token || submitting) return;
    if (password !== confirmPassword) { setError("Passwords don't match."); return; }
    if (password.length < 8)          { setError("Password must be at least 8 characters."); return; }
    setSubmitting(true);
    setError(null);
    try {
      const { data } = await firstLoginSetPassword({ token, new_password: password });
      setAuthToken(data.access_token);
      const meResp = await apiMe();
      setDone(true);
      setTimeout(() => {
        const role = meResp.data?.role || "";
        navigate(ADMIN_ROLES.includes(role) ? "/admin/companies" : "/chat");
      }, 1800);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setError(e?.response?.data?.detail || "Could not set password. Please try again or contact support.");
      setSubmitting(false);
    }
  };

  // ─── Inline styles ──────────────────────────────────────────────────────────
  const s = {
    root: {
      fontFamily: "'DM Sans', sans-serif",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f8f7f4",
      padding: "1.5rem",
      position: "relative" as const,
      overflow: "hidden",
    } as React.CSSProperties,
    dots: {
      position: "fixed" as const,
      inset: 0,
      pointerEvents: "none" as const,
      backgroundImage: "radial-gradient(circle, #c7c5bd 1px, transparent 1px)",
      backgroundSize: "28px 28px",
      opacity: 0.35,
    } as React.CSSProperties,
    gradientOrb1: {
      position: "fixed" as const,
      inset: 0,
      background: "radial-gradient(ellipse 60% 50% at 80% 20%, rgba(99,102,241,.06) 0%, transparent 60%), radial-gradient(ellipse 50% 60% at 10% 80%, rgba(16,185,129,.05) 0%, transparent 60%)",
      pointerEvents: "none" as const,
    } as React.CSSProperties,
    card: {
      position: "relative" as const,
      width: "100%",
      maxWidth: 420,
      background: "#ffffff",
      border: "1px solid #e8e5de",
      borderRadius: 16,
      padding: "2.25rem 2rem",
      boxShadow: "0 1px 3px rgba(0,0,0,.04), 0 8px 32px rgba(0,0,0,.06)",
      opacity: mounted ? 1 : 0,
      transform: mounted ? "translateY(0)" : "translateY(16px)",
      transition: "opacity .45s ease, transform .45s ease",
    } as React.CSSProperties,
    accentLine: {
      position: "absolute" as const,
      top: 0, left: "2rem", right: "2rem",
      height: 2,
      background: "linear-gradient(90deg, #6366f1, #10b981)",
      borderRadius: "0 0 2px 2px",
    } as React.CSSProperties,
    brand: {
      display: "flex", alignItems: "center", gap: 8, marginBottom: "1.75rem",
    } as React.CSSProperties,
    brandMark: {
      width: 32, height: 32,
      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
      borderRadius: 8,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    } as React.CSSProperties,
    brandName: {
      fontSize: 13, fontWeight: 600, color: "#1e1b18", letterSpacing: "-.01em",
    } as React.CSSProperties,
    heading: {
      fontSize: "1.375rem", fontWeight: 600, color: "#1e1b18",
      letterSpacing: "-.025em", lineHeight: 1.25, marginBottom: ".5rem",
    } as React.CSSProperties,
    sub: {
      fontSize: 13, color: "#8b8880", lineHeight: 1.55,
      marginBottom: "1.75rem", fontWeight: 300,
    } as React.CSSProperties,
    errorBox: {
      display: "flex", alignItems: "flex-start", gap: 8,
      padding: "10px 12px",
      background: "#fff5f5", border: "1px solid #fecaca",
      borderRadius: 8, fontSize: 12.5, color: "#b91c1c",
      marginBottom: "1.1rem", lineHeight: 1.45,
    } as React.CSSProperties,
    loadingWrap: {
      display: "flex", alignItems: "center", gap: 10,
      fontSize: 13, color: "#8b8880", padding: "1rem 0",
    } as React.CSSProperties,
    spinner: {
      width: 18, height: 18,
      border: "2px solid #e2ded6", borderTopColor: "#6366f1",
      borderRadius: "50%",
      animation: "flp-spin .7s linear infinite",
      flexShrink: 0,
    } as React.CSSProperties,
    field: { marginBottom: "1.1rem" } as React.CSSProperties,
    label: {
      display: "block", fontSize: 11.5, fontWeight: 500,
      color: "#4a4743", letterSpacing: ".02em",
      textTransform: "uppercase" as const, marginBottom: 6,
    } as React.CSSProperties,
    inputWrap: {
      position: "relative" as const, display: "flex", alignItems: "center",
    } as React.CSSProperties,
    input: (extra?: object): React.CSSProperties => ({
      width: "100%", padding: "10px 40px 10px 13px",
      fontFamily: "'DM Mono', monospace", fontSize: 13.5,
      background: "#faf9f7", border: "1.5px solid #e2ded6",
      borderRadius: 10, color: "#1e1b18", outline: "none",
      transition: "border-color .2s, box-shadow .2s",
      ...extra,
    }),
    eyeBtn: {
      position: "absolute" as const, right: 11,
      background: "none", border: "none", color: "#a8a49e",
      cursor: "pointer", padding: 2,
      display: "flex", alignItems: "center", borderRadius: 4,
    } as React.CSSProperties,
    matchHint: (ok: boolean): React.CSSProperties => ({
      fontSize: 11, marginTop: 5,
      display: "flex", alignItems: "center", gap: 4,
      color: ok ? "#10b981" : "#f87171",
    }),
    btn: (disabled: boolean): React.CSSProperties => ({
      width: "100%", padding: "11px 16px",
      fontFamily: "'DM Sans', sans-serif",
      fontSize: 14, fontWeight: 500, letterSpacing: "-.01em",
      background: disabled ? "#9ca3af" : "#1e1b18",
      color: "#fff", border: "none", borderRadius: 10,
      cursor: disabled ? "not-allowed" : "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
      gap: 8, marginTop: "1.25rem",
      transition: "background .2s",
      opacity: disabled ? 0.6 : 1,
    }),
    btnSpinner: {
      width: 14, height: 14,
      border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff",
      borderRadius: "50%", animation: "flp-spin .6s linear infinite",
    } as React.CSSProperties,
    successWrap: {
      display: "flex", flexDirection: "column" as const,
      alignItems: "center", textAlign: "center" as const,
      padding: "2rem 0 1rem", gap: 12,
    } as React.CSSProperties,
    successRing: {
      width: 56, height: 56, borderRadius: "50%",
      background: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
      display: "flex", alignItems: "center", justifyContent: "center",
    } as React.CSSProperties,
    footer: {
      marginTop: "1.5rem", textAlign: "center" as const,
      fontSize: 11.5, color: "#bfbbb5",
    } as React.CSSProperties,
  };

  return (
    <>
      {/* Keyframes injected once */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&family=DM+Mono:wght@400;500&display=swap');
        @keyframes flp-spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={s.root}>
        <div style={s.dots} />
        <div style={s.gradientOrb1} />

        <div style={s.card}>
          <div style={s.accentLine} />

          {/* Brand */}
          <div style={s.brand}>
            <div style={s.brandMark}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <span style={s.brandName}>Secure Access</span>
          </div>

          <h1 style={s.heading}>Set your password</h1>
          <p style={s.sub}>You're one step away. Choose a strong password to activate your account.</p>

          {/* Error */}
          {error && (
            <div style={s.errorBox}>
              <svg style={{ flexShrink: 0, marginTop: 1 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={s.loadingWrap}>
              <div style={s.spinner} />
              Verifying your link…
            </div>
          )}

          {/* Form */}
          {!loading && !done && (
            <form onSubmit={handleSubmit}>
              {/* New password */}
              <div style={s.field}>
                <label style={s.label}>New password</label>
                <div style={s.inputWrap}>
                  <input
                    ref={pwRef}
                    type={showPw ? "text" : "password"}
                    style={s.input()}
                    placeholder="············"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(null); }}
                    required
                    disabled={submitting}
                    autoComplete="new-password"
                  />
                  <button type="button" style={s.eyeBtn} onClick={() => setShowPw(v => !v)} tabIndex={-1}>
                    <EyeIcon open={showPw} />
                  </button>
                </div>
                <PasswordStrength password={password} />
              </div>

              {/* Confirm password */}
              <div style={s.field}>
                <label style={s.label}>Confirm password</label>
                <div style={s.inputWrap}>
                  <input
                    type={showConfirm ? "text" : "password"}
                    style={s.input({
                      borderColor: confirmPassword
                        ? password === confirmPassword ? "#10b981" : "#f87171"
                        : "#e2ded6",
                    })}
                    placeholder="············"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
                    required
                    disabled={submitting}
                    autoComplete="new-password"
                  />
                  <button type="button" style={s.eyeBtn} onClick={() => setShowConfirm(v => !v)} tabIndex={-1}>
                    <EyeIcon open={showConfirm} />
                  </button>
                </div>
                {confirmPassword && (
                  <p style={s.matchHint(password === confirmPassword)}>
                    <span>{password === confirmPassword ? "✓" : "✗"}</span>
                    {password === confirmPassword ? "Passwords match" : "Passwords don't match"}
                  </p>
                )}
              </div>

              <button
                type="submit"
                style={s.btn(submitting || !password || !confirmPassword)}
                disabled={submitting || !password || !confirmPassword}
              >
                {submitting ? (
                  <><div style={s.btnSpinner} /> Saving…</>
                ) : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Save password &amp; continue
                  </>
                )}
              </button>
            </form>
          )}

          {/* Success */}
          {done && (
            <div style={s.successWrap}>
              <div style={s.successRing}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#1e1b18", letterSpacing: "-.02em" }}>
                Password set!
              </h2>
              <p style={{ fontSize: 13, color: "#8b8880", fontWeight: 300 }}>
                Redirecting you to your dashboard…
              </p>
            </div>
          )}

          <div style={s.footer}>Need help? Contact your administrator.</div>
        </div>
      </div>
    </>
  );
}