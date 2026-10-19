'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useValidation, constraints, ValidationSchema } from "@/hooks/useValidation";
import { 
  CheckCircle,
  CaretRight,
  CaretLeft,
  ArrowLeft
} from "@phosphor-icons/react";

const franchiseSchema: ValidationSchema<any> = {
  first_name: [
    constraints.required('First Name is required.'),
    constraints.minLength(2, 'First Name must be at least 2 characters.'),
    constraints.pattern(/^[a-zA-Z\sñÑ]+$/, 'First Name can only contain letters and spaces.')
  ],
  last_name: [
    constraints.required('Last Name is required.'),
    constraints.minLength(2, 'Last Name must be at least 2 characters.'),
    constraints.pattern(/^[a-zA-Z\sñÑ]+$/, 'Last Name can only contain letters and spaces.')
  ],
  email: [
    constraints.required('Email Address is required.'),
    constraints.email('Enter a valid email address (e.g. email@example.com).')
  ],
  phone: [
    constraints.required('Phone Number is required.'),
    constraints.phonePH('Enter a valid 11-digit mobile number starting with 09 (e.g. 09123456789).')
  ],
  target_location: [
    constraints.required('Target Location is required.'),
    constraints.minLength(8, 'Provide a descriptive location (at least 8 characters).')
  ],
  investment_capacity: [
    constraints.required('Please select an investment capacity range.')
  ],
  experience_summary: [
    constraints.maxLength(500, 'Experience summary must not exceed 500 characters.')
  ]
};

export interface FranchiseIntakeFormProps {
  onSuccess?: () => void;
}

