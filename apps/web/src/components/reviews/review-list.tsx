import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type Review = {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: Date;
  client: { fullName: string };
};

export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return <p className="text-sm text-muted-foreground">Henüz değerlendirme yapılmamış.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {reviews.map((review) => (
        <div key={review.id} className="border-b border-border pb-4 last:border-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">{review.client.fullName}</p>
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
            <p className="mt-1 text-sm text-muted-foreground">{review.comment}</p>
          )}
        </div>
      ))}
    </div>
  );
}
