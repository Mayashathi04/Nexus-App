import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { commentAPI } from '../services/api.ts';
import { Send, Trash2, Loader2, MessageCircle } from 'lucide-react';

interface Comment {
  _id: string;
  post: string;
  author: {
    _id: string;
    name: string;
    username: string;
    profilePicture: string;
  };
  content: string;
  createdAt: string;
}

interface CommentSectionProps {
  postId: string;
  postAuthorId?: string;
  onCommentCountChange?: (count: number) => void;
  onNavigateUser: (userId: string) => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  postAuthorId,
  onCommentCountChange,
  onNavigateUser,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newComment, setNewComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchComments = async () => {
      try {
        const res = await commentAPI.getByPost(postId);
        if (isMounted) {
          setComments(res.data || []);
          if (onCommentCountChange) {
            onCommentCountChange(res.data?.length || 0);
          }
        }
      } catch (err) {
        console.error('Error fetching comments:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchComments();
    return () => {
      isMounted = false;
    };
  }, [postId]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting || !isAuthenticated) return;

    setSubmitting(true);
    try {
      const res = await commentAPI.add(postId, newComment.trim());
      const updated = [...comments, res.data];
      setComments(updated);
      setNewComment('');
      if (onCommentCountChange) {
        onCommentCountChange(updated.length);
      }
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    setDeletingId(commentId);
    try {
      await commentAPI.delete(commentId);
      const updated = comments.filter((c) => c._id !== commentId);
      setComments(updated);
      if (onCommentCountChange) {
        onCommentCountChange(updated.length);
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="pt-3 border-t border-slate-800/80 space-y-3">
      {/* Existing Comments List */}
      {loading ? (
        <div className="flex items-center justify-center py-4 text-slate-500 text-xs">
          <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
          Loading comments...
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-3 text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <MessageCircle className="w-3.5 h-3.5" />
          No comments yet. Be the first to share your thoughts!
        </div>
      ) : (
        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
          {comments.map((comment) => {
            const author = comment.author || {};
            const isOwner = user?._id === author._id || user?._id === postAuthorId;

            return (
              <div
                key={comment._id}
                className="flex items-start justify-between gap-2.5 p-2 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800/50 transition-colors text-xs"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <button
                    onClick={() => onNavigateUser(author._id)}
                    className="flex-shrink-0 focus:outline-none"
                  >
                    <img
                      src={author.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${author.username}`}
                      alt={author.name}
                      className="w-7 h-7 rounded-full object-cover border border-indigo-500/30"
                    />
                  </button>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => onNavigateUser(author._id)}
                        className="font-semibold text-slate-200 hover:text-indigo-400 transition-colors"
                      >
                        {author.name || 'Anonymous'}
                      </button>
                      <span className="text-[10px] text-slate-500 font-mono">
                        @{author.username}
                      </span>
                      <span className="text-[10px] text-slate-600">&bull;</span>
                      <span className="text-[10px] text-slate-500">
                        {formatRelativeTime(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-slate-300 mt-0.5 break-words whitespace-pre-wrap leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </div>

                {isOwner && (
                  <button
                    onClick={() => handleDeleteComment(comment._id)}
                    disabled={deletingId === comment._id}
                    className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors flex-shrink-0"
                    title="Delete comment"
                  >
                    {deletingId === comment._id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Comment Input */}
      {isAuthenticated ? (
        <form onSubmit={handleAddComment} className="flex items-center gap-2 mt-2">
          <img
            src={user?.profilePicture}
            alt=""
            className="w-7 h-7 rounded-full object-cover border border-indigo-500/30 flex-shrink-0"
          />
          <div className="flex-1 relative">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a constructive comment..."
              className="w-full pl-3 pr-10 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 text-indigo-400 hover:text-indigo-300 disabled:opacity-40 disabled:hover:text-indigo-400 transition-colors"
            >
              {submitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </form>
      ) : (
        <p className="text-center text-xs text-slate-500 py-1">
          Please log in to participate in the conversation.
        </p>
      )}
    </div>
  );
};
