import { listPublished } from "@/lib/questions/queries";
import { Card, CardContent } from "@/components/ui/card";
import { SubmitQuestionForm } from "@/components/questions/submit-question-form";

export default async function SoruSorPage() {
  const published = await listPublished();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-semibold text-foreground">
        <span className="text-gradient-brand">Psikoloğa</span> Soru Sor
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Aklınızdaki soruyu gönderin, uzman psikologlarımızdan biri cevaplasın. İsterseniz
        anonim kalabilirsiniz.
      </p>

      <Card className="mt-6 shadow-lg shadow-black/[0.04]">
        <CardContent>
          <SubmitQuestionForm />
        </CardContent>
      </Card>

      {published.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-foreground">Cevaplanan Sorular</h2>
          <div className="mt-4 flex flex-col gap-4">
            {published.map((question) => (
              <Card key={question.id}>
                <CardContent className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-foreground">{question.questionText}</p>
                  <p className="text-sm text-muted-foreground">{question.answerText}</p>
                  {question.answeredByPsychologist && (
                    <p className="text-xs text-muted-foreground">
                      — {question.answeredByPsychologist.user.fullName},{" "}
                      {question.answeredByPsychologist.title}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
