"use client";

import { useUser, useFirestore, useCollection, useMemoFirebase, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { WishlistItem } from '@/types';
import { useRouter } from 'next/navigation';

export function usePriorityList() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();

  const priorityQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(collection(db, 'userProfiles', user.uid, 'wishlist'), orderBy('addedAt', 'desc'));
  }, [db, user?.uid]);

  const { data: priorityItems, isLoading } = useCollection<WishlistItem>(priorityQuery);

  const togglePriority = (productId: string) => {
    if (!user || !db) {
      router.push('/login');
      return;
    }

    const docRef = doc(db, 'userProfiles', user.uid, 'wishlist', productId);
    const exists = priorityItems?.some(item => item.productId === productId);

    if (exists) {
      deleteDocumentNonBlocking(docRef);
    } else {
      setDocumentNonBlocking(docRef, {
        productId,
        addedAt: serverTimestamp(),
      }, { merge: true });
    }
  };

  const isInPriorityList = (productId: string) => {
    return !!priorityItems?.some(item => item.productId === productId);
  };

  return { priorityItems, isLoading, togglePriority, isInPriorityList };
}