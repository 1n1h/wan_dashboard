# WanAnimate SaaS App - Complete Build Specification

## Project Overview

Build a full-stack SaaS web application that allows users to explore and test various WanAnimate video generation features (text-to-video, image-to-video, face-swap, motion transfer, etc.) with a freemium pricing model.

**Tech Stack:**
- Frontend: React + TypeScript + Tailwind CSS
- Backend: Node.js / Edge Functions via InsForge
- Video Processing: Replicate API (WanAnimate models)
- Auth: InsForge Auth (built-in user management)
- Database: PostgreSQL (InsForge-managed)
- File Storage: InsForge Storage (for uploaded images/videos)
- Edge Functions: InsForge Edge Functions (for backend logic)
- Hosting: InsForge (entire application - frontend + backend)

---

## 1. Database Schema (InsForge PostgreSQL)

All tables are created in your InsForge PostgreSQL database. InsForge handles the managed Postgres infrastructure—you just define your schema and InsForge provisions it automatically.

**Note:** If using Claude Code or Cursor with InsForge MCP, your agent can provision these tables and create edge functions automatically through the InsForge API.

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  auth_provider TEXT, -- 'email', 'google', 'github'
  tier TEXT DEFAULT 'free', -- 'free', 'starter', 'pro', 'enterprise'
  credits_remaining INT DEFAULT 0,
  credits_purchased INT DEFAULT 0,
  tier_start_date TIMESTAMP,
  tier_end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Video Generations Table
```sql
CREATE TABLE video_generations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  feature_type TEXT, -- 'text-to-video', 'image-to-video', 'face-swap', 'motion-transfer'
  input_data JSONB, -- stores input parameters
  model_used TEXT, -- 'wan-2.5-t2v', 'wan-2.7-i2v', etc
  replicate_job_id TEXT,
  video_url TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  credits_used INT,
  processing_time_seconds INT,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);
```

