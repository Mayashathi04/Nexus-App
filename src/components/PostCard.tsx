import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotifications } from '../context/NotificationContext.tsx';
import { postAPI } from '../services/api.ts';
import { CommentSection } from './CommentSection.tsx';
import {
  Heart,
  MessageSquare,
  Share2,
  MoreHorizontal,
  Edit3,
  Trash2,
  Hash,
  Check,
} from 'lucide-react';

export interface Post {
  _id: string;
  author: {
    _id: string;
    name: string;
    username: string;
    profilePicture: string;
  };
  caption: string;
  image?: string;
  hashtags: string[];
  likes: string[];
  likesCount?: number;
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PostCardProps {
  post: Post;
  onPostUpdated?: (updated: Post) => void;
  onPostDeleted?: (postId: string) => void;
  onEditRequested?: (post: Post) => void;
  onNavigateUser: (userId: string) => void;
  onFilterHashtag?: (tag: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onPostUpdated,
  onPostDeleted,
  onEditRequested,
  onNavigateUser,
  onFilterHashtag,
}) => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useNotifications();

  const author = post.author || {};
  const isOwner = user?._id === author._id;

  const [isLiked, setIsLiked] = useState<boolean>(
    post.isLiked !== undefined ? post.isLiked : (user ? post.likes?.includes(user._id) : false)
  );
  const [likesCount, setLikesCount] = useState<number>(post.likesCount || post.likes?.length || 0);
  const [likeLoading, setLikeLoading] = useState<boolean>(false);
  const [showComments, setShowComments] = useState<boolean>(false);
  const [commentsCount, setCommentsCount] = useState<number>(0);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleLikeToggle = async () => {
    if (!isAuthenticated) {
      showToast('Authentication Required', 'Please sign in to like posts', undefined, 'info');
      return;
    }
    if (likeLoading) return;

    // Optimistic toggle
    const nextState = !isLiked;
    const nextCount = nextState ? likesCount + 1 : Math.max(0, likesCount - 1);
    setIsLiked(nextState);
    setLikesCount(nextCount);
    setLikeLoading(true);

    try {
      if (nextState) {
        const res = await postAPI.like(post._id);
        setLikesCount(res.data.likesCount);
      } else {
        const res = await postAPI.unlike(post._id);
        setLikesCount(res.data.likesCount);
      }
    } catch (err: any) {
      // Revert on error
      setIsLiked(!nextState);
      setLikesCount(likesCount);
      console.error('Like error:', err);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await postAPI.delete(post._id);
      showToast('Post Deleted', 'Your post has been removed successfully', undefined, 'success');
      if (onPostDeleted) onPostDeleted(post._id);
    } catch (err) {
      console.error('Error deleting post:', err);
      showToast('Error', 'Failed to delete post. Please try again.', undefined, 'info');
    } finally {
      setDeleting(false);
      setMenuOpen(false);
    }
  };

  const handleShare = () => {
    const postUrl = `${window.location.origin}/post/${post._id}`;
    navigator.clipboard.writeText(postUrl);
    setCopied(true);
    showToast('Link Copied', 'Post link copied to clipboard', undefined, 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const formatRelativeTime = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <article className="rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-xl overflow-hidden hover:border-slate-700/80 transition-all duration-200">
      {/* Header: Author info and options menu */}
      <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => onNavigateUser(author._id)}
            className="flex-shrink-0 focus:outline-none group"
          >
            <div className="relative">
              <img
                src={author.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${author.username}`}
                alt={author.name}
                className="w-11 h-11 rounded-full object-cover border border-indigo-500/40 group-hover:scale-105 transition-transform"
              />
            </div>
          </button>

          <div className="min-w-0">
            <button
              onClick={() => onNavigateUser(author._id)}
              className="text-sm font-bold text-white hover:text-indigo-400 transition-colors truncate block text-left"
            >
              {author.name || 'NEXUS User'}
            </button>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="font-mono text-slate-500">@{author.username}</span>
              <span>&bull;</span>
              <span>{formatRelativeTime(post.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Options menu if author */}
        {isOwner && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1 w-36 rounded-xl bg-slate-950 border border-slate-800 shadow-2xl py-1 z-30 animate-in fade-in-50">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    if (onEditRequested) onEditRequested(post);
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-medium text-slate-300 hover:text-white hover:bg-indigo-600/10 flex items-center gap-2"
                >
                  <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                  Edit Post
                </button>
                <button
                  onClick={handleDeletePost}
                  disabled={deleting}
                  className="w-full px-3 py-2 text-left text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Caption & Hashtags */}
      <div className="px-4 sm:px-5 pb-3">
        <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
          {post.caption}
        </p>

        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {post.hashtags.map((tag, idx) => (
              <button
                key={idx}
                onClick={() => onFilterHashtag && onFilterHashtag(tag)}
                className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 transition-colors"
              >
                <Hash className="w-3 h-3" />
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Post Image */}
      {post.image && (
        <div className="relative bg-slate-950 border-y border-slate-800/80 overflow-hidden max-h-[500px]">
          <img
            src={post.image}
            alt="Post content"
            className="w-full h-auto object-cover max-h-[500px] hover:scale-[1.01] transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}

      {/* Action Footer: Like, Comment, Share */}
      <div className="px-4 sm:px-5 py-3 flex items-center justify-between gap-4 border-t border-slate-800/60 bg-slate-900/40">
        <div className="flex items-center gap-4">
          {/* Like Button */}
          <button
            onClick={handleLikeToggle}
            className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
              isLiked
                ? 'text-rose-500 hover:text-rose-400'
                : 'text-slate-400 hover:text-rose-400'
            }`}
          >
            <Heart
              className={`w-4 h-4 transition-transform ${
                isLiked ? 'fill-rose-500 scale-110' : 'hover:scale-110'
              }`}
            />
            <span>{likesCount}</span>
            <span className="hidden sm:inline">{likesCount === 1 ? 'Like' : 'Likes'}</span>
          </button>

          {/* Comment Toggle Button */}
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
              showComments
                ? 'text-indigo-400'
                : 'text-slate-400 hover:text-indigo-400'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>{commentsCount > 0 ? commentsCount : 'Comments'}</span>
          </button>
        </div>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
          title="Share Post"
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <Share2 className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">{copied ? 'Copied' : 'Share'}</span>
        </button>
      </div>

      {/* Collapsible Comment Section */}
      {showComments && (
        <div className="px-4 sm:px-5 pb-4 bg-slate-950/60">
          <CommentSection
            postId={post._id}
            postAuthorId={author._id}
            onCommentCountChange={(count) => setCommentsCount(count)}
            onNavigateUser={onNavigateUser}
          />
        </div>
      )}
    </article>
  );
};
