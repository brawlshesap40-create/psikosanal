import { listLeads } from "@/lib/corporate/queries";
import { Card, CardContent } from "@/components/ui/card";
import { CorporateLeadStatus } from "@/components/admin/corporate-lead-status";

export default async function AdminKurumsalTaleplerPage() {
  const leads = await listLeads();

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground">Kurumsal Talepler</h1>

      <div className="mt-6 flex flex-col gap-3">
        {leads.length === 0 && (
          <p className="text-sm text-muted-foreground">Henüz kurumsal talep yok.</p>
        )}
        {leads.map((lead) => (
          <Card key={lead.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-medium text-foreground">{lead.companyName}</p>
                <p className="text-sm text-muted-foreground">
                  {lead.contactName} · {lead.email}
                  {lead.phone && ` · ${lead.phone}`}
                </p>
                {lead.employeeCountRange && (
                  <p className="text-xs text-muted-foreground">
                    Çalışan sayısı: {lead.employeeCountRange}
                  </p>
                )}
                {lead.message && (
                  <p className="mt-1 text-sm text-muted-foreground">{lead.message}</p>
                )}
              </div>
              <CorporateLeadStatus id={lead.id} status={lead.status} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
