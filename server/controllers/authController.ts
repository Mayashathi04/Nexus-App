import { Request, Response } from 'express';
import { UserModel } from '../models/User.ts';
import { generateToken } from '../utils/generateToken.ts';
import { AuthRequest } from '../middleware/authMiddleware.ts';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, username, email, password, confirmPassword, profilePicture, bio } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields (name, username, email, password)' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');
    const cleanEmail = email.toLowerCase().trim();

    // Check duplicate email
    const emailExists = await UserModel.findOne({ email: cleanEmail });
    if (emailExists) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Check duplicate username
    const usernameExists = await UserModel.findOne({ username: cleanUsername });
    if (usernameExists) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    // Hash password
    const hashedPassword = await UserModel.hashPassword(password);

    // Default avatar if none provided
    const defaultAvatar = profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanUsername}`;

    const user = await UserModel.create({
      name: name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      password: hashedPassword,
      profilePicture: defaultAvatar,
      bio: bio ? bio.trim() : 'Exploring new horizons on NEXUS.',
      followers: [],
      following: [],
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      token,
    });
  } catch (error: any) {
    console.error('Register error:', error);
    return res.status(500).json({ message: error.message || 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { identifier, email, username, password } = req.body;
    const loginId = (identifier || email || username || '').toLowerCase().trim();

    if (!loginId || !password) {
      return res.status(400).json({ message: 'Please provide email/username and password' });
    }

    // Find by email or username
    let user = await UserModel.findOne({ email: loginId });
    if (!user) {
      user = await UserModel.findOne({ username: loginId });
    }

    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid credentials. Please check your username/email and password.' });
    }

    const isMatch = await UserModel.comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials. Password is incorrect.' });
    }

    const token = generateToken(user._id);

    return res.json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      token,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ message: error.message || 'Server error during login' });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    const user = await UserModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const { password, ...safeUser } = user;
    return res.json(safeUser);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Error fetching user' });
  }
};

// @desc    Logout user (stateless JWT token cleared on client)
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = async (req: Request, res: Response) => {
  return res.json({ message: 'Logged out successfully' });
};
