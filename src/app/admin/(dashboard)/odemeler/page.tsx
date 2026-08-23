import { getAllPayments } from "@/lib/payments/queries";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RefundButton } from "@/components/admin/refund-button";

const STATUS_LABEL: Record<string, string> = {
  beklemede: "Beklemede",
  basarili: "Başarılı",
  basarisiz: "Başarısız",
  iade: "İade Edildi",
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  beklemede: "secondary",
  basarili: "default",
  basarisiz: "destructive",
  iade: "outline",
};

export default async function AdminOdemelerPage() {
  const payments = await getAllPayments();

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground">Ödemeler</h1>

      <div className="mt-6 rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Danışan</TableHead>
              <TableHead>Psikolog</TableHead>
              <TableHead>Tür</TableHead>
              <TableHead>Tutar</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Tarih</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{payment.client.fullName}</TableCell>
                <TableCell>{payment.psychologist.user.fullName}</TableCell>
                <TableCell>{payment.kind === "seans" ? "Seans" : "Paket"}</TableCell>
                <TableCell>{payment.amountTl.toLocaleString("tr-TR")} ₺</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[payment.status]}>
                    {STATUS_LABEL[payment.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(payment.createdAt).toLocaleString("tr-TR", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>
                <TableCell>
                  {payment.status === "basarili" && <RefundButton paymentId={payment.id} />}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
