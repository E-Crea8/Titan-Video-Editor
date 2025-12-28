import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, Loader2, Play } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { isDemoMode } from '@/lib/supabase';
import toast from 'react-hot-toast';

// Real background images
const AUTH_IMAGES = {
  bg: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=1920&q=80', // Video production
  overlay: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1920&q=80', // Video editing
};

type AuthMode = 'signin' | 'signup' | 'forgot';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, signInWithGoogle, resetPassword, isLoading, error, clearError } = useAuthStore();

  const [mode, setMode] = useState<AuthMode>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });

  // Get redirect path from location state
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/editor';

  // Handle demo mode
  if (isDemoMode()) {
    return (
      <div className="min-h-screen bg-editor-bg flex items-center justify-center px-4 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-titan-radial opacity-30" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-titan-royal/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-titan-steel/20 rounded-full blur-3xl" />
        
        <div className="text-center relative z-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img src="/logo.png" alt="Titan Group Partners" className="h-20 w-auto" />
            <div className="text-left">
              <span className="font-bold text-3xl text-white tracking-tight">TITAN</span>
              <span className="text-titan-light text-sm block -mt-1 tracking-[0.2em]">VIDEO EDITOR</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Demo Mode Active</h1>
          <p className="text-gray-400 mb-6 max-w-md">
            Authentication is not configured. To enable user authentication, add your Supabase credentials to the environment variables.
          </p>
          <button
            onClick={() => navigate('/editor')}
            className="btn-primary"
          >
            Continue to Editor
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      if (mode === 'signin') {
        const result = await signIn(formData.email, formData.password);
        if (result.success) {
          toast.success('Welcome back!');
          navigate(from, { replace: true });
        } else {
          toast.error(result.error || 'Sign in failed');
        }
      } else if (mode === 'signup') {
        const result = await signUp(formData.email, formData.password, formData.name);
        if (result.success) {
          toast.success('Account created! Please check your email to verify.');
        } else {
          toast.error(result.error || 'Sign up failed');
        }
      } else if (mode === 'forgot') {
        const result = await resetPassword(formData.email);
        if (result.success) {
          toast.success('Password reset email sent!');
          setMode('signin');
        } else {
          toast.error(result.error || 'Failed to send reset email');
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      toast.error('An unexpected error occurred');
    }
  };

  const handleGoogleSignIn = async () => {
    clearError();
    const result = await signInWithGoogle();
    if (!result.success) {
      toast.error(result.error || 'Google sign in failed');
    }
  };

  const switchMode = (newMode: AuthMode) => {
    clearError();
    setMode(newMode);
    setFormData({ email: '', password: '', name: '' });
  };

  return (
    <div className="min-h-screen bg-editor-bg flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </button>

          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <img src="/logo.png" alt="Titan Group Partners" className="h-16 w-auto object-contain" />
            <div>
              <span className="font-bold text-2xl text-white tracking-tight">TITAN</span>
              <span className="text-titan-light text-xs block -mt-1 tracking-[0.2em]">VIDEO EDITOR</span>
            </div>
          </div>

          {/* Title */}
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-3xl font-bold text-white mb-2">
                {mode === 'signin' && 'Welcome back'}
                {mode === 'signup' && 'Create an account'}
                {mode === 'forgot' && 'Reset password'}
              </h1>
              <p className="text-gray-400 mb-8">
                {mode === 'signin' && 'Sign in to access your projects'}
                {mode === 'signup' && 'Start creating amazing videos'}
                {mode === 'forgot' && "We'll send you a reset link"}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name field (signup only) */}
            <AnimatePresence>
              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input pl-12"
                      placeholder="John Doe"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input pl-12"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <AnimatePresence>
              {mode !== 'forgot' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="input pl-12 pr-12"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Forgot password link */}
            {mode === 'signin' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  className="text-sm text-titan-light hover:text-titan-accent transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {mode === 'signin' && 'Sign In'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'forgot' && 'Send Reset Link'}
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          {mode !== 'forgot' && (
            <>
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-editor-border" />
                <span className="text-gray-500 text-sm">or continue with</span>
                <div className="flex-1 h-px bg-editor-border" />
              </div>

              {/* Google Sign In */}
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="btn-secondary w-full py-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>
            </>
          )}

          {/* Mode Switch */}
          <p className="text-center text-gray-400 mt-6">
            {mode === 'signin' && (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => switchMode('signup')}
                  className="text-titan-light hover:text-titan-accent transition-colors"
                >
                  Sign up
                </button>
              </>
            )}
            {mode === 'signup' && (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => switchMode('signin')}
                  className="text-titan-light hover:text-titan-accent transition-colors"
                >
                  Sign in
                </button>
              </>
            )}
            {mode === 'forgot' && (
              <>
                Remember your password?{' '}
                <button
                  onClick={() => switchMode('signin')}
                  className="text-titan-light hover:text-titan-accent transition-colors"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </motion.div>
      </div>

      {/* Right Side - Real Image Background */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12 relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${AUTH_IMAGES.bg})` }}
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-titan-navy/90 via-titan-navy/80 to-titan-royal/70" />
        
        {/* Content */}
        <div className="relative z-10 text-center max-w-md">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <img src="/logo.png" alt="Titan Group Partners" className="h-32 w-auto mx-auto" />
          </motion.div>
          
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-white mb-4"
          >
            Titan Video Editor
          </motion.h2>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-titan-light text-lg mb-8"
          >
            Professional video editing in your browser. Create stunning content
            with our powerful, easy-to-use tools.
          </motion.p>

          {/* Feature Pills */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-2"
          >
            {['Trim & Cut', 'Text Overlays', 'HD Export', 'No Install'].map((feature) => (
              <span key={feature} className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm border border-white/20">
                {feature}
              </span>
            ))}
          </motion.div>

          {/* Play Demo */}
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            onClick={() => navigate('/editor')}
            className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm text-white border border-white/30 hover:bg-white/20 transition-colors"
          >
            <Play className="w-4 h-4" />
            Try Demo
          </motion.button>
        </div>
      </div>
    </div>
  );
}

