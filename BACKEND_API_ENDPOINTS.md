# Backend API Endpoints

## 2FA Endpoints

All 2FA endpoints require authentication (Bearer token in Authorization header).

### 1. Enable 2FA
**POST** `/auth/2fa/enable`

Generates a TOTP secret and QR code for the user to scan with an authenticator app.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "qrCode": "data:image/png;base64,...",
  "secret": "BASE32_SECRET",
  "message": "scan qr code with authenticator app then verify code"
}
```

---

### 2. Verify 2FA
**POST** `/auth/2fa/verify`

Verifies the TOTP code from the authenticator app and activates 2FA for the account.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:**
```json
{
  "code": "123456"
}
```

**Response:**
```json
{
  "message": "2fa enabled successfully"
}
```

---

### 3. Disable 2FA
**POST** `/auth/2fa/disable`

Disables 2FA for the account. Requires both password and current 2FA code.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:**
```json
{
  "password": "user_password",
  "code": "123456"
}
```

**Response:**
```json
{
  "message": "2fa disabled successfully"
}
```

---

### 4. Validate 2FA During Login
**POST** `/auth/2fa/validate`

Completes the login process by validating the 2FA code. Use this after receiving `requires2FA: true` from login.

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response:**
```json
{
  "accessToken": "jwt_token",
  "refreshToken": "jwt_refresh_token",
  "user": {
    "id": "user_id",
    "username": "username",
    "email": "user@example.com"
  }
}
```

---

## Account Management

### Delete Account
**DELETE** `/auth/account`

Permanently deletes the user account and all associated data (matches, etc.).

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:**
```json
{
  "password": "user_password"
}
```

**Response:**
```json
{
  "message": "account deleted successfully"
}
```

---

## Testing Examples

### Full 2FA Flow:

1. **Register/Login** to get access token:
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@test.com","password":"Test1234"}'
```

2. **Enable 2FA** (get QR code):
```bash
curl -X POST http://localhost:3000/auth/2fa/enable \
  -H "Authorization: Bearer YOUR_TOKEN"
```

3. **Scan QR code** with Google Authenticator or similar app

4. **Verify 2FA** with code from app:
```bash
curl -X POST http://localhost:3000/auth/2fa/verify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code":"123456"}'
```

5. **Login with 2FA**:
```bash
# First attempt will return requires2FA: true
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test1234"}'

# Complete login with 2FA code
curl -X POST http://localhost:3000/auth/2fa/validate \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","code":"123456"}'
```

### Delete Account:

```bash
curl -X DELETE http://localhost:3000/auth/account \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"password":"Test1234"}'
```

---

## Status

✅ **All endpoints tested and working**
- 2FA enable: Returns QR code and secret
- 2FA verify: Activates 2FA for account
- 2FA disable: Requires password + code
- 2FA validate: Completes login with 2FA
- Delete account: Removes user and all data

Backend is ready for frontend integration.
