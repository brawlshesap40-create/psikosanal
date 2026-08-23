import { getAllPsychologists, countPendingApplications } from "@/lib/psychologists/queries";
import { getAllAppointments } from "@/lib/appointments/queries";
import { getAllDanisanUsers } from "@/lib/users/queries";
import { getAllPayments } from "@/lib/payments/queries";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const [psychologists, pendingCount, appointments, clients, payments] = await Promise.all([
    getAllPsychologists(),
    countPendingApplications(),
    getAllAppointments(),
    getAllDanisanUsers(),
    getAllPayments(),
  ]);

  const approvedCount = psychologists.filter(
    (p) => p.approvalStatus === "onaylandi"
  ).length;
  const upcomingAppointments = appointments.filter((a) => a.status === "onaylandi").length;
  const completedAppointments = appointments.filter((a) => a.status === "tamamlandi").length;
  const cancelledAppointments = appointments.filter((a) => a.status === "iptal_edildi").length;

  const successfulPayments = payments.filter((p) => p.status === "basarili");
  const totalRevenue = successfulPayments.reduce((sum, p) => sum + p.amountTl, 0);
  const refundedAmount = payments
    .filter((p) => p.status === "iade")
    .reduce((sum, p) => sum + p.amountTl, 0);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthRevenue = successfulPayments
    .filter((p) => p.createdAt >= monthStart)
    .reduce((sum, p) => sum + p.amountTl, 0);

  const stats = [
    { label: "Onaylı Psikolog", value: approvedCount },
    { label: "Bekleyen Başvuru", value: pendingCount },
    { label: "Aktif Randevu", value: upcomingAppointments },
    { label: "Toplam Danışan", value: clients.length },
  ];

  const financialStats = [
    { label: "Toplam Gelir", value: `${totalRevenue.toLocaleString("tr-TR")} ₺` },
    { label: "Bu Ay Gelir", value: `${thisMonthRevenue.toLocaleString("tr-TR")} ₺` },
    { label: "İade Edilen", value: `${refundedAmount.toLocaleString("tr-TR")} ₺` },
    { label: "Tamamlanan Randevu", value: completedAppointments },
  ];

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground">Özet</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="mt-8 text-lg font-medium text-foreground">Finansal Özet</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {financialStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        İptal edilen randevu: {cancelledAppointments}
      </p>
    </div>
  );
}
