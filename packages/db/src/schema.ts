import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
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
}));
