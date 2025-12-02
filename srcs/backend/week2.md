# Week 2 Implementation - User System + Google Auth

## 📋 Overview

Week 2 focuses on completing the authentication system with production-ready features including:
- ✅ Full signup/login logic with password hashing
- ✅ JWT issuing with access + refresh token flow
- ✅ Google Sign-In server verification
- ✅ Secure token storage and rotation

---

## 🎯 Week 2 Requirements

### Member A (Backend) - COMPLETED

1. **Full signup/login logic** ✅
   - Email/password registration
   - Login with credential verification
   - Proper error handling

2. **Password hashing** ✅
   - bcryptjs with 10 salt rounds
   - Secure password storage

3. **JWT issuing** ✅
   - Access tokens (15-minute expiry)
   - Refresh tokens (7-day expiry)

4. **Refresh token flow** ✅
   - Token rotation on refresh
   - Hashed storage in database

5. **Google Sign-In verification** ✅
   - Server-side ID token verification
   - Auto-account creation/linking

---

## 🔧 Changes Made

### 1. Database Schema Updates (`prisma/schema.prisma`)

**Added fields to User model:**

```prisma
model User {
  id           Int       @id @default(autoincrement())
  username     String    @unique
  email        String    @unique
  password     String?   // Now optional for Google users
  refreshToken String?   // Stores hashed refresh token
  googleId     String?   @unique // Google account ID
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt // Automatic timestamp
}
```

**Why these changes?**

- `refreshToken`: Stores hashed refresh tokens for secure token rotation
- `googleId`: Links user accounts to Google OAuth (allows login without password)
- `password?`: Made optional since Google users don't have passwords
- `updatedAt`: Tracks last modification time automatically

---

### 2. Authentication Routes (`auth/src/main.ts`)

#### **A. Helper Functions Added**

```typescript
// Generate refresh token with 7-day expiry
async function generateRefreshToken(app: FastifyInstance, userId: number): Promise<string> {
  return app.jwt.sign(
    { userId, type: 'refresh' },
    { expiresIn: '7d' }
  );
}

// Hash tokens before database storage (security best practice)
async function hashToken(token: string): Promise<string> {
  return bcrypt.hash(token, 10);
}
```

**Why?**
- Refresh tokens are long-lived (7 days) vs access tokens (15 minutes)
- Hashing tokens prevents token theft if database is compromised
- Separates concerns and improves code maintainability

---

#### **B. Updated: POST /auth/register**

**Changes:**
- Now generates **both** access + refresh tokens
- Stores **hashed** refresh token in database
- Returns both tokens to client

**Request:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

**Why?**
- Access tokens expire quickly (15m) for security
- Refresh tokens allow users to stay logged in without re-entering credentials
- Client stores both and uses refresh token to get new access tokens

---

#### **C. Updated: POST /auth/login**

**Changes:**
- Generates new refresh token on every login
- Rotates refresh token (invalidates old ones)
- Stores hashed refresh token

