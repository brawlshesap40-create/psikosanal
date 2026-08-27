import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "danisan",
  "psikolog",
  "admin",
]);

export const psikologApprovalStatusEnum = pgEnum(
  "psikolog_approval_status",
  ["beklemede", "onaylandi", "reddedildi"]
);

export const slotStatusEnum = pgEnum("slot_status", [
  "musait",
  "dolu",
  "pasif",
]);

export const appointmentStatusEnum = pgEnum("appointment_status", [
  "odeme_bekleniyor",
  "onaylandi",
  "tamamlandi",
  "iptal_edildi",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "beklemede",
  "basarili",
  "basarisiz",
  "iade",
]);

export const paymentKindEnum = pgEnum("payment_kind", ["seans", "paket"]);

export const sessionTypeEnum = pgEnum("session_type", [
  "bireysel",
  "cift",
  "aile",
  "grup",
]);

export const genderEnum = pgEnum("gender", [
  "kadin",
  "erkek",
  "belirtilmemis",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "randevu_olusturuldu",
  "randevu_iptal",
  "randevu_hatirlatma",
  "yeni_mesaj",
  "yeni_yorum",
  "musaitlik_bildirimi",
]);

export const discountKindEnum = pgEnum("discount_kind", ["yuzde", "tutar"]);

export const discountAppliesToEnum = pgEnum("discount_applies_to", [
  "hepsi",
  "seans",
  "paket",
]);

export const publicQuestionStatusEnum = pgEnum("public_question_status", [
  "bekliyor",
  "yanitlandi",
  "yayinda",
]);

export const corporateLeadStatusEnum = pgEnum("corporate_lead_status", [
  "yeni",
  "iletisimde",
  "kapandi",
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull(),
  fullName: varchar("full_name", { length: 150 }).notNull(),
  phone: varchar("phone", { length: 30 }),
  isActive: boolean("is_active").notNull().default(true),
  timezone: varchar("timezone", { length: 60 }).notNull().default("Europe/Istanbul"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const refreshTokens = pgTable(
  "refresh_tokens",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 64 }).notNull().unique(),
    familyId: uuid("family_id").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    replacedByHash: varchar("replaced_by_hash", { length: 64 }),
    userAgent: varchar("user_agent", { length: 255 }),
    ip: varchar("ip", { length: 45 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("refresh_tokens_user_id_idx").on(table.userId),
    index("refresh_tokens_family_id_idx").on(table.familyId),
  ]
);

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, { fields: [refreshTokens.userId], references: [users.id] }),
}));

export const specialties = pgTable("specialties", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
});

