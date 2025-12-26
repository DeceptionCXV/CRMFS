# Central Region Muslim Funeral Service - CRM System

> A comprehensive member and payment management system built for Falkirk Central Mosque's death committee (Central Region Muslim Funeral Service).

**Built by:** [Kelpie AI](https://kelpieai.co.uk)  
**Version:** 0.1.6.3  
**Status:** Active Development  
**Tech Stack:** React + TypeScript + Supabase + Tailwind CSS

---

## 📋 Overview

The Central Region Muslim Funeral Service CRM is a modern web application designed to streamline member registration, payment tracking, and administrative operations for Falkirk Central Mosque's funeral service committee. The system replaces the previous Microsoft Access-based solution with a responsive, cloud-based platform accessible from any device.

### Purpose

This CRM serves the death committee's operational needs by:
- Digitising member registration and data management
- Automating payment calculations and renewal tracking
- Providing real-time insights into membership and finances
- Centralising all member information in one secure location
- Reducing administrative overhead and manual paperwork

---

## ✨ Current Features

### 🔐 Authentication & Security
- Secure login system with Supabase authentication
- Protected routes and session management
- Row-level security on all database tables
- Environment validation and connection monitoring

### 👥 Member Management
- **10-Step Registration Wizard** with progress tracking:
  - Personal details
  - Joint member registration (optional)
  - Children information
  - Next of kin details
  - GP information
  - Medical declarations
  - Document upload placeholders
  - Terms & conditions
  - Automated payment calculation
  - Review and submit
- **Save Progress Feature** - Resume incomplete registrations
- **Comprehensive Member Detail Pages** with:
  - Modern Supabase-style collapsible navigation
  - Sub-navigation sidebar with 10 information tabs
  - Personal Info tab (editable)
  - Joint Member tab (partner details)
  - Children tab (add/edit/delete with premium modals)
  - Next of Kin tab (emergency contacts with CRUD)
  - GP Details tab (medical practitioner info)
  - Medical Info tab (conditions/allergies/medications)
  - Documents tab (file management placeholder)
  - Declarations tab (terms acceptance with timestamps)
  - Payments tab (transaction history with summary cards)
  - Activity Log tab (complete audit trail with timeline)
- **Member Actions:**
  - Edit mode with inline field editing
  - View payment history with status badges
  - Pause membership (temporary suspension)
  - Mark as deceased (preserves records)
  - Delete member (removes all data with confirmation)

### 💰 Payment Management
- Payment recording and tracking
- Multiple payment methods (cash, card, bank transfer, cheque)
- Automatic fee calculation based on member age
- Payment status tracking (Pending, Completed, Overdue, Failed, Refunded)
- Late fee management
- **Payment Summary Cards** - Total paid, pending, transaction count
- **Late Payment Widget** - Highlights overdue payments
- Search and filter by member, status, or date range
- Payment history per member with colour-coded status

### 📊 Dashboard & Analytics
- Real-time statistics:
  - Total members
  - Active members
  - Pending applications
  - Total revenue
- **Applications In Progress** - Shows saved registrations
- **Upcoming Renewals** (30-day advance warning):
  - Colour-coded urgency (Red: ≤7 days, Orange: 8–14 days, Yellow: 15–30 days)
  - Automatic anniversary calculation
  - Direct links to member profiles
- Recent member activity feed

### 💀 Deceased Member Management
- Comprehensive funeral record system
- Deceased member list with search and filter
- **7 Information Tabs per Deceased Member:**
  - Overview (deceased info, family contacts)
  - Funeral Details (burial information, dates, locations)
  - Documents (death certificates, burial permits)
  - Family Contacts (relatives with relationships)
  - Expenses (itemised funeral costs)
  - Payments (contributions and transactions)
  - Activity Log (complete audit trail)
- Family contact management
- Expense tracking with categories
- Payment processing for funeral costs
- Document management for certificates

### 📝 Activity Logging & Audit Trail
- Automatic activity tracking on all database operations
- Database triggers on all major tables (members, payments, deceased, etc.)
- **Activity Log Features:**
  - Complete timeline view with relative timestamps ("2 hours ago")
  - Colour-coded action types (payments, updates, status changes)
  - Expandable details showing before/after values
  - Statistics cards (total events, payments, updates)
  - Icon-based visual indicators
  - 50 most recent events per member
- **Tracked Actions:**
  - Member creation and updates
  - Status changes
  - Payment recording
  - Deceased marking
  - Funeral arrangements
  - Expense additions
  - Document uploads
  - Contact additions

### 🎨 User Experience
- **Modern Navigation System:**
  - Collapsible main sidebar (64px collapsed, 256px expanded)
  - Supabase-style smooth animations
  - Hover-to-expand functionality
  - Mobile hamburger menu
  - Context-aware sub-navigation for detail pages
- **Premium Form Modals** with:
  - Professional validation with inline error messages
  - Auto-focus on first input field
  - Loading states during save operations
  - Keyboard shortcuts (ESC to close, Enter to submit)
  - Smooth fade-in animations
  - Date pickers for date fields
  - Dropdowns for constrained values
  - Disabled states during operations
- Responsive design (desktop, tablet, mobile)
- Toast notifications for user feedback
- Loading states and skeleton screens
- Empty states with helpful guidance and call-to-action buttons
- Error boundaries for graceful failure handling
- Custom 404 page
- Islamic-themed colour scheme (emerald green + gold)
- Professional Poppins typography
- Proper spacing and breathing room (32px top padding)
- Compact, information-dense layouts

### 📈 Reports (Basic)
- Report generation framework
- Analytics dashboard structure
- Exportable data views (planned enhancement)

---

## 🗄️ Database Schema

Built on Supabase PostgreSQL with the following tables:

### Core Tables
- **members** - Primary member records
- **joint_members** - Joint membership details
- **children** - Dependent information
- **next_of_kin** - Emergency contacts
- **gp_details** - Medical practitioner information
- **medical_info** - Health declarations

### Financial Tables
- **payments** - Transaction records
- **fee_structure** - Age-based pricing

### Deceased Management Tables
- **deceased** - Deceased member records
- **funeral_details** - Burial information
- **funeral_contacts** - Family contacts
- **funeral_expenses** - Itemised costs
- **funeral_payments** - Contributions

### Administrative Tables
- **documents** - File attachments
- **declarations** - Terms acceptance records
- **activity_log** - Automatic audit trail with triggers

All tables include Row Level Security (RLS) policies for data protection.

---

## 🚀 Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TanStack Query (React Query)** - Server state management
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication
  - Row Level Security
  - Real-time subscriptions
  - Database triggers for activity logging
  - RESTful API

### Developer Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Git** - Version control with automatic version incrementing

---

## 📱 Key Workflows

### Member Registration
1. Start application (single or joint membership)
2. Enter personal details
3. Add joint member (if applicable)
4. Register children
5. Provide next of kin information
6. Add GP details
7. Complete medical declarations
8. Upload supporting documents
9. Accept terms and conditions
10. Review fees and submit

**Progress can be saved at any step and resumed later.**

### Member Detail Management
1. Select member from list or dashboard
2. Navigate through 10 information tabs via sub-sidebar
3. View or edit any information section
4. Add children, emergency contacts, or medical info via premium modals
5. Track complete payment and activity history
6. Perform actions (edit, pause, delete) from header buttons

### Payment Processing
1. Select member from dashboard
2. Navigate to payments tab
3. Record payment details
4. System calculates fees based on age
5. Generate receipt (planned)
6. Track payment status
7. Monitor renewals

### Deceased Member Management
1. Mark member as deceased from member detail page
2. Navigate to Deceased Members section
3. Create funeral record
4. Add family contacts
5. Track expenses and payments
6. Upload required documents
7. View complete audit trail

### Membership Renewal
1. System identifies members approaching anniversary
2. Dashboard displays upcoming renewals (30-day window)
3. Committee contacts member
4. Process renewal payment
5. Update member status

---

## 🎯 Planned Features

### Phase 2 (Q1 2025)
- [ ] Record Death Form (quick workflow to create funeral records)
- [ ] User authentication with role-based access control
- [ ] Document upload and storage integration
- [ ] PDF receipt generation
- [ ] Email notifications for renewals
- [ ] SMS reminders (via Twilio integration)
- [ ] Advanced reporting and analytics
- [ ] Export to CSV/Excel
- [ ] Bulk operations (mass email, status updates)
- [ ] Payment reminders automation

### Phase 3 (Q2 2025)
- [ ] Multi-language support (Arabic, Urdu)
- [ ] Mobile app (React Native)
- [ ] WhatsApp integration for notifications
- [ ] Advanced search with filters
- [ ] Multi-user role system (Admin, Treasurer, Volunteer)
- [ ] Donation tracking module
- [ ] Automated backup system

### Future Considerations
- [ ] Integration with mosque management systems
- [ ] Event management (funeral arrangements)
- [ ] Volunteer scheduling
- [ ] Inventory tracking (burial supplies)
- [ ] Financial reporting for audits
- [ ] API for third-party integrations

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/CRMFS.git
   cd CRMFS
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Create .env file
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

### Database Setup

1. Create a Supabase project  
2. Run the provided SQL schema (see `/supabase` directory)  
3. Configure Row Level Security policies  
4. Set up authentication provider  
5. Run activity log trigger creation script
6. Update environment variables  

---

## 🎨 Customisation

### Branding
The system uses Falkirk Central Mosque's colour scheme:
- **Primary:** Emerald Green (#10b981) - Islamic tradition
- **Secondary:** Gold (#eab308) - Accent colour
- **Font:** Poppins - Modern, readable typography

### Theme Modification
1. **Font**: Update `src/index.css` and `tailwind.config.js`
2. **Colours**: Find & replace colour classes (e.g., `emerald` → `blue`)
3. **Logo**: Replace in `src/components/Layout.tsx`

See `STYLING_GUIDE.md` for detailed instructions.

---

## 📊 Project Metrics

- **Total Components:** 35+
- **Database Tables:** 15
- **Lines of Code:** ~20,000
- **Pages:** 12
- **API Endpoints:** 60+ (via Supabase)
- **Member Detail Tabs:** 10
- **Deceased Detail Tabs:** 7
- **Test Coverage:** TBD

---

## 🤝 Contributing

This is a private project developed by Kelpie AI for Falkirk Central Mosque. For enquiries about similar projects or custom development:

**Contact:** [Kelpie AI](https://kelpieai.co.uk)  
**Email:** info@kelpieai.co.uk  
**Phone:** +447984 058973  
**Location:** Falkirk, Scotland

---

## 📄 Licence

This project is proprietary software developed for Falkirk Central Mosque. All rights reserved.

Unauthorised copying, modification, distribution, or use of this software is strictly prohibited without explicit written permission from Kelpie AI.

---

## 🙏 Acknowledgements

- **Falkirk Central Mosque** - For the opportunity and requirements  
- **Central Region Muslim Funeral Service** - For subject matter expertise  
- **Supabase** - For the excellent backend platform  
- **React Community** - For the robust ecosystem  

---

## 📞 Support

For technical support or feature requests:
- Open an issue in this repository  
- Contact Kelpie AI: info@kelpieai.co.uk  
- Visit: [kelpieai.co.uk](https://kelpieai.co.uk)

---

## 🔒 Security

This system handles sensitive personal data. Security measures include:
- Encrypted data at rest and in transit
- Row Level Security on all database tables
- Secure authentication with Supabase Auth
- Environment variable protection
- Automatic activity logging for audit compliance
- Regular security audits
- GDPR compliance considerations

**Report security vulnerabilities to:** info@kelpieai.co.uk

---

## 📈 Version History

### v0.1.6.3 (Current - 26 December 2024)
- **Major UI/UX Overhaul:**
  - Implemented Supabase-style collapsible navigation (64px collapsed, 256px expanded)
  - Smooth hover-to-expand animations with fixed icon positions
  - Mobile hamburger menu with overlay
  - Proper content padding (32px top, responsive)
- **Member Detail Page Redesign:**
  - Complete rebuild with modern sub-navigation sidebar (224px compact)
  - 10 fully functional tabs with premium UX
  - Compact header (single line, no redundant info)
  - Quick info bar with 4 stat cards
  - Two-column layouts for efficient space usage
  - Professional card-based design with consistent spacing
- **Premium CRUD Modals:**
  - Children management (add/edit/delete with validation)
  - Next of Kin management (emergency contacts)
  - Medical Info management (conditions/allergies/medications)
  - Professional form validation with inline errors
  - Auto-focus, keyboard shortcuts, loading states
  - Smooth fade-in animations
  - Date pickers and dropdowns for constrained values
- **Activity Logging System:**
  - Automatic database triggers on all tables
  - Complete audit trail with timeline view
  - Colour-coded action types with icons
  - Relative timestamps ("2 hours ago")
  - Statistics cards and expandable details
  - Tracks: member updates, payments, status changes, deceased records
- **Payments Tab Enhancement:**
  - Summary cards (Total Paid, Pending, Transaction Count)
  - Improved payment history list with status badges
  - Hover effects and better visual hierarchy
- **Deceased Member System:**
  - Complete funeral management with 7 information tabs
  - Family contact tracking
  - Expense and payment management
  - Document tracking for certificates
  - Activity logging
- **Visual Polish:**
  - Consistent emerald green theme throughout
  - Professional Poppins typography
  - Smooth transitions (200ms duration standard)
  - Information-dense layouts without clutter
  - Empty states with helpful guidance
  - Loading states everywhere
  - Proper spacing and visual hierarchy

### v0.1.5 (24 December 2024)
- Complete member registration wizard
- Payment management system
- Dashboard with analytics
- Late payment tracking
- Upcoming renewals widget
- Member action buttons (pause, deceased, delete)
- Responsive mobile design
- Toast notifications and UX polish

### v0.1.4 (22 December 2024)
- Initial MVP release
- Basic CRUD operations
- Authentication system
- Database schema implementation

---

## 🎯 Goals

**Mission:** Modernise and streamline the administrative operations of Central Region Muslim Funeral Service, enabling the committee to focus on serving the community rather than managing paperwork.

**Vision:** A fully integrated, automated system that handles member lifecycle management, financial tracking, and community engagement—setting the standard for mosque administrative systems in Scotland.

---

**Built with ❤️ in Falkirk, Scotland by [Kelpie AI](https://kelpieai.co.uk)**

*Proving Scotland can dominate technology, one project at a time.*