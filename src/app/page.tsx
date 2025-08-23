'use client';

import { useAuth } from '@/lib/auth';
import LoginForm from '@/components/LoginForm';
import NoteApp from '@/components/NoteApp';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return <NoteApp />;
}
