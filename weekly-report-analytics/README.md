# Mid-States Analytics Platform

A comprehensive analytics platform for 13 Week Report management with AI-powered insights.

## Features

✅ **Microsoft OAuth Authentication** - Secure sign-in with Microsoft accounts  
✅ **Excel File Upload & Parsing** - Automatic parsing of 13 Week Reports  
✅ **Interactive Dashboard** - Real-time analytics with charts and trends  
✅ **AI-Powered Insights** - Natural language queries and automatic insights using Claude  
✅ **Role-Based Access Control** - Admin and User roles with granular permissions  
✅ **Sheet-Level Permissions** - Control which cost centers each user can access  
✅ **Cloud Storage** - Firebase backend for secure data persistence  
✅ **Historical Analysis** - Track and compare data over time  

## Quick Start

```bash
# Install dependencies
pnpm install

# Update Firebase config in src/lib/firebase.ts

# Run development server
pnpm dev
```

See **SETUP_GUIDE.md** for detailed setup instructions.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui
- **Auth**: Firebase Authentication (Microsoft OAuth)
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **AI**: Anthropic Claude API
- **Charts**: Recharts
- **Excel**: xlsx library

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   └── Navigation.tsx   # Main navigation component
├── lib/
│   ├── firebase.ts      # Firebase configuration
│   ├── auth.tsx         # Authentication context
│   └── parseExcel.ts    # Excel parsing utilities
├── pages/
│   ├── LoginPage.tsx    # Authentication page
│   ├── DashboardPage.tsx # Main analytics dashboard
│   ├── UploadPage.tsx   # File upload (admin only)
│   ├── AdminPage.tsx    # User & permission management
│   └── InsightsPage.tsx # AI-powered insights
└── App.tsx              # Main app component with routing
```

## License

Proprietary - Internal use only
