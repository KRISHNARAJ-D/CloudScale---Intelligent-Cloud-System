# CloudScale - Intelligent Cloud Management System

CloudScale is a comprehensive, modern Next.js application designed to help businesses manage, analyze, and monitor their cloud infrastructure efficiently. Built with the latest tech stack, it provides real-time insights, billing management, and team collaboration features.

## 🚀 Key Features

- **Robust Authentication**: Secure user login and management powered by Clerk.
- **Database & Backend**: Real-time data sync and secure storage with Supabase.
- **Interactive Dashboards**: Beautiful data visualization using Recharts.
- **Cloud Monitoring Integration**: Direct integration with AWS CloudWatch for infrastructure monitoring.
- **Payments & Billing**: Seamless subscription and billing management via Stripe.
- **Data Export**: Export analyses to PDF (using jsPDF & html2canvas) and parse CSV data (using PapaParse).
- **Beautiful UI/UX**: Styled with Tailwind CSS, built with Headless UI components, and animated using Framer Motion.
- **Comprehensive Analytics**: Usage tracking and error monitoring with PostHog, Vercel Analytics, and Sentry.
- **Webhook Handling**: Secure webhook processing powered by Svix.

## 💻 Tech Stack

- **Framework**: Next.js 16 (App Router), React 19
- **Styling**: Tailwind CSS, Headless UI, Lucide React
- **Authentication**: Clerk
- **Database**: Supabase
- **Payments**: Stripe
- **Analytics & Error Tracking**: Vercel Analytics, Vercel Speed Insights, PostHog, Sentry
- **Charts & Animations**: Recharts, Framer Motion

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm, yarn, or pnpm
- Valid API keys for Clerk, Supabase, Sentry, Stripe, etc.

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd intelligent-cloud-management
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory and configure the necessary keys for your services (Clerk, Supabase, Stripe, etc.).

4. **Run the development server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the app running.

## 📦 Available Scripts

- `npm run dev` - Starts the development server.
- `npm run build` - Builds the application for production deployment.
- `npm run start` - Starts the production server.
- `npm run lint` - Lints the codebase using Next.js ESLint configuration.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📄 License

This project is open-source and available under the MIT License.
