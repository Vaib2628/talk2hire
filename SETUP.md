# Setup Instructions

## Firebase Configuration

To use Firebase authentication and database features, you need to set up your environment variables.

### Step 1: Get Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Click the gear icon ⚙️ next to "Project Overview"
4. Select "Project settings"
5. Scroll down to "Your apps" section
6. Click on the Web icon `</>` to add a web app (if you haven't already)
7. Copy the Firebase configuration values

### Step 2: Create Environment File

1. Create a file named `.env.local` in the root of your project (same level as `package.json`)
2. Copy the contents from `env.example` to `.env.local`
3. Replace the placeholder values with your actual Firebase configuration:

```env
# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Step 3: Firebase Admin Setup (for server-side operations)

For server-side operations, you also need Firebase Admin credentials:

1. In Firebase Console, go to Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Copy the values to your `.env.local`:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_private_key_here\n-----END PRIVATE KEY-----\n"
```

**Important:** 
- Keep the quotes around the private key
- Keep the `\n` characters in the private key
- Never commit `.env.local` to git (it's already in `.gitignore`)

### Step 4: Clear Cache and Restart Development Server

**CRITICAL:** After adding/changing environment variables, you **must**:

1. **Stop the development server** (Press `Ctrl+C` in the terminal)

2. **Clear the Next.js cache** (this is important!):
   ```bash
   # Windows (PowerShell)
   Remove-Item -Recurse -Force .next
   
   # Windows (CMD)
   rmdir /s /q .next
   
   # Mac/Linux
   rm -rf .next
   ```

3. **Restart the development server**:
   ```bash
   npm run dev
   ```

**Why?** Next.js caches environment variables. If you don't clear the cache, it will keep using old (missing) values!

### Step 5: Enable Firebase Services

In Firebase Console, make sure you've enabled:

1. **Authentication**: 
   - Go to Authentication → Sign-in method
   - Enable "Email/Password"

2. **Firestore Database**:
   - Go to Firestore Database
   - Create database (start in test mode for development)

## Vapi Configuration (Optional)

If you want to use the AI interview features:

1. Get your Vapi Web SDK Token from: https://dashboard.vapi.ai/settings/api-keys
2. Get your Assistant ID from: https://dashboard.vapi.ai/assistants
3. Add to `.env.local`:

```env
NEXT_PUBLIC_VAPI_WEB_TOKEN=your_vapi_web_token_here
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_assistant_id_here
```

## Troubleshooting

### "Firebase configuration is missing" or "invalid-api-key" errors

**If you see Firebase errors after setting up:**

1. **Verify `.env.local` exists and is in the project root** (same folder as `package.json`)

2. **Check your environment variables are correct:**
   - Open `.env.local`
   - Make sure all `NEXT_PUBLIC_FIREBASE_*` variables are set
   - No quotes around values (unless the value itself contains quotes)
   - No extra spaces before/after the `=` sign

3. **Clear Next.js cache and restart:**
   ```bash
   # Stop server (Ctrl+C)
   # Delete .next folder
   rm -rf .next  # or rmdir /s /q .next on Windows
   # Restart
   npm run dev
   ```

4. **Verify Firebase credentials:**
   - Go to Firebase Console → Project Settings
   - Make sure you copied the values from the correct project
   - Check that the API key is not restricted (for development)

5. **Check browser console:**
   - Open browser DevTools (F12)
   - Look for specific error messages
   - The warning should tell you which variables are missing

### Still getting errors?

- Make sure `.env.local` is in `.gitignore` (it should be)
- Check that you're using `NEXT_PUBLIC_` prefix for client-side variables
- Verify your Firebase project has Authentication and Firestore enabled
- Try creating a fresh `.env.local` file and copying values again

### Firebase still not working after setup

1. Verify your Firebase config values are correct
2. Check browser console for specific error messages
3. Make sure Firebase services (Auth, Firestore) are enabled in Firebase Console
4. Ensure your Firebase project billing is enabled (required for some features)

