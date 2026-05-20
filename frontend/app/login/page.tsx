"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeSlash, Envelope } from "@phosphor-icons/react";
import { setCookie } from "@/components/cookieHelper";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Forgot Password States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.data));
        
        const roles = data.data.roles || [];
        const primaryRole = roles[0]?.name || "Customer";
        setCookie("token", data.access_token, 7);
        setCookie("user_role", primaryRole, 7);

        const isAdmin = roles.some((r: any) => r.name === "Admin");
        const isFranchisee = roles.some((r: any) => r.name === "Franchisee");

        if (isAdmin) {
          router.push("/admin");
        } else if (isFranchisee) {
          router.push("/franchise/dashboard");
        } else {
          router.push("/menu");
        }
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setError("Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError("");
    setForgotSuccess(false);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = res.status === 200 || res.status === 422 ? await res.json() : null;

      if (res.ok && data?.success) {
        setForgotSuccess(true);
      } else {
        const errorMsg = data?.message || "We could not find a user with that email address.";
        setForgotError(errorMsg);
      }
    } catch (err) {
      setForgotError("Failed to connect to server.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex relative">
      {/* Floating Close Button */}
      <Link 
        href="/" 
        className="absolute top-8 left-8 z-[100] w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl border border-gray-100 hover:scale-110 transition-transform text-xl lg:bg-brand-earth lg:text-white lg:border-brand-earth/20"
      >
        ✕
      </Link>

      {/* Visual Side (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-earth relative items-center justify-center p-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image src="/hero.png" alt="Background" fill className="object-cover grayscale brightness-50" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-brand-earth via-brand-earth/95 to-transparent"></div>
        
        <div className="relative z-10 space-y-8 max-w-md">
          <div className="w-24 h-24 bg-white rounded-[2rem] p-4 shadow-2xl">
            <Image src="/logo.jpg" alt="Logo" width={80} height={80} className="rounded-2xl" />
          </div>
          <div className="space-y-4">
            <h2 className="text-5xl font-black text-white tracking-tighter leading-none">
              Welcome back <br />
              <span className="text-brand-yellow">to Mindanao.</span>
            </h2>
            <p className="text-white/60 font-medium leading-relaxed">
              Login to access your orders, track your favorites, or manage your franchise applications.
            </p>
          </div>
          
          <div className="pt-8 grid grid-cols-2 gap-4">
             <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-2xl font-black text-white">100%</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-brand-green">Authentic Taste</p>
             </div>
             <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-2xl font-black text-white">Fast</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-brand-yellow">Order Processing</p>
             </div>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-20 lg:px-24 py-12 bg-[#fafafa]">
        <div className="max-w-md w-full mx-auto space-y-10">
          <div className="space-y-4">
             <Link href="/" className="lg:hidden inline-block mb-4">
                <Image src="/logo.jpg" alt="Logo" width={48} height={48} className="rounded-full" />
             </Link>
             <h1 className="text-4xl font-black tracking-tighter text-brand-earth">Sign In</h1>
             <p className="text-xs font-bold uppercase tracking-widest text-brand-earth/40">Access your account dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-earth/60">Email Address</label>
              <input 
                type="email" 
                required
                className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-brand-earth focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 outline-none transition-all shadow-sm"
                placeholder="@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-earth/60">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  className="w-full bg-white border border-gray-100 rounded-2xl pl-5 pr-12 py-4 text-sm font-bold focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 outline-none transition-all shadow-sm text-brand-earth"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-12 h-12 text-brand-earth/30 hover:text-brand-green transition-colors focus:outline-none cursor-pointer flex items-center justify-center"
                >
                  {showPassword ? <EyeSlash size={18} weight="bold" /> : <Eye size={18} weight="bold" />}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center px-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 accent-brand-green rounded border-gray-100 text-brand-green cursor-pointer"
                />
                <span className="text-[9px] font-black uppercase tracking-widest text-brand-earth/50">Remember Me</span>
              </label>
              <button 
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[9px] font-black uppercase tracking-widest text-brand-green hover:underline cursor-pointer focus:outline-none"
              >
                Forgot?
              </button>
            </div>

            {error && <p className="text-xs font-bold text-red-500 text-center">{error}</p>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-brand-earth text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-green transition-all shadow-xl shadow-brand-earth/10 disabled:opacity-50 active:scale-95"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-earth/40">
              Don't have an account? <Link href="/register" className="text-brand-green hover:underline">Register</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div 
          onClick={() => {
            if (!forgotLoading) {
              setShowForgotModal(false);
              setForgotSuccess(false);
              setForgotError("");
              setForgotEmail("");
            }
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-earth/40 backdrop-blur-sm animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-xl p-6 md:p-8 animate-slide-up space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight text-brand-earth">Reset Password</h2>
              <p className="text-xs text-brand-earth/60">
                {forgotSuccess 
                  ? "Check your inbox for password reset instructions."
                  : "Enter your registered email address below."
                }
              </p>
            </div>

            {forgotSuccess ? (
              <div className="space-y-6 text-center py-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-xs text-brand-earth/80 max-w-xs mx-auto">
                  We have sent reset instructions to <span className="font-semibold text-brand-earth">{forgotEmail}</span>.
                </p>
                <button
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotSuccess(false);
                    setForgotError("");
                    setForgotEmail("");
                  }}
                  className="w-full bg-brand-earth hover:bg-brand-green text-white py-3.5 rounded-xl text-[10px] font-semibold uppercase tracking-wider hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/50">Email Address</label>
                  <input 
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-brand-earth focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 outline-none transition-all shadow-sm"
                    placeholder="example@example.com"
                  />
                </div>

                {forgotError && (
                  <p className="text-[10px] font-semibold text-red-500">{forgotError}</p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    disabled={forgotLoading}
                    onClick={() => {
                      setShowForgotModal(false);
                      setForgotError("");
                      setForgotEmail("");
                    }}
                    className="flex-1 bg-gray-50 border border-gray-100 hover:bg-gray-100 text-brand-earth/70 py-3.5 rounded-xl text-[10px] font-semibold uppercase tracking-wider active:scale-[0.99] transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 bg-brand-earth hover:bg-brand-green text-white py-3.5 rounded-xl text-[10px] font-semibold uppercase tracking-wider hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-50"
                  >
                    {forgotLoading ? "Sending..." : "Send Reset Link"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
