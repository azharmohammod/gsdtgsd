# Thai Membership Gateway - Testing & Deployment Instructions

## 📋 OVERVIEW

You have been hired to perform comprehensive testing and deployment for the **Thai Membership Gateway**, a membership management system built for Thai-speaking users. This system handles payment processing, gift delivery scheduling, live event streaming, and review management.

**Your Tasks:**
1. Complete manual testing of all features
2. Deploy the application to a custom domain with SSL/HTTPS

---

## 🎯 SYSTEM PURPOSE & BUSINESS LOGIC

### What Is This System?

The **Thai Membership Gateway** is a **subscription-based membership platform** designed for Thai-speaking communities. Think of it as a private club or fan community where:

- **Members pay a monthly subscription fee** (via bank transfer)
- In return, they get **exclusive benefits**: monthly gifts, access to live streaming events, and community engagement
- **Admins manage everything**: approve payments, manage gift inventory, schedule events, and moderate reviews

This is similar to platforms like Patreon, Ko-fi, or fan club memberships, but specifically tailored for Thai users who prefer bank transfer payments over credit cards.

---

### Who Uses This System?

**There are TWO types of users:**

#### 1. **Members (Public Users)** - The Subscribers
- **Who they are**: Thai-speaking fans, supporters, or community members
- **What they want**: Exclusive benefits, gifts, access to live events, community connection
- **What they pay**: Monthly subscription fee (e.g., 500-1000 THB/month)
- **Payment method**: Bank transfer (they upload a payment slip as proof)
- **Benefits they receive**:
  - Monthly gift selection (physical items delivered to their address)
  - Access to exclusive live streaming events (concerts, talks, workshops)
  - Ability to leave reviews and feedback

#### 2. **Administrators** - The Business Owners/Managers
- **Who they are**: The organization running the membership program (could be artists, creators, businesses)
- **What they do**: Run the entire operation
- **Responsibilities**:
  - Approve or reject payment submissions
  - Manage gift catalog and inventory
  - Schedule and host live events
  - Moderate member reviews
  - Configure website settings (pricing, payment details)

---

### How Does The System Work? (The Complete Flow)

Here's the **member journey from registration to benefits**:

#### **STEP 1: Registration**
1. A new user visits the website
2. They fill out registration form with:
   - Personal details (name, phone, email)
   - ID card number (for verification)
   - Password
3. System creates their account but marks them as **"inactive"** (not yet paid)

#### **STEP 2: Payment Submission**
1. After registration, user is directed to the **payment page**
2. They see:
   - Monthly subscription price (e.g., 500 THB)
   - QR code for payment (PromptPay/bank QR code)
   - Bank account details (bank name, account number, account holder name)
3. User makes bank transfer using their mobile banking app
4. User takes a screenshot of their **payment slip** (proof of payment)
5. User uploads the payment slip to the website
6. System marks their payment as **"รอตรวจสอบ" (Pending Review)**

#### **STEP 3: Admin Approval**
1. Admin logs into admin panel
2. Goes to "Payment Management" page
3. Sees all pending payment submissions
4. For each payment:
   - Views the uploaded payment slip image
   - Verifies the payment is legitimate (correct amount, correct account)
   - Clicks "Approve" ✅ or "Reject" ❌
5. **If Approved**: Member status changes to "active" and they can now access all benefits
6. **If Rejected**: Member remains inactive and may need to re-submit payment

#### **STEP 4: Member Benefits** (After Approval)
Once active, members can access their **Member Dashboard** with these benefits:

**A) Gift Selection & Delivery**
- Each month, members can choose **one gift** from a catalog
- Examples: T-shirts, mugs, posters, books, accessories
- **Quota System**: Each gift has a monthly limit
  - Example: "T-shirt: 50 available this month, 32 used, 18 remaining"
  - If quota = 0, gift cannot be selected (button disabled)
- Member fills out **delivery form** with:
  - Desired delivery date
  - Recipient name and phone
  - Full address (7 separate fields for analytics):
    - House number
    - Village/Building
    - Subdistrict (ตำบล/แขวง)
    - District (อำเภอ/เขต)
    - Province (จังหวัด)
    - Postal code
- Admin sees delivery request and processes it
- Admin updates status: "รอจัดส่ง" → "กำลังเตรียมจัดส่ง" → "จัดส่งแล้ว"
- When shipped, admin adds **tracking number**
- Member sees tracking info with 3-step instructions:
  - Step 1: Open tracking website
  - Step 2: Enter tracking number
  - Step 3: Enter reference "7883"

