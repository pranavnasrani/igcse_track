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

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const store = useStore(user?.uid);
  
  const [currentView, setCurrentView] = useState<'dashboard' | 'subjects' | 'subject'>('dashboard');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  const navigateTo = (view: 'dashboard' | 'subjects' | 'subject', subjectId?: string) => {
    setCurrentView(view);
    if (subjectId) {
      setSelectedSubjectId(subjectId);
    }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!user) {
    return <Login />;
  }

  if (store.loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <Layout currentView={currentView} navigateTo={navigateTo} user={user}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView === 'subject' ? `${currentView}-${selectedSubjectId}` : currentView}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          {currentView === 'dashboard' && <Dashboard userId={user.uid} />}
          {currentView === 'subjects' && <SubjectList userId={user.uid} onSelectSubject={(id) => navigateTo('subject', id)} />}
          {currentView === 'subject' && selectedSubjectId && (
            <SubjectDetail 
              userId={user.uid} 
              subjectId={selectedSubjectId} 
              onBack={() => navigateTo('subjects')} 
            />
          )}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}
