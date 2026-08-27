import { listUnanswered } from "@/lib/questions/queries";
import { Card, CardContent } from "@/components/ui/card";
import { AnswerQuestionForm } from "@/components/questions/answer-question-form";

export default async function PsikologSorularPage() {
  const questions = await listUnanswered();

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground">Cevap Bekleyen Sorular</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Danışan adaylarının gönderdiği sorular. İlk cevaplayan psikolog sorunun sahibi olur.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {questions.length === 0 && (
          <p className="text-sm text-muted-foreground">Şu anda cevap bekleyen soru yok.</p>
        )}
        {questions.map((question) => (
          <Card key={question.id}>
            <CardContent className="flex flex-col gap-3">
              <p className="text-sm text-foreground">{question.questionText}</p>
              <AnswerQuestionForm questionId={question.id} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