**B) Live Events**
- Admin creates events (live streams, online workshops, virtual concerts)
- Each event has:
  - Name, description
  - Date and time
  - Streaming URL (Zoom link, YouTube Live, Vimeo, etc.)
- Members see upcoming events in their dashboard
- On event day, members click "เข้าร่วมงาน" (Join Event)
- They're redirected to the streaming platform
- After event, members can leave reviews

**C) Reviews & Feedback**
- Members can submit reviews about events or their experience
- Review form includes:
  - Star rating (1-5 stars)
  - Title (short summary)
  - Content (detailed review)
  - Pros (what they loved)
  - Cons (what could improve)
- Reviews are submitted as **"รอตรวจสอบ" (Pending Review)**
- Admin reviews submissions and approves or rejects them
- This helps maintain quality and filter spam/inappropriate content

---

### Why Each Feature Exists (Business Purpose)

#### **Payment Slip Upload System**
- **Why**: In Thailand, bank transfers are more common than credit cards
- **Business need**: Need proof of payment for accounting and fraud prevention
- **Admin approval**: Prevents automated bot registrations, ensures real paying customers

#### **Gift Quota System**
- **Why**: Prevents over-promising and inventory issues
- **Business need**: If admin only has 50 T-shirts, they can't let 100 members select them
- **Real-time tracking**: Members see availability before selecting, reduces disappointment

#### **7-Field Address System**
- **Why**: Thailand has specific addressing with subdistrict/district/province structure
- **Analytics value**: Admin can see "Most members in Bangkok vs provinces" for planning
- **Delivery efficiency**: Complete addresses ensure successful deliveries

#### **Review Moderation**
- **Why**: Protect brand reputation, filter spam, ensure genuine feedback
- **Business need**: Only show approved reviews to maintain quality community

#### **Admin Website Settings**
- **Why**: Business needs flexibility
- **Use cases**:
  - Increase membership price for next month
  - Update bank account if it changes
  - Update Line contact for customer service
- **No developer needed**: Admin can update these without technical help

---

### The Business Model

**Revenue**: Monthly subscription fees from members (e.g., 500 THB × 100 members = 50,000 THB/month)

**Costs**:
- Gifts purchased and shipped monthly
- Live event hosting (Zoom/streaming platform)
- Platform maintenance

**Value Proposition**:
- **For Members**: Exclusive content, physical perks, community belonging
- **For Business**: Predictable monthly revenue, engaged community, direct customer relationship

---

### Key System Behaviors You'll Test

