# Mid-States Analytics Platform - Setup Guide

## Overview
This is a comprehensive 13 Week Report Analytics Platform with the following features:
- Microsoft OAuth authentication via Firebase
- Excel file upload and parsing
- Interactive analytics dashboard with charts
- AI-powered insights using Claude
- Role-based access control (Admin/User)
- Sheet-level permissions management
- Cloud storage for data persistence

## Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui components
- **Authentication**: Firebase Auth (Microsoft OAuth)
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Charts**: Recharts
- **Excel Parsing**: xlsx library
- **AI**: Anthropic Claude API
- **Routing**: React Router v6

## Prerequisites
- Node.js 18+ installed
- Firebase account (free tier works)
- Microsoft Azure App Registration (for OAuth)
- Anthropic API key (optional, for AI insights)

## Firebase Setup

### 1. Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Name it "mid-states-analytics" (or your choice)
4. Enable Google Analytics (optional)

### 2. Enable Authentication
1. In Firebase Console, go to Authentication > Sign-in method
2. Enable "Microsoft" provider
3. You'll need to create a Microsoft Azure App Registration:
   - Go to https://portal.azure.com/
   - Navigate to "Azure Active Directory" > "App registrations" > "New registration"
   - Name: "Mid-States Analytics"
   - Supported account types: "Accounts in any organizational directory"
   - Redirect URI: Copy the redirect URI from Firebase Console
   - After creation, go to "Certificates & secrets" > Create a client secret
   - Copy the Application (client) ID and Client secret value
4. Back in Firebase, paste the Application ID and Application secret
5. Enable the Microsoft sign-in method

### 3. Create Firestore Database
1. In Firebase Console, go to Firestore Database
2. Click "Create database"
3. Start in "production mode"
4. Choose a location close to your users
5. After creation, go to "Rules" and update to:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId || 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Reports collection
    match /reports/{reportId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow update, delete: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### 4. Setup Storage
1. In Firebase Console, go to Storage
2. Click "Get started"
3. Start in "production mode"
4. After creation, go to "Rules" and update to:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /reports/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                     request.resource.size < 50 * 1024 * 1024; // 50MB limit
    }
  }
}
```

### 5. Get Firebase Config
1. Go to Project Settings (gear icon) > General
2. Scroll to "Your apps" and click the web icon (</>)
3. Register app (name it "Mid-States Analytics")
4. Copy the firebaseConfig object
5. Update `src/lib/firebase.ts` with your config

## Local Development Setup

### 1. Install Dependencies
```bash
cd weekly-report-analytics
pnpm install
```

### 2. Configure Firebase
Edit `src/lib/firebase.ts` and replace the placeholder config with your Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 3. Run Development Server
```bash
pnpm dev
```

The app will be available at http://localhost:5173

## First Login & Admin Setup

### 1. Sign in for the First Time
1. Open the app and click "Sign in with Microsoft"
2. Complete the Microsoft authentication flow
3. You'll be logged in as a regular "user" initially

### 2. Make Yourself Admin
Since there's no UI to make the first admin, you'll need to manually update Firestore:

1. Go to Firebase Console > Firestore Database
2. Find the "users" collection
3. Find your user document (use your email to identify it)
4. Edit the document and change `role` from "user" to "admin"
5. Refresh the app

Now you'll see the Upload and Admin menu items!

### 3. Add Your First Report
1. Click "Upload" in the navigation
2. Select a 13 Week Report Excel file
3. The app will parse and store it automatically
4. The data will be available in the Dashboard

### 4. Manage Users (Admin Panel)
1. Click "Admin" in the navigation
2. You'll see all users who have signed in
3. For each user, you can:
   - Change their role (Admin/User)
   - Assign specific sheets they can access
   - Admins have access to all sheets automatically

## Sheet Permission Examples

**Example 1: Myriah (Market VP of Wisconsin and Chicago)**
1. Go to Admin Panel > Users tab
2. Find Myriah's user entry
3. Click "Edit Sheets"
4. Select the following sheets:
   - Wisconsin and Chicago Area
   - Wisconsin Area
   - All Wisconsin-specific cost centers (PRONAS, Milwaukee, etc.)
   - Chicago Area
   - All Chicago cost centers (Bolingbrook, Elk Grove Village, etc.)
5. Click "Save Changes"

Now Myriah will only see these sheets in the Dashboard and Insights pages.

**Example 2: Cost Center Manager**
Only grant access to their specific cost center(s).

## Using the Application

### Dashboard
- **View Metrics**: See key performance indicators (AOA, Revenue, GP, GP%)
- **Filter Data**: Select different reports and cost centers
- **Analyze Trends**: View 13-week trends in revenue, GP, and staffing
- **Compare Periods**: See week-over-week and year-over-year changes

### AI Insights
- **Auto Insights**: Automatically generated observations about significant changes
- **Ask Questions**: Type natural language questions about the data
- **Get Recommendations**: Ask for actionable insights and suggestions

Example questions:
- "Why did gross profit percentage drop this week?"
- "What's driving the AOA changes?"
- "How does this week compare to the 13-week average?"
- "What should I focus on to improve margins?"

### Upload (Admin Only)
- Upload new weekly reports as they become available
- The system automatically parses all sheets and stores the data
- Historical data is retained for trend analysis

### Admin Panel (Admin Only)
- **Users**: Manage user roles and permissions
- **Sheet Management**: View all available cost centers
- **Settings**: View system statistics

## Deployment

### Option 1: Firebase Hosting (Recommended)
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
   - Select your Firebase project
   - Public directory: `dist`
   - Single-page app: Yes
   - GitHub auto-deploy: No (optional)
4. Build the app: `pnpm build`
5. Deploy: `firebase deploy --only hosting`

Your app will be live at: `https://YOUR_PROJECT_ID.web.app`

