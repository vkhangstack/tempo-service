export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_APP_TEAMS_CLIENT_ID, // Application (client) ID from the app registration
    authority: 'https://login.microsoftonline.com/common', // or your tenant ID
    redirectUri: import.meta.env.VITE_APP_TEAMS_REDIRECT_URI ?? 'http://localhost:3001', // match this in Azure
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ['User.Read'],
};
