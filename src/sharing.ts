import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import {
  collection,
  collectionGroup,
  doc,
  getDocs,
  limit,
  onSnapshot,
  query,
  setDoc,
  where
} from 'firebase/firestore';
import { db } from './firebase';
import { SharedAccount, SharedAccessGrant, UserProfile } from './types';

export async function upsertUserProfile(user: User) {
  if (!user.email) return;

  const profile: UserProfile = {
    uid: user.uid,
    email: user.email,
    emailLowercase: user.email.toLowerCase(),
    displayName: user.displayName || undefined,
    updatedAt: new Date().toISOString()
  };

  await setDoc(doc(db, 'userProfiles', user.uid), profile, { merge: true });
}

export async function grantViewerAccess(owner: User, viewerEmailInput: string) {
  if (!owner.email) {
    throw new Error('Your account email is unavailable.');
  }

  const viewerEmailLowercase = viewerEmailInput.trim().toLowerCase();
  if (!viewerEmailLowercase) {
    throw new Error('Please enter an email address.');
  }

  if (viewerEmailLowercase === owner.email.toLowerCase()) {
    throw new Error('You cannot share your account with yourself.');
  }

  const profileQuery = query(
    collection(db, 'userProfiles'),
    where('emailLowercase', '==', viewerEmailLowercase),
    limit(1)
  );
  const profileSnapshot = await getDocs(profileQuery);

  if (profileSnapshot.empty) {
    throw new Error('No account found with that email. Ask them to sign in first.');
  }

  const profileData = profileSnapshot.docs[0].data() as UserProfile;
  if (!profileData.uid) {
    throw new Error('Unable to resolve that account.');
  }

  const grant: SharedAccessGrant = {
    viewerUid: profileData.uid,
    viewerEmail: profileData.email || viewerEmailLowercase,
    viewerEmailLowercase,
    ownerUid: owner.uid,
    ownerEmail: owner.email,
    ownerDisplayName: owner.displayName || undefined,
    sharedAt: new Date().toISOString()
  };

  await setDoc(doc(db, `users/${owner.uid}/sharedWith`, profileData.uid), grant, { merge: true });
}

export function useSharedAccounts(viewerUid: string | undefined) {
  const [accounts, setAccounts] = useState<SharedAccount[]>([]);

  useEffect(() => {
    if (!viewerUid) {
      setAccounts([]);
      return;
    }

    const sharedQuery = query(collectionGroup(db, 'sharedWith'), where('viewerUid', '==', viewerUid));
    const unsubscribe = onSnapshot(sharedQuery, (snapshot) => {
      const dedupe = new Map<string, SharedAccount>();

      snapshot.docs.forEach((docSnapshot) => {
        const data = docSnapshot.data() as SharedAccessGrant;
        if (!data.ownerUid) return;

        dedupe.set(data.ownerUid, {
          ownerUid: data.ownerUid,
          ownerEmail: data.ownerEmail || '',
          ownerDisplayName: data.ownerDisplayName || undefined
        });
      });

      const shared = [...dedupe.values()].sort((a, b) => {
        const left = (a.ownerDisplayName || a.ownerEmail).toLowerCase();
        const right = (b.ownerDisplayName || b.ownerEmail).toLowerCase();
        return left.localeCompare(right);
      });

      setAccounts(shared);
    });

    return () => unsubscribe();
  }, [viewerUid]);

  return accounts;
}
