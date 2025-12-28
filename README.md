# 🏛️ Titan Video Editor

> Professional browser-based video editing software by **Titan Group Partners**

[![Netlify Status](https://api.netlify.com/api/v1/badges/your-badge-id/deploy-status)](https://app.netlify.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb.svg)](https://reactjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

![Titan Video Editor Screenshot](./docs/screenshot.png)

## 🎬 Overview

Titan Video Editor is a fully functional, browser-based video editing application that enables users to upload, edit, and export videos through a clean and intuitive interface. Built with modern web technologies, it processes videos entirely in the browser using WebAssembly-powered FFmpeg.

**🔗 Live Demo:** [https://titan-video-editor.netlify.app](https://titan-video-editor.netlify.app)

**🏢 Company:** [Titan Group Partners](https://titangrouppartners.com/)

## ✨ Features

### Video Upload & Management
- ✅ Drag-and-drop file upload
- ✅ File selection fallback
- ✅ Automatic metadata extraction (duration, resolution, FPS)
- ✅ Support for MP4, WebM, MOV, AVI, MKV formats
- ✅ File size validation (up to 500MB)

### Timeline & Trimming
- ✅ Visual timeline with waveform representation
- ✅ Draggable playhead for precise navigation
- ✅ Start/end trim handles
- ✅ Real-time synchronization with video playback
- ✅ Keyboard shortcuts for seeking
- ✅ Zoom controls for timeline precision

### Text Overlay Editing
- ✅ Add multiple text overlays
- ✅ **Drag to reposition** on canvas with visual feedback
- ✅ **Hover tooltips** showing text properties
- ✅ 20+ font families with **search functionality**
- ✅ Customize font size and weight
- ✅ Color picker for text styling
- ✅ Text alignment (left, center, right)
- ✅ Timing controls for appearance duration
- ✅ Opacity adjustment
- ✅ Double-click to edit text

### Aspect Ratio & Resizing
- ✅ Landscape (16:9) - YouTube, standard video
- ✅ Portrait (9:16) - TikTok, Instagram Reels, Stories
- ✅ Square (1:1) - Instagram posts
- ✅ Live preview of format changes

### Rendering & Export
- ✅ Client-side video processing with FFmpeg.wasm
- ✅ Multiple quality presets (Low, Medium, High, Ultra)
- ✅ Asynchronous export with progress indication
- ✅ Direct download of rendered video
- ✅ Text overlays burned into video

### User Experience
- ✅ Beautiful, responsive UI with Titan brand colors
- ✅ **Dark & Light theme** with system preference detection
- ✅ Theme persistence across sessions
- ✅ Loading states and progress indicators
- ✅ Toast notifications for user feedback
- ✅ Keyboard shortcuts throughout
- ✅ Undo/Redo support
- ✅ Help modal with documentation
- ✅ Settings modal with customization options

### Authentication
- ✅ User registration and login
- ✅ **Google OAuth integration**
- ✅ Password reset functionality
- ✅ Profile picture display from Google
- ✅ **Account deletion** with confirmation modal
- ✅ Demo mode (works without auth)

### Admin Dashboard
- ✅ Secure admin login
- ✅ **Real-time user management** from Supabase
- ✅ User statistics and analytics
- ✅ User actions: view, ban, activate, delete
- ✅ **Feature toggles** for app-wide control
- ✅ Email configuration settings
- ✅ **Email template previews** (5 templates)
- ✅ Search and filter users
- ✅ Pagination for user lists

### Email Notifications (Templates)
- ✅ Welcome email on account creation
- ✅ Pending project reminders
- ✅ Google sign-in security alerts
- ✅ Export completion notifications
- ✅ Password reset emails

## 🔐 Admin Access

Access the admin dashboard at `/admin`:

| Credential | Value |
|------------|-------|
| **Email** | `admin@titangrouppartners.com` |
| **Password** | `TitanAdmin2025!` |

## 🛠️ Technology Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI Framework |
| **TypeScript** | Type Safety |
| **Vite** | Build Tool & Dev Server |
| **Tailwind CSS** | Styling |
| **Zustand** | State Management |
| **FFmpeg.wasm** | Client-side Video Processing |
| **Framer Motion** | Animations |
| **Supabase** | Authentication & Database |
| **React Router** | Navigation |
| **React Hot Toast** | Notifications |
| **Lucide React** | Icons |

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/titan-group-partners/titan-video-editor.git
   cd titan-video-editor
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   
   Copy `env.example.txt` to `.env.local` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
   
   > ⚠️ Without Supabase credentials, the app runs in **Demo Mode** (no authentication required)

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:5173`

### Supabase Setup

To enable full authentication features:

1. Create a project at [supabase.com](https://supabase.com)
2. Enable **Email/Password** authentication
3. Enable **Google OAuth** provider:
   - Create OAuth credentials in Google Cloud Console
   - Add credentials to Supabase Auth settings
   - Set redirect URL in Google Console
4. Create a `profiles` table for admin dashboard:
   ```sql
   CREATE TABLE profiles (
     id UUID REFERENCES auth.users PRIMARY KEY,
     email TEXT,
     name TEXT,
     avatar_url TEXT,
     status TEXT DEFAULT 'active',
     created_at TIMESTAMPTZ DEFAULT NOW(),
     last_sign_in_at TIMESTAMPTZ
   );
   ```

### Production Build

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
titan-video-editor/
├── public/                  # Static assets
│   ├── logo.png            # Titan logo
│   └── manifest.json       # PWA manifest
├── src/
│   ├── components/
│   │   ├── auth/           # Authentication components
│   │   ├── email/          # Email template previews
│   │   ├── export/         # Export modal and progress
│   │   ├── modals/         # Help, Settings modals
│   │   ├── preview/        # Video player and canvas
│   │   ├── sidebar/        # Editor sidebar panels
│   │   ├── text-overlay/   # Text editing on canvas
│   │   ├── timeline/       # Timeline and trim controls
│   │   ├── ui/             # Reusable UI components
│   │   └── upload/         # Drag-drop upload zone
│   ├── contexts/           # React contexts (Theme)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # External library configs
│   ├── pages/              # Route pages
│   │   ├── LandingPage.tsx
│   │   ├── AuthPage.tsx
│   │   ├── EditorPage.tsx
│   │   └── AdminPage.tsx
│   ├── store/              # Zustand state stores
│   ├── styles/             # Global CSS and Tailwind
│   └── types/              # TypeScript type definitions
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── netlify.toml            # Netlify deployment config
```

## 🚢 Deployment

### Netlify (Recommended)

1. **Connect your GitHub repository to Netlify**

2. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `20`

3. **Environment variables (in Netlify dashboard):**
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

4. **Important:** The `netlify.toml` file already includes the required headers for FFmpeg.wasm (COOP/COEP)

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Add to `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" },
        { "key": "Cross-Origin-Embedder-Policy", "value": "require-corp" }
      ]
    }
  ]
}
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Space` | Play/Pause video |
| `←` / `→` | Seek backward/forward 5s |
| `Shift + ←` / `→` | Fine seek 1s |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` / `Ctrl+Y` | Redo |
| `Ctrl+E` | Open export modal |
| `Delete` | Remove selected overlay |
| `Arrow keys` | Move selected text overlay |
| `Shift + Arrow` | Move overlay by 10px |
| `M` | Toggle mute |
| `F` | Toggle fullscreen |
| `?` | Show keyboard shortcuts |
| `Escape` | Close modal / Deselect |

## 🎨 Brand Colors

The UI is designed with Titan Group Partners brand colors:

| Color | Hex | Usage |
|-------|-----|-------|
| Navy | `#0d1b4d` | Primary brand |
| Royal | `#1a3a7a` | Secondary |
| Steel | `#4a6eb5` | Accent / Interactive |
| Light | `#6b87c7` | Highlights |
| Accent | `#8fa8d9` | Subtle accents |

## ⚠️ Known Limitations

1. **Initial Load Time:** FFmpeg.wasm files (~31MB) need to download on first use. They are cached afterward.

2. **Device Performance:** Processing speed depends on client hardware. Large videos may be slow on low-end devices.

3. **File Size Limit:** Maximum 500MB to ensure reliable browser processing.

4. **Font Rendering:** Text overlays use web-safe fonts. Custom font upload coming soon.

5. **Browser Support:** Requires modern browsers with SharedArrayBuffer support:
   - Chrome 92+
   - Firefox 79+
   - Safari 15.2+ (with cross-origin isolation)
   - Edge 92+

6. **Mobile Experience:** Full functionality works on mobile, but complex edits are easier on desktop.

## 🔮 Future Enhancements

- [ ] AI-powered video generation from text prompts
- [ ] Custom font upload
- [ ] Audio track editing
- [ ] Multiple video clips on timeline
- [ ] Transitions between clips
- [ ] Image overlays
- [ ] Video filters and effects
- [ ] Cloud project storage
- [ ] Collaborative editing
- [ ] Export to social media directly
- [ ] Team workspaces

## 🧪 Testing

```bash
# Run linting
npm run lint

# Type checking
npm run type-check

# Build verification
npm run build
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📧 Contact

**Titan Group Partners**
- Website: [titangrouppartners.com](https://titangrouppartners.com/)
- Email: contact@titangrouppartners.com

---

<p align="center">
  Built with ❤️ by <a href="https://titangrouppartners.com">Titan Group Partners</a>
</p>
