import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useSocket } from '../context/SocketContext.tsx';
import { useNotifications } from '../context/NotificationContext.tsx';
import { userAPI } from '../services/api.ts';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';

interface UserCardProps {
  user: {
    _id: string;
    name: string;
    username: string;
    profilePicture: string;
    bio?: string;
    followers?: string[];
  };
  onNavigateUser: (userId: string) => void;
  onFollowChanged?: (targetId: string, isNowFollowing: boolean) => void;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  onNavigateUser,
  onFollowChanged,
}) => {
  const { user: currentUser, isAuthenticated, updateUser } = useAuth();
  const { isUserOnline } = useSocket();
  const { showToast } = useNotifications();

  const isOnline = isUserOnline(user._id);
  const isMe = currentUser?._id === user._id;

  const [following, setFollowing] = useState<boolean>(() => {
    return currentUser?.following?.includes(user._id) || false;
  });
  const [loading, setLoading] = useState(false);

  const handleFollowToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      showToast('Authentication Required', 'Please sign in to follow users', undefined, 'info');
      return;
    }
    if (loading || isMe) return;

    setLoading(true);
    try {
      if (following) {
        await userAPI.unfollow(user._id);
        setFollowing(false);
        if (currentUser) {
          updateUser({
            following: currentUser.following.filter((id) => id !== user._id),
          });
        }
        if (onFollowChanged) onFollowChanged(user._id, false);
      } else {
        await userAPI.follow(user._id);
        setFollowing(true);
        if (currentUser) {
          updateUser({
            following: [...currentUser.following, user._id],
          });
        }
        showToast('Following', `You are now following @${user.username}`, user.profilePicture, 'success');
        if (onFollowChanged) onFollowChanged(user._id, true);
      }
    } catch (err: any) {
      console.error('Follow toggle error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={() => onNavigateUser(user._id)}
      className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-all group"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative flex-shrink-0">
          <img
            src={user.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
            alt={user.name}
            className="w-11 h-11 rounded-full object-cover border border-indigo-500/30 group-hover:scale-105 transition-transform"
          />
          {isOnline ? (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-slate-900" title="Online now" />
          ) : (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-slate-600 rounded-full ring-2 ring-slate-900" title="Offline" />
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors truncate">
              {user.name}
            </h4>
            {isOnline && (
              <span className="text-[10px] text-emerald-400 font-medium">
                &bull; online
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 font-mono truncate">
            @{user.username}
          </p>
          {user.bio && (
            <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
              {user.bio}
            </p>
          )}
        </div>
      </div>

      {!isMe && isAuthenticated && (
        <button
          onClick={handleFollowToggle}
          disabled={loading}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            following
              ? 'bg-slate-800 hover:bg-rose-500/10 hover:text-rose-400 text-slate-300 border border-slate-700'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/30'
          }`}
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : following ? (
            <>
              <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Following</span>
            </>
          ) : (
            <>
              <UserPlus className="w-3.5 h-3.5" />
              <span>Follow</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};
