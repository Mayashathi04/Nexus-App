import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotifications } from '../context/NotificationContext.tsx';
import { useSocket } from '../context/SocketContext.tsx';
import { systemAPI } from '../services/api.ts';
import {
  Home,
  Compass,
  Bell,
  MessageSquare,
  User as UserIcon,
  Settings,
  PlusCircle,
  FileCode2,
  Database,
  Radio,
  ExternalLink,
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
  onOpenCreatePost: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onOpenCreatePost }) => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const { isConnected } = useSocket();
  const [dbInfo, setDbInfo] = useState<{ mode: string; isMongoConnected: boolean } | null>(null);

  useEffect(() => {
    systemAPI.getHealth()
      .then((res) => {
        if (res.data?.database) {
          setDbInfo(res.data.database);
        }
      })
      .catch(() => {});
  }, []);

  const navItems = [
    { id: 'feed', label: 'Home Feed', icon: Home },
    { id: 'explore', label: 'Explore & Search', icon: Compass },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { id: 'chat', label: 'Live Messages', icon: MessageSquare, live: true },
    { id: 'profile', label: 'Profile', icon: UserIcon, param: user?._id },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'apidocs', label: 'Postman & REST API', icon: FileCode2, highlight: true },
  ];

  return (
    <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col justify-between py-6 px-4 border-r border-slate-800/80 bg-slate-950 min-h-[calc(100vh-4rem)] sticky top-16">
      <div className="space-y-6">
        {/* User Quick Info */}
        {user && (
          <button
            onClick={() => onNavigate('profile', user._id)}
            className="w-full flex items-center gap-3 p-3 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 transition-all text-left group"
          >
            <div className="relative">
              <img
                src={user.profilePicture}
                alt={user.name}
                className="w-11 h-11 rounded-full object-cover border border-indigo-500/40 group-hover:scale-105 transition-transform"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-slate-950"></span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors truncate">
                {user.name}
              </p>
              <p className="text-xs text-slate-400 font-mono truncate">
                @{user.username}
              </p>
            </div>
          </button>
        )}

        {/* Primary Action Button */}
        <button
          onClick={onOpenCreatePost}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
        >
          <PlusCircle className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
          <span>Create New Post</span>
        </button>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id, item.param)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold'
                    : item.highlight
                    ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : item.highlight ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.live && (
                    <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Radio className="w-2.5 h-2.5 animate-pulse" />
                      WS
                    </span>
                  )}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold text-white bg-rose-500 rounded-full animate-bounce">
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* College Project Architecture & System Live Box */}
      <div className="pt-4 border-t border-slate-800/80 space-y-3">
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-2">
          <div className="flex items-center justify-between text-slate-200 font-semibold">
            <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-indigo-400">
              <Database className="w-3.5 h-3.5" />
              Stack & Storage
            </span>
            <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              ACTIVE
            </span>
          </div>

          <div className="text-[11px] text-slate-400 leading-relaxed font-mono">
            Backend: Express + Node.js<br />
            Sockets: Socket.io (Port 3000)<br />
            DB: {dbInfo?.isMongoConnected ? 'MongoDB Atlas' : 'Embedded Doc Store'}<br />
            Auth: JWT + bcryptjs
          </div>

          <button
            onClick={() => onNavigate('apidocs')}
            className="w-full mt-1 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-indigo-400 hover:text-indigo-300 group"
          >
            <span>Postman Collection</span>
            <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <p className="text-[10px] text-center text-slate-500">
          NEXUS Social Engine &copy; 2026
        </p>
      </div>
    </aside>
  );
};
