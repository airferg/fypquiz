# Google OAuth Setup Guide

## Prerequisites
- A Google Cloud Console account
- Your Supabase project configured

## Step 1: Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (if not already enabled)
4. Go to "Credentials" in the left sidebar
5. Click "Create Credentials" → "OAuth 2.0 Client IDs"
6. Choose "Web application" as the application type
7. Add your authorized redirect URIs:
   - For development: `http://localhost:3000/auth/callback`
   - For production: `https://yourdomain.com/auth/callback`

## Step 2: Configure Supabase

1. Go to your Supabase project dashboard
2. Navigate to Authentication → Settings → Auth Providers
3. Enable Google provider
4. Add your Google OAuth credentials:
   - Client ID: Your Google OAuth client ID
   - Client Secret: Your Google OAuth client secret

## Step 3: Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Google OAuth (Optional - for additional features)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

## Step 4: Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to `/auth`
3. Click "Continue with Google"
4. Complete the OAuth flow

## Troubleshooting

### Common Issues:

1. **"Invalid redirect URI" error**
   - Make sure your redirect URI in Google Cloud Console matches exactly
   - Check that your Supabase redirect URL is correct

2. **"Client ID not found" error**
   - Verify your Google OAuth credentials are correct
   - Check that the Google provider is enabled in Supabase

3. **"OAuth provider not configured" error**
   - Ensure Google provider is enabled in Supabase Auth settings
   - Verify your client ID and secret are correctly entered

### Development vs Production:

- **Development**: Use `http://localhost:3000/auth/callback`
- **Production**: Use `https://yourdomain.com/auth/callback`

Make sure to update both Google Cloud Console and Supabase settings when deploying to production.

## Security Notes

- Never commit your client secret to version control
- Use environment variables for all sensitive credentials
- Regularly rotate your OAuth credentials
- Monitor your OAuth usage in Google Cloud Console 