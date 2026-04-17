import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { Subject, PaperLog, DEFAULT_SUBJECTS } from './types';
import { handleFirestoreError, OperationType } from './errorHandling';
import { toast } from 'sonner';

export function useStore(userId: string | undefined, actingUserId?: string) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [logs, setLogs] = useState<PaperLog[]>([]);
  const [loading, setLoading] = useState(true);
  const canEdit = useMemo(() => Boolean(userId && actingUserId && userId === actingUserId), [userId, actingUserId]);

  useEffect(() => {
    if (!userId) {
      setSubjects([]);
      setLogs([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const subjectsRef = collection(db, `users/${userId}/subjects`);
    const unsubscribeSubjects = onSnapshot(subjectsRef, (snapshot) => {
      const loadedSubjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject));
      
       if (loadedSubjects.length === 0 && snapshot.metadata.hasPendingWrites === false && canEdit) {
          DEFAULT_SUBJECTS.forEach(async (subj) => {
             try {
               await setDoc(doc(db, `users/${userId}/subjects`, subj.id), subj);
             } catch (e) {
               handleFirestoreError(e, OperationType.CREATE, `users/${userId}/subjects`);
             }
          });
       } else {
          setSubjects(loadedSubjects);
       }
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${userId}/subjects`));

    const logsRef = query(collection(db, `users/${userId}/logs`), orderBy('date', 'desc'));
    const unsubscribeLogs = onSnapshot(logsRef, (snapshot) => {
      setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PaperLog)));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${userId}/logs`));

    return () => {
      unsubscribeSubjects();
      unsubscribeLogs();
    };
  }, [userId, canEdit]);

  const addLog = async (log: Omit<PaperLog, 'id'>) => {
    if (!userId) return;
    if (!canEdit) {
      toast.error('Shared accounts are read-only.');
      return;
    }
    const id = crypto.randomUUID();
    try {
      const data = { ...log, id };
      // Remove undefined fields
      Object.keys(data).forEach(key => data[key as keyof typeof data] === undefined && delete data[key as keyof typeof data]);
      await setDoc(doc(db, `users/${userId}/logs`, id), data);
      toast.success('Paper logged successfully!');
    } catch (e) {
      toast.error('Failed to log paper');
      handleFirestoreError(e, OperationType.CREATE, `users/${userId}/logs`);
    }
  };

  const updateLog = async (id: string, data: Partial<PaperLog>) => {
    if (!userId) return;
    if (!canEdit) {
      toast.error('Shared accounts are read-only.');
      return;
    }
    try {
      const cleanData = { ...data };
      Object.keys(cleanData).forEach(key => cleanData[key as keyof typeof cleanData] === undefined && delete cleanData[key as keyof typeof cleanData]);
      await setDoc(doc(db, `users/${userId}/logs`, id), cleanData, { merge: true });
      toast.success('Log updated successfully!');
    } catch (e) {
      toast.error('Failed to update log');
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}/logs/${id}`);
    }
  };

  const deleteLog = async (id: string) => {
    if (!userId) return;
    if (!canEdit) {
      toast.error('Shared accounts are read-only.');
      return;
    }
    try {
      await deleteDoc(doc(db, `users/${userId}/logs`, id));
      toast.success('Log deleted');
    } catch (e) {
      toast.error('Failed to delete log');
      handleFirestoreError(e, OperationType.DELETE, `users/${userId}/logs/${id}`);
    }
  };

  const addSubject = async (subject: Omit<Subject, 'id'>) => {
    if (!userId) return;
    if (!canEdit) {
      toast.error('Shared accounts are read-only.');
      return;
    }
    const id = crypto.randomUUID();
    try {
      const data = { ...subject, id };
      // Remove undefined fields
      Object.keys(data).forEach(key => data[key as keyof typeof data] === undefined && delete data[key as keyof typeof data]);
      await setDoc(doc(db, `users/${userId}/subjects`, id), data);
      toast.success('Subject added successfully!');
    } catch (e) {
      toast.error('Failed to add subject');
      handleFirestoreError(e, OperationType.CREATE, `users/${userId}/subjects`);
    }
  };

  const updateSubject = async (id: string, data: Partial<Subject>) => {
    if (!userId) return;
    if (!canEdit) {
      toast.error('Shared accounts are read-only.');
      return;
    }
    try {
      const cleanData = { ...data };
      Object.keys(cleanData).forEach(key => cleanData[key as keyof typeof cleanData] === undefined && delete cleanData[key as keyof typeof cleanData]);
      await setDoc(doc(db, `users/${userId}/subjects`, id), cleanData, { merge: true });
      toast.success('Subject updated');
    } catch (e) {
      toast.error('Failed to update subject');
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}/subjects/${id}`);
    }
  };

  const deleteSubject = async (id: string) => {
    if (!userId) return;
    if (!canEdit) {
      toast.error('Shared accounts are read-only.');
      return;
    }
    try {
      await deleteDoc(doc(db, `users/${userId}/subjects`, id));
      toast.success('Subject deleted');
    } catch (e) {
      toast.error('Failed to delete subject');
      handleFirestoreError(e, OperationType.DELETE, `users/${userId}/subjects/${id}`);
    }
  };

  return { subjects, logs, loading, canEdit, addLog, updateLog, deleteLog, addSubject, updateSubject, deleteSubject };
}
