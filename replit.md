# Thai Membership Gateway

## Overview

The Thai Membership Gateway is a comprehensive membership management system designed for Thai-speaking users. It features payment processing, gift delivery scheduling, live event streaming, and review management. The application provides distinct interfaces for members and administrators, supporting the entire membership lifecycle from registration through ongoing benefits. Its purpose is to streamline membership operations and enhance member engagement.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built with React and TypeScript, utilizing Wouter for routing and TanStack Query for server state management and caching. The UI is designed with shadcn/ui components based on Radix UI, styled with Tailwind CSS, and follows a custom theme inspired by "New York" with Thai language support via Noto Sans Thai font. It features a mobile-first responsive design, Material Design principles for forms, and consistent spacing. Authentication state is managed via session cookies, and form state uses react-hook-form with Zod validation. Key pages include public registration/login, a member portal with events and gift selection, and an admin panel for user, event, gift, and content management, plus a live event streaming interface.

### Backend Architecture

The backend is an Express.js server developed with TypeScript, connected to a Neon serverless PostgreSQL database via Drizzle ORM. Session management is handled by `express-session` with a PostgreSQL store. User authentication uses bcrypt for password hashing, and Multer handles file uploads. The API is RESTful with session-based authentication guards for members and admins. Database schema includes tables for `admins`, `members`, `payments`, `gifts`, `giftDeliveries`, `events`, `reviews`, `terms`, and `session`. The authentication flow involves member registration, payment slip upload for admin approval, and status updates, maintained by session cookies. File storage utilizes the local filesystem for uploads.

### System Design Choices

- **Payment Workflow**: Members upload payment slips, triggering an admin approval process.
- **Gift Management**: Admins can manage a gift catalog, including multiple image uploads and real-time monthly quota tracking. Members can view quotas before selection, with selection buttons disabling for depleted gifts.
- **Review System**: Members can submit reviews, which undergo an approval workflow.
- **Website Settings**: Centralized admin panel for managing global configurations like membership pricing, bank details, and Line contact information.
- **Location Analytics**: Admin dashboard displays geographic distribution of gift deliveries aggregated by province, district, and subdistrict.
- **Image Handling**: Image URLs are processed to correctly display both new uploads and legacy assets.
- **Date Handling**: `z.coerce.date()` is used for automatic date string parsing in gift delivery forms.

## External Dependencies

- **Database**: Neon Serverless PostgreSQL (`@neondatabase/serverless`), Drizzle ORM.
- **Authentication**: `express-session`, `connect-pg-simple`, `bcrypt`.
- **File Handling**: `Multer`.
- **Frontend Libraries**: Radix UI, Tailwind CSS, `date-fns`, `date-fns-tz`, `react-hook-form`, Zod, Vite.
- **Third-Party Services**: Google Fonts API (for Noto Sans Thai), external platforms for video streaming (Zoom, Vimeo) embedded via URLs.

## Recent Changes

### November 19, 2025 - Gift Image Management & Admin Settings Fix

**Gift Image Management Feature:**
- **Fixed**: Admin gift photo management now fully functional - can view, upload, and delete all images
- **Root Cause**: UI only displayed legacy `gift.imageUrl`, ignoring the `gift.images[]` array from API
- **Solution**: Redesigned image section to display all images in a 2-column responsive grid
- **New Features**:
  - Multi-image grid display with unlimited upload support
  - Primary image badge ("รูปหลัก") on first image
  - Always-visible delete buttons for accessibility (touch, keyboard, and screen reader friendly)
  - Empty state with "ยังไม่มีรูปภาพ" message
  - Aria-labels for screen reader support
- **Technical**: Grid layout, proper cache invalidation, toast notifications, WCAG compliant

**Admin Settings Persistence Fix:**
- **Fixed**: Admin website settings now persist properly across saves
- **Root Cause**: `upsertSiteSettings` was deleting all fields then inserting only updated ones
- **Solution**: Modified to merge partial updates with existing data using nullish coalescing
- **Impact**: Admins can update pricing, payment info, or contact settings independently

**Member Review Form Updates:**
- Updated all Thai language labels with more descriptive, friendly text
- Rating: "ดาว" (Stars) instead of "คะแนน"
- Title field: "หากจะบอกเพื่อนสั้น ๆ เกี่ยวกับงานไลฟ์นี้ คุณจะพูดอะไร?"
- Content field: "โปรดเขียนรีวิว หรือ แชร์ประสบการณ์เพิ่มเติม"
- Pros/Cons fields with clearer labels
- Hidden "รีวิวจากสมาชิก" section from member dashboard

**Testing:** All features validated end-to-end with Playwright including accessibility compliance.