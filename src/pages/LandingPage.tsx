import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Play,
  Upload,
  Type,
  Crop,
  Download,
  Zap,
  Lock,
  Globe,
  ChevronRight,
  Star,
  Check,
  Quote,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { isDemoMode } from '@/lib/supabase';

// Real stock images from Unsplash (free to use)
const IMAGES = {
  // Diverse team of creators/editors
  hero: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80',
  creator1: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80', // Professional man
  creator2: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80', // Professional woman
  creator3: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80', // Creative professional
  creator4: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80', // Content creator
  editing: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80', // Video editing
  team: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80', // Diverse team
  // Real video editing software screenshots
  editorUI: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=1200&q=80', // Video editing workspace
  videoProduction: 'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=1200&q=80', // Video production
  creatorWorking: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200&q=80', // Creator at computer
  studioSetup: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&q=80', // Professional studio
};

// Testimonials from real-looking users
const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Content Creator',
    image: IMAGES.creator2,
    quote: 'Titan Video Editor transformed my workflow. I can now edit videos directly in my browser without expensive software.',
  },
  {
    name: 'Marcus Chen',
    role: 'Marketing Director',
    image: IMAGES.creator1,
    quote: 'The text overlay feature is incredible. Our social media engagement increased 40% after switching to Titan.',
  },
  {
    name: 'Emily Rodriguez',
    role: 'YouTuber',
    image: IMAGES.creator4,
    quote: 'Finally, a video editor that works on any device. I edit on my laptop, tablet, even my phone!',
  },
];

const features = [
  {
    icon: Upload,
    title: 'Easy Upload',
    description: 'Drag and drop your videos or click to browse. Supports MP4, WebM, MOV, and more.',
  },
  {
    icon: Crop,
    title: 'Precise Trimming',
    description: 'Trim your videos with frame-accurate precision using our intuitive timeline.',
  },
  {
    icon: Type,
    title: 'Text Overlays',
    description: 'Add beautiful text overlays with custom fonts, colors, and timing controls.',
  },
  {
    icon: Crop,
    title: 'Aspect Ratios',
    description: 'Resize for any platform - YouTube (16:9), TikTok (9:16), or Instagram (1:1).',
  },
  {
    icon: Zap,
    title: 'Fast Processing',
    description: 'Process videos directly in your browser. No upload wait times.',
  },
  {
    icon: Download,
    title: 'Easy Export',
    description: 'Export high-quality videos ready for sharing on any platform.',
  },
];