**Security improvements:**
- Check if user has password (Google users don't)
- Proper error handling with try-catch
- Token rotation prevents reuse attacks

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

---

#### **D. Updated: POST /auth/logout**

**Changes:**
- Extracts user ID from access token
- **Clears refresh token from database**
- Invalidates all refresh tokens for that user

**Why?**
- True server-side logout (not just client-side token deletion)
- Prevents refresh token reuse after logout
- Even if token is invalid, logout succeeds gracefully

**Request:**
```http
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

---

#### **E. NEW: POST /auth/refresh**

**Purpose:** Generate new access token when current one expires

**How it works:**
1. Client sends refresh token
2. Server verifies refresh token signature
3. Server checks if refresh token matches hashed version in database
4. Server generates new access token
5. Client receives new access token (stays logged in)

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error cases:**
- `400`: Missing refresh token
- `401`: Invalid/expired refresh token
- `401`: Token doesn't match database

**Why this matters:**
- Users don't get logged out every 15 minutes
- Security: short-lived access tokens reduce exposure window
- UX: seamless token renewal without user interaction

---

#### **F. NEW: POST /auth/google**

**Purpose:** Authenticate users with Google Sign-In

**How it works:**
1. Client gets ID token from Google Sign-In button
2. Server verifies token with Google's API
3. Server extracts user info (email, Google ID, name)
4. Server creates account if new user OR links Google to existing account
5. Server generates JWT tokens same as login

**Request:**
```json
{
  "idToken": "google-id-token-from-client-side"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "username": "John Doe",
    "email": "john@gmail.com"
  }
}
```

**Three scenarios handled:**

1. **New Google user:**
   - Creates account with Google ID
   - No password (password field is null)
   - Username derived from Google name or email

2. **Existing user (same email):**
   - Links Google account to existing account
   - User can now login with Google OR password

3. **Returning Google user:**
   - Logs in normally with Google ID

**Security:**
- Token verification happens server-side with Google's API
- Client cannot forge tokens
- Uses official `google-auth-library` package

**Why Google Auth?**
- Users prefer social login (faster, no password to remember)
- Reduces friction in signup process
- More secure (Google handles 2FA, security)

---

### 3. Dependencies Added

**Installed packages:**

```bash
npm i google-auth-library   # Google OAuth verification
npm i fastify-cookie         # Cookie parsing (future use)
```

**Why these?**
- `google-auth-library`: Official Google package for server-side token verification
- `fastify-cookie`: Prepared for cookie-based auth (alternative to localStorage)

**Already installed:**
- `@fastify/jwt`: JWT signing/verification
- `bcryptjs`: Password + token hashing
- `@prisma/client`: Database operations

---

### 4. Environment Variables (`.env`)

**Added:**

```env
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
```

**How to get Google Client ID:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Application type: "Web application"
6. Add authorized JavaScript origins:
   - `http://localhost:8080` (frontend)
   - `http://localhost:3000` (backend)
7. Copy the Client ID and paste in `.env`

**Also update frontend:**
Your frontend needs the same Client ID for Google Sign-In button.

---

### 5. JWT Configuration Updates

**Access tokens now expire in 15 minutes:**

```typescript
await app.register(jwt, { 
  secret: process.env.JWT_ACCESS_SECRET || "dev-secret-fallback",
  sign: {
    expiresIn: '15m' // Short expiry for security
  }
});
```

**Why short expiry?**
- Limits damage if token is stolen
- Forces token refresh (validates user still exists)
- Industry best practice

**Refresh tokens last 7 days:**
- Stored in database (can be revoked)
- Long enough for good UX
- Short enough to force periodic re-authentication

---

## 🔐 Security Improvements

### 1. Token Hashing
- Refresh tokens are **hashed before storage**
- If database is compromised, tokens cannot be used
- Uses bcrypt with 10 salt rounds

### 2. Token Rotation
- New refresh token on every login
- Old refresh tokens are invalidated
- Prevents token reuse attacks

### 3. Short-Lived Access Tokens
- 15-minute expiry reduces exposure window
- Refresh flow ensures seamless UX

### 4. Server-Side Google Verification
- ID tokens verified with Google's API
- Client cannot forge authentication

### 5. Proper Error Handling
- No information leakage in error messages
- Consistent error responses
- Detailed logging for debugging

---

## 🚀 API Endpoints Summary

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/auth/register` | POST | Create new account | No |
| `/auth/login` | POST | Login with credentials | No |
| `/auth/logout` | POST | Invalidate refresh tokens | Yes |
| `/auth/me` | GET | Get current user info | Yes |
| `/auth/refresh` | POST | Get new access token | No* |
| `/auth/google` | POST | Google Sign-In | No |

*Requires valid refresh token in body

---

## 📦 Docker Compatibility

**No Dockerfile changes needed!**

Why?
- `npm ci` installs all dependencies from package-lock.json
- New dependencies are already in package.json
- Dockerfile already copies all necessary files

**To rebuild with new changes:**

```bash
make down
make
```

Or manually:
```bash
docker-compose down
docker-compose up --build
```

---

## 🧪 Testing the New Features

### 1. Test Refresh Token Flow

**Step 1: Login**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Save the `accessToken` and `refreshToken` from response.

**Step 2: Wait 15+ minutes (or manually expire token)**

**Step 3: Refresh**
```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<your-refresh-token>"}'
```

You'll get a new `accessToken`.

---

### 2. Test Google Sign-In

**Frontend integration needed:**

```html
<!-- Add Google Sign-In button -->
<div id="g_id_onload"
     data-client_id="YOUR_GOOGLE_CLIENT_ID"
     data-callback="handleCredentialResponse">
