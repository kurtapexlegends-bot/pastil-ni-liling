import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-brand-earth selection:bg-brand-yellow/30">
      {/* Navigation - Minimal & Elegant */}
      <nav className="fixed top-0 z-50 w-full bg-white/70 backdrop-blur-xl border-b border-gray-200/50">
        <div className="flex items-center justify-between px-6 h-20 max-w-6xl mx-auto">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-brand-green/20 rounded-full blur-md group-hover:bg-brand-green/40 transition-all"></div>
              <Image src="/logo.jpg" alt="Logo" width={42} height={42} className="relative rounded-full shadow-sm" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold leading-none tracking-tight uppercase">Pastil ni Liling</span>
              <span className="text-[9px] font-medium text-brand-green uppercase tracking-[0.2em] mt-1">Authentic Mindanao</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest text-brand-earth/60">
            <Link href="/menu" className="hover:text-brand-green transition-colors">Retail Menu</Link>
            <Link href="/franchise" className="hover:text-brand-green transition-colors">Franchise</Link>
            <Link href="/about" className="hover:text-brand-green transition-colors">Our Story</Link>
          </div>

          <div className="flex items-center gap-5">
            <Link href="/login" className="hidden sm:block text-[10px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100">Sign In</Link>
            <Link href="/menu" className="bg-brand-earth text-white px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-brand-earth/10 hover:bg-brand-green transition-all active:scale-95">
              Order Online
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Balanced & Focused */}
      <main className="pt-24 pb-20 md:pt-32 md:pb-32 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 animate-in fade-in duration-1000">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green/5 border border-brand-green/10 text-[9px] font-bold uppercase tracking-widest text-brand-green">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-green"></span>
              Sarap na Babalik-balikan
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.1] tracking-tight text-brand-earth">
              Mindanao's finest <br />
              delivered to your <br />
              <span className="text-brand-green">doorstep.</span>
            </h1>

            <p className="text-base md:text-lg text-brand-earth/60 max-w-md font-medium leading-relaxed">
              Experience authentic flavors crafted with tradition. From our signature chicken pastil to premium bottled sauces, we bring the heart of Mindanao to every meal.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/menu" className="bg-brand-green text-white px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest shadow-xl shadow-brand-green/20 hover:shadow-brand-green/40 transition-all text-center">
                Explore Catalog
              </Link>
              <Link href="/franchise" className="bg-white border border-gray-200 text-brand-earth px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:border-brand-yellow hover:bg-brand-yellow/5 transition-all text-center">
                Franchise Inquiry
              </Link>
            </div>

            <div className="flex items-center gap-6 pt-10">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden grayscale-[0.5] hover:grayscale-0 transition-all">
                    <Image src={`https://i.pravatar.cc/100?u=${i+20}`} alt="User" width={40} height={40} />
                  </div>
                ))}
              </div>
              <p className="text-[10px] font-bold text-brand-earth/40 uppercase tracking-widest leading-relaxed">
                Trusted by <span className="text-brand-earth">10,000+</span> <br />satisfied customers
              </p>
            </div>
          </div>

          <div className="relative group animate-in fade-in zoom-in duration-1000 delay-200">
            <div className="absolute inset-0 bg-brand-yellow/20 rounded-[2.5rem] blur-3xl -z-10 group-hover:bg-brand-yellow/30 transition-all duration-700"></div>
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(45,74,34,0.2)] border-8 border-white bg-white aspect-square">
              <Image 
                src="/hero.png" 
                alt="Pastil ni Liling Signature Dish" 
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover group-hover:scale-110 transition-transform duration-1000"
                priority
                loading="eager"
              />
            </div>
            
            {/* Subtle Floating Info */}
            <div className="absolute -bottom-6 -right-6 bg-white p-5 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4 animate-in slide-in-from-bottom duration-1000 delay-500">
              <div className="bg-brand-green/10 w-10 h-10 rounded-xl flex items-center justify-center text-xl">🍚</div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-brand-earth/40">Freshly Made</p>
                <p className="text-xs font-bold">Daily Batch Pastil</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Featured Categories - Clean & Minimal */}
      <section className="bg-white py-24 md:py-32 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { title: "The Signature", subtitle: "Chicken Adobo Pastil", desc: "Authentic steamed rice topped with premium shredded chicken.", price: "Starts at ₱25", priority: true },
              { title: "Bottled Premium", subtitle: "Spicy Shrimp Bagoong", desc: "Our secret recipe shrimp paste with a spicy kick.", price: "₱149 per jar", priority: false },
              { title: "Side Kick", subtitle: "Chili Garlic Oil", desc: "Premium garlic bits in spicy toasted chili oil infusion.", price: "₱99 per jar", priority: false },
            ].map((item, idx) => (
              <div key={idx} className="space-y-6 group cursor-pointer">
                <div className="aspect-[4/3] rounded-3xl bg-gray-50 overflow-hidden relative border border-gray-100 shadow-sm transition-all group-hover:shadow-md">
                   <Image 
                    src="/hero.png" 
                    alt={item.subtitle} 
                    fill 
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-all duration-500 opacity-80 group-hover:opacity-100" 
                    priority={item.priority}
                    loading={item.priority ? "eager" : "lazy"}
                  />
                </div>
                <div className="space-y-2">
                  <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-green">{item.title}</div>
                  <h3 className="text-xl font-extrabold tracking-tight">{item.subtitle}</h3>
                  <p className="text-sm text-brand-earth/50 font-medium leading-relaxed">{item.desc}</p>
                  <div className="text-xs font-bold pt-2">{item.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section - Subtle Statistics */}
      <section className="py-24 md:py-40 bg-[#fafafa]">
        <div className="max-w-6xl mx-auto px-6 text-center space-y-20">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">The Fastest Growing Pastil Brand.</h2>
            <p className="text-sm md:text-base text-brand-earth/50 max-w-lg mx-auto font-medium">Join our mission to bring Mindanao's finest to every Filipino table through our expanding franchise network.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Active Branches", value: "50+" },
              { label: "Daily Orders", value: "5,000+" },
              { label: "Cities Reached", value: "20+" },
              { label: "Franchise Apps", value: "200+" },
            ].map((stat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="text-3xl md:text-4xl font-black tracking-tighter text-brand-earth">{stat.value}</div>
                <div className="text-[9px] font-bold uppercase tracking-widest text-brand-earth/40">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer - Elegant & Informative */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-12 grid md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1 space-y-6">
            <div className="flex items-center gap-3">
              <Image src="/logo.jpg" alt="Logo" width={32} height={32} className="rounded-full grayscale-[0.2]" />
              <span className="text-sm font-bold uppercase tracking-tighter">Pastil ni Liling</span>
            </div>
            <p className="text-xs text-brand-earth/50 leading-relaxed font-medium">
              Bringing authentic Mindanao flavors to the mainstream. Quality you can trust, prices you can afford.
            </p>
          </div>
          
          <div className="space-y-6">
            <h4 className="text-[10px] font-bold uppercase tracking-widest">Platform</h4>
            <ul className="space-y-3 text-[10px] font-bold uppercase tracking-widest opacity-40">
              <li><Link href="/menu" className="hover:opacity-100 transition-opacity">Browse Menu</Link></li>
              <li><Link href="/franchise" className="hover:opacity-100 transition-opacity">Franchise Program</Link></li>
              <li><Link href="/locations" className="hover:opacity-100 transition-opacity">Find a Store</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-bold uppercase tracking-widest">Support</h4>
            <ul className="space-y-3 text-[10px] font-bold uppercase tracking-widest opacity-40">
              <li><Link href="/help" className="hover:opacity-100 transition-opacity">Help Center</Link></li>
              <li><Link href="/terms" className="hover:opacity-100 transition-opacity">Terms of Use</Link></li>
              <li><Link href="/privacy" className="hover:opacity-100 transition-opacity">Privacy Policy</Link></li>
            </ul>
          </div>

          <div className="space-y-6 text-right md:text-right text-left">
            <h4 className="text-[10px] font-bold uppercase tracking-widest">Connect</h4>
            <div className="flex justify-start md:justify-end gap-4 opacity-40">
              {['FB', 'IG', 'TW'].map(s => (
                <div key={s} className="w-8 h-8 rounded-full border border-brand-earth flex items-center justify-center text-[8px] font-black hover:opacity-100 transition-opacity cursor-pointer">{s}</div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto px-6 py-12 border-t border-gray-100 text-center">
          <p className="text-[9px] font-bold uppercase tracking-widest opacity-30">
            &copy; 2026 Pastil ni Liling. Swak sa Bulsa, Sarap na Babalik-balikan.
          </p>
        </div>
      </footer>
    </div>
  );
}