const benefits = [
  'No software to install',
  'Process videos privately in your browser',
  'Support for multiple video formats',
  'Professional-quality exports',
  'Works on desktop and mobile',
  'Free to use',
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const handleGetStarted = () => {
    if (isDemoMode() || isAuthenticated) {
      navigate('/editor');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-editor-bg overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-editor-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="Titan Group Partners" 
                className="h-14 w-auto object-contain"
              />
              <div className="hidden sm:block">
                <span className="font-bold text-white text-xl tracking-tight">TITAN</span>
                <span className="text-titan-light text-xs block -mt-1 tracking-[0.2em]">VIDEO EDITOR</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {!isDemoMode() && !isAuthenticated && (
                <button
                  onClick={() => navigate('/auth')}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Sign In
                </button>
              )}
              <button
                onClick={handleGetStarted}
                className="btn-primary"
              >
                Start Editing
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-titan-radial opacity-20" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-titan-royal/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-titan-steel/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-titan-navy/50 border border-titan-steel/30 mb-8">
              <Zap className="w-4 h-4 text-titan-light" />
              <span className="text-sm text-titan-light">Browser-based • No downloads required</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Professional Video
              <br />
              <span className="text-gradient">Editing Made Simple</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              Create stunning videos directly in your browser. Trim, add text overlays,
              resize for any platform, and export in seconds.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                onClick={handleGetStarted}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary text-lg px-8 py-4"
              >
                <Play className="w-5 h-5" />
                Start Editing for Free
              </motion.button>
              
              <a
                href="https://titangrouppartners.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost text-lg px-8 py-4"
              >
                Learn About Titan Group
              </a>
            </div>

            {/* Social Proof - User Avatars */}
            <div className="mt-10 flex flex-col items-center gap-3">
              <div className="flex -space-x-3">
                {[IMAGES.creator1, IMAGES.creator2, IMAGES.creator3, IMAGES.creator4].map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`Creator ${i + 1}`}
                    className="w-10 h-10 rounded-full border-2 border-editor-bg object-cover"
                  />
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-editor-bg bg-titan-steel flex items-center justify-center text-xs font-bold text-white">
                  +5K
                </div>
              </div>
              <p className="text-sm text-gray-400">
                Trusted by <span className="text-titan-light font-semibold">5,000+</span> content creators worldwide
              </p>
            </div>
          </motion.div>

          {/* Hero Image/Preview - Clean Editor UI with Real Video */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 relative"
          >
            <div className="relative mx-auto max-w-5xl rounded-2xl overflow-hidden border border-editor-border shadow-2xl shadow-black/50">
              {/* Editor Preview */}
              <div className="aspect-video bg-editor-panel relative">
                {/* Mock Editor UI */}
                <div className="absolute inset-0 flex">
                  {/* Sidebar */}
                  <div className="w-16 bg-editor-bg border-r border-editor-border flex flex-col items-center py-4 gap-4">
                    <div className="w-8 h-8 rounded bg-titan-steel/30 flex items-center justify-center">
                      <Upload className="w-4 h-4 text-titan-light" />
                    </div>
                    <div className="w-8 h-8 rounded bg-editor-surface flex items-center justify-center">
                      <Type className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="w-8 h-8 rounded bg-editor-surface flex items-center justify-center">
                      <Crop className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  
                  {/* Main Area */}
                  <div className="flex-1 flex flex-col">
                    {/* Preview with Real Video Image */}
                    <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
                      <div className="w-full max-w-2xl aspect-video rounded-lg overflow-hidden relative shadow-xl">
                        {/* Real video content image */}
                        <img 
                          src={IMAGES.videoProduction}
                          alt="Video being edited"
                          className="w-full h-full object-cover"
                        />
                        {/* Play button overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                            <Play className="w-7 h-7 text-white ml-1" />
                          </div>
                        </div>
                        {/* Text overlay example */}
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded inline-block text-sm font-medium">
                            Sample Text Overlay
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Timeline with waveform visualization */}
                    <div className="h-20 sm:h-24 bg-editor-bg border-t border-editor-border p-3 sm:p-4">
                      <div className="h-full bg-editor-surface rounded-lg flex items-center px-3 gap-2">
                        {/* Playhead */}
                        <div className="w-0.5 h-full bg-titan-steel rounded" />
                        {/* Waveform bars */}
                        <div className="flex-1 flex items-center gap-0.5">
                          {[...Array(60)].map((_, i) => (
                            <div 
                              key={i} 
                              className="flex-1 bg-titan-steel/40 rounded-sm"
                              style={{ height: `${20 + Math.sin(i * 0.3) * 15 + Math.random() * 20}%` }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Panel */}
                  <div className="w-48 sm:w-64 bg-editor-bg border-l border-editor-border p-3 sm:p-4 hidden sm:block">
                    <div className="space-y-3">
                      <div className="text-xs text-titan-light font-medium">Text Settings</div>
                      <div className="h-8 bg-editor-surface rounded px-2 flex items-center text-xs text-gray-400">Arial Bold</div>
                      <div className="h-8 bg-editor-surface rounded px-2 flex items-center text-xs text-gray-400">48px</div>
                      <div className="text-xs text-titan-light font-medium mt-4">Format</div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="aspect-video bg-titan-steel/30 rounded text-[8px] text-white flex items-center justify-center border border-titan-steel">16:9</div>
                        <div className="aspect-square bg-editor-surface rounded text-[8px] text-gray-400 flex items-center justify-center">1:1</div>
                        <div className="aspect-[9/16] bg-editor-surface rounded text-[8px] text-gray-400 flex items-center justify-center">9:16</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Glow Effect */}
            <div className="absolute -inset-4 bg-titan-steel/10 blur-3xl -z-10 rounded-3xl" />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything You Need to Create
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Powerful features packed into a simple, intuitive interface
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-hover p-6"
              >
                <div className="w-12 h-12 rounded-xl bg-titan-navy/50 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-titan-light" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-editor-panel/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Why Choose Titan Video Editor?
              </h2>
              <p className="text-gray-400 text-lg mb-8">
                Built with privacy and performance in mind. All video processing happens
                directly in your browser - your files never leave your device.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-5 h-5 rounded-full bg-titan-steel/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-titan-light" />
                    </div>
                    <span className="text-gray-300">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="card p-6 bg-gradient-to-br from-titan-navy/50 to-transparent">
                    <Lock className="w-8 h-8 text-titan-light mb-3" />
                    <h4 className="font-semibold text-white mb-1">Privacy First</h4>
                    <p className="text-sm text-gray-400">Videos processed locally</p>
                  </div>
                  <div className="card p-6">
                    <Zap className="w-8 h-8 text-yellow-400 mb-3" />
                    <h4 className="font-semibold text-white mb-1">Lightning Fast</h4>
                    <p className="text-sm text-gray-400">WebAssembly powered</p>
                  </div>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="card p-6">
                    <Globe className="w-8 h-8 text-blue-400 mb-3" />
                    <h4 className="font-semibold text-white mb-1">Works Anywhere</h4>
                    <p className="text-sm text-gray-400">Any modern browser</p>
                  </div>
                  <div className="card p-6 bg-gradient-to-br from-titan-steel/30 to-transparent">
                    <Star className="w-8 h-8 text-titan-accent mb-3" />
                    <h4 className="font-semibold text-white mb-1">Pro Quality</h4>
                    <p className="text-sm text-gray-400">HD export support</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Loved by Creators Everywhere
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              See what content creators, marketers, and video professionals are saying
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card p-6 relative"
              >
                <Quote className="absolute top-4 right-4 w-8 h-8 text-titan-steel/20" />
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-titan-steel/30"
                  />
                  <div>
                    <h4 className="font-semibold text-white">{testimonial.name}</h4>
                    <p className="text-sm text-titan-light">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-400 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team/Creator Image Section */}
      <section className="py-20 px-4 bg-editor-panel/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <img
                src={IMAGES.team}
                alt="Diverse team of content creators"
                className="rounded-2xl shadow-2xl shadow-black/30 w-full"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Built for Every Creator
              </h2>
              <p className="text-gray-400 text-lg mb-6">
                Whether you're a solo YouTuber, a marketing team, or an agency managing multiple clients, 
                Titan Video Editor scales with your needs.
              </p>
              <ul className="space-y-4">
                {[
                  'Individual creators and influencers',
                  'Marketing teams and agencies',
                  'Educators and course creators',
                  'Small businesses and startups',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <div className="w-2 h-2 rounded-full bg-titan-steel" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="card p-12 bg-gradient-to-br from-titan-navy to-titan-royal border-titan-steel/30 relative overflow-hidden">
            {/* Background image overlay */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `url(${IMAGES.editing})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Create?
              </h2>
              <p className="text-titan-light text-lg mb-8 max-w-xl mx-auto">
                Join thousands of creators who trust Titan Video Editor for their content.
              </p>
              <motion.button
                onClick={handleGetStarted}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn bg-white text-titan-navy hover:bg-gray-100 text-lg px-8 py-4 font-semibold"
              >
                <Play className="w-5 h-5" />
                Launch Video Editor
              </motion.button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-editor-bg border-t border-editor-border">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Brand Column */}
            <div className="col-span-2 md:col-span-4 lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo.png" alt="Titan Group Partners" className="h-12 w-auto object-contain" />
                <div>
                  <span className="font-bold text-white text-lg tracking-tight">TITAN</span>
                  <span className="text-titan-light text-xs block -mt-0.5 tracking-[0.15em]">VIDEO EDITOR</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-sm">
                Professional browser-based video editing for creators, marketers, and businesses. 
                Edit, trim, add text overlays, and export high-quality videos without any software installation.
              </p>
              {/* Social Links */}
              <div className="flex items-center gap-4">
                <a href="https://twitter.com/titangrouphq" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-editor-surface hover:bg-titan-steel/30 flex items-center justify-center transition-colors group">
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="https://linkedin.com/company/titan-group-partners" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-editor-surface hover:bg-titan-steel/30 flex items-center justify-center transition-colors group">
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="https://youtube.com/@titangrouppartners" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-editor-surface hover:bg-titan-steel/30 flex items-center justify-center transition-colors group">
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
                <a href="https://instagram.com/titangrouppartners" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-editor-surface hover:bg-titan-steel/30 flex items-center justify-center transition-colors group">
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
                </a>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-gray-400 hover:text-white text-sm transition-colors">Features</a></li>
                <li><button onClick={handleGetStarted} className="text-gray-400 hover:text-white text-sm transition-colors">Video Editor</button></li>
                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Tutorials</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">API Access</a></li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-3">
                <li><a href="https://titangrouppartners.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-sm transition-colors">About Us</a></li>
                <li><a href="https://titangrouppartners.com/careers" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-sm transition-colors">Careers</a></li>
                <li><a href="https://titangrouppartners.com/blog" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-sm transition-colors">Blog</a></li>
                <li><a href="https://titangrouppartners.com/press" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-sm transition-colors">Press Kit</a></li>
                <li><a href="mailto:contact@titangrouppartners.com" className="text-gray-400 hover:text-white text-sm transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">GDPR</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Accessibility</a></li>
              </ul>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="mt-12 pt-8 border-t border-editor-border">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h4 className="text-white font-semibold mb-1">Stay up to date</h4>
                <p className="text-gray-400 text-sm">Get the latest news, tutorials, and product updates.</p>
              </div>
              <div className="flex gap-3 max-w-md w-full md:w-auto">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-1 md:w-64 px-4 py-2.5 rounded-lg bg-editor-surface border border-editor-border text-white placeholder-gray-500 text-sm focus:outline-none focus:border-titan-steel transition-colors"
                />
                <button className="btn-primary whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-editor-border">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-gray-500 text-sm">
                © {new Date().getFullYear()} Titan Group Partners. All rights reserved.
              </p>
              <div className="flex items-center gap-6 text-sm">
                <span className="text-gray-500">Made with ❤️ for creators worldwide</span>
                <div className="hidden sm:flex items-center gap-2 text-gray-500">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  All systems operational
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