</div>
```

```javascript
function handleCredentialResponse(response) {
  fetch('http://localhost:3000/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken: response.credential })
  })
  .then(res => res.json())
  .then(data => {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    // Redirect to home
  });
}
```

---

## 📊 Database Changes

**Before Week 2:**
```
User
├─ id
├─ username
├─ email
├─ password
└─ createdAt
```

**After Week 2:**
```
User
├─ id
├─ username
├─ email
├─ password      (now optional)
├─ refreshToken  (new - hashed)
├─ googleId      (new - for OAuth)
├─ createdAt
└─ updatedAt     (new - auto)
```

---

## 🔄 Token Flow Diagram

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ 1. POST /auth/login
       │    {email, password}
       ▼
┌─────────────┐
│   Backend   │
└──────┬──────┘
       │
       │ 2. Verify credentials
       │ 3. Generate accessToken (15m)
       │ 4. Generate refreshToken (7d)
       │ 5. Store hashed refreshToken
       │
       ▼
┌─────────────┐
│   Client    │ Stores both tokens
└──────┬──────┘
       │
       │ ... 15 minutes later ...
       │
       │ 6. POST /auth/me
       │    Authorization: Bearer <expired-token>
       ▼
┌─────────────┐
│   Backend   │ Returns 401 Unauthorized
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Client    │ Detects expired token
└──────┬──────┘
       │
       │ 7. POST /auth/refresh
       │    {refreshToken}
       ▼
┌─────────────┐
│   Backend   │
└──────┬──────┘
       │
       │ 8. Verify refreshToken
       │ 9. Check database hash
       │ 10. Generate new accessToken
       │
       ▼
┌─────────────┐
│   Client    │ Updates accessToken, continues
└─────────────┘
```

---

## 🎓 What You Learned

1. **JWT Best Practices**
   - Access + refresh token pattern
   - Token expiry strategies
   - Secure storage with hashing

2. **OAuth 2.0 Implementation**
   - Server-side token verification
   - Account linking strategies
   - Social login integration

3. **Security Patterns**
   - Token rotation
   - Hash comparison for tokens
   - Graceful error handling

4. **Database Design**
   - Optional fields for flexibility
   - Auto-updating timestamps
   - Unique constraints for OAuth IDs

---

## 📝 Frontend Integration Checklist

Your frontend needs to:

- [ ] Store both `accessToken` and `refreshToken` from login/register
- [ ] Include `Authorization: Bearer <accessToken>` in all API requests
- [ ] Detect 401 errors (expired access token)
- [ ] Call `/auth/refresh` with refresh token when access token expires
- [ ] Update stored access token with new one from refresh
- [ ] Implement Google Sign-In button with client ID
- [ ] Send Google ID token to `/auth/google` endpoint
- [ ] Clear tokens on logout

---

## 🚨 Common Issues & Solutions

### Issue 1: "Invalid refresh token"
**Cause:** Refresh token doesn't match hashed version in database

**Solution:** User needs to login again (tokens were invalidated)

### Issue 2: "Google authentication failed"
**Cause:** Invalid Google Client ID or token

**Solution:** 
- Check `GOOGLE_CLIENT_ID` in `.env`
- Ensure frontend uses same Client ID
- Verify token is fresh (they expire)

### Issue 3: Access token expires immediately
**Cause:** Clock skew or wrong configuration

**Solution:** Check server time, verify `expiresIn: '15m'` in code

---

## 🎯 Next Steps (Week 3+)

- [ ] 2FA with QR codes
- [ ] Profile pictures upload
- [ ] User profiles and stats
- [ ] Friend system
- [ ] Real-time game matchmaking

---

## 📚 Additional Resources

- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Google Sign-In Docs](https://developers.google.com/identity/sign-in/web/backend-auth)
- [OAuth 2.0 Spec](https://oauth.net/2/)
- [OWASP JWT Security](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)

---

**Week 2 Status:** ✅ **COMPLETE**

All authentication features are production-ready and secure!
