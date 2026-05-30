import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DEMO_LOGINS = [
  {
    label: "Regulator (DOED)",
    email: "regulator@doed.gov.np",
    password: "regulator123",
  },
  {
    label: "Hydro Admin — Upper Trishuli-1",
    email: "admin.upper@hydro.np",
    password: "hydro123",
  },
  {
    label: "Hydro Admin — Khimti",
    email: "admin.khimti@hydro.np",
    password: "hydro123",
  },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const user = await login(email, password);
      navigate(user.role === "REGULATOR" ? "/regulator" : "/hydro");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-brand-500 to-brand-900 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-white/20 grid place-items-center font-bold">
            PS4
          </div>
          <div className="font-semibold">Hydropower Compliance Platform</div>
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            One dashboard for Nepal's hydropower PS4 compliance.
          </h1>
          <p className="text-brand-100/90 max-w-md">
            E-flow monitoring, GLOF risk, and emergency plan gaps — unified for
            DOED regulators and hydro company admins. IFC- and ADB-ready.
          </p>
        </div>
        <div className="text-sm text-brand-100/70">
          175 hydropower projects · ICIMOD glacial lake data · WorldPop downstream
          population
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-slate-900">Sign in</h2>
          <p className="text-slate-500 mt-1 mb-6">
            Use your DOED or hydro company credentials.
          </p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@doed.gov.np"
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </div>
            )}
            <button type="submit" className="btn-primary w-full" disabled={busy}>
              {busy ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-8">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Demo logins
            </div>
            <div className="space-y-2">
              {DEMO_LOGINS.map((d) => (
                <button
                  key={d.email}
                  type="button"
                  onClick={() => {
                    setEmail(d.email);
                    setPassword(d.password);
                  }}
                  className="w-full text-left card px-3 py-2 hover:bg-slate-50 text-sm flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium text-slate-800">{d.label}</div>
                    <div className="text-xs text-slate-500">{d.email}</div>
                  </div>
                  <span className="text-xs text-brand-600 font-medium">Use</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
