"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { setCookie } from "@/components/cookieHelper";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const res = await fetch("http://127.0.0.1:8000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.data));
        const roles = data.data?.roles || [];
        const primaryRole = roles[0]?.name || "Customer";
        setCookie("token", data.access_token, 7);
        setCookie("user_role", primaryRole, 7);
        router.push("/menu");
      } else {
        setErrors(data.errors || { general: "Registration failed." });
      }
    } catch (err) {
      setErrors({ general: "Failed to connect to server." });
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
              Join the <br />
              <span className="text-brand-yellow">Liling Family.</span>
            </h2>
            <p className="text-white/60 font-medium leading-relaxed">
              Start your journey with Mindanao's finest pastil. Freshly made, authentically served, and now just a click away.
            </p>
          </div>
          
          <div className="flex gap-4 pt-4">
             <div className="bg-white/5 border border-white/10 backdrop-blur-md px-5 py-3 rounded-2xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-yellow mb-1">Authentic</p>
                <p className="text-xs text-white/80 font-bold">Mindanao Heritage</p>
             </div>
             <div className="bg-white/5 border border-white/10 backdrop-blur-md px-5 py-3 rounded-2xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-green mb-1">Premium</p>
                <p className="text-xs text-white/80 font-bold">Halal Ingredients</p>
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
             <h1 className="text-4xl font-black tracking-tighter text-brand-earth">Create Account</h1>
             <p className="text-xs font-bold uppercase tracking-widest text-brand-earth/40">Register for a premium experience</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-earth/60">Full Name</label>
              <input 
                required
                className={`w-full bg-white border ${errors.name ? 'border-red-500' : 'border-gray-100'} rounded-2xl px-5 py-4 text-sm font-bold text-brand-earth focus:border-brand-green outline-none transition-all shadow-sm`}
                placeholder="John Smith"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              {errors.name && <p className="text-[10px] text-red-500 font-bold">{errors.name[0]}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-earth/60">Email Address</label>
              <input 
                type="email" 
                required
                className={`w-full bg-white border ${errors.email ? 'border-red-500' : 'border-gray-100'} rounded-2xl px-5 py-4 text-sm font-bold text-brand-earth focus:border-brand-green outline-none transition-all shadow-sm`}
                placeholder="@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              {errors.email && <p className="text-[10px] text-red-500 font-bold">{errors.email[0]}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-earth/60">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    className={`w-full bg-white border ${errors.password ? 'border-red-500' : 'border-gray-100'} rounded-2xl pl-5 pr-12 py-4 text-sm font-bold text-brand-earth focus:border-brand-green outline-none transition-all shadow-sm`}
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
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-earth/60">Confirm</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    className="w-full bg-white border border-gray-100 rounded-2xl pl-5 pr-12 py-4 text-sm font-bold text-brand-earth focus:border-brand-green outline-none transition-all shadow-sm"
                    placeholder="••••••••"
                    value={formData.password_confirmation}
                    onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
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
              {errors.password && <p className="text-[10px] text-red-500 font-bold col-span-2">{errors.password[0]}</p>}
            </div>

            {errors.general && <p className="text-xs font-bold text-red-500 text-center">{errors.general}</p>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-brand-earth text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-green transition-all shadow-xl shadow-brand-earth/10 disabled:opacity-50 active:scale-95"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-earth/40">
              Already have an account? <Link href="/login" className="text-brand-green hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
