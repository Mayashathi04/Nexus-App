import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useSocket } from '../context/SocketContext.tsx';
import { useNotifications } from '../context/NotificationContext.tsx';
import { chatAPI, userAPI } from '../services/api.ts';
import {
  Send,
  MessageSquare,
  Search,
  Check,
  CheckCheck,
  Plus,
  Loader2,
  Users,
  X,
  Radio,
} from 'lucide-react';

interface ChatPageProps {
  initialConversationId?: string;
  onNavigate: (view: string, param?: string) => void;
}

interface Message {
  _id: string;
  conversation: string;
  sender: any;
  receiver: any;
  content: string;
  read: boolean;
  createdAt: string;
}

interface Conversation {
  _id: string;
  participants: any[];
  lastMessage?: {
    content: string;
    sender: string;
    createdAt: string;
  };
  unreadCount?: number;
  updatedAt: string;
}

export const ChatPage: React.FC<ChatPageProps> = ({
  initialConversationId,
  onNavigate,
}) => {
  const { user } = useAuth();
  const { socket, isUserOnline, isConnected } = useSocket();
  const { refreshNotifications } = useNotifications();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(initialConversationId || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState<string | null>(null);

  // New Chat Modal
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Fetch conversations list from MongoDB
  const fetchConversations = async () => {
    try {
      const res = await chatAPI.getConversations();
      const list = res.data || [];
      setConversations(list);

      // If no active conversation yet and list has items, select the first
      if (!activeConvId && list.length > 0 && !initialConversationId) {
        setActiveConvId(list[0]._id);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoadingConvs(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // When initialConversationId changes prop, select it
  useEffect(() => {
    if (initialConversationId) {
      setActiveConvId(initialConversationId);
    }
  }, [initialConversationId]);

  // Fetch messages from MongoDB when active conversation changes
  useEffect(() => {
    if (!activeConvId) return;

    let isMounted = true;
    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const res = await chatAPI.getMessages(activeConvId);
        if (isMounted) {
          setMessages(res.data || []);
          // Join socket room
          if (socket) {
            socket.emit('joinConversation', activeConvId);
            socket.emit('markAsRead', { conversationId: activeConvId, userId: user?._id });
          }
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        if (isMounted) setLoadingMessages(false);
      }
    };

    fetchMessages();

    return () => {
      isMounted = false;
      if (socket) {
        socket.emit('leaveConversation', activeConvId);
      }
    };
  }, [activeConvId, socket, user?._id]);

  // Listen to Socket.io events
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg: Message) => {
      if (msg.conversation === activeConvId) {
        setMessages((prev) => {
          // Guard against duplicates
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });

        // Mark as read immediately if actively chatting
        if (user?._id && msg.receiver?._id === user._id) {
          socket.emit('markAsRead', { conversationId: activeConvId, userId: user._id });
        }
      }

      // Update conversation list lastMessage
      setConversations((prev) =>
        prev.map((c) => {
          if (c._id === msg.conversation) {
            return {
              ...c,
              lastMessage: {
                content: msg.content,
                sender: typeof msg.sender === 'object' ? msg.sender._id : msg.sender,
                createdAt: msg.createdAt,
              },
              updatedAt: msg.createdAt,
            };
          }
          return c;
        })
      );
    };

    const handleUserTyping = (data: { conversationId: string; userId: string; username: string }) => {
      if (data.conversationId === activeConvId && data.userId !== user?._id) {
        setOtherUserTyping(data.username);
      }
    };

    const handleUserStoppedTyping = (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === activeConvId && data.userId !== user?._id) {
        setOtherUserTyping(null);
      }
    };

    const handleReadReceipt = (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === activeConvId) {
        setMessages((prev) =>
          prev.map((m) => {
            const receiverId = typeof m.receiver === 'object' ? m.receiver._id : m.receiver;
            if (receiverId === data.userId) {
              return { ...m, read: true };
            }
            return m;
          })
        );
      }
    };

    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('userTyping', handleUserTyping);
    socket.on('userStoppedTyping', handleUserStoppedTyping);
    socket.on('messagesReadReceipt', handleReadReceipt);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('userTyping', handleUserTyping);
      socket.off('userStoppedTyping', handleUserStoppedTyping);
      socket.off('messagesReadReceipt', handleReadReceipt);
    };
  }, [socket, activeConvId, user?._id]);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, otherUserTyping]);

  // Handle typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (!socket || !activeConvId || !user) return;

    socket.emit('typing', {
      conversationId: activeConvId,
      userId: user._id,
      username: user.username,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stopTyping', {
        conversationId: activeConvId,
        userId: user._id,
      });
    }, 1500);
  };

  // Get active conversation object
  const currentConv = conversations.find((c) => c._id === activeConvId);

  // Helper to extract the other participant
  const getOtherParticipant = (conv?: Conversation) => {
    if (!conv || !conv.participants) return null;
    const other = conv.participants.find((p: any) => {
      const id = typeof p === 'string' ? p : p?._id;
      return id !== user?._id;
    });
    return other;
  };

  const otherParticipant = getOtherParticipant(currentConv);
  const otherUserId = otherParticipant ? (typeof otherParticipant === 'string' ? otherParticipant : otherParticipant._id) : null;
  const isOtherOnline = otherUserId ? isUserOnline(otherUserId) : false;

  // Send message handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConvId || !user || !otherUserId) return;

    const messageContent = inputText.trim();
    setInputText('');

    if (socket) {
      socket.emit('stopTyping', {
        conversationId: activeConvId,
        userId: user._id,
      });

      // Emit real-time Socket event
      socket.emit('sendMessage', {
        conversationId: activeConvId,
        receiverId: otherUserId,
        content: messageContent,
        senderId: user._id,
      });
    } else {
      // Fallback to HTTP POST
      try {
        const res = await chatAPI.sendMessage(activeConvId, messageContent, otherUserId);
        setMessages((prev) => [...prev, res.data]);
      } catch (err) {
        console.error('Error sending message:', err);
      }
    }
  };

  // Open New Chat Search
  const handleOpenNewChat = async () => {
    setShowNewChatModal(true);
    try {
      const res = await userAPI.search('');
      setAvailableUsers((res.data || []).filter((u: any) => u._id !== user?._id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartConversationWithUser = async (targetUserId: string) => {
    setShowNewChatModal(false);
    try {
      const res = await chatAPI.startConversation(targetUserId);
      const newConv = res.data;
      setConversations((prev) => {
        if (!prev.some((c) => c._id === newConv._id)) {
          return [newConv, ...prev];
        }
        return prev;
      });
      setActiveConvId(newConv._id);
    } catch (err) {
      console.error('Error starting conversation:', err);
    }
  };

  const formatMessageTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden h-[calc(100vh-8.5rem)] flex flex-col md:flex-row backdrop-blur-xl">
        {/* Left Column: Conversations List */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-slate-800 flex flex-col ${activeConvId ? 'hidden md:flex' : 'flex'}`}>
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
              <h2 className="font-bold text-base text-white">Direct Messages</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Radio className="w-2.5 h-2.5 animate-pulse" />
                Socket.io
              </span>
              <button
                onClick={handleOpenNewChat}
                className="p-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                title="Start New Conversation"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Conversations Scrollable List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
            {loadingConvs ? (
              <div className="flex items-center justify-center py-10 text-slate-500 text-xs">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Loading conversations...
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-3">
                <p className="text-xs text-slate-400">No active conversations yet.</p>
                <button
                  onClick={handleOpenNewChat}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500"
                >
                  Start a Conversation
                </button>
              </div>
            ) : (
              conversations.map((conv) => {
                const other = getOtherParticipant(conv);
                if (!other) return null;
                const oId = typeof other === 'string' ? other : other._id;
                const isOnline = isUserOnline(oId);
                const isSelected = conv._id === activeConvId;

                return (
                  <button
                    key={conv._id}
                    onClick={() => setActiveConvId(conv._id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left group ${
                      isSelected
                        ? 'bg-indigo-600/20 border border-indigo-500/40 text-white'
                        : 'hover:bg-slate-800/60 border border-transparent text-slate-300'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={other.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${other.username}`}
                        alt=""
                        className="w-11 h-11 rounded-full object-cover border border-slate-700"
                      />
                      {isOnline ? (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-slate-900" title="Online" />
                      ) : (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-slate-600 rounded-full ring-2 ring-slate-900" title="Offline" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white truncate">
                          {other.name || 'NEXUS Peer'}
                        </h4>
                        {conv.lastMessage && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            {formatMessageTime(conv.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {conv.lastMessage?.content || 'Started conversation'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat Window */}
        <div className={`flex-1 flex flex-col ${!activeConvId ? 'hidden md:flex' : 'flex'}`}>
          {currentConv && otherParticipant ? (
            <>
              {/* Active Conversation Top Bar */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveConvId(null)}
                    className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
                  >
                    &larr; Back
                  </button>
                  <div className="relative">
                    <img
                      src={otherParticipant.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherParticipant.username}`}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover border border-indigo-500/40"
                    />
                    {isOtherOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-900" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>{otherParticipant.name}</span>
                      <span className="text-xs font-mono text-slate-500 font-normal">
                        @{otherParticipant.username}
                      </span>
                    </h3>
                    <p className="text-[11px] font-medium flex items-center gap-1">
                      {isOtherOnline ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          Online now
                        </span>
                      ) : (
                        <span className="text-slate-500">Offline</span>
                      )}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('profile', otherUserId || '')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
                >
                  View Profile
                </button>
              </div>

              {/* Message History from MongoDB */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 custom-scrollbar bg-slate-950/20">
                {loadingMessages ? (
                  <div className="flex items-center justify-center py-20 text-slate-500 text-xs">
                    <Loader2 className="w-5 h-5 animate-spin mr-2 text-indigo-500" />
                    Fetching message history from MongoDB...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-16 text-slate-500 text-xs space-y-1">
                    <p>No messages exchanged yet.</p>
                    <p className="text-slate-600">Send a message below to start real-time chatting!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const sId = typeof msg.sender === 'object' ? msg.sender?._id : msg.sender;
                    const isFromMe = sId === user?._id;

                    return (
                      <div
                        key={msg._id}
                        className={`flex flex-col ${isFromMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[78%] sm:max-w-md px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-md break-words ${
                            isFromMe
                              ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-tr-none'
                              : 'bg-slate-800 border border-slate-700/80 text-slate-100 rounded-tl-none'
                          }`}
                        >
                          {msg.content}
                        </div>

                        <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-slate-500 font-mono">
                          <span>{formatMessageTime(msg.createdAt)}</span>
                          {isFromMe && (
                            <span>
                              {msg.read ? (
                                <CheckCheck className="w-3.5 h-3.5 text-cyan-400 inline" />
                              ) : (
                                <Check className="w-3 h-3 text-slate-400 inline" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Typing Indicator */}
                {otherUserTyping && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 rounded-xl">
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span>@{otherUserTyping} is typing...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Bar */}
              <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/60 flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={handleInputChange}
                  placeholder={`Message @${otherParticipant.username}...`}
                  className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white shadow-md shadow-indigo-600/30 transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white">Select a Conversation</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Choose a conversation from the sidebar or click "Start a Conversation" to message any registered peer in real-time.
              </p>
              <button
                onClick={handleOpenNewChat}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30"
              >
                Start New Conversation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* New Conversation Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in-50">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">Start New Chat</h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 border-b border-slate-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  placeholder="Filter users by name or username..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                />
              </div>
            </div>

            <div className="p-3 overflow-y-auto flex-1 space-y-2">
              {availableUsers
                .filter((u) =>
                  u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                  u.username.toLowerCase().includes(userSearchTerm.toLowerCase())
                )
                .map((u) => (
                  <button
                    key={u._id}
                    onClick={() => handleStartConversationWithUser(u._id)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={u.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <p className="text-xs font-bold text-white">{u.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">@{u.username}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-indigo-400">Chat &rarr;</span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
