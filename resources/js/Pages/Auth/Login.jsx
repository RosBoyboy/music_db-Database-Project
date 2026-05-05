import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Music, Loader2 } from 'lucide-react';

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { errors } = usePage().props;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) { setError('Email is required'); return; }
    if (!password.trim()) { setError('Password is required'); return; }
    if (isSignup && !name.trim()) { setError('Name is required'); return; }

    setLoading(true);
    
    const url = isSignup ? '/register' : '/login';
    const data = isSignup ? { name, email, password } : { email, password };

    router.post(url, data, {
      onError: (errors) => {
        setLoading(false);
        // Show the first error message
        if (Object.values(errors).length > 0) {
          setError(Object.values(errors)[0]);
        }
      },
      onFinish: () => setLoading(false)
    });
  };

  const handleDemoLogin = () => {
    setLoading(true);
    router.post('/demo-login', {}, {
      onError: (errors) => {
        setLoading(false);
        if (Object.values(errors).length > 0) {
          setError(Object.values(errors)[0]);
        }
      },
      onFinish: () => setLoading(false)
    });
  };

  return (
    <div className="min-h-screen bg-[#07070f] flex">
      <Head title={isSignup ? 'Create Account' : 'Login'} />
      
      {/* Left side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#667eea]/20 via-[#07070f] to-[#764ba2]/20" />

        {/* Animated circles */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#667eea]/5 blur-[80px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#764ba2]/5 blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/[0.03]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-white/[0.03]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full border border-white/[0.03]" />
        </div>

        {/* Sound wave decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-end gap-2 opacity-30">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="w-2 rounded-full bg-gradient-to-t from-[#667eea] to-[#764ba2] animate-pulse"
              style={{
                height: `${30 + Math.sin(i * 0.4) * 40 + Math.random() * 20}px`,
                animationDelay: `${i * 0.08}s`,
                animationDuration: `${1.5 + Math.random() * 1}s`,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
          <div className="max-w-md text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-[#667eea]/30">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="6" cy="18" r="3" fill="currentColor"/>
                <circle cx="18" cy="16" r="3" fill="currentColor"/>
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Your music, <br />
              <span className="bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">your way</span>
            </h2>
            <p className="text-gray-400 leading-relaxed">
              Stream 80 million tracks ad-free. Discover new artists. Create playlists that define your vibe.
            </p>

            {/* Feature list */}
            <div className="mt-10 space-y-4 text-left">
              {[
                { icon: '🎵', text: 'Lossless Hi-Res audio quality' },
                { icon: '🎧', text: 'Ad-free listening experience' },
                { icon: '📱', text: 'Offline downloads anywhere' },
                { icon: '✨', text: 'AI-powered recommendations' },
              ].map((feature, i) => (
                <motion.div
                  key={feature.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-lg">{feature.icon}</span>
                  <span className="text-sm text-gray-300">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo for mobile */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
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

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {isSignup ? 'Create account' : 'Welcome back'}
            </h1>
            <p className="text-gray-400 text-sm">
              {isSignup
                ? 'Start your music journey with SoundWave'
                : 'Sign in to continue to SoundWave'
              }
            </p>
          </div>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 px-4 py-3 rounded-lg bg-[#ff0000]/10 border border-[#ff0000]/20 text-sm text-[#ff6b6b]"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {isSignup && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Name</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717171]" />
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full pl-11 pr-4 py-3 rounded-lg bg-[#1f1f1f] border border-[#303030] text-sm text-white placeholder-[#717171] focus:outline-none focus:border-[#667eea] focus:ring-1 focus:ring-[#667eea]/30 transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717171]" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-lg bg-[#1f1f1f] border border-[#303030] text-sm text-white placeholder-[#717171] focus:outline-none focus:border-[#667eea] focus:ring-1 focus:ring-[#667eea]/30 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-300">Password</label>
                {!isSignup && (
                  <button type="button" className="text-xs text-[#667eea] hover:text-[#8b9cf7] transition-colors">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717171]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 rounded-lg bg-[#1f1f1f] border border-[#303030] text-sm text-white placeholder-[#717171] focus:outline-none focus:border-[#667eea] focus:ring-1 focus:ring-[#667eea]/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#717171] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-lg bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white font-semibold text-sm shadow-lg shadow-[#667eea]/25 hover:shadow-xl hover:shadow-[#667eea]/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  {isSignup ? 'Create Account' : 'Sign In'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-[#303030]" />
            <span className="text-xs text-[#717171] uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-[#303030]" />
          </div>

          {/* Social logins */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-lg bg-[#1f1f1f] border border-[#303030] text-sm font-medium text-white hover:bg-[#282828] hover:border-[#404040] transition-all disabled:opacity-50"
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center">
                <Music size={12} className="text-white" />
              </div>
              Continue with Demo Account
            </button>

            <button
              type="button"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-lg bg-[#1f1f1f] border border-[#303030] text-sm font-medium text-white hover:bg-[#282828] hover:border-[#404040] transition-all disabled:opacity-50"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <button
              type="button"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-lg bg-[#1f1f1f] border border-[#303030] text-sm font-medium text-white hover:bg-[#282828] hover:border-[#404040] transition-all disabled:opacity-50"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.18 0-.36-.02-.53-.06-.01-.18-.04-.56-.04-.95 0-1.12.535-2.22 1.235-3.01.75-.85 2.04-1.55 2.93-1.6.04.2.07.6.07.97h-.5zM19.235 16.43c-.49 1.14-.723 1.65-1.352 2.65-.878 1.4-2.116 3.14-3.65 3.16-1.362.01-1.712-.89-3.562-.88-1.85.01-2.23.9-3.592.88-1.534-.02-2.703-1.58-3.58-2.98-2.458-3.88-2.715-8.43-1.2-10.86 1.082-1.73 2.79-2.74 4.39-2.74 1.632 0 2.662.89 4.012.89 1.31 0 2.108-.89 3.992-.89 1.42 0 2.93.77 4.01 2.1-3.52 1.93-2.95 6.96.592 8.3z"/>
              </svg>
              Continue with Apple
            </button>
          </div>

          {/* Toggle signup/login */}
          <div className="mt-8 text-center">
            <p className="text-sm text-[#717171]">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => { setIsSignup(!isSignup); setError(''); }}
                className="text-[#667eea] hover:text-[#8b9cf7] font-medium transition-colors"
                type="button"
              >
                {isSignup ? 'Sign in' : 'Sign up for free'}
              </button>
            </p>
          </div>

          {/* Terms */}
          <p className="mt-6 text-xs text-[#717171] text-center leading-relaxed">
            By continuing, you agree to SoundWave's{' '}
            <a href="#" className="text-[#aaaaaa] hover:text-white transition-colors">Terms of Service</a>{' '}
            and{' '}
            <a href="#" className="text-[#aaaaaa] hover:text-white transition-colors">Privacy Policy</a>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
