import { verifyPsikologSession } from "@/lib/auth/dal";
import { getPsychologistByUserId } from "@/lib/psychologists/queries";
import { getSlotsForPsychologist } from "@/lib/availability/queries";
import { SlotForm } from "@/components/availability/slot-form";
import { SlotList } from "@/components/availability/slot-list";
import { WeekCalendarStrip } from "@/components/availability/week-calendar-strip";

export default async function MusaitlikPage() {
  const session = await verifyPsikologSession();
  const profile = await getPsychologistByUserId(session.userId);
  if (!profile) return null;

  const slots = await getSlotsForPsychologist(profile.id);

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground">Müsaitlik Yönetimi</h1>

      <div className="mt-6">
        <WeekCalendarStrip slots={slots} />
      </div>

      <div className="mt-8">
        <SlotForm introCallEnabled={profile.introCallEnabled} />
      </div>

      <div className="mt-6">
        <SlotList slots={slots} />
      </div>
    </div>
  );
}