### Pricing Tiers Table
```sql
CREATE TABLE pricing_tiers (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE, -- 'free', 'starter', 'pro', 'enterprise'
  monthly_price_cents INT, -- in cents (e.g., 2999 = $29.99)
  monthly_credits INT,
  features JSONB, -- list of enabled features
  max_video_length_seconds INT,
  max_resolution TEXT, -- '480p', '720p', '1080p'
  api_rate_limit INT, -- requests per minute
  priority_processing BOOLEAN,
  support_level TEXT, -- 'community', 'email', 'priority'
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Credit Purchases Table
```sql
CREATE TABLE credit_purchases (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT,
  credits_purchased INT,
  amount_cents INT,
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 2. Pricing Tiers

### Free Tier
- **Cost:** $0/month
- **Monthly Credits:** 50 (regenerate each month)
- **Features:**
  - Text-to-Video (5 sec max)
  - Max Resolution: 480p
  - Rate Limit: 1 request/minute
  - Support: Community only
- **Feature Restrictions:** Demo versions only, watermarked outputs

### Starter Tier
- **Cost:** $19/month
- **Monthly Credits:** 500
- **Features:**
  - Text-to-Video (up to 10 sec)
  - Image-to-Video
  - Max Resolution: 720p
  - Rate Limit: 5 requests/minute
  - Support: Email support
- **Feature Restrictions:** All features available, no watermark

### Pro Tier
- **Cost:** $59/month
- **Monthly Credits:** 2000
- **Features:**
  - All T2V/I2V modes
  - Face-Swap
  - Motion Transfer
  - Video Editing
  - Max Resolution: 1080p
  - Rate Limit: 20 requests/minute
  - Support: Priority email + Discord community
  - Priority GPU processing
- **Feature Restrictions:** Commercial-use approved, priority queue

### Enterprise Tier
- **Cost:** Custom pricing
- **Monthly Credits:** Custom
- **Features:**
  - Unlimited features
  - Custom model fine-tuning
  - Dedicated API support
  - Webhooks for automation
  - White-label options
  - Rate Limit: Custom
- **Feature Restrictions:** None

---

## 3. Landing Page

### Hero Section
- Eye-catching WanAnimate video demo (auto-play, looped)
- Headline: "Generate Studio-Quality Videos in Seconds"
- CTA Buttons: "Try Free" and "View Pricing"
- Subheading explaining core value proposition

### Features Showcase
Display cards for each feature with:
- Feature name (Text-to-Video, Image-to-Video, Face-Swap, etc.)
- 2-3 second demo video/GIF
- Brief description
- "See Feature" button (links to auth then feature demo)

### Pricing Section
- 4-tier comparison table
- Feature breakdown per tier
- Monthly toggle (for annual discount option later)
- CTA buttons on each card

### Use Cases Section
- Trading avatars / AI presenters
- Product marketing videos
- Social media content
- Educational animations
- Examples with screenshots

### FAQ Section
- "What is WanAnimate?"
- "How do credits work?"
- "Can I use videos commercially?"
- "How long does generation take?"
- "What file formats are supported?"

### Footer
- Navigation links
- Terms of Service, Privacy Policy
- Social links
- Newsletter signup

---

## 4. Authentication & User Onboarding

### Auth Methods (InsForge Built-in)
InsForge provides out-of-the-box user management. Configure these providers in your InsForge dashboard:
- Email/Password signup
- Google OAuth
- GitHub OAuth

All auth is handled through InsForge's Auth service. Your Next.js frontend calls InsForge Auth endpoints directly.

### Signup Flow
1. User lands on landing page
2. Clicks "Try Free" button
3. Presented with signup modal (email or OAuth)
4. On signup success:
   - Create user record with `tier: 'free'`
   - Assign 50 monthly credits
   - Auto-login and redirect to dashboard
5. User sees onboarding modal:
   - "Welcome to [App Name]"
   - 3 quick tips on how to use app
   - Link to tutorial videos
   - "Get Started" button

### Email Verification
- Send verification email on signup
- Require confirmation before video generation
- Option to resend verification email

---

## 5. Dashboard / Main App Layout

### Sidebar Navigation
- Dashboard (home)
- Try Features
  - Text-to-Video
  - Image-to-Video
  - Face-Swap
  - Motion Transfer
  - Video Editing
- My Videos (gallery of generated videos)
- Billing & Credits
- Account Settings
- Help & Docs
- Logout

### Top Bar
- App logo
- "Credits Remaining: X" (prominent display)
- User avatar dropdown menu
  - Profile
  - Billing
  - Logout

### Main Content Area
- Responsive grid layout
- Dark mode toggle (optional)

---

## 6. Feature Demo Pages

Each feature should have:

### Feature Header
- Feature name
- Brief description
- Credit cost display ("Cost: 10 credits per generation")
- Link to documentation / tutorials

### Input Form (Left Side)
Dynamically render based on feature:

**Text-to-Video (T2V)**
- Text prompt (textarea, 500 char limit)
- Duration slider (2-15 seconds, in 1-sec increments)
- Resolution dropdown (480p, 720p, 1080p - based on tier)
- Style selector (cinematic, cartoon, realistic, etc.)
- Aspect ratio (16:9, 9:16, 1:1, etc.)
- Seed input (for reproducibility)
- Advanced options (toggle to expand)
  - Frame rate
  - Motion intensity

**Image-to-Video (I2V)**
- Image upload (drag-drop, 5MB max)
- Text prompt (optional, for additional effects)
- Duration slider (2-10 seconds)
- Resolution dropdown
- Animation type (pan, zoom, follow motion, etc.)
- Seed input
- Advanced options

**Face-Swap**
- Source video upload (max 30 sec for free tier)
- Target face image upload
- Confidence threshold slider
- Blend strength slider
- Advanced options

**Motion Transfer**
- Source video upload (movement reference)
- Target video upload (character to animate)
- Intensity slider
- Preserve face checkbox
- Advanced options

**Video Editing**
- Video upload (max 2 min)
- Edit type (effects, color grade, upscale, etc.)
- Parameters specific to edit type
- Advanced options

### Form Actions
- Reset button
- "Generate" button (disabled if insufficient credits or not logged in)
- Show loading spinner when processing
- Estimated time display ("~30 seconds")

### Preview Area (Right Side)
- Show uploaded images/videos in real-time
- Display error messages clearly
- Show credit cost before generation
- Confirmation: "Generate this video? (10 credits will be deducted)"

---

## 7. Generation Processing & Results

### During Processing
- Show loading bar with progress % (from Replicate API polling)
- Display status updates:
  - "Starting generation..."
  - "Processing..."
  - "Finalizing..."
- Show estimated completion time
- Allow user to navigate away (generation continues in background)
- Option to get email notification when done

### After Completion
- Display generated video in full viewport
- Video player with controls (play, pause, download, share)
- Show actual credits used (may be less than estimate)
- Display processing time
- Action buttons:
  - Download (MP4)
  - Share (copy link)
  - Save to Library
  - Generate Similar (repopulate form with same params)
  - Try Another Feature

### Error Handling
- Show user-friendly error messages
- Suggest fixes (e.g., "Image too small - try 1024x1024 or larger")
- Refund credits if generation fails
- Log error to backend for debugging
- Provide "Contact Support" link for repeated failures

---

## 8. Video Gallery / My Videos

### Gallery View
- Grid layout (3-4 columns on desktop, 1 on mobile)
- Each card shows:
  - Video thumbnail (with play icon)
  - Feature type badge
  - Generation date
  - Hover to show: title, description, delete button

### Single Video View
- Large video player
- Metadata sidebar:
  - Feature used
  - Model used
  - Created date
  - Credits used
  - Input parameters (expandable)
- Action buttons:
  - Download
  - Share (public link)
  - Delete
  - Duplicate params (generate similar)

### Sharing Feature
- Generate public shareable link
- Include preview thumbnail for social media
- Optional password protection
- Expiration date option (7 days, 30 days, never)
- Analytics: view count, click count

### Filtering & Sorting
- Filter by feature type
- Sort by date (newest first)
- Search by keywords/description
- Pagination or infinite scroll

---

## 9. Billing & Credits System

### Credits Dashboard
- Current credit balance (large, prominent display)
- Monthly reset date
- Usage breakdown by feature (pie chart or bar chart)
- Credits usage history (table):
  - Date
  - Feature
  - Credits used
  - Video title/link

### Purchase Credits
- Predefined packages:
  - 100 credits = $5
  - 500 credits = $20 (10% discount)
  - 1000 credits = $35 (15% discount)
  - 2500 credits = $80 (20% discount)
- Payment via Stripe
- Instant credit delivery after payment
- Purchase history table

### Tier Management
- Current tier display
- Upgrade/Downgrade buttons
- Next billing date
- Auto-renewal toggle
- Cancel subscription button (with exit survey)

### Invoice History
- Table of all invoices
- Date, amount, status
- Download PDF button
- Retry payment for failed invoices

---

## 10. Account Settings

### Profile Section
- Username (editable)
- Email (display, with "change" option that sends verification)
- Avatar upload (profile picture)
- Bio/description (optional)
- Display preferences:
  - Theme (light/dark)
  - Email notifications toggle

### API Keys (Pro+ tiers only)
- Display API key (masked, with copy button)
- Regenerate key button (with confirmation)
- Usage stats:
  - Requests this month
  - Rate limit status

### Connected Integrations (future)
- Discord webhook integration
- Slack notifications
- Google Drive auto-upload

### Danger Zone
- Change password
- Delete account (irreversible, requires email confirmation)

---

## 11. Backend API Endpoints

### Auth Endpoints (Handled by InsForge)
InsForge provides built-in auth endpoints. Your frontend integrates directly with InsForge Auth:
```
POST /auth/signup - Create new user (InsForge endpoint)
POST /auth/login - Email/password login (InsForge endpoint)
POST /auth/logout - Logout (InsForge endpoint)
GET /auth/user - Get current logged-in user (InsForge endpoint)
POST /auth/forgot-password - Send reset email (InsForge endpoint)
```

Your Next.js `/api/` routes then handle business logic (checking tier, managing credits, etc.) by reading the authenticated user from InsForge.

### Video Generation Endpoints
```
POST /api/videos/generate - Submit video generation job
GET /api/videos/:id/status - Poll generation status
GET /api/videos/:id/result - Get completed video URL
GET /api/videos - List user's videos
DELETE /api/videos/:id - Delete video record
POST /api/videos/:id/share - Generate shareable link
GET /api/videos/shared/:token - Access shared video (no auth required)
```

### Credits Endpoints
```
GET /api/credits/balance - Get current credit balance
GET /api/credits/history - Get usage history
POST /api/credits/purchase - Create Stripe payment session
GET /api/credits/purchase/:id/status - Check purchase status
```

### User Endpoints
```
GET /api/user/profile - Get user profile
PATCH /api/user/profile - Update profile
GET /api/user/tier - Get current tier details
POST /api/user/tier/upgrade - Upgrade tier
POST /api/user/tier/downgrade - Downgrade tier
```

### Replicate Integration (Backend Service)
```
POST /api/internal/replicate/webhook - Handle Replicate completion webhook
- Update video_generations status
- Fetch final video URL from Replicate
- Deduct credits from user account
```

---

## 12. Replicate Integration

### Replicate Models to Support

**T2V (Text-to-Video)**
- Model: `wan-video/wan-2.5-t2v-fast` or latest
- Input: prompt, duration, resolution, seed, num_frames
- Output: MP4 video URL

**I2V (Image-to-Video)**
- Model: `wan-video/wan-2.5-i2v-fast` or latest
- Input: image, prompt (optional), duration, resolution, seed

**Face-Swap**
- Model: TBD (research available face-swap models on Replicate)
- Input: source_video, target_face_image
- Output: MP4 video URL

**Motion Transfer**
- Model: TBD (research motion-transfer models)
- Input: motion_video, target_video
- Output: MP4 video URL

### Webhook Flow
1. Submit job to Replicate API with webhook URL
2. Replicate processes video
3. Replicate POSTs to `/api/internal/replicate/webhook` with job status
4. Backend updates `video_generations` table
5. If successful, deduct credits from user
6. User gets notified (email or in-app)

### Error Handling
- Retry failed generations (up to 2x automatically)
- Refund credits on permanent failure
- Log all errors for debugging
- Alert admin if error rate spikes

---

## 13. Frontend Components (React)

### Core Layout Components
- `Layout` - Main wrapper with sidebar + topbar
- `LandingPage` - Homepage with hero, features, pricing
- `AuthModal` - Signup/login modal
- `Dashboard` - Main app dashboard

### Feature Pages
- `TextToVideoPage` - T2V form + preview
- `ImageToVideoPage` - I2V form + preview
- `FaceSwapPage` - Face-swap form + preview
- `MotionTransferPage` - Motion transfer form + preview
- `VideoEditingPage` - Video editing form + preview

### Shared Components
- `VideoPlayer` - Custom video player with controls
- `CreditCounter` - Displays current credits
- `GenerationForm` - Reusable form component
- `LoadingSpinner` - Processing indicator
- `PricingCard` - Reusable pricing tier card
- `VideoGrid` - Gallery grid layout
- `UploadZone` - Drag-drop file upload

### Utilities
- `useAuth()` - Auth context hook
- `useCredits()` - Credits context hook
- `useGeneration()` - Video generation hook
- `useLocalStorage()` - Persist form data
- `formatBytes()` - File size formatter
- `estimateCredits()` - Calculate credit cost based on params

---

## 14. Styling & UX Details

### Color Scheme (Suggested)
- Primary: Deep purple/indigo (#6B46C1 or similar)
- Accent: Cyan/bright blue (#00D9FF)
- Dark BG: #0F172A
- Light BG: #1E293B
- Text: #F1F5F9

### Typography
- Headings: 24px-48px, bold (700-800 weight)
- Body: 14px-16px, regular (400 weight)
- UI elements: 12px-14px, medium (500-600 weight)
- Font family: Inter or similar modern sans-serif

### Spacing & Layout
- Use 8px grid system (8, 16, 24, 32, 40, 48px gaps)
- Max content width: 1200px
- Mobile-first responsive design
- Breakpoints: 640px (mobile), 1024px (tablet), 1280px (desktop)

### Interactive Elements
- All buttons have hover, active, disabled states
- Form inputs have focus states with blue outline
- Smooth transitions (200ms for hover, 300ms for modal)
- Toast notifications for feedback (top-right)
- Modals with semi-transparent backdrop

### Loading States
- Skeleton screens for lazy-loaded content
- Animated spinners with pulsing effects
- Progress bars for uploads/generation
- Optimistic UI updates where possible

---

## 15. Testing & Validation

### Frontend Testing
- Unit tests for utility functions
- Component snapshot tests
- Integration tests for user flows (auth, generation)
- E2E tests for critical paths (signup → generate → view)

### Backend Testing
- API endpoint tests with auth
- Database transaction tests
- Replicate webhook simulation tests
- Credit calculation validation

### User Acceptance Testing
- Test all 5 features on multiple devices
- Test free tier credit limits
- Test tier upgrade/downgrade flows
- Test error scenarios (failed generations, payment failures)
- Test performance under load

---

## 16. Deployment & DevOps (InsForge)

InsForge handles everything—database, backend, frontend hosting, and edge functions. No external deployment needed.

### InsForge Project Setup
1. Create new project in InsForge dashboard
2. InsForge auto-provisions:
   - PostgreSQL database
   - Managed hosting (runs your app globally)
   - Edge function runtime
   - S3-compatible storage (for video uploads)
3. Get your InsForge deployment URL (e.g., `https://your-app.insforge.dev`)

### Frontend Deployment (via InsForge)
- Build Next.js/React app using InsForge SDK
- Deploy directly from CLI: `npx @insforge/cli deploy`
- InsForge builds and serves the frontend
- Automatic SSL certificate
- Global CDN for assets

### Backend Deployment (via InsForge Edge Functions)
- Write API routes as Edge Functions
- Deploy automatically when you push code
- InsForge handles scaling, load balancing, zero cold starts
- No server management needed

### Environment Variables (InsForge Dashboard)
Set in InsForge project settings:
```
REPLICATE_API_TOKEN=xxx
STRIPE_SECRET_KEY=sk_xxx
STRIPE_PUBLIC_KEY=pk_xxx
NEXT_PUBLIC_INSFORGE_URL=https://your-app.insforge.dev
```

### CI/CD Pipeline (InsForge Integrated)
- Connect GitHub to InsForge
- Push to main branch → automatic deployment
- Tests run automatically
- Database migrations run automatically
- Rollback on failure

---

## 17. Phased Rollout Plan

### Phase 1: MVP (Week 1-2)
- Landing page with pricing
- Auth (email + Google)
- Text-to-Video feature only
- Free + Pro tiers (remove Starter initially)
- Basic video gallery
- Simple credit system
- Manual testing

### Phase 2: Expansion (Week 3-4)
- Add Image-to-Video
- Add Starter tier
- Improve UI/UX based on Phase 1 feedback
- Webhook system for async generation
- Email notifications

### Phase 3: Feature Complete (Week 5-6)
- Add Face-Swap
- Add Motion Transfer
- Add Video Editing
- Advanced settings for all features
- Video sharing with public links
- API key management

### Phase 4: Polish & Scale (Week 7-8)
- Performance optimization
- Mobile app (React Native or PWA)
- Advanced analytics
- Referral system
- Community marketplace for videos

---

## 18. Success Metrics

Track these KPIs:
- Signup conversion rate (landing page → signup)
- Feature adoption (% of users trying each feature)
- Free-to-paid conversion rate
- Average revenue per user (ARPU)
- Churn rate
- Credit consumption per tier
- Generation success rate
- Average generation time
- Customer support tickets per 1000 users
- Net promoter score (NPS)

---

## 19. Future Enhancements

- [ ] Video monetization marketplace
- [ ] AI-powered prompt suggestions
- [ ] Batch processing API
- [ ] Custom model training
- [ ] Video analytics dashboard
- [ ] Team/collaboration features
- [ ] White-label solution
- [ ] Mobile app
- [ ] Desktop application
- [ ] Browser extension for video capture
- [ ] Integration with Adobe Creative Suite
- [ ] Real-time video preview
- [ ] Community-created filters/styles

---

## 20. Getting Started for AI Agent (Claude Code / Cursor)

### Prerequisites
- InsForge account (create at insforge.dev)
- Replicate API token (replicate.com)
- Stripe account (stripe.com)

### Agent Instructions

You are tasked with building this WanAnimate SaaS application. Follow these steps:

1. **Setup InsForge Project**
   - Create new project in InsForge dashboard
   - InsForge will provision a PostgreSQL database automatically
   - Copy your InsForge API URL and API key

2. **Setup Database**
   - Connect your InsForge MCP server (if using Claude Code)
   - Create all tables from the schema above using InsForge's database interface
   - Set up Row Level Security (RLS) policies for the users table
   - Example: Users can only read/update their own records

3. **Setup Next.js Project**
   - Create Next.js app: `npx create-next-app@latest`
   - Install dependencies: `@insforge/sdk`, stripe, replicate, tailwindcss, typescript
   - Add environment variables from InsForge, Replicate, and Stripe

4. **Setup Authentication**
   - Configure OAuth providers (Google, GitHub) in InsForge dashboard
   - Create `useAuth()` hook that integrates with InsForge Auth
   - Build login/signup pages and forms
   - Implement protected routes middleware

5. **Create Landing Page**
   - Build hero section with feature video demos
   - Create features showcase with cards
   - Build pricing comparison table (4 tiers)
   - Add FAQ section
   - Implement CTA buttons linking to signup

6. **Build Dashboard Layout**
   - Create sidebar navigation (authenticated users only)
   - Add top bar with credits display
   - Setup page routing to different features
   - Add user menu dropdown in top right

7. **Implement Text-to-Video Feature** (simplest to start)
   - Create form with prompt input, duration slider, resolution dropdown
   - Integrate Replicate API calls
   - Show loading state while processing
   - Display results with video player
   - Deduct credits from user account in InsForge database

8. **Add Remaining Features**
   - Image-to-Video (similar form, image upload)
   - Face-Swap (two video uploads, confidence slider)
   - Motion Transfer (motion video + target video)
   - Video Editing (video upload + edit type selector)

9. **Implement Credits System**
   - Calculate credit cost per feature and resolution
   - Show cost before generation
   - Track usage in `video_generations` table
   - Allow credit purchases via Stripe
   - Implement tier-based credit limits

10. **Setup Stripe Integration**
    - Create Stripe products for each tier (Free, Starter, Pro, Enterprise)
    - Implement subscription management
    - Build billing dashboard (view invoices, change tier, add credits)
    - Setup webhook for payment success/failure

11. **Build Video Gallery**
    - Create grid view of user's generated videos
    - Implement filtering (by feature, date)
    - Add sharing feature with public links
    - Allow video deletion

12. **Deploy with InsForge**
    - Login to InsForge CLI: `npx @insforge/cli login`
    - Deploy your app: `npx @insforge/cli deploy`
    - InsForge automatically:
      - Builds your Next.js/React app
      - Deploys frontend + backend together
      - Runs database migrations
      - Sets up SSL certificate
      - Configures global CDN
    - Your app is live at: `https://your-app.insforge.dev`
    - (Optional: Configure custom domain in InsForge dashboard)

13. **Configure Webhooks**
    - Set Replicate webhook URL to: `https://your-app.insforge.dev/api/webhooks/replicate`
    - Set Stripe webhook URL to: `https://your-app.insforge.dev/api/webhooks/stripe`
    - InsForge edge functions handle all webhook requests

14. **Testing**
    - Test auth flow (signup, login, logout)
    - Test each video generation feature with test inputs
    - Test free tier credit limits
    - Test tier upgrade/downgrade
    - Test payment flow (use Stripe test mode)
    - Test webhook handling for generation completion

---


