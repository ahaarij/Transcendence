import axios from 'axios';

// base urls for internal microservices
const AUTH_SERVICE = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const USER_SERVICE = process.env.USER_SERVICE_URL || 'http://localhost:3002';
const GAME_SERVICE = process.env.GAME_SERVICE_URL || 'http://localhost:3000';

// verifies jwt token by calling auth service
export async function verifyToken(token: string): Promise<{ userId: number } | null> {
  try {
    // calls auth service to verify token
    const response = await axios.get(`${AUTH_SERVICE}/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;  // returns decoded token data
  } catch (error) {
    console.error('token verification failed:', error);
    return null;  // invalid token
  }
}

// gets user info from user service
export async function getUserById(userId: number, token: string): Promise<any | null> {
  try {
    // calls user service to get user details
    const response = await axios.get(`${USER_SERVICE}/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;  // returns user object
  } catch (error) {
    console.error('failed to get user:', error);
    return null;
  }
}

// gets user by username from user service
export async function getUserByUsername(username: string): Promise<any | null> {
  try {
    // calls user service to find user by username
    const response = await axios.get(`${USER_SERVICE}/user/profile/${username}`);
    return response.data;  // returns user profile
  } catch (error) {
    console.error('failed to get user by username:', error);
    return null;
  }
}

// saves game match to game service
export async function saveMatch(matchData: any, token: string): Promise<boolean> {
  try {
    // sends match data to game service
    await axios.post(`${GAME_SERVICE}/game/match`, matchData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return true;  // match saved successfully
  } catch (error) {
    console.error('failed to save match:', error);
    return false;
  }
}

// gets user match history from game service
export async function getMatchHistory(userId: number, token: string): Promise<any[]> {
  try {
    // calls game service to get all matches for user
    const response = await axios.get(`${GAME_SERVICE}/game/matches/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;  // returns array of matches
  } catch (error) {
    console.error('failed to get match history:', error);
    return [];
  }
}

// checks health of a service
export async function checkServiceHealth(serviceName: 'auth' | 'user' | 'game'): Promise<boolean> {
  try {
    let url = '';
    // picks correct service url
    switch (serviceName) {
      case 'auth':
        url = `${AUTH_SERVICE}/auth/health`;
        break;
      case 'user':
        url = `${USER_SERVICE}/user/health`;
        break;
      case 'game':
        url = `${GAME_SERVICE}/game/health`;
        break;
    }
    
    // calls health endpoint
    const response = await axios.get(url, { timeout: 3000 });
    return response.data.status === 'ok';  // returns true if service is healthy
  } catch (error) {
    console.error(`${serviceName} service health check failed:`, error);
    return false;  // service is down or unreachable
  }
}
