"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeSlash } from "@phosphor-icons/react";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
              <Link href="#" className="text-[9px] font-black uppercase tracking-widest text-brand-green hover:underline">
                Forgot?
              </Link>
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
    </div>
  );
}
