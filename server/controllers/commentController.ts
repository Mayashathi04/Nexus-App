import { Response } from 'express';
import { CommentModel } from '../models/Comment.ts';
import { PostModel } from '../models/Post.ts';
import { NotificationModel } from '../models/Notification.ts';
import { AuthRequest } from '../middleware/authMiddleware.ts';

// @desc    Get comments for a post
// @route   GET /api/posts/:id/comments
// @access  Public
export const getComments = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const comments = await CommentModel.find({ post: id });
    return res.json(comments);
  } catch (error: any) {
    console.error('getComments error:', error);
    return res.status(500).json({ message: error.message || 'Error fetching comments' });
  }
};

// @desc    Add comment to a post
// @route   POST /api/posts/:id/comments
// @access  Private
export const addComment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment content cannot be empty' });
    }

    const post = await PostModel.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = await CommentModel.create({
      post: id,
      author: req.user!._id,
      content: content.trim(),
    });

    const postAuthorId = typeof post.author === 'string' ? post.author : post.author?._id;
    // Trigger notification if not commenting on own post
    if (postAuthorId && postAuthorId !== req.user!._id) {
      await NotificationModel.create({
        recipient: postAuthorId,
        sender: req.user!._id,
        type: 'comment',
        post: id,
        read: false,
      });
    }

    return res.status(201).json(comment);
  } catch (error: any) {
    console.error('addComment error:', error);
    return res.status(500).json({ message: error.message || 'Error adding comment' });
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private (Comment author or post author)
export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const comment = await CommentModel.findById(id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const commentAuthorId = typeof comment.author === 'string' ? comment.author : comment.author?._id;
    const currentUserId = req.user!._id;

    if (commentAuthorId !== currentUserId) {
      // Also check if current user is the post author
      const post = await PostModel.findById(comment.post);
      const postAuthorId = typeof post?.author === 'string' ? post.author : post?.author?._id;
      if (postAuthorId !== currentUserId) {
        return res.status(403).json({ message: 'Not authorized to delete this comment' });
      }
    }

    await CommentModel.findByIdAndDelete(id);
    return res.json({ message: 'Comment deleted successfully', id });
  } catch (error: any) {
    console.error('deleteComment error:', error);
    return res.status(500).json({ message: error.message || 'Error deleting comment' });
  }
};
