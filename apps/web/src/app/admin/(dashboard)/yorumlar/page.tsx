import { Star } from "lucide-react";
import { getPendingReviews } from "@/lib/reviews/queries";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReviewModerationActions } from "@/components/admin/review-moderation-actions";

export default async function AdminYorumlarPage() {
  const reviews = await getPendingReviews();

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground">Onay Bekleyen Yorumlar</h1>

      <div className="mt-6 flex flex-col gap-3">
        {reviews.length === 0 && (
          <p className="text-sm text-muted-foreground">Onay bekleyen yorum yok.</p>
        )}
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{review.client.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    {review.psychologist.user.fullName} hakkında
                  </p>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Star
                      key={value}
                      className={cn(
                        "size-3.5",
                        value <= review.rating
                          ? "fill-primary text-primary"
                          : "text-muted-foreground"
                      )}
                    />
                  ))}
                </div>
              </div>
              {review.comment && (
                <p className="text-sm text-muted-foreground">{review.comment}</p>
              )}
              <ReviewModerationActions reviewId={review.id} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
