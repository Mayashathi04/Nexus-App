import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { SocketProvider } from './context/SocketContext.tsx';
import { NotificationProvider } from './context/NotificationContext.tsx';
import { ToastContainer } from './components/ToastContainer.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { MobileNavbar } from './components/MobileNavbar.tsx';
import { CreatePostModal } from './components/CreatePostModal.tsx';
import { EditPostModal } from './components/EditPostModal.tsx';
import { Post } from './components/PostCard.tsx';

// Pages
import { LandingPage } from './pages/LandingPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { RegisterPage } from './pages/RegisterPage.tsx';
import { FeedPage } from './pages/FeedPage.tsx';
import { ExplorePage } from './pages/ExplorePage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { EditProfilePage } from './pages/EditProfilePage.tsx';
import { NotificationsPage } from './pages/NotificationsPage.tsx';
import { ChatPage } from './pages/ChatPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';
import { ApiDocsPage } from './pages/ApiDocsPage.tsx';

function MainApp() {
  const { isAuthenticated, loading, user } = useAuth();

  // Navigation state
  const [currentView, setCurrentView] = useState<string>('landing');
  const [viewParam, setViewParam] = useState<string | undefined>(undefined);

  // Modals state
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // Parse path from URL on initial load and handle browser back/forward
  useEffect(() => {
    const handleLocationChange = () => {
      const pathname = window.location.pathname.replace(/^\//, '');
      const parts = pathname.split('/');
      const page = parts[0] || '';

      if (['login', 'register', 'feed', 'explore', 'notifications', 'chat', 'settings', 'apidocs'].includes(page)) {
        setCurrentView(page);
        setViewParam(parts[1]);
      } else if (page === 'profile') {
        setCurrentView('profile');
        setViewParam(parts[1]);
      } else if (page === 'editprofile') {
        setCurrentView('editprofile');
      } else {
        // Root /
        if (isAuthenticated) {
          setCurrentView('feed');
        } else {
          setCurrentView('landing');
        }
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [isAuthenticated]);

  const handleNavigate = (view: string, param?: string) => {
    setCurrentView(view);
    setViewParam(param);

    // Update browser URL
    let url = `/${view}`;
    if (view === 'landing') url = '/';
    if (param) url += `/${param}`;
    window.history.pushState({}, '', url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Protected route guard
  const protectedViews = ['feed', 'profile', 'editprofile', 'notifications', 'chat', 'settings'];
  const isCurrentProtected = protectedViews.includes(currentView);

  // Redirect to feed if authenticated user hits landing/login/register
  useEffect(() => {
    if (!loading && isAuthenticated) {
      if (currentView === 'landing' || currentView === 'login' || currentView === 'register') {
        setCurrentView('feed');
        window.history.pushState({}, '', '/feed');
      }
    }
  }, [isAuthenticated, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono tracking-wider">INITIALIZING NEXUS...</p>
        </div>
      </div>
    );
  }

  // If not authenticated and trying to access protected view, show login with prompt
  const shouldShowLoginGuard = !isAuthenticated && isCurrentProtected;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <ToastContainer />

      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenCreatePost={() => setCreatePostOpen(true)}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Left Sidebar (Only visible on authenticated pages or docs) */}
        {isAuthenticated && currentView !== 'landing' && (
          <Sidebar
            currentView={currentView}
            onNavigate={handleNavigate}
            onOpenCreatePost={() => setCreatePostOpen(true)}
          />
        )}

        {/* Dynamic Page Content */}
        <main className="flex-1 min-w-0 pb-16 lg:pb-8">
          {shouldShowLoginGuard ? (
            <LoginPage onNavigate={handleNavigate} />
          ) : (
            <>
              {currentView === 'landing' && <LandingPage onNavigate={handleNavigate} />}
              {currentView === 'login' && <LoginPage onNavigate={handleNavigate} />}
              {currentView === 'register' && <RegisterPage onNavigate={handleNavigate} />}
              {currentView === 'feed' && (
                <FeedPage
                  onNavigate={handleNavigate}
                  onOpenCreatePost={() => setCreatePostOpen(true)}
                  onEditPost={(post) => setEditingPost(post)}
                />
              )}
              {currentView === 'explore' && (
                <ExplorePage
                  initialQuery={viewParam}
                  onNavigate={handleNavigate}
                  onEditPost={(post) => setEditingPost(post)}
                />
              )}
              {currentView === 'profile' && (
                <ProfilePage
                  userId={viewParam || user?._id || ''}
                  onNavigate={handleNavigate}
                  onEditPost={(post) => setEditingPost(post)}
                />
              )}
              {currentView === 'editprofile' && (
                <EditProfilePage onNavigate={handleNavigate} />
              )}
              {currentView === 'notifications' && (
                <NotificationsPage onNavigate={handleNavigate} />
              )}
              {currentView === 'chat' && (
                <ChatPage
                  initialConversationId={viewParam}
                  onNavigate={handleNavigate}
                />
              )}
              {currentView === 'settings' && (
                <SettingsPage onNavigate={handleNavigate} />
              )}
              {currentView === 'apidocs' && <ApiDocsPage />}
            </>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {isAuthenticated && currentView !== 'landing' && (
        <MobileNavbar
          currentView={currentView}
          onNavigate={handleNavigate}
          onOpenCreatePost={() => setCreatePostOpen(true)}
        />
      )}

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={createPostOpen}
        onClose={() => setCreatePostOpen(false)}
        onPostCreated={() => {
          if (currentView !== 'feed') {
            handleNavigate('feed');
          }
        }}
      />

      {/* Edit Post Modal */}
      <EditPostModal
        post={editingPost}
        isOpen={!!editingPost}
        onClose={() => setEditingPost(null)}
        onPostUpdated={() => {
          setEditingPost(null);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider>
          <MainApp />
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
