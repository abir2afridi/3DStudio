import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowLeft, Github, Globe, Mail, MapPin, Calendar, Heart, GraduationCap, Briefcase, Code } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { LOTTIE_URL } from '@/utils/constants';
import { fadeInUp, staggerSlow as stagger } from '@/utils/motion';


export default function Developer() {
  return (
    <div className="min-h-screen bg-white text-[#0A0A0A] font-sans selection:bg-[#0A0A0A] selection:text-white antialiased">
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

      <header className="fixed top-0 w-full z-50 px-12 py-10 flex justify-between items-center mix-blend-difference invert uppercase tracking-[0.4em] text-[10px] font-bold">
        <Link href="/" className="flex items-center gap-2 hover:opacity-50 transition-opacity">
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Link>
        <span className="opacity-40">System Architect</span>
      </header>

      <main className="relative z-10 px-12 pt-40 pb-40 max-w-6xl mx-auto">
        {/* Profile Summary */}
        <motion.section 
          initial="initial"
          animate="animate"
          variants={stagger}
          className="mb-40"
        >
          <motion.div variants={fadeInUp} className="text-[10px] font-bold uppercase tracking-[0.5em] text-black/30 mb-8">
            Lead Developer
          </motion.div>
          <motion.h1 variants={fadeInUp} className="text-[10vw] md:text-[8vw] font-medium tracking-tighter leading-[0.8] mb-12">
            Abir Hasan <br/> <span className="opacity-30">Siam.</span>
          </motion.h1>

          <motion.div variants={fadeInUp} className="grid grid-cols-2 md:grid-cols-4 gap-12 border-y border-black/[0.08] py-12">
            <InfoBox label="Age" value="22" />
            <InfoBox label="Location" value="Gazipur, BD" />
            <InfoBox label="Origin" value="Tangail" />
            <InfoBox label="Blood" value="B+" />
          </motion.div>
        </motion.section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-32">
          {/* Education */}
          <section className="space-y-16">
            <SectionHeader title="Education" icon={<GraduationCap className="w-4 h-4" />} />
            <div className="space-y-12">
              <EduItem 
                inst="Independent University of Bangladesh" 
                deg="BSc in Computer Science" 
                time="2021 — Present" 
              />
              <EduItem 
                inst="Misir Ali Khan Memorial" 
                deg="HSC" 
                time="2019 — 2020" 
              />
              <EduItem 
                inst="Professor MEH Arif" 
                deg="SSC" 
                time="2017 — 2018" 
              />
            </div>
          </section>

          {/* Skills */}
          <section className="space-y-16">
            <SectionHeader title="Technical Stack" icon={<Code className="w-4 h-4" />} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <SkillGroup 
                title="Languages" 
                items={['Dart (Flutter)', 'React', 'Python', 'JS/TS']} 
              />
              <SkillGroup 
                title="Development" 
                items={['Android APK', 'Flutter', 'Web', 'React.js']} 
              />
              <SkillGroup 
                title="Tools & OS" 
                items={['Windows', 'Linux', 'Git/GitHub', 'CMake']} 
              />
              <SkillGroup 
                title="Interests" 
                items={['UI Design', 'AI Tools', 'Cross-Platform']} 
              />
            </div>
          </section>
        </div>

        {/* Vision & Practice */}
        <section className="mt-40 pt-40 border-t border-black/[0.08]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
            <div className="space-y-10">
              <SectionHeader title="Notable Practices" icon={<Heart className="w-4 h-4" />} />
              <ul className="space-y-6 text-sm md:text-md text-black/50 font-light leading-relaxed">
                <li>• Clean Flutter project architectural patterns.</li>
                <li>• Intense focus on step-by-step technical clarity.</li>
                <li>• Priority on immediate, friction-less launch experiences.</li>
                <li>• Native-first, multi-OS compatibility strategies.</li>
              </ul>
            </div>
            <div className="space-y-10">
              <SectionHeader title="Personal Traits" icon={<Briefcase className="w-4 h-4" />} />
              <p className="text-xl md:text-2xl font-medium tracking-tight leading-relaxed">
                Detail-oriented architect who enjoys experimenting with cross-platform solutions. Keeping systems <span className="opacity-30">clean, optimized, and professional.</span>
              </p>
            </div>
          </div>
        </section>

        {/* Presence */}
        <section className="mt-40 py-20 bg-[#F9F9F9] border border-black/[0.05] p-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="text-[10px] font-bold uppercase tracking-[0.5em] text-black/30 italic">Presence</div>
            <div className="flex flex-wrap justify-center gap-12">
              <PresenceLink icon={<Github className="w-4 h-4" />} label="GitHub" href="https://github.com/abir2afridi" />
              <PresenceLink icon={<Globe className="w-4 h-4" />} label="Portfolio" href="https://abir2afridi.vercel.app/" />
              <PresenceLink icon={<Mail className="w-4 h-4" />} label="Email" href="mailto:abir2afridi@gmail.com" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function SectionHeader({ title, icon }: any) {
  return (
    <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.5em] text-black/30">
      {icon}
      <span>{title}</span>
    </div>
  );
}

function InfoBox({ label, value }: any) {
  return (
    <div className="space-y-2">
      <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-black/20 italic">{label}</div>
      <div className="text-lg font-medium">{value}</div>
    </div>
  );
}

function EduItem({ inst, deg, time }: any) {
  return (
    <div className="group border-l border-black/10 pl-8 hover:border-black transition-colors duration-500">
      <div className="text-[10px] font-bold uppercase tracking-widest text-black/20 mb-2">{time}</div>
      <h3 className="text-xl font-medium mb-1">{inst}</h3>
      <p className="text-sm text-black/40 font-light italic">{deg}</p>
    </div>
  );
}

function SkillGroup({ title, items }: any) {
  return (
    <div className="space-y-4">
      <h4 className="text-[9px] font-bold uppercase tracking-widest text-black/20 border-b border-black/5 pb-2 inline-block italic">{title}</h4>
      <div className="flex flex-wrap gap-2 pt-2">
        {items.map((item: string) => (
          <span key={item} className="text-[11px] font-medium tracking-tight opacity-50">• {item}</span>
        ))}
      </div>
    </div>
  );
}

function PresenceLink({ icon, label, href }: any) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="flex items-center gap-3 text-sm font-medium hover:opacity-100 opacity-60 transition-opacity"
    >
      {icon}
      <span className="underline decoration-black/10 underline-offset-4 decoration-1">{label}</span>
    </a>
  );
}
