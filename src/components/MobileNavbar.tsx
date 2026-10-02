import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotifications } from '../context/NotificationContext.tsx';
import { Home, Compass, PlusCircle, MessageSquare, User as UserIcon } from 'lucide-react';

interface MobileNavbarProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
  onOpenCreatePost: () => void;
}

export const MobileNavbar: React.FC<MobileNavbarProps> = ({
  currentView,
  onNavigate,
  onOpenCreatePost,
}) => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800 backdrop-blur-xl px-4 py-2">
      <div className="flex items-center justify-around max-w-md mx-auto">
        <button
          onClick={() => onNavigate('feed')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
            currentView === 'feed' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">Feed</span>
        </button>

        <button
          onClick={() => onNavigate('explore')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
            currentView === 'explore' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] font-medium">Explore</span>
        </button>

        {/* Center Create Post button */}
        <button
          onClick={onOpenCreatePost}
          className="flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30 active:scale-95 transition-transform -mt-5 border-2 border-slate-950"
        >
          <PlusCircle className="w-6 h-6" />
        </button>

        <button
          onClick={() => onNavigate('chat')}
          className={`relative flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
            currentView === 'chat' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] font-medium">Messages</span>
        </button>

        <button
          onClick={() => onNavigate('profile', user?._id)}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
            currentView === 'profile' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {user?.profilePicture ? (
            <img
              src={user.profilePicture}
              alt=""
              className={`w-5 h-5 rounded-full object-cover border ${
                currentView === 'profile' ? 'border-indigo-400 ring-2 ring-indigo-500/20' : 'border-slate-700'
              }`}
            />
          ) : (
            <UserIcon className="w-5 h-5" />
          )}
          <span className="text-[10px] font-medium">Profile</span>
        </button>
      </div>
    </nav>
  );
};
