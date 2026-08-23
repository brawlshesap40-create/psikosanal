import { getAllPsychologists } from "@/lib/psychologists/queries";
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
  beklemede: "Beklemede",
  onaylandi: "Onaylı",
  reddedildi: "Reddedildi",
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  beklemede: "secondary",
  onaylandi: "default",
  reddedildi: "destructive",
};

export default async function AdminPsikologlarPage() {
  const psychologists = await getAllPsychologists();

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground">Psikologlar</h1>

      <div className="mt-6 rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ad Soyad</TableHead>
              <TableHead>E-posta</TableHead>
              <TableHead>Şehir</TableHead>
              <TableHead>Durum</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {psychologists.map((psychologist) => (
              <TableRow key={psychologist.id}>
                <TableCell>{psychologist.user.fullName}</TableCell>
                <TableCell>{psychologist.user.email}</TableCell>
                <TableCell>{psychologist.city}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[psychologist.approvalStatus]}>
                    {STATUS_LABEL[psychologist.approvalStatus]}
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
