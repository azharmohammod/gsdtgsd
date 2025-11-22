import { db } from "./db";
import {
  admins,
  members,
  payments,
  gifts,
  giftDeliveries,
  events,
  reviews,
  terms,
  giftImages,
  siteSettings,
  type Admin,
  type InsertAdmin,
  type Member,
  type InsertMember,
  type Payment,
  type InsertPayment,
  type Gift,
  type InsertGift,
  type GiftDelivery,
  type InsertGiftDelivery,
  type Event,
  type InsertEvent,
  type Review,
  type InsertReview,
  type Terms,
  type InsertTerms,
  type GiftImage,
  type InsertGiftImage,
  type SiteSettings,
  type InsertSiteSettings,
} from "@shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // ============ Admins ============
  getAdmin(id: string): Promise<Admin | undefined>;
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  getAllAdmins(): Promise<Admin[]>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  deleteAdmin(id: string): Promise<void>;

  // ============ Members ============
  getMember(id: string): Promise<Member | undefined>;
  getMemberByPhone(phone: string): Promise<Member | undefined>;
  createMember(member: InsertMember): Promise<Member>;
  updateMember(id: string, data: Partial<Member>): Promise<Member | undefined>;
  getAllMembers(): Promise<Member[]>;
  updateMemberPassword(id: string, password: string): Promise<void>;

  // ============ Payments ============
  getPayment(id: string): Promise<Payment | undefined>;
  getPaymentsByMember(memberId: string): Promise<Payment[]>;
  getAllPayments(): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: string, data: Partial<Payment>): Promise<Payment | undefined>;
  getPendingPayments(): Promise<Payment[]>;

  // ============ Gifts ============
  getGift(id: string): Promise<Gift | undefined>;
  getAllGifts(): Promise<Gift[]>;
  createGift(gift: InsertGift): Promise<Gift>;
  updateGift(id: string, data: Partial<Gift>): Promise<Gift | undefined>;

  // ============ Gift Deliveries ============
  getGiftDelivery(id: string): Promise<GiftDelivery | undefined>;
  getGiftDeliveriesByMember(memberId: string): Promise<GiftDelivery[]>;
  getAllGiftDeliveries(): Promise<GiftDelivery[]>;
  createGiftDelivery(delivery: InsertGiftDelivery): Promise<GiftDelivery>;
  updateGiftDelivery(id: string, data: Partial<GiftDelivery>): Promise<GiftDelivery | undefined>;
  getGiftDeliveryCountThisMonth(giftId: string): Promise<number>;

  // ============ Events ============
  getEvent(id: string): Promise<Event | undefined>;
  getAllEvents(): Promise<Event[]>;
  getActiveEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, data: Partial<Event>): Promise<Event | undefined>;
  deleteEvent(id: string): Promise<void>;

  // ============ Reviews ============
  getReview(id: string): Promise<Review | undefined>;
  getReviewsByMember(memberId: string): Promise<Review[]>;
  getAllReviews(): Promise<Review[]>;
  getApprovedReviews(): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: string, data: Partial<Review>): Promise<Review | undefined>;
  updateReviewHelpful(id: string, helpful: boolean): Promise<void>;

  // ============ Terms ============
  getLatestTerms(): Promise<Terms | undefined>;
  createOrUpdateTerms(terms: InsertTerms): Promise<Terms>;

  // ============ Gift Images ============
  getGiftImages(giftId: string): Promise<GiftImage[]>;
  getAllGiftImages(): Promise<GiftImage[]>;
  createGiftImage(image: InsertGiftImage): Promise<GiftImage>;
  deleteGiftImage(id: string): Promise<void>;
  updateGiftImageOrder(id: string, sortOrder: number): Promise<void>;

  // ============ Site Settings ============
  getSiteSettings(): Promise<SiteSettings | undefined>;
  upsertSiteSettings(settings: InsertSiteSettings): Promise<SiteSettings>;
}

export class DbStorage implements IStorage {
  // ============ Admins ============
  async getAdmin(id: string): Promise<Admin | undefined> {
    const result = await db.select().from(admins).where(eq(admins.id, id)).limit(1);
    return result[0];
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const result = await db.select().from(admins).where(eq(admins.username, username)).limit(1);
    return result[0];
  }

  async getAllAdmins(): Promise<Admin[]> {
    return await db.select().from(admins).orderBy(desc(admins.createdAt));
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const result = await db.insert(admins).values(admin).returning();
    return result[0];
  }

