import mongoose, { Schema } from 'mongoose';
import { generateObjectId } from '../utils/objectId.ts';
import { loadStore, saveStore } from '../config/db.ts';
import { UserModel } from './User.ts';

export interface IMessage {
  _id: string;
  conversation: any;
  sender: any;
  receiver: any;
  content: string;
  read: boolean;
  createdAt: string;
}

const messageMongooseSchema = new Schema<IMessage>({
  conversation: { type: Schema.Types.Mixed, ref: 'Conversation', required: true },
  sender: { type: Schema.Types.Mixed, ref: 'User', required: true },
  receiver: { type: Schema.Types.Mixed, ref: 'User', required: true },
  content: { type: String, required: true },
  read: { type: Boolean, default: false },
}, { timestamps: true });

export const MessageMongooseModel = mongoose.models.Message || mongoose.model<IMessage>('Message', messageMongooseSchema);

export class MessageModel {
  static async populateUsers(msg: IMessage): Promise<IMessage> {
    if (!msg) return msg;
    const sId = typeof msg.sender === 'string' ? msg.sender : msg.sender?._id;
    const rId = typeof msg.receiver === 'string' ? msg.receiver : msg.receiver?._id;

    const sender = sId ? await UserModel.findById(sId.toString()) : null;
    const receiver = rId ? await UserModel.findById(rId.toString()) : null;

    return {
      ...msg,
      sender: sender ? { _id: sender._id, name: sender.name, username: sender.username, profilePicture: sender.profilePicture } : msg.sender,
      receiver: receiver ? { _id: receiver._id, name: receiver.name, username: receiver.username, profilePicture: receiver.profilePicture } : msg.receiver,
    };
  }

  static async find(query: Record<string, any> = {}): Promise<IMessage[]> {
    if (mongoose.connection.readyState === 1) {
      try {
        const messages = await MessageMongooseModel.find(query).populate('sender', 'name username profilePicture').populate('receiver', 'name username profilePicture').sort({ createdAt: 1 }).lean();
        return messages.map((m: any) => ({ ...m, _id: m._id.toString() }));
      } catch (e) {}
    }

    const store = loadStore();
    const messages = store.messages.filter(m => {
      for (const [k, v] of Object.entries(query)) {
        if (m[k] !== v) return false;
      }
      return true;
    });

    messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return Promise.all(messages.map(m => this.populateUsers(m)));
  }

  static async create(msgData: Partial<IMessage>): Promise<IMessage> {
    const now = new Date().toISOString();
    const newMsg: IMessage = {
      _id: msgData._id || generateObjectId(),
      conversation: msgData.conversation || '',
      sender: msgData.sender,
      receiver: msgData.receiver,
      content: msgData.content || '',
      read: msgData.read || false,
      createdAt: msgData.createdAt || now,
    };

    if (mongoose.connection.readyState === 1) {
      try {
        const created = await MessageMongooseModel.create(newMsg);
        const pop = await MessageMongooseModel.findById(created._id).populate('sender', 'name username profilePicture').populate('receiver', 'name username profilePicture').lean();
        return { ...pop, _id: (pop as any)._id.toString() };
      } catch (e) {}
    }

    const store = loadStore();
    store.messages.push(newMsg);
    saveStore(store);
    return this.populateUsers(newMsg);
  }

  static async updateMany(filter: Record<string, any>, update: Record<string, any>): Promise<number> {
    if (mongoose.connection.readyState === 1) {
      try {
        await MessageMongooseModel.updateMany(filter, update);
      } catch (e) {}
    }

    const store = loadStore();
    let count = 0;
    store.messages.forEach(m => {
      let match = true;
      for (const [k, v] of Object.entries(filter)) {
        if (m[k] !== v) {
          match = false;
          break;
        }
      }
      if (match) {
        for (const [uk, uv] of Object.entries(update)) {
          m[uk] = uv;
        }
        count++;
      }
    });

    if (count > 0) {
      saveStore(store);
    }
    return count;
  }
}
