
"use client";

import { useRouter } from 'next/navigation';
import { ChevronLeft, MessageSquare, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export default function MyReviewsPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();

  const reviewsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'userProfiles', user.uid, 'productReviews'),
      orderBy('createdAt', 'desc')
    );
  }, [db, user]);

  const { data: reviews, isLoading } = useCollection<any>(reviewsQuery);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur p-4 flex items-center space-x-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-xl font-black font-headline">My Reviews</h1>
      </header>

      <main className="p-4 space-y-4">
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground font-medium mt-4">Fetching your feedback...</p>
          </div>
        ) : !reviews || reviews.length === 0 ? (
          <div className="py-20 text-center space-y-6">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
              <MessageSquare className="w-10 h-10 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold">No reviews yet</h2>
              <p className="text-muted-foreground text-sm max-w-[250px] mx-auto">Share your experience with our harvest!</p>
            </div>
            <Button onClick={() => router.push('/products')} className="rounded-xl px-8 h-12">Browse Harvest</Button>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-2xl p-4 shadow-sm border border-border/50 space-y-4">
              <div className="flex items-center space-x-3 pb-3 border-b border-dashed">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-muted">
                  <Image src={review.productImageUrl || 'https://picsum.photos/seed/fresh/200/200'} alt={review.productName} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm truncate">{review.productName}</h3>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-muted-foreground/40" />
                    <span className="text-[10px] text-muted-foreground/60 font-bold uppercase">
                      {review.createdAt?.seconds ? formatDistanceToNow(new Date(review.createdAt.seconds * 1000), { addSuffix: true }) : 'Recently'}
                    </span>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary text-[10px] font-black h-8" 
                  onClick={() => router.push(`/products/details?id=${review.productId}`)}
                >
                  View
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex space-x-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={cn("w-3.5 h-3.5", s <= review.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/20")} />
                  ))}
                </div>
                <p className="text-sm text-foreground font-medium leading-relaxed italic">"{review.comment}"</p>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
