import { Response } from 'express';
import { PostModel } from '../models/Post.ts';
import { UserModel } from '../models/User.ts';
import { NotificationModel } from '../models/Notification.ts';
import { AuthRequest } from '../middleware/authMiddleware.ts';

// @desc    Get all posts (social feed or explore)
// @route   GET /api/posts
// @access  Public / Optional Auth
export const getPosts = async (req: AuthRequest, res: Response) => {
  try {
    const { feed, author, hashtag, q } = req.query;
    let query: Record<string, any> = {};

    if (author) {
      query.author = author;
    } else if (feed === 'true' && req.user) {
      // Social feed: posts from followed users + current user
      const currentUser = await UserModel.findById(req.user._id);
      const followingList = currentUser?.following || [];
      query.author = { $in: [req.user._id, ...followingList] };
    }

    if (hashtag) {
      query.hashtags = { $in: [(hashtag as string).toLowerCase().replace('#', '')] };
    }

    if (q) {
      query.search = (q as string).trim();
    }

    const posts = await PostModel.find(query, { sort: { createdAt: -1 } });

    // Enhance posts with like status for authenticated user
    const formatted = posts.map(p => {
      const isLiked = req.user ? p.likes.includes(req.user._id) : false;
      return {
        ...p,
        likesCount: p.likes.length,
        isLiked,
      };
    });

    return res.json(formatted);
  } catch (error: any) {
    console.error('getPosts error:', error);
    return res.status(500).json({ message: error.message || 'Error fetching posts' });
  }
};

// @desc    Get post by ID
// @route   GET /api/posts/:id
// @access  Public / Optional Auth
export const getPostById = async (req: AuthRequest, res: Response) => {
  try {
    const post = await PostModel.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isLiked = req.user ? post.likes.includes(req.user._id) : false;
    return res.json({
      ...post,
      likesCount: post.likes.length,
      isLiked,
    });
  } catch (error: any) {
    console.error('getPostById error:', error);
    return res.status(500).json({ message: error.message || 'Error fetching post' });
  }
};

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    const { caption, image, hashtags } = req.body;

    if (!caption && !image) {
      return res.status(400).json({ message: 'Please provide a caption or an image for your post' });
    }

    // Parse hashtags if provided as string or array
    let parsedHashtags: string[] = [];
    if (Array.isArray(hashtags)) {
      parsedHashtags = hashtags.map(h => h.replace('#', '').trim().toLowerCase());
    } else if (typeof hashtags === 'string') {
      parsedHashtags = hashtags
        .split(/[\s,]+/)
        .map(h => h.replace('#', '').trim().toLowerCase())
        .filter(Boolean);
    } else if (caption) {
      // Extract from caption regex
      const found = caption.match(/#[a-z0-9_]+/gi);
      if (found) {
        parsedHashtags = found.map((h: string) => h.substring(1).toLowerCase());
      }
    }

    const post = await PostModel.create({
      author: req.user!._id,
      caption: (caption || '').trim(),
      image: image || '',
      hashtags: Array.from(new Set(parsedHashtags)),
      likes: [],
    });

    return res.status(201).json({
      ...post,
      likesCount: 0,
      isLiked: false,
    });
  } catch (error: any) {
    console.error('createPost error:', error);
    return res.status(500).json({ message: error.message || 'Error creating post' });
  }
};

// @desc    Update own post
// @route   PUT /api/posts/:id
// @access  Private (Owner only)
export const updatePost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const post = await PostModel.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const authorId = typeof post.author === 'string' ? post.author : post.author?._id;
    if (authorId !== req.user!._id) {
      return res.status(403).json({ message: 'Not authorized to edit this post' });
    }

    const { caption, image, hashtags } = req.body;
    const updateData: Record<string, any> = {};
    if (caption !== undefined) updateData.caption = caption.trim();
    if (image !== undefined) updateData.image = image;
    if (hashtags !== undefined) {
      updateData.hashtags = Array.isArray(hashtags)
        ? hashtags.map(h => h.replace('#', '').trim().toLowerCase())
        : [];
    }

    const updated = await PostModel.findByIdAndUpdate(id, updateData);
    if (!updated) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isLiked = updated.likes.includes(req.user!._id);
    return res.json({
      ...updated,
      likesCount: updated.likes.length,
      isLiked,
    });
  } catch (error: any) {
    console.error('updatePost error:', error);
    return res.status(500).json({ message: error.message || 'Error updating post' });
  }
};

// @desc    Delete own post
// @route   DELETE /api/posts/:id
// @access  Private (Owner only)
export const deletePost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const post = await PostModel.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const authorId = typeof post.author === 'string' ? post.author : post.author?._id;
    if (authorId !== req.user!._id) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await PostModel.findByIdAndDelete(id);
    return res.json({ message: 'Post deleted successfully', id });
  } catch (error: any) {
    console.error('deletePost error:', error);
    return res.status(500).json({ message: error.message || 'Error deleting post' });
  }
};

// @desc    Like a post
// @route   POST /api/posts/:id/like
// @access  Private
export const likePost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const post = await PostModel.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const currentUserId = req.user!._id;

    // Check if already liked
    if (post.likes.includes(currentUserId)) {
      return res.status(400).json({ message: 'Post already liked', likesCount: post.likes.length, isLiked: true });
    }

    const updated = await PostModel.findByIdAndUpdate(id, {
      $addToSet: { likes: currentUserId }
    });

    const authorId = typeof post.author === 'string' ? post.author : post.author?._id;
    // Don't notify if liking own post
    if (authorId && authorId !== currentUserId) {
      await NotificationModel.create({
        recipient: authorId,
        sender: currentUserId,
        type: 'like',
        post: id,
        read: false,
      });
    }

    const likesCount = updated ? updated.likes.length : post.likes.length + 1;
    return res.json({
      message: 'Post liked',
      likesCount,
      isLiked: true,
    });
  } catch (error: any) {
    console.error('likePost error:', error);
    return res.status(500).json({ message: error.message || 'Error liking post' });
  }
};

// @desc    Unlike a post
// @route   DELETE /api/posts/:id/like
// @access  Private
export const unlikePost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const post = await PostModel.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const currentUserId = req.user!._id;

    const updated = await PostModel.findByIdAndUpdate(id, {
      $pull: { likes: currentUserId }
    });

    const likesCount = updated ? updated.likes.length : Math.max(0, post.likes.length - 1);
    return res.json({
      message: 'Post unliked',
      likesCount,
      isLiked: false,
    });
  } catch (error: any) {
    console.error('unlikePost error:', error);
    return res.status(500).json({ message: error.message || 'Error unliking post' });
  }
};
