import express from 'express';
import http from 'http';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';

import { connectDB, getDBStatus } from './server/config/db.ts';
import { seedInitialData } from './server/utils/seedData.ts';
import { setupSocketIO } from './server/socket/socketHandler.ts';

// Routes
import authRoutes from './server/routes/authRoutes.ts';
import userRoutes from './server/routes/userRoutes.ts';
import postRoutes from './server/routes/postRoutes.ts';
import commentRoutes from './server/routes/commentRoutes.ts';
import conversationRoutes from './server/routes/conversationRoutes.ts';
import notificationRoutes from './server/routes/notificationRoutes.ts';
import docsRoutes from './server/routes/docsRoutes.ts';

import { errorHandler, notFound } from './server/middleware/errorHandler.ts';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3000', 10);
const app = express();
const httpServer = http.createServer(app);

// Initialize Socket.io
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

setupSocketIO(io);

// Middlewares
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Static uploads folder if needed
app.use('/uploads', express.static(path.join(process.cwd(), 'server', 'uploads')));

// Mount REST API endpoints
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api', conversationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/docs', docsRoutes);

// Direct health check endpoints
app.get(['/api/health', '/api/ping'], (req, res) => {
  res.json({
    status: 'online',
    platform: 'NEXUS Social Media Platform',
    version: '1.0.0',
    collegeProject: 'Major Engineering Project (MERN Stack + Socket.io)',
    database: getDBStatus(),
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

async function startServer() {
  try {
    // Connect to database (MongoDB or file-persisted store fallback)
    await connectDB();
    await seedInitialData();

    // In development mode, mount Vite middleware so React HMR/dev server runs on port 3000
    if (process.env.NODE_ENV !== 'production') {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      // Production mode: serve built assets from dist
      const distPath = path.resolve(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }

    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`=======================================================`);
      console.log(`🚀 NEXUS Social Media Server running on port ${PORT}`);
      console.log(`🌐 Base URL: http://localhost:${PORT}`);
      console.log(`📡 Socket.io connected and ready for real-time chat`);
      console.log(`📚 API Docs & Postman: http://localhost:${PORT}/api/docs/postman`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
