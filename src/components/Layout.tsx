import React, { useState, useEffect } from 'react';
import { LayoutDashboard, BookOpen, LogOut, Sun, Moon, Plus } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { auth } from '../firebase';
import { User } from 'firebase/auth';
import { LogForm } from './LogForm';
import { useStore } from '../store';
import { SharedAccount } from '../types';
import { toast } from 'sonner';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface LayoutProps {
  children: React.ReactNode;
  currentView: 'dashboard' | 'subjects' | 'subject';
  navigateTo: (view: 'dashboard' | 'subjects') => void;
  user: User;
  store: ReturnType<typeof useStore>;
  sharedAccounts: SharedAccount[];
  activeUserId: string;
  onSelectActiveUser: (userId: string) => void;
  isSharedView: boolean;
  onShareByEmail: (email: string) => Promise<void>;
}

export function Layout({
  children,
  currentView,
  navigateTo,
  user,
  store,
  sharedAccounts,
  activeUserId,
  onSelectActiveUser,
  isSharedView,
  onShareByEmail
}: LayoutProps) {
  const [isLogFormOpen, setIsLogFormOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (isSharedView) {
      setIsLogFormOpen(false);
    }
  }, [isSharedView]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareEmail.trim()) {
      toast.error('Please enter an email address.');
      return;
    }

    try {
      setIsSharing(true);
      await onShareByEmail(shareEmail.trim());
      toast.success('Access shared successfully.');
      setShareEmail('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to share access.');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="flex h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans transition-colors duration-200">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-colors duration-200">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400 font-display">IGCSE Tracker</h1>
          <button
            onClick={() => {
              if (!isSharedView) {
                setIsLogFormOpen(true);
              }
            }}
            disabled={isSharedView}
            aria-label={isSharedView ? 'Read-only view - logging disabled' : 'Quick log paper'}
            title={isSharedView ? 'Read-only view - logging disabled' : 'Quick log paper'}
            className="mt-6 w-full flex items-center justify-center px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isSharedView ? 'Read-only View' : 'Quick Log'}
          </button>
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Viewing</label>
              <select
                value={activeUserId}
                onChange={(e) => onSelectActiveUser(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-colors"
              >
                <option value={user.uid}>My Account</option>
                {sharedAccounts.map((account) => (
                  <option key={account.ownerUid} value={account.ownerUid}>
                    {account.ownerDisplayName || account.ownerEmail || 'Unknown User'}
                  </option>
                ))}
              </select>
            </div>
            <form onSubmit={handleShare} className="space-y-2">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Share access</label>
              <input
                type="email"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                placeholder="parent@email.com"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-colors"
              />
              <button
                type="submit"
                disabled={isSharing}
                className="w-full px-3 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {isSharing ? 'Sharing...' : 'Share by Email'}
              </button>
            </form>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <button
            onClick={() => navigateTo('dashboard')}
            className={cn(
              "flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-colors",
              currentView === 'dashboard' 
                ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400" 
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
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
                ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400" 
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
            )}
          >
            <BookOpen className="w-5 h-5 mr-3" />
            Subjects
          </button>
        </nav>
        
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3 px-2 mb-4">
            <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} alt="Avatar" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800" />
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{user.displayName || 'Student'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleDarkMode}
              className="flex-1 flex items-center justify-center px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => auth.signOut()}
              className="flex-1 flex items-center justify-center px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
        {/* Mobile Header */}
        <header className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between transition-colors duration-200">
          <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 font-display">IGCSE Tracker</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                if (!isSharedView) {
                  setIsLogFormOpen(true);
                }
              }}
              disabled={isSharedView}
              aria-label={isSharedView ? 'Read-only view - logging disabled' : 'Quick log paper'}
              title={isSharedView ? 'Read-only view - logging disabled' : 'Quick log paper'}
              className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-colors disabled:opacity-40"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button onClick={toggleDarkMode} className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={() => auth.signOut()} className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto overscroll-y-contain p-4 md:p-8">
          <div className="max-w-5xl mx-auto h-full">
            {children}
          </div>
        </div>

        {/* Bottom Navigation for Mobile */}
        <nav className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex pb-safe transition-colors duration-200">
          <button
            onClick={() => navigateTo('dashboard')}
            className={cn(
              "flex-1 flex flex-col items-center justify-center py-3 text-xs font-medium",
              currentView === 'dashboard' ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"
            )}
          >
            <LayoutDashboard className="w-6 h-6 mb-1" />
            Dashboard
          </button>
          <button
            onClick={() => navigateTo('subjects')}
            className={cn(
              "flex-1 flex flex-col items-center justify-center py-3 text-xs font-medium",
              (currentView === 'subjects' || currentView === 'subject') ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"
            )}
          >
            <BookOpen className="w-6 h-6 mb-1" />
            Subjects
          </button>
        </nav>
      </main>
      {isLogFormOpen && !isSharedView && <LogForm store={store} onClose={() => setIsLogFormOpen(false)} />}
    </div>
  );
}
