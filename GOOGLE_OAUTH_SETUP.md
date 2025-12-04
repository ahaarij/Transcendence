# Google OAuth Setup Guide

## Overview
Your login and register pages now support Google Sign-In! Users can either:
- Sign in with email/password (traditional)
- Sign in with Google (OAuth)

## Setup Instructions

### 1. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized JavaScript origins:
     - `http://localhost:8080` (for development)
     - Your production domain
   - Add authorized redirect URIs:
     - `http://localhost:8080` (for development)
     - Your production domain
   - Click "Create"

5. Copy the **Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)

### 2. Configure Backend

Edit `/srcs/backend/.env`:
```env
GOOGLE_CLIENT_ID="YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com"
```

### 3. Configure Frontend

Edit `/srcs/frontend/srcs/config.ts`:
```typescript
export const config = {
    GOOGLE_CLIENT_ID: 'YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com',
    API_BASE_URL: 'http://localhost:3000'
};
```

**Important:** Use the **same** Google Client ID in both backend and frontend!

### 4. Rebuild and Test

```bash
# Stop containers if running
make down

# Rebuild and start
make up

# Or for development mode
cd srcs/backend
docker-compose -f docker-compose.dev.yml up --build
```

## How It Works

### Login Page
- Users see traditional email/password form
- Below that, an "OR" divider
- Google Sign-In button appears automatically
- Clicking Google button opens Google's OAuth popup
- After successful authentication, user is logged in and redirected to `/home`

### Register Page
- Same flow as login
- New users automatically get created in your database
- Existing users with same email get their account linked to Google

### Backend Flow
1. Frontend receives Google ID token from Google
2. Sends token to `/auth/google` endpoint
3. Backend verifies token with Google
4. Creates new user OR links existing user
5. Returns JWT access token and refresh token
6. Frontend stores token and redirects to home

## Features

✅ Traditional email/password login
✅ Google OAuth login
✅ Automatic user creation for new Google users
✅ Account linking for existing users
✅ Secure JWT token handling
✅ Responsive design with Tailwind CSS

## Testing

1. **Test traditional login:** Use email/password as before
2. **Test Google login:** 
   - Click "Sign in with Google" button
   - Choose a Google account
   - Grant permissions
   - Should redirect to home page automatically

## Troubleshooting

### "Invalid client ID" error
- Check that `GOOGLE_CLIENT_ID` matches in both backend `.env` and frontend `config.ts`
- Ensure you copied the full Client ID from Google Cloud Console

### Google button doesn't appear
- Check browser console for errors
- Verify Google Sign-In script is loading (`https://accounts.google.com/gsi/client`)
- Make sure `config.ts` has valid Client ID

### "Unauthorized origins" error
- Add your domain to "Authorized JavaScript origins" in Google Cloud Console
- For local development, use `http://localhost:8080`

### Backend can't verify token
- Ensure backend has `GOOGLE_CLIENT_ID` in `.env`
- Check that `google-auth-library` npm package is installed
- Restart backend after changing `.env` file

## Security Notes

- Never commit your actual Google Client ID to public repositories
- Use environment variables for production
- Google users don't have passwords in your database (password field is `null`)
- Refresh tokens are hashed before storing in database
- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days

## Files Modified

### Frontend
- `/srcs/frontend/index.html` - Added Google Sign-In script
- `/srcs/frontend/srcs/pages/login.ts` - Added Google button and handler
- `/srcs/frontend/srcs/pages/register.ts` - Added Google button and handler
- `/srcs/frontend/srcs/api/auth.ts` - Added `googleAuthRequest` function
- `/srcs/frontend/srcs/config.ts` - Created configuration file

### Backend
- `/srcs/backend/auth/src/main.ts` - Already has `/auth/google` endpoint
- `/srcs/backend/.env` - Configure `GOOGLE_CLIENT_ID` here

## Next Steps

1. Get your Google Client ID from Google Cloud Console
2. Update both backend `.env` and frontend `config.ts`
3. Rebuild your containers
4. Test both traditional and Google login flows
5. Add more styling/branding to the Google button if desired

Need help? Check the [Google Identity documentation](https://developers.google.com/identity/gsi/web/guides/overview)
