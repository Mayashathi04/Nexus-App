import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useSocket } from '../context/SocketContext.tsx';
import { useNotifications } from '../context/NotificationContext.tsx';
import { userAPI, postAPI, chatAPI } from '../services/api.ts';
import { PostCard, Post } from '../components/PostCard.tsx';
import { FollowListModal } from '../components/FollowListModal.tsx';
import {
  UserCheck,
  UserPlus,
  MessageSquare,
  Edit,
  Grid,
  Calendar,
  Loader2,
} from 'lucide-react';

interface ProfilePageProps {
  userId: string;
  onNavigate: (view: string, param?: string) => void;
  onEditPost: (post: Post) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  userId,
  onNavigate,
  onEditPost,
}) => {
  const { user: currentUser, isAuthenticated, updateUser } = useAuth();
  const { isUserOnline } = useSocket();
  const { showToast } = useNotifications();

  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [followModal, setFollowModal] = useState<{ open: boolean; type: 'followers' | 'following' }>({
    open: false,
    type: 'followers',
  });

  const targetId = userId || currentUser?._id;
  const isMe = currentUser?._id === targetId;
  const isOnline = targetId ? isUserOnline(targetId) : false;

  useEffect(() => {
    if (!targetId) return;

    let isMounted = true;
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const [profileRes, postsRes] = await Promise.all([
          userAPI.getProfile(targetId),
          postAPI.getUserPosts(targetId),
        ]);
        if (isMounted) {
          setProfile(profileRes.data);
          setPosts(postsRes.data || []);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfileData();
    return () => {
      isMounted = false;
    };
  }, [targetId, currentUser?._id]);

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      showToast('Authentication Required', 'Please sign in to follow', undefined, 'info');
      return;
    }
    if (followLoading || !profile) return;

    setFollowLoading(true);
    try {
      if (profile.isFollowing) {
        await userAPI.unfollow(profile._id);
        setProfile((prev: any) => ({
          ...prev,
          isFollowing: false,
          followersCount: Math.max(0, prev.followersCount - 1),
        }));
        if (currentUser) {
          updateUser({ following: currentUser.following.filter((id) => id !== profile._id) });
        }
      } else {
        await userAPI.follow(profile._id);
        setProfile((prev: any) => ({
          ...prev,
          isFollowing: true,
          followersCount: prev.followersCount + 1,
        }));
        if (currentUser) {
          updateUser({ following: [...currentUser.following, profile._id] });
        }
        showToast('Followed', `Now following @${profile.username}`, profile.profilePicture, 'success');
      }
    } catch (err) {
      console.error('Follow toggle error:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      showToast('Authentication Required', 'Please sign in to message', undefined, 'info');
      return;
    }
    try {
      const res = await chatAPI.startConversation(profile._id);
      onNavigate('chat', res.data._id);
    } catch (err) {
      console.error('Start chat error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mr-2" />
        <span>Loading profile...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20 text-slate-400">
        <h3 className="text-lg font-bold text-white mb-2">User Not Found</h3>
        <p className="text-xs">The profile you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Avatar with Presence Indicator */}
          <div className="relative flex-shrink-0">
            <img
              src={profile.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
              alt={profile.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-indigo-500/50 shadow-xl"
            />
            {isOnline ? (
              <span
                className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full ring-4 ring-slate-900 flex items-center justify-center"
                title="Online Now (Socket.io Connected)"
              >
                <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
              </span>
            ) : (
              <span
                className="absolute bottom-1 right-1 w-5 h-5 bg-slate-600 rounded-full ring-4 ring-slate-900"
                title="Offline"
              />
            )}
          </div>

          {/* User Details & Stats */}
          <div className="flex-1 min-w-0 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h1 className="text-2xl font-extrabold text-white">{profile.name}</h1>
                  {isOnline && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      online
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">@{profile.username}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center sm:justify-end gap-2.5">
                {isMe ? (
                  <button
                    onClick={() => onNavigate('editprofile')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleFollowToggle}
                      disabled={followLoading}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        profile.isFollowing
                          ? 'bg-slate-800 hover:bg-rose-500/10 hover:text-rose-400 text-slate-300 border border-slate-700'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                      }`}
                    >
                      {followLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : profile.isFollowing ? (
                        <>
                          <UserCheck className="w-4 h-4 text-indigo-400" />
                          <span>Following</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          <span>Follow</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleStartChat}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4 text-indigo-400" />
                      <span>Message</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Bio */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
              {profile.bio || 'Exploring new horizons on NEXUS.'}
            </p>

            {/* Stats row */}
            <div className="flex items-center justify-center sm:justify-start gap-6 pt-2 border-t border-slate-800 text-xs text-slate-300">
              <div>
                <span className="font-extrabold text-white text-sm">{posts.length}</span>{' '}
                <span className="text-slate-400">posts</span>
              </div>
              <button
                onClick={() => setFollowModal({ open: true, type: 'followers' })}
                className="hover:text-indigo-400 transition-colors"
              >
                <span className="font-extrabold text-white text-sm">{profile.followersCount}</span>{' '}
                <span className="text-slate-400">followers</span>
              </button>
              <button
                onClick={() => setFollowModal({ open: true, type: 'following' })}
                className="hover:text-indigo-400 transition-colors"
              >
                <span className="font-extrabold text-white text-sm">{profile.followingCount}</span>{' '}
                <span className="text-slate-400">following</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* User's Posts Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-sm font-bold text-white">
          <Grid className="w-4 h-4 text-indigo-400" />
          <span>Posts by {profile.name}</span>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-xs">
            No posts published yet.
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onPostDeleted={(id) => setPosts((prev) => prev.filter((p) => p._id !== id))}
                onPostUpdated={(up) => setPosts((prev) => prev.map((p) => (p._id === up._id ? up : p)))}
                onEditRequested={onEditPost}
                onNavigateUser={(uid) => onNavigate('profile', uid)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Followers / Following Modal */}
      <FollowListModal
        isOpen={followModal.open}
        onClose={() => setFollowModal({ open: false, type: 'followers' })}
        userId={profile._id}
        type={followModal.type}
        userName={profile.name}
        onNavigateUser={(uid) => onNavigate('profile', uid)}
      />
    </div>
  );
};
