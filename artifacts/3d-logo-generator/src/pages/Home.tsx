import React from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Cuboid, ArrowRight, Zap, Wand2, Cpu, Globe, Cross, Plus } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { LOTTIE_URL } from '@/utils/constants';
import { fadeInUpSlight as fadeInUp, stagger } from '@/utils/motion';


export default function Home() {
  return (
    <div className="min-h-screen bg-white text-[#0A0A0A] font-sans selection:bg-[#0A0A0A] selection:text-white antialiased overflow-x-hidden">
      {/* Dynamic Lottie Background - Scaled for Immersion */}
      <div className="fixed inset-[-10%] z-0 pointer-events-none opacity-40">
        <DotLottieReact
          src={LOTTIE_URL}
          loop
          autoplay
          className="w-full h-full object-cover scale-110"
        />
      </div>

      {/* Structural Grid Layer (Subtle) */}
      <div className="fixed inset-0 z-1 pointer-events-none opacity-[0.02]">
        <div className="h-full w-full bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:100px_100px]" />
      </div>

      {/* Minimalist Header */}
      <header className="fixed top-0 w-full z-50 px-6 md:px-12 py-6 md:py-10 flex justify-between items-center mix-blend-difference invert uppercase tracking-[0.4em] text-[10px] font-bold">
        <div className="flex items-center gap-3">
          <Cuboid className="w-5 h-5" />
          <span className="hidden sm:inline">3D STUDIO</span>
        </div>
        <div className="hidden lg:flex gap-12 text-[10px] font-bold uppercase tracking-[0.4em]">
           <a href="#about" className="hover:opacity-50 transition-all">About</a>
           <a href="#lab" className="hover:opacity-50 transition-all">Lab</a>
           <a href="#dev" className="hover:opacity-50 transition-all">Dev</a>
           <a href="#contact" className="hover:opacity-50 transition-all">Contact</a>
        </div>
        <Link href="/editor" className="hover:opacity-50 transition-opacity">
          Launch →
        </Link>
      </header>

      <main className="relative z-10 px-6 md:px-12">
        {/* Extreme Minimal Hero - Fitted to Viewport */}
        <motion.section 
          initial="initial"
          animate="animate"
          variants={stagger}
          className="min-h-screen flex flex-col justify-center max-w-6xl"
        >
          <motion.div variants={fadeInUp} className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#0A0A0A]/30 mb-8">
            Spatial Computing Laboratory
          </motion.div>
          
          <motion.h1 variants={fadeInUp} className="text-[14vw] md:text-[10vw] lg:text-[7vw] font-medium tracking-[-0.05em] leading-[0.85] mb-12">
            Converting <br/> vision into <br/> <span className="opacity-20 italic">geometry.</span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-sm md:text-lg text-[#0A0A0A]/40 max-w-lg mb-16 font-light leading-relaxed">
            The world's first browser-native 3D generator. <br className="hidden sm:block" /> Zero latency. Total privacy. Infinite scale.
          </motion.p>
          
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center gap-8 sm:gap-12">
             <Link href="/editor" className="w-full sm:w-auto text-center px-12 md:px-16 py-5 md:py-6 bg-[#0A0A0A] text-white text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-white hover:text-black hover:ring-1 hover:ring-black transition-all">
               Commence Creation
             </Link>
             <div className="hidden sm:block w-px h-12 bg-black/[0.1]" />
             <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/20 text-center sm:text-left">
               Build 0.4.2 <br/> Stable Release
             </div>
          </motion.div>
        </motion.section>

        {/* About Section */}
        <section id="about" className="mt-20 md:mt-60 max-w-4xl py-20">
           <div className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#0A0A0A]/30 mb-12">Our Philosophy</div>
           <h2 className="text-[10vw] md:text-[5vw] font-medium tracking-[-0.04em] leading-[0.95] mb-16">
              Simplifying the <span className="opacity-30">complexities</span> of the third dimension.
           </h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 text-sm text-black/40 font-light leading-relaxed">
              <p>
                 We believe that 3D design should be as accessible as drawing on paper. Our mission is to bridge the gap between 2D conceptualization and 3D spatial reality through intelligent, browser-native computation.
              </p>
              <p>
                 Founded in 2026, 3D Studio is a research-driven laboratory focused on the intersection of geometry, typography, and hardware-accelerated design tools.
              </p>
           </div>
        </section>

        {/* Technical Specification Grid */}
        <section id="lab" className="mt-20 md:mt-60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-black/[0.08]">
           <SpecItem num="01" title="SILHOUETTE ENGINE" desc="Real-time mesh generation from 2D vector data using hardware-accelerated buffers." />
           <SpecItem num="02" title="PBR MATERIALS" desc="Physically accurate shaders: Polished glass, chrome, and matte ceramic finishes." />
           <SpecItem num="03" title="LOCAL COMPUTE" desc="100% GPU-native. No assets ever leave your device. Permanent privacy." />
           <SpecItem num="04" title="EXPORT STANDARDS" desc="Download GLB and STL files ready for Blender, Unreal, and Cinema 4D." />
        </section>

        {/* Minimal Image / Showcase */}
        <section className="mt-20 md:mt-40 border border-black/[0.08] p-0.5 md:p-1 shadow-sm overflow-hidden">
           <div className="aspect-video md:aspect-[21/9] bg-[#F9F9F9] relative overflow-hidden flex items-center justify-center group">
              <Plus className="absolute top-6 md:top-10 left-6 md:left-10 w-4 h-4 opacity-10 group-hover:opacity-100 transition-opacity" />
              <Plus className="absolute top-6 md:top-10 right-6 md:right-10 w-4 h-4 opacity-10 group-hover:opacity-100 transition-opacity" />
              <Plus className="absolute bottom-6 md:bottom-10 left-6 md:left-10 w-4 h-4 opacity-10 group-hover:opacity-100 transition-opacity" />
              <Plus className="absolute bottom-6 md:bottom-10 right-6 md:right-10 w-4 h-4 opacity-10 group-hover:opacity-100 transition-opacity" />
              
              <img 
                src="file:///C:/Users/HP%20840G5-i7/.gemini/antigravity/brain/f91f0d7f-3733-428e-bcb8-1a19a710d471/threed_logo_mockup_1774244825321.png" 
                alt="Minimal Preview" 
                className="w-[80%] md:w-1/2 h-auto opacity-80 grayscale mix-blend-multiply group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000"
              />
              
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-32 bg-black/5" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-[1px] bg-black/5" />
           </div>
        </section>

        {/* Developer Section (System Architect) */}
        <section id="dev" className="mt-20 md:mt-60 pt-20 md:pt-40 border-t border-black/[0.08]">
           <div className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#0A0A0A]/30 mb-12 italic">System Architect</div>
           <div className="flex flex-col lg:flex-row gap-16 md:gap-24 items-start">
             <div className="w-full lg:flex-1 space-y-8 md:space-y-12">
               <h2 className="text-[12vw] sm:text-[10vw] lg:text-[7vw] font-medium tracking-tighter leading-[0.8]">Abir Hasan <br/> <span className="opacity-30">Siam.</span></h2>
               <div className="flex flex-wrap gap-8 text-[10px] font-bold uppercase tracking-[0.3em] text-black/40">
                  <span>22 Yrs</span>
                  <span>DHAKA, BANGLADESH</span>
                  <span>CSC @ IUB</span>
               </div>
             </div>
             <div className="w-full lg:flex-1 space-y-12">
               <p className="text-lg md:text-2xl font-light text-black/60 leading-relaxed max-w-xl">
                 Bridging the gap between conceptual 2D UI and hardware-accelerated 3D systems. Focused on building high-performance, browser-native design tools.
               </p>
               <div className="flex flex-wrap gap-x-6 gap-y-3 text-[10px] font-bold uppercase tracking-[0.2em] text-black/30">
                  <span>React.js</span>
                  <span>Flutter</span>
                  <span>Python</span>
                  <span>Three.js</span>
                  <span>Dart</span>
               </div>
               <Link href="/developer" className="inline-flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.4em] hover:gap-8 transition-all duration-500">
                  Detailed Dossier <ArrowRight className="w-4 h-4" />
               </Link>
             </div>
           </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="mt-20 md:mt-60 pt-20 md:pt-40 border-t border-black/[0.08]">
           <div className="flex flex-col lg:flex-row justify-between gap-16 lg:gap-24">
              <div className="max-w-md">
                 <div className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#0A0A0A]/30 mb-8">Direct Access</div>
                 <h2 className="text-[10vw] md:text-[5vw] font-medium tracking-tight mb-8 leading-tight">Reach out to <br className="hidden sm:block" /> our architects.</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 md:gap-20 self-start lg:self-end mb-0 md:mb-20">
                 <ContactItem title="General Enquiries" value="hello@3dstudio.lab" />
                 <ContactItem title="Technical Support" value="support@3dstudio.lab" />
                 <ContactItem title="Twitter / X" value="@3DStudioLab" />
                 <ContactItem title="Office" value="51.52° N, 0.12° W" />
              </div>
           </div>
        </section>

        {/* Extreme CTA */}
        <section className="mt-20 md:mt-40 text-center py-20 md:py-40 border-y border-black/[0.08]">
           <h2 className="text-[10vw] md:text-[5vw] font-medium tracking-[-0.04em] mb-12 opacity-80 leading-tight">Commence your legacy.</h2>
           <Link href="/editor" className="inline-block px-12 md:px-16 py-5 md:py-6 border border-black text-[10px] font-bold uppercase tracking-[0.5em] hover:bg-black hover:text-white transition-all w-full sm:w-auto">
             Open Studio
           </Link>
        </section>
      </main>

      {/* Minimal Footer */}
      <footer className="px-6 md:px-12 py-12 md:py-20 bg-white border-t border-black/[0.08]">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 md:gap-20">
          <div className="space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em]">3D STUDIO</span>
            <p className="text-[9px] text-black/20 font-mono italic">51.5074° N, 0.1278° W</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 md:gap-20 w-full md:w-auto">
            <FooterCol title="Studio" links={['Editor', 'Lab', 'Files']} />
            <FooterCol title="Policy" links={['Privacy', 'Standard']} />
            <FooterCol title="Design" links={['Docs', 'Library']} />
            <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-black/10">© 2026</div>
          </div>
        </div>
      </footer>

    </div>
  );
}

function SpecItem({ num, title, desc }: any) {
  return (
    <div className="p-8 md:p-12 border-r border-b border-black/[0.08] lg:border-b-0 group">
      <div className="text-[10px] font-mono text-black/20 mb-6 md:mb-8">{num}</div>
      <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-4 md:mb-6">{title}</h3>
      <p className="text-[11px] text-black/40 font-medium leading-relaxed max-w-[200px]">{desc}</p>
    </div>
  );
}

function FooterCol({ title, links }: any) {
  return (
    <div className="space-y-8">
      <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-black/20">{title}</h4>
      <ul className="space-y-3">
        {links.map((l: string) => (
          <li key={l}><a href="#" className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40 hover:text-black transition-colors">{l}</a></li>
        ))}
      </ul>
    </div>
  );
}

function ContactItem({ title, value }: any) {
  return (
    <div className="space-y-4 group cursor-pointer">
      <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-black/20 group-hover:text-black/40 transition-colors italic">{title}</div>
      <div className="text-xl md:text-2xl font-medium tracking-tight group-hover:pl-2 transition-all duration-500 underline decoration-black/5 underline-offset-8 decoration-1 underline-dashed">{value}</div>
    </div>
  );
}
