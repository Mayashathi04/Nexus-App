import { Server as SocketIOServer, Socket } from 'socket.io';
import { MessageModel } from '../models/Message.ts';
import { ConversationModel } from '../models/Conversation.ts';
import { NotificationModel } from '../models/Notification.ts';

// Track online users: userId -> socketId
const onlineUsers = new Map<string, string>();

export function setupSocketIO(io: SocketIOServer) {
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 [Socket.io] Client connected: ${socket.id}`);

    // Register user when authenticated client connects
    socket.on('registerUser', (userId: string) => {
      if (userId) {
        onlineUsers.set(userId, socket.id);
        socket.data.userId = userId;
        console.log(`👤 [Socket.io] User ${userId} registered online`);
        // Broadcast updated online list to all connected clients
        io.emit('onlineUsersList', Array.from(onlineUsers.keys()));
      }
    });

    // Join a specific conversation room
    socket.on('joinConversation', (conversationId: string) => {
      if (conversationId) {
        socket.join(`conv_${conversationId}`);
        console.log(`💬 [Socket.io] Socket ${socket.id} joined conversation room: conv_${conversationId}`);
      }
    });

    // Leave a conversation room
    socket.on('leaveConversation', (conversationId: string) => {
      if (conversationId) {
        socket.leave(`conv_${conversationId}`);
      }
    });

    // Handle sending a real-time message
    socket.on('sendMessage', async (data: {
      conversationId: string;
      receiverId: string;
      content: string;
      senderId: string;
    }) => {
      try {
        const { conversationId, receiverId, content, senderId } = data;
        if (!conversationId || !content || !senderId) return;

        console.log(`✉️ [Socket.io] Message sent from ${senderId} in conv_${conversationId}`);

        // Persist message in MongoDB
        const savedMessage = await MessageModel.create({
          conversation: conversationId,
          sender: senderId,
          receiver: receiverId,
          content: content.trim(),
          read: false,
        });

        // Update conversation lastMessage
        await ConversationModel.findByIdAndUpdate(conversationId, {
          lastMessage: {
            content: content.trim(),
            sender: senderId,
            createdAt: new Date().toISOString(),
          },
        });

        // Broadcast to the conversation room (including sender for acknowledgment or sync)
        io.to(`conv_${conversationId}`).emit('receiveMessage', savedMessage);

        // Notify recipient specifically if they are online (for toast/badge updates)
        const recipientSocketId = onlineUsers.get(receiverId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('newMessageNotification', {
            message: savedMessage,
            conversationId,
          });
        }

        // Persist notification in MongoDB
        await NotificationModel.create({
          recipient: receiverId,
          sender: senderId,
          type: 'message',
          message: savedMessage._id,
          read: false,
        });
      } catch (err) {
        console.error('Error handling socket sendMessage:', err);
        socket.emit('messageError', { error: 'Failed to process message' });
      }
    });

    // Typing indicators
    socket.on('typing', ({ conversationId, userId, username }: { conversationId: string; userId: string; username: string }) => {
      socket.to(`conv_${conversationId}`).emit('userTyping', {
        conversationId,
        userId,
        username,
      });
    });

    socket.on('stopTyping', ({ conversationId, userId }: { conversationId: string; userId: string }) => {
      socket.to(`conv_${conversationId}`).emit('userStoppedTyping', {
        conversationId,
        userId,
      });
    });

    // Mark messages as read in conversation
    socket.on('markAsRead', async ({ conversationId, userId }: { conversationId: string; userId: string }) => {
      if (conversationId && userId) {
        await MessageModel.updateMany(
          { conversation: conversationId, receiver: userId, read: false },
          { read: true }
        );
        socket.to(`conv_${conversationId}`).emit('messagesReadReceipt', { conversationId, userId });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      const disconnectedUserId = socket.data.userId;
      if (disconnectedUserId) {
        onlineUsers.delete(disconnectedUserId);
        console.log(`🔌 [Socket.io] User ${disconnectedUserId} disconnected`);
        io.emit('onlineUsersList', Array.from(onlineUsers.keys()));
      }
    });
  });
}
