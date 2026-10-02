import { Router } from 'express';
import {
  getUserProfile,
  updateUserProfile,
  searchUsers,
  followUser,
  unfollowUser,
  getUserFollowers,
  getUserFollowing,
} from '../controllers/userController.ts';
import { protect, optionalAuth } from '../middleware/authMiddleware.ts';

const router = Router();

router.get('/search', searchUsers);
router.get('/:id', optionalAuth, getUserProfile);
router.put('/:id', protect, updateUserProfile);
router.post('/:id/follow', protect, followUser);
router.delete('/:id/follow', protect, unfollowUser);
router.get('/:id/followers', getUserFollowers);
router.get('/:id/following', getUserFollowing);

export default router;
