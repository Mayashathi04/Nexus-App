import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Sparkles,
  Zap,
  Shield,
  MessageSquare,
  Users,
  Database,
  ArrowRight,
  Code2,
  FileCode2,
  CheckCircle2,
  Share2,
  Cpu,
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();

  const handleQuickLogin = async (email: string) => {
    const res = await login(email, 'Password123!');
    if (res.success) {
      onNavigate('feed');
    }
  };

  const features = [
    {
      icon: MessageSquare,
      title: 'Real-Time Socket.io Chat',
      description: 'One-to-one messaging with instant bi-directional socket delivery, live typing indicators, and message history persisted in MongoDB.',
      badge: 'WebSocket Port 3000',
    },
    {
      icon: Shield,
      title: 'Enterprise JWT Authentication',
      description: 'Cryptographically hashed passwords via bcryptjs, stateless bearer token auth middleware, input sanitization, and protected routing.',
      badge: 'bcrypt + JWT',
    },
    {
      icon: Database,
      title: 'Full Mongoose & MongoDB Models',
      description: 'Normalized database schema with User, Post, Comment, Conversation, Message, and Notification collections with population.',
      badge: 'Dual-Engine Mongoose',
    },
    {
      icon: Zap,
      title: 'Social Feed & Interactions',
      description: 'Dynamic home feed of followed peers, instant heart likes with duplicate prevention, threaded comments, and image uploads.',
      badge: 'High-Throughput Feed',
    },
    {
      icon: Users,
      title: 'Follow System & Discovery',
      description: 'Follow and unfollow users, explore trending hashtags, search profiles by username, and inspect follower counts.',
      badge: 'Graph Relations',
    },
    {
      icon: FileCode2,
      title: 'Ready for Postman Testing',
      description: 'Complete REST API test collection ready for evaluation, including one-click JSON export and interactive API documentation.',
      badge: 'Postman v2.1 Collection',
    },
  ];

  const demoAccounts = [
    { name: 'Alex River', role: 'Full-Stack Architect', email: 'alex@nexus.social', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
    { name: 'Maya Chen', role: 'AI & Robotics Researcher', email: 'maya@nexus.social', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' },
    { name: 'Marcus Vance', role: '3D WebGL Artist', email: 'marcus@nexus.social', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
    { name: 'Sophia Ray', role: 'Open Source Founder', email: 'sophia@nexus.social', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 border-b border-slate-800/80">
        {/* Ambient Glowing Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/15 to-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Engineering Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span>MAJOR COLLEGE ENGINEERING PROJECT &bull; MERN STACK + SOCKET.IO</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
              Connect. Collaborate.{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
                Share in Real-Time.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              NEXUS is an enterprise-grade full-stack social media platform engineered with MongoDB, Express, React, Node.js, and real-time Socket.io websockets.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2">
            <button
              onClick={() => onNavigate('register')}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => onNavigate('feed')}
              className="px-6 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-sm hover:scale-105 active:scale-95 transition-all"
            >
              Explore Public Feed
            </button>
            <button
              onClick={() => onNavigate('apidocs')}
              className="px-5 py-3.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold text-sm transition-all flex items-center gap-2"
            >
              <FileCode2 className="w-4 h-4 text-amber-400" />
              <span>Postman Collection</span>
            </button>
          </div>

          {/* 1-Click Demo Evaluation Profiles */}
          <div className="pt-8 max-w-3xl mx-auto">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              ⚡ Evaluator Quick-Login (1-Click Test Access)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {demoAccounts.map((account) => (
                <button
                  key={account.email}
                  onClick={() => handleQuickLogin(account.email)}
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 transition-all text-left group"
                >
                  <img
                    src={account.img}
                    alt={account.name}
                    className="w-8 h-8 rounded-full object-cover border border-indigo-500/30 group-hover:scale-105 transition-transform"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-200 group-hover:text-indigo-400 truncate">
                      {account.name}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate font-mono">
                      Log in &rarr;
                    </p>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              All demo accounts share password: <span className="font-mono text-indigo-300">Password123!</span> or click to login automatically.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 md:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            Architected for Production Performance
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Every layer from database schemas to client state management follows modern MERN engineering standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900 transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    {feature.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Stack Architecture Section */}
      <section className="py-16 bg-slate-900/40 border-t border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <span className="text-xs font-mono font-semibold text-indigo-400 uppercase tracking-wider">
                Full-Stack Architecture
              </span>
              <h2 className="text-3xl font-bold text-white">
                Engineered with the MERN Ecosystem + WebSockets
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                NEXUS implements separation of concerns across Express routing controllers, Mongoose database models, token authentication middleware, and real-time Socket.io broadcasting.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>MongoDB Atlas & Mongoose</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Express.js REST APIs</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>React 19 & Tailwind CSS</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Socket.io WebSockets</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>JWT & bcryptjs Security</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Postman Testing Collection</span>
                </div>
              </div>
            </div>

            {/* Code / Architecture preview box */}
            <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5 font-mono text-xs text-slate-300 space-y-3 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                  <span className="ml-2 font-semibold text-slate-300">nexus_architecture.ts</span>
                </div>
                <span className="text-indigo-400 font-mono">PORT 3000</span>
              </div>
              <pre className="text-[11px] leading-relaxed text-slate-300 overflow-x-auto">
{`// REST & WebSocket Hybrid Server
const app = express();
const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer);

// Authentication & Models
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/conversations', chatRoutes);

// Real-Time Socket.io Presence
io.on('connection', (socket) => {
  socket.on('sendMessage', async (msg) => {
    const saved = await MessageModel.create(msg);
    io.to(\`conv_\${msg.convId}\`).emit('receiveMessage', saved);
  });
});`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-8 text-center text-xs text-slate-500 space-y-2">
        <p className="font-semibold text-slate-400">
          NEXUS &bull; Full-Stack Social Media Platform &bull; College Major Project 2026
        </p>
        <p>Built with MongoDB, Express.js, React, Node.js, and Socket.io.</p>
      </footer>
    </div>
  );
};
