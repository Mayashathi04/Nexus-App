import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotifications } from '../context/NotificationContext.tsx';
import { useSocket } from '../context/SocketContext.tsx';
import {
  Search,
  Bell,
  MessageSquare,
  PlusCircle,
  FileCode2,
  LogOut,
  User as UserIcon,
  Settings,
  Menu,
  X,
  Sparkles,
  Zap,
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
  onOpenCreatePost: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenCreatePost }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { unreadCount } = useNotifications();
  const { isConnected } = useSocket();
  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('explore', searchQuery.trim());
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl supports-backdrop-filter:bg-slate-950/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate(isAuthenticated ? 'feed' : 'landing')}
            className="flex items-center gap-2.5 group text-left focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400 group-hover:text-cyan-300 transition-colors" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                  NEXUS
                </span>
                <span className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-full">
                  <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                  MERN + WS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider font-mono hidden sm:block">
                SOCIAL PLATFORM
              </p>
            </div>
          </button>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users, usernames, #hashtags..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-900/90 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
            />
          </form>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Postman API Docs Quick Pill */}
          <button
            onClick={() => onNavigate('apidocs')}
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              currentView === 'apidocs'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-slate-900/80 text-amber-400/90 hover:text-amber-300 border-amber-500/20 hover:bg-amber-500/10'
            }`}
            title="Interactive Postman API Explorer & JSON Download"
          >
            <FileCode2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Postman / Docs</span>
          </button>

          {isAuthenticated ? (
            <>
              {/* Create Post Button */}
              <button
                onClick={onOpenCreatePost}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 text-white hover:from-indigo-500 hover:to-indigo-400 shadow-md shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Create Post</span>
              </button>

              {/* Chat Button with Socket Real-time Indicator */}
              <button
                onClick={() => onNavigate('chat')}
                className={`relative p-2 rounded-xl text-slate-400 hover:text-white transition-colors ${
                  currentView === 'chat' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'hover:bg-slate-900'
                }`}
                title="Real-Time Messages"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="sr-only">Messages</span>
              </button>

              {/* Notifications Button with unread counter */}
              <button
                onClick={() => onNavigate('notifications')}
                className={`relative p-2 rounded-xl text-slate-400 hover:text-white transition-colors ${
                  currentView === 'notifications' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'hover:bg-slate-900'
                }`}
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full border-2 border-slate-950 animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* User Avatar & Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-900 transition-colors focus:outline-none border border-transparent hover:border-slate-800"
                >
                  <div className="relative">
                    <img
                      src={user?.profilePicture}
                      alt={user?.name}
                      className="w-8 h-8 rounded-full object-cover border border-indigo-500/40"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-950"></span>
                  </div>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-xl py-2 z-50 animate-in fade-in-50 slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-800/80">
                      <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                      <p className="text-xs text-slate-400 truncate font-mono">@{user?.username}</p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          onNavigate('profile', user?._id);
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-slate-300 hover:text-white hover:bg-indigo-600/10 flex items-center gap-2.5 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-indigo-400" />
                        <span>My Profile</span>
                      </button>

                      <button
                        onClick={() => {
                          onNavigate('settings');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-slate-300 hover:text-white hover:bg-indigo-600/10 flex items-center gap-2.5 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        <span>Account & System Settings</span>
                      </button>

                      <button
                        onClick={() => {
                          onNavigate('apidocs');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 flex items-center gap-2.5 transition-colors"
                      >
                        <FileCode2 className="w-4 h-4 text-amber-400" />
                        <span>Postman & REST API Explorer</span>
                      </button>
                    </div>

                    <div className="pt-1 border-t border-slate-800/80">
                      <button
                        onClick={() => {
                          logout();
                          onNavigate('landing');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-rose-400" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('login')}
                className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-sm shadow-indigo-600/20"
              >
                Get Started
              </button>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile search bar if open */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 border-t border-slate-800/80 bg-slate-950/95 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users or hashtags..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </form>

          <div className="flex flex-col gap-1">
            <button
              onClick={() => {
                onNavigate('feed');
                setMobileMenuOpen(false);
              }}
              className="px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-900 rounded-lg text-left"
            >
              Feed
            </button>
            <button
              onClick={() => {
                onNavigate('explore');
                setMobileMenuOpen(false);
              }}
              className="px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-900 rounded-lg text-left"
            >
              Explore & Search
            </button>
            <button
              onClick={() => {
                onNavigate('apidocs');
                setMobileMenuOpen(false);
              }}
              className="px-3 py-2 text-sm font-medium text-amber-400 hover:bg-amber-500/10 rounded-lg text-left flex items-center gap-2"
            >
              <FileCode2 className="w-4 h-4" />
              Postman Collection & API Docs
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
