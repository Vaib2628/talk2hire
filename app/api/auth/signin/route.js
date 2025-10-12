import { NextResponse } from 'next/server';
import { auth } from '@/firebase/admin';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { email, idToken } = await request.json();
    
    // Verify the ID token first
    const decodedToken = await auth.verifyIdToken(idToken);
    const userRecord = await auth.getUser(decodedToken.uid);

    if (!userRecord) {
      return NextResponse.json({
        success: false,
        message: "User doesn't exist. Please create an account instead"
      }, { status: 400 });
    }

    // Check if user exists in Firestore database, if not create them
    const db = (await import('@/firebase/admin')).db;
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      await db.collection('users').doc(decodedToken.uid).set({
        name: userRecord.displayName || userRecord.email.split('@')[0],
        email: userRecord.email,
        createdAt: new Date().toISOString()
      });
    }

    // Create session cookie
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: 60 * 60 * 24 * 7 * 1000, // 7 days
    });

    // Set cookie using NextResponse
    const response = NextResponse.json({
      success: true,
      message: "Signed in successfully"
    });

    response.cookies.set('session', sessionCookie, {
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: '/',
      sameSite: 'lax'
    });

    return response;

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: `Error occurred while signing in: ${error.message}`
    }, { status: 500 });
  }
}
