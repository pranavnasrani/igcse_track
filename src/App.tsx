import { useState } from 'react';
import { useStore } from './store';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { SubjectList } from './components/SubjectList';
import { SubjectDetail } from './components/SubjectDetail';

export default function App() {
  const store = useStore();
  const [currentView, setCurrentView] = useState<'dashboard' | 'subjects' | 'subject'>('dashboard');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  const navigateTo = (view: 'dashboard' | 'subjects' | 'subject', subjectId?: string) => {
    setCurrentView(view);
    if (subjectId) {
      setSelectedSubjectId(subjectId);
    }
  };

  return (
    <Layout currentView={currentView} navigateTo={navigateTo}>
      {currentView === 'dashboard' && <Dashboard store={store} navigateTo={navigateTo} />}
      {currentView === 'subjects' && <SubjectList store={store} navigateTo={navigateTo} />}
      {currentView === 'subject' && selectedSubjectId && (
        <SubjectDetail 
          store={store} 
          subjectId={selectedSubjectId} 
          onBack={() => navigateTo('subjects')} 
        />
      )}
    </Layout>
  );
}