export const psychologistProfiles = pgTable("psychologist_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  slug: varchar("slug", { length: 255 }).notNull().unique(),

  title: varchar("title", { length: 150 }).notNull(),
  bio: text("bio"),
  experienceYears: integer("experience_years"),
  sessionPriceTl: integer("session_price_tl"),
  city: varchar("city", { length: 100 }),
  onlineAvailable: boolean("online_available").notNull().default(true),
  inPersonAvailable: boolean("in_person_available").notNull().default(false),

  gender: genderEnum("gender").notNull().default("belirtilmemis"),
  languages: text("languages").array().notNull().default(["Türkçe"]),
  approaches: text("approaches").array().notNull().default([]),
  introCallEnabled: boolean("intro_call_enabled").notNull().default(false),

  photoUrl: text("photo_url"),
  licenseDocumentKey: text("license_document_key"),

  approvalStatus: psikologApprovalStatusEnum("approval_status")
    .notNull()
    .default("beklemede"),
  adminNote: text("admin_note"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const psychologistSpecialties = pgTable("psychologist_specialties", {
  id: serial("id").primaryKey(),
  psychologistId: integer("psychologist_id")
    .notNull()
    .references(() => psychologistProfiles.id, { onDelete: "cascade" }),
  specialtyId: integer("specialty_id")
    .notNull()
    .references(() => specialties.id, { onDelete: "cascade" }),
});

export const availabilitySlots = pgTable("availability_slots", {
  id: serial("id").primaryKey(),
  psychologistId: integer("psychologist_id")
    .notNull()
    .references(() => psychologistProfiles.id, { onDelete: "cascade" }),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  durationMinutes: integer("duration_minutes").notNull().default(50),
  status: slotStatusEnum("status").notNull().default("musait"),
  sessionType: sessionTypeEnum("session_type").notNull().default("bireysel"),
  isIntro: boolean("is_intro").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  slotId: integer("slot_id")
    .notNull()
    .unique()
    .references(() => availabilitySlots.id, { onDelete: "cascade" }),
  clientId: integer("client_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  psychologistId: integer("psychologist_id")
    .notNull()
    .references(() => psychologistProfiles.id, { onDelete: "cascade" }),

  status: appointmentStatusEnum("status").notNull().default("onaylandi"),
  clientNote: text("client_note"),
  cancelledBy: varchar("cancelled_by", { length: 20 }),
  cancelReason: text("cancel_reason"),
  videoRoomName: varchar("video_room_name", { length: 100 }).notNull(),
  usedPackagePurchaseId: integer("used_package_purchase_id").references(
    () => packagePurchases.id,
    { onDelete: "set null" }
  ),
  sessionType: sessionTypeEnum("session_type").notNull().default("bireysel"),
  isIntro: boolean("is_intro").notNull().default(false),
  noShowBy: varchar("no_show_by", { length: 20 }),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  appointmentId: integer("appointment_id")
    .notNull()
    .unique()
    .references(() => appointments.id, { onDelete: "cascade" }),
  clientId: integer("client_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  psychologistId: integer("psychologist_id")
    .notNull()
    .references(() => psychologistProfiles.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  isApproved: boolean("is_approved").notNull().default(false),
  moderatedAt: timestamp("moderated_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const conversations = pgTable(
  "conversations",
  {
    id: serial("id").primaryKey(),
    clientId: integer("client_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    psychologistId: integer("psychologist_id")
      .notNull()
      .references(() => psychologistProfiles.id, { onDelete: "cascade" }),
    lastMessageAt: timestamp("last_message_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [unique().on(table.clientId, table.psychologistId)]
);

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  senderId: integer("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const packages = pgTable("packages", {
  id: serial("id").primaryKey(),
  psychologistId: integer("psychologist_id")
    .notNull()
    .references(() => psychologistProfiles.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 150 }).notNull(),
  sessionCount: integer("session_count").notNull(),
  priceTl: integer("price_tl").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const packagePurchases = pgTable("package_purchases", {
  id: serial("id").primaryKey(),
  packageId: integer("package_id")
    .notNull()
    .references(() => packages.id, { onDelete: "cascade" }),
  clientId: integer("client_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  psychologistId: integer("psychologist_id")
    .notNull()
    .references(() => psychologistProfiles.id, { onDelete: "cascade" }),
  sessionsRemaining: integer("sessions_remaining").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  psychologistId: integer("psychologist_id")
    .notNull()
    .references(() => psychologistProfiles.id, { onDelete: "cascade" }),
  kind: paymentKindEnum("kind").notNull(),
  appointmentId: integer("appointment_id")
    .unique()
    .references(() => appointments.id, { onDelete: "set null" }),
  packagePurchaseId: integer("package_purchase_id")
    .unique()
    .references(() => packagePurchases.id, { onDelete: "set null" }),
  packageId: integer("package_id").references(() => packages.id, {
    onDelete: "set null",
  }),
  amountTl: integer("amount_tl").notNull(),
  status: paymentStatusEnum("status").notNull().default("beklemede"),
  iyzicoConversationId: varchar("iyzico_conversation_id", { length: 100 })
    .notNull()
    .unique(),
  iyzicoPaymentId: varchar("iyzico_payment_id", { length: 100 }),
  iyzicoToken: varchar("iyzico_token", { length: 100 }),
  failReason: text("fail_reason"),
  discountCodeId: integer("discount_code_id").references(() => discountCodes.id, {
    onDelete: "set null",
  }),
  discountAmountTl: integer("discount_amount_tl"),
  isGift: boolean("is_gift").notNull().default(false),
  giftRecipientEmail: varchar("gift_recipient_email", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const favorites = pgTable(
  "favorites",
  {
    id: serial("id").primaryKey(),
    clientId: integer("client_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    psychologistId: integer("psychologist_id")
      .notNull()
      .references(() => psychologistProfiles.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [unique().on(table.clientId, table.psychologistId)]
);

export const waitlistEntries = pgTable(
  "waitlist_entries",
  {
    id: serial("id").primaryKey(),
    clientId: integer("client_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    psychologistId: integer("psychologist_id")
      .notNull()
      .references(() => psychologistProfiles.id, { onDelete: "cascade" }),
    notifiedAt: timestamp("notified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [unique().on(table.clientId, table.psychologistId)]
);

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: notificationTypeEnum("type").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  body: text("body"),
  link: varchar("link", { length: 255 }),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 200 }).notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  coverImageUrl: text("cover_image_url"),
  authorName: varchar("author_name", { length: 150 }).notNull(),
  published: boolean("published").notNull().default(false),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const psychTests = pgTable("psych_tests", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 150 }).notNull().unique(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  resultBands: jsonb("result_bands")
    .$type<{ min: number; max: number; label: string; description: string }[]>()
    .notNull(),
  relatedSpecialtySlug: varchar("related_specialty_slug", { length: 100 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const psychTestQuestions = pgTable("psych_test_questions", {
  id: serial("id").primaryKey(),
  testId: integer("test_id")
    .notNull()
    .references(() => psychTests.id, { onDelete: "cascade" }),
  order: integer("order").notNull(),
  text: text("text").notNull(),
});

export const discountCodes = pgTable("discount_codes", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 40 }).notNull().unique(),
  kind: discountKindEnum("kind").notNull(),
  value: integer("value").notNull(),
  appliesTo: discountAppliesToEnum("applies_to").notNull().default("hepsi"),
  maxUses: integer("max_uses"),
  usedCount: integer("used_count").notNull().default(0),
  validFrom: timestamp("valid_from", { withTimezone: true }),
  validUntil: timestamp("valid_until", { withTimezone: true }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const publicQuestions = pgTable("public_questions", {
  id: serial("id").primaryKey(),
  questionText: text("question_text").notNull(),
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  askerName: varchar("asker_name", { length: 150 }),
  askerEmail: varchar("asker_email", { length: 255 }),
  answerText: text("answer_text"),
  answeredByPsychologistId: integer("answered_by_psychologist_id").references(
    () => psychologistProfiles.id,
    { onDelete: "set null" }
  ),
  status: publicQuestionStatusEnum("status").notNull().default("bekliyor"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  answeredAt: timestamp("answered_at", { withTimezone: true }),
});

export const corporateLeads = pgTable("corporate_leads", {
  id: serial("id").primaryKey(),
  companyName: varchar("company_name", { length: 200 }).notNull(),
  contactName: varchar("contact_name", { length: 150 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 30 }),
  employeeCountRange: varchar("employee_count_range", { length: 50 }),
  message: text("message"),
  status: corporateLeadStatusEnum("status").notNull().default("yeni"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const giftVouchers = pgTable("gift_vouchers", {
  id: serial("id").primaryKey(),
  packageId: integer("package_id")
    .notNull()
    .references(() => packages.id, { onDelete: "cascade" }),
  buyerId: integer("buyer_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  paymentId: integer("payment_id")
    .notNull()
    .unique()
    .references(() => payments.id, { onDelete: "cascade" }),
  recipientEmail: varchar("recipient_email", { length: 255 }).notNull(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  redeemed: boolean("redeemed").notNull().default(false),
  redeemedByClientId: integer("redeemed_by_client_id").references(() => users.id, {
    onDelete: "set null",
  }),
  redeemedAt: timestamp("redeemed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const blogPostsRelations = relations(blogPosts, () => ({}));

export const psychTestsRelations = relations(psychTests, ({ many }) => ({
  questions: many(psychTestQuestions),
}));

export const psychTestQuestionsRelations = relations(psychTestQuestions, ({ one }) => ({
  test: one(psychTests, { fields: [psychTestQuestions.testId], references: [psychTests.id] }),
}));

export const discountCodesRelations = relations(discountCodes, ({ many }) => ({
  payments: many(payments),
}));

export const publicQuestionsRelations = relations(publicQuestions, ({ one }) => ({
  answeredByPsychologist: one(psychologistProfiles, {
    fields: [publicQuestions.answeredByPsychologistId],
    references: [psychologistProfiles.id],
  }),
}));

export const giftVouchersRelations = relations(giftVouchers, ({ one }) => ({
  package: one(packages, { fields: [giftVouchers.packageId], references: [packages.id] }),
  buyer: one(users, { fields: [giftVouchers.buyerId], references: [users.id] }),
  payment: one(payments, { fields: [giftVouchers.paymentId], references: [payments.id] }),
  redeemedByClient: one(users, {
    fields: [giftVouchers.redeemedByClientId],
    references: [users.id],
  }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  client: one(users, { fields: [favorites.clientId], references: [users.id] }),
  psychologist: one(psychologistProfiles, {
    fields: [favorites.psychologistId],
    references: [psychologistProfiles.id],
  }),
}));

export const waitlistEntriesRelations = relations(
  waitlistEntries,
  ({ one }) => ({
    client: one(users, {
      fields: [waitlistEntries.clientId],
      references: [users.id],
    }),
    psychologist: one(psychologistProfiles, {
      fields: [waitlistEntries.psychologistId],
      references: [psychologistProfiles.id],
    }),
  })
);

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  psychologistProfile: one(psychologistProfiles, {
    fields: [users.id],
    references: [psychologistProfiles.userId],
  }),
  appointments: many(appointments),
  reviews: many(reviews),
  conversations: many(conversations),
  packagePurchases: many(packagePurchases),
  favorites: many(favorites),
  waitlistEntries: many(waitlistEntries),
  notifications: many(notifications),
  refreshTokens: many(refreshTokens),
}));

export const psychologistProfilesRelations = relations(
  psychologistProfiles,
  ({ one, many }) => ({
    user: one(users, {
      fields: [psychologistProfiles.userId],
      references: [users.id],
    }),
    specialties: many(psychologistSpecialties),
    availabilitySlots: many(availabilitySlots),
    appointments: many(appointments),
    reviews: many(reviews),
    conversations: many(conversations),
    packages: many(packages),
    favorites: many(favorites),
    waitlistEntries: many(waitlistEntries),
  })
);

export const specialtiesRelations = relations(specialties, ({ many }) => ({
  psychologists: many(psychologistSpecialties),
}));

export const psychologistSpecialtiesRelations = relations(
  psychologistSpecialties,
  ({ one }) => ({
    psychologist: one(psychologistProfiles, {
      fields: [psychologistSpecialties.psychologistId],
      references: [psychologistProfiles.id],
    }),
    specialty: one(specialties, {
      fields: [psychologistSpecialties.specialtyId],
      references: [specialties.id],
    }),
  })
);

export const availabilitySlotsRelations = relations(
  availabilitySlots,
  ({ one }) => ({
    psychologist: one(psychologistProfiles, {
      fields: [availabilitySlots.psychologistId],
      references: [psychologistProfiles.id],
    }),
    appointment: one(appointments, {
      fields: [availabilitySlots.id],
      references: [appointments.slotId],
    }),
  })
);

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  slot: one(availabilitySlots, {
    fields: [appointments.slotId],
    references: [availabilitySlots.id],
  }),
  client: one(users, {
    fields: [appointments.clientId],
    references: [users.id],
  }),
  psychologist: one(psychologistProfiles, {
    fields: [appointments.psychologistId],
    references: [psychologistProfiles.id],
  }),
  review: one(reviews, {
    fields: [appointments.id],
    references: [reviews.appointmentId],
  }),
  payment: one(payments, {
    fields: [appointments.id],
    references: [payments.appointmentId],
  }),
  usedPackagePurchase: one(packagePurchases, {
    fields: [appointments.usedPackagePurchaseId],
    references: [packagePurchases.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  appointment: one(appointments, {
    fields: [reviews.appointmentId],
    references: [appointments.id],
  }),
  client: one(users, {
    fields: [reviews.clientId],
    references: [users.id],
  }),
  psychologist: one(psychologistProfiles, {
    fields: [reviews.psychologistId],
    references: [psychologistProfiles.id],
  }),
}));

export const conversationsRelations = relations(
  conversations,
  ({ one, many }) => ({
    client: one(users, {
      fields: [conversations.clientId],
      references: [users.id],
    }),
    psychologist: one(psychologistProfiles, {
      fields: [conversations.psychologistId],
      references: [psychologistProfiles.id],
    }),
    messages: many(messages),
  })
);

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

export const packagesRelations = relations(packages, ({ one, many }) => ({
  psychologist: one(psychologistProfiles, {
    fields: [packages.psychologistId],
    references: [psychologistProfiles.id],
  }),
  purchases: many(packagePurchases),
}));

export const packagePurchasesRelations = relations(
  packagePurchases,
  ({ one }) => ({
    package: one(packages, {
      fields: [packagePurchases.packageId],
      references: [packages.id],
    }),
    client: one(users, {
      fields: [packagePurchases.clientId],
      references: [users.id],
    }),
    psychologist: one(psychologistProfiles, {
      fields: [packagePurchases.psychologistId],
      references: [psychologistProfiles.id],
    }),
    payment: one(payments, {
      fields: [packagePurchases.id],
      references: [payments.packagePurchaseId],
    }),
  })
);

export const paymentsRelations = relations(payments, ({ one }) => ({
  client: one(users, {
    fields: [payments.clientId],
    references: [users.id],
  }),
  psychologist: one(psychologistProfiles, {
    fields: [payments.psychologistId],
    references: [psychologistProfiles.id],
  }),
  appointment: one(appointments, {
    fields: [payments.appointmentId],
    references: [appointments.id],
  }),
  package: one(packages, {
    fields: [payments.packageId],
    references: [packages.id],
  }),
  packagePurchase: one(packagePurchases, {
    fields: [payments.packagePurchaseId],
    references: [packagePurchases.id],
  }),
  discountCode: one(discountCodes, {
    fields: [payments.discountCodeId],
    references: [discountCodes.id],
  }),
  giftVoucher: one(giftVouchers, {
    fields: [payments.id],
    references: [giftVouchers.paymentId],
  }),
}));
