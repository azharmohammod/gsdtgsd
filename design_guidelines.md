# Thai Membership Gateway - Design Guidelines

## Design Approach

**Selected System**: Professional payment interface inspired by Stripe's clarity combined with Material Design principles for forms and data display.

**Rationale**: This utility-focused membership system prioritizes trust, security, and ease of use for payment processing and account management. The design emphasizes clarity, accessibility, and mobile-first responsiveness with Thai language support.

**Core Principles**:
- Trust through transparency and clarity
- Efficient form completion and data entry
- Clear visual hierarchy for payment and membership information
- Mobile-first responsive design

---

## Typography

**Font Family**:
- Primary: 'Noto Sans Thai' (excellent Thai character support) via Google Fonts
- Fallback: system-ui, -apple-system, sans-serif

**Scale**:
- Headings: text-3xl (page titles), text-2xl (section headers), text-xl (card headers)
- Body: text-base (primary content), text-sm (supporting text, labels)
- Small: text-xs (captions, helper text)

**Weights**: 
- Regular (400) for body text
- Medium (500) for emphasis and labels
- Semibold (600) for headings and CTAs
- Bold (700) for primary page titles

---

## Layout System

**Spacing Units**: Use Tailwind units of 2, 4, 6, and 8 consistently
- Component spacing: p-4, p-6
- Section spacing: py-8, py-12
- Element gaps: gap-4, gap-6
- Card padding: p-6, p-8

**Container Strategy**:
- Max width: max-w-lg (forms, payment page), max-w-4xl (member dashboard)
- Centered layouts: mx-auto
- Mobile: px-4, Desktop: px-6 to px-8

---

## Component Library

### Navigation & Headers
**Registration/Login Header**:
- Clean top bar with logo/app name (text-2xl font-semibold)
- Minimal design, no navigation needed
- py-4 spacing

**Member Area Header**:
- Full navigation bar with logo, member name display
- Logout button (subtle, right-aligned)
- Mobile: Hamburger menu if needed
- Sticky positioning (sticky top-0)

### Form Components
**Input Fields**:
- Border style: border-2 with rounded-lg
- Focus state: ring-2 ring-offset-2
- Label positioning: Above input with text-sm font-medium
- Height: h-12 for comfortable touch targets
- Thai prefix dropdown: Custom styled select with border-2

**Form Layout**:
- Single column on mobile
- Logical grouping with gap-6 between fields
- Clear visual separation using whitespace, not lines

### Cards & Containers
**Standard Card**:
- Background: White surface with border or subtle shadow
- Rounded corners: rounded-xl
- Padding: p-6 to p-8
- Shadow: shadow-sm or shadow-md for elevation

**Section Dividers**:
- Generous spacing (my-8 to my-12) instead of visible lines
- Use background color changes for major section separation

### Payment Page Elements
**Bank Transfer Details Card**:
- Prominent QR code display (centered, adequate size)
- Copy buttons next to each field (inline, icon + text)
- Table-like layout for account details with clear labels
- Monospace font for account numbers

**File Upload Zone**:
- Dashed border (border-2 border-dashed)
- Large drop area (min-h-48)
- Clear icon (upload cloud icon from Heroicons)
- File preview thumbnail after upload with remove button

### Status & Feedback
**Approval Status**:
- Pending: Yellow/amber accent with pulsing animation
- Approved: Green with celebration animation (confetti or checkmark scale-in)
- Clear status badge with icon

**Refresh Button**:
- Prominent placement
- Rotating icon animation on click
- Secondary button style when pending

### Member Dashboard Sections
**Membership Details Card**:
- Large display of expiration date
- Progress bar showing days remaining
- "Extend Membership" CTA button (primary style)

**Live Events List**:
- Card-based layout for each event
- Past events: Reduced opacity, "Replay" option if available
- Upcoming: Bold with countdown timer if within 24 hours
- Event status badge (Live Now, Upcoming, Past)

**Gift Selection Cards** (3 cards in grid):
- Grid: grid-cols-1 md:grid-cols-3 gap-6
- Image placeholder at top
- Collapsible details (smooth accordion animation)
- Select button (primary when available, disabled when used)
- Visual indicator of selected gift

**Gift Delivery Form**:
- Appears after gift selection
- Calendar widget with disabled dates (days 1-7, beyond day 30)
- Custom styling for disabled vs selectable dates

### Buttons
**Primary CTA**: 
- Full color fill, rounded-lg
- h-12 for comfortable touch
- Font: font-semibold text-base
- Icon support (right-aligned arrow or relevant icon)

**Secondary**: 
- Outline style or ghost style
- Same height consistency

**Icon Buttons**: 
- Square aspect ratio
- Copy buttons: Small, inline with content

### Live Event Page
**Video Container**:
- 16:9 aspect ratio container
- Responsive iframe embed
- Full-width on mobile, max-w-5xl on desktop
- Centered with mx-auto

---

## Animations & Interactions

**Use Sparingly**:
- Status change: Fade-in celebration animation on approval
- Loading states: Gentle pulse or spinner
- Button hover: Subtle brightness change
- Card hover: Slight shadow increase (hover:shadow-lg)

**Avoid**:
- Page transitions
- Scroll-triggered animations
- Excessive micro-interactions

---

## Thai Language Considerations

- Increased line-height (leading-relaxed) for better Thai character readability
- Adequate letter-spacing for clarity
- Ensure form labels are clear and concise in Thai
- Test all UI text for proper wrapping and spacing

---

## Mobile Responsiveness

**Breakpoint Strategy**:
- Mobile-first: Base styles for mobile (< 768px)
- Tablet: md: breakpoint (768px+)
- Desktop: lg: breakpoint (1024px+)

**Key Adaptations**:
- Stack all multi-column layouts to single column on mobile
- Touch-friendly button sizes (min h-12)
- Adequate spacing between interactive elements (min gap-4)
- QR code remains scannable size on mobile

---

## Trust & Security Elements

- SSL badge display in footer
- Security reassurance text on payment page
- Clear "We verify all payments manually" messaging
- Line contact button with recognizable Line green brand color
- Professional, clean aesthetic throughout to build confidence

---

## Images

**QR Code**: 
- Payment page - prominent centered placement in bank transfer card
- Generate via QR code service, not custom SVG

**Hero Image**: 
- NOT NEEDED for this application (utility-focused, not marketing)

**Gift Images**: 
- Placeholder images for 3 gift cards
- Use aspect-square containers
- Can use service like Unsplash for placeholder product images

**Icons**: 
- Use Heroicons via CDN (outline style for consistency)
- Key icons needed: upload-cloud, check-circle, clock, gift, video-camera, phone, refresh, copy