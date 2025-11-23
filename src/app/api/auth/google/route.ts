import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import jwt from 'jsonwebtoken';

// In a real application, these would be stored in environment variables
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const JWT_SECRET = process.env.JWT_SECRET!;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/login`;

// Mock user database - replace with real database
const users = new Map();

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  REDIRECT_URI
);

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }

    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info from Google
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    if (!userInfo.email || !userInfo.id) {
      return NextResponse.json(
        { error: 'Invalid user information from Google' },
        { status: 400 }
      );
    }

    // Find or create user in database
    let user = users.get(userInfo.id);
    let isNewUser = false;

    if (!user) {
      // Create new user
      user = {
        id: userInfo.id,
        email: userInfo.email,
        googleId: userInfo.id,
        displayName: userInfo.name || userInfo.email.split('@')[0],
        preferredLanguage: 'en',
        voicePersona: 'natural',
        defaultTargetLanguage: 'en',
        privacyOptIn: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        onboardingCompleted: false,
      };
      users.set(userInfo.id, user);
      isNewUser = true;
    }

    // Generate JWT tokens
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        type: 'access'
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        type: 'refresh'
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    const authTokens = {
      accessToken,
      refreshToken,
      expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour
    };

    return NextResponse.json({
      user,
      tokens: authTokens,
      isNewUser,
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Generate Google OAuth URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ],
      state: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    });

    return NextResponse.json({
      authUrl,
    });
  } catch (error) {
    console.error('Error generating OAuth URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate authentication URL' },
      { status: 500 }
    );
  }
}