### Option 2: Vercel
1. Connect your GitHub repo to Vercel
2. Set build command: `pnpm build`
3. Set output directory: `dist`
4. Deploy automatically on push

### Option 3: Netlify
1. Connect your GitHub repo to Netlify
2. Set build command: `pnpm build`
3. Set publish directory: `dist`
4. Deploy automatically on push

## Cost Estimates

### Firebase Free Tier (Spark Plan)
- **Firestore**: 1 GB storage, 50K reads/day, 20K writes/day
- **Storage**: 5 GB, 1 GB downloads/day
- **Authentication**: Unlimited users
- **Hosting**: 10 GB storage, 360 MB/day transfer

**Estimated usage for your team (~10-20 users):**
- Reports: ~50 MB/year of storage
- Database: ~100 MB for all data
- Reads/Writes: ~5K per day
- **Cost: FREE** (well within limits)

### Anthropic API (AI Insights)
- Pay-as-you-go pricing
- Claude Sonnet: $3 per million input tokens
- Estimated cost: $5-10/month for moderate usage

**Total Monthly Cost: ~$5-10** (just the AI, everything else is free)

## Security Best Practices

1. **Environment Variables**: Never commit Firebase config to public repos
2. **Firestore Rules**: Already configured for role-based access
3. **Storage Rules**: Configured to require authentication
4. **API Keys**: Keep Anthropic API key secure (use environment variables)

## Troubleshooting

### Issue: "Can't sign in with Microsoft"
- Check that Microsoft provider is enabled in Firebase
- Verify Azure App Registration is configured correctly
- Check redirect URI matches
- If you're developing on a remote dev host (Codespaces, GitHub.dev, etc.) or a non-standard origin, add that host to **Firebase Console → Authentication → Settings → Authorized domains** (for example: `zany-telegram-97gg5wpgprrxf9vw9-5173.app.github.dev`) and add the matching redirect URI to Azure App Registration (e.g. `https://<host>/__/auth/handler`). This prevents the "App domain is unauthorized" error.

### Issue: "Can't upload files"
- Verify you're logged in as an admin
- Check Firestore and Storage rules
- Verify Firebase Storage is enabled

### Issue: "No data showing in Dashboard"
- Upload at least one report first
- Check that you have permission to view the selected sheet
- Verify Firestore rules allow reads

### Issue: "AI Insights not working"
- The Anthropic API integration is there, but requires proper API key handling
- For production, you'll want to create a backend function to keep the API key secure

## Support

For issues or questions:
1. Check the Firebase Console for error logs
2. Check the browser console for JavaScript errors
3. Review Firestore and Storage rules
4. Verify user permissions in the Admin panel

## Future Enhancements

Potential additions you might want to consider:
- Email notifications for significant changes
- Scheduled report generation
- Mobile app (React Native)
- Bulk user import/export
- Custom report templates
- Data export to Excel/PDF
- Advanced forecasting models
- Integration with other staffing systems