1. **Members cannot access benefits until payment approved** (enforces payment)
2. **Gift selection disabled if quota depleted** (inventory management)
3. **All Thai language labels updated with friendly text** (user experience)
4. **Admin settings persist across saves** (critical bug fix - pricing won't disappear when updating payment info)
5. **Gift images fully manageable** (upload multiple, delete any, no hover required for touch devices)
6. **Members addressed as "คุณ{firstName}"** (respectful Thai culture - not using title like นาย/นาง)
7. **Tracking shows reference "7883"** (specific to Thai delivery service integration)

---

## 🔐 TEST CREDENTIALS

### Admin Access
- **URL**: `/admin/login`
- **Username**: `admin`
- **Password**: `admin123`

### Member Access
- **URL**: `/login`
- **Phone**: `0812345678`
- **Password**: `password123`

---

## ✅ COMPREHENSIVE TESTING CHECKLIST

### 1. ADMIN PANEL TESTING

#### 1.1 Admin Login & Authentication
- [ ] Navigate to `/admin/login`
- [ ] Test login with correct credentials (admin/admin123)
- [ ] Test login with incorrect credentials (should show error)
- [ ] Verify redirect to `/admin` dashboard after successful login
- [ ] Test logout functionality
- [ ] Verify session persistence (refresh page, should stay logged in)

#### 1.2 Admin Dashboard (`/admin`)
- [ ] Verify all statistics cards display correctly:
  - Total members count
  - Active members count
  - Total payments count
  - Pending payments count
- [ ] Check location analytics section displays:
  - Province distribution chart
  - District breakdown
  - Subdistrict details
- [ ] Verify all charts render properly
- [ ] Test data refresh after making changes elsewhere

#### 1.3 Member Management (`/admin/members`)
- [ ] Verify member list displays all registered members
- [ ] Check each member card shows:
  - Full name (คุณ + first name)
  - Phone number
  - Email
  - Payment status badge
- [ ] Test viewing member details
- [ ] Verify member search/filter functionality (if available)
- [ ] Check that payment status updates reflect correctly

#### 1.4 Payment Management (`/admin/payments`)
- [ ] Verify payment list shows all payment submissions
- [ ] For each payment, check:
  - Member name
  - Upload date
  - Payment slip image displays correctly
  - Status (รอตรวจสอบ/อนุมัติ/ปฏิเสธ)
- [ ] Test approving a payment:
  - Click approve button
  - Verify success message "อนุมัติสำเร็จ"
  - Check member status changes to "active"
  - Verify payment status updates to "approved"
- [ ] Test rejecting a payment:
  - Click reject button
  - Verify success message
  - Check payment status updates to "rejected"
- [ ] Verify payment slip images load correctly
- [ ] Test image zoom/preview functionality

#### 1.5 Gift Catalog Management (`/admin/gifts-catalog`)
- [ ] Verify all gifts display in cards
- [ ] For each gift, check:
  - **Images Section**:
    - All uploaded images display in 2-column grid
    - First image shows "รูปหลัก" (Primary) badge
    - Delete button visible on each image (NO HOVER REQUIRED)
    - Delete button has trash icon
    - Empty state shows "ยังไม่มีรูปภาพ" if no images
  - **Upload Functionality**:
    - Click "เพิ่มรูปภาพ (ไม่จำกัด)" button
    - Select one or multiple images
    - Verify upload success toast "อัพโหลดสำเร็จ"
    - Check new images appear in grid immediately
  - **Delete Functionality**:
    - Click delete button on any image (should work without hover)
    - Verify confirmation or immediate deletion
    - Check success toast "ลบสำเร็จ"
    - Confirm image removed from grid
  - **Gift Details**:
    - Monthly quota display (if limited)
    - Used count (ใช้ไปแล้ว)
    - Remaining count (เหลือ) with green/red badge
    - "ไม่จำกัดจำนวน" badge if unlimited
    - Description
    - Details
    - Active/Inactive status
- [ ] Test editing gift details:
  - Click "แก้ไขของขวัญ" button
  - Modify name, description, or quota
  - Click save
  - Verify changes persist
- [ ] **CRITICAL**: Test on mobile/tablet to ensure delete buttons work (touch-friendly)
- [ ] **CRITICAL**: Test keyboard navigation - tab to delete buttons and press Enter

#### 1.6 Gift Deliveries Management (`/admin/gift-deliveries`)
- [ ] Verify delivery list shows all member gift selections
- [ ] For each delivery, check:
  - Member name
  - Gift name
  - Delivery date
  - Full address (all 7 fields):
    - House number (บ้านเลขที่)
    - Village/Building (หมู่บ้าน/อาคาร)
    - Subdistrict (ตำบล/แขวง)
    - District (อำเภอ/เขต)
    - Province (จังหวัด)
    - Postal code (รหัสไปรษณีย์)
  - Delivery phone number
  - Status badge
- [ ] Test updating delivery status:
  - Change status to "กำลังเตรียมจัดส่ง"
  - Change to "จัดส่งแล้ว"
  - Verify tracking number field appears
  - Enter tracking number
  - Save and verify success
- [ ] Check tracking display for members (covered in member testing)

#### 1.7 Event Management (`/admin/events`)
- [ ] Verify event list displays all created events
- [ ] Test creating new event:
  - Click "สร้างอีเวนต์" button
  - Fill in all fields:
    - Event name (Thai text)
    - Description
    - Event date & time
    - Streaming URL (test with valid URLs: Zoom, YouTube, Vimeo)
  - Click save
  - Verify success message
  - Check new event appears in list
- [ ] Test editing existing event:
  - Click edit on any event
  - Modify details
  - Save and verify changes persist
- [ ] Test deleting event (if available)
- [ ] Verify upcoming/past event sorting

#### 1.8 Review Management (`/admin/reviews`)
- [ ] Verify all submitted reviews display
- [ ] For each review, check:
  - Member name
  - Star rating (1-5 stars displayed correctly)
  - Review title
  - Review content
  - Pros (สิ่งที่ประทับใจที่สุด)
  - Cons (สิ่งที่อยากให้ปรับปรุงหรือเพิ่มเติม)
  - Submission date
  - Approval status
- [ ] Test approving a review:
  - Click approve button
  - Verify success toast
  - Check status changes to "approved"
- [ ] Test rejecting a review:
  - Click reject button
  - Verify success toast
  - Check status changes to "rejected"

#### 1.9 Website Settings (`/admin/website`)
- [ ] **Pricing Tab (ราคา)**:
  - Update membership price (e.g., change to 999)
  - Click "บันทึก" (Save)
  - Verify success toast "บันทึกสำเร็จ"
  - Refresh page and confirm price still shows 999
- [ ] **Payment Tab (การชำระเงิน)**:
  - Upload QR code image
  - Enter bank name (e.g., "ธนาคารกรุงเทพ")
  - Enter account number (e.g., "1234567890")
  - Enter account name (e.g., "บริษัท ทดสอบ จำกัด")
  - Click save
  - Verify success toast
  - **CRITICAL**: Refresh page and verify all payment info persists (not deleted)
- [ ] **Contact Tab (ติดต่อ)**:
  - Enter Line URL (e.g., "https://line.me/ti/p/xxxxx")
  - Click save
  - Verify success toast
  - **CRITICAL**: Go back to Pricing tab, verify price is still 999 (not deleted)
  - Return to Contact tab, verify Line URL persists
- [ ] **Cross-Tab Persistence Test**:
  - Update all three tabs one by one
  - After saving each tab, check other tabs to ensure data NOT deleted
  - This tests the critical bug fix for settings persistence

#### 1.10 Terms Management (`/admin/terms`)
- [ ] View current terms and conditions
- [ ] Test editing terms:
  - Modify content (Thai text)
  - Click save
  - Verify changes persist
- [ ] Check terms display on member-facing pages

---

### 2. MEMBER/USER PANEL TESTING

#### 2.1 Registration (`/register`)
- [ ] Navigate to `/register`
- [ ] Fill in all required fields:
  - Title (นาย/นาง/นางสาว) - Note: This is for data collection only; display should use "คุณ"
  - First name (Thai)
  - Last name (Thai)
  - Phone number (10 digits, starting with 0)
  - Email (valid format)
  - Password (minimum requirements)
  - ID Card Number (13 digits)
  - Date of Birth
- [ ] Test field validation:
  - Submit with empty fields (should show errors)
  - Enter invalid phone format
  - Enter invalid email format
  - Enter short password
  - Verify error messages display in Thai
- [ ] Test successful registration:
  - Fill all fields correctly
  - Click "ลงทะเบียน" (Register)
  - Verify redirect to payment page or thank you page
- [ ] Test duplicate phone number (should show error)
- [ ] Test duplicate email (should show error)

#### 2.2 Login (`/login`)
- [ ] Navigate to `/login`
- [ ] Test login with phone number and password
- [ ] Test incorrect credentials (should show error in Thai)
- [ ] Test login with unregistered phone
- [ ] Verify successful login redirects to `/member` dashboard
- [ ] Test "Remember me" checkbox (if available)
- [ ] Verify session persistence after browser close/reopen

#### 2.3 Payment Submission (`/payment`)
- [ ] After registration or login as inactive member:
  - Navigate to payment page
  - Verify membership price displays correctly (from admin settings)
  - Verify QR code displays (if uploaded by admin)
  - Verify bank details display correctly:
    - Bank name
    - Account number
    - Account name
- [ ] Test payment slip upload:
  - Click upload button
  - Select image file (JPG, PNG)
  - Verify preview shows
  - Click submit
  - Verify success message
  - Verify redirect to thank you page
- [ ] Test file validation:
  - Try uploading non-image file (should show error)
  - Try uploading very large file (>5MB)
- [ ] Verify payment appears in admin panel with "รอตรวจสอบ" status

#### 2.4 Thank You Page (`/thank-you`)
- [ ] Verify page displays after payment submission
- [ ] Check message content in Thai
- [ ] Verify instructions for next steps
- [ ] Test navigation back to login/home

#### 2.5 Member Dashboard (`/member`)

**Profile Tab:**
- [ ] Verify member info displays:
  - Name shown as "คุณ{firstName}" (NOT นาย/นาง/นางสาว + full name)
  - Phone number
  - Email
  - Membership status badge
- [ ] Test profile editing (if available)

**Gift Selection Tab:**
- [ ] Verify all active gifts display as cards
- [ ] For each gift, check:
  - Primary image displays (first from images array)
  - Gift name
  - Description
  - **Quota Information**:
    - If limited: Shows "เหลือ X ชิ้น" badge
    - If unlimited: Shows "ไม่จำกัดจำนวน" badge
    - Green badge if available (>0 remaining)
    - Red badge if depleted (0 remaining)
  - "เลือกของขวัญ" button:
    - Enabled if quota available
    - **DISABLED if quota = 0** (button should be grayed out)
- [ ] Test selecting a gift:
  - Click "เลือกของขวัญ" on available gift
  - Verify delivery form modal opens
  - Fill in delivery information:
    - Desired delivery date (use calendar)
    - Recipient name
    - Recipient phone
    - House number
    - Village/Building name
    - Subdistrict (ตำบล/แขวง)
    - District (อำเภอ/เขต)
    - Province (จังหวัด)
    - Postal code
  - Submit form
  - Verify success toast "บันทึกสำเร็จ"
  - Check delivery appears in "My Deliveries" section
- [ ] Test selecting gift with depleted quota:
  - Button should be disabled
  - No action on click
- [ ] Test calendar date selection:
  - Verify past dates are disabled
  - Check date availability messaging

**My Gift Deliveries Section:**
- [ ] Verify all selected gifts display
- [ ] For each delivery, check:
  - Gift name
  - Delivery date
  - Full address display
  - Status badge (รอจัดส่ง/กำลังเตรียม/จัดส่งแล้ว)
- [ ] **Test Tracking Display (Status: จัดส่งแล้ว)**:
  - Verify 3-step tracking instructions display:
    - Step 1: Open website
    - Step 2: Enter tracking number
    - Step 3: Enter reference "7883" (FIXED, not dynamic)
  - Check tracking number displays with copy button
  - Click copy button
  - Verify success toast "คัดลอกแล้ว"
  - Paste in notepad to confirm it copied correctly
  - **CRITICAL**: Verify reference number shows "7883" (static value)

**Events Tab:**
- [ ] Verify upcoming events list
- [ ] For each event, check:
  - Event name
  - Description
  - Date and time (Thai format)
  - "เข้าร่วมงาน" (Join Event) button
- [ ] Test joining live event:
  - Click "เข้าร่วมงาน"
  - Verify streaming URL opens (may need to test with actual live stream)
  - Check embedded player or redirect to platform

**Reviews Tab:**
- [ ] Verify review submission form displays
- [ ] Check form fields and labels (NEW UPDATED TEXT):
  - **Card Title**: "รีวิวของคุณมีค่ากับเรามาก"
  - **Card Description**: "โปรดแชร์ประสบการณ์ของคุณ เพื่อให้คนอื่นรู้ว่าการเข้าร่วมงานเป็นอย่างไร และช่วยให้เราทราบว่าควรปรับปรุงอย่างไรเพื่อให้บริการคุณได้ดียิ่งขึ้น ขอบคุณครับ"
  - **Rating Label**: "ดาว *" (NOT "คะแนน")
  - **Title Field Label**: "หากจะบอกเพื่อนสั้น ๆ เกี่ยวกับงานไลฟ์นี้ คุณจะพูดอะไร? *"
  - **Content Field Label**: "โปรดเขียนรีวิว หรือ แชร์ประสบการณ์เพิ่มเติม *"
  - **Pros Field Label**: "สิ่งที่ประทับใจที่สุด"
  - **Cons Field Label**: "สิ่งที่อยากให้ปรับปรุงหรือเพิ่มเติม"
- [ ] Test submitting review:
  - Click star rating (1-5 stars)
  - Fill in title
  - Fill in content
  - Optionally fill pros and cons
  - Click "ส่งรีวิว" (Submit Review)
  - Verify success toast
  - Check review appears in admin panel as "รอตรวจสอบ"
- [ ] **CRITICAL**: Verify "รีวิวจากสมาชิก" section is HIDDEN (should NOT appear on page)
- [ ] Test form validation:
  - Submit without rating (should show error)
  - Submit without title (should show error)
  - Submit without content (should show error)

---

### 3. CROSS-BROWSER TESTING

Test ALL features above on the following browsers (latest versions):
- [ ] Google Chrome (Desktop & Mobile)
- [ ] Mozilla Firefox (Desktop)
- [ ] Safari (macOS & iOS)
- [ ] Microsoft Edge (Desktop)
- [ ] Opera (if relevant to target audience)

**For each browser, verify:**
- [ ] Layout renders correctly
- [ ] Thai text displays properly (Noto Sans Thai font)
- [ ] Forms submit successfully
- [ ] Images load correctly
- [ ] Buttons and interactions work
- [ ] No console errors (press F12 to check)

---

### 4. RESPONSIVE DESIGN TESTING

Test on the following devices/screen sizes:

**Desktop:**
- [ ] 1920x1080 (Full HD)
- [ ] 1366x768 (Standard laptop)
- [ ] 2560x1440 (QHD)

**Tablet:**
- [ ] iPad (768x1024)
- [ ] iPad Pro (1024x1366)
- [ ] Android tablets (various sizes)
- [ ] Test both portrait and landscape

**Mobile:**
- [ ] iPhone (375x667, 414x896)
- [ ] Android phones (360x640, 412x915)
- [ ] Small phones (320x568)
- [ ] Test both portrait and landscape

**For each device, check:**
- [ ] All content visible without horizontal scroll
- [ ] Touch targets large enough (min 44x44px)
- [ ] Forms easy to fill on mobile
- [ ] Images scale appropriately
- [ ] Navigation works (mobile menu if applicable)
- [ ] Cards stack properly on mobile
- [ ] Delete buttons on gift images work on touch devices (NO HOVER NEEDED)

---

### 5. ACCESSIBILITY TESTING

- [ ] **Keyboard Navigation**:
  - Tab through all interactive elements
  - Verify focus indicators visible
  - Test form submission with Enter key
  - Verify delete buttons on gift images are keyboard accessible
  - Test modals/dialogs with Escape key
- [ ] **Screen Reader Testing** (NVDA, JAWS, or VoiceOver):
  - Test with screen reader on
  - Verify aria-labels read correctly (especially delete buttons: "ลบรูปภาพที่ X ของ [gift name]")
  - Check form labels are associated
  - Verify image alt text
- [ ] **Color Contrast**:
  - Use browser extension (e.g., WAVE, axe DevTools)
  - Check text contrast ratios (min 4.5:1)
  - Verify status badges readable
- [ ] **Text Resizing**:
  - Zoom browser to 200%
  - Verify layout doesn't break
  - Check all text remains readable

---

### 6. PERFORMANCE TESTING

- [ ] **Page Load Speed**:
  - Use Lighthouse (Chrome DevTools)
  - Test on 3G network simulation
  - Target: First Contentful Paint < 2 seconds
  - Target: Time to Interactive < 3 seconds
- [ ] **Image Optimization**:
  - Check all images load properly
  - Verify appropriate file sizes
  - Test lazy loading (if implemented)
- [ ] **Concurrent Users**:
  - Open multiple browser windows/tabs
  - Have multiple people test simultaneously
  - Verify no conflicts or errors

---

### 7. SECURITY TESTING

- [ ] **Authentication**:
  - Verify logout works completely
  - Try accessing `/admin` without login (should redirect)
  - Try accessing `/member` without login (should redirect)
  - Test session timeout
- [ ] **Input Validation**:
  - Try SQL injection in form fields: `'; DROP TABLE members; --`
  - Try XSS attacks: `<script>alert('XSS')</script>`
  - Verify all inputs sanitized
- [ ] **File Upload**:
  - Try uploading malicious files (.exe, .php)
  - Verify only images accepted
  - Check file size limits enforced
- [ ] **Password Security**:
  - Verify passwords not visible in network tab
  - Check passwords hashed in database (if you have access)

---

### 8. DATA INTEGRITY TESTING

- [ ] **Admin Settings Persistence** (CRITICAL BUG FIX):
  - Update Pricing tab, save
  - Update Payment tab, save
  - Go back to Pricing tab → verify price NOT deleted
  - Update Contact tab, save
  - Go back to Payment tab → verify bank details NOT deleted
  - **This tests the critical bug fix that settings now persist properly**
- [ ] **Gift Quota Tracking**:
  - Note current quota for a gift (e.g., 5 remaining)
  - Have member select that gift
  - Refresh admin panel
  - Verify quota decreased by 1 (now 4 remaining)
  - Check on member side that remaining count updated
- [ ] **Review Workflow**:
  - Member submits review
  - Admin approves review
  - Check review status updates correctly
  - Verify no duplicate reviews created

---

## 📝 BUG REPORTING FORMAT

When you find bugs, report them in this format:

```
**Bug #X: [Short Title]**

**Severity**: Critical / High / Medium / Low

**Steps to Reproduce**:
1. Go to [page]
2. Click [button]
3. Enter [data]
4. Observe [issue]

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happens]

**Browser/Device**:
[Chrome on Windows 11, Safari on iPhone 14, etc.]

**Screenshot**:
[Attach if applicable]

**Additional Notes**:
[Any other relevant information]
```

---

## 🚀 DEPLOYMENT INSTRUCTIONS

### Part 1: Publish on Replit (Get .replit.app Domain)

1. **Ensure Application is Running**:
   - In Replit, verify the "Start application" workflow is running successfully
   - Check that the app loads without errors at the preview URL

2. **Click the "Deploy" Button**:
   - Look for the Deploy/Publish button in the top-right of the Replit interface
   - Click "Autoscale Deployment" (recommended) or "Reserved VM" for production

3. **Configure Deployment**:
   - **Name**: Choose a deployment name (e.g., "thai-membership-prod")
   - **Type**: Select "Autoscale" for automatic scaling
   - Click "Deploy"

4. **Wait for Deployment**:
   - Replit will build and deploy your application
   - This may take 2-5 minutes
   - You'll receive a `.replit.app` URL (e.g., `thai-membership-prod.replit.app`)

5. **Test the Deployed App**:
   - Visit the `.replit.app` URL
   - Verify the app loads
   - Test login functionality
   - Check admin panel access
   - **Important**: This URL automatically has HTTPS/SSL enabled by Replit

---

### Part 2: Connect Your Custom Domain with SSL

#### Prerequisites:
- You need access to your domain registrar (e.g., GoDaddy, Namecheap, Cloudflare)
- You need the custom domain name (e.g., `membership.yourdomain.com`)

#### Steps:

1. **Go to Deployment Settings in Replit**:
   - In your deployed app on Replit, click on the "Deployments" tab
   - Select your active deployment
   - Click on "Settings" tab
   - Look for "Custom Domains" section

2. **Click "Link a Domain" or "Manually Connect from Another Registrar"**:
   - Choose "Manually connect from another registrar" if you manage your domain elsewhere

3. **Replit Will Show You DNS Records**:
   You'll see something like:
   ```
   A Record:
   Name: @ (or your subdomain, e.g., "membership")
   Value: 147.185.221.19 (IP will be different)
   
   TXT Record (for verification):
   Name: _replit-challenge
   Value: [random verification string]
   ```

4. **Add DNS Records at Your Domain Registrar**:

   **For GoDaddy:**
   - Log in to GoDaddy
   - Go to "My Products" → "DNS"
   - Click "Add" to create new record
   - **For A Record**:
     - Type: A
     - Name: `@` (for root domain) or `membership` (for subdomain)
     - Value: [IP from Replit]
     - TTL: 600 seconds
   - **For TXT Record**:
     - Type: TXT
     - Name: `_replit-challenge`
     - Value: [verification string from Replit]
     - TTL: 600 seconds
   - Click "Save"

   **For Namecheap:**
   - Log in to Namecheap
   - Go to "Domain List" → Click "Manage" on your domain
   - Go to "Advanced DNS" tab
   - Click "Add New Record"
   - **For A Record**:
     - Type: A Record
     - Host: `@` or `membership`
     - Value: [IP from Replit]
     - TTL: Automatic
   - **For TXT Record**:
     - Type: TXT Record
     - Host: `_replit-challenge`
     - Value: [verification string from Replit]
     - TTL: Automatic
   - Click "Save All Changes"

   **For Cloudflare:**
   - Log in to Cloudflare
   - Select your domain
   - Go to "DNS" section
   - Click "Add Record"
   - **For A Record**:
     - Type: A
     - Name: `@` or `membership`
     - IPv4 address: [IP from Replit]
     - Proxy status: DNS only (gray cloud, NOT proxied)
     - TTL: Auto
   - **For TXT Record**:
     - Type: TXT
     - Name: `_replit-challenge`
     - Content: [verification string from Replit]
     - TTL: Auto
   - Click "Save"
   - **Important for Cloudflare**: Turn OFF the orange cloud (proxy) for the A record initially

5. **Wait for DNS Propagation**:
   - DNS changes can take 15 minutes to 48 hours
   - Typically completes in 1-4 hours
   - You can check propagation status at: https://www.whatsmydns.net

6. **Verify Domain in Replit**:
   - Return to Replit Deployment Settings
   - Click "Verify" next to your custom domain
   - Replit will check the DNS records
   - Once verified, you'll see a green checkmark

7. **SSL Certificate (Automatic)**:
   - **Replit automatically provisions a FREE SSL/TLS certificate** from Let's Encrypt
   - This happens automatically once domain verification succeeds
   - Your site will be accessible via `https://yourdomain.com` (HTTPS)
   - Certificate auto-renews every 90 days (no action needed)

8. **Test Your Custom Domain**:
   - Visit `https://yourdomain.com` (or your subdomain)
   - Verify the green padlock icon in browser (indicates SSL is active)
   - Click the padlock → "Certificate" to verify it's issued by Let's Encrypt
   - Test all functionality:
     - Admin login at `https://yourdomain.com/admin/login`
     - Member login at `https://yourdomain.com/login`
     - Registration at `https://yourdomain.com/register`

9. **Set Up HTTP to HTTPS Redirect** (if needed):
   - Replit usually handles this automatically
   - Test by visiting `http://yourdomain.com` (without 's')
   - It should automatically redirect to `https://yourdomain.com`

---

### Part 3: Post-Deployment Verification

- [ ] Test the live site on custom domain
- [ ] Verify HTTPS/SSL working (green padlock)
- [ ] Test all critical workflows:
  - [ ] Member registration and login
  - [ ] Payment submission
  - [ ] Admin approval flow
  - [ ] Gift selection and delivery
  - [ ] Event streaming
  - [ ] Review submission
- [ ] Check all images load (especially QR codes, payment slips, gift images)
- [ ] Verify database connectivity
- [ ] Test from different devices and networks
- [ ] Check email notifications (if configured)
- [ ] Monitor error logs for 24-48 hours after deployment

---

### Part 4: Troubleshooting

**If domain doesn't connect:**
- Double-check DNS records match exactly (no typos)
- Verify you're using `@` for root domain or correct subdomain name
- If using Cloudflare, ensure proxy (orange cloud) is OFF for A record initially
- Wait longer (DNS can take up to 48 hours)
- Clear your browser cache or test in incognito mode

**If SSL certificate doesn't provision:**
- Verify domain is correctly connected first
- Check that port 443 (HTTPS) isn't blocked
- Wait 10-15 minutes after domain verification
- Contact Replit support if issue persists

**If app doesn't load after deployment:**
- Check Replit deployment logs for errors
- Verify environment variables are set in deployment settings
- Ensure database is properly configured
- Check that all dependencies installed correctly

---

## 📧 DELIVERABLES

After completing all testing and deployment, provide:

1. **Testing Report**:
   - Summary of all tests performed
   - List of any bugs found (with severity levels)
   - Screenshots of critical bugs
   - Browser/device compatibility matrix

2. **Deployment Confirmation**:
   - Live URL of deployed application (both .replit.app and custom domain)
   - SSL certificate verification screenshot (green padlock)
   - Confirmation that all DNS records configured correctly

3. **Final Checklist**:
   - Mark all completed items in this document
   - Note any items that couldn't be tested (with reasons)
   - Recommendations for improvements (if any)

---

## ⏱️ ESTIMATED TIME

- **Testing**: 8-12 hours (thorough testing of all features)
- **Deployment**: 2-4 hours (including DNS propagation wait time)
- **Total**: 10-16 hours

---

## 💡 IMPORTANT NOTES

1. **Thai Language**: All user-facing text is in Thai. Verify correct display.
2. **Critical Bug Fixes Tested**:
   - Admin settings persistence (pricing, payment, contact)
   - Gift image management (upload, view, delete)
   - Review form text updates
   - Tracking number display for deliveries
3. **Accessibility**: This app must work on touch devices (phones/tablets). Delete buttons and all interactions MUST work without hover.
4. **Data Privacy**: Handle all test data responsibly. Don't share member information.
5. **Credentials**: Keep admin credentials secure. Change after testing if deploying to production.

---

## 📞 QUESTIONS?

If you encounter any issues or have questions:
1. Document the issue clearly with screenshots
2. Note the exact steps that led to the problem
3. Include browser/device information
4. Report back with all details

**Good luck with testing and deployment!** 🚀
