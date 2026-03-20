import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { Subject, PaperLog, DEFAULT_SUBJECTS } from './types';
import { handleFirestoreError, OperationType } from './errorHandling';

export function useStore(userId: string | undefined) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [logs, setLogs] = useState<PaperLog[]>([]);
  const [loading, setLoading] = useState(true);

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
      
      if (loadedSubjects.length === 0 && snapshot.metadata.hasPendingWrites === false) {
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
  }, [userId]);

  const addLog = async (log: Omit<PaperLog, 'id'>) => {
    if (!userId) return;
    const id = crypto.randomUUID();
    try {
      const data = { ...log, id };
      // Remove undefined fields
      Object.keys(data).forEach(key => data[key as keyof typeof data] === undefined && delete data[key as keyof typeof data]);
      await setDoc(doc(db, `users/${userId}/logs`, id), data);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `users/${userId}/logs`);
    }
  };

  const deleteLog = async (id: string) => {
    if (!userId) return;
    try {
      await deleteDoc(doc(db, `users/${userId}/logs`, id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `users/${userId}/logs/${id}`);
    }
  };

  const addSubject = async (subject: Omit<Subject, 'id'>) => {
    if (!userId) return;
    const id = crypto.randomUUID();
    try {
      const data = { ...subject, id };
      // Remove undefined fields
      Object.keys(data).forEach(key => data[key as keyof typeof data] === undefined && delete data[key as keyof typeof data]);
      await setDoc(doc(db, `users/${userId}/subjects`, id), data);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `users/${userId}/subjects`);
    }
  };

  const updateSubject = async (id: string, data: Partial<Subject>) => {
    if (!userId) return;
    try {
      const cleanData = { ...data };
      Object.keys(cleanData).forEach(key => cleanData[key as keyof typeof cleanData] === undefined && delete cleanData[key as keyof typeof cleanData]);
      await setDoc(doc(db, `users/${userId}/subjects`, id), cleanData, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}/subjects/${id}`);
    }
  };

  const deleteSubject = async (id: string) => {
    if (!userId) return;
    try {
      await deleteDoc(doc(db, `users/${userId}/subjects`, id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `users/${userId}/subjects/${id}`);
    }
  };

  return { subjects, logs, loading, addLog, deleteLog, addSubject, updateSubject, deleteSubject };
}
