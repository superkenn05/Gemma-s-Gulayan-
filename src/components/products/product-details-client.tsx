
"use client";

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft, Star, Minus, Plus, Heart, Loader2, Send, MessageSquare, ShoppingCart, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { usePriorityList } from '@/hooks/use-wishlist';
import { useState } from 'react';
import { ProductCard } from '@/components/products/product-card';
import { cn } from '@/lib/utils';
import { useFirestore, useDoc, useMemoFirebase, useCollection, useUser, addDocumentNonBlocking } from '@/firebase';
import { doc, collection, query, where, limit, orderBy, serverTimestamp } from 'firebase/firestore';
import { Product, Review, UserProfile } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ProductDetailsClient({ id }: { id: string }) {
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();
  const { addToCart, totalItems } = useCart();
  const { togglePriority, isInPriorityList } = usePriorityList();
  
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const productRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, 'products', id);
  }, [db, id]);

  const { data: product, isLoading } = useDoc<Product>(productRef);

  const currentUserProfileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'userProfiles', user.uid);
  }, [db, user]);

  const { data: currentUserProfile } = useDoc<UserProfile>(currentUserProfileRef);

  const reviewsQuery = useMemoFirebase(() => {
    if (!db || !id) return null;
    return query(
      collection(db, 'products', id, 'reviews'),
      orderBy('createdAt', 'desc')
    );
  }, [db, id]);

  const { data: reviews } = useCollection<Review>(reviewsQuery);

  const relatedQuery = useMemoFirebase(() => {
    if (!db || !product?.categoryId) return null;
    return query(
      collection(db, 'products'), 
      where('categoryId', '==', product.categoryId),
      limit(5)
    );
  }, [db, product?.categoryId]);

  const { data: relatedProducts } = useCollection<Product>(relatedQuery);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product || (product.currentStockQuantity || 0) <= 0) return;

    addToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 1500);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db || !id || !reviewComment.trim() || isSubmittingReview) return;

    setIsSubmittingReview(true);
    
    const userName = currentUserProfile?.firstName 
      ? `${currentUserProfile.firstName} ${currentUserProfile.lastName}`.trim() 
      : (user.displayName || 'Gemma\'s Customer');
      
    const userPhotoUrl = currentUserProfile?.profileImageUrl || user.photoURL || '';

    const reviewData = {
      userId: user.uid,
      productId: id,
      userName: userName,
      userPhotoUrl: userPhotoUrl,
      rating: reviewRating,
      comment: reviewComment,
      createdAt: serverTimestamp(),
    };

    try {
      const reviewsCol = collection(db, 'products', id, 'reviews');
      await addDocumentNonBlocking(reviewsCol, reviewData);

      const userReviewsCol = collection(db, 'userProfiles', user.uid, 'productReviews');
      await addDocumentNonBlocking(userReviewsCol, {
        ...reviewData,
        productName: product?.name || 'Unknown Product',
        productImageUrl: product?.imageUrl || ''
      });

      setReviewComment('');
      setReviewRating(5);
    } catch (err) {
      console.error("Error submitting review:", err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Loading details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6 text-center space-y-4">
        <h1 className="text-xl font-black">Fresh harvest not found</h1>
        <Button onClick={() => router.push('/')} className="rounded-2xl px-8 h-12">Go Back Home</Button>
      </div>
    );
  }

  const isPriority = isInPriorityList(product.id);
  const filteredRelated = relatedProducts?.filter(p => p.id !== product.id) || [];
  const safePrice = Number(product.pricePerUnit) || 0;
  
  const stockCount = product.currentStockQuantity || 0;
  const isOutOfStock = stockCount <= 0;
  const isLowStock = !isOutOfStock && stockCount <= (product.lowStockThreshold || 10);

  const previewReviews = reviews?.slice(0, 2) || [];

  return (
    <div className="min-h-screen bg-white pb-32">
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-transparent">
        <Button variant="secondary" size="icon" className="rounded-full bg-white/80 backdrop-blur" onClick={() => router.back()}>
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <Button 
          variant="secondary" 
          size="icon" 
          className={cn("rounded-full bg-white/80 backdrop-blur", isPriority ? "text-red-500" : "text-foreground")}
          onClick={() => togglePriority(product.id)}
        >
          <Heart className={cn("w-5 h-5", isPriority && "fill-current")} />
        </Button>
      </div>

      <div className="relative w-full aspect-square bg-[#F8FBF8]">
        <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <Badge variant="destructive" className="px-6 py-2 text-lg font-black uppercase tracking-widest">Out of Stock</Badge>
          </div>
        )}
      </div>

      <div className="px-6 py-6 -mt-10 rounded-t-[40px] bg-white relative z-10 shadow-2xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Badge className="bg-primary/10 text-primary uppercase font-black text-[10px]">{product.categoryId}</Badge>
            {isLowStock && <Badge className="bg-orange-500 text-white font-black text-[10px] animate-pulse">Low Stock</Badge>}
          </div>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-black">{product.rating || 0}</span>
          </div>
        </div>

        <h1 className="text-3xl font-black font-headline mb-4">{product.name}</h1>
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Price</p>
            <p className="text-2xl font-black text-primary">₱{safePrice.toFixed(2)}</p>
          </div>
          <div className="flex items-center bg-muted/80 rounded-2xl p-1.5 border">
            <Button size="icon" variant="secondary" className="h-10 w-10 bg-white" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={isOutOfStock}>
              <Minus className="w-5 h-5 text-primary" />
            </Button>
            <span className="w-12 text-center font-black text-xl">{isOutOfStock ? 0 : quantity}</span>
            <Button size="icon" variant="secondary" className="h-10 w-10 bg-white" onClick={() => setQuantity(quantity + 1)} disabled={isOutOfStock || quantity >= stockCount}>
              <Plus className="w-5 h-5 text-primary" />
            </Button>
          </div>
        </div>

        <div className="space-y-4 mb-10">
          <h3 className="text-lg font-black font-headline">Description</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
        </div>

        <div className="mb-10 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black font-headline flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Customer Reviews
            </h3>
            <span className="text-xs font-bold text-muted-foreground uppercase">{reviews?.length || 0} Reviews</span>
          </div>

          {user && (
            <div className="bg-muted/30 rounded-3xl p-5 border border-dashed border-primary/20 space-y-4">
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setReviewRating(star)}>
                    <Star className={cn("w-5 h-5", star <= reviewRating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30")} />
                  </button>
                ))}
              </div>
              <div className="relative">
                <Textarea 
                  placeholder="Tell us what you think..." 
                  className="rounded-2xl bg-white min-h-[100px]"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                />
                <Button 
                  size="icon" 
                  className="absolute bottom-3 right-3 rounded-xl"
                  onClick={handleSubmitReview}
                  disabled={!reviewComment.trim() || isSubmittingReview}
                >
                  {isSubmittingReview ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {previewReviews.map((review) => (
              <div key={review.id} className="bg-white rounded-2xl p-4 border border-border/50 shadow-sm flex space-x-4">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={review.userPhotoUrl} />
                  <AvatarFallback>{review.userName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-sm">{review.userName}</h4>
                    <span className="text-[9px] text-muted-foreground uppercase">{review.createdAt?.seconds ? formatDistanceToNow(new Date(review.createdAt.seconds * 1000), { addSuffix: true }) : 'Just now'}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed italic">"{review.comment}"</p>
                </div>
              </div>
            ))}

            {reviews && reviews.length > 2 && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="w-full text-primary font-bold">
                    Read all {reviews.length} reviews <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-3xl max-h-[80vh] flex flex-col p-0 overflow-hidden border-none bg-background">
                  <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-2xl font-black font-headline">Customer Feedback</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="flex-1 px-6 pb-6">
                    <div className="space-y-4 pr-2">
                      {reviews.map((review) => (
                        <div key={review.id} className="bg-muted/30 rounded-3xl p-5 border border-border/50 flex space-x-4">
                          <Avatar className="w-10 h-10 shrink-0">
                            <AvatarImage src={review.userPhotoUrl} />
                            <AvatarFallback>{review.userName?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <div className="flex justify-between items-center">
                              <h4 className="font-bold text-sm">{review.userName}</h4>
                              <div className="flex space-x-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star key={s} className={cn("w-2.5 h-2.5", s <= review.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/20")} />
                                ))}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed italic">"{review.comment}"</p>
                            <p className="text-[9px] text-muted-foreground/50 uppercase font-bold pt-1">
                              {review.createdAt?.seconds ? formatDistanceToNow(new Date(review.createdAt.seconds * 1000), { addSuffix: true }) : 'Just now'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {filteredRelated.length > 0 && (
          <div className="mt-10">
            <h3 className="text-lg font-black font-headline mb-4">Related Harvest</h3>
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
              {filteredRelated.map(p => (
                <div key={p.id} className="min-w-[160px]"><ProductCard product={p} /></div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex space-x-3 items-center pb-safe shadow-2xl z-50">
        <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl text-primary relative" onClick={() => router.push('/cart')}>
          <ShoppingCart className="w-5 h-5" />
          {totalItems > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">{totalItems}</span>}
        </Button>
        <Button 
          disabled={isOutOfStock || isAdded}
          className={cn("flex-1 h-12 rounded-xl text-base font-bold transition-all", isAdded ? "bg-green-500" : "bg-primary")}
          onClick={handleAddToCart}
        >
          {isAdded ? "Added!" : isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>
      </div>
    </div>
  );
}
