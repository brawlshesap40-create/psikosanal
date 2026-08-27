export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
      <div className="prose-legal mt-6 flex flex-col gap-4 text-[15px] leading-relaxed text-foreground [&_h2]:mt-2 [&_h2]:text-base [&_h2]:font-semibold [&_p]:text-muted-foreground">
        {children}
      </div>
      <p className="mt-10 rounded-md border border-dashed border-border bg-muted px-4 py-3 text-xs text-muted-foreground">
        Bu metin taslak niteliğindedir ve genel bilgilendirme amaçlıdır. Yayına almadan önce bir
        hukuk danışmanı tarafından incelenmesi önerilir.
      </p>
    </article>
  );
}
