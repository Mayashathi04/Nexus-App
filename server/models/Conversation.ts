import mongoose, { Schema } from 'mongoose';
import { generateObjectId } from '../utils/objectId.ts';
import { loadStore, saveStore } from '../config/db.ts';
import { UserModel } from './User.ts';

export interface IConversation {
  _id: string;
  participants: any[]; // User IDs or populated users
  lastMessage?: {
    content: string;
    sender: string;
    createdAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

const conversationMongooseSchema = new Schema<IConversation>({
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  lastMessage: {
    content: { type: String, default: '' },
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
  },
}, { timestamps: true });

export const ConversationMongooseModel = mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', conversationMongooseSchema);

export class ConversationModel {
  static async populateParticipants(conv: IConversation): Promise<IConversation> {
    if (!conv || !conv.participants) return conv;
    const populatedParticipants = await Promise.all(
      conv.participants.map(async p => {
        const id = typeof p === 'string' ? p : p?._id;
        const user = await UserModel.findById(id);
        if (user) {
          return {
            _id: user._id,
            name: user.name,
            username: user.username,
            profilePicture: user.profilePicture,
          };
        }
        return p;
      })
    );
    return {
      ...conv,
      participants: populatedParticipants,
    };
  }

  static async find(query: Record<string, any> = {}): Promise<IConversation[]> {
    if (mongoose.connection.readyState === 1) {
      try {
        const convs = await ConversationMongooseModel.find(query).populate('participants', 'name username profilePicture').sort({ updatedAt: -1 }).lean();
        return convs.map((c: any) => ({ ...c, _id: c._id.toString() }));
      } catch (e) {}
    }

    const store = loadStore();
    const convs = store.conversations.filter(c => {
      for (const [k, v] of Object.entries(query)) {
        if (k === 'participants' && v && v.$in) {
          const hasParticipant = c.participants.some((p: any) => {
            const pId = typeof p === 'string' ? p : p?._id;
            return v.$in.includes(pId);
          });
          if (!hasParticipant) return false;
        } else if (c[k] !== v) {
          return false;
        }
      }
      return true;
    });

    convs.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
    return Promise.all(convs.map(c => this.populateParticipants(c)));
  }

  static async findById(id: string): Promise<IConversation | null> {
    if (!id) return null;
    if (mongoose.connection.readyState === 1) {
      try {
        const c = await ConversationMongooseModel.findById(id).populate('participants', 'name username profilePicture').lean();
        if (c) return { ...c, _id: (c as any)._id.toString() } as IConversation;
      } catch (e) {}
    }

    const store = loadStore();
    const conv = store.conversations.find(c => c._id === id.toString());
    if (!conv) return null;
    return this.populateParticipants({ ...conv });
  }

  static async findOneBetween(userId1: string, userId2: string): Promise<IConversation | null> {
    const store = loadStore();
    const conv = store.conversations.find(c => {
      const p1 = c.participants.map((p: any) => (typeof p === 'string' ? p : p?._id));
      return p1.includes(userId1) && p1.includes(userId2);
    });
    if (!conv) return null;
    return this.populateParticipants({ ...conv });
  }

  static async create(data: Partial<IConversation>): Promise<IConversation> {
    const now = new Date().toISOString();
    const newConv: IConversation = {
      _id: data._id || generateObjectId(),
      participants: data.participants || [],
      lastMessage: data.lastMessage,
      createdAt: data.createdAt || now,
      updatedAt: data.updatedAt || now,
    };

    if (mongoose.connection.readyState === 1) {
      try {
        const created = await ConversationMongooseModel.create(newConv);
        const pop = await ConversationMongooseModel.findById(created._id).populate('participants', 'name username profilePicture').lean();
        return { ...pop, _id: (pop as any)._id.toString() };
      } catch (e) {}
    }

    const store = loadStore();
    store.conversations.unshift(newConv);
    saveStore(store);
    return this.populateParticipants(newConv);
  }

  static async findByIdAndUpdate(id: string, update: any): Promise<IConversation | null> {
    const store = loadStore();
    const index = store.conversations.findIndex(c => c._id === id.toString());
    if (index === -1) return null;

    const current = { ...store.conversations[index] };
    for (const [k, v] of Object.entries(update)) {
      current[k] = v;
    }
    current.updatedAt = new Date().toISOString();
    store.conversations[index] = current;
    saveStore(store);
    return this.populateParticipants(current);
  }
}
