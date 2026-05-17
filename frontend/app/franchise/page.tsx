"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function FranchisePage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    target_location: "",
    investment_capacity: "",
    experience_summary: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev: any) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await fetch("http://127.0.0.1:8000/api/franchise/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
      } else {
        setErrors(data.errors || { general: "Something went wrong." });
      }
    } catch (err) {
      setErrors({ general: "Failed to connect to server." });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  return (
    <div className="min-h-screen bg-white font-sans text-brand-earth">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full bg-white/70 backdrop-blur-xl border-b border-gray-100">
        <div className="flex items-center justify-between px-6 h-20 max-w-6xl mx-auto">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.jpg" alt="Logo" width={40} height={40} className="rounded-full shadow-sm" />
            <span className="text-sm font-black uppercase tracking-tighter">Franchise Portal</span>
          </Link>
          <Link href="/" className="text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-all">
            Back to Home
          </Link>
        </div>
      </nav>

      <main className="pt-32 pb-24 px-6 max-w-6xl mx-auto grid lg:grid-cols-2 gap-20 items-start">
        {/* Info Side */}
        <div className="space-y-12">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-yellow/30 border border-brand-yellow text-[9px] font-bold uppercase tracking-widest text-brand-earth">
              Business Opportunity
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none">
              Grow with <br />
              <span className="text-brand-green">Pastil ni Liling.</span>
            </h1>
            <p className="text-lg text-brand-earth/60 font-medium leading-relaxed max-w-md">
              Be part of the Philippines' fastest-growing pastil brand. Low investment, high returns, and a product Filipinos love.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-8">
            {[
              { title: "Low Capital", desc: "Start your business journey with minimal overhead." },
              { title: "Proven System", desc: "Complete training and operations support provided." },
              { title: "High Demand", desc: "Pastil is a staple favorite that sells 24/7." },
              { title: "Marketing", desc: "Global brand awareness and digital marketing support." },
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <h3 className="text-sm font-black uppercase tracking-widest text-brand-green">{item.title}</h3>
                <p className="text-xs text-brand-earth/50 font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="p-8 bg-brand-earth rounded-[2.5rem] text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/20 blur-3xl rounded-full"></div>
             <p className="text-3xl font-black tracking-tighter mb-2">50+ Branches</p>
             <p className="text-xs font-bold uppercase tracking-widest opacity-60">And growing nationwide.</p>
          </div>
        </div>

        {/* Form Side */}
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl shadow-brand-earth/5 p-8 md:p-12">
          {submitted ? (
            <div className="py-20 text-center space-y-6 animate-in fade-in zoom-in">
              <div className="text-6xl">🎉</div>
              <h2 className="text-3xl font-black tracking-tighter">Application Received!</h2>
              <p className="text-brand-earth/60 font-medium max-w-xs mx-auto">
                Thank you for your interest. Our team will review your application and reach out within 3-5 business days.
              </p>
              <Link href="/" className="inline-block bg-brand-earth text-white px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest">
                Return Home
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Progress Bar */}
              <div className="flex gap-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i ? "bg-brand-green" : "bg-gray-100"}`}></div>
                ))}
              </div>

              {step === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right duration-500">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black tracking-tighter">Personal Details</h2>
                    <p className="text-xs font-medium text-brand-earth/40 uppercase tracking-widest">Step 1 of 3</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-brand-earth/60">First Name</label>
                      <input name="first_name" value={formData.first_name} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:border-brand-green outline-none transition-all" placeholder="Juan" required />
                      {errors.first_name && <p className="text-[10px] text-red-500 font-bold">{errors.first_name[0]}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-brand-earth/60">Last Name</label>
                      <input name="last_name" value={formData.last_name} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:border-brand-green outline-none transition-all" placeholder="Dela Cruz" required />
                      {errors.last_name && <p className="text-[10px] text-red-500 font-bold">{errors.last_name[0]}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-earth/60">Email Address</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:border-brand-green outline-none transition-all" placeholder="juan@example.com" required />
                    {errors.email && <p className="text-[10px] text-red-500 font-bold">{errors.email[0]}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-earth/60">Phone Number</label>
                    <input name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:border-brand-green outline-none transition-all" placeholder="0917 XXX XXXX" required />
                    {errors.phone && <p className="text-[10px] text-red-500 font-bold">{errors.phone[0]}</p>}
                  </div>
                  <button type="button" onClick={nextStep} className="w-full bg-brand-earth text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-green transition-all shadow-xl shadow-brand-earth/10">
                    Next Step
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right duration-500">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black tracking-tighter">Business Info</h2>
                    <p className="text-xs font-medium text-brand-earth/40 uppercase tracking-widest">Step 2 of 3</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-earth/60">Target Location</label>
                    <input name="target_location" value={formData.target_location} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:border-brand-green outline-none transition-all" placeholder="e.g. Davao City, Poblacion" required />
                    {errors.target_location && <p className="text-[10px] text-red-500 font-bold">{errors.target_location[0]}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-earth/60">Investment Capacity</label>
                    <select name="investment_capacity" value={formData.investment_capacity} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:border-brand-green outline-none transition-all" required>
                      <option value="">Select Range</option>
                      <option value="50k-100k">₱50,000 - ₱100,000</option>
                      <option value="100k-200k">₱100,000 - ₱200,000</option>
                      <option value="200k-500k">₱200,000 - ₱500,000</option>
                      <option value="500k+">₱500,000+</option>
                    </select>
                    {errors.investment_capacity && <p className="text-[10px] text-red-500 font-bold">{errors.investment_capacity[0]}</p>}
                  </div>
                  <div className="flex gap-4">
                    <button type="button" onClick={prevStep} className="flex-1 bg-gray-100 text-brand-earth py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all">
                      Back
                    </button>
                    <button type="button" onClick={nextStep} className="flex-[2] bg-brand-earth text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-green transition-all shadow-xl shadow-brand-earth/10">
                      Final Step
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 animate-in slide-in-from-right duration-500">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black tracking-tighter">Review & Submit</h2>
                    <p className="text-xs font-medium text-brand-earth/40 uppercase tracking-widest">Step 3 of 3</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-earth/60">Business Experience (Optional)</label>
                    <textarea name="experience_summary" value={formData.experience_summary} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:border-brand-green outline-none transition-all h-32 resize-none" placeholder="Tell us about your previous ventures..."></textarea>
                  </div>
                  <div className="p-5 rounded-2xl bg-brand-green/5 border border-brand-green/10 space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-brand-green">Confirmation</p>
                    <p className="text-xs font-medium leading-relaxed">By submitting, you agree to our privacy policy and allow us to contact you regarding franchise opportunities.</p>
                  </div>
                  <div className="flex gap-4">
                    <button type="button" onClick={prevStep} className="flex-1 bg-gray-100 text-brand-earth py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all">
                      Back
                    </button>
                    <button type="submit" disabled={loading} className="flex-[2] bg-brand-green text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-brand-green/20 disabled:opacity-50">
                      {loading ? "Submitting..." : "Submit Application"}
                    </button>
                  </div>
                  {errors.general && <p className="text-[10px] text-red-500 font-bold text-center">{errors.general}</p>}
                </div>
              )}
            </form>
          )}
        </div>
      </main>

      <footer className="py-12 border-t border-gray-100 text-center">
        <p className="text-[9px] font-bold uppercase tracking-widest opacity-30">
          &copy; 2026 Pastil ni Liling Franchise Program.
        </p>
      </footer>
    </div>
  );
}
