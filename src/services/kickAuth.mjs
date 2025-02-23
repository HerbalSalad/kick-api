// src/services/kickAuth.mjs
import axios from 'axios';
import crypto from 'crypto';
import querystring from 'querystring';

// import Kick Environment Variables Constants
import {
  KICK_AUTH_BASE_URL,
  KICK_CLIENT_ID,
  KICK_CLIENT_SECRET,
  KICK_REDIRECT_URI
} from '../constants/kickConstants.mjs';

export const KickAuth = {
  KICK_CLIENT_ID,
  KICK_CLIENT_SECRET,
  KICK_REDIRECT_URI,
  KICK_AUTH_BASE_URL,

  KICK_SCOPES: [
    'user:read',
    'channel:read',
    'channel:write',
    'chat:write',
    'events:subscribe',
  ].join(' '),

  generateState() {
    return crypto.randomBytes(32).toString('hex');
  },

  generatePKCE() {
    const verifier = crypto.randomBytes(32).toString('base64url');
    const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');

    return { verifier, challenge };
  },

  getAuthorizationUrl(state) {
    const kickState = state || this.generateState();
    const { verifier, challenge } = this.generatePKCE();

    if (!KICK_CLIENT_ID) {
      throw new Error('KICK_CLIENT_ID environment variable is not set');
    }

    if (!KICK_REDIRECT_URI) {
      throw new Error('KICK_CALLBACK_URL environment variable is not set');
    }

    const params = querystring.stringify({
      client_id: KICK_CLIENT_ID,
      redirect_uri: KICK_REDIRECT_URI,
      response_type: 'code',
      scope: this.KICK_SCOPES,
      state: kickState,
      code_challenge: challenge,
      code_challenge_method: 'S256',
    });

    const authUrl = `${KICK_AUTH_BASE_URL}/oauth/authorize?${params}`;

    return {
      url: authUrl,
      state: kickState,
      code_verifier: verifier,
    };
  },

  async getTokens(code, codeVerifier) {
    const tokenUrl = `${KICK_AUTH_BASE_URL}/oauth/token`;

    if (!code) {
      throw new Error('Authorization code is required');
    }

    if (!codeVerifier) {
      throw new Error('Code verifier is required');
    }

    const params = {
      client_id: KICK_CLIENT_ID,
      client_secret: KICK_CLIENT_SECRET,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: KICK_REDIRECT_URI,
      code_verifier: codeVerifier,
    };

    try {
      const response = await axios.post(tokenUrl, querystring.stringify(params), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching tokens:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  async refreshTokenAccess(refreshToken) {
    const tokenUrl = `${KICK_AUTH_BASE_URL}/oauth/token`;

    const params = {
      client_id: KICK_CLIENT_ID,
      client_secret: KICK_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    };

    try {
      const response = await axios.post(tokenUrl, querystring.stringify(params), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      return response.data;
    } catch (error) {
      console.error('Error refreshing tokens:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      });
      throw error;
    }
  },

  async revokeToken(token, tokenType) {
    const revokeUrl = `${KICK_AUTH_BASE_URL}/oauth/revoke`;

    const params = {
      token: token,
      ...(tokenType && { token_hint_type: tokenType }),
    };

    try {
      await axios.post(revokeUrl, null, { params });
      return true;
    } catch (error) {
      console.error('Error revoking token:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      });
      throw error;
    }
  },
};

export default KickAuth;
