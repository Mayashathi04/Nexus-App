import mongoose, { Schema } from 'mongoose';
import { generateObjectId } from '../utils/objectId.ts';
import { loadStore, saveStore } from '../config/db.ts';
import { UserModel } from './User.ts';
import { PostModel } from './Post.ts';

export interface INotification {
  _id: string;
  recipient: any;
  sender: any;
  type: 'like' | 'comment' | 'follow' | 'message';
  post?: any;
  message?: any;
  read: boolean;
  createdAt: string;
}

const notificationMongooseSchema = new Schema<INotification>({
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['like', 'comment', 'follow', 'message'], required: true },
  post: { type: Schema.Types.ObjectId, ref: 'Post' },
  message: { type: Schema.Types.ObjectId, ref: 'Message' },
  read: { type: Boolean, default: false },
}, { timestamps: true });

export const NotificationMongooseModel = mongoose.models.Notification || mongoose.model<INotification>('Notification', notificationMongooseSchema);

export class NotificationModel {
  static async populateRelations(notif: INotification): Promise<INotification> {
    if (!notif) return notif;
    const sId = typeof notif.sender === 'string' ? notif.sender : notif.sender?._id;
    const pId = typeof notif.post === 'string' ? notif.post : notif.post?._id;

    const sender = sId ? await UserModel.findById(sId.toString()) : null;
    const post = pId ? await PostModel.findById(pId.toString()) : null;

    return {
      ...notif,
      sender: sender ? { _id: sender._id, name: sender.name, username: sender.username, profilePicture: sender.profilePicture } : notif.sender,
      post: post ? { _id: post._id, caption: post.caption, image: post.image } : notif.post,
    };
  }

  static async find(query: Record<string, any> = {}): Promise<INotification[]> {
    if (mongoose.connection.readyState === 1) {
      try {
        const notifs = await NotificationMongooseModel.find(query).populate('sender', 'name username profilePicture').populate('post', 'caption image').sort({ createdAt: -1 }).lean();
        return notifs.map((n: any) => ({ ...n, _id: n._id.toString() }));
      } catch (e) {}
    }

    const store = loadStore();
    const notifs = store.notifications.filter(n => {
      for (const [k, v] of Object.entries(query)) {
        if (n[k] !== v) return false;
      }
      return true;
    });

    notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return Promise.all(notifs.map(n => this.populateRelations(n)));
  }

  static async create(notifData: Partial<INotification>): Promise<INotification> {
    const now = new Date().toISOString();
    const newNotif: INotification = {
      _id: notifData._id || generateObjectId(),
      recipient: notifData.recipient,
      sender: notifData.sender,
      type: notifData.type as any,
      post: notifData.post,
      message: notifData.message,
      read: notifData.read || false,
      createdAt: notifData.createdAt || now,
    };

    if (mongoose.connection.readyState === 1) {
      try {
        const created = await NotificationMongooseModel.create(newNotif);
        const pop = await NotificationMongooseModel.findById(created._id).populate('sender', 'name username profilePicture').populate('post', 'caption image').lean();
        return { ...pop, _id: (pop as any)._id.toString() };
      } catch (e) {}
    }

    const store = loadStore();
    store.notifications.unshift(newNotif);
    saveStore(store);
    return this.populateRelations(newNotif);
  }

  static async findByIdAndUpdate(id: string, update: any): Promise<INotification | null> {
    const store = loadStore();
    const index = store.notifications.findIndex(n => n._id === id.toString());
    if (index === -1) return null;

    const current = { ...store.notifications[index], ...update };
    store.notifications[index] = current;
    saveStore(store);
    return this.populateRelations(current);
  }

  static async updateMany(filter: Record<string, any>, update: Record<string, any>): Promise<number> {
    if (mongoose.connection.readyState === 1) {
      try {
        await NotificationMongooseModel.updateMany(filter, update);
      } catch (e) {}
    }

    const store = loadStore();
    let count = 0;
    store.notifications.forEach(n => {
      let match = true;
      for (const [k, v] of Object.entries(filter)) {
        if (n[k] !== v) {
          match = false;
          break;
        }
      }
      if (match) {
        for (const [uk, uv] of Object.entries(update)) {
          n[uk] = uv;
        }
        count++;
      }
    });

    if (count > 0) {
      saveStore(store);
    }
    return count;
  }

  static async countDocuments(query: Record<string, any> = {}): Promise<number> {
    const list = await this.find(query);
    return list.length;
  }
}
