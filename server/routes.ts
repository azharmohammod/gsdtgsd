import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcrypt";
import multer from "multer";
import fs from "fs/promises";
import path from "path";
import { storage } from "./storage";
import { requireMemberAuth, requireAdminAuth } from "./middleware/auth";
import { z } from "zod";
import { insertMemberSchema, insertPaymentSchema, insertAdminSchema, insertGiftDeliverySchema, insertReviewSchema, insertEventSchema, insertTermsSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // ============ File Upload Configuration ============
  
  // Configure multer
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (_req, file, cb) => {
      const allowed = ['image/jpeg', 'image/png', 'image/webp'];
      if (allowed.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type'));
      }
    }
  });

  // Payment slip upload endpoint
  app.post('/api/upload/payment-slip', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const privateDir = process.env.PRIVATE_OBJECT_DIR;
      if (!privateDir) {
        return res.status(500).json({ message: 'Object storage not configured' });
      }

      // Ensure directory exists
      await fs.mkdir(privateDir, { recursive: true });

      // Create unique filename
      const timestamp = Date.now();
      const filename = `payment_slip_${timestamp}_${req.file.originalname}`;
      const filepath = path.join(privateDir, filename);

      // Write file to object storage
      await fs.writeFile(filepath, req.file.buffer);

      // Return just the filename (we'll serve it via API endpoint)
      res.json({ url: filename });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: 'Upload failed' });
    }
  });

  // QR code upload endpoint (admin only)
  app.post('/api/upload/qr-code', requireAdminAuth, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const privateDir = process.env.PRIVATE_OBJECT_DIR;
      if (!privateDir) {
        return res.status(500).json({ message: 'Object storage not configured' });
      }

      await fs.mkdir(privateDir, { recursive: true });

      const timestamp = Date.now();
      const filename = `qr_code_${timestamp}_${req.file.originalname}`;
      const filepath = path.join(privateDir, filename);

      await fs.writeFile(filepath, req.file.buffer);

      res.json({ url: filename });
    } catch (error) {
      console.error('QR code upload error:', error);
      res.status(500).json({ message: 'Upload failed' });
    }
  });

  // Gift image upload endpoint (admin only)
  app.post('/api/upload/gift-image', requireAdminAuth, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const privateDir = process.env.PRIVATE_OBJECT_DIR;
      if (!privateDir) {
        return res.status(500).json({ message: 'Object storage not configured' });
      }

      await fs.mkdir(privateDir, { recursive: true });

      const timestamp = Date.now();
      const filename = `gift_${timestamp}_${req.file.originalname}`;
      const filepath = path.join(privateDir, filename);

      await fs.writeFile(filepath, req.file.buffer);

      res.json({ url: filename });
    } catch (error) {
      console.error('Gift image upload error:', error);
      res.status(500).json({ message: 'Upload failed' });
    }
  });

  // Serve payment slip images (admin only)
  app.get('/api/payment-slips/:filename', requireAdminAuth, async (req, res) => {
    try {
      const privateDir = process.env.PRIVATE_OBJECT_DIR || './uploads/private';
      const filepath = path.join(privateDir, req.params.filename);

      // Check if file exists
      try {
        await fs.access(filepath);
      } catch {
        return res.status(404).json({ message: 'File not found' });
      }

      // Set proper content type
      const ext = path.extname(req.params.filename).toLowerCase();
      const contentType = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
      }[ext] || 'image/jpeg';

      res.setHeader('Content-Type', contentType);
      const fileBuffer = await fs.readFile(filepath);
      res.send(fileBuffer);
    } catch (error) {
      console.error('Error serving payment slip:', error);
      res.status(500).json({ message: 'Failed to load image' });
    }
  });

  // Serve uploaded files (QR codes, gift images) - admin only for now
  app.get('/api/uploads/:filename', async (req, res) => {
    try {
      const privateDir = process.env.PRIVATE_OBJECT_DIR || './uploads/private';
      const filepath = path.join(privateDir, req.params.filename);

      try {
        await fs.access(filepath);
      } catch {
        return res.status(404).json({ message: 'File not found' });
      }

      const ext = path.extname(req.params.filename).toLowerCase();
      const contentType = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
      }[ext] || 'image/jpeg';

      res.setHeader('Content-Type', contentType);
      const fileBuffer = await fs.readFile(filepath);
      res.send(fileBuffer);
    } catch (error) {
      console.error('Error serving file:', error);
      res.status(500).json({ message: 'Failed to load image' });
    }
  });
  
  // ============ Auth Routes ============
  
  // Member Registration
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertMemberSchema.parse(req.body);
      
      // Check if phone already exists
      const existingMember = await storage.getMemberByPhone(validatedData.phone);
      if (existingMember) {
        return res.status(400).json({ message: "Phone number already registered" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      // Create member with pending_payment status
      const member = await storage.createMember({
        ...validatedData,
        password: hashedPassword,
      });
      
      // Auto-login: Create session
      req.session.memberId = member.id;
      
      // Remove password from response
      const { password: _, ...memberWithoutPassword } = member;
      
      res.status(201).json(memberWithoutPassword);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Registration failed" });
    }
  });
  
  // Member Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { phone, password } = req.body;
      
      if (!phone || !password) {
        return res.status(400).json({ message: "Phone and password are required" });
      }
      
      const member = await storage.getMemberByPhone(phone);
      
      if (!member) {
        return res.status(401).json({ message: "Invalid phone or password" });
      }
      
      const isValidPassword = await bcrypt.compare(password, member.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid phone or password" });
      }
      
      // Set session
      req.session.memberId = member.id;
      
      // Remove password from response
      const { password: _, ...memberWithoutPassword } = member;
      
      res.json(memberWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });
  
  // Admin Login
  app.post("/api/admin/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const admin = await storage.getAdminByUsername(username);
      
      if (!admin) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      const isValidPassword = await bcrypt.compare(password, admin.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Set session
      req.session.adminId = admin.id;
      
      // Remove password from response
      const { password: _, ...adminWithoutPassword } = admin;
      
      res.json(adminWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });
  
  // Logout (both member and admin)
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
  
  // Get current logged-in member
  app.get("/api/auth/me", requireMemberAuth, async (req, res) => {
    try {
      const member = await storage.getMember(req.session.memberId!);
      
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }
      
      const { password: _, ...memberWithoutPassword } = member;
      
      res.json(memberWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to get member data" });
    }
  });
  
  // Get current logged-in admin
  app.get("/api/admin/auth/me", requireAdminAuth, async (req, res) => {
    try {
      const admin = await storage.getAdmin(req.session.adminId!);
      
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }
      
      const { password: _, ...adminWithoutPassword } = admin;
      
      res.json(adminWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to get admin data" });
    }
  });
  
  // ============ Member Routes (Protected) ============
  
  // Get member profile
  app.get("/api/member/profile", requireMemberAuth, async (req, res) => {
    try {
      const member = await storage.getMember(req.session.memberId!);
      
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }
      
      const { password: _, ...memberWithoutPassword } = member;
      
      res.json(memberWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to get profile" });
    }
  });
  
  // Update member profile
  app.put("/api/member/profile", requireMemberAuth, async (req, res) => {
    try {
      const { name, phone, prefix } = req.body;
      
      const updatedMember = await storage.updateMember(req.session.memberId!, {
        name,
        phone,
        prefix,
      });
      
      if (!updatedMember) {
        return res.status(404).json({ message: "Member not found" });
      }
      
      const { password: _, ...memberWithoutPassword } = updatedMember;
      
      res.json(memberWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });
  
  // Get available gifts with quota information
  app.get("/api/member/gifts", requireMemberAuth, async (req, res) => {
    try {
      const gifts = await storage.getAllGifts();
      const allImages = await storage.getAllGiftImages();
      
      // Group images by giftId for efficient lookup
      const imagesByGiftId = allImages.reduce((acc, image) => {
        if (!acc[image.giftId]) {
          acc[image.giftId] = [];
        }
        acc[image.giftId].push(image);
        return acc;
      }, {} as Record<string, typeof allImages>);
      
      // Calculate remaining quota for each gift
      const giftsWithQuota = await Promise.all(
        gifts.map(async (gift) => {
          const usedThisMonth = await storage.getGiftDeliveryCountThisMonth(gift.id);
          const remainingQuota = gift.monthlyQuota !== null && gift.monthlyQuota !== undefined
            ? Math.max(0, gift.monthlyQuota - usedThisMonth)
            : null; // null means unlimited
          
          return {
            ...gift,
            usedThisMonth,
            remainingQuota,
            images: imagesByGiftId[gift.id] || [],
          };
        })
      );
      
      res.json(giftsWithQuota);
    } catch (error) {
      res.status(500).json({ message: "Failed to get gifts" });
    }
  });
  
  // Request gift delivery
  app.post("/api/member/gift-delivery", requireMemberAuth, async (req, res) => {
    try {
      const validatedData = insertGiftDeliverySchema.parse({
        ...req.body,
        memberId: req.session.memberId,
      });
      
      // Check if member is approved
      const member = await storage.getMember(req.session.memberId!);
      if (!member || member.status !== 'approved') {
        return res.status(403).json({ message: "Only approved members can request gift delivery" });
      }
      
      const delivery = await storage.createGiftDelivery(validatedData);
      res.status(201).json(delivery);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create gift delivery" });
    }
  });
  
  // Get member's gift deliveries
  app.get("/api/member/gift-delivery", requireMemberAuth, async (req, res) => {
    try {
      const deliveries = await storage.getGiftDeliveriesByMember(req.session.memberId!);
      res.json(deliveries);
    } catch (error) {
      res.status(500).json({ message: "Failed to get gift deliveries" });
    }
  });
  
  // Get active events
  app.get("/api/member/events", requireMemberAuth, async (req, res) => {
    try {
      const events = await storage.getActiveEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to get events" });
    }
  });
  
  // Submit review
  app.post("/api/member/reviews", requireMemberAuth, async (req, res) => {
    try {
      const validatedData = insertReviewSchema.parse({
        ...req.body,
        memberId: req.session.memberId,
      });
      
      // Check if member is approved
      const member = await storage.getMember(req.session.memberId!);
      if (!member || member.status !== 'approved') {
        return res.status(403).json({ message: "Only approved members can submit reviews" });
      }
      
      const review = await storage.createReview(validatedData);
      res.status(201).json(review);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to submit review" });
    }
  });
  
  // Get approved reviews
  app.get("/api/member/reviews", requireMemberAuth, async (req, res) => {
    try {
      const reviews = await storage.getApprovedReviews();
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to get reviews" });
    }
  });
  
  // Mark review helpful/not helpful
  app.post("/api/member/review/:id/helpful", requireMemberAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { helpful } = req.body;
      
      if (typeof helpful !== 'boolean') {
        return res.status(400).json({ message: "helpful must be a boolean" });
      }
      
      await storage.updateReviewHelpful(id, helpful);
      res.json({ message: "Review updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update review" });
    }
  });
  
  // ============ Payment Routes ============
  
  // Create payment record
  app.post("/api/payment/create", requireMemberAuth, async (req, res) => {
    try {
      const validatedData = insertPaymentSchema.parse({
        ...req.body,
        memberId: req.session.memberId,
      });
      
      const payment = await storage.createPayment(validatedData);
      
      // Only update status to pending_approval if member is currently pending_payment
      // This prevents approved members from regressing when uploading renewal payments
      const member = await storage.getMember(req.session.memberId!);
      if (member && member.status === 'pending_payment') {
        await storage.updateMember(req.session.memberId!, {
          status: 'pending_approval',
        });
      }
      
      res.status(201).json(payment);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create payment" });
    }
  });
  
  // Get member's payments
  app.get("/api/payment/my-payments", requireMemberAuth, async (req, res) => {
    try {
      const payments = await storage.getPaymentsByMember(req.session.memberId!);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to get payments" });
    }
  });

  // Get public site settings (Line URL only, no auth required for members to contact support)
  app.get("/api/site-settings", async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      if (settings) {
        res.json({ lineUrl: settings.lineUrl });
      } else {
        res.json({ lineUrl: null });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to get site settings" });
    }
  });
  
  // ============ Admin Routes (All Protected) ============
  
  // Dashboard statistics
  app.get("/api/admin/dashboard/stats", requireAdminAuth, async (req, res) => {
    try {
      const allMembers = await storage.getAllMembers();
      const allPayments = await storage.getAllPayments();
      const allEvents = await storage.getAllEvents();
      const allReviews = await storage.getAllReviews();
      const allGiftDeliveries = await storage.getAllGiftDeliveries();
      
      // Calculate stats
      const totalUsers = allMembers.length;
      const activeMembers = allMembers.filter(m => m.status === 'approved').length;
      const pendingApprovals = allMembers.filter(m => m.status === 'pending_approval').length;
      
      // Members expiring in next 7 days
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      const expiringSoon = allMembers.filter(m => 
        m.membershipEnd && 
        new Date(m.membershipEnd) <= sevenDaysFromNow && 
        new Date(m.membershipEnd) >= new Date()
      ).length;
      
      // Upcoming events (future events)
      const now = new Date();
      const upcomingEvents = allEvents.filter(e => new Date(e.eventDate) >= now).length;
      
      // Reviews stats
      const totalReviews = allReviews.length;
      const approvedReviews = allReviews.filter(r => r.status === 'approved');
      const averageRating = approvedReviews.length > 0
        ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length
        : 0;
      
      // Gifts delivered
      const giftsDelivered = allGiftDeliveries.filter(d => d.status === 'sent').length;
      
      // Payment statistics
      const totalPayments = allPayments.length;
      const verifiedPayments = allPayments.filter(p => p.status === 'verified').length;
      const pendingPayments = allPayments.filter(p => p.status === 'pending').length;
      
      res.json({
        totalUsers,
        activeMembers,
        pendingApprovals,
        expiringSoon,
        upcomingEvents,
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        giftsDelivered,
        totalPayments,
        verifiedPayments,
        pendingPayments,
      });
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({ message: "Failed to get dashboard stats" });
    }
  });

  // Location statistics from gift deliveries
  app.get("/api/admin/location-stats", requireAdminAuth, async (req, res) => {
    try {
      const allDeliveries = await storage.getAllGiftDeliveries();
      
      // Aggregate by province
      const provinceMap = new Map<string, number>();
      const districtMap = new Map<string, { district: string; province: string; count: number }>();
      const subdistrictMap = new Map<string, { subdistrict: string; district: string; province: string; count: number }>();
      
      for (const delivery of allDeliveries) {
        // Count by province
        const provinceCount = provinceMap.get(delivery.province) || 0;
        provinceMap.set(delivery.province, provinceCount + 1);
        
        // Count by district with province
        const districtKey = `${delivery.district}|${delivery.province}`;
        const districtCount = districtMap.get(districtKey);
        if (districtCount) {
          districtCount.count++;
        } else {
          districtMap.set(districtKey, { district: delivery.district, province: delivery.province, count: 1 });
        }
        
        // Count by subdistrict with district and province
        const subdistrictKey = `${delivery.subdistrict}|${delivery.district}|${delivery.province}`;
        const subdistrictCount = subdistrictMap.get(subdistrictKey);
        if (subdistrictCount) {
          subdistrictCount.count++;
        } else {
          subdistrictMap.set(subdistrictKey, { 
            subdistrict: delivery.subdistrict, 
            district: delivery.district, 
            province: delivery.province, 
            count: 1 
          });
        }
      }
      
      // Convert maps to arrays and sort by count (descending)
      const provinces = Array.from(provinceMap.entries())
        .map(([province, count]) => ({ province, count }))
        .sort((a, b) => b.count - a.count);
      
      const districts = Array.from(districtMap.values())
        .sort((a, b) => b.count - a.count);
      
      const subdistricts = Array.from(subdistrictMap.values())
        .sort((a, b) => b.count - a.count);
      
      res.json({
        total: allDeliveries.length,
        provinces,
        districts,
        subdistricts,
      });
    } catch (error) {
      console.error("Location stats error:", error);
      res.status(500).json({ message: "Failed to get location stats" });
    }
  });
  
  // Get all admins
  app.get("/api/admin/admins", requireAdminAuth, async (req, res) => {
    try {
      const admins = await storage.getAllAdmins();
      // Remove passwords from response
      const adminsWithoutPassword = admins.map(({ password: _, ...admin }) => admin);
      res.json(adminsWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to get admins" });
    }
  });
  
  // Create new admin
  app.post("/api/admin/admins", requireAdminAuth, async (req, res) => {
    try {
      // Validate input using Zod schema
      const adminSchema = insertAdminSchema.extend({
        password: z.string().min(8, "Password must be at least 8 characters"),
      });
      
      const validatedData = adminSchema.parse(req.body);
      
      // Check if username already exists
      const existingAdmin = await storage.getAdminByUsername(validatedData.username);
      if (existingAdmin) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      // Create admin
      const newAdmin = await storage.createAdmin({
        username: validatedData.username,
        password: hashedPassword,
      });
      
      // Remove password from response
      const { password: _, ...adminWithoutPassword } = newAdmin;
      
      res.status(201).json(adminWithoutPassword);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create admin" });
    }
  });
  
  // Delete admin
  app.delete("/api/admin/admins/:id", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Prevent deleting yourself
      if (id === req.session.adminId) {
        return res.status(400).json({ message: "Cannot delete your own admin account" });
      }
      
      const admin = await storage.getAdmin(id);
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }
      
      await storage.deleteAdmin(id);
      
      res.json({ message: "Admin deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete admin" });
    }
  });
  
  // Get all members
  app.get("/api/admin/members", requireAdminAuth, async (req, res) => {
    try {
      const members = await storage.getAllMembers();
      // Remove passwords from response
      const membersWithoutPassword = members.map(({ password: _, ...member }) => member);
      res.json(membersWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to get members" });
    }
  });
  
  // Get member by ID
  app.get("/api/admin/members/:id", requireAdminAuth, async (req, res) => {
    try {
      const member = await storage.getMember(req.params.id);
      
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }
      
      const { password: _, ...memberWithoutPassword } = member;
      res.json(memberWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to get member" });
    }
  });
  
  // Update member
  app.put("/api/admin/members/:id", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Convert timestamp strings to Date objects
      const processedData: any = { ...updateData };
      if (processedData.membershipStart && typeof processedData.membershipStart === 'string') {
        processedData.membershipStart = new Date(processedData.membershipStart);
      }
      if (processedData.membershipEnd && typeof processedData.membershipEnd === 'string') {
        processedData.membershipEnd = new Date(processedData.membershipEnd);
      }
      if (processedData.createdAt && typeof processedData.createdAt === 'string') {
        processedData.createdAt = new Date(processedData.createdAt);
      }
      
      // Remove fields that shouldn't be updated via this endpoint
      delete processedData.id;
      delete processedData.password;
      
      const updatedMember = await storage.updateMember(id, processedData);
      
      if (!updatedMember) {
        return res.status(404).json({ message: "Member not found" });
      }
      
      const { password: _, ...memberWithoutPassword } = updatedMember;
      res.json(memberWithoutPassword);
    } catch (error) {
      console.error("Error updating member:", error);
      res.status(500).json({ message: "Failed to update member", error: String(error) });
    }
  });
  
  // Reset member password
  app.post("/api/admin/members/:id/reset-password", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Generate random password
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      
      await storage.updateMemberPassword(id, hashedPassword);
      
      res.json({ 
        message: "Password reset successfully",
        newPassword: randomPassword 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to reset password" });
    }
  });
  
  // Get all payments
  app.get("/api/admin/payments", requireAdminAuth, async (req, res) => {
    try {
      const payments = await storage.getPendingPayments();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to get payments" });
    }
  });
  
  // Verify payment
  app.put("/api/admin/payments/:id/verify", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status || (status !== 'verified' && status !== 'rejected')) {
        return res.status(400).json({ message: "Status must be 'verified' or 'rejected'" });
      }
      
      const payment = await storage.getPayment(id);
      
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      
      // Prevent re-processing of already verified/rejected payments
      if (payment.status !== 'pending') {
        return res.status(400).json({ 
          message: "Payment has already been processed",
          currentStatus: payment.status 
        });
      }
      
      // Update payment status
      const updatedPayment = await storage.updatePayment(id, {
        status,
        verifiedAt: new Date(),
        verifiedBy: req.session.adminId,
      });
      
      // If verified, update member status and membership dates
      if (status === 'verified') {
        const now = new Date();
        const membershipEnd = new Date();
        membershipEnd.setDate(membershipEnd.getDate() + 30);
        
        await storage.updateMember(payment.memberId, {
          status: 'approved',
          membershipStart: now,
          membershipEnd: membershipEnd,
        });
      }
      
      res.json(updatedPayment);
    } catch (error) {
      res.status(500).json({ message: "Failed to verify payment" });
    }
  });
  
  // Get all gifts catalog (for admin management) with remaining quota and images
  app.get("/api/admin/gifts-catalog", requireAdminAuth, async (req, res) => {
    try {
      const gifts = await storage.getAllGifts();
      const allImages = await storage.getAllGiftImages();
      
      // Group images by giftId for efficient lookup
      const imagesByGiftId = allImages.reduce((acc, image) => {
        if (!acc[image.giftId]) {
          acc[image.giftId] = [];
        }
        acc[image.giftId].push(image);
        return acc;
      }, {} as Record<string, typeof allImages>);
      
      // Calculate remaining quota for each gift
      const giftsWithQuota = await Promise.all(
        gifts.map(async (gift) => {
          const usedThisMonth = await storage.getGiftDeliveryCountThisMonth(gift.id);
          const remainingQuota = gift.monthlyQuota !== null && gift.monthlyQuota !== undefined
            ? Math.max(0, gift.monthlyQuota - usedThisMonth)
            : null; // null means unlimited
          
          return {
            ...gift,
            usedThisMonth,
            remainingQuota,
            images: imagesByGiftId[gift.id] || [],
          };
        })
      );
      
      res.json(giftsWithQuota);
    } catch (error) {
      res.status(500).json({ message: "Failed to get gifts" });
    }
  });

  // Update gift
  app.put("/api/admin/gifts/:id", requireAdminAuth, async (req, res) => {
    try {
      const gift = await storage.updateGift(req.params.id, req.body);
      res.json(gift);
    } catch (error) {
      res.status(500).json({ message: "Failed to update gift" });
    }
  });

  // Create gift image
  app.post("/api/admin/gift-images", requireAdminAuth, async (req, res) => {
    try {
      const { insertGiftImageSchema } = await import("@shared/schema");
      const validatedData = insertGiftImageSchema.parse(req.body);
      const image = await storage.createGiftImage(validatedData);
      res.json(image);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create gift image" });
    }
  });

  // Delete gift image
  app.delete("/api/admin/gift-images/:id", requireAdminAuth, async (req, res) => {
    try {
      await storage.deleteGiftImage(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete gift image" });
    }
  });

  // Get all gift deliveries
  app.get("/api/admin/gift-deliveries", requireAdminAuth, async (req, res) => {
    try {
      const deliveries = await storage.getAllGiftDeliveries();
      res.json(deliveries);
    } catch (error) {
      res.status(500).json({ message: "Failed to get gift deliveries" });
    }
  });
  
  // Update gift delivery
  app.put("/api/admin/gift-deliveries/:id", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { trackingNumber, trackingUrl, status } = req.body;
      
      const updatedDelivery = await storage.updateGiftDelivery(id, {
        trackingNumber,
        trackingUrl,
        status,
      });
      
      if (!updatedDelivery) {
        return res.status(404).json({ message: "Gift delivery not found" });
      }
      
      res.json(updatedDelivery);
    } catch (error) {
      res.status(500).json({ message: "Failed to update gift delivery" });
    }
  });
  
  // Get all events
  app.get("/api/admin/events", requireAdminAuth, async (req, res) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to get events" });
    }
  });
  
  // Create event
  app.post("/api/admin/events", requireAdminAuth, async (req, res) => {
    try {
      const validatedData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(validatedData);
      res.status(201).json(event);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create event" });
    }
  });
  
  // Update event
  app.put("/api/admin/events/:id", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const updatedEvent = await storage.updateEvent(id, req.body);
      
      if (!updatedEvent) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(updatedEvent);
    } catch (error) {
      res.status(500).json({ message: "Failed to update event" });
    }
  });
  
  // Delete event
  app.delete("/api/admin/events/:id", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteEvent(id);
      res.json({ message: "Event deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete event" });
    }
  });
  
  // Get all reviews
  app.get("/api/admin/reviews", requireAdminAuth, async (req, res) => {
    try {
      const reviews = await storage.getAllReviews();
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to get reviews" });
    }
  });
  
  // Update review (approve/reject)
  app.put("/api/admin/reviews/:id", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status || (status !== 'approved' && status !== 'rejected')) {
        return res.status(400).json({ message: "Status must be 'approved' or 'rejected'" });
      }
      
      const updatedReview = await storage.updateReview(id, {
        status,
        approvedAt: status === 'approved' ? new Date() : undefined,
      });
      
      if (!updatedReview) {
        return res.status(404).json({ message: "Review not found" });
      }
      
      res.json(updatedReview);
    } catch (error) {
      res.status(500).json({ message: "Failed to update review" });
    }
  });
  
  // Get terms
  app.get("/api/admin/terms", requireAdminAuth, async (req, res) => {
    try {
      const terms = await storage.getLatestTerms();
      res.json(terms || null);
    } catch (error) {
      res.status(500).json({ message: "Failed to get terms" });
    }
  });
  
  // Update terms
  app.put("/api/admin/terms", requireAdminAuth, async (req, res) => {
    try {
      const validatedData = insertTermsSchema.parse({
        ...req.body,
        updatedBy: req.session.adminId,
      });
      
      const terms = await storage.createOrUpdateTerms(validatedData);
      res.json(terms);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update terms" });
    }
  });

  // Get site settings
  app.get("/api/admin/site-settings", requireAdminAuth, async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      res.json(settings || null);
    } catch (error) {
      res.status(500).json({ message: "Failed to get site settings" });
    }
  });

  // Update site settings
  app.put("/api/admin/site-settings", requireAdminAuth, async (req, res) => {
    try {
      const { insertSiteSettingsSchema } = await import("@shared/schema");
      const validatedData = insertSiteSettingsSchema.parse({
        ...req.body,
        updatedBy: req.session.adminId,
      });
      
      const settings = await storage.upsertSiteSettings(validatedData);
      res.json(settings);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update site settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
