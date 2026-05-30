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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-transparent">
      {/* Decorative animated blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-400/20 rounded-full mix-blend-multiply filter blur-[80px] animate-blob z-0"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-sky-400/20 rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-2000 z-0"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-4000 z-0"></div>

      <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-2 gap-12 items-center p-6 md:p-12">
        
        {/* Left Side: Branding / Hero */}
        <div className="text-center lg:text-left space-y-8">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/40 border border-white/60 backdrop-blur-md shadow-sm mx-auto lg:mx-0">
             <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-sm shadow-inner">
               PS4
             </div>
             <span className="font-semibold text-slate-800 tracking-tight text-sm">Hydropower Compliance Platform</span>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
              Compliance, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-sky-500">simplified.</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Monitor E-flow, assess GLOF risks, and track emergency plans for Nepal's hydropower projects in one unified dashboard.
            </p>
          </div>
          
          <div className="flex items-center justify-center lg:justify-start gap-6 text-sm font-medium text-slate-500">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-slate-800">175+</span>
              <span>Projects</span>
            </div>
            <div className="w-px h-10 bg-slate-200"></div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-slate-800">DOED</span>
              <span>Regulators</span>
            </div>
            <div className="w-px h-10 bg-slate-200"></div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-slate-800">IFC PS4</span>
              <span>Standard</span>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full max-w-md mx-auto lg:ml-auto">
          <div className="card p-8 sm:p-10 relative overflow-hidden">
            {/* Subtle inner reflection */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none rounded-3xl"></div>
            
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome back</h2>
              <p className="text-slate-500 text-sm mb-8">
                Sign in to your DOED or hydro company account.
              </p>

              <form onSubmit={submit} className="space-y-5">
                <div>
                  <label className="label">Email address</label>
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
                    placeholder="••••••••"
                    required
                  />
                </div>
                {error && (
                  <div className="text-sm text-red-600 bg-red-50/80 border border-red-200 rounded-xl px-4 py-3 backdrop-blur-sm">
                    {error}
                  </div>
                )}
                <button type="submit" className="btn-primary w-full py-3 mt-2" disabled={busy}>
                  {busy ? "Signing in..." : "Sign in"}
                </button>
              </form>

              <div className="mt-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px bg-slate-200 flex-1"></div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Demo Access</div>
                  <div className="h-px bg-slate-200 flex-1"></div>
                </div>
                
                <div className="space-y-3">
                  {DEMO_LOGINS.map((d) => (
                    <button
                      key={d.email}
                      type="button"
                      onClick={() => {
                        setEmail(d.email);
                        setPassword(d.password);
                      }}
                      className="w-full text-left bg-white/40 border border-white/60 hover:bg-white/70 hover:border-brand-300 rounded-xl px-4 py-3 text-sm flex justify-between items-center transition-all duration-300 group shadow-sm"
                    >
                      <div>
                        <div className="font-semibold text-slate-800">{d.label}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{d.email}</div>
                      </div>
                      <span className="text-xs font-semibold text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity bg-brand-50 px-2 py-1 rounded-md">Use</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
