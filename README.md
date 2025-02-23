# Kick API JavaScript Client

This project provides a lightweight JavaScript client for interacting with the [Kick API](https://kick.com), complete with OAuth 2.1 authentication support. It includes two main modules: one for handling authentication (`KickAuth.mjs`) and another for making API requests (`KickAPIClient.mjs`).

## Features

- OAuth 2.1 authentication with PKCE (Proof Key for Code Exchange)
- Methods to fetch users, channels, categories, send chat messages, manage event subscriptions, and more
- Token management (access token retrieval, refresh, and revocation)

## Prerequisites

- [Node.js](https://nodejs.org/) (version 14 or higher recommended)

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/your-repo-name.git
   cd your-repo-name
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

   This project depends on axios for HTTP requests. The crypto and querystring modules are built into Node.js and don’t require additional installation.

## Configuration

Set the following environment variables in a `.env` file or your environment:

```
# Development Environment Variables
KICK_CLIENT_ID_DEV=your_dev_client_id
KICK_CLIENT_SECRET_DEV=your_dev_client_secret
KICK_CALLBACK_URL_DEV=http://localhost:3000/auth/callback
KICK_AUTH_BASE_URL_DEV=https://id.kick.com
KICK_API_BASE_URL_DEV=https://api.kick.com

# Production Environment Variables
KICK_CLIENT_ID_PROD=your_prod_client_id
KICK_CLIENT_SECRET_PROD=your_prod_client_secret
KICK_CALLBACK_URL_PROD=https://yourproductiondomain.com/auth/callback
KICK_AUTH_BASE_URL_PROD=https://id.kick.com
KICK_API_BASE_URL_PROD=https://api.kick.com
```

**Note:** The `KICK_CALLBACK_URL` must be registered in your Kick application settings via the Kick developer portal.

## Usage

### Authentication

The `KickAuth.mjs` module handles the OAuth 2.1 flow. Here’s how to authenticate a user:

#### Generate an authorization URL:

```javascript
import { KickAuth } from './services/kickAuth.mjs';

const state = KickAuth.generateState();
const { url, code_verifier } = KickAuth.getAuthorizationUrl(state);

// Save state and code_verifier (e.g., in session storage or a database)
// Redirect the user to the generated url
console.log(url);
```

This generates a URL that you’ll direct users to for authorization.

#### Handle the callback:

After the user authorizes your app, Kick redirects them to your `KICK_CALLBACK_URL` with a `code` and `state` in the query parameters. Exchange the `code` for tokens:

```javascript
// In your callback route (e.g., /auth/callback)
const code = // Extract code from query params
const state = // Extract state from query params

// Verify the state matches what you saved earlier
const tokens = await KickAuth.getTokens(code, code_verifier);

console.log(tokens); // Contains access_token, refresh_token, etc.
```

#### Refresh a token:

When the access token expires, refresh it using the refresh token:

```javascript
const newTokens = await KickAuth.refreshTokenAccess(tokens.refresh_token);
```

#### Revoke a token:

To invalidate an access or refresh token:

```javascript
await KickAuth.revokeToken(tokens.access_token, 'access_token');
```

### Scopes

The default scopes requested are:

```
user:read channel:read channel:write chat:write events:subscribe
```

To change them, edit `KickAuth.KICK_SCOPES` in `services/kickAuth.mjs`.

## API Client

The `KickAPIClient.mjs` class provides methods to interact with the Kick API once you have an access token. Here’s how to use it:

```javascript
import KickAPIClient from './services/kickApi.mjs';

// Initialize the client
const client = new KickAPIClient({
  clientId: process.env.KICK_CLIENT_ID,
  clientSecret: process.env.KICK_CLIENT_SECRET,
});

// Set the access token
client.setAccessToken(tokens.access_token);

// Example: Get users by IDs
const users = await client.getUsers([69, 101]);
console.log(users);

// Example: Get channels by broadcaster IDs
const channels = await client.getChannels([101]);
console.log(channels);

// Example: Send a chat message
const chatResponse = await client.sendChatMessage({
  broadcaster_user_id: 101,
  content: 'Hello, Kick!',
  type: 'user',
});
console.log(chatResponse);
```

### Error Handling

Wrap API calls in `try...catch` blocks to handle potential errors:

```javascript
try {
  const users = await client.getUsers([69]);
} catch (error) {
  console.error('API Error:', error.message);
}
```

For a full list of methods, check the `KickAPIClient` class in `services/kickApi.mjs`. Methods mirror the Kick API endpoints (e.g., `getCategories`, `createEventSubscriptions`).

## Notes

### Client Type

This implementation is suited for server-side (confidential) applications, as it uses a client secret. For public clients (e.g., browser-based apps), modify `KickAuth.mjs` to omit the client secret and rely solely on PKCE.

### Security

Store tokens securely and never expose your `KICK_CLIENT_SECRET` in version control or client-side code.

### API Version

Based on Kick API v1.0.0 per the provided Swagger documentation.

### Base URLs

- Authentication: `https://id.kick.com`
- API requests: `https://api.kick.com`

These can be overridden with the `KICK_AUTH_BASE_URL` environment variable or the `baseURL` config option in `KickAPIClient`.

## License

This project is licensed under the **GNU GENERAL PUBLIC LICENSE**.

## Created by

This project was created by **Babz of KickTools**. For more information, visit [kicktools.app/ayybabz](https://kicktools.app/ayybabz).