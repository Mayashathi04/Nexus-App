import mongoose, { Schema } from 'mongoose';
import { generateObjectId } from '../utils/objectId.ts';
import { loadStore, saveStore } from '../config/db.ts';
import { UserModel } from './User.ts';

export interface IPost {
  _id: string;
  author: any; // User ID or populated user object
  caption: string;
  image?: string;
  hashtags: string[];
  likes: string[]; // User IDs who liked
  createdAt: string;
  updatedAt: string;
}

const postMongooseSchema = new Schema<IPost>({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  caption: { type: String, required: true },
  image: { type: String, default: '' },
  hashtags: [{ type: String }],
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

export const PostMongooseModel = mongoose.models.Post || mongoose.model<IPost>('Post', postMongooseSchema);

export class PostModel {
  static async populateAuthor(post: IPost): Promise<IPost> {
    if (!post) return post;
    const authorId = typeof post.author === 'string' ? post.author : post.author?._id;
    if (authorId) {
      const user = await UserModel.findById(authorId.toString());
      if (user) {
        return {
          ...post,
          author: {
            _id: user._id,
            name: user.name,
            username: user.username,
            profilePicture: user.profilePicture,
          }
        };
      }
    }
    return post;
  }

  static async find(query: Record<string, any> = {}, options: { sort?: Record<string, number>; limit?: number } = {}): Promise<IPost[]> {
    if (mongoose.connection.readyState === 1) {
      try {
        let mQuery = PostMongooseModel.find(query);
        if (options.sort) mQuery = mQuery.sort(options.sort as any);
        if (options.limit) mQuery = mQuery.limit(options.limit);
        const posts = await mQuery.populate('author', 'name username profilePicture').lean();
        return posts.map((p: any) => ({ ...p, _id: p._id.toString() }));
      } catch (e) {
        console.error('Mongo post find error, falling back:', e);
      }
    }

    const store = loadStore();
    let posts = store.posts.filter(p => {
      for (const [k, v] of Object.entries(query)) {
        if (k === 'author') {
          if (v && v.$in) {
            const authorId = typeof p.author === 'string' ? p.author : p.author?._id;
            if (!v.$in.includes(authorId)) return false;
          } else {
            const authorId = typeof p.author === 'string' ? p.author : p.author?._id;
            if (authorId !== v) return false;
          }
        } else if (k === 'hashtags' && v && v.$in) {
          const hasMatch = p.hashtags && p.hashtags.some((tag: string) => v.$in.includes(tag.toLowerCase()));
          if (!hasMatch) return false;
        } else if (k === 'search') {
          const reg = new RegExp(v, 'i');
          const matchCaption = reg.test(p.caption || '');
          const matchTag = (p.hashtags || []).some((t: string) => reg.test(t));
          if (!matchCaption && !matchTag) return false;
        } else if (p[k] !== v) {
          return false;
        }
      }
      return true;
    });

    // Default sort by createdAt descending
    posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (options.limit) {
      posts = posts.slice(0, options.limit);
    }

    // Populate authors
    const populated = await Promise.all(posts.map(p => this.populateAuthor(p)));
    return populated;
  }

  static async findById(id: string): Promise<IPost | null> {
    if (!id) return null;
    if (mongoose.connection.readyState === 1) {
      try {
        const post = await PostMongooseModel.findById(id).populate('author', 'name username profilePicture').lean();
        if (post) return { ...post, _id: (post as any)._id.toString() } as IPost;
      } catch (e) {}
    }
    const store = loadStore();
    const post = store.posts.find(p => p._id === id.toString());
    if (!post) return null;
    return this.populateAuthor({ ...post });
  }

  static async create(postData: Partial<IPost>): Promise<IPost> {
    const now = new Date().toISOString();
    const newPost: IPost = {
      _id: postData._id || generateObjectId(),
      author: postData.author,
      caption: postData.caption || '',
      image: postData.image || '',
      hashtags: postData.hashtags || [],
      likes: postData.likes || [],
      createdAt: postData.createdAt || now,
      updatedAt: postData.updatedAt || now,
    };

    if (mongoose.connection.readyState === 1) {
      try {
        const created = await PostMongooseModel.create(newPost);
        const pop = await PostMongooseModel.findById(created._id).populate('author', 'name username profilePicture').lean();
        return { ...pop, _id: (pop as any)._id.toString() };
      } catch (e) {
        console.error('Mongo post create fallback:', e);
      }
    }

    const store = loadStore();
    store.posts.unshift(newPost);
    saveStore(store);
    return this.populateAuthor(newPost);
  }

  static async findByIdAndUpdate(id: string, update: any, options: { new?: boolean } = { new: true }): Promise<IPost | null> {
    if (mongoose.connection.readyState === 1) {
      try {
        const updated = await PostMongooseModel.findByIdAndUpdate(id, update, { new: true }).populate('author', 'name username profilePicture').lean();
        if (updated) return { ...updated, _id: (updated as any)._id.toString() } as IPost;
      } catch (e) {}
    }

    const store = loadStore();
    const index = store.posts.findIndex(p => p._id === id.toString());
    if (index === -1) return null;

    let current = { ...store.posts[index] };

    if (update.$push || update.$addToSet) {
      const ops = update.$push || update.$addToSet;
      for (const [k, v] of Object.entries(ops)) {
        if (!Array.isArray(current[k])) current[k] = [];
        if (update.$addToSet) {
          if (!current[k].includes(v)) current[k].push(v);
        } else {
          current[k].push(v);
        }
      }
    }

    if (update.$pull) {
      for (const [k, v] of Object.entries(update.$pull)) {
        if (Array.isArray(current[k])) {
          current[k] = current[k].filter((item: any) => item !== v);
        }
      }
    }

    for (const [k, v] of Object.entries(update)) {
      if (!k.startsWith('$')) {
        current[k] = v;
      }
    }

    current.updatedAt = new Date().toISOString();
    store.posts[index] = current;
    saveStore(store);
    return this.populateAuthor(current);
  }

  static async findByIdAndDelete(id: string): Promise<boolean> {
    if (mongoose.connection.readyState === 1) {
      try {
        await PostMongooseModel.findByIdAndDelete(id);
      } catch (e) {}
    }
    const store = loadStore();
    const beforeLen = store.posts.length;
    store.posts = store.posts.filter(p => p._id !== id.toString());
    // Also remove comments on this post
    store.comments = store.comments.filter(c => c.post !== id.toString());
    saveStore(store);
    return store.posts.length < beforeLen;
  }

  static async countDocuments(query: Record<string, any> = {}): Promise<number> {
    const list = await this.find(query);
    return list.length;
  }
}
