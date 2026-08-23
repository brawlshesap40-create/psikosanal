"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { refundPaymentAction } from "@/lib/payments/actions";

export function RefundButton({ paymentId }: { paymentId: number }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant="destructive"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await refundPaymentAction(paymentId);
          if (result?.error) toast.error(result.error);
          else toast.success("Ödeme iade edildi.");
        })
      }
    >
      İade Et
    </Button>
  );
}
