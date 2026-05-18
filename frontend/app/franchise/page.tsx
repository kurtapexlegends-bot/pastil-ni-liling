"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";

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
      <Navbar variant="franchise" />

      <main className="pt-28 pb-20 px-6 max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-start">
        {/* Info Side */}
        <div className="space-y-8 lg:sticky lg:top-24">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 text-[9px] font-semibold uppercase tracking-wider text-brand-earth/70">
              Business Opportunity
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-brand-earth leading-tight">
              Grow with <br />
              <span className="text-brand-green">Pastil ni Liling.</span>
            </h1>
            <p className="text-sm text-brand-earth/60 font-normal leading-relaxed max-w-md">
              Be part of the Philippines' fastest-growing pastil brand. Low investment, high returns, and a product Filipinos love.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { title: "Low Capital", desc: "Start your business journey with minimal overhead." },
              { title: "Proven System", desc: "Complete training and operations support provided." },
              { title: "High Demand", desc: "Pastil is a staple favorite that sells 24/7." },
              { title: "Marketing", desc: "Global brand awareness and digital marketing support." },
            ].map((item, i) => (
              <div key={i} className="space-y-1">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-green">{item.title}</h3>
                <p className="text-[11px] text-brand-earth/50 leading-relaxed font-normal">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="p-6 bg-brand-earth rounded-xl text-white relative overflow-hidden shadow-sm">
             <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/20 blur-3xl rounded-full"></div>
             <p className="text-2xl font-bold tracking-tight mb-0.5">50+ Branches</p>
             <p className="text-[9px] font-semibold uppercase tracking-wider opacity-60">And growing nationwide.</p>
          </div>
        </div>

        {/* Form Side */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 md:p-8">
          {submitted ? (
            <div className="py-16 text-center space-y-4 animate-in fade-in zoom-in">
              <div className="text-4xl">🎉</div>
              <h2 className="text-xl font-bold tracking-tight text-brand-earth">Application Received!</h2>
              <p className="text-xs text-brand-earth/60 font-normal max-w-xs mx-auto leading-relaxed">
                Thank you for your interest. Our team will review your application and reach out within 3-5 business days.
              </p>
              <Link href="/" className="inline-block bg-brand-earth text-white px-5 py-2.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider hover:bg-brand-green transition-colors">
                Return Home
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Progress Bar */}
              <div className="flex gap-1.5">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= i ? "bg-brand-green" : "bg-gray-100"}`}></div>
                ))}
              </div>

              {step === 1 && (
                <div className="space-y-5 animate-in slide-in-from-right duration-300">
                  <div className="space-y-0.5">
                    <h2 className="text-lg font-bold tracking-tight text-brand-earth">Personal Details</h2>
                    <p className="text-[9px] font-semibold text-brand-earth/40 uppercase tracking-wider">Step 1 of 3</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/60">First Name</label>
                      <input name="first_name" value={formData.first_name} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-2.5 text-xs font-medium focus:border-brand-green focus:bg-white outline-none transition-all text-brand-earth" placeholder="Juan" required />
                      {errors.first_name && <p className="text-[9px] text-red-500 font-semibold">{errors.first_name[0]}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/60">Last Name</label>
                      <input name="last_name" value={formData.last_name} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-2.5 text-xs font-medium focus:border-brand-green focus:bg-white outline-none transition-all text-brand-earth" placeholder="Dela Cruz" required />
                      {errors.last_name && <p className="text-[9px] text-red-500 font-semibold">{errors.last_name[0]}</p>}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/60">Email Address</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-2.5 text-xs font-medium focus:border-brand-green focus:bg-white outline-none transition-all text-brand-earth" placeholder="juan@example.com" required />
                    {errors.email && <p className="text-[9px] text-red-500 font-semibold">{errors.email[0]}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/60">Phone Number</label>
                    <input name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-2.5 text-xs font-medium focus:border-brand-green focus:bg-white outline-none transition-all text-brand-earth" placeholder="0917 XXX XXXX" required />
                    {errors.phone && <p className="text-[9px] text-red-500 font-semibold">{errors.phone[0]}</p>}
                  </div>
                  <button type="button" onClick={nextStep} className="w-full bg-brand-earth text-white py-3 rounded-lg text-[10px] font-semibold uppercase tracking-wider hover:bg-brand-green transition-all shadow-sm">
                    Next Step
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5 animate-in slide-in-from-right duration-300">
                  <div className="space-y-0.5">
                    <h2 className="text-lg font-bold tracking-tight text-brand-earth">Business Info</h2>
                    <p className="text-[9px] font-semibold text-brand-earth/40 uppercase tracking-wider">Step 2 of 3</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/60">Target Location</label>
                    <input name="target_location" value={formData.target_location} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-2.5 text-xs font-medium focus:border-brand-green focus:bg-white outline-none transition-all text-brand-earth" placeholder="e.g. Davao City, Poblacion" required />
                    {errors.target_location && <p className="text-[9px] text-red-500 font-semibold">{errors.target_location[0]}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/60">Investment Capacity</label>
                    <select name="investment_capacity" value={formData.investment_capacity} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-2.5 text-xs font-medium focus:border-brand-green focus:bg-white outline-none transition-all text-brand-earth" required>
                      <option value="">Select Range</option>
                      <option value="50k-100k">₱50,000 - ₱100,000</option>
                      <option value="100k-200k">₱100,000 - ₱200,000</option>
                      <option value="200k-500k">₱200,000 - ₱500,000</option>
                      <option value="500k+">₱500,000+</option>
                    </select>
                    {errors.investment_capacity && <p className="text-[9px] text-red-500 font-semibold">{errors.investment_capacity[0]}</p>}
                  </div>
                  <div className="flex gap-4">
                    <button type="button" onClick={prevStep} className="flex-1 bg-gray-100 text-brand-earth py-3 rounded-lg text-[10px] font-semibold uppercase tracking-wider hover:bg-gray-200 transition-all">
                      Back
                    </button>
                    <button type="button" onClick={nextStep} className="flex-[2] bg-brand-earth text-white py-3 rounded-lg text-[10px] font-semibold uppercase tracking-wider hover:bg-brand-green transition-all shadow-sm">
                      Final Step
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5 animate-in slide-in-from-right duration-300">
                  <div className="space-y-0.5">
                    <h2 className="text-lg font-bold tracking-tight text-brand-earth">Review & Submit</h2>
                    <p className="text-[9px] font-semibold text-brand-earth/40 uppercase tracking-wider">Step 3 of 3</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-semibold uppercase tracking-wider text-brand-earth/60">Business Experience (Optional)</label>
                    <textarea name="experience_summary" value={formData.experience_summary} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-2.5 text-xs font-medium focus:border-brand-green focus:bg-white outline-none transition-all h-28 resize-none text-brand-earth" placeholder="Tell us about your previous ventures..."></textarea>
                  </div>
                  <div className="p-4 rounded-xl bg-brand-green/5 border border-brand-green/10 space-y-1">
                    <p className="text-[8px] font-semibold uppercase tracking-wider text-brand-green">Confirmation</p>
                    <p className="text-[10px] text-brand-earth/60 font-normal leading-relaxed">By submitting, you agree to our privacy policy and allow us to contact you regarding franchise opportunities.</p>
                  </div>
                  <div className="flex gap-4">
                    <button type="button" onClick={prevStep} className="flex-1 bg-gray-100 text-brand-earth py-3 rounded-lg text-[10px] font-semibold uppercase tracking-wider hover:bg-gray-200 transition-all">
                      Back
                    </button>
                    <button type="submit" disabled={loading} className="flex-[2] bg-brand-green text-white py-3 rounded-lg text-[10px] font-semibold uppercase tracking-wider hover:opacity-90 transition-all shadow-sm disabled:opacity-50">
                      {loading ? "Submitting..." : "Submit Application"}
                    </button>
                  </div>
                  {errors.general && <p className="text-[9px] text-red-500 font-semibold text-center">{errors.general}</p>}
                </div>
              )}
            </form>
          )}
        </div>
      </main>

      <footer className="py-8 border-t border-gray-100 text-center">
        <p className="text-[8px] font-semibold uppercase tracking-wider text-brand-earth/30">
          &copy; 2026 Pastil ni Liling Franchise Program.
        </p>
      </footer>
    </div>
  );
}
