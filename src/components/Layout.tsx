import React from 'react';
import { LayoutDashboard, BookOpen, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { auth } from '../firebase';
import { User } from 'firebase/auth';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface LayoutProps {
  children: React.ReactNode;
  currentView: 'dashboard' | 'subjects' | 'subject';
  navigateTo: (view: 'dashboard' | 'subjects') => void;
  user: User;
}

export function Layout({ children, currentView, navigateTo, user }: LayoutProps) {
  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-tight text-indigo-600 font-display">IGCSE Tracker</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <button
            onClick={() => navigateTo('dashboard')}
            className={cn(
              "flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-colors",
              currentView === 'dashboard' 
                ? "bg-indigo-50 text-indigo-700" 
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Dashboard
          </button>
          <button
            onClick={() => navigateTo('subjects')}
            className={cn(
              "flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-colors",
              (currentView === 'subjects' || currentView === 'subject')
                ? "bg-indigo-50 text-indigo-700" 
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            <BookOpen className="w-5 h-5 mr-3" />
            Subjects
          </button>
        </nav>
        
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center space-x-3 px-2 mb-4">
            <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} alt="Avatar" className="w-10 h-10 rounded-full bg-slate-100" />
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-slate-900 truncate">{user.displayName || 'Student'}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => auth.signOut()}
            className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-indigo-600 font-display">IGCSE Tracker</h1>
          <button onClick={() => auth.signOut()} className="p-2 text-slate-500 hover:text-red-600">
            <LogOut className="w-5 h-5" />
          </button>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto h-full">
            {children}
          </div>
        </div>

        {/* Bottom Navigation for Mobile */}
        <nav className="md:hidden bg-white border-t border-slate-200 flex pb-safe">
          <button
            onClick={() => navigateTo('dashboard')}
            className={cn(
              "flex-1 flex flex-col items-center justify-center py-3 text-xs font-medium",
              currentView === 'dashboard' ? "text-indigo-600" : "text-slate-500"
            )}
          >
            <LayoutDashboard className="w-6 h-6 mb-1" />
            Dashboard
          </button>
          <button
            onClick={() => navigateTo('subjects')}
            className={cn(
              "flex-1 flex flex-col items-center justify-center py-3 text-xs font-medium",
              (currentView === 'subjects' || currentView === 'subject') ? "text-indigo-600" : "text-slate-500"
            )}
          >
            <BookOpen className="w-6 h-6 mb-1" />
            Subjects
          </button>
        </nav>
      </main>
    </div>
  );
}
