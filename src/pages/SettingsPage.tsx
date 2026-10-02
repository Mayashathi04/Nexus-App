import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotifications } from '../context/NotificationContext.tsx';
import { systemAPI } from '../services/api.ts';
import {
  Settings,
  Database,
  Shield,
  Key,
  Copy,
  Check,
  Download,
  Server,
  LogOut,
  RefreshCw,
} from 'lucide-react';

interface SettingsPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const { user, token, logout } = useAuth();
  const { showToast } = useNotifications();
  const [healthData, setHealthData] = useState<any>(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHealth = async () => {
    setRefreshing(true);
    try {
      const res = await systemAPI.getHealth();
      setHealthData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleCopyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      setCopiedToken(true);
      showToast('JWT Copied', 'Token copied to clipboard for Postman testing', undefined, 'success');
      setTimeout(() => setCopiedToken(false), 2500);
    }
  };

  const handleDownloadPostman = () => {
    window.open('/api/docs/postman', '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-400" />
            <span>Settings & Diagnostics</span>
          </h1>
          <p className="text-xs text-slate-400">
            System diagnostics, database connectivity, and developer evaluation tools.
          </p>
        </div>

        <button
          onClick={fetchHealth}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 border border-slate-800"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backend & Database Health Card */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-sm text-white">Database & Server State</h3>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              {healthData?.status || 'Online'}
            </span>
          </div>

          <div className="space-y-2.5 text-xs text-slate-300 font-mono">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-500">Platform:</span>
              <span className="text-slate-200">NEXUS Social Media Engine</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-500">Database Engine:</span>
              <span className="text-indigo-400 font-semibold">
                {healthData?.database?.isMongoConnected ? 'MongoDB (Atlas / Daemon)' : 'File-Persisted Document Store'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-500">Persistence File:</span>
              <span className="text-slate-400 truncate max-w-[180px]">
                {healthData?.database?.databaseFile || 'nexus_db.json'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-500">Server Uptime:</span>
              <span className="text-slate-200">{healthData?.uptimeSeconds || 0} seconds</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">WebSocket Port:</span>
              <span className="text-emerald-400">3000 (Socket.io)</span>
            </div>
          </div>
        </div>

        {/* Postman & Testing Suite Card */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Server className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm text-white">Postman API Testing</h3>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            The backend REST endpoints can be evaluated directly via Postman. Download the pre-configured collection or explore endpoints inside the interactive tester.
          </p>

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={handleDownloadPostman}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download Postman Collection (.json)</span>
            </button>

            <button
              onClick={() => onNavigate('apidocs')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              <span>Launch Interactive API Explorer</span>
            </button>
          </div>
        </div>

        {/* Active JWT Session Token Card */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4 md:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-sm text-white">Active Session Bearer Token (JWT)</h3>
            </div>
            <button
              onClick={handleCopyToken}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors"
            >
              {copiedToken ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy for Postman</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-slate-400">
            Copy this token into Postman's <code className="text-indigo-300 font-mono">Authorization: Bearer &lt;token&gt;</code> header to test authenticated endpoints.
          </p>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-300 break-all select-all">
            {token || 'No active JWT token.'}
          </div>
        </div>

        {/* Account & Logout */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4 md:col-span-2 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-white">Signed in as {user?.name}</h4>
            <p className="text-xs text-slate-400 font-mono">@{user?.username} &bull; {user?.email}</p>
          </div>

          <button
            onClick={() => {
              logout();
              onNavigate('landing');
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
