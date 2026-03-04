import { useState, useEffect, useRef } from "react";
import "./firstLoginPage.css";

// ─── Stub hooks / helpers (replace with your real imports) ───────────────────
const useSearchParams = (): [URLSearchParams] => [new URLSearchParams(window.location.search)];
const useNavigate = () => (path: string) => console.log("navigate →", path);

async function firstLoginVerify({ token }: { token: string }): Promise<void> {
  // await api.post('/auth/first-login/verify', { token })
}
async function firstLoginSetPassword({ token, new_password }: { token: string; new_password: string }): Promise<{ data: { access_token: string } }> {
  // return await api.post('/auth/first-login/set-password', { token, new_password })
  return { data: { access_token: "demo_token" } };
}
async function apiMe(): Promise<{ data: { role: string } }> {
  return { data: { role: "vendor" } };
}
function setAuthToken(t: string): void {
  localStorage.setItem("token", t);
}
const authState: { user: { role: string } | null } = { user: null };
// ────────────────────────────────────────────────────────────────────────────

const ADMIN_ROLES = [
  "vendor","group_admin","group_exe","group_hr","group_finance",
  "group_operation","group_production","group_marketing","group_legal",
  "sub_admin","sub_md","sub_hr","sub_finance","sub_operations",
];

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
    { label: "Uppercase", ok: /[A-Z]/.test(password) },
    { label: "Number", ok: /[0-9]/.test(password) },
    { label: "Symbol", ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const bar = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-emerald-400"][score - 1] || "bg-slate-200";
  const label = ["", "Weak", "Fair", "Good", "Strong"][score];
  if (!password) return null;
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1 h-1">
        {[1,2,3,4].map((i) => (
          <div key={i} className={`flex-1 rounded-full transition-all duration-300 ${i <= score ? bar : "bg-slate-200"}`} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {checks.map((c) => (
            <span key={c.label} className={`text-[10px] flex items-center gap-0.5 transition-colors ${c.ok ? "text-emerald-600" : "text-slate-400"}`}>
              <span>{c.ok ? "✓" : "○"}</span> {c.label}
            </span>
          ))}
        </div>
        {label && <span className={`text-[10px] font-semibold ${bar.replace("bg-","text-")}`}>{label}</span>}
      </div>
    </div>
  );
}

export default function FirstLoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [mounted, setMounted] = useState(false);

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
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setSubmitting(true);
    setError(null);
    try {
      const { data } = await firstLoginSetPassword({ token, new_password: password });
      setAuthToken(data.access_token);
      const meResp = await apiMe();
      authState.user = meResp.data;
      setDone(true);
      setTimeout(() => {
        const role = authState.user?.role || "";
        navigate(ADMIN_ROLES.includes(role) ? "/admin/companies" : "/chat");
      }, 1800);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setError(e?.response?.data?.detail || "Could not set password. Please try again or contact support.");
      setSubmitting(false);
    }
  };

  return (
    <>
    
      <div className="flp-root">
        <div className="flp-dots" />

        <div className={`flp-card ${mounted ? "visible" : ""}`}>
          {/* Brand mark */}
          <div className="flp-brand">
            <div className="flp-brand-mark">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <span className="flp-brand-name">Secure Access</span>
          </div>

          <h1 className="flp-heading">Set your password</h1>
          <p className="flp-sub">You're one step away. Choose a strong password to activate your account.</p>

          {/* Error */}
          {error && (
            <div className="flp-error">
              <svg className="flp-error-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flp-loading">
              <div className="flp-spinner" />
              Verifying your link…
            </div>
          )}

          {/* Form */}
          {!loading && !done && (
            <form onSubmit={handleSubmit}>
              <div className="flp-field">
                <label className="flp-label">New password</label>
                <div className="flp-input-wrap">
                  <input
                    ref={pwRef}
                    type={showPw ? "text" : "password"}
                    className="flp-input"
                    placeholder="············"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(null); }}
                    required
                    disabled={submitting}
                    autoComplete="new-password"
                  />
                  <button type="button" className="flp-eye" onClick={() => setShowPw(v => !v)} tabIndex={-1}>
                    <EyeIcon open={showPw} />
                  </button>
                </div>
                <PasswordStrength password={password} />
              </div>

              <div className="flp-field">
                <label className="flp-label">Confirm password</label>
                <div className="flp-input-wrap">
                  <input
                    type={showConfirm ? "text" : "password"}
                    className={`flp-input ${confirmPassword && password === confirmPassword ? "match" : confirmPassword && password !== confirmPassword ? "mismatch" : ""}`}
                    placeholder="············"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
                    required
                    disabled={submitting}
                    autoComplete="new-password"
                  />
                  <button type="button" className="flp-eye" onClick={() => setShowConfirm(v => !v)} tabIndex={-1}>
                    <EyeIcon open={showConfirm} />
                  </button>
                </div>
                {confirmPassword && (
                  <p className={`flp-match-hint ${password === confirmPassword ? "ok" : "bad"}`}>
                    <span>{password === confirmPassword ? "✓" : "✗"}</span>
                    {password === confirmPassword ? "Passwords match" : "Passwords don't match"}
                  </p>
                )}
              </div>

              <button type="submit" className="flp-btn" disabled={submitting || !password || !confirmPassword}>
                {submitting ? (
                  <><div className="flp-btn-spinner" /> Saving…</>
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
            <div className="flp-success">
              <div className="flp-success-ring">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h2>Password set!</h2>
              <p>Redirecting you to your dashboard…</p>
            </div>
          )}

          <div className="flp-footer">
            Need help? Contact your administrator.
          </div>
        </div>
      </div>
    </>
  );
}