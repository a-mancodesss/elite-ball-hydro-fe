import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-brand-500 grid place-items-center text-white font-bold">
              PS4
            </div>
            <div>
              <div className="font-semibold text-slate-900 leading-tight">
                Hydropower Compliance
              </div>
              <div className="text-xs text-slate-500 leading-tight">
                Nepal · DOED
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {user?.role === "REGULATOR" && (
              <NavLink
                to="/regulator"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-sm font-medium ${
                    isActive
                      ? "bg-brand-50 text-brand-700"
                      : "text-slate-600 hover:bg-slate-100"
                  }`
                }
              >
                Regulator Dashboard
              </NavLink>
            )}
            {user?.role === "HYDRO_ADMIN" && (
              <NavLink
                to="/hydro"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-sm font-medium ${
                    isActive
                      ? "bg-brand-50 text-brand-700"
                      : "text-slate-600 hover:bg-slate-100"
                  }`
                }
              >
                My Project
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-slate-900">
                {user?.full_name || user?.email}
              </div>
              <div className="text-xs text-slate-500">
                {user?.role === "REGULATOR" ? "Regulator" : "Hydro Admin"}
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="btn-secondary text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 text-xs text-slate-500 flex justify-between">
          <div>IFC PS4 Compliance Platform · v0.1</div>
          <div>DOED · ICIMOD · HydroSHEDS data</div>
        </div>
      </footer>
    </div>
  );
}
