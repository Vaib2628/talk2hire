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
        // Verify the ID token first
        const decodedToken = await auth.verifyIdToken(idToken);
        const userRecord = await auth.getUser(decodedToken.uid);

        if (!userRecord) {
            return {
                success : false,
                message : "User doesn't Exist . Please create an Account instead"
            }
        }

        await setSessionCookie(idToken);

        return {
            success: true ,
            message : "Signed in successfully"
        }

    } catch (error) {
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

        // Use a more mobile-friendly approach for setting cookies
        const cookieStore = await cookies();
        
        cookieStore.set('session', sessionCookie, {
            maxAge : 60*60*24*7,
            httpOnly : true ,
            secure : process.env.NODE_ENV === "production",
            path : '/',
            sameSite : 'lax'
        })
        
    } catch (error) {
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


export async function getInterviewsByUserId (userId) {
    const interviews = await db.collection('interviews').where("userId" , "==" ,userId).orderBy('createdAt', 'desc').get();
    return interviews.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    }));
}

export async function getLatestInterviews(params = {}) {
    const { userId, limit = 20 } = params;
    
    const interviews = await db.collection('interviews').where('finalized' , '==' , 'true').where('userId', '!=' , userId).orderBy('createdAt', 'desc').limit(limit).get();
    
    return interviews.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    }));
}