import { Response } from 'express';
import { UserModel } from '../models/User.ts';
import { PostModel } from '../models/Post.ts';
import { NotificationModel } from '../models/Notification.ts';
import { AuthRequest } from '../middleware/authMiddleware.ts';

// @desc    Get user profile by ID or username
// @route   GET /api/users/:id
// @access  Public / Optional Auth
export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    let user = await UserModel.findById(id);
    if (!user) {
      user = await UserModel.findOne({ username: id.toLowerCase() });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { password, ...safeUser } = user;
    const postsCount = await PostModel.countDocuments({ author: user._id });

    // Check if current authenticated user follows this user
    let isFollowing = false;
    if (req.user) {
      isFollowing = user.followers.includes(req.user._id);
    }

    return res.json({
      ...safeUser,
      postsCount,
      followersCount: user.followers.length,
      followingCount: user.following.length,
      isFollowing,
    });
  } catch (error: any) {
    console.error('getUserProfile error:', error);
    return res.status(500).json({ message: error.message || 'Error fetching user profile' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private (Owner only)
export const updateUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!req.user || req.user._id !== id) {
      return res.status(403).json({ message: 'Not authorized to edit this profile' });
    }

    const { name, username, bio, profilePicture } = req.body;
    const updateData: Record<string, any> = {};

    if (name) updateData.name = name.trim();
    if (bio !== undefined) updateData.bio = bio.trim();
    if (profilePicture) updateData.profilePicture = profilePicture;

    if (username) {
      const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');
      if (cleanUsername !== req.user.username) {
        const existing = await UserModel.findOne({ username: cleanUsername });
        if (existing && existing._id !== id) {
          return res.status(400).json({ message: 'Username is already taken by another user' });
        }
        updateData.username = cleanUsername;
      }
    }

    const updatedUser = await UserModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { password, ...safeUser } = updatedUser;
    return res.json(safeUser);
  } catch (error: any) {
    console.error('updateUserProfile error:', error);
    return res.status(500).json({ message: error.message || 'Error updating profile' });
  }
};

// @desc    Search users by name or username
// @route   GET /api/users/search
// @access  Public
export const searchUsers = async (req: AuthRequest, res: Response) => {
  try {
    const query = req.query.q as string;
    if (!query || !query.trim()) {
      // Return suggestions
      const allUsers = await UserModel.find({});
      const safe = allUsers.slice(0, 10).map(({ password, ...u }: any) => u);
      return res.json(safe);
    }

    const clean = query.trim();
    const regexQuery = {
      $or: [
        { name: { $regex: clean, $options: 'i' } },
        { username: { $regex: clean, $options: 'i' } },
      ],
    };

    const users = await UserModel.find(regexQuery);
    return res.json(users);
  } catch (error: any) {
    console.error('searchUsers error:', error);
    return res.status(500).json({ message: error.message || 'Error searching users' });
  }
};

// @desc    Follow a user
// @route   POST /api/users/:id/follow
// @access  Private
export const followUser = async (req: AuthRequest, res: Response) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user!._id;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const targetUser = await UserModel.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User to follow not found' });
    }

    // Add to target user's followers
    await UserModel.findByIdAndUpdate(targetUserId, {
      $addToSet: { followers: currentUserId }
    });

    // Add to current user's following
    const updatedCurrentUser = await UserModel.findByIdAndUpdate(currentUserId, {
      $addToSet: { following: targetUserId }
    });

    // Trigger notification
    await NotificationModel.create({
      recipient: targetUserId,
      sender: currentUserId,
      type: 'follow',
      read: false,
    });

    return res.json({
      message: `Now following @${targetUser.username}`,
      following: true,
      currentUserFollowing: updatedCurrentUser?.following || [],
    });
  } catch (error: any) {
    console.error('followUser error:', error);
    return res.status(500).json({ message: error.message || 'Error following user' });
  }
};

// @desc    Unfollow a user
// @route   DELETE /api/users/:id/follow
// @access  Private
export const unfollowUser = async (req: AuthRequest, res: Response) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user!._id;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: 'You cannot unfollow yourself' });
    }

    const targetUser = await UserModel.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove from target user's followers
    await UserModel.findByIdAndUpdate(targetUserId, {
      $pull: { followers: currentUserId }
    });

    // Remove from current user's following
    const updatedCurrentUser = await UserModel.findByIdAndUpdate(currentUserId, {
      $pull: { following: targetUserId }
    });

    return res.json({
      message: `Unfollowed @${targetUser.username}`,
      following: false,
      currentUserFollowing: updatedCurrentUser?.following || [],
    });
  } catch (error: any) {
    console.error('unfollowUser error:', error);
    return res.status(500).json({ message: error.message || 'Error unfollowing user' });
  }
};

// @desc    Get user's followers
// @route   GET /api/users/:id/followers
// @access  Public
export const getUserFollowers = async (req: AuthRequest, res: Response) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const followers = await UserModel.find({ _id: { $in: user.followers } });
    return res.json(followers);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's following
// @route   GET /api/users/:id/following
// @access  Public
export const getUserFollowing = async (req: AuthRequest, res: Response) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const following = await UserModel.find({ _id: { $in: user.following } });
    return res.json(following);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
