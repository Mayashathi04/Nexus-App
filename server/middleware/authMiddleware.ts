import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/generateToken.ts';
import { UserModel, IUser } from '../models/User.ts';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = verifyToken(token);

      const user = await UserModel.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: 'User belonging to this token no longer exists' });
      }

      // Strip sensitive password field
      const { password, ...safeUser } = user;
      req.user = safeUser as IUser;
      return next();
    } catch (error: any) {
      console.error('JWT Verification failed:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = verifyToken(token);
      const user = await UserModel.findById(decoded.id);
      if (user) {
        const { password, ...safeUser } = user;
        req.user = safeUser as IUser;
      }
    } catch (e) {
      // Ignore token failure for optional routes
    }
  }
  next();
};

