import React from 'react';
import { SiteSettings } from '../types';

interface MobileFranchisePreviewProps {
  formData: SiteSettings;
  mockStep: number;
  setMockStep: (step: number) => void;
}

export default function MobileFranchisePreview({ formData, mockStep, setMockStep }: MobileFranchisePreviewProps) {
  return (
    <div className="space-y-0.5 animate-in fade-in duration-300">
      <div className="p-4 space-y-3 bg-white border-b border-gray-100">
        <div className="inline-flex items-center gap-1.5 py-0.5 px-2 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 text-[5px] font-bold uppercase tracking-wider text-brand-yellow">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow animate-pulse"></span>
          {formData.franchise_badge || 'Business Opportunity'}
        </div>
        <h1 className="text-sm font-extrabold tracking-tight text-brand-earth leading-tight">
          {formData.franchise_title_white || 'Grow with'}<br/>
          <span className="text-brand-green">{formData.franchise_title_green || 'Pastil ni Liling.'}</span>
        </h1>
        <p className="text-[7.5px] text-brand-earth/50 leading-relaxed font-medium">
          {formData.franchise_subtitle || 'Be part of the Philippines fastest-growing pastil brand...'}
        </p>
      </div>

      <div className="p-4 bg-[#fafafa] space-y-3">
        {[
          { 
            title: formData.franchise_benefit1_title || 'Low Capital', 
            desc: formData.franchise_benefit1_desc || 'Minimal overhead setup.',
            icon: (
              <svg className="text-brand-green" style={{ width: '8px', height: '8px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="8" r="6" />
                <path d="M18 8a6 6 0 0 1-6 6" />
                <circle cx="16" cy="16" r="6" />
              </svg>
            )
          },
          { 
            title: formData.franchise_benefit2_title || 'Proven System', 
            desc: formData.franchise_benefit2_desc || 'Operational training.',
            icon: (
              <svg className="text-brand-green" style={{ width: '8px', height: '8px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            )
          },
          { 
            title: formData.franchise_benefit3_title || 'High Demand', 
            desc: formData.franchise_benefit3_desc || 'Staple favorite.',
            icon: (
              <svg className="text-brand-green" style={{ width: '8px', height: '8px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 11 2 2 4-4" />
              </svg>
            )
          },
          { 
            title: formData.franchise_benefit4_title || 'Marketing Power', 
            desc: formData.franchise_benefit4_desc || 'National support.',
            icon: (
              <svg className="text-brand-green" style={{ width: '8px', height: '8px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m4 15 4-3 9 4V4L8 8l-4-3v10Z" />
                <path d="M12 17v4" />
              </svg>
            )
          }
        ].map((item, idx) => (
          <div key={idx} className="flex gap-2.5">
            <div className="w-4.5 h-4.5 rounded bg-brand-green/10 flex items-center justify-center shrink-0 border border-brand-green/20">
              {item.icon}
            </div>
            <div className="space-y-0.5">
              <h4 className="text-[6px] font-black uppercase tracking-wider">{item.title}</h4>
              <p className="text-[5.5px] text-brand-earth/40 leading-normal">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mx-4 p-4 bg-brand-earth rounded-2xl text-white relative overflow-hidden space-y-1">
        <div className="absolute top-0 right-0 w-12 h-12 bg-brand-green/20 blur-xl rounded-full"></div>
        <p className="text-xs font-black tracking-tight leading-none">{formData.franchise_milestone_title || '50+ Branches'}</p>
        <p className="text-[5px] font-bold uppercase tracking-widest opacity-60 leading-none">{formData.franchise_milestone_desc || 'And growing rapidly nationwide.'}</p>
      </div>

      {/* Mobile Form Section */}
      <div className="p-4 mt-2 bg-white border-t border-gray-50 space-y-2.5">
        {mockStep === 1 && (
          <div className="space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[5.5px] font-bold text-brand-green uppercase tracking-widest">Step 1 of 3</span>
              <span className="text-[5px] font-bold text-brand-earth/30 uppercase tracking-widest">Personal Info</span>
            </div>
            <div className="flex gap-1">
              <div className="h-0.5 flex-1 bg-brand-green rounded-full"></div>
              <div className="h-0.5 flex-1 bg-gray-100 rounded-full"></div>
              <div className="h-0.5 flex-1 bg-gray-100 rounded-full"></div>
            </div>
            <div className="space-y-1">
              <div className="grid grid-cols-2 gap-1.5">
                <div className="h-5 bg-gray-50 border border-gray-100 rounded-lg px-2 flex items-center">
                  <span className="text-[5px] font-bold text-brand-earth/30">First Name</span>
                </div>
                <div className="h-5 bg-gray-50 border border-gray-100 rounded-lg px-2 flex items-center">
                  <span className="text-[5px] font-bold text-brand-earth/30">Last Name</span>
                </div>
              </div>
              <div className="h-5 bg-gray-50 border border-gray-100 rounded-lg px-2 flex items-center">
                <span className="text-[5px] font-bold text-brand-earth/30">Email Address</span>
              </div>
              <div className="h-5 bg-gray-50 border border-gray-100 rounded-lg px-2 flex items-center">
                <span className="text-[5px] font-bold text-brand-earth/30">Phone Number</span>
              </div>
            </div>
            <button 
              onClick={() => setMockStep(2)}
              className="w-full h-6 bg-brand-earth hover:bg-brand-green text-white rounded-full flex items-center justify-center text-[5.5px] font-black uppercase tracking-widest leading-none transition-colors"
            >
              Continue
            </button>
          </div>
        )}

        {mockStep === 2 && (
          <div className="space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[5.5px] font-bold text-brand-green uppercase tracking-widest">Step 2 of 3</span>
              <span className="text-[5px] font-bold text-brand-earth/30 uppercase tracking-widest">Location & Capital</span>
            </div>
            <div className="flex gap-1">
              <div className="h-0.5 flex-1 bg-brand-green rounded-full"></div>
              <div className="h-0.5 flex-1 bg-brand-green rounded-full"></div>
              <div className="h-0.5 flex-1 bg-gray-100 rounded-full"></div>
            </div>
            <div className="space-y-1">
              <div className="h-5 bg-gray-50 border border-gray-100 rounded-lg px-2 flex items-center">
                <span className="text-[5px] font-bold text-brand-earth/30">Target Location</span>
              </div>
              <div className="h-5 bg-gray-50 border border-gray-100 rounded-lg px-2 flex items-center justify-between">
                <span className="text-[5px] font-bold text-brand-earth/30">Select Capacity Range</span>
                <span className="text-[4.5px] text-brand-earth/40">▼</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setMockStep(1)}
                className="flex-1 h-6 bg-gray-100 hover:bg-gray-200 text-brand-earth rounded-full flex items-center justify-center text-[5.5px] font-black uppercase tracking-widest leading-none transition-colors"
              >
                Back
              </button>
              <button 
                onClick={() => setMockStep(3)}
                className="flex-[2] h-6 bg-brand-earth hover:bg-brand-green text-white rounded-full flex items-center justify-center text-[5.5px] font-black uppercase tracking-widest leading-none transition-colors"
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {mockStep === 3 && (
          <div className="space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[5.5px] font-bold text-brand-green uppercase tracking-widest">Step 3 of 3</span>
              <span className="text-[5px] font-bold text-brand-earth/30 uppercase tracking-widest">Final Review</span>
            </div>
            <div className="flex gap-1">
              <div className="h-0.5 flex-1 bg-brand-green rounded-full"></div>
              <div className="h-0.5 flex-1 bg-brand-green rounded-full"></div>
              <div className="h-0.5 flex-1 bg-brand-green rounded-full"></div>
            </div>
            <div className="space-y-1">
              <div className="h-8 bg-gray-50 border border-gray-100 rounded-lg p-1.5 flex items-start">
                <span className="text-[4px] font-bold text-brand-earth/30 leading-tight">Prior food stall experience...</span>
              </div>
              <div className="p-1.5 rounded bg-brand-green/5 border border-brand-green/10 space-y-0.5">
                <p className="text-[3.5px] font-bold uppercase tracking-widest text-brand-green leading-none">Compliance Acknowledge</p>
                <p className="text-[3.5px] text-brand-earth/60 font-medium leading-tight">
                  By submitting, you agree to our franchise terms.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setMockStep(2)}
                className="flex-1 h-6 bg-gray-100 hover:bg-gray-200 text-brand-earth rounded-full flex items-center justify-center text-[5.5px] font-black uppercase tracking-widest leading-none transition-colors"
              >
                Back
              </button>
              <button 
                onClick={() => setMockStep(4)}
                className="flex-[2] h-6 bg-brand-green text-white rounded-full flex items-center justify-center text-[5.5px] font-black uppercase tracking-widest leading-none transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        )}

        {mockStep === 4 && (
          <div className="py-3 text-center space-y-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-6 h-6 rounded-full bg-brand-green/10 flex items-center justify-center mx-auto border border-brand-green/20">
              <svg className="text-brand-green w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="space-y-0.5">
              <h4 className="text-[8px] font-extrabold tracking-tight text-brand-earth leading-none">Application Received!</h4>
              <p className="text-[4.5px] text-brand-earth/50 font-medium max-w-[120px] mx-auto leading-relaxed">
                Our team will contact you within 3-5 business days.
              </p>
            </div>
            <button 
              onClick={() => setMockStep(1)}
              className="h-6 bg-brand-green text-white px-3 rounded-full text-[4.5px] font-bold uppercase tracking-widest transition-all hover:opacity-90 leading-none"
            >
              Return Home
            </button>
          </div>
        )}
      </div>

      <div className="py-4 border-t border-gray-100 text-center bg-white">
        <p 
          className="text-[4.5px] font-bold uppercase tracking-widest text-brand-earth/30 leading-normal"
          dangerouslySetInnerHTML={{ __html: formData.franchise_footer_copyright || '&copy; 2026 Pastil ni Liling...' }}
        />
      </div>
    </div>
  );
}
