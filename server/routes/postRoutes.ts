import { Router } from 'express';
import {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
} from '../controllers/postController.ts';
import { getComments, addComment } from '../controllers/commentController.ts';
import { protect, optionalAuth } from '../middleware/authMiddleware.ts';

const router = Router();

router.get('/', optionalAuth, getPosts);
router.post('/', protect, createPost);
router.get('/:id', optionalAuth, getPostById);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

// Likes
router.post('/:id/like', protect, likePost);
router.delete('/:id/like', protect, unlikePost);

// Comments nested route
router.get('/:id/comments', getComments);
router.post('/:id/comments', protect, addComment);

export default router;
