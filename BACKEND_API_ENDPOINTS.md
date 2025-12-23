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
- Change password: Changes user password
- Friend system: Add, remove, list friends and view their stats/matches

Backend is ready for frontend integration.

---

## Change Password

### Change Password
**POST** `/auth/password/change`

Changes the user's password after verifying current password.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:**
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

**Response:**
```json
{
  "message": "password changed successfully"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/auth/password/change \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"OldPass123","newPassword":"NewPass456"}'
```

---

## Friend System Endpoints

All friend endpoints require authentication (Bearer token in Authorization header).

### 1. Send Friend Request
**POST** `/user/friends/request`

Sends a friend request to another user.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:**
```json
{
  "friendUsername": "other_user"
}
```

**Response:**
```json
{
  "message": "friend request sent",
  "requestId": 1
}
```

---

### 2. Respond to Friend Request
**PUT** `/user/friends/respond`

Accepts or rejects a pending friend request.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:**
```json
{
  "requestId": 1,
  "accept": true
}
```

**Response:**
```json
{
  "message": "friend request accepted",
  "status": "accepted"
}
```

---

### 3. Get Friends List
**GET** `/user/friends`

Gets list of friends and pending requests.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "friends": [
    {
      "id": "uuid",
      "username": "friend_name",
      "avatar": "/public/uploads/avatar.png",
      "friendshipId": 1
    }
  ],
  "pendingRequests": [
    {
      "requestId": 2,
      "from": {
        "id": "uuid",
        "username": "requester_name",
        "avatar": null
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "sentRequests": [
    {
      "requestId": 3,
      "to": {
        "id": "uuid",
        "username": "pending_friend",
        "avatar": null
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 4. Remove Friend
**DELETE** `/user/friends/:friendshipId`

Removes a friend from your friends list.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "message": "friend removed successfully"
}
```

---

### 5. Get Friend's Stats (W/L Ratio)
**GET** `/user/friends/:friendId/stats`

Gets a friend's win/loss ratio and game statistics. Only works for accepted friends.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "friend": {
    "id": "uuid",
    "username": "friend_name",
    "avatar": "/public/uploads/avatar.png"
  },
  "stats": {
    "totalMatches": 25,
    "wins": 15,
    "losses": 10,
    "winRate": "60.0",
    "wlRatio": "1.50",
    "byGameMode": {
      "pvp": { "wins": 8, "losses": 5 },
      "pvai": { "wins": 5, "losses": 3 },
      "tournament": { "wins": 2, "losses": 2 }
    }
  }
}
```

---

### 6. Get Friend's Match History
**GET** `/user/friends/:friendId/matches`

Gets a friend's match history. Only works for accepted friends.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "friend": {
    "id": "uuid",
    "username": "friend_name",
    "avatar": "/public/uploads/avatar.png"
  },
  "matches": [
    {
      "id": 1,
      "opponent": "opponent_name",
      "userScore": 5,
      "opponentScore": 3,
      "won": true,
      "gameMode": "PvP",
      "playedAt": "2024-01-01T00:00:00.000Z",
      "tournamentRound": null
    }
  ]
}
```

---

## Friend System Testing Examples

### Full Friend Flow:

1. **Send friend request:**
```bash
curl -X POST http://localhost:3000/user/friends/request \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"friendUsername":"other_user"}'
```

2. **Accept friend request** (as the other user):
```bash
curl -X PUT http://localhost:3000/user/friends/respond \
  -H "Authorization: Bearer OTHER_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"requestId":1,"accept":true}'
```

3. **Get friends list:**
```bash
curl -X GET http://localhost:3000/user/friends \
  -H "Authorization: Bearer YOUR_TOKEN"
```

4. **View friend's stats:**
```bash
curl -X GET http://localhost:3000/user/friends/FRIEND_UUID/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

5. **View friend's match history:**
```bash
curl -X GET http://localhost:3000/user/friends/FRIEND_UUID/matches \
  -H "Authorization: Bearer YOUR_TOKEN"
```

6. **Remove friend:**
```bash
curl -X DELETE http://localhost:3000/user/friends/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```
