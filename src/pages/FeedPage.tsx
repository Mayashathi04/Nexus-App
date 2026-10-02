import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { postAPI, userAPI } from '../services/api.ts';
import { PostCard, Post } from '../components/PostCard.tsx';
import { UserCard } from '../components/UserCard.tsx';
import {
  Sparkles,
  PlusCircle,
  Hash,
  Loader2,
  RefreshCw,
  TrendingUp,
  Users,
} from 'lucide-react';

interface FeedPageProps {
  onNavigate: (view: string, param?: string) => void;
  onOpenCreatePost: () => void;
  onEditPost: (post: Post) => void;
}

export const FeedPage: React.FC<FeedPageProps> = ({
  onNavigate,
  onOpenCreatePost,
  onEditPost,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'feed' | 'explore'>('feed');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [trendingTags, setTrendingTags] = useState<string[]>([
    'MERN', 'SocketIO', 'WebDev', 'CollegeProject', 'Architecture', 'AI', 'WebGL', 'Innovation'
  ]);

  const fetchFeedPosts = async () => {
    setLoading(true);
    try {
      const res = activeTab === 'feed' && isAuthenticated
        ? await postAPI.getFeed()
        : await postAPI.getExplore();
      setPosts(res.data || []);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedPosts();
  }, [activeTab, isAuthenticated]);

  useEffect(() => {
    // Fetch suggestions
    userAPI.search('')
      .then((res) => {
        const others = (res.data || []).filter((u: any) => u._id !== user?._id);
        setSuggestedUsers(others.slice(0, 5));
      })
      .catch(() => {});
  }, [user?._id]);

  const handlePostDeleted = (deletedId: string) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedId));
  };

  const handlePostUpdated = (updated: Post) => {
    setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Feed Header & Tabs */}
          <div className="flex items-center justify-between gap-4 p-2 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('feed')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'feed'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Following Feed
              </button>
              <button
                onClick={() => setActiveTab('explore')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'explore'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Global Explore
              </button>
            </div>

            <button
              onClick={fetchFeedPosts}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              title="Refresh Feed"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Create Prompt Box */}
          {isAuthenticated && (
            <div
              onClick={onOpenCreatePost}
              className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-md hover:border-slate-700 cursor-pointer transition-all flex items-center gap-3.5 group"
            >
              <img
                src={user?.profilePicture}
                alt=""
                className="w-10 h-10 rounded-full object-cover border border-indigo-500/40 group-hover:scale-105 transition-transform"
              />
              <div className="flex-1 py-2 px-4 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-400 group-hover:border-indigo-500/30 group-hover:text-slate-300 transition-colors flex items-center justify-between">
                <span>Share your latest project update or tech insight...</span>
                <PlusCircle className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
          )}

          {/* Posts List */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="text-xs font-medium">Fetching latest social feed from MongoDB...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-3xl bg-slate-900/40 border border-slate-800/60 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Your Feed is Quiet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {activeTab === 'feed'
                  ? 'Follow peers or researchers from the suggestions list, or switch to Global Explore to discover community activity.'
                  : 'No posts found yet. Create the very first post!'}
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setActiveTab('explore')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700"
                >
                  Explore All Posts
                </button>
                {isAuthenticated && (
                  <button
                    onClick={onOpenCreatePost}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/30"
                  >
                    Create Post
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onPostUpdated={handlePostUpdated}
                  onPostDeleted={handlePostDeleted}
                  onEditRequested={onEditPost}
                  onNavigateUser={(uid) => onNavigate('profile', uid)}
                  onFilterHashtag={(tag) => onNavigate('explore', tag)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar: Suggestions & Trending */}
        <div className="hidden lg:block space-y-6">
          {/* Suggested Peers */}
          <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Suggested Peers</h3>
              </div>
              <button
                onClick={() => onNavigate('explore')}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
              >
                View all
              </button>
            </div>

            <div className="space-y-2.5">
              {suggestedUsers.map((su) => (
                <UserCard
                  key={su._id}
                  user={su}
                  onNavigateUser={(uid) => onNavigate('profile', uid)}
                />
              ))}
            </div>
          </div>

          {/* Trending Topics */}
          <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Trending on NEXUS</h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {trendingTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => onNavigate('explore', tag)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-950 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-300 border border-slate-800 hover:border-indigo-500/40 transition-colors"
                >
                  <Hash className="w-3 h-3 text-indigo-400" />
                  <span>{tag}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
