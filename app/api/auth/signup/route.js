import { NextResponse } from 'next/server';
import { db } from '@/firebase/admin';

export async function POST(request) {
  try {
    const { uid, name, email } = await request.json();
    
    const userRecord = await db.collection('users').doc(uid).get();

    if (userRecord.exists) {
      return NextResponse.json({
        success: false,
        message: "User already exists, Please Sign-in"
      }, { status: 400 });
    }

    await db.collection('users').doc(uid).set({
      name, 
      email,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: "Account created successfully"
    });

  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      return NextResponse.json({
        success: false,
        message: "User already exists"
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: "Failed to create the account."
    }, { status: 500 });
  }
}
