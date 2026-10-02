import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import api from '../services/api.ts';
import {
  FileCode2,
  Download,
  Play,
  CheckCircle2,
  Lock,
  Globe,
  Loader2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ApiEndpoint {
  id: string;
  category: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  authRequired: boolean;
  description: string;
  defaultBody?: any;
}

const ENDPOINTS: ApiEndpoint[] = [
  // Auth
  {
    id: 'auth-register',
    category: '1. Authentication',
    name: 'Register User',
    method: 'POST',
    path: '/auth/register',
    authRequired: false,
    description: 'Create a new user account with hashed password and returns JWT token.',
    defaultBody: {
      name: 'College Student',
      username: 'collegestudent',
      email: 'student@college.edu',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      bio: 'Enthusiastic full-stack engineer and researcher.',
    },
  },
  {
    id: 'auth-login',
    category: '1. Authentication',
    name: 'Login User',
    method: 'POST',
    path: '/auth/login',
    authRequired: false,
    description: 'Authenticate with email or username and password to get a signed JWT.',
    defaultBody: {
      identifier: 'alex@nexus.social',
      password: 'Password123!',
    },
  },
  {
    id: 'auth-me',
    category: '1. Authentication',
    name: 'Get Current User (Me)',
    method: 'GET',
    path: '/auth/me',
    authRequired: true,
    description: 'Retrieve profile details for currently authenticated JWT token.',
  },
  {
    id: 'auth-logout',
    category: '1. Authentication',
    name: 'Logout User',
    method: 'POST',
    path: '/auth/logout',
    authRequired: true,
    description: 'Logout current user session.',
  },

  // Users
  {
    id: 'users-search',
    category: '2. Users & Profiles',
    name: 'Search Users',
    method: 'GET',
    path: '/users/search?q=alex',
    authRequired: false,
    description: 'Search registered users by matching name or username regex.',
  },
  {
    id: 'users-get',
    category: '2. Users & Profiles',
    name: 'Get User Profile',
    method: 'GET',
    path: '/users/65f1a011a011a011a0110002',
    authRequired: false,
    description: 'Fetch user public profile, follower/following counts, and follow state.',
  },
  {
    id: 'users-follow',
    category: '2. Users & Profiles',
    name: 'Follow User',
    method: 'POST',
    path: '/users/65f1a011a011a011a0110002/follow',
    authRequired: true,
    description: 'Follow another user and trigger in-app notification.',
  },
  {
    id: 'users-unfollow',
    category: '2. Users & Profiles',
    name: 'Unfollow User',
    method: 'DELETE',
    path: '/users/65f1a011a011a011a0110002/follow',
    authRequired: true,
    description: 'Remove follow relationship from MongoDB.',
  },

  // Posts
  {
    id: 'posts-feed',
    category: '3. Posts & Social Feed',
    name: 'Get Social Feed',
    method: 'GET',
    path: '/posts?feed=true',
    authRequired: true,
    description: 'Retrieve personalized social feed from current user and followed users.',
  },
  {
    id: 'posts-explore',
    category: '3. Posts & Social Feed',
    name: 'Get Explore Posts',
    method: 'GET',
    path: '/posts',
    authRequired: false,
    description: 'Retrieve latest global public posts sorted by creation date descending.',
  },
  {
    id: 'posts-create',
    category: '3. Posts & Social Feed',
    name: 'Create Post',
    method: 'POST',
    path: '/posts',
    authRequired: true,
    description: 'Publish a new post with caption, photograph/artwork image, and hashtags.',
    defaultBody: {
      caption: 'Live evaluation of NEXUS REST API endpoints! #MERN #SocketIO #CollegeProject',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
      hashtags: ['MERN', 'SocketIO', 'CollegeProject'],
    },
  },
  {
    id: 'posts-like',
    category: '3. Posts & Social Feed',
    name: 'Like Post',
    method: 'POST',
    path: '/posts/65f1b022b022b022b0220001/like',
    authRequired: true,
    description: 'Like a post with duplicate prevention and real-time like count increment.',
  },
  {
    id: 'posts-unlike',
    category: '3. Posts & Social Feed',
    name: 'Unlike Post',
    method: 'DELETE',
    path: '/posts/65f1b022b022b022b0220001/like',
    authRequired: true,
    description: 'Remove like from post and decrement like counter.',
  },

  // Comments
  {
    id: 'comments-list',
    category: '4. Comments',
    name: 'Get Post Comments',
    method: 'GET',
    path: '/posts/65f1b022b022b022b0220001/comments',
    authRequired: false,
    description: 'Retrieve all threaded comments for a given post populated with author data.',
  },
  {
    id: 'comments-add',
    category: '4. Comments',
    name: 'Add Comment to Post',
    method: 'POST',
    path: '/posts/65f1b022b022b022b0220001/comments',
    authRequired: true,
    description: 'Add a new comment and dispatch notification to post author.',
    defaultBody: {
      content: 'Testing comments via Postman API Explorer. Works seamlessly!',
    },
  },

  // Chat & Messages
  {
    id: 'chat-convs',
    category: '5. Real-Time Chat & Messages',
    name: 'Get Conversations',
    method: 'GET',
    path: '/conversations',
    authRequired: true,
    description: 'Fetch all 1-on-1 conversations with participant details and last message.',
  },
  {
    id: 'chat-messages',
    category: '5. Real-Time Chat & Messages',
    name: 'Get Conversation Messages',
    method: 'GET',
    path: '/messages/65f1d044d044d044d0440001',
    authRequired: true,
    description: 'Fetch stored message history from MongoDB for given conversation ID.',
  },
  {
    id: 'chat-send',
    category: '5. Real-Time Chat & Messages',
    name: 'Send Message (HTTP Endpoint)',
    method: 'POST',
    path: '/messages',
    authRequired: true,
    description: 'Persist chat message in MongoDB and trigger notification.',
    defaultBody: {
      conversationId: '65f1d044d044d044d0440001',
      receiverId: '65f1a011a011a011a0110002',
      content: 'Testing direct message dispatch from the REST documentation tester.',
    },
  },

  // Notifications
  {
    id: 'notif-list',
    category: '6. Notifications',
    name: 'Get Notifications',
    method: 'GET',
    path: '/notifications',
    authRequired: true,
    description: 'Fetch user notifications with unread count badge.',
  },
  {
    id: 'notif-read-all',
    category: '6. Notifications',
    name: 'Mark All Read',
    method: 'PUT',
    path: '/notifications/read-all',
    authRequired: true,
    description: 'Mark all unread notifications for authenticated user as read.',
  },
];

export const ApiDocsPage: React.FC = () => {
  const { token, isAuthenticated } = useAuth();
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint>(ENDPOINTS[1]); // Default to Login
  const [requestPath, setRequestPath] = useState<string>(ENDPOINTS[1].path);
  const [requestBody, setRequestBody] = useState<string>(
    JSON.stringify(ENDPOINTS[1].defaultBody || {}, null, 2)
  );
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<any>(null);
  const [responseData, setResponseData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

  const handleSelectEndpoint = (ep: ApiEndpoint) => {
    setSelectedEndpoint(ep);
    setRequestPath(ep.path);
    setRequestBody(ep.defaultBody ? JSON.stringify(ep.defaultBody, null, 2) : '');
    setResponseStatus(null);
    setResponseData(null);
  };

  const handleExecuteRequest = async () => {
    setLoading(true);
    setResponseStatus(null);
    setResponseData(null);

    try {
      let parsedBody = undefined;
      if (['POST', 'PUT', 'PATCH'].includes(selectedEndpoint.method) && requestBody.trim()) {
        try {
          parsedBody = JSON.parse(requestBody);
        } catch (e: any) {
          setResponseStatus(400);
          setResponseData({ error: 'Invalid JSON request body format', details: e.message });
          setLoading(false);
          return;
        }
      }

      let res;
      switch (selectedEndpoint.method) {
        case 'GET':
          res = await api.get(requestPath);
          break;
        case 'POST':
          res = await api.post(requestPath, parsedBody);
          break;
        case 'PUT':
          res = await api.put(requestPath, parsedBody);
          break;
        case 'DELETE':
          res = await api.delete(requestPath);
          break;
      }

      setResponseStatus(res.status);
      setResponseHeaders(res.headers);
      setResponseData(res.data);
    } catch (err: any) {
      setResponseStatus(err.response?.status || 500);
      setResponseData(err.response?.data || { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCurl = () => {
    const fullUrl = `${window.location.origin}/api${requestPath}`;
    let curl = `curl -X ${selectedEndpoint.method} "${fullUrl}" \\\n  -H "Content-Type: application/json"`;
    if (selectedEndpoint.authRequired && token) {
      curl += ` \\\n  -H "Authorization: Bearer ${token}"`;
    }
    if (requestBody && ['POST', 'PUT'].includes(selectedEndpoint.method)) {
      curl += ` \\\n  -d '${requestBody.replace(/\n/g, '')}'`;
    }

    navigator.clipboard.writeText(curl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const getMethodBadge = (m: string) => {
    switch (m) {
      case 'GET':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'POST':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      case 'PUT':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'DELETE':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <FileCode2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-extrabold text-white">Postman & REST API Explorer</h1>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Complete API specification for the NEXUS major college project. Test any endpoint live against the Express server and MongoDB models, or download the official Postman collection.
          </p>
        </div>

        <a
          href="/api/docs/postman"
          download="nexus_postman_collection.json"
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all shadow-md"
        >
          <Download className="w-4 h-4" />
          <span>Download Postman (.json)</span>
        </a>
      </div>

      {/* Main Grid: Left Endpoints List, Right Live Tester */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Endpoints Nav List */}
        <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-3xl p-4 max-h-[750px] overflow-y-auto space-y-4 custom-scrollbar">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
            API Endpoints ({ENDPOINTS.length})
          </h3>

          <div className="space-y-1">
            {ENDPOINTS.map((ep) => {
              const isSelected = selectedEndpoint.id === ep.id;
              return (
                <button
                  key={ep.id}
                  onClick={() => handleSelectEndpoint(ep)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-left transition-all ${
                    isSelected
                      ? 'bg-indigo-600/25 border border-indigo-500/50 text-white'
                      : 'hover:bg-slate-800/60 border border-transparent text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${getMethodBadge(ep.method)}`}>
                      {ep.method}
                    </span>
                    <span className="text-xs font-semibold truncate">{ep.name}</span>
                  </div>

                  {ep.authRequired && (
                    <span title="JWT Required">
                      <Lock className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Runner & Inspector */}
        <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-5">
          {/* Active Endpoint Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg border ${getMethodBadge(selectedEndpoint.method)}`}>
                  {selectedEndpoint.method}
                </span>
                <h2 className="text-base font-bold text-white">{selectedEndpoint.name}</h2>
              </div>
              <p className="text-xs text-slate-400">{selectedEndpoint.description}</p>
            </div>

            <div className="flex items-center gap-2">
              {selectedEndpoint.authRequired ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  <Lock className="w-3 h-3" />
                  JWT Bearer Required
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <Globe className="w-3 h-3" />
                  Public Endpoint
                </span>
              )}
            </div>
          </div>

          {/* URL & Execute Bar */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400 font-mono">
              Endpoint Path
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono">
                <span className="text-slate-500 select-none mr-1">/api</span>
                <input
                  type="text"
                  value={requestPath}
                  onChange={(e) => setRequestPath(e.target.value)}
                  className="flex-1 bg-transparent text-slate-200 focus:outline-none"
                />
              </div>

              <button
                onClick={handleExecuteRequest}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
                <span>Send Request</span>
              </button>
            </div>
          </div>

          {/* Request Body (For POST/PUT) */}
          {['POST', 'PUT'].includes(selectedEndpoint.method) && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 font-mono">
                JSON Request Payload (Body)
              </label>
              <textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                rows={5}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
              />
            </div>
          )}

          {/* Live Response Viewer */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Live Response:</span>
              <div className="flex items-center gap-3">
                {responseStatus && (
                  <span
                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md ${
                      responseStatus < 300
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    Status: {responseStatus}
                  </span>
                )}
                <button
                  onClick={handleCopyCurl}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy cURL</span>
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs overflow-x-auto max-h-72 custom-scrollbar">
              {loading ? (
                <div className="flex items-center gap-2 text-slate-500 py-6">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                  <span>Awaiting server response from Express controller...</span>
                </div>
              ) : responseData ? (
                <pre className="text-slate-200">
                  {JSON.stringify(responseData, null, 2)}
                </pre>
              ) : (
                <span className="text-slate-600">
                  Click "Send Request" to test this endpoint live against the Express & MongoDB backend.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
