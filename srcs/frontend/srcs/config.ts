// Frontend configuration
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!googleClientId) {
    throw new Error("CRITICAL: VITE_GOOGLE_CLIENT_ID is missing from environment variables. Please check your .env file.");
}

if (!apiBaseUrl) {
    throw new Error("CRITICAL: VITE_API_BASE_URL is missing from environment variables. Please check your .env file.");
}

export const config = {
    // Google Client ID from Google Cloud Console
    GOOGLE_CLIENT_ID: googleClientId,
    
    // Backend API base URL
    API_BASE_URL: apiBaseUrl
};
