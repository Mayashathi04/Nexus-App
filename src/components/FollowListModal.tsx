import React, { useEffect, useState } from 'react';
import { userAPI } from '../services/api.ts';
import { UserCard } from './UserCard.tsx';
import { X, Users, Loader2 } from 'lucide-react';

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  type: 'followers' | 'following';
  userName: string;
  onNavigateUser: (userId: string) => void;
}

export const FollowListModal: React.FC<FollowListModalProps> = ({
  isOpen,
  onClose,
  userId,
  type,
  userName,
  onNavigateUser,
}) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen || !userId) return;

    let isMounted = true;
    const fetchList = async () => {
      setLoading(true);
      try {
        const res = type === 'followers'
          ? await userAPI.getFollowers(userId)
          : await userAPI.getFollowing(userId);
        if (isMounted) {
          setUsers(res.data || []);
        }
      } catch (err) {
        console.error('Error fetching follow list:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchList();
    return () => {
      isMounted = false;
    };
  }, [isOpen, userId, type]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in-50">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base text-white capitalize">
              {type} of {userName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2.5">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-slate-500 text-xs">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading {type}...
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              No {type} found.
            </div>
          ) : (
            users.map((u) => (
              <UserCard
                key={u._id}
                user={u}
                onNavigateUser={(uid) => {
                  onClose();
                  onNavigateUser(uid);
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
