import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import { useStore } from './store';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { SubjectList } from './components/SubjectList';
import { SubjectDetail } from './components/SubjectDetail';
import { Login } from './components/Login';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster } from 'sonner';
import { grantViewerAccess, upsertUserProfile, useSharedAccounts } from './sharing';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setActiveUserId(null);
      return;
    }

    setActiveUserId((prev) => prev || user.uid);
    upsertUserProfile(user).catch((error) => {
      console.error('Failed to save user profile', error);
    });
  }, [user]);

  const sharedAccounts = useSharedAccounts(user?.uid);

  useEffect(() => {
    if (!user) return;
    if (!activeUserId) {
      setActiveUserId(user.uid);
      return;
    }

    const validShared = sharedAccounts.some((account) => account.ownerUid === activeUserId);
    if (activeUserId !== user.uid && !validShared) {
      setActiveUserId(user.uid);
    }
  }, [user, activeUserId, sharedAccounts]);

  const viewingUserId = activeUserId || user?.uid;
  const isSharedView = Boolean(user && viewingUserId && viewingUserId !== user.uid);
  const store = useStore(viewingUserId, user?.uid);
  
  const [currentView, setCurrentView] = useState<'dashboard' | 'subjects' | 'subject'>('dashboard');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  const navigateTo = (view: 'dashboard' | 'subjects' | 'subject', subjectId?: string) => {
    setCurrentView(view);
    if (subjectId) {
      setSelectedSubjectId(subjectId);
    }
  };

  if (authLoading) {
    return <div className="h-full flex items-center justify-center bg-slate-50 dark:bg-slate-950"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!user) {
    return <Login />;
  }

  if (!viewingUserId) {
    return <div className="h-full flex items-center justify-center bg-slate-50 dark:bg-slate-950"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (store.loading) {
    return <div className="h-full flex items-center justify-center bg-slate-50 dark:bg-slate-950"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <Layout
      currentView={currentView}
      navigateTo={navigateTo}
      user={user}
      store={store}
      sharedAccounts={sharedAccounts}
      activeUserId={viewingUserId}
      onSelectActiveUser={(id) => {
        setActiveUserId(id);
        setCurrentView('dashboard');
        setSelectedSubjectId(null);
      }}
      isSharedView={isSharedView}
      onShareByEmail={(email) => grantViewerAccess(user, email)}
    >
      <Toaster position="bottom-right" richColors />
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView === 'subject' ? `${currentView}-${selectedSubjectId}` : currentView}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          {currentView === 'dashboard' && <Dashboard userId={viewingUserId} actingUserId={user.uid} />}
          {currentView === 'subjects' && <SubjectList userId={viewingUserId} actingUserId={user.uid} onSelectSubject={(id) => navigateTo('subject', id)} />}
          {currentView === 'subject' && selectedSubjectId && (
            <SubjectDetail 
              userId={viewingUserId} 
              actingUserId={user.uid}
              subjectId={selectedSubjectId} 
              onBack={() => navigateTo('subjects')} 
            />
          )}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}
