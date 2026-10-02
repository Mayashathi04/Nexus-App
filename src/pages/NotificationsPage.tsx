import React from 'react';
import { useNotifications, NotificationItem } from '../context/NotificationContext.tsx';
import {
  Bell,
  Heart,
  MessageSquare,
  UserPlus,
  CheckCheck,
  Check,
  Loader2,
  Clock,
} from 'lucide-react';

interface NotificationsPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onNavigate }) => {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-indigo-400" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-emerald-400" />;
      case 'message':
        return <MessageSquare className="w-4 h-4 text-cyan-400" />;
      default:
        return <Bell className="w-4 h-4 text-indigo-400" />;
    }
  };

  const formatText = (item: NotificationItem) => {
    const sender = item.sender || {};
    const name = sender.name || 'Someone';

    switch (item.type) {
      case 'like':
        return <span><strong className="text-white">{name}</strong> liked your post.</span>;
      case 'comment':
        return <span><strong className="text-white">{name}</strong> commented on your post.</span>;
      case 'follow':
        return <span><strong className="text-white">{name}</strong> started following you.</span>;
      case 'message':
        return <span><strong className="text-white">{name}</strong> sent you a direct message.</span>;
      default:
        return <span>New activity from <strong className="text-white">{name}</strong>.</span>;
    }
  };

  const handleNotificationClick = (item: NotificationItem) => {
    if (!item.read) {
      markAsRead(item._id);
    }

    if (item.type === 'message') {
      onNavigate('chat');
    } else if (item.type === 'follow') {
      onNavigate('profile', item.sender?._id);
    } else if (item.post) {
      onNavigate('feed');
    } else {
      onNavigate('profile', item.sender?._id);
    }
  };

  const formatTime = (timeStr: string) => {
    const diff = Math.floor((Date.now() - new Date(timeStr).getTime()) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-400">Activity on your posts, followers, and chats</p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 border border-slate-800 transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400 text-xs">
          <Loader2 className="w-5 h-5 animate-spin mr-2 text-indigo-500" />
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20 rounded-3xl bg-slate-900/40 border border-slate-800/80 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center mx-auto">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Notifications Yet</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            When peers like, comment on your posts or send you messages, they will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {notifications.map((item) => (
            <div
              key={item._id}
              onClick={() => handleNotificationClick(item)}
              className={`flex items-center justify-between gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                !item.read
                  ? 'bg-slate-900/90 border-indigo-500/40 shadow-md shadow-indigo-500/5'
                  : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/70 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Sender Avatar + Type Badge */}
                <div className="relative flex-shrink-0">
                  <img
                    src={item.sender?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.sender?.username}`}
                    alt=""
                    className="w-11 h-11 rounded-full object-cover border border-slate-700"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center">
                    {getNotificationIcon(item.type)}
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-slate-300 leading-snug">
                    {formatText(item)}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {formatTime(item.createdAt)}
                  </p>
                </div>
              </div>

              {/* Read Status Dot / Action */}
              <div className="flex-shrink-0 flex items-center gap-2">
                {!item.read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(item._id);
                    }}
                    className="p-1 rounded text-slate-500 hover:text-indigo-400"
                    title="Mark read"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span>
                  </button>
                )}
                {item.post?.image && (
                  <img
                    src={item.post.image}
                    alt=""
                    className="w-9 h-9 rounded-lg object-cover border border-slate-800 hidden sm:block"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
