# 🧪 Postman Testing Guide for Transcendence Backend

## 📋 Table of Contents
1. [Setup Postman](#setup-postman)
2. [Testing Week 1 Endpoints](#testing-week-1-endpoints)
3. [Creating a Postman Collection](#creating-a-postman-collection)
4. [Week 2+ Endpoints (Future)](#week-2-endpoints-future)

---

## 🚀 Setup Postman

### Option 1: Download Postman Desktop App
1. Go to https://www.postman.com/downloads/
2. Download for your OS (Windows/Mac/Linux)
3. Install and open Postman

### Option 2: Use Postman Web
1. Go to https://www.postman.com/
2. Click "Sign in" or "Sign up for free"
3. Use web version (no download needed)

---

## 🧪 Testing Week 1 Endpoints

### Before Testing - Start Your Services

**Terminal 1:**
```bash
cd srcs/backend
npm run auth
```

**Terminal 2:**
```bash
cd srcs/backend
npm run user
```

---

### Test 1: Auth Service Health Check

**Method:** `GET`  
**URL:** `http://localhost:3001/auth/health`

#### In Postman:
1. Click **"New"** → **"HTTP Request"**
2. Set method to **GET** (dropdown on left)
3. Enter URL: `http://localhost:3001/auth/health`
4. Click **"Send"** button

#### Expected Response:
**Status:** `200 OK`
```json
{
  "status": "ok",
  "service": "auth"
}
```

#### Screenshot Guide:
```
┌─────────────────────────────────────────────────┐
│ GET ▼  http://localhost:3001/auth/health  Send │
├─────────────────────────────────────────────────┤
│ Body   Headers   Test Results                   │
├─────────────────────────────────────────────────┤
│ {                                               │
│   "status": "ok",                               │
│   "service": "auth"                             │
│ }                                               │
└─────────────────────────────────────────────────┘
```

---

### Test 2: User Service Health Check

**Method:** `GET`  
**URL:** `http://localhost:3002/user/health`

#### In Postman:
1. Create new request
2. Set method to **GET**
3. Enter URL: `http://localhost:3002/user/health`
4. Click **"Send"**

#### Expected Response:
**Status:** `200 OK`
```json
{
  "status": "ok",
  "service": "user"
}
```

---

## 📦 Creating a Postman Collection

A collection organizes all your requests in one place.

### Step 1: Create Collection
1. Click **"Collections"** in left sidebar
2. Click **"+"** or **"Create a collection"**
3. Name it: **"Transcendence Backend"**

### Step 2: Add Folder Structure
Right-click on collection → **"Add folder"**

Create these folders:
- **Auth Service**
- **User Service**
- **Game Service** (for Week 3)

### Step 3: Add Requests to Folders

#### Auth Service Folder:
1. Right-click **"Auth Service"** → **"Add request"**
2. Name: **"Health Check"**
3. Set: `GET http://localhost:3001/auth/health`
4. Save

#### User Service Folder:
1. Right-click **"User Service"** → **"Add request"**
2. Name: **"Health Check"**
3. Set: `GET http://localhost:3002/user/health`
4. Save

---

## 🔐 Week 2+ Endpoints (Future)

Here's how to test the endpoints you'll build in Week 2:

### 1. Register New User

**Method:** `POST`  
**URL:** `http://localhost:3001/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "test@example.com",
  "username": "testuser",
  "password": "SecurePass123!",
  "displayName": "Test User"
}
```

**In Postman:**
1. Create new request
2. Method: **POST**
3. URL: `http://localhost:3001/auth/register`
4. Go to **"Headers"** tab
5. Add: `Content-Type` = `application/json`
6. Go to **"Body"** tab
7. Select **"raw"** and **"JSON"** from dropdown
8. Paste JSON above
9. Click **"Send"**

**Expected Response (Week 2):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "test@example.com",
      "username": "testuser"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 2. Login

**Method:** `POST`  
**URL:** `http://localhost:3001/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "test@example.com",
  "password": "SecurePass123!"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "test@example.com",
      "username": "testuser"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 3. Get Current User Profile (Protected)

**Method:** `GET`  
**URL:** `http://localhost:3002/users/me`

**Headers:**
```
Authorization: Bearer <your_access_token>
```

**In Postman:**
1. Create new request
2. Method: **GET**
3. URL: `http://localhost:3002/users/me`
4. Go to **"Headers"** tab
5. Add: `Authorization` = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Replace `eyJhbG...` with actual token from login response
6. Click **"Send"**

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "test@example.com",
    "username": "testuser",
    "displayName": "Test User",
    "avatar": null,
    "language": "en",
    "createdAt": "2025-11-26T12:00:00Z"
  }
}
```

---

### 4. Update Profile

**Method:** `PATCH`  
**URL:** `http://localhost:3002/users/me`

**Headers:**
```
Authorization: Bearer <your_access_token>
Content-Type: application/json
```

**Body:**
```json
{
  "displayName": "Updated Name",
  "language": "fr"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "displayName": "Updated Name",
    "language": "fr"
  }
}
```

---

## 🎯 Using Environment Variables (Pro Tip!)

Instead of copying tokens everywhere, use Postman variables:

### Setup:
1. Click **"Environments"** in left sidebar
2. Create new environment: **"Development"**
3. Add variables:
   - `baseUrl`: `http://localhost`
   - `authPort`: `3001`
   - `userPort`: `3002`
   - `accessToken`: (leave empty, we'll set it automatically)

### Use in Requests:
- URL: `{{baseUrl}}:{{authPort}}/auth/health`
- Header: `Authorization: Bearer {{accessToken}}`

### Auto-Set Token After Login:

In your **Login** request, go to **"Tests"** tab and add:
```javascript
// Parse the response
const response = pm.response.json();

// Save token to environment
if (response.success && response.data.accessToken) {
    pm.environment.set("accessToken", response.data.accessToken);
    console.log("✅ Token saved to environment!");
}
```

Now after logging in, the token is automatically saved for use in other requests!

---

## 🧪 Testing Error Cases

### Test 1: Invalid Endpoint
**Request:** `GET http://localhost:3001/invalid`  
**Expected:** `404 Not Found`

### Test 2: Service Not Running
1. Stop auth service (Ctrl+C in terminal)
2. Try: `GET http://localhost:3001/auth/health`
3. **Expected:** Connection error in Postman

### Test 3: Wrong Port
**Request:** `GET http://localhost:9999/auth/health`  
**Expected:** Connection error

---

## 📊 Postman Collection JSON (Import This!)

Save this to a file `Transcendence.postman_collection.json` and import it:

```json
{
  "info": {
    "name": "Transcendence Backend",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth Service",
      "item": [
        {
          "name": "Health Check",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:3001/auth/health",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3001",
              "path": ["auth", "health"]
            }
          }
        }
      ]
    },
    {
      "name": "User Service",
      "item": [
        {
          "name": "Health Check",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:3002/user/health",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3002",
              "path": ["user", "health"]
            }
          }
        }
      ]
    }
  ]
}
```

### To Import:
1. Open Postman
2. Click **"Import"** button (top left)
3. Drag & drop the JSON file
4. Collection appears in left sidebar!

---

## 🎨 Visual Testing Workflow

```
┌─────────────────┐
│ 1. Start Services│
│   npm run auth   │
│   npm run user   │
└────────┬─────────┘
         │
         ▼
┌─────────────────┐
│ 2. Open Postman  │
└────────┬─────────┘
         │
         ▼
┌─────────────────┐
│ 3. Send Request  │
│  GET /health     │
└────────┬─────────┘
         │
         ▼
┌─────────────────┐
│ 4. Check Response│
│  Status: 200 OK  │
│  Body: JSON      │
└─────────────────┘
```

---

## 🐛 Troubleshooting Postman Tests

### Problem: "Could not get any response"
**Solution:**
- Check services are running: `ps aux | grep node`
- Check correct port (3001 for auth, 3002 for user)
- Try in browser first: http://localhost:3001/auth/health

### Problem: "404 Not Found"
**Solution:**
- Check URL path is correct
- Verify endpoint exists in code
- Check for typos in URL

### Problem: "CORS Error"
**Solution:**
- CORS doesn't affect Postman (only browsers)
- If testing from browser, check `shared/fastify.js` has CORS enabled

---

## 📱 Alternative: Test with curl

If you don't want to use Postman:

```bash
# Auth health check
curl http://localhost:3001/auth/health

# User health check  
curl http://localhost:3002/user/health

# POST request (Week 2)
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'

# With authentication (Week 2)
curl http://localhost:3002/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## ✅ Week 1 Testing Checklist

- [ ] Postman installed or web version opened
- [ ] Auth service running (`npm run auth`)
- [ ] User service running (`npm run user`)
- [ ] Tested: `GET http://localhost:3001/auth/health` → 200 OK
- [ ] Tested: `GET http://localhost:3002/user/health` → 200 OK
- [ ] Created Postman collection for future use
- [ ] Bookmarked this guide for Week 2!

---

## 🎯 Next Steps

**Week 2:** Come back to this guide when you implement:
- Registration endpoint
- Login endpoint
- Protected routes with JWT
- Profile updates

**Tip:** Keep Postman open while coding. Test immediately after implementing each endpoint!

---

**Happy Testing! 🚀**
