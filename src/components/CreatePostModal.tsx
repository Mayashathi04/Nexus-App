import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotifications } from '../context/NotificationContext.tsx';
import { postAPI } from '../services/api.ts';
import { X, Image as ImageIcon, Hash, Sparkles, Loader2, Link2 } from 'lucide-react';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (newPost: any) => void;
}

const PRESET_IMAGES = [
  { label: 'Campus & Code', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80' },
  { label: 'AI Lab & Robotics', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Creative Design', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Tech Workspace', url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop&q=80' },
];

const SUGGESTED_TAGS = ['MERN', 'FullStack', 'React', 'NodeJS', 'SocketIO', 'WebDev', 'CollegeProject', 'Innovation'];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onPostCreated,
}) => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [hashtagInput, setHashtagInput] = useState('');
  const [hashtags, setHashtags] = useState<string[]>(['MERN', 'WebDev']);
  const [submitting, setSubmitting] = useState(false);
  const [showImageInput, setShowImageInput] = useState(false);

  if (!isOpen) return null;

  const handleAddTag = (tag: string) => {
    const clean = tag.replace('#', '').trim().toLowerCase();
    if (clean && !hashtags.includes(clean)) {
      setHashtags([...hashtags, clean]);
    }
    setHashtagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setHashtags(hashtags.filter((t) => t !== tagToRemove));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      showToast('File Too Large', 'Please select an image smaller than 8MB', undefined, 'info');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim() && !imageUrl) {
      showToast('Missing Content', 'Please enter a caption or add an image', undefined, 'info');
      return;
    }

    setSubmitting(true);
    try {
      const res = await postAPI.create({
        caption: caption.trim(),
        image: imageUrl || undefined,
        hashtags,
      });

      showToast('Post Created', 'Your post is now live on NEXUS!', undefined, 'success');
      onPostCreated(res.data);
      onClose();
      // Reset form
      setCaption('');
      setImageUrl('');
      setHashtags(['MERN', 'WebDev']);
      setShowImageInput(false);
    } catch (err: any) {
      console.error('Error creating post:', err);
      showToast('Error', err.response?.data?.message || 'Failed to create post', undefined, 'info');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in-50">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-white">Create New Post</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {/* User info */}
          <div className="flex items-center gap-3">
            <img
              src={user?.profilePicture}
              alt=""
              className="w-10 h-10 rounded-full object-cover border border-indigo-500/40"
            />
            <div>
              <p className="text-sm font-semibold text-white">{user?.name}</p>
              <p className="text-xs text-slate-400 font-mono">@{user?.username}</p>
            </div>
          </div>

          {/* Caption textarea */}
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={4}
            placeholder="Share your thoughts, engineering updates, project breakthroughs or college findings..."
            className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
          />

          {/* Hashtag management */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={hashtagInput}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag(hashtagInput);
                    }
                  }}
                  placeholder="Add hashtag & press enter..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <button
                type="button"
                onClick={() => handleAddTag(hashtagInput)}
                className="px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Add Tag
              </button>
            </div>

            {/* Current Tags */}
            <div className="flex flex-wrap gap-1.5">
              {hashtags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-400 focus:outline-none"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>

            {/* Quick suggested chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] text-slate-500">Suggestions:</span>
              {SUGGESTED_TAGS.slice(0, 5).map((stag) => (
                <button
                  key={stag}
                  type="button"
                  onClick={() => handleAddTag(stag)}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                >
                  +{stag}
                </button>
              ))}
            </div>
          </div>

          {/* Image Upload / URL Controls */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span className="font-medium">Attach Photograph or Artwork</span>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <span>&bull;</span>
                <button
                  type="button"
                  onClick={() => setShowImageInput(!showImageInput)}
                  className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Image URL</span>
                </button>
              </div>
            </div>

            {showImageInput && (
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Paste https:// image link here..."
                className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            )}

            {/* Preset image suggestions for fast college testing */}
            {!imageUrl && (
              <div className="grid grid-cols-4 gap-2 pt-1">
                {PRESET_IMAGES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImageUrl(preset.url)}
                    className="group relative rounded-lg overflow-hidden border border-slate-800 hover:border-indigo-500/50 aspect-video text-left focus:outline-none"
                  >
                    <img
                      src={preset.url}
                      alt={preset.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent flex items-end p-1">
                      <span className="text-[9px] text-white font-medium truncate">
                        {preset.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Image Preview */}
            {imageUrl && (
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 max-h-48">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-950/80 hover:bg-rose-500 text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || (!caption.trim() && !imageUrl)}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-xs font-bold hover:from-indigo-500 hover:to-indigo-400 shadow-lg shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                'Publish Post'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
