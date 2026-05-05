import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { Play, Headphones, Zap, Globe, Shield, ChevronRight, Star, Menu, X, Music, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function WaveformVisualizer() {
  const [bars] = useState(() =>
    Array.from({ length: 40 }, () => ({
      delay: Math.random() * 2,
      duration: 0.8 + Math.random() * 1.2,
      maxHeight: 20 + Math.random() * 60,
    }))
  );

  return (
    <div className="flex items-end gap-[3px] h-24">
      {bars.map((bar, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full bg-gradient-to-t from-[#667eea] to-[#764ba2] animate-pulse"
          style={{
            animationDelay: `${bar.delay}s`,
            animationDuration: `${bar.duration}s`,
            height: `${bar.maxHeight}%`,
          }}
        />
      ))}
    </div>
  );
}

function FloatingNote({ delay, x, size }) {
  return (
    <div
      className="absolute text-white/5 animate-float"
      style={{
        left: x,
        top: `${20 + Math.random() * 60}%`,
        animationDelay: `${delay}s`,
        fontSize: `${size}px`,
      }}
    >
      ♪
    </div>
  );
}

export default function Landing() {
  const navigate = (path) => router.visit(path);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="min-h-screen bg-[#07070f] text-white overflow-x-hidden">
      <Head title="Welcome to SoundWave" />
      
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#07070f]/90 backdrop-blur-xl border-b border-white/5 shadow-2xl' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center shadow-lg shadow-[#667eea]/25">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="6" cy="18" r="3" fill="currentColor"/>
                  <circle cx="18" cy="16" r="3" fill="currentColor"/>
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
                SoundWave
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              {['Features', 'Pricing', 'About'].map(item => (
                <a key={item} href={`#${item.toLowerCase()}`} className="text-sm text-gray-400 hover:text-white transition-colors">
                  {item}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#667eea] to-[#764ba2] text-sm font-semibold shadow-lg shadow-[#667eea]/25 hover:shadow-xl hover:shadow-[#667eea]/40 hover:scale-105 transition-all"
              >
                Get Started Free
              </button>
            </div>

            <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2 text-gray-400">
              {mobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#0d0d1a] border-t border-white/5"
            >
              <div className="px-4 py-4 space-y-3">
                {['Features', 'Pricing', 'About'].map(item => (
                  <a key={item} href={`#${item.toLowerCase()}`} className="block text-sm text-gray-400 hover:text-white py-2">
                    {item}
                  </a>
                ))}
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#667eea] to-[#764ba2] text-sm font-semibold mt-2"
                >
                  Get Started Free
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-[#667eea]/8 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-[#764ba2]/8 blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#667eea]/3 blur-[200px]" />
        </div>

        {/* Floating notes */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
          <FloatingNote key={i} delay={i * 0.5} x={`${10 + i * 12}%`} size={20 + (i % 3) * 10} />
        ))}

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 mb-8">
              <span className="w-2 h-2 rounded-full bg-[#43e97b] animate-pulse" />
              Now streaming to 50M+ listeners worldwide
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-extrabold leading-[1.05] mb-6">
              <span className="bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
                Music That
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#667eea] via-[#a78bfa] to-[#764ba2] bg-clip-text text-transparent">
                Moves You
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Stream millions of tracks ad-free. Discover new artists. Create playlists that define your vibe. Your soundtrack starts here.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white font-bold text-lg shadow-2xl shadow-[#667eea]/30 hover:shadow-[#667eea]/50 hover:scale-105 transition-all duration-300"
              >
                <Play size={22} fill="currentColor" className="ml-0.5" />
                Start Listening Free
              </button>
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-semibold text-lg hover:bg-white/10 transition-all duration-300"
              >
                Explore Premium
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Waveform */}
            <div className="flex justify-center opacity-40">
              <WaveformVisualizer />
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="grid grid-cols-3 gap-8 mt-16 max-w-lg mx-auto"
          >
            {[
              { value: '80M+', label: 'Tracks' },
              { value: '50M+', label: 'Listeners' },
              { value: '4.9★', label: 'Rating' },
            ].map(stat => (
              <div key={stat.label}>
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Everything You Need
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              A complete music experience designed for the way you listen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Headphones, title: 'Lossless Audio', desc: 'Experience every note in crystal-clear quality. Stream in Hi-Res up to 24-bit/192kHz.', gradient: 'from-[#667eea] to-[#764ba2]' },
              { icon: Zap, title: 'Instant Play', desc: 'Zero buffering, instant playback. Your music starts the moment you hit play.', gradient: 'from-[#43e97b] to-[#38f9d7]' },
              { icon: Globe, title: '80M+ Tracks', desc: 'The world\'s music at your fingertips. From indie gems to chart-toppers.', gradient: 'from-[#4facfe] to-[#00f2fe]' },
              { icon: Music, title: 'Smart Playlists', desc: 'AI-powered recommendations that learn your taste and evolve with you.', gradient: 'from-[#fa709a] to-[#fee140]' },
              { icon: Volume2, title: 'Ad-Free Listening', desc: 'No interruptions. Just pure, uninterrupted music from start to finish.', gradient: 'from-[#a18cd1] to-[#fbc2eb]' },
              { icon: Shield, title: 'Offline Mode', desc: 'Download your favorites and listen anywhere, even without internet.', gradient: 'from-[#ffecd2] to-[#fcb69f]' },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="group p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/10 hover:bg-white/[0.05] transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon size={22} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-24 lg:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Start in Seconds
              </span>
            </h2>
            <p className="text-gray-400 text-lg">Three steps to your perfect soundtrack.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create Your Account', desc: 'Sign up free in seconds. No credit card required.' },
              { step: '02', title: 'Tell Us Your Taste', desc: 'Pick your favorite genres and artists. We\'ll handle the rest.' },
              { step: '03', title: 'Press Play', desc: 'Dive into 80M+ tracks, personalized just for you.' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-5xl font-black bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative py-24 lg:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Simple Pricing
              </span>
            </h2>
            <p className="text-gray-400 text-lg">Start free. Upgrade when you're ready.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free Tier */}
            <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <h3 className="text-lg font-semibold text-gray-300 mb-1">Free</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-white">$0</span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Ad-supported streaming', 'Standard audio quality', 'Create up to 5 playlists', 'Limited skips'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 rounded-xl border border-white/10 text-sm font-semibold text-gray-300 hover:bg-white/5 transition-all"
              >
                Get Started
              </button>
            </div>

            {/* Premium Tier */}
            <div className="relative p-8 rounded-2xl bg-gradient-to-b from-[#667eea]/10 to-[#764ba2]/5 border border-[#667eea]/20">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#667eea] to-[#764ba2] text-xs font-bold text-white shadow-lg">
                MOST POPULAR
              </div>
              <h3 className="text-lg font-semibold text-[#a78bfa] mb-1">Premium</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-white">$9.99</span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Ad-free listening', 'Hi-Res lossless audio', 'Unlimited playlists', 'Unlimited skips', 'Offline downloads', 'Priority support'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#667eea]" />
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#667eea] to-[#764ba2] text-sm font-bold text-white shadow-lg shadow-[#667eea]/25 hover:shadow-xl hover:shadow-[#667eea]/40 transition-all"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Loved by Millions
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Sarah K.', role: 'Music Producer', text: 'The audio quality is unmatched. As a producer, I need to hear every detail — SoundWave delivers.', avatar: 'SK' },
              { name: 'Marcus T.', role: 'DJ & Curator', text: 'The recommendation engine is scary good. It\'s found me more new artists in a month than years of manual digging.', avatar: 'MT' },
              { name: 'Aisha R.', role: 'Podcast Host', text: 'Seamless switching between music and podcasts. The offline mode is a lifesaver on long flights.', avatar: 'AR' },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} size={14} className="text-[#667eea]" fill="currentColor" />
                  ))}
                </div>
                <p className="text-sm text-gray-300 leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-xs font-bold text-white">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative p-12 lg:p-16 rounded-3xl bg-gradient-to-br from-[#667eea]/20 to-[#764ba2]/20 border border-[#667eea]/10 overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#667eea]/10 blur-[80px]" />
              <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-[#764ba2]/10 blur-[60px]" />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4">
                Ready to Listen?
              </h2>
              <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
                Join 50 million listeners already on SoundWave. Your music journey starts now.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white font-bold text-lg shadow-2xl shadow-[#667eea]/30 hover:shadow-[#667eea]/50 hover:scale-105 transition-all duration-300"
              >
                <Play size={22} fill="currentColor" className="ml-0.5" />
                Start Free Today
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white">
                    <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="6" cy="18" r="3" fill="currentColor"/>
                    <circle cx="18" cy="16" r="3" fill="currentColor"/>
                  </svg>
                </div>
                <span className="text-sm font-bold bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">SoundWave</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">Music that moves you.<br />Stream anywhere, anytime.</p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Premium', 'Download'] },
              { title: 'Company', links: ['About', 'Careers', 'Press', 'Blog'] },
              { title: 'Support', links: ['Help Center', 'Community', 'Contact', 'Status'] },
            ].map(col => (
              <div key={col.title}>
                <h4 className="text-sm font-semibold text-gray-400 mb-3">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map(link => (
                    <li key={link}>
                      <a href="#" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-600">© 2026 SoundWave. All rights reserved.</p>
            <div className="flex items-center gap-4">
              {['Privacy', 'Terms', 'Cookies'].map(link => (
                <a key={link} href="#" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">{link}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
