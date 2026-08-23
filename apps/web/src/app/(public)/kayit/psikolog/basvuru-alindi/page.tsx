import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function BasvuruAlindiPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16 text-center sm:px-6">
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-4">
          <CheckCircle2 className="size-10 text-primary" />
          <h1 className="text-lg font-semibold text-foreground">
            Başvurunuz Alındı
          </h1>
          <p className="text-sm text-muted-foreground">
            Başvurunuz admin ekibimiz tarafından incelenecek. Onaylandığında
            profiliniz platformda yayına alınacak.
          </p>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/psikolog/panel" />}
          >
            Panelime Git
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
