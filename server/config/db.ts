import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

let isMongoConnected = false;
let dbMode: 'mongodb' | 'file-store' = 'file-store';

const DATA_DIR = path.resolve(process.cwd(), 'server', 'data');
const DB_FILE = path.join(DATA_DIR, 'nexus_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface StoreData {
  users: any[];
  posts: any[];
  comments: any[];
  conversations: any[];
  messages: any[];
  notifications: any[];
}

export function loadStore(): StoreData {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error loading db file, reinitializing:', err);
  }
  return {
    users: [],
    posts: [],
    comments: [],
    conversations: [],
    messages: [],
    notifications: []
  };
}

export function saveStore(data: StoreData) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving db file:', err);
  }
}

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nexus_social';
  try {
    console.log(`[Database] Attempting connection to MongoDB at: ${mongoUri.replace(/:([^:@]{4})[^:@]*@/, ':****@')}`);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000,
    });
    isMongoConnected = true;
    dbMode = 'mongodb';
    console.log('✅ [Database] MongoDB Connected Successfully via Mongoose!');
  } catch (err: any) {
    isMongoConnected = false;
    dbMode = 'file-store';
    console.log(`ℹ️ [Database] MongoDB is not active locally or timed out (${err.message || 'connection failed'}).`);
    console.log(`🚀 [Database] Seamlessly activated File-Persisted Document Store (${DB_FILE}). Full CRUD, relationships, and queries active!`);
  }
};

export const getDBStatus = () => ({
  mode: dbMode,
  isMongoConnected,
  databaseFile: DB_FILE,
  timestamp: new Date().toISOString()
});
