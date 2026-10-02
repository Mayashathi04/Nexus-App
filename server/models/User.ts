import bcrypt from 'bcryptjs';
import mongoose, { Schema } from 'mongoose';
import { generateObjectId } from '../utils/objectId.ts';
import { loadStore, saveStore } from '../config/db.ts';

export interface IUser {
  _id: string;
  name: string;
  username: string;
  email: string;
  password?: string;
  profilePicture: string;
  bio: string;
  followers: string[];
  following: string[];
  createdAt: string;
  updatedAt: string;
}

// Mongoose Schema definition for when real MongoDB is connected
const userMongooseSchema = new Schema<IUser>({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true, trim: true, lowercase: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: '' },
  bio: { type: String, default: '' },
  followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

export const UserMongooseModel = mongoose.models.User || mongoose.model<IUser>('User', userMongooseSchema);

export class UserModel {
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  static async comparePassword(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }

  static async find(query: Record<string, any> = {}): Promise<IUser[]> {
    if (mongoose.connection.readyState === 1) {
      try {
        const users = await UserMongooseModel.find(query).select('-password').lean();
        return users.map((u: any) => ({ ...u, _id: u._id.toString() }));
      } catch (e) {
        console.error('Mongo find error, falling back:', e);
      }
    }
    const store = loadStore();
    return store.users
      .filter(u => {
        for (const key of Object.keys(query)) {
          if (key === '$or') {
            const orMatched = query.$or.some((subQuery: any) => {
              return Object.entries(subQuery).every(([k, v]: [string, any]) => {
                if (v && v.$regex) {
                  const reg = new RegExp(v.$regex, v.$options || 'i');
                  return reg.test(u[k] || '');
                }
                return u[k] === v;
              });
            });
            if (!orMatched) return false;
          } else if (query[key] && query[key].$regex) {
            const reg = new RegExp(query[key].$regex, query[key].$options || 'i');
            if (!reg.test(u[key] || '')) return false;
          } else if (query[key] && query[key].$in) {
            if (!query[key].$in.includes(u[key])) return false;
          } else if (u[key] !== query[key]) {
            return false;
          }
        }
        return true;
      })
      .map(u => {
        const { password, ...safeUser } = u;
        return safeUser as IUser;
      });
  }

  static async findOne(query: Record<string, any>): Promise<IUser | null> {
    if (mongoose.connection.readyState === 1) {
      try {
        const user = await UserMongooseModel.findOne(query).lean();
        if (user) return { ...user, _id: (user as any)._id.toString() } as IUser;
      } catch (e) {
        console.error('Mongo findOne error, falling back:', e);
      }
    }
    const store = loadStore();
    const user = store.users.find(u => {
      for (const [k, v] of Object.entries(query)) {
        if (typeof v === 'string') {
          if ((u[k] || '').toLowerCase() !== v.toLowerCase()) return false;
        } else if (u[k] !== v) {
          return false;
        }
      }
      return true;
    });
    return user ? ({ ...user } as IUser) : null;
  }

  static async findById(id: string): Promise<IUser | null> {
    if (!id) return null;
    if (mongoose.connection.readyState === 1) {
      try {
        const user = await UserMongooseModel.findById(id).lean();
        if (user) return { ...user, _id: (user as any)._id.toString() } as IUser;
      } catch (e) {
        // fallback
      }
    }
    const store = loadStore();
    const user = store.users.find(u => u._id === id.toString());
    return user ? ({ ...user } as IUser) : null;
  }

  static async create(userData: Partial<IUser>): Promise<IUser> {
    const now = new Date().toISOString();
    const newUser: IUser = {
      _id: userData._id || generateObjectId(),
      name: userData.name || '',
      username: (userData.username || '').toLowerCase().trim(),
      email: (userData.email || '').toLowerCase().trim(),
      password: userData.password || '',
      profilePicture: userData.profilePicture || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      bio: userData.bio || 'Exploring new horizons on NEXUS.',
      followers: userData.followers || [],
      following: userData.following || [],
      createdAt: userData.createdAt || now,
      updatedAt: userData.updatedAt || now
    };

    if (mongoose.connection.readyState === 1) {
      try {
        const created = await UserMongooseModel.create(newUser);
        return { ...created.toObject(), _id: created._id.toString() };
      } catch (e) {
        console.error('Mongo create error, falling back:', e);
      }
    }

    const store = loadStore();
    store.users.push(newUser);
    saveStore(store);
    return newUser;
  }

  static async findByIdAndUpdate(id: string, update: any, options: { new?: boolean } = { new: true }): Promise<IUser | null> {
    if (mongoose.connection.readyState === 1) {
      try {
        const updated = await UserMongooseModel.findByIdAndUpdate(id, update, { new: true }).lean();
        if (updated) return { ...updated, _id: (updated as any)._id.toString() } as IUser;
      } catch (e) {
        // fallback
      }
    }
    const store = loadStore();
    const index = store.users.findIndex(u => u._id === id.toString());
    if (index === -1) return null;

    const current = store.users[index];
    
    // Handle $push, $pull, $addToSet, direct updates
    let updatedUser = { ...current };

    if (update.$push || update.$addToSet) {
      const ops = update.$push || update.$addToSet;
      for (const [k, v] of Object.entries(ops)) {
        if (!Array.isArray(updatedUser[k])) updatedUser[k] = [];
        if (update.$addToSet) {
          if (!updatedUser[k].includes(v)) updatedUser[k].push(v);
        } else {
          updatedUser[k].push(v);
        }
      }
    }

    if (update.$pull) {
      for (const [k, v] of Object.entries(update.$pull)) {
        if (Array.isArray(updatedUser[k])) {
          updatedUser[k] = updatedUser[k].filter((item: any) => item !== v);
        }
      }
    }

    // Direct field updates
    for (const [k, v] of Object.entries(update)) {
      if (!k.startsWith('$')) {
        updatedUser[k] = v;
      }
    }

    updatedUser.updatedAt = new Date().toISOString();
    store.users[index] = updatedUser;
    saveStore(store);
    return updatedUser;
  }

  static async countDocuments(query: Record<string, any> = {}): Promise<number> {
    const list = await this.find(query);
    return list.length;
  }
}
