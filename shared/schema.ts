import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Admin users table (for admin login)
export const admins = pgTable("admins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Members table (users who register)
export const members = pgTable("members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phone: text("phone").notNull().unique(), // Use phone as unique identifier for login
  password: text("password").notNull(),
  prefix: text("prefix").notNull(), // นาย, นาง, นางสาว
  name: text("name").notNull(),
  status: text("status").notNull().default("pending_payment"), // pending_payment, pending_approval, approved, disapproved
  membershipStart: timestamp("membership_start"),
  membershipEnd: timestamp("membership_end"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Payments table
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  memberId: varchar("member_id").notNull().references(() => members.id),
  amount: integer("amount").notNull(), // in baht
  slipUrl: text("slip_url"), // URL to uploaded payment slip
  status: text("status").notNull().default("pending"), // pending, verified, rejected
  createdAt: timestamp("created_at").notNull().defaultNow(),
  verifiedAt: timestamp("verified_at"),
  verifiedBy: varchar("verified_by").references(() => admins.id),
});

// Gift items (the 3 available gifts)
export const gifts = pgTable("gifts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  details: text("details").notNull(),
  imageUrl: text("image_url").notNull(),
  active: boolean("active").notNull().default(true),
  monthlyQuota: integer("monthly_quota"), // null means unlimited
});

// Gift images (multiple images per gift)
export const giftImages = pgTable("gift_images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  giftId: varchar("gift_id").notNull().references(() => gifts.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Site settings (singleton table for website configuration)
export const siteSettings = pgTable("site_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  membershipPrice: integer("membership_price").notNull().default(499),
  bankName: text("bank_name").notNull().default(""),
  bankAccount: text("bank_account").notNull().default(""),
  bankAccountName: text("bank_account_name").notNull().default(""),
  lineUrl: text("line_url").notNull().default(""),
  qrCodePath: text("qr_code_path"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  updatedBy: varchar("updated_by").references(() => admins.id),
});

// Gift deliveries (when users select gifts)
export const giftDeliveries = pgTable("gift_deliveries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  memberId: varchar("member_id").notNull().references(() => members.id),
  giftId: varchar("gift_id").notNull().references(() => gifts.id),
  deliveryName: text("delivery_name").notNull(),
  deliveryPhone: text("delivery_phone").notNull(),
  houseNumber: text("house_number").notNull(),
  mooSoi: text("moo_soi"),
  street: text("street"),
  subdistrict: text("subdistrict").notNull(),
  district: text("district").notNull(),
  province: text("province").notNull(),
  postalCode: text("postal_code").notNull(),
  deliveryDate: timestamp("delivery_date").notNull(),
  status: text("status").notNull().default("pending"), // pending, sent
  trackingNumber: text("tracking_number"),
  trackingUrl: text("tracking_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Live events (Zoom/Vimeo sessions)
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  eventDate: timestamp("event_date", { mode: "string" }).notNull(), // Store as string to avoid timezone conversion
  platform: text("platform").notNull(), // zoom, vimeo
  eventUrl: text("event_url").notNull(), // Join URL
  replayUrl: text("replay_url"), // Recording URL for past events
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Reviews
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  memberId: varchar("member_id").notNull().references(() => members.id),
  rating: integer("rating").notNull(), // 1-5
  title: text("title").notNull(),
  content: text("content").notNull(),
  pros: text("pros"),
  cons: text("cons"),
  images: text("images").array(), // Array of image URLs
  videos: text("videos").array(), // Array of video URLs
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  helpful: integer("helpful").notNull().default(0),
  notHelpful: integer("not_helpful").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  approvedAt: timestamp("approved_at"),
});

// Terms and conditions
export const terms = pgTable("terms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  showOnRegistration: boolean("show_on_registration").notNull().default(true),
  showOnPayment: boolean("show_on_payment").notNull().default(true),
  requireRead: boolean("require_read").notNull().default(false),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  updatedBy: varchar("updated_by").references(() => admins.id),
});

// ============ Insert Schemas ============

export const insertAdminSchema = createInsertSchema(admins).omit({
  id: true,
  createdAt: true,
});

export const insertMemberSchema = createInsertSchema(members).omit({
  id: true,
  status: true,
  membershipStart: true,
  membershipEnd: true,
  createdAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  status: true,
  createdAt: true,
  verifiedAt: true,
  verifiedBy: true,
});

export const insertGiftSchema = createInsertSchema(gifts).omit({
  id: true,
});

export const insertGiftDeliverySchema = createInsertSchema(giftDeliveries).omit({
  id: true,
  status: true,
  trackingNumber: true,
  trackingUrl: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  deliveryDate: z.coerce.date(),
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  status: true,
  helpful: true,
  notHelpful: true,
  createdAt: true,
  approvedAt: true,
});

export const insertTermsSchema = createInsertSchema(terms).omit({
  id: true,
  updatedAt: true,
});

export const insertGiftImageSchema = createInsertSchema(giftImages).omit({
  id: true,
  createdAt: true,
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettings).omit({
  id: true,
  updatedAt: true,
});

// ============ Types ============

export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;

export type Member = typeof members.$inferSelect;
export type InsertMember = z.infer<typeof insertMemberSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type Gift = typeof gifts.$inferSelect;
export type InsertGift = z.infer<typeof insertGiftSchema>;

export type GiftDelivery = typeof giftDeliveries.$inferSelect;
export type InsertGiftDelivery = z.infer<typeof insertGiftDeliverySchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type Terms = typeof terms.$inferSelect;
export type InsertTerms = z.infer<typeof insertTermsSchema>;

export type GiftImage = typeof giftImages.$inferSelect;
export type InsertGiftImage = z.infer<typeof insertGiftImageSchema>;

export type SiteSettings = typeof siteSettings.$inferSelect;
export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
