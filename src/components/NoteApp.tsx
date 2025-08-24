'use client';

import { useAuth } from '@/lib/auth';
import { useNoteStore } from '@/store/useNoteStore';
import NoteSidebar from './NoteSidebar';
import NoteEditor from './NoteEditor';
import LoginForm from './LoginForm';
import { useEffect, useState } from 'react';

export default function NoteApp() {
  const { user, signOut, loading } = useAuth();
  const { loadNotes, setLoggedIn } = useNoteStore();
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (user) {
      setLoggedIn(true);
      loadNotes();
      setShowLogin(false);
    } else {
      setLoggedIn(false);
      loadNotes();
    }
  }, [user, loadNotes, setLoggedIn]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (showLogin && !user) {
    return <LoginForm onBack={() => setShowLogin(false)} />;
  }

  return (
    <div className="bg-slate-900 flex h-screen">
      <NoteSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header banner */}
        <div className="bg-slate-800 border-b border-slate-700 p-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            {!user ? (
              <>
                <span className="text-sm text-slate-400">
                  Notes are saved locally. Sign in to save to cloud.
                </span>
                <button
                  onClick={() => setShowLogin(true)}
                  className="px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700 transition-colors"
                >
                  Sign In
                </button>
              </>
            ) : (
              <>
                <span className="text-sm text-slate-400">
                  Signed in as {user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>

        {/* Note Editor - Takes remaining space */}
        <div className="flex-1 overflow-hidden">
          <NoteEditor />
        </div>
      </div>
    </div>
  );
} 