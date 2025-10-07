'use server';

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";

export async function signUp ({uid , name , email }) {
    try {
        const userRecord = await db.collection('users').doc(uid).get();

        if (userRecord.exists) {
            return {
                success : false ,
                message : "User already exists , Please Sign-in"
            }
        }

        await db.collection('users').doc(uid).set({
            name , 
            email,
            createdAt: new Date().toISOString()
        })

        return {
            success: true,
            message: "Account created successfully"
        }

    } catch (error) {
        console.error("Error creating a user :" + error);

        if (error.code === 'auth/email-already-exists'){
            return {
                success : false ,
                message : "User already exists" 
            }
        }

        return {
            success : false ,
            message : "Failed to create the account ."
        }
    }
}

export async function signIn ({email , idToken}){
    try {
        console.log('Server signIn called with email:', email);
        
        // Verify the ID token first
        const decodedToken = await auth.verifyIdToken(idToken);
        console.log('Token verified for user:', decodedToken.uid);
        
        const userRecord = await auth.getUser(decodedToken.uid);
        console.log('User record found:', userRecord.email);

        if (!userRecord) {
            return {
                success : false,
                message : "User doesn't Exist . Please create an Account instead"
            }
        }

        await setSessionCookie(idToken);
        console.log('Session cookie set successfully');

        return {
            success: true ,
            message : "Signed in successfully"
        }

    } catch (error) {
        console.error('Server signIn error:', error);

        return {
            success : false ,
            message : `Error occurred while signing in: ${error.message}`
        }
    }
}

export async function setSessionCookie (idToken){
    try {
        const sessionCookie = await auth.createSessionCookie(idToken , {
            expiresIn : 60*60*24*7*1000 ,
        })

        const cookieStore = cookies();
        
        cookieStore.set('session', sessionCookie, {
            maxAge : 60*60*24*7,
            httpOnly : true ,
            secure : process.env.NODE_ENV === "production",
            path : '/',
            sameSite : 'lax'
        })
        
        console.log('Session cookie set successfully');
    } catch (error) {
        console.error('Error setting session cookie:', error);
        throw error;
    }
}


export async function getCurrentUser() {
    const cookieStore = await cookies();

    //now get that sessionCokie where we has the user data stored

    const sessionCokie = cookieStore.get('session')?.value;

    if (!sessionCokie) {
        return null ;
    }

    const decodedToken = await auth.verifySessionCookie(sessionCokie , true);

    const userRecord = await db.collection('users').doc(decodedToken.uid).get();

    if (!userRecord.exists) {
        return null ;
    }

    //but if the user exists 
    return {
        ...userRecord.data() ,
        id : userRecord.id ,
    } ;

}

export async function isAuthenticated() {
    const user = await getCurrentUser() ;

    return !!user ;
}
