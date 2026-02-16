# School Lost & Found — FBLA Website Coding & Development

> A secure, accessible, and fully functional School Lost & Found web application designed to help students and staff report, browse, and recover lost items.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Getting Started](#getting-started)
5. [Project Structure](#project-structure)
6. [Database Schema](#database-schema)
7. [Accessibility](#accessibility)
8. [Security](#security)
9. [License](#license)

---

## Overview

This application was built for the **FBLA Website Coding & Development** event. It solves a real problem in schools: reuniting students and staff with lost belongings through a modern, secure, and accessible web platform.

Key design principles:
- **Accessibility First** — WCAG 2.1 AA compliant with semantic HTML, keyboard navigation, and 4.5:1+ contrast ratios
- **Security by Design** — Email obfuscation, security questions for claims, and admin-gated approval
- **Modern UX** — Smooth animations, multi-step forms, fuzzy search, and responsive layouts

---

## Features

### For Students & Staff
- **Report Lost/Found Items** — A 4-step guided wizard with:
  - Category and type selection
  - Date, time, and location details
  - Drag-and-drop photo upload with preview
  - Email contact (displayed obfuscated for privacy)
  - Security question for ownership verification
- **Browse All Items** — Grid layout with:
  - Real-time fuzzy search (searches title + description)
  - Multi-criteria filtering (Lost/Found, Category)
  - Loading skeletons and empty states
- **Claim Items** — Security-verified claim flow:
  - Users must answer a unique security question
  - Claims are queued for admin review

### For Administrators
- **Protected Dashboard** — Login-gated admin panel with:
  - Items data table (Approve, Delete, Mark Returned)
  - Claims review table (Approve/Deny)
  - Analytics charts (Bar + Pie) showing item distribution
- **Data Visualization** — Recharts-powered analytics showing lost vs. found vs. returned items

### Landing Page
- Hero section with dual CTA buttons ("I Lost Something" / "I Found Something")
- Live statistics ticker
- Recent activity feed
- "How It Works" explainer section

---

## Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 14** (App Router) | React framework with SSR/SSG, routing, and TypeScript |
| **TypeScript** | Type-safe code, catching bugs at compile time |
| **Tailwind CSS** | Utility-first styling with custom design system |
| **shadcn/ui** | Pre-built accessible UI components |
| **Supabase** | PostgreSQL database, Storage, and Row-Level Security |
| **React Hook Form** | Performant form state management |
| **Zod** | Runtime schema validation matching TypeScript types |
| **Framer Motion** | Smooth entrance/exit animations |
| **Fuse.js** | Client-side fuzzy search algorithm |
| **Recharts** | Data visualization (bar and pie charts) |
| **Lucide React** | Consistent iconography |

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- A [Supabase](https://supabase.com) account (free tier works)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/lost-and-found-fbla-website.git
cd lost-and-found-fbla-website
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Supabase
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase-schema.sql`
3. Go to **Storage** → Create a new bucket called `item-images` (set to **Public**)
4. Copy your project URL and anon key from **Settings → API**

### 4. Configure Environment Variables
```bash
cp .env.local.example .env.local
```
Edit `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Admin Login
- Username: `admin`
- Password: `admin123`

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout (NavBar, Footer, fonts)
│   ├── page.tsx            # Landing page
│   ├── report/page.tsx     # Multi-step report wizard
│   ├── browse/page.tsx     # Item browse grid with search/filter
│   ├── items/[id]/page.tsx # Individual item detail + claim
│   └── admin/page.tsx      # Admin dashboard
├── components/             # Reusable React components
│   ├── NavBar.tsx           # Responsive navigation bar
│   ├── Footer.tsx           # Site footer with accessibility statement
│   ├── ItemCard.tsx         # Item display card for grids
│   ├── FileUpload.tsx       # Drag & drop image upload
│   ├── ClaimModal.tsx       # Item claim dialog with security question
│   └── ui/                  # shadcn/ui primitives
├── lib/                    # Shared utilities
│   ├── supabase.ts         # Supabase client singleton
│   ├── actions.ts          # Database helper functions
│   ├── types.ts            # TypeScript types & Zod schemas
│   └── utils.ts            # shadcn/ui utility (cn)
└── globals.css             # Design system CSS variables
```

---

## Database Schema

### `items` table
| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `title` | TEXT | Item name |
| `description` | TEXT | Detailed description |
| `category` | TEXT | electronics, clothing, books, accessories, sports, other |
| `type` | TEXT | lost or found |
| `location` | TEXT | Where the item was lost/found |
| `date_occurred` | DATE | When it was lost/found |
| `time_occurred` | TEXT | Approximate time |
| `contact_email` | TEXT | Reporter's email (displayed obfuscated) |
| `image_url` | TEXT | URL to uploaded photo (nullable) |
| `status` | TEXT | pending, approved, or returned |
| `security_answer` | TEXT | Answer to the ownership verification question |
| `created_at` | TIMESTAMP | When the report was submitted |

### `claims` table
| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `item_id` | UUID | Foreign key → items.id |
| `claimant_name` | TEXT | Name of the person claiming |
| `claimant_email` | TEXT | Claimant's email |
| `security_answer` | TEXT | Their answer to the security question |
| `status` | TEXT | pending, approved, or denied |
| `created_at` | TIMESTAMP | When the claim was submitted |

---

## Accessibility

This application is built to meet **WCAG 2.1 AA** standards:

- ✅ **Semantic HTML**: Uses `<main>`, `<nav>`, `<header>`, `<footer>`, `<section>`, `<article>` elements
- ✅ **Keyboard Navigation**: All interactive elements are focusable via Tab; custom focus ring styles
- ✅ **Skip-to-Content Link**: Allows keyboard users to bypass navigation
- ✅ **ARIA Attributes**: Forms use `aria-describedby` for errors, buttons use `aria-expanded`, `aria-pressed`, `aria-label`
- ✅ **Dynamic Alt Text**: Image alt text is generated from item title, type, and category
- ✅ **Color Contrast**: All text exceeds 4.5:1 contrast ratio against backgrounds
- ✅ **Error Announcements**: Form errors use `role="alert"` for screen reader announcement
- ✅ **Responsive Design**: Fully functional on mobile, tablet, and desktop

---

## Security

- **Email Obfuscation**: Contact emails are partially hidden (e.g., `j*****e@school.edu`)
- **Security Questions**: Claimants must answer "What is a unique identifying mark?" to prevent theft
- **Admin Review Gate**: All items start as "pending" and require admin approval before public display
- **Claim Review**: All claims are queued for admin verification before being approved
- **Session-Based Auth**: Admin sessions use `sessionStorage` (cleared when browser tab closes)
- **Row-Level Security**: Supabase RLS policies restrict database access

---

## License

This project was created for the **FBLA Website Coding & Development** competitive event. All rights reserved.

---

*Built with ❤️ for FBLA*
