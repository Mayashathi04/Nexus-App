import mongoose, { Schema } from 'mongoose';
import { generateObjectId } from '../utils/objectId.ts';
import { loadStore, saveStore } from '../config/db.ts';
import { UserModel } from './User.ts';

export interface IComment {
  _id: string;
  post: any;
  author: any;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const commentMongooseSchema = new Schema<IComment>({
  post: { type: Schema.Types.Mixed, ref: 'Post', required: true },
  author: { type: Schema.Types.Mixed, ref: 'User', required: true },
  content: { type: String, required: true },
}, { timestamps: true });

export const CommentMongooseModel = mongoose.models.Comment || mongoose.model<IComment>('Comment', commentMongooseSchema);

export class CommentModel {
  static async populateAuthor(comment: IComment): Promise<IComment> {
    if (!comment) return comment;
    const authorId = typeof comment.author === 'string' ? comment.author : comment.author?._id;
    if (authorId) {
      const user = await UserModel.findById(authorId.toString());
      if (user) {
        return {
          ...comment,
          author: {
            _id: user._id,
            name: user.name,
            username: user.username,
            profilePicture: user.profilePicture,
          }
        };
      }
    }
    return comment;
  }

  static async find(query: Record<string, any> = {}): Promise<IComment[]> {
    if (mongoose.connection.readyState === 1) {
      try {
        const comments = await CommentMongooseModel.find(query).populate('author', 'name username profilePicture').sort({ createdAt: 1 }).lean();
        return comments.map((c: any) => ({ ...c, _id: c._id.toString() }));
      } catch (e) {}
    }

    const store = loadStore();
    const comments = store.comments.filter(c => {
      for (const [k, v] of Object.entries(query)) {
        if (c[k] !== v) return false;
      }
      return true;
    });

    comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return Promise.all(comments.map(c => this.populateAuthor(c)));
  }

  static async findById(id: string): Promise<IComment | null> {
    if (!id) return null;
    if (mongoose.connection.readyState === 1) {
      try {
        const c = await CommentMongooseModel.findById(id).populate('author', 'name username profilePicture').lean();
        if (c) return { ...c, _id: (c as any)._id.toString() } as IComment;
      } catch (e) {}
    }

    const store = loadStore();
    const comment = store.comments.find(c => c._id === id.toString());
    if (!comment) return null;
    return this.populateAuthor({ ...comment });
  }

  static async create(commentData: Partial<IComment>): Promise<IComment> {
    const now = new Date().toISOString();
    const newComment: IComment = {
      _id: commentData._id || generateObjectId(),
      post: commentData.post || '',
      author: commentData.author,
      content: commentData.content || '',
      createdAt: commentData.createdAt || now,
      updatedAt: commentData.updatedAt || now,
    };

    if (mongoose.connection.readyState === 1) {
      try {
        const created = await CommentMongooseModel.create(newComment);
        const pop = await CommentMongooseModel.findById(created._id).populate('author', 'name username profilePicture').lean();
        return { ...pop, _id: (pop as any)._id.toString() };
      } catch (e) {}
    }

    const store = loadStore();
    store.comments.push(newComment);
    saveStore(store);
    return this.populateAuthor(newComment);
  }

  static async findByIdAndDelete(id: string): Promise<boolean> {
    if (mongoose.connection.readyState === 1) {
      try {
        await CommentMongooseModel.findByIdAndDelete(id);
      } catch (e) {}
    }

    const store = loadStore();
    const initialLen = store.comments.length;
    store.comments = store.comments.filter(c => c._id !== id.toString());
    saveStore(store);
    return store.comments.length < initialLen;
  }
}
