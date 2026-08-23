import { getAllAppointments } from "@/lib/appointments/queries";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const STATUS_LABEL: Record<string, string> = {
  onaylandi: "Onaylandı",
  tamamlandi: "Tamamlandı",
  iptal_edildi: "İptal Edildi",
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  onaylandi: "default",
  tamamlandi: "secondary",
  iptal_edildi: "destructive",
};

export default async function AdminRandevularPage() {
  const appointments = await getAllAppointments();

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground">Randevular</h1>

      <div className="mt-6 rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Danışan</TableHead>
              <TableHead>Psikolog</TableHead>
              <TableHead>Tarih</TableHead>
              <TableHead>Durum</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell>{appointment.client.fullName}</TableCell>
                <TableCell>{appointment.psychologist.user.fullName}</TableCell>
                <TableCell>
                  {new Date(appointment.slot.startTime).toLocaleString("tr-TR", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[appointment.status]}>
                    {STATUS_LABEL[appointment.status]}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
