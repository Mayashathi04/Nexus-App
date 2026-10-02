import { Response } from 'express';
import { ConversationModel } from '../models/Conversation.ts';
import { MessageModel } from '../models/Message.ts';
import { UserModel } from '../models/User.ts';
import { NotificationModel } from '../models/Notification.ts';
import { AuthRequest } from '../middleware/authMiddleware.ts';

// @desc    Get user conversations
// @route   GET /api/conversations
// @access  Private
export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.user!._id;
    const conversations = await ConversationModel.find({
      participants: { $in: [currentUserId] },
    });

    // Add unread count per conversation
    const enhanced = await Promise.all(
      conversations.map(async conv => {
        const unreadCount = await MessageModel.find({
          conversation: conv._id,
          receiver: currentUserId,
          read: false,
        });
        return {
          ...conv,
          unreadCount: unreadCount.length,
        };
      })
    );

    return res.json(enhanced);
  } catch (error: any) {
    console.error('getConversations error:', error);
    return res.status(500).json({ message: error.message || 'Error fetching conversations' });
  }
};

// @desc    Get or create conversation with a user
// @route   POST /api/conversations
// @access  Private
export const getOrCreateConversation = async (req: AuthRequest, res: Response) => {
  try {
    const { recipientId } = req.body;
    const currentUserId = req.user!._id;

    if (!recipientId) {
      return res.status(400).json({ message: 'Recipient ID is required' });
    }

    if (recipientId === currentUserId) {
      return res.status(400).json({ message: 'Cannot start conversation with yourself' });
    }

    const recipient = await UserModel.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient user not found' });
    }

    // Check existing
    let conversation = await ConversationModel.findOneBetween(currentUserId, recipientId);
    if (!conversation) {
      conversation = await ConversationModel.create({
        participants: [currentUserId, recipientId],
        lastMessage: undefined,
      });
    }

    return res.json(conversation);
  } catch (error: any) {
    console.error('getOrCreateConversation error:', error);
    return res.status(500).json({ message: error.message || 'Error creating conversation' });
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.user!._id;

    const conversation = await ConversationModel.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const participantIds = conversation.participants.map((p: any) =>
      typeof p === 'string' ? p : p._id
    );

    if (!participantIds.includes(currentUserId)) {
      return res.status(403).json({ message: 'Not authorized to view messages in this conversation' });
    }

    // Mark messages directed to current user as read
    await MessageModel.updateMany(
      { conversation: conversationId, receiver: currentUserId, read: false },
      { read: true }
    );

    const messages = await MessageModel.find({ conversation: conversationId });
    return res.json(messages);
  } catch (error: any) {
    console.error('getMessages error:', error);
    return res.status(500).json({ message: error.message || 'Error fetching messages' });
  }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId, receiverId, content } = req.body;
    const currentUserId = req.user!._id;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content cannot be empty' });
    }

    let convId = conversationId;
    let targetReceiverId = receiverId;

    if (!convId && targetReceiverId) {
      const conv = await ConversationModel.findOneBetween(currentUserId, targetReceiverId) ||
        await ConversationModel.create({
          participants: [currentUserId, targetReceiverId],
        });
      convId = conv._id;
    } else if (convId && !targetReceiverId) {
      const conv = await ConversationModel.findById(convId);
      if (conv) {
        const other = conv.participants.find((p: any) => {
          const id = typeof p === 'string' ? p : p._id;
          return id !== currentUserId;
        });
        targetReceiverId = typeof other === 'string' ? other : other?._id;
      }
    }

    if (!convId || !targetReceiverId) {
      return res.status(400).json({ message: 'Valid conversation ID or receiver ID required' });
    }

    const message = await MessageModel.create({
      conversation: convId,
      sender: currentUserId,
      receiver: targetReceiverId,
      content: content.trim(),
      read: false,
    });

    // Update lastMessage on conversation
    await ConversationModel.findByIdAndUpdate(convId, {
      lastMessage: {
        content: content.trim(),
        sender: currentUserId,
        createdAt: new Date().toISOString(),
      },
    });

    // Notification for message
    await NotificationModel.create({
      recipient: targetReceiverId,
      sender: currentUserId,
      type: 'message',
      message: message._id,
      read: false,
    });

    return res.status(201).json(message);
  } catch (error: any) {
    console.error('sendMessage error:', error);
    return res.status(500).json({ message: error.message || 'Error sending message' });
  }
};
