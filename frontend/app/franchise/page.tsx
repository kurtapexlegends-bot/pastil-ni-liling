"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { 
  Coins, 
  Briefcase, 
  ShieldCheck, 
  Megaphone, 
  CheckCircle, 
  CaretRight, 
  CaretLeft,
  ArrowLeft
} from "@phosphor-icons/react";

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
    <div className="min-h-screen bg-background font-sans text-brand-earth selection:bg-brand-yellow/30 flex flex-col justify-between">
      <Navbar variant="franchise" />

      <main className="pt-28 pb-20 px-6 max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-start w-full">
        {/* Info Side */}
        <div className="space-y-8 lg:sticky lg:top-28">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 text-[9px] font-bold uppercase tracking-wider text-brand-yellow">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow animate-pulse"></span>
              Business Opportunity
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-brand-earth leading-[1.1] font-display">
              Grow with <br />
              <span className="text-brand-green">Pastil ni Liling.</span>
            </h1>
            <p className="text-sm text-brand-earth/60 font-medium leading-relaxed max-w-md">
              Be part of the Philippines' fastest-growing pastil brand. Low investment, high returns, and a product Filipinos love.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid sm:grid-cols-2 gap-8">
            {[
              { 
                title: "Low Capital", 
                desc: "Start your business journey with minimal overhead and rapid startup times.", 
                icon: Coins 
              },
              { 
                title: "Proven System", 
                desc: "Complete operational training, kitchen blueprints, and staff management support.", 
                icon: Briefcase 
              },
              { 
                title: "High Demand", 
                desc: "Pastil is a beloved staple food favorite that sells consistently 24/7.", 
                icon: ShieldCheck 
              },
              { 
                title: "Marketing Power", 
                desc: "National brand awareness campaigns and localized digital marketing support.", 
                icon: Megaphone 
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-brand-green/10 flex items-center justify-center shrink-0 border border-brand-green/20">
                    <Icon size={16} className="text-brand-green" weight="duotone" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-brand-earth">{item.title}</h3>
                    <p className="text-[11px] text-brand-earth/50 leading-relaxed font-normal">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Branch Milestones Card */}
          <div className="p-6 bg-brand-earth rounded-3xl text-white relative overflow-hidden shadow-sm premium-shadow">
             <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/20 blur-3xl rounded-full"></div>
             <p className="text-3xl font-extrabold tracking-tight mb-1 font-display">50+ Branches</p>
             <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">And growing rapidly nationwide.</p>
          </div>
        </div>

        {/* Form Side */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 w-full premium-shadow">
          {submitted ? (
            <div className="py-16 text-center space-y-5 animate-in fade-in zoom-in-95 duration-500">
              <CheckCircle size={48} className="text-brand-green mx-auto" weight="duotone" />
              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold tracking-tight text-brand-earth font-display">Application Received!</h2>
                <p className="text-xs text-brand-earth/50 font-medium max-w-xs mx-auto leading-relaxed">
                  Thank you for your interest. Our franchise expansion team will review your credentials and contact you within 3-5 business days.
                </p>
              </div>
              <div className="pt-2">
                <Link href="/" className="inline-flex items-center gap-2 bg-brand-green hover:bg-brand-green/90 text-white px-6 py-3.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all shadow-md shadow-brand-green/10">
                  <ArrowLeft size={12} weight="bold" />
                  Return Home
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Progress Steps Indicators */}
              <div className="flex items-center justify-between pb-2">
                <span className="text-[9px] font-bold uppercase tracking-widest text-brand-green">
                  Step {step} of 3
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-brand-earth/40">
                  {step === 1 ? "Personal Info" : step === 2 ? "Location & Capital" : "Final Review"}
                </span>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i ? "bg-brand-green" : "bg-gray-100"}`}></div>
                ))}
              </div>

              {step === 1 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold tracking-tight text-brand-earth font-display">Personal Details</h2>
                    <p className="text-[11px] text-brand-earth/40 font-medium">Please provide your primary contact information.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-brand-earth/60">First Name</label>
                      <input name="first_name" value={formData.first_name} onChange={handleInputChange} className="w-full bg-gray-50/50 border border-gray-100 focus:border-brand-green focus:ring-1 focus:ring-brand-green rounded-xl px-4 py-3 text-xs font-semibold focus:bg-white outline-none transition-all text-brand-earth" placeholder="John" required />
                      {errors.first_name && <p className="text-[9px] text-red-500 font-semibold">{errors.first_name[0]}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-brand-earth/60">Last Name</label>
                      <input name="last_name" value={formData.last_name} onChange={handleInputChange} className="w-full bg-gray-50/50 border border-gray-100 focus:border-brand-green focus:ring-1 focus:ring-brand-green rounded-xl px-4 py-3 text-xs font-semibold focus:bg-white outline-none transition-all text-brand-earth" placeholder="Smith" required />
                      {errors.last_name && <p className="text-[9px] text-red-500 font-semibold">{errors.last_name[0]}</p>}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-brand-earth/60">Email Address</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-gray-50/50 border border-gray-100 focus:border-brand-green focus:ring-1 focus:ring-brand-green rounded-xl px-4 py-3 text-xs font-semibold focus:bg-white outline-none transition-all text-brand-earth" placeholder="john.smith@example.com" required />
                    {errors.email && <p className="text-[9px] text-red-500 font-semibold">{errors.email[0]}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-brand-earth/60">Phone Number</label>
                    <input name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-gray-50/50 border border-gray-100 focus:border-brand-green focus:ring-1 focus:ring-brand-green rounded-xl px-4 py-3 text-xs font-semibold focus:bg-white outline-none transition-all text-brand-earth" placeholder="0917 123 4567" required />
                    {errors.phone && <p className="text-[9px] text-red-500 font-semibold">{errors.phone[0]}</p>}
                  </div>
                  <button type="button" onClick={nextStep} className="w-full bg-brand-earth hover:bg-brand-green text-white py-3.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md shadow-brand-earth/10 flex items-center justify-center gap-1.5">
                    Continue
                    <CaretRight size={14} weight="bold" />
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold tracking-tight text-brand-earth font-display">Business details</h2>
                    <p className="text-[11px] text-brand-earth/40 font-medium">Define your target branch region and setup capital capacity.</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-brand-earth/60">Target Location</label>
                    <input name="target_location" value={formData.target_location} onChange={handleInputChange} className="w-full bg-gray-50/50 border border-gray-100 focus:border-brand-green focus:ring-1 focus:ring-brand-green rounded-xl px-4 py-3 text-xs font-semibold focus:bg-white outline-none transition-all text-brand-earth" placeholder="e.g. Davao City, Poblacion" required />
                    {errors.target_location && <p className="text-[9px] text-red-500 font-semibold">{errors.target_location[0]}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-brand-earth/60">Investment Capacity</label>
                    <select name="investment_capacity" value={formData.investment_capacity} onChange={handleInputChange} className="w-full bg-gray-50/50 border border-gray-100 focus:border-brand-green focus:ring-1 focus:ring-brand-green rounded-xl px-4 py-3 text-xs font-semibold focus:bg-white outline-none transition-all text-brand-earth" required>
                      <option value="">Select Capacity Range</option>
                      <option value="50k-100k">₱50,000 - ₱100,000</option>
                      <option value="100k-200k">₱100,000 - ₱200,000</option>
                      <option value="200k-500k">₱200,000 - ₱500,000</option>
                      <option value="500k+">₱500,000+</option>
                    </select>
                    {errors.investment_capacity && <p className="text-[9px] text-red-500 font-semibold">{errors.investment_capacity[0]}</p>}
                  </div>
                  <div className="flex gap-4 pt-2">
                    <button type="button" onClick={prevStep} className="flex-1 bg-gray-100 hover:bg-gray-200 text-brand-earth py-3.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5">
                      <CaretLeft size={14} weight="bold" />
                      Back
                    </button>
                    <button type="button" onClick={nextStep} className="flex-[2] bg-brand-earth hover:bg-brand-green text-white py-3.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md shadow-brand-earth/10 flex items-center justify-center gap-1.5">
                      Next Step
                      <CaretRight size={14} weight="bold" />
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold tracking-tight text-brand-earth font-display">Review & Submit</h2>
                    <p className="text-[11px] text-brand-earth/40 font-medium">Verify your entries before sending your application.</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-brand-earth/60">Business Experience (Optional)</label>
                    <textarea name="experience_summary" value={formData.experience_summary} onChange={handleInputChange} className="w-full bg-gray-50/50 border border-gray-100 focus:border-brand-green focus:ring-1 focus:ring-brand-green rounded-xl px-4 py-3 text-xs font-semibold focus:bg-white outline-none transition-all h-28 resize-none text-brand-earth placeholder:font-normal" placeholder="Briefly explain any prior business or food stall experiences..."></textarea>
                  </div>
                  <div className="p-4 rounded-2xl bg-brand-green/5 border border-brand-green/10 space-y-1">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-brand-green">Compliance Acknowledgement</p>
                    <p className="text-[10px] text-brand-earth/60 font-medium leading-relaxed">
                      By submitting, you agree to our franchise terms and allow our personnel to conduct financial and background checks relative to your application.
                    </p>
                  </div>
                  <div className="flex gap-4 pt-2">
                    <button type="button" onClick={prevStep} className="flex-1 bg-gray-100 hover:bg-gray-200 text-brand-earth py-3.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5">
                      <CaretLeft size={14} weight="bold" />
                      Back
                    </button>
                    <button type="submit" disabled={loading} className="flex-[2] bg-brand-green text-white py-3.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:opacity-90 active:scale-[0.99] transition-all shadow-md shadow-brand-green/10 disabled:opacity-50">
                      {loading ? "Submitting application..." : "Submit Application"}
                    </button>
                  </div>
                  {errors.general && <p className="text-[9px] text-red-500 font-semibold text-center">{errors.general}</p>}
                </div>
              )}
            </form>
          )}
        </div>
      </main>

      <footer className="py-8 border-t border-gray-100 text-center w-full mt-auto">
        <p className="text-[9px] font-bold uppercase tracking-widest text-brand-earth/30">
          &copy; 2026 Pastil ni Liling Franchise Program. Swak sa Bulsa, Sarap na Babalik-balikan.
        </p>
      </footer>
    </div>
  );
}
