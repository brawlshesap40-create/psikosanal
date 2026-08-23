import bcrypt from "bcryptjs";
import { db } from "../src/lib/db";
import {
  availabilitySlots,
  psychologistProfiles,
  psychologistSpecialties,
  specialties,
  users,
} from "../src/lib/db/schema";
import { generatePsychologistSlug } from "../src/lib/psychologists/slug";

const SPECIALTIES = [
  "Kaygı Bozukluğu",
  "Depresyon",
  "İlişki Terapisi",
  "Aile Terapisi",
  "Çocuk ve Ergen",
  "Travma / EMDR",
  "Bağımlılık",
  "Kişilik Bozuklukları",
];

function slugify(input: string) {
  return input
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const DEMO_PSYCHOLOGISTS = [
  {
    fullName: "Ayşe Yılmaz",
    email: "ayse.yilmaz@example.com",
    title: "Klinik Psikolog",
    experienceYears: 9,
    sessionPriceTl: 1200,
    city: "İstanbul",
    bio: "Yetişkin bireylerle kaygı ve depresyon odaklı bilişsel davranışçı terapi uyguluyorum.",
    specialties: ["Kaygı Bozukluğu", "Depresyon"],
  },
  {
    fullName: "Mehmet Demir",
    email: "mehmet.demir@example.com",
    title: "Uzman Psikolog",
    experienceYears: 6,
    sessionPriceTl: 950,
    city: "Ankara",
    bio: "Çift ve aile terapisi alanında çalışıyorum, ilişki dinamikleri üzerine odaklanıyorum.",
    specialties: ["İlişki Terapisi", "Aile Terapisi"],
  },
];

async function seedAdminUser() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn(
      "SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD tanimli degil, admin kullanici olusturulmadi."
    );
    return;
  }

  const existing = await db.query.users.findFirst({
    where: (fields, { eq }) => eq(fields.email, email.toLowerCase()),
  });
  if (existing) {
    console.log(`Admin kullanici zaten mevcut: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db.insert(users).values({
    email: email.toLowerCase(),
    passwordHash,
    role: "admin",
    fullName: "Admin",
  });
  console.log(`Admin kullanici olusturuldu: ${email}`);
}

async function seedSpecialties() {
  const existing = await db.select({ id: specialties.id }).from(specialties).limit(1);
  if (existing.length > 0) {
    console.log("Uzmanlik alanlari zaten mevcut.");
    return;
  }

  await db
    .insert(specialties)
    .values(SPECIALTIES.map((name) => ({ name, slug: slugify(name) })));
  console.log(`${SPECIALTIES.length} uzmanlik alani eklendi.`);
}

async function seedDemoPsychologists() {
  const existing = await db
    .select({ id: psychologistProfiles.id })
    .from(psychologistProfiles)
    .limit(1);
  if (existing.length > 0) {
    console.log("Demo psikolog zaten mevcut.");
    return;
  }

  const allSpecialties = await db.query.specialties.findMany();

  for (const item of DEMO_PSYCHOLOGISTS) {
    const passwordHash = await bcrypt.hash("demo12345", 10);
    const [user] = await db
      .insert(users)
      .values({
        email: item.email,
        passwordHash,
        role: "psikolog",
        fullName: item.fullName,
        phone: "5550000000",
      })
      .returning();

    const slug = await generatePsychologistSlug(item.fullName);
    const [profile] = await db
      .insert(psychologistProfiles)
      .values({
        userId: user.id,
        slug,
        title: item.title,
        bio: item.bio,
        experienceYears: item.experienceYears,
        sessionPriceTl: item.sessionPriceTl,
        city: item.city,
        onlineAvailable: true,
        approvalStatus: "onaylandi",
      })
      .returning();

    const specialtyIds = allSpecialties
      .filter((specialty) => item.specialties.includes(specialty.name))
      .map((specialty) => specialty.id);

    if (specialtyIds.length > 0) {
      await db.insert(psychologistSpecialties).values(
        specialtyIds.map((specialtyId) => ({
          psychologistId: profile.id,
          specialtyId,
        }))
      );
    }

    const now = new Date();
    const slots = [1, 2, 3, 4].map((daysAhead) => {
      const startTime = new Date(now);
      startTime.setDate(startTime.getDate() + daysAhead);
      startTime.setHours(14, 0, 0, 0);
      return { psychologistId: profile.id, startTime, durationMinutes: 50 };
    });
    await db.insert(availabilitySlots).values(slots);
  }

  console.log(`${DEMO_PSYCHOLOGISTS.length} demo psikolog eklendi.`);
}

async function seedDemoClient() {
  const email = "demo.danisan@example.com";
  const existing = await db.query.users.findFirst({
    where: (fields, { eq }) => eq(fields.email, email),
  });
  if (existing) {
    console.log("Demo danisan zaten mevcut.");
    return;
  }

  const passwordHash = await bcrypt.hash("demo12345", 10);
  await db.insert(users).values({
    email,
    passwordHash,
    role: "danisan",
    fullName: "Demo Danışan",
    phone: "5551111111",
  });
  console.log(`Demo danisan olusturuldu: ${email}`);
}

async function main() {
  await seedAdminUser();
  await seedSpecialties();
  await seedDemoPsychologists();
  await seedDemoClient();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
