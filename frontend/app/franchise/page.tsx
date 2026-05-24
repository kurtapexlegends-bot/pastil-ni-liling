"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useSWR from "swr";
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

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface SiteSettings {
  franchise_badge: string;
  franchise_title_white: string;
  franchise_title_green: string;
  franchise_subtitle: string;
  franchise_benefit1_title: string;
  franchise_benefit1_desc: string;
  franchise_benefit2_title: string;
  franchise_benefit2_desc: string;
  franchise_benefit3_title: string;
  franchise_benefit3_desc: string;
  franchise_benefit4_title: string;
  franchise_benefit4_desc: string;
  franchise_milestone_title: string;
  franchise_milestone_desc: string;
  franchise_footer_copyright: string;
}

export default function FranchisePage() {
  const { data: settingsRes } = useSWR("http://127.0.0.1:8000/api/website-settings", fetcher);

  const defaults: SiteSettings = {
    franchise_badge: 'Business Opportunity',
    franchise_title_white: 'Grow with',
    franchise_title_green: 'Pastil ni Liling.',
    franchise_subtitle: "Be part of the Philippines' fastest-growing pastil brand. Low investment, high returns, and a product Filipinos love.",
    franchise_benefit1_title: 'Low Capital',
    franchise_benefit1_desc: 'Start your business journey with minimal overhead and rapid startup times.',
    franchise_benefit2_title: 'Proven System',
    franchise_benefit2_desc: 'Complete operational training, kitchen blueprints, and staff management support.',
    franchise_benefit3_title: 'High Demand',
    franchise_benefit3_desc: 'Pastil is a beloved staple food favorite that sells consistently 24/7.',
    franchise_benefit4_title: 'Marketing Power',
    franchise_benefit4_desc: 'National brand awareness campaigns and localized digital marketing support.',
    franchise_milestone_title: '50+ Branches',
    franchise_milestone_desc: 'And growing rapidly nationwide.',
    franchise_footer_copyright: '&copy; 2026 Pastil ni Liling Franchise Program. Swak sa Bulsa, Sarap na Babalik-balikan.'
  };

  const settings: SiteSettings = settingsRes?.success ? settingsRes.data : defaults;

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

  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case 'first_name':
        if (!value.trim()) return 'First Name is required.';
        if (value.trim().length < 2) return 'First Name must be at least 2 characters.';
        if (!/^[a-zA-Z\sñÑ]+$/.test(value)) return 'First Name can only contain letters and spaces.';
        return null;
      case 'last_name':
        if (!value.trim()) return 'Last Name is required.';
        if (value.trim().length < 2) return 'Last Name must be at least 2 characters.';
        if (!/^[a-zA-Z\sñÑ]+$/.test(value)) return 'Last Name can only contain letters and spaces.';
        return null;
      case 'email':
        if (!value.trim()) return 'Email Address is required.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Enter a valid email address (e.g. name@domain.com).';
        }
        return null;
      case 'phone': {
        if (!value.trim()) return 'Phone Number is required.';
        const cleaned = value.replace(/[\s-]/g, '');
        if (!/^09\d{9}$/.test(cleaned) && !/^\+639\d{9}$/.test(cleaned)) {
          return 'Enter a valid 11-digit mobile number starting with 09 (e.g. 09171234567).';
        }
        return null;
      }
      case 'target_location':
        if (!value.trim()) return 'Target Location is required.';
        if (value.trim().length < 8) return 'Provide a descriptive location (at least 8 characters).';
        return null;
      case 'investment_capacity':
        if (!value) return 'Please select an investment capacity range.';
        return null;
      case 'experience_summary':
        if (value && value.length > 500) return 'Experience summary must not exceed 500 characters.';
        return null;
      default:
        return null;
    }
  };

  const validateStep = (currentStep: number): boolean => {
    let fieldsToValidate: string[] = [];
    if (currentStep === 1) {
      fieldsToValidate = ['first_name', 'last_name', 'email', 'phone'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['target_location', 'investment_capacity'];
    }

    const stepErrors: any = {};
    let isValid = true;
    fieldsToValidate.forEach(field => {
      const errorMsg = validateField(field, formData[field as keyof typeof formData]);
      if (errorMsg) {
        stepErrors[field] = [errorMsg];
        isValid = false;
      }
    });

    setErrors((prev: any) => ({ ...prev, ...stepErrors }));
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Real-Time Constraint Validation
    const errorMsg = validateField(name, value);
    setErrors((prev: any) => {
      const newErrors = { ...prev };
      if (errorMsg) {
        newErrors[name] = [errorMsg];
      } else {
        delete newErrors[name];
      }
      return newErrors;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Defensive final checks before dispatching payload to API
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      return;
    }

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

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => setStep(prev => prev - 1);

  const getInputClassName = (fieldName: keyof typeof formData) => {
    const hasError = !!errors[fieldName];
    const base = "w-full bg-gray-50/50 border rounded-xl px-4 py-3 text-xs font-semibold focus:bg-white outline-none transition-all text-brand-earth";
    const errorStyle = "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200/50";
    const normalStyle = "border-gray-100 focus:border-brand-green focus:ring-2 focus:ring-brand-green/30";
    return `${base} ${hasError ? errorStyle : normalStyle}`;
  };

  return (
    <div className="min-h-screen bg-background font-sans text-brand-earth selection:bg-brand-yellow/30 flex flex-col justify-between">
      <Navbar variant="franchise" />

      <main className="pt-28 pb-20 px-6 max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-start w-full">
        {/* Info Side */}
        <div className="space-y-8 lg:sticky lg:top-28">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 text-[9px] font-bold uppercase tracking-wider text-brand-yellow">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow animate-pulse"></span>
              {settings.franchise_badge}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-brand-earth leading-[1.1] font-display">
              {settings.franchise_title_white} <br />
              <span className="text-brand-green">{settings.franchise_title_green}</span>
            </h1>
            <p className="text-sm text-brand-earth/60 font-medium leading-relaxed max-w-md">
              {settings.franchise_subtitle}
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid sm:grid-cols-2 gap-8">
            {[
              { 
                title: settings.franchise_benefit1_title, 
                desc: settings.franchise_benefit1_desc, 
                icon: Coins 
              },
              { 
                title: settings.franchise_benefit2_title, 
                desc: settings.franchise_benefit2_desc, 
                icon: Briefcase 
              },
              { 
                title: settings.franchise_benefit3_title, 
                desc: settings.franchise_benefit3_desc, 
                icon: ShieldCheck 
              },
              { 
                title: settings.franchise_benefit4_title, 
                desc: settings.franchise_benefit4_desc, 
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
             <p className="text-3xl font-extrabold tracking-tight mb-1 font-display">{settings.franchise_milestone_title}</p>
             <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">{settings.franchise_milestone_desc}</p>
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
                      <input name="first_name" value={formData.first_name} onChange={handleInputChange} className={getInputClassName('first_name')} placeholder="John" required />
                      {errors.first_name && <p className="text-[9px] text-red-500 font-semibold">{errors.first_name[0]}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-brand-earth/60">Last Name</label>
                      <input name="last_name" value={formData.last_name} onChange={handleInputChange} className={getInputClassName('last_name')} placeholder="Smith" required />
                      {errors.last_name && <p className="text-[9px] text-red-500 font-semibold">{errors.last_name[0]}</p>}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-brand-earth/60">Email Address</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={getInputClassName('email')} placeholder="@example.com" required />
                    {errors.email && <p className="text-[9px] text-red-500 font-semibold">{errors.email[0]}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-brand-earth/60">Phone Number</label>
                    <input name="phone" value={formData.phone} onChange={handleInputChange} className={getInputClassName('phone')} placeholder="0912 345 6789" required />
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
                    <input name="target_location" value={formData.target_location} onChange={handleInputChange} className={getInputClassName('target_location')} placeholder="e.g. Davao City, Poblacion" required />
                    {errors.target_location && <p className="text-[9px] text-red-500 font-semibold">{errors.target_location[0]}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-brand-earth/60">Investment Capacity</label>
                    <select name="investment_capacity" value={formData.investment_capacity} onChange={handleInputChange} className={getInputClassName('investment_capacity')} required>
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
                    <textarea name="experience_summary" value={formData.experience_summary} onChange={handleInputChange} className={`${getInputClassName('experience_summary')} h-28 resize-none placeholder:font-normal`} placeholder="Briefly explain any prior business or food stall experiences..."></textarea>
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
        <p 
          className="text-[9px] font-bold uppercase tracking-widest text-brand-earth/30"
          dangerouslySetInnerHTML={{ __html: settings.franchise_footer_copyright || '&copy; 2026 Pastil ni Liling Franchise Program. Swak sa Bulsa...' }}
        />
      </footer>
    </div>
  );
}
