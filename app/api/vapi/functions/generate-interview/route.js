import { auth, db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Interview generation request received:', body);

    // Derive authenticated user from either a trusted Vapi server key or session cookie
    const vapiKeyHeader = request.headers.get('x-vapi-key');
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    let resolvedUserId = null;
    let resolvedUserName = null;

    // 1) Trusted server-to-server call from Vapi (when tools run on Vapi servers)
    if (!resolvedUserId && vapiKeyHeader && process.env.VAPI_SERVER_KEY && vapiKeyHeader === process.env.VAPI_SERVER_KEY) {
      resolvedUserId = body.userId || null;
      resolvedUserName = body.userName || null;
      console.log('Using Vapi server key for identity');
    }

    // 2) Session-based identity (when tools are forwarded to client and browser calls this API)
    if (!resolvedUserId && sessionCookie) {
      try {
        const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
        const uid = decodedToken.uid;

        let userDoc = await db.collection('users').doc(uid).get();
        if (!userDoc.exists) {
          // Auto-provision user document from Firebase Auth if missing
          try {
            const authUser = await auth.getUser(uid);
            const name = authUser.displayName || authUser.email?.split('@')[0] || 'User';
            const email = authUser.email || '';
            await db.collection('users').doc(uid).set({
              name,
              email,
              createdAt: new Date().toISOString()
            });
            userDoc = await db.collection('users').doc(uid).get();
          } catch (provisionErr) {
            console.warn('Failed to auto-provision user doc:', provisionErr?.message);
          }
        }

        if (userDoc.exists) {
          resolvedUserId = userDoc.id;
          resolvedUserName = userDoc.data()?.name;
        }
      } catch (e) {
        console.warn('Session verification failed:', e?.message);
      }
    }

    if (!resolvedUserId) {
      return Response.json({ success: false, message: "Unauthenticated" }, { status: 401 });
    }
    console.log('Resolved user for interview generation:', { userId: resolvedUserId, userName: resolvedUserName });

    // Handle both direct calls and Vapi tool calls
    const { role, level, techstack, type, amount } = body;

    // Validate required fields
    if (!role || !level || !techstack || !type) {
      console.error('Missing required fields:', { role, level, techstack, type });
      return Response.json({ 
        success: false, 
        message: "Missing required fields: role, level, techstack, type" 
      }, { status: 400 });
    }

    // Generate questions using your existing logic
    const { text: questions } = await generateText({
      model: google('gemini-2.0-flash-001'),
      prompt: `
        Prepare ${amount || 10} questions for job interview ...
        The job role is: ${role}.
        The job experience is: ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus between the behavioural and technical questions should be lean towards: ${type}.
        Please return only the questions without any additional texts.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters that might break the voice assistant.
        Return the questions formatted like this.
        ["Question 1", "Question 2", "Question 3"]
        Thank you!
      `
    });

    // Create interview object
    const interview = {
      role,
      type,
      level,
      techstack: techstack.split(","),
      questions: JSON.parse(questions),
      finalized: true,
      userId: resolvedUserId,
      userName: resolvedUserName,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString()
    };

    // Store in Firebase
    const docRef = await db.collection("interviews").add(interview);
    console.log('Interview stored successfully:', docRef.id);
    
    return Response.json({
      success: true,
      message: "Interview generated successfully",
      interviewId: docRef.id,
      questions: interview.questions,
      interview: interview
    });

  } catch (error) {
    console.error("Error generating interview:", error);
    console.error("Error stack:", error.stack);
    return Response.json({
      success: false,
      message: "Failed to generate interview",
      error: error.message
    }, { status: 500 });
  }
}
