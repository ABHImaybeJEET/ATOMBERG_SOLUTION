# 🚀 GoalTrack Go-Live Checklist & Deployment Guide

Your application is built and verified. Follow these steps to take **GoalTrack** live with a professional, production-ready setup.

## 1. Choose a Deployment Platform
For a Vite + React application, **Vercel** or **Netlify** are the industry standards.

### Option A: Vercel (Recommended)
1.  **Push code to GitHub**: Ensure your repository is up to date.
2.  **Import to Vercel**: Connect your GitHub account and select the `goaltrack` repository.
3.  **Environment Variables**: During the import, add these variables:
    *   `VITE_SUPABASE_URL`: Your production Supabase Project URL.
    *   `VITE_SUPABASE_ANON_KEY`: Your production Supabase Anon Key.
4.  **Deploy**: Vercel will automatically run `npm run build` and serve your site.

---

## 2. Supabase Production Hardening
Before traffic hits your site, ensure your database is secure:
1.  **Enable RLS**: Go to the Supabase Dashboard → Database → Replication/Policies. Ensure Row Level Security (RLS) is enabled for all tables.
2.  **Auth Redirects**: In Supabase Auth → URL Configuration, set the **Site URL** to your live domain (e.g., `https://goaltrack.vercel.app`).
3.  **Disable Signup (Optional)**: If you want to control who joins, disable "Allow new users to sign up" in Auth Settings. Use the Admin panel you built to invite users instead.

---

## 3. Final Production Build Check
You can run this locally to see exactly what will be deployed:
```bash
npm run build
npm run preview
```
This serves the minified, optimized production bundle on `http://localhost:4173`.

---

## 4. Post-Live Verification
Once the site is live, perform these "Smoke Tests":
*   **Login Flow**: Test Admin, Manager, and Employee credentials.
*   **Form Submission**: Create a goal sheet and ensure it saves (even if using mock fallback, check console for network errors).
*   **Responsive Check**: Open the URL on your phone to verify the mobile experience.
*   **Dark Mode**: Ensure the theme toggles correctly on the live domain.

---

## 🔑 Demo Credentials (for your Pitch)
Include these in your project description or README for reviewers:
*   **Admin**: `admin@goaltrack.com` / `Admin@123`
*   **Manager**: `manager1@goaltrack.com` / `Manager@123`
*   **Employee**: `employee1@goaltrack.com` / `Emp@123`
