import React, { useState, useEffect } from 'react';
import { userAPI, postAPI } from '../services/api.ts';
import { UserCard } from '../components/UserCard.tsx';
import { PostCard, Post } from '../components/PostCard.tsx';
import { Search, Hash, Users, FileText, Loader2, Sparkles } from 'lucide-react';

interface ExplorePageProps {
  initialQuery?: string;
  onNavigate: (view: string, param?: string) => void;
  onEditPost: (post: Post) => void;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({
  initialQuery = '',
  onNavigate,
  onEditPost,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'users' | 'posts'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      setSearchTerm(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    let isMounted = true;
    const executeSearch = async () => {
      setLoading(true);
      try {
        if (activeTab === 'users') {
          const res = await userAPI.search(searchTerm);
          if (isMounted) setUsers(res.data || []);
        } else {
          // If term starts with # or is single word, check tag
          const cleanTag = searchTerm.startsWith('#') ? searchTerm.substring(1) : undefined;
          const res = await postAPI.getExplore(cleanTag, !cleanTag ? searchTerm : undefined);
          if (isMounted) setPosts(res.data || []);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const timer = setTimeout(executeSearch, 200);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchTerm, activeTab]);

  const popularHashtags = ['MERN', 'SocketIO', 'WebDev', 'CollegeProject', 'Architecture', 'AI', 'Robotics', 'WebGL'];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Search Bar Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Explore & Discover</h1>
          <p className="text-xs text-slate-400">
            Search across user profiles, engineering projects, and trending research topics.
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, username, or #hashtag..."
            className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>

        {/* Quick Hashtag Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-500">Popular:</span>
          {popularHashtags.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setSearchTerm(tag);
                setActiveTab('posts');
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium bg-slate-900 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-400 border border-slate-800 hover:border-indigo-500/40 transition-colors"
            >
              <Hash className="w-3 h-3 text-indigo-400" />
              <span>{tag}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'users'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Profiles ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'posts'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Posts & Media</span>
        </button>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mr-2" />
          <span>Searching database...</span>
        </div>
      ) : activeTab === 'users' ? (
        users.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-xs">
            No matching users found for "{searchTerm}".
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {users.map((u) => (
              <UserCard
                key={u._id}
                user={u}
                onNavigateUser={(uid) => onNavigate('profile', uid)}
              />
            ))}
          </div>
        )
      ) : (
        posts.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-xs">
            No posts found for "{searchTerm}".
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
                onFilterHashtag={(tag) => setSearchTerm(tag)}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
};
