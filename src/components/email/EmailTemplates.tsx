import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Mail, CheckCircle, Clock, User, Video } from 'lucide-react';

type TemplateType = 'welcome' | 'pending' | 'google_signin' | 'export_complete' | 'password_reset';

const templates: Record<TemplateType, { subject: string; preview: string }> = {
  welcome: { subject: 'Welcome to Titan Video Editor!', preview: 'Your account has been created successfully.' },
  pending: { subject: 'You have unfinished projects', preview: 'Don\'t forget to complete your video project.' },
  google_signin: { subject: 'New sign-in to your account', preview: 'We detected a new sign-in from Google.' },
  export_complete: { subject: 'Your video is ready!', preview: 'Your exported video is ready to download.' },
  password_reset: { subject: 'Reset your password', preview: 'Click here to reset your password.' },
};

export default function EmailTemplates({ onClose }: { onClose: () => void }) {
  const [activeTemplate, setActiveTemplate] = useState<TemplateType>('welcome');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-editor-panel rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden border border-editor-border"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-editor-border">
          <div className="flex items-center gap-3">
            <Mail className="w-6 h-6 text-titan-light" />
            <div>
              <h2 className="text-xl font-semibold text-white">Email Templates</h2>
              <p className="text-sm text-gray-400">Preview notification email designs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-editor-surface rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex h-[70vh]">
          {/* Template List */}
          <div className="w-64 border-r border-editor-border p-4 space-y-2">
            {Object.entries(templates).map(([key, template]) => (
              <button
                key={key}
                onClick={() => setActiveTemplate(key as TemplateType)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  activeTemplate === key
                    ? 'bg-titan-navy/50 border border-titan-steel'
                    : 'hover:bg-editor-surface border border-transparent'
                }`}
              >
                <p className="text-white text-sm font-medium truncate">{template.subject}</p>
                <p className="text-gray-500 text-xs truncate mt-1">{template.preview}</p>
              </button>
            ))}
          </div>

          {/* Email Preview */}
          <div className="flex-1 p-6 overflow-auto bg-gray-100">
            <div className="max-w-xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Email Render */}
              {activeTemplate === 'welcome' && <WelcomeEmail />}
              {activeTemplate === 'pending' && <PendingProjectEmail />}
              {activeTemplate === 'google_signin' && <GoogleSignInEmail />}
              {activeTemplate === 'export_complete' && <ExportCompleteEmail />}
              {activeTemplate === 'password_reset' && <PasswordResetEmail />}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Welcome Email
function WelcomeEmail() {
  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0d1b4d] to-[#1a3a7a] p-8 text-center">
        <img src="/logo.png" alt="Titan" className="h-16 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white">Welcome to Titan Video Editor!</h1>
      </div>
      {/* Body */}
      <div className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-gray-900 font-medium">Account Created Successfully</p>
            <p className="text-gray-500 text-sm">Your journey starts now!</p>
          </div>
        </div>
        <p className="text-gray-600 mb-6">
          Hi there,<br /><br />
          Thank you for joining Titan Video Editor! Your account has been created successfully and you're ready to start creating amazing videos.
        </p>
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-500 mb-2">Quick Start Tips:</p>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#4a6eb5] text-white text-xs flex items-center justify-center">1</span>
              Upload your first video
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#4a6eb5] text-white text-xs flex items-center justify-center">2</span>
              Add text overlays and trim
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#4a6eb5] text-white text-xs flex items-center justify-center">3</span>
              Export in HD quality
            </li>
          </ul>
        </div>
        <a href="#" className="block w-full bg-gradient-to-r from-[#4a6eb5] to-[#6b87c7] text-white text-center py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
          Start Editing Now
        </a>
      </div>
      {/* Footer */}
      <EmailFooter />
    </div>
  );
}

// Pending Project Email
function PendingProjectEmail() {
  return (
    <div>
      <div className="bg-gradient-to-r from-[#0d1b4d] to-[#1a3a7a] p-8 text-center">
        <img src="/logo.png" alt="Titan" className="h-16 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white">Don't Forget Your Project!</h1>
      </div>
      <div className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-gray-900 font-medium">Unfinished Project Waiting</p>
            <p className="text-gray-500 text-sm">Last edited 3 days ago</p>
          </div>
        </div>
        <p className="text-gray-600 mb-6">
          Hi there,<br /><br />
          You have an unfinished video project that's waiting for you. Don't let your creativity go to waste!
        </p>
        <div className="bg-gray-50 rounded-lg p-4 mb-6 flex items-center gap-4">
          <div className="w-24 h-16 rounded bg-gray-200 flex items-center justify-center">
            <Video className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <p className="text-gray-900 font-medium">My Video Project</p>
            <p className="text-gray-500 text-sm">Duration: 2:34 • 65% complete</p>
          </div>
        </div>
        <a href="#" className="block w-full bg-gradient-to-r from-[#4a6eb5] to-[#6b87c7] text-white text-center py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
          Continue Editing
        </a>
      </div>
      <EmailFooter />
    </div>
  );
}

// Google Sign In Email
function GoogleSignInEmail() {
  return (
    <div>
      <div className="bg-gradient-to-r from-[#0d1b4d] to-[#1a3a7a] p-8 text-center">
        <img src="/logo.png" alt="Titan" className="h-16 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white">New Sign-In Detected</h1>
      </div>
      <div className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-gray-900 font-medium">Google Sign-In</p>
            <p className="text-gray-500 text-sm">December 28, 2025 at 3:45 PM</p>
          </div>
        </div>
        <p className="text-gray-600 mb-6">
          Hi there,<br /><br />
          We noticed a new sign-in to your Titan Video Editor account using Google authentication.
        </p>
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-500 mb-2">Sign-in Details:</p>
          <ul className="text-sm text-gray-600 space-y-2">
            <li><strong>Device:</strong> Chrome on macOS</li>
            <li><strong>Location:</strong> Lagos, Nigeria</li>
            <li><strong>IP Address:</strong> 197.***.***.45</li>
          </ul>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          If this was you, no action is needed. If you didn't sign in, please secure your account immediately.
        </p>
        <a href="#" className="block w-full bg-red-500 text-white text-center py-3 rounded-lg font-medium hover:bg-red-600 transition-colors">
          Secure My Account
        </a>
      </div>
      <EmailFooter />
    </div>
  );
}

// Export Complete Email
function ExportCompleteEmail() {
  return (
    <div>
      <div className="bg-gradient-to-r from-[#0d1b4d] to-[#1a3a7a] p-8 text-center">
        <img src="/logo.png" alt="Titan" className="h-16 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white">Your Video is Ready!</h1>
      </div>
      <div className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-gray-900 font-medium">Export Complete</p>
            <p className="text-gray-500 text-sm">HD Quality • MP4 Format</p>
          </div>
        </div>
        <p className="text-gray-600 mb-6">
          Great news! Your video has been successfully exported and is ready for download.
        </p>
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-500 mb-2">Export Details:</p>
          <ul className="text-sm text-gray-600 space-y-2">
            <li><strong>File Name:</strong> my-video-final.mp4</li>
            <li><strong>Resolution:</strong> 1920x1080 (Full HD)</li>
            <li><strong>Duration:</strong> 2:34</li>
            <li><strong>Size:</strong> 45.2 MB</li>
          </ul>
        </div>
        <a href="#" className="block w-full bg-gradient-to-r from-[#4a6eb5] to-[#6b87c7] text-white text-center py-3 rounded-lg font-medium hover:opacity-90 transition-opacity mb-3">
          Download Video
        </a>
        <p className="text-xs text-center text-gray-400">
          This download link expires in 7 days
        </p>
      </div>
      <EmailFooter />
    </div>
  );
}

// Password Reset Email
function PasswordResetEmail() {
  return (
    <div>
      <div className="bg-gradient-to-r from-[#0d1b4d] to-[#1a3a7a] p-8 text-center">
        <img src="/logo.png" alt="Titan" className="h-16 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white">Reset Your Password</h1>
      </div>
      <div className="p-8">
        <p className="text-gray-600 mb-6">
          Hi there,<br /><br />
          We received a request to reset your password for your Titan Video Editor account. Click the button below to set a new password.
        </p>
        <a href="#" className="block w-full bg-gradient-to-r from-[#4a6eb5] to-[#6b87c7] text-white text-center py-3 rounded-lg font-medium hover:opacity-90 transition-opacity mb-4">
          Reset Password
        </a>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-amber-800">
            ⚠️ This link expires in 1 hour. If you didn't request this, please ignore this email.
          </p>
        </div>
        <p className="text-sm text-gray-500">
          If the button doesn't work, copy and paste this link into your browser:<br />
          <span className="text-blue-600 break-all">https://titanvideoeditor.com/reset?token=abc123...</span>
        </p>
      </div>
      <EmailFooter />
    </div>
  );
}

// Shared Footer
function EmailFooter() {
  return (
    <div className="bg-gray-50 px-8 py-6 border-t border-gray-100">
      <div className="text-center">
        <img src="/logo.png" alt="Titan" className="h-8 mx-auto mb-3 opacity-50" />
        <p className="text-xs text-gray-400 mb-2">
          Titan Video Editor by Titan Group Partners
        </p>
        <div className="flex items-center justify-center gap-4 text-xs text-gray-400 mb-3">
          <a href="#" className="hover:text-gray-600">Privacy Policy</a>
          <span>•</span>
          <a href="#" className="hover:text-gray-600">Terms of Service</a>
          <span>•</span>
          <a href="#" className="hover:text-gray-600">Unsubscribe</a>
        </div>
        <p className="text-xs text-gray-400">
          © 2025 Titan Group Partners. All rights reserved.<br />
          123 Business Avenue, Tech City, TC 12345
        </p>
      </div>
    </div>
  );
}

