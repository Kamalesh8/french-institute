"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { FaStar } from "react-icons/fa";
import { useAuth } from "@/context/auth-context";
import { db } from "@/config/firebase";
import { addDoc, collection, getDocs, query, where, serverTimestamp, orderBy } from "firebase/firestore";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CourseReviewProps {
  courseId: string;
  courseName: string;
}

interface Review {
  id: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export function CourseReview({ courseId, courseName }: CourseReviewProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [hasSubmittedReview, setHasSubmittedReview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch reviews for this course
  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      try {
        const reviewsQuery = query(
          collection(db, "reviews"),
          where("courseId", "==", courseId),
          orderBy("createdAt", "desc")
        );
        
        const reviewsSnapshot = await getDocs(reviewsQuery);
        const reviewsData: Review[] = [];
        
        reviewsSnapshot.forEach((doc) => {
          const data = doc.data();
          reviewsData.push({
            id: doc.id,
            userId: data.userId,
            userName: data.userName,
            userPhotoURL: data.userPhotoURL,
            rating: data.rating,
            comment: data.comment,
            createdAt: data.createdAt?.toDate?.() 
              ? data.createdAt.toDate().toISOString() 
              : new Date().toISOString()
          });
        });
        
        setReviews(reviewsData);
        
        // Check if the current user has already submitted a review
        if (user) {
          const hasReview = reviewsData.some(review => review.userId === user.uid);
          setHasSubmittedReview(hasReview);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
        toast.error("Failed to load reviews");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReviews();
  }, [courseId, user]);

  const submitReview = async () => {
    if (!user) {
      toast.error("You must be logged in to submit a review");
      return;
    }
    
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    
    if (comment.trim() === "") {
      toast.error("Please provide a comment");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const reviewData = {
        courseId,
        courseName,
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        userPhotoURL: user.photoURL,
        rating,
        comment,
        createdAt: serverTimestamp()
      };
      
      await addDoc(collection(db, "reviews"), reviewData);
      
      // Add the new review to the list
      const newReview: Review = {
        id: `temp-${Date.now()}`, // Temporary ID until we refresh
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        userPhotoURL: user.photoURL || undefined,
        rating,
        comment,
        createdAt: new Date().toISOString()
      };
      
      setReviews([newReview, ...reviews]);
      setHasSubmittedReview(true);
      setRating(0);
      setComment("");
      
      toast.success("Review submitted successfully");
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };
  
  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0]; // 5 stars, 4 stars, 3 stars, 2 stars, 1 star
    
    reviews.forEach(review => {
      distribution[5 - review.rating]++;
    });
    
    return distribution;
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Course Reviews</h2>
          <p className="text-muted-foreground">
            {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'} for {courseName}
          </p>
        </div>
        
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar 
                  key={star} 
                  className={star <= parseFloat(calculateAverageRating()) 
                    ? "text-yellow-400" 
                    : "text-gray-300"} 
                  size={20} 
                />
              ))}
            </div>
            <span className="font-bold text-lg">{calculateAverageRating()}</span>
          </div>
        )}
      </div>
      
      {reviews.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rating Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {getRatingDistribution().map((count, index) => {
                  const stars = 5 - index;
                  const percentage = reviews.length > 0 
                    ? Math.round((count / reviews.length) * 100) 
                    : 0;
                  
                  return (
                    <div key={stars} className="flex items-center gap-2">
                      <div className="flex items-center w-16">
                        <span className="text-sm">{stars}</span>
                        <FaStar className="ml-1 text-yellow-400" size={12} />
                      </div>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-400 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-muted-foreground w-8 text-right">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-3">
            {!hasSubmittedReview && user && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Write a Review</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar 
                          key={star} 
                          className={`text-2xl cursor-pointer transition-colors ${
                            star <= (hoverRating || rating) 
                              ? "text-yellow-400" 
                              : "text-gray-300"
                          }`}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                        />
                      ))}
                      <span className="ml-2 text-sm text-muted-foreground">
                        {rating === 1 && "Poor"}
                        {rating === 2 && "Fair"}
                        {rating === 3 && "Good"}
                        {rating === 4 && "Very Good"}
                        {rating === 5 && "Excellent"}
                      </span>
                    </div>
                  </div>
                  
                  <Textarea
                    placeholder="Share your experience with this course..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                  />
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={submitReview} 
                    disabled={isSubmitting || rating === 0 || comment.trim() === ""}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Review"}
                  </Button>
                </CardFooter>
              </Card>
            )}
            
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading reviews...</p>
                </div>
              ) : reviews.length > 0 ? (
                reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarImage src={review.userPhotoURL || ""} />
                          <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                            <div>
                              <h4 className="font-semibold">{review.userName}</h4>
                              <div className="flex items-center gap-1 mt-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <FaStar 
                                    key={star} 
                                    className={star <= review.rating ? "text-yellow-400" : "text-gray-300"} 
                                    size={14} 
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 sm:mt-0">
                              {formatDate(review.createdAt)}
                            </div>
                          </div>
                          
                          <p className="text-sm mt-2">{review.comment}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">No reviews yet. Be the first to review this course!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

