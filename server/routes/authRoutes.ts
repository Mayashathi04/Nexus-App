import { Router } from 'express';
import { registerUser, loginUser, getMe, logoutUser } from '../controllers/authController.ts';
import { protect } from '../middleware/authMiddleware.ts';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', protect, getMe);

export default router;