  async deleteAdmin(id: string): Promise<void> {
    await db.delete(admins).where(eq(admins.id, id));
  }

  // ============ Members ============
  async getMember(id: string): Promise<Member | undefined> {
    const result = await db.select().from(members).where(eq(members.id, id)).limit(1);
    return result[0];
  }

  async getMemberByPhone(phone: string): Promise<Member | undefined> {
    const result = await db.select().from(members).where(eq(members.phone, phone)).limit(1);
    return result[0];
  }

  async createMember(member: InsertMember): Promise<Member> {
    const result = await db.insert(members).values(member).returning();
    return result[0];
  }

  async updateMember(id: string, data: Partial<Member>): Promise<Member | undefined> {
    const result = await db.update(members).set(data).where(eq(members.id, id)).returning();
    return result[0];
  }

  async getAllMembers(): Promise<Member[]> {
    return await db.select().from(members).orderBy(desc(members.createdAt));
  }

  async updateMemberPassword(id: string, password: string): Promise<void> {
    await db.update(members).set({ password }).where(eq(members.id, id));
  }

  // ============ Payments ============
  async getPayment(id: string): Promise<Payment | undefined> {
    const result = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
    return result[0];
  }

  async getPaymentsByMember(memberId: string): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.memberId, memberId)).orderBy(desc(payments.createdAt));
  }

  async getAllPayments(): Promise<Payment[]> {
    return await db.select().from(payments).orderBy(desc(payments.createdAt));
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const result = await db.insert(payments).values(payment).returning();
    return result[0];
  }

  async updatePayment(id: string, data: Partial<Payment>): Promise<Payment | undefined> {
    const result = await db.update(payments).set(data).where(eq(payments.id, id)).returning();
    return result[0];
  }

  async getPendingPayments(): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.status, "pending")).orderBy(desc(payments.createdAt));
  }

  // ============ Gifts ============
  async getGift(id: string): Promise<Gift | undefined> {
    const result = await db.select().from(gifts).where(eq(gifts.id, id)).limit(1);
    return result[0];
  }

  async getAllGifts(): Promise<Gift[]> {
    return await db.select().from(gifts).where(eq(gifts.active, true));
  }

  async createGift(gift: InsertGift): Promise<Gift> {
    const result = await db.insert(gifts).values(gift).returning();
    return result[0];
  }

  async updateGift(id: string, data: Partial<Gift>): Promise<Gift | undefined> {
    const result = await db.update(gifts).set(data).where(eq(gifts.id, id)).returning();
    return result[0];
  }

  // ============ Gift Deliveries ============
  async getGiftDelivery(id: string): Promise<GiftDelivery | undefined> {
    const result = await db.select().from(giftDeliveries).where(eq(giftDeliveries.id, id)).limit(1);
    return result[0];
  }

  async getGiftDeliveriesByMember(memberId: string): Promise<GiftDelivery[]> {
    return await db.select().from(giftDeliveries).where(eq(giftDeliveries.memberId, memberId)).orderBy(desc(giftDeliveries.createdAt));
  }

  async getAllGiftDeliveries(): Promise<GiftDelivery[]> {
    return await db.select().from(giftDeliveries).orderBy(desc(giftDeliveries.createdAt));
  }

  async createGiftDelivery(delivery: InsertGiftDelivery): Promise<GiftDelivery> {
    const result = await db.insert(giftDeliveries).values(delivery).returning();
    return result[0];
  }

  async updateGiftDelivery(id: string, data: Partial<GiftDelivery>): Promise<GiftDelivery | undefined> {
    const result = await db.update(giftDeliveries).set({ ...data, updatedAt: new Date() }).where(eq(giftDeliveries.id, id)).returning();
    return result[0];
  }

  async getGiftDeliveryCountThisMonth(giftId: string): Promise<number> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    const result = await db
      .select()
      .from(giftDeliveries)
      .where(
        and(
          eq(giftDeliveries.giftId, giftId),
          sql`${giftDeliveries.createdAt} >= ${startOfMonth.toISOString()}`,
          sql`${giftDeliveries.createdAt} < ${startOfNextMonth.toISOString()}`
        )
      );
    
    return result.length;
  }

  // ============ Events ============
  async getEvent(id: string): Promise<Event | undefined> {
    const result = await db.select().from(events).where(eq(events.id, id)).limit(1);
    return result[0];
  }

  async getAllEvents(): Promise<Event[]> {
    return await db.select().from(events).orderBy(desc(events.eventDate));
  }

  async getActiveEvents(): Promise<Event[]> {
    return await db.select().from(events).where(eq(events.active, true)).orderBy(desc(events.eventDate));
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const result = await db.insert(events).values(event).returning();
    return result[0];
  }

  async updateEvent(id: string, data: Partial<Event>): Promise<Event | undefined> {
    const result = await db.update(events).set(data).where(eq(events.id, id)).returning();
    return result[0];
  }

  async deleteEvent(id: string): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  }

  // ============ Reviews ============
  async getReview(id: string): Promise<Review | undefined> {
    const result = await db.select().from(reviews).where(eq(reviews.id, id)).limit(1);
    return result[0];
  }

  async getReviewsByMember(memberId: string): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.memberId, memberId)).orderBy(desc(reviews.createdAt));
  }

  async getAllReviews(): Promise<Review[]> {
    return await db.select().from(reviews).orderBy(desc(reviews.createdAt));
  }

  async getApprovedReviews(): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.status, "approved")).orderBy(desc(reviews.createdAt));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const result = await db.insert(reviews).values(review).returning();
    return result[0];
  }

  async updateReview(id: string, data: Partial<Review>): Promise<Review | undefined> {
    const result = await db.update(reviews).set(data).where(eq(reviews.id, id)).returning();
    return result[0];
  }

  async updateReviewHelpful(id: string, helpful: boolean): Promise<void> {
    const review = await this.getReview(id);
    if (review) {
      if (helpful) {
        await db.update(reviews).set({ helpful: review.helpful + 1 }).where(eq(reviews.id, id));
      } else {
        await db.update(reviews).set({ notHelpful: review.notHelpful + 1 }).where(eq(reviews.id, id));
      }
    }
  }

  // ============ Terms ============
  async getLatestTerms(): Promise<Terms | undefined> {
    const result = await db.select().from(terms).orderBy(desc(terms.updatedAt)).limit(1);
    return result[0];
  }

  async createOrUpdateTerms(termsData: InsertTerms): Promise<Terms> {
    // Delete old terms and insert new
    await db.delete(terms);
    const result = await db.insert(terms).values(termsData).returning();
    return result[0];
  }

  // ============ Gift Images ============
  async getGiftImages(giftId: string): Promise<GiftImage[]> {
    return await db
      .select()
      .from(giftImages)
      .where(eq(giftImages.giftId, giftId))
      .orderBy(giftImages.sortOrder, desc(giftImages.createdAt));
  }

  async getAllGiftImages(): Promise<GiftImage[]> {
    return await db
      .select()
      .from(giftImages)
      .orderBy(giftImages.sortOrder, desc(giftImages.createdAt));
  }

  async createGiftImage(image: InsertGiftImage): Promise<GiftImage> {
    const result = await db.insert(giftImages).values(image).returning();
    return result[0];
  }

  async deleteGiftImage(id: string): Promise<void> {
    await db.delete(giftImages).where(eq(giftImages.id, id));
  }

  async updateGiftImageOrder(id: string, sortOrder: number): Promise<void> {
    await db.update(giftImages).set({ sortOrder }).where(eq(giftImages.id, id));
  }

  // ============ Site Settings ============
  async getSiteSettings(): Promise<SiteSettings | undefined> {
    const result = await db.select().from(siteSettings).limit(1);
    return result[0];
  }

  async upsertSiteSettings(settingsData: Partial<InsertSiteSettings>): Promise<SiteSettings> {
    // Get existing settings
    const existing = await this.getSiteSettings();
    
    // Merge with existing data to preserve fields not being updated
    const mergedData: InsertSiteSettings = {
      membershipPrice: settingsData.membershipPrice ?? existing?.membershipPrice ?? 0,
      qrCodePath: settingsData.qrCodePath ?? existing?.qrCodePath ?? undefined,
      bankName: settingsData.bankName ?? existing?.bankName ?? undefined,
      bankAccount: settingsData.bankAccount ?? existing?.bankAccount ?? undefined,
      bankAccountName: settingsData.bankAccountName ?? existing?.bankAccountName ?? undefined,
      lineUrl: settingsData.lineUrl ?? existing?.lineUrl ?? undefined,
      updatedBy: settingsData.updatedBy ?? existing?.updatedBy ?? '',
    };
    
    // Delete old settings and insert merged data (singleton pattern)
    await db.delete(siteSettings);
    const result = await db.insert(siteSettings).values(mergedData).returning();
    return result[0];
  }
}

export const storage = new DbStorage();
