"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateCorporateLeadStatusAction } from "@/lib/corporate/actions";
import type { corporateService } from "@psikosanal/core";

type CorporateLeadStatusValue = corporateService.CorporateLeadStatus;

const STATUS_LABEL: Record<string, string> = {
  yeni: "Yeni",
  iletisimde: "İletişimde",
  kapandi: "Kapandı",
};

export function CorporateLeadStatus({
  id,
  status,
}: {
  id: number;
  status: CorporateLeadStatusValue;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Select
      value={status}
      disabled={pending}
      onValueChange={(value) => {
        if (!value || value === status) return;
        startTransition(async () => {
          await updateCorporateLeadStatusAction(id, value as CorporateLeadStatusValue);
          toast.success("Durum güncellendi.");
        });
      }}
    >
      <SelectTrigger className="w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(STATUS_LABEL).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
