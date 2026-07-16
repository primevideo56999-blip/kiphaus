# Security & Access Document

## Authentication Method
- **Primary Method:** Phone Number Verification (OTP) via Firebase Authentication. 
  - *Why:* Indian users strongly prefer mobile-first login flows, and WhatsApp integration relies heavily on verified phone numbers.
- **Secondary Method:** Google OAuth.
  - *Why:* One-click fast login for users who prefer email-based accounts without remembering passwords.

## User Roles & Permissions
**1. Guest (Unauthenticated User)**
- **Can:** Browse the landing page, search for properties, view property details, and view trust badges.
- **Cannot:** Click "Book via WhatsApp" (must log in to view host contact), access host dashboards, or create listings.

**2. Guest (Authenticated Traveler)**
- **Can:** Do everything an unauthenticated guest can, plus contact hosts via WhatsApp, save favorite properties, and view their own profile.
- **Cannot:** Access host dashboards or modify any property listings.

**3. Host (Property Owner)**
- **Can:** Do everything an authenticated guest can, plus create property listings, edit their own listings, view their host analytics dashboard, manage their subscription, and upload verification documents.
- **Cannot:** Edit other hosts' properties, approve their own verifications (admin only), or bypass subscription gates for premium features.

**4. Admin (Internal Team)**
- **Can:** View all properties, manually approve/reject property verification documents, suspend users, and view platform-wide metrics.
- **Cannot:** Alter user passwords or access sensitive payment info (handled via secure gateways).

## Row-Level Security (RLS) Rules (Database)
Assuming a PostgreSQL database (like Supabase) where RLS is enforced at the database level:
- **`properties` Table:**
  - *Read:* Public (everyone can see active properties).
  - *Insert/Update:* Only the authenticated user whose `id` matches `host_id`.
  - *Delete:* Only Admins or the `host_id` owner.
- **`users` Table:**
  - *Read/Update:* A user can only read and update their own row (where `id = auth.uid()`). Public profiles (like host names on listings) are exposed via a separate secure view or limited query.
- **`subscriptions` Table:**
  - *Read:* A user can only read their own subscription status.
  - *Update:* System only (updated via payment gateway webhooks).

## Error Handling
- **Failed Login/OTP:** "The code entered is incorrect or has expired. Please request a new code." Do not crash or clear the phone number input.
- **API Timeout (Property Search):** "We're having trouble fetching properties right now. Please check your connection and try again." Show a skeleton loader while fetching.
- **Unauthorized Access (Host Dashboard):** If a guest tries to access `/host/dashboard`, redirect them immediately to the "List your property" onboarding page.
- **Form Submission Failure:** Highlight the specific field causing the error (e.g., "Price must be greater than 0") in red with a clear helper text. Do not just show a generic "Error" toast.
- **Image Upload Failure:** "The image file is too large (max 5MB) or in an unsupported format. Please try another image."

## Edge Cases
- **Empty Search Results:** Instead of a blank screen, show a friendly empty state: "No properties found for those dates in [City]. Try adjusting your filters or exploring nearby destinations."
- **Slow Internet Connection:** Provide visual feedback (spinners on buttons, skeleton loaders for images) so the user doesn't click multiple times. Images should use low-quality image placeholders (blur-up).
- **Missing Property Images:** If an image URL fails to load, display a branded fallback Neumorphic placeholder image.
- **Unverified Hosts Attempting to Publish:** Allow saving as draft, but disable the "Publish" button and show a prompt: "Please complete Level 1 Verification to make your property visible to guests."
