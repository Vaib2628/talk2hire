import { NextResponse } from 'next/server';
import { auth, db } from '@/firebase/admin';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false });
    }

    const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
    const userRecord = await db.collection('users').doc(decodedToken.uid).get();

    if (!userRecord.exists) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({ 
      authenticated: true,
      user: {
        ...userRecord.data(),
        id: userRecord.id
      }
    });

  } catch (error) {
    return NextResponse.json({ authenticated: false });
  }
}
