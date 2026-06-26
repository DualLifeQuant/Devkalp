import React from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, ArrowRight, BookOpen, School, Award, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const FUTURE_FEATURES = [
  {
    icon: <School size={20} className="text-saffron-500" />,
    title: 'Tuition Fee Support',
    desc: 'Direct financial assistance covering school, college, and vocational program fees.'
  },
  {
    icon: <Award size={20} className="text-saffron-500" />,
    title: 'Merit Recognition',
    desc: 'Additional rewards and support for outstanding academic achievements.'
  },
  {
    icon: <BookOpen size={20} className="text-saffron-500" />,
    title: 'Mentorship & Guidance',
    desc: 'Connecting scholarship recipients with professional mentors for career preparation.'
  }
]

export default function ScholarshipPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <div className="page-container max-w-4xl">
          
          {/* Main Card */}
          <div className="bg-[#0a1128] text-white rounded-3xl p-8 sm:p-12 border border-white/10 shadow-2xl relative overflow-hidden">
            
            {/* Background lighting orbs */}
            <div className="absolute -top-12 -left-12 w-64 h-64 bg-saffron-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-trust-500/15 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center text-center">
              
              {/* Badge */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1 bg-saffron-500/15 border border-saffron-500/30 rounded-full mb-6"
              >
                <span className="w-2 h-2 rounded-full bg-saffron-400 animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-saffron-300">Coming Soon</span>
              </motion.div>

              {/* Icon */}
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-saffron-400 mb-6 shadow-inner"
              >
                <GraduationCap size={36} />
              </motion.div>

              {/* Title */}
              <motion.h1 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight mb-4"
              >
                Devkalp Scholarship Program
              </motion.h1>

              {/* Description */}
              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-slate-400 text-sm sm:text-base max-w-xl leading-relaxed mb-10"
              >
                We are currently building our merit-cum-means scholarship fund to empower students from lower-income backgrounds, helping them access quality higher education and vocational training in Surat, Gujarat and beyond.
              </motion.p>

              {/* Focus Pillars Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left mt-4 border-t border-white/10 pt-8 mb-10">
                {FUTURE_FEATURES.map((feature, i) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                    className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col gap-3 shadow-md"
                  >
                    <div className="w-9 h-9 rounded-lg bg-saffron-500/10 flex items-center justify-center shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">{feature.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* CTA Section */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 items-center"
              >
                <Link 
                  to="/contact" 
                  className="px-6 py-3 bg-saffron-400 hover:bg-saffron-300 text-trust-950 font-bold rounded-xl text-sm transition-all duration-300 shadow-lg hover:shadow-saffron-400/20 inline-flex items-center gap-1.5"
                >
                  <Mail size={16} /> Contact to Stay Updated <ArrowRight size={14} />
                </Link>
                <Link 
                  to="/" 
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl text-sm border border-white/10 transition-colors"
                >
                  Return Home
                </Link>
              </motion.div>

            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
