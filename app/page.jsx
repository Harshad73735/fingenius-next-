import HeroSection from "@/components/hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { featuresData } from "@/data/landing";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-white dark:bg-[#0B0F19] overflow-hidden min-h-screen selection:bg-purple-500/30">
      
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen dark:opacity-40 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] mix-blend-screen dark:opacity-40 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 pt-32">
        <HeroSection />



        {/* ── Features Section (Illuminated Cards) ── */}
        <section id="features" className="py-24 sm:py-32 relative">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-24">
              <h2 className="text-sm font-bold tracking-widest text-purple-600 dark:text-purple-400 uppercase mb-4">Features</h2>
              <h3 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
                Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">manage wealth</span>
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {featuresData.map((feature, index) => (
                <Card 
                  key={index} 
                  className="group relative overflow-hidden border border-slate-200/50 dark:border-slate-700/50 bg-white/60 dark:bg-slate-800/30 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 rounded-3xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Neon border effect on hover */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-purple-500/20 dark:group-hover:border-purple-400/20 rounded-3xl transition-colors duration-500 pointer-events-none" />

                  <CardContent className="p-8 relative z-10 flex flex-col items-start space-y-5">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/40 dark:to-blue-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner border border-white/50 dark:border-white/10">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{feature.title}</h3>
                    <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>



        {/* ── CTA Section (Ultra Premium Neon) ── */}
        <section className="py-24 sm:py-32 relative overflow-hidden mx-4 sm:mx-8 mb-8 rounded-[3rem] border border-white/10">
          <div className="absolute inset-0 bg-slate-900 dark:bg-black" />
          
          {/* Animated Mesh Gradients */}
          <div className="absolute -top-[50%] -left-[10%] w-[70%] h-[150%] bg-purple-600/40 rounded-full mix-blend-screen filter blur-[120px] animate-pulse" />
          <div className="absolute -bottom-[50%] -right-[10%] w-[70%] h-[150%] bg-blue-600/40 rounded-full mix-blend-screen filter blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
          
          <div className="container mx-auto px-4 relative z-10 text-center flex flex-col items-center">
            <h2 className="text-4xl sm:text-6xl font-extrabold text-white mb-6 tracking-tight drop-shadow-2xl">
              Ready to take control?
            </h2>
            <p className="text-xl sm:text-2xl text-blue-100/80 mb-12 max-w-2xl mx-auto font-medium">
              Join FinGenius today and start making confident financial decisions with AI-powered insights.
            </p>
            <Link href="/dashboard" prefetch={true}>
              <Button
                size="lg"
                className="h-16 px-10 text-lg font-bold bg-white text-slate-900 hover:bg-slate-50 hover:scale-105 active:scale-95 rounded-full shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_80px_rgba(255,255,255,0.4)] transition-all duration-300 group"
              >
                <span className="flex items-center gap-3">
                  Start Your Journey
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="h-4 w-4 text-slate-900" />
                  </div>
                </span>
              </Button>
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