export default function FranchiseIntakeForm({ onSuccess }: FranchiseIntakeFormProps) {
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

  const { errors, validateField, validateStep, setErrors } = useValidation(franchiseSchema);

  const isStepValid = (currentStep: number): boolean => {
    let fieldsToValidate: string[] = [];
    if (currentStep === 1) {
      fieldsToValidate = ['first_name', 'last_name', 'email', 'phone'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['target_location', 'investment_capacity'];
    } else if (currentStep === 3) {
      fieldsToValidate = ['experience_summary'];
    }
    return validateStep(fieldsToValidate, formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Real-Time Constraint Validation
    validateField(name, value, { ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Defensive final checks before dispatching payload to API
    if (!isStepValid(1) || !isStepValid(2) || !isStepValid(3)) {
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
        if (onSuccess) onSuccess();
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
    if (isStepValid(step)) {
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => setStep(prev => prev - 1);

  const getInputClassName = (fieldName: keyof typeof formData) => {
    const hasError = !!errors[fieldName];
    // Notice: sub-16px text-xs removed to honor globals.css 16px rule and prevent mobile iOS zoom
    const base = "w-full bg-gray-50/50 border rounded-xl px-4 py-3 min-h-[44px] font-semibold focus:bg-white outline-none transition-all text-brand-earth";
    const errorStyle = "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200/50";
    const normalStyle = "border-gray-100 focus:border-brand-green focus:ring-2 focus:ring-brand-green/30";
    return `${base} ${hasError ? errorStyle : normalStyle}`;
  };

  return (
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
            <Link href="/" className="inline-flex items-center gap-2 bg-brand-green hover:bg-brand-green/90 text-white px-6 py-3.5 min-h-[44px] rounded-full text-[10px] font-bold uppercase tracking-widest transition-all shadow-md shadow-brand-green/10 cursor-pointer">
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
                  <input suppressHydrationWarning name="first_name" value={formData.first_name} onChange={handleInputChange} className={getInputClassName('first_name')} placeholder="John" required />
                  {errors.first_name && <p className="text-[9px] text-red-500 font-semibold">{errors.first_name}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-brand-earth/60">Last Name</label>
                  <input suppressHydrationWarning name="last_name" value={formData.last_name} onChange={handleInputChange} className={getInputClassName('last_name')} placeholder="Smith" required />
                  {errors.last_name && <p className="text-[9px] text-red-500 font-semibold">{errors.last_name}</p>}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-widest text-brand-earth/60">Email Address</label>
                <input suppressHydrationWarning type="email" name="email" value={formData.email} onChange={handleInputChange} className={getInputClassName('email')} placeholder="@example.com" required />
                {errors.email && <p className="text-[9px] text-red-500 font-semibold">{errors.email}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-widest text-brand-earth/60">Phone Number</label>
                <input suppressHydrationWarning name="phone" value={formData.phone} onChange={handleInputChange} className={getInputClassName('phone')} placeholder="0912 345 6789" required />
                {errors.phone && <p className="text-[9px] text-red-500 font-semibold">{errors.phone}</p>}
              </div>
              <button suppressHydrationWarning type="button" onClick={nextStep} className="w-full bg-brand-earth hover:bg-brand-green text-white py-3.5 min-h-[44px] rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md shadow-brand-earth/10 flex items-center justify-center gap-1.5 cursor-pointer">
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
                <input suppressHydrationWarning name="target_location" value={formData.target_location} onChange={handleInputChange} className={getInputClassName('target_location')} placeholder="e.g. Davao City, Poblacion" required />
                {errors.target_location && <p className="text-[9px] text-red-500 font-semibold">{errors.target_location}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-widest text-brand-earth/60">Investment Capacity</label>
                <select suppressHydrationWarning name="investment_capacity" value={formData.investment_capacity} onChange={handleInputChange} className={getInputClassName('investment_capacity')} required>
                  <option value="">Select Capacity Range</option>
                  <option value="50k-100k">₱50,000 - ₱100,000</option>
                  <option value="100k-200k">₱100,000 - ₱200,000</option>
                  <option value="200k-500k">₱200,000 - ₱500,000</option>
                  <option value="500k+">₱500,000+</option>
                </select>
                {errors.investment_capacity && <p className="text-[9px] text-red-500 font-semibold">{errors.investment_capacity}</p>}
              </div>
              <div className="flex gap-4 pt-2">
                <button suppressHydrationWarning type="button" onClick={prevStep} className="flex-1 bg-gray-100 hover:bg-gray-200 text-brand-earth py-3.5 min-h-[44px] rounded-full text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                  <CaretLeft size={14} weight="bold" />
                  Back
                </button>
                <button suppressHydrationWarning type="button" onClick={nextStep} className="flex-[2] bg-brand-earth hover:bg-brand-green text-white py-3.5 min-h-[44px] rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md shadow-brand-earth/10 flex items-center justify-center gap-1.5 cursor-pointer">
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
                <textarea suppressHydrationWarning name="experience_summary" value={formData.experience_summary} onChange={handleInputChange} className={`${getInputClassName('experience_summary')} h-28 resize-none placeholder:font-normal`} placeholder="Briefly explain any prior business or food stall experiences..."></textarea>
              </div>
              <div className="p-4 rounded-2xl bg-brand-green/5 border border-brand-green/10 space-y-1">
                <p className="text-[9px] font-bold uppercase tracking-widest text-brand-green">Compliance Acknowledgement</p>
                <p className="text-[10px] text-brand-earth/60 font-medium leading-relaxed">
                  By submitting, you agree to our franchise terms and allow our personnel to conduct financial and background checks relative to your application.
                </p>
              </div>
              <div className="flex gap-4 pt-2">
                <button suppressHydrationWarning type="button" onClick={prevStep} className="flex-1 bg-gray-100 hover:bg-gray-200 text-brand-earth py-3.5 min-h-[44px] rounded-full text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                  <CaretLeft size={14} weight="bold" />
                  Back
                </button>
                <button suppressHydrationWarning type="submit" disabled={loading} className="flex-[2] bg-brand-green text-white py-3.5 min-h-[44px] rounded-full text-[10px] font-bold uppercase tracking-widest hover:opacity-90 active:scale-[0.99] transition-all shadow-md shadow-brand-green/10 disabled:opacity-50 cursor-pointer">
                  {loading ? "Submitting application..." : "Submit Application"}
                </button>
              </div>
              {errors.general && <p className="text-[9px] text-red-500 font-semibold text-center">{errors.general}</p>}
            </div>
          )}
        </form>
      )}
    </div>
  );
}
