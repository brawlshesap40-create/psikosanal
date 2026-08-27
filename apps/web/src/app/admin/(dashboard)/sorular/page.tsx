import { listAnsweredForAdmin } from "@/lib/questions/queries";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { QuestionPublishToggle } from "@/components/admin/question-publish-toggle";

export default async function AdminSorularPage() {
  const questions = await listAnsweredForAdmin();

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground">Cevaplanan Sorular</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Psikologlarca cevaplanan sorular burada listelenir. Yayınladığınız sorular
        &ldquo;Psikoloğa Soru Sor&rdquo; sayfasında herkese görünür.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {questions.length === 0 && (
          <p className="text-sm text-muted-foreground">Cevaplanmış soru yok.</p>
        )}
        {questions.map((question) => (
          <Card key={question.id}>
            <CardContent className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-4">
                <p className="font-medium text-foreground">{question.questionText}</p>
                <Badge variant={question.status === "yayinda" ? "default" : "secondary"}>
                  {question.status === "yayinda" ? "Yayında" : "Cevaplandı"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{question.answerText}</p>
              {question.answeredByPsychologist && (
                <p className="text-xs text-muted-foreground">
                  — {question.answeredByPsychologist.user.fullName}
                </p>
              )}
              <div>
                <QuestionPublishToggle id={question.id} status={question.status} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
