import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@psikosanal/db";
import {
  availabilitySlots,
  blogPosts,
  psychTestQuestions,
  psychTests,
  psychologistProfiles,
  psychologistSpecialties,
  publicQuestions,
  specialties,
  users,
} from "@psikosanal/db/schema";

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

async function generateUniqueSlug(fullName: string) {
  const base = slugify(fullName) || "psikolog";
  let candidate = base;
  let suffix = 1;

  while (true) {
    const existing = await db.query.psychologistProfiles.findFirst({
      where: eq(psychologistProfiles.slug, candidate),
    });
    if (!existing) return candidate;
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
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

    const slug = await generateUniqueSlug(item.fullName);
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

const BLOG_POSTS = [
  {
    slug: "online-terapi-yuz-yuze-kadar-etkili-mi",
    title: "Online Terapi Yüz Yüze Terapi Kadar Etkili mi?",
    excerpt:
      "Araştırmalar online terapinin birçok durumda yüz yüze terapiyle benzer sonuçlar verdiğini gösteriyor. Peki bu neden böyle?",
    content:
      "Son yıllarda yapılan çalışmalar, video üzerinden yürütülen bireysel terapinin kaygı, depresyon ve stres gibi yaygın konularda yüz yüze terapiyle karşılaştırılabilir sonuçlar verdiğini gösteriyor.\n\nOnline terapinin en büyük avantajı erişilebilirlik: seyahat süresi olmadan, kendi güvenli alanınızdan görüşmeye katılabilirsiniz. Bu da özellikle yoğun çalışanlar, küçük şehirlerde yaşayanlar veya hareket kısıtlılığı olan kişiler için terapiye başlama eşiğini düşürüyor.\n\nElbette her yöntem gibi online terapinin de sınırları var; ağır klinik tablo veya kriz durumlarında yüz yüze değerlendirme gerekebilir. Psikoloğunuz sizinle bu konuyu ilk seansta konuşacaktır.",
    authorName: "Psikosanal Editör",
  },
  {
    slug: "ilk-seansta-nelerden-bahsedilir",
    title: "İlk Seansta Nelerden Bahsedilir?",
    excerpt:
      "İlk terapi seansı genellikle bir tanışma ve ihtiyaç değerlendirmesi seansıdır. İşte neler beklemeniz gerektiği.",
    content:
      "İlk seans, çoğu zaman terapötik sürecin en çok merak edilen ama en az bilinen kısmıdır. Bu seansta psikoloğunuz sizi tanımak, sizi terapiye getiren konuyu anlamak ve birlikte nasıl ilerleyeceğinizi netleştirmek için sorular sorar.\n\nGeçmişinizin tamamını ilk seansta anlatmanız beklenmez. Kendinizi hazır hissettiğiniz kadarını paylaşmanız yeterlidir. Psikoloğunuz süreç boyunca sınırlarınıza saygı gösterir.\n\nİlk seans aynı zamanda karşılıklı bir uyum değerlendirmesidir: hem siz psikoloğunuzla çalışmak isteyip istemediğinizi, hem de psikoloğunuz size en uygun yaklaşımı değerlendirir.",
    authorName: "Psikosanal Editör",
  },
  {
    slug: "kaygiyla-basa-cikmanin-somut-yollari",
    title: "Kaygıyla Baş Etmenin 5 Somut Yolu",
    excerpt:
      "Kaygı anında uygulayabileceğiniz, bilişsel davranışçı terapi temelli beş pratik teknik.",
    content:
      "1. Nefes çalışması: 4 saniye nefes alıp 6 saniye vererek sinir sisteminizi sakinleştirebilirsiniz.\n\n2. Düşünceyi adlandırma: 'Bu bir kaygı düşüncesi' diyerek düşünceyle aranıza mesafe koyabilirsiniz.\n\n3. 5-4-3-2-1 tekniği: Etrafınızda gördüğünüz 5, duyduğunuz 4, dokunduğunuz 3, kokladığınız 2 ve tattığınız 1 şeyi sayarak anın içine dönebilirsiniz.\n\n4. Kanıt sorgulama: Kaygı düşüncenizin gerçek bir kanıtı var mı, yoksa bir varsayım mı, kendinize sorun.\n\n5. Profesyonel destek: Kaygı günlük hayatınızı sürekli etkiliyorsa bir uzmanla çalışmak, kalıcı araçlar geliştirmenizi sağlar.",
    authorName: "Psikosanal Editör",
  },
  {
    slug: "cift-terapisi-ne-zaman-dusunulmeli",
    title: "Çift Terapisi Ne Zaman Düşünülmeli?",
    excerpt:
      "Çift terapisi yalnızca ilişki krizinde değil, iletişimi güçlendirmek isteyen çiftler için de bir seçenektir.",
    content:
      "Çift terapisi denince akla genelde 'ilişki bitmek üzere' senaryosu gelir; oysa birçok çift, iletişim kalıplarını güçlendirmek veya bir geçiş dönemini (evlilik, ebeveynlik, taşınma gibi) birlikte daha sağlıklı yönetmek için de terapiye başvurur.\n\nÇift terapisinde amaç, kimin haklı olduğunu bulmak değil; her iki tarafın da duyulduğu, ihtiyaçların netleştiği bir iletişim alanı yaratmaktır.\n\nEğer aynı tartışmayı tekrar tekrar yaşıyor, birbirinizi anlamakta zorlanıyor veya önemli bir kararı birlikte konuşamıyorsanız, bir çift terapisti bu süreci yapılandırmanıza yardımcı olabilir.",
    authorName: "Psikosanal Editör",
  },
  {
    slug: "dogru-terapisti-secmek-icin-ipuclari",
    title: "Doğru Terapisti Seçmek İçin İpuçları",
    excerpt:
      "Uzmanlık alanı, yaklaşım tarzı ve kişisel uyum — psikolog seçerken dikkat edilmesi gereken üç temel unsur.",
    content:
      "Bir psikolog seçerken ilk bakılması gereken şey, sizi terapiye getiren konuda deneyimi olup olmadığıdır. Profil sayfalarındaki uzmanlık alanları ve yaklaşım bilgileri bu konuda size fikir verir.\n\nİkinci önemli unsur terapi yaklaşımıdır: bilişsel davranışçı terapi, şema terapi, EMDR gibi farklı yöntemler farklı ihtiyaçlara hitap eder. Emin değilseniz, ücretsiz ön görüşmede bu konuyu sorabilirsiniz.\n\nSon ve belki de en önemlisi kişisel uyumdur. İlk birkaç seansta kendinizi rahat hissetmiyorsanız, başka bir psikologla devam etmek tamamen normaldir — doğru terapötik ilişki, sürecin başarısı için kritik önemdedir.",
    authorName: "Psikosanal Editör",
  },
];

async function seedBlogPosts() {
  const existing = await db.select({ id: blogPosts.id }).from(blogPosts).limit(1);
  if (existing.length > 0) {
    console.log("Blog yazilari zaten mevcut.");
    return;
  }

  await db.insert(blogPosts).values(
    BLOG_POSTS.map((post) => ({ ...post, published: true, publishedAt: new Date() }))
  );
  console.log(`${BLOG_POSTS.length} blog yazisi eklendi.`);
}

const PSYCH_TESTS = [
  {
    slug: "stres-duzeyi",
    title: "Stres Düzeyi Ön Değerlendirmesi",
    description: "Son iki haftadaki stres belirtilerinizi kısaca değerlendirin.",
    relatedSpecialtySlug: "kaygi-bozuklugu",
    resultBands: [
      { min: 0, max: 8, label: "Düşük", description: "Stres düzeyiniz şu an kontrol altında görünüyor." },
      { min: 9, max: 16, label: "Orta", description: "Belirli bir stres yükü taşıyorsunuz; küçük rutin değişiklikleri fark yaratabilir." },
      { min: 17, max: 24, label: "Yüksek", description: "Stres düzeyiniz yüksek görünüyor; bir uzmanla konuşmak size iyi gelebilir." },
    ],
    questions: [
      "Kendimi gergin veya sıkışmış hissettim.",
      "Küçük şeylere karşı sabırsızlaştım.",
      "Uyku düzenim bozuldu.",
      "Konsantre olmakta zorlandım.",
      "Bedenimde gerginlik (baş ağrısı, kas sertliği) hissettim.",
      "Günlük görevleri yetiştiremeyeceğimi düşündüm.",
      "Rahatlamak için zaman ayıramadım.",
      "Kendimi yorgun ve tükenmiş hissettim.",
    ],
  },
  {
    slug: "kaygi-duzeyi",
    title: "Kaygı Düzeyi Ön Değerlendirmesi",
    description: "Son iki haftadaki kaygı belirtilerinizi kısaca değerlendirin.",
    relatedSpecialtySlug: "kaygi-bozuklugu",
    resultBands: [
      { min: 0, max: 8, label: "Düşük", description: "Kaygı belirtileriniz şu an belirgin görünmüyor." },
      { min: 9, max: 16, label: "Orta", description: "Zaman zaman kaygı yaşıyor olabilirsiniz; takip etmekte fayda var." },
      { min: 17, max: 24, label: "Yüksek", description: "Kaygı düzeyiniz yüksek görünüyor; bir uzmanla konuşmanızı öneririz." },
    ],
    questions: [
      "Endişelerimi kontrol etmekte zorlandım.",
      "Kalbimin hızlandığını veya nefes darlığı hissettim.",
      "Bir şeylerin kötü gideceğine dair sürekli bir his taşıdım.",
      "Sakin kalmakta zorlandım.",
      "Huzursuz veya yerimde duramaz hissettim.",
      "Kaygı yüzünden bazı durumlardan kaçındım.",
      "Odaklanmakta güçlük çektim.",
      "Kolayca irkildim veya tedirgin oldum.",
    ],
  },
  {
    slug: "ruh-hali-taramasi",
    title: "Ruh Hali Ön Taraması",
    description: "Son iki haftadaki genel ruh halinizi kısaca değerlendirin.",
    relatedSpecialtySlug: "depresyon",
    resultBands: [
      { min: 0, max: 8, label: "Dengeli", description: "Genel ruh haliniz şu an dengeli görünüyor." },
      { min: 9, max: 16, label: "Dalgalı", description: "Ruh halinizde dalgalanmalar olabilir; kendinize zaman ayırmak faydalı olabilir." },
      { min: 17, max: 24, label: "Düşük", description: "Ruh haliniz düşük görünüyor; bir uzmanla konuşmak size destek olabilir." },
    ],
    questions: [
      "Eskiden keyif aldığım şeylerden keyif alamadım.",
      "Kendimi çökkün veya umutsuz hissettim.",
      "Enerjim ve motivasyonum azaldı.",
      "İştahımda belirgin bir değişiklik oldu.",
      "Kendimi değersiz hissettim.",
      "Sosyal ortamlardan uzaklaştım.",
      "Geleceğe dair umutsuzluk hissettim.",
      "Günlük işleri yapmakta zorlandım.",
    ],
  },
  {
    slug: "iliski-doyumu",
    title: "İlişki Doyumu Ön Değerlendirmesi",
    description: "Mevcut ilişkinizdeki genel doyumunuzu kısaca değerlendirin.",
    relatedSpecialtySlug: "iliski-terapisi",
    resultBands: [
      { min: 0, max: 8, label: "Zorlayıcı", description: "İlişkinizde şu an belirgin zorluklar yaşıyor olabilirsiniz." },
      { min: 9, max: 16, label: "Gelişime Açık", description: "İlişkiniz genel olarak olumlu ama geliştirilebilecek alanlar var." },
      { min: 17, max: 24, label: "Doyumlu", description: "İlişkinizden genel olarak doyum alıyor görünüyorsunuz." },
    ],
    questions: [
      "Partnerimle rahatça iletişim kurabiliyorum.",
      "Anlaşmazlıklarımızı yapıcı şekilde çözebiliyoruz.",
      "Kendimi ilişkimde güvende hissediyorum.",
      "Partnerim tarafından anlaşıldığımı hissediyorum.",
      "Ortak zaman geçirmekten keyif alıyoruz.",
      "Beklentilerimizi birbirimize açıkça ifade edebiliyoruz.",
      "İlişkimizde güven duygusu güçlü.",
      "Geleceğe dair ortak bir vizyonumuz var.",
    ],
  },
];

async function seedPsychTests() {
  const existing = await db.select({ id: psychTests.id }).from(psychTests).limit(1);
  if (existing.length > 0) {
    console.log("Psikolojik testler zaten mevcut.");
    return;
  }

  for (const test of PSYCH_TESTS) {
    const [created] = await db
      .insert(psychTests)
      .values({
        slug: test.slug,
        title: test.title,
        description: test.description,
        relatedSpecialtySlug: test.relatedSpecialtySlug,
        resultBands: test.resultBands,
      })
      .returning();

    await db.insert(psychTestQuestions).values(
      test.questions.map((text, index) => ({ testId: created.id, order: index + 1, text }))
    );
  }
  console.log(`${PSYCH_TESTS.length} psikolojik test eklendi.`);
}

async function seedPublicQuestions() {
  const existing = await db.select({ id: publicQuestions.id }).from(publicQuestions).limit(1);
  if (existing.length > 0) {
    console.log("Ornek sorular zaten mevcut.");
    return;
  }

  const psychologist = await db.query.psychologistProfiles.findFirst({
    where: eq(psychologistProfiles.approvalStatus, "onaylandi"),
  });

  await db.insert(publicQuestions).values([
    {
      questionText: "Online terapi gerçekten yüz yüze terapi kadar etkili olabilir mi?",
      isAnonymous: true,
      answerText:
        "Evet — araştırmalar kaygı ve depresyon gibi yaygın konularda video üzerinden yürütülen terapinin yüz yüze terapiyle benzer sonuçlar verdiğini gösteriyor. Önemli olan, kendinizi güvende ve rahat hissettiğiniz bir ortamdan görüşmeye katılmanız.",
      answeredByPsychologistId: psychologist?.id ?? null,
      status: "yayinda",
      answeredAt: new Date(),
    },
    {
      questionText: "Terapiye başlamadan önce nasıl hazırlanmalıyım?",
      isAnonymous: true,
      answerText:
        "Özel bir hazırlık gerekmiyor. Sizi terapiye getiren konuyu kısaca düşünmeniz yeterli; gerisini ilk seansta birlikte netleştirirsiniz. Sessiz ve kesintisiz bir ortamda olmanız görüşme kalitesini artırır.",
      answeredByPsychologistId: psychologist?.id ?? null,
      status: "yayinda",
      answeredAt: new Date(),
    },
  ]);
  console.log("Ornek sorular eklendi.");
}

async function main() {
  await seedAdminUser();
  await seedSpecialties();
  await seedDemoPsychologists();
  await seedDemoClient();
  await seedBlogPosts();
  await seedPsychTests();
  await seedPublicQuestions();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
