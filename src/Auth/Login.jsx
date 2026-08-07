import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { AUTH_ENDPOINTS } from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  Store,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { fetchUser } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Initialize Sanctum CSRF cookie
      await api.get(AUTH_ENDPOINTS.csrf);

      // 2. Perform authentication request
      await api.post(AUTH_ENDPOINTS.login, { email, password });

      // 3. Fetch authenticated user details
      const user = await fetchUser();

      if (!user) {
        setError("Unable to retrieve authenticated user details.");
        return;
      }

      // 4. Role-based Routing
      const role = user.roles?.[0]?.name?.toLowerCase();

      switch (role) {
        case "admin":
          navigate("/admin");
          break;
        case "cashier":
          navigate("/cashier");
          break;
        case "manager":
          navigate("/manager");
          break;
        case "chef":
          navigate("/chef");
          break;
        case "waiter":
          navigate("/waiter");
          break;
        case "employee":
          navigate("/employee");
          break;
        case "customer":
          navigate("/customer");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Invalid credentials. Please check your details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F8FAFC]">
      {/* Visual Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#002B7F] text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute -top-16 -left-16 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
            <Store className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">ApexPOS</span>
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
          <h1 className="text-4xl font-extrabold leading-tight">
            Streamlined Management for Your Business Ops.
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Access inventory, process live transactions, manage staff privileges, and inspect analytics from a single unified workspace.
          </p>

          <div className="pt-4 flex items-center gap-6 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Encrypted Access</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-time Syncing</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-400">
          © {new Date().getFullYear()} Point of Sale Enterprise System. All rights reserved.
        </div>
      </div>

      {/* Form Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2 text-center sm:text-left">
            <div className="lg:hidden inline-flex p-3 bg-blue-50 rounded-xl text-[#002B7F] mb-4">
              <Store className="w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Sign in to system
            </h2>
            <p className="text-sm text-slate-500">
              Enter your credentials to access your terminal session
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002B7F] text-slate-800"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002B7F] text-slate-800"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#002B7F] hover:bg-blue-900 text-white font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Sign In to Terminal</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}