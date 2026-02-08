# 🎮 CodeClash - Enterprise-Grade Competitive Coding Platform

A **real-time 1v1 competitive coding platform** where developers battle to solve algorithms with strategic **Sabotage Power-ups**. Built with a premium, Apple/Stripe-level UI/UX design.

## 🚀 Tech Stack

- **Frontend Framework:** React 18 + Vite
- **Styling:** Tailwind CSS (Custom Cyberpunk Theme)
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Code Editor:** Monaco Editor (VS Code's editor)

## 🎨 Design Language: "Professional Cyberpunk"

Enterprise-grade UI inspired by top tech companies:

- **Deep Void Black** (#0a0a0a) background with subtle grid patterns
- **Neon Cyber-Green** (#00ff9d) for success/winning states
- **Electric Purple** (#bf00ff) for sabotage/attack actions
- **Glassmorphism** panels with backdrop-blur effects
- **Typography:** Inter for UI, JetBrains Mono for code
- **Smooth Animations:** Framer Motion for premium feel

## ✨ Core Features

### 1. 🏠 Landing Page (Enterprise-Grade)
- **Premium Design:** Apple/Stripe-level aesthetics
- Animated hero section with gradient text effects
- Live stats ticker (50K+ players, 12.4K battles today)
- Feature showcase with gradient cards
- Testimonials from top engineers
- Smooth scroll animations and parallax effects
- Fixed navigation bar with glassmorphism

### 2. 🎯 Room System
- **Create Room:** Generate unique 6-digit room codes
- **Join Room:** Enter room ID to join battles
- **Live Battles List:** Browse active rooms with:
  - Player count (X/2)
  - Spectator count
  - Difficulty level (Easy/Medium/Hard)
  - Host information
- **Room ID Sharing:** Copy-to-clipboard functionality
- **Player Names:** Custom name input for personalization

### 3. ⚔️ Battle Arena
- **60/40 Split Layout:**
  - Left (60%): Your Monaco code editor
  - Right Top (30%): Opponent's view (read-only)
  - Right Bottom (10%): Sabotage toolbar

- **Resource System:**
  - Mana bar (100 points, regenerates 2/sec)
  - Strategic resource management
  - Each sabotage costs mana

- **Timer System:**
  - 5-minute countdown
  - Turns red in final minute
  - Pulse animation for urgency

- **Room Info Display:**
  - Room ID visible in top bar
  - Player name display
  - Exit button to return to lobby

### 4. 👁️ Spectator Mode (NEW!)
- **Split-Screen View:** Watch both players simultaneously
- **Live Code Streaming:** See real-time typing
- **Player Stats:**
  - Lines written
  - Tests passed (X/10)
  - Rank display
- **Fullscreen Toggle:** Focus on one player
- **Spectator Count:** See how many are watching
- **Live Indicators:** Pulsing "LIVE" badges
- **Bottom Stats Bar:**
  - Last sabotage deployed
  - Current leader
  - Live status
- **Audio Controls:** Mute/unmute option

### 5. 🎭 Sabotage Arsenal (9 Power-Ups!)

Complete all test cases to unlock devastating power-ups:

#### Classic Sabotages
- 🌫️ **Foggy Screen** (30 MP) - Blur opponent's view
- 💀 **Screen Shake** (25 MP) - Violent editor shaking
- ⚡ **Glitch Effect** (35 MP) - Chromatic aberration

#### NEW! Advanced Sabotages
- 🔒 **Backspace Lock** (40 MP) - **Disable backspace key!**
- 👁️ **Invisible Cursor** (30 MP) - Hide their cursor
- 🐌 **Slow Motion** (35 MP) - Add typing delay
- 🔄 **Code Flip** (45 MP) - **Rotate editor 180°!**
- 📜 **Random Scroll** (20 MP) - Auto-scroll chaos
- 🔠 **Caps Lock** (25 MP) - Force UPPERCASE typing

📖 **Full Guide:** See [POWERUPS_GUIDE.md](./POWERUPS_GUIDE.md) for strategies, combos, and tier list!

## 📁 Project Structure

```
CodeClash/
├── src/
│   ├── components/
│   │   ├── LandingPage.jsx      # Enterprise-grade hero section
│   │   ├── RoomLobby.jsx        # Create/Join room system
│   │   ├── BattleArena.jsx      # Main game interface
│   │   ├── SpectatorMode.jsx    # Watch live battles
│   │   └── SabotageEffects.jsx  # Reusable effect components
│   ├── App.jsx                   # Main app with routing
│   ├── index.css                 # Global styles & animations
│   └── main.jsx                  # Entry point
├── tailwind.config.js            # Custom theme configuration
├── postcss.config.js             # PostCSS setup
└── package.json
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- **No API keys required!** ✅

### Step 1: Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd CodeClash

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### Step 2: Start the Application

```bash
# Terminal 1 - Start backend server
cd server
npm start

# Terminal 2 - Start frontend
npm run dev
```

**That's it!** No API key configuration needed. 🎉

The app will be available at:
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3001

### Code Execution Engine

CodeClash uses **Piston** - a free, open-source code execution engine:
- ✅ **100% Free** - No API keys or paid plans
- ✅ **13+ Languages** - JavaScript, Python, Java, C++, Go, Rust, and more
- ✅ **Fast & Reliable** - Executes code in milliseconds
- ✅ **Open Source** - MIT licensed

📖 **Learn More:** See [PISTON_SETUP.md](./PISTON_SETUP.md) for advanced configuration and self-hosting options.

### Build for Production

```bash
# Build frontend
npm run build

# Preview production build locally
npm run preview
```

## 🌐 Deployment

### Deploy to Render (Recommended)

CodeClash is optimized for deployment on [Render](https://render.com) with a free tier available.

**Quick Deploy:**

1. Push your code to GitHub/GitLab
2. Connect to Render
3. Use these settings:
   - **Build Command:** `npm install && npm run build && cd server && npm install`
   - **Start Command:** `cd server && npm start`
   - **Environment Variables:**
     - `NODE_ENV=production`
     - `CORS_ORIGIN=*` (update after first deploy)
     - `PISTON_API_URL=https://emkc.org/api/v2/piston`

📖 **Full Guide:** See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for detailed step-by-step instructions.

**Alternative: One-Click Deploy**

If you have a `render.yaml` file in your repository:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

### Test Production Build Locally

Before deploying, test the production build on your machine:

**Windows (PowerShell):**
```powershell
.\test-production.ps1
```

**Linux/Mac:**
```bash
chmod +x test-production.sh
./test-production.sh
```

Or manually:
```bash
# Build and start
npm run build:all
npm start
```

Visit `http://localhost:3001` to test the production build.

## 🎮 How to Use

### Creating a Room
1. Click "Enter the Arena" on landing page
2. Select "Create Room"
3. Enter your name
4. Share the generated 6-digit room code with opponent
5. Click "Enter Arena" to start

### Joining a Room
1. Click "Enter the Arena"
2. Select "Join Room"
3. Enter your name
4. Input the 6-digit room code
5. Click "Join Battle"

### Spectating
1. Click "Enter the Arena"
2. Select "Spectate" or click on any live battle
3. Watch both players code in real-time
4. Toggle fullscreen on either player
5. See live stats and sabotage deployments

### In Battle
1. Write your code in the left editor
2. Monitor your mana bar (top left)
3. Watch the countdown timer (center)
4. Deploy sabotages from the bottom-right toolbar
5. Sabotages affect the opponent's view (right panel)
6. Click "Exit" to return to lobby

## 🎨 UI/UX Highlights

### Premium Design Elements
- **Gradient Text:** Cyber-green to emerald, purple to pink
- **Glassmorphism:** Translucent panels with backdrop-blur
- **Neon Glows:** Box-shadow effects on interactive elements
- **Smooth Transitions:** 300ms duration for all interactions
- **Hover Effects:** Scale transforms and color shifts
- **Grid Background:** Subtle cyberpunk aesthetic
- **Animated Orbs:** Floating gradient backgrounds
- **Magnetic Buttons:** Expanding circle hover effect

### Animations
- **Framer Motion:** Page transitions and component animations
- **Scroll Effects:** Parallax and fade-in on scroll
- **Pulse Effects:** Live indicators and urgent states
- **Shake Animation:** Earthquake sabotage effect
- **Glitch Effect:** RGB channel splitting
- **Fade Transitions:** Smooth view changes

## 🔧 Configuration

### Tailwind Theme Extensions

Located in `tailwind.config.js`:

```js
colors: {
  'void-black': '#0a0a0a',
  'cyber-green': '#00ff9d',
  'electric-purple': '#bf00ff',
}

animations: {
  'pulse-glow': '2s infinite',
  'shake': '0.5s both',
  'glitch': '0.3s infinite',
}
```

## 🚀 Future Enhancements

- [ ] **WebSocket Integration** - Real multiplayer functionality
- [ ] **User Authentication** - Login/signup with profiles
- [ ] **Leaderboard System** - Global rankings
- [ ] **ELO Rating** - Skill-based matchmaking
- [ ] **More Sabotages** - Screen Flip, Invert Colors, Code Scramble
- [ ] **Problem Library** - 100+ algorithm challenges
- [ ] **Difficulty Levels** - Easy, Medium, Hard, Expert
- [ ] **Replay System** - Watch past battles
- [ ] **Tournament Mode** - Bracket-style competitions
- [ ] **Voice Chat** - Real-time communication
- [ ] **Code Execution** - Run and test code
- [ ] **Test Cases** - Automated validation
- [ ] **Analytics Dashboard** - Performance metrics
- [ ] **Mobile Responsive** - Touch-optimized UI

## 📊 Feature Comparison

| Feature | Status |
|---------|--------|
| Landing Page | ✅ Enterprise-Grade |
| Room Creation | ✅ Complete |
| Room Joining | ✅ Complete |
| Spectator Mode | ✅ Complete |
| Battle Arena | ✅ Complete |
| Sabotage System | ✅ 9 Power-Ups |
| Monaco Editor | ✅ Integrated |
| Animations | ✅ Framer Motion |
| Mobile Responsive | ✅ Optimized |
| Real-time Multiplayer | ✅ Socket.IO |
| Code Execution | ✅ Piston API |
| Production Ready | ✅ Render Optimized |
| Authentication | 📋 Planned |
| Leaderboards | 📋 Planned |

## 🎯 Design Inspiration

This project draws inspiration from:
- **Apple.com** - Clean, premium aesthetics
- **Stripe.com** - Gradient effects and smooth animations
- **Linear.app** - Modern, fast UI
- **Vercel.com** - Dark mode excellence
- **GitHub.com** - Developer-focused design

## 📝 License

MIT License - Feel free to use this project for learning or building your own competitive coding platform!

## 🎮 Credits

Built with ❤️ using:
- React 18
- Vite
- Tailwind CSS
- Framer Motion
- Monaco Editor
- Lucide React

---

**Ready to battle?** Run `npm run dev` and enter the arena! 🔥

**Current Version:** 2.0.0 (Enterprise Edition)
