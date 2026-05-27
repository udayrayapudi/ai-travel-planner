import Link from 'next/link';
import { ArrowRight, Map, DollarSign, CloudSun, Shield, Sparkles, Globe } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight">WanderWise</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How it works</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2">Log in</Link>
            <Link href="/login" className="text-sm font-medium bg-foreground text-background px-4 py-2 rounded-lg hover:opacity-90 transition-colors">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px]" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px]" />

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-foreground/5 border border-foreground/10 rounded-full px-4 py-1.5 mb-8">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs text-muted-foreground">Powered by AI intelligence</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            Travel planning,
            <br />
            <span className="bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">reimagined.</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop scrolling through endless blog posts. Our AI builds hyper-personalized
            itineraries with real cost data, weather intelligence, and local secrets.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="group flex items-center gap-2 bg-foreground text-background font-semibold px-8 py-3.5 rounded-xl hover:opacity-90 transition-all text-sm">
              Start planning for free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a href="#features" className="flex items-center gap-2 text-sm text-muted-foreground border border-border px-8 py-3.5 rounded-xl hover:border-muted-foreground hover:text-foreground transition-all">
              See how it works
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-20">
            <div>
              <div className="text-2xl font-bold">10K+</div>
              <div className="text-xs text-muted-foreground mt-1">Trips planned</div>
            </div>
            <div>
              <div className="text-2xl font-bold">98%</div>
              <div className="text-xs text-muted-foreground mt-1">Satisfaction</div>
            </div>
            <div>
              <div className="text-2xl font-bold">40%</div>
              <div className="text-xs text-muted-foreground mt-1">Avg. savings</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 border-t border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything a travel agent does.<br /><span className="text-muted-foreground">But faster, and smarter.</span></h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Map, title: 'Smart Itineraries', desc: 'Day-by-day plans with real travel times, geographic flow, and rest windows. No more fantasy schedules.' },
              { icon: DollarSign, title: 'Cost Reality Check', desc: 'Realistic per-person budget breakdowns. Know if you\'re under or over budget before you book.' },
              { icon: CloudSun, title: 'Weather Intelligence', desc: 'Date-specific weather, crowd density, and seasonal pricing. Not generic — hyper-specific.' },
              { icon: Shield, title: 'Risk & Backup Plans', desc: 'Scam warnings, weather backup activities, transport delay strategies. Always prepared.' },
              { icon: Sparkles, title: 'Hidden Gems Engine', desc: 'Skip the tourist traps. Discover high-value experiences that locals actually recommend.' },
              { icon: Globe, title: 'Smart Alternatives', desc: 'If a better destination exists for your dates and budget, we\'ll tell you. Honestly.' },
            ].map((f, i) => (
              <div key={i} className="group bg-card border border-border rounded-2xl p-6 hover:border-muted-foreground/30 transition-all hover:bg-muted/50">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how" className="py-24 border-t border-border">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Three steps to your perfect trip</h2>
            <p className="text-muted-foreground">Our AI agent talks to you like a real travel consultant.</p>
          </div>

          <div className="space-y-12">
            {[
              { step: '01', title: 'Chat with the AI agent', desc: 'Answer simple questions one at a time. Our avatar walks you through destination, dates, budget, style, and preferences.' },
              { step: '02', title: 'Get your intelligent plan', desc: 'Receive a feasibility verdict, cost analysis, weather intel, and a day-by-day itinerary — all in seconds.' },
              { step: '03', title: 'Travel with confidence', desc: 'Pack smart, avoid traps, hit the hidden gems. Your entire trip, optimized and ready.' },
            ].map((s, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className="shrink-0 w-12 h-12 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold">{s.step}</div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">{s.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-border">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to plan smarter?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">Join thousands who have replaced hours of research with one intelligent conversation.</p>
          <Link href="/login" className="inline-flex items-center gap-2 bg-foreground text-background font-semibold px-8 py-3.5 rounded-xl hover:opacity-90 transition-all text-sm">
            Get started — it&apos;s free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Globe className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-medium">WanderWise</span>
          </div>
          <p className="text-xs text-muted-foreground">&copy; 2026 WanderWise. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
