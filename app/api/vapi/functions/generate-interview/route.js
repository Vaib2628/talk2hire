import { auth, db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Interview generation request received:', body);

    // Derive authenticated user from session cookie to prevent spoofed/default values
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    let resolvedUserId = null;
    let resolvedUserName = null;

    if (sessionCookie) {
      try {
        const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
        const userRecord = await db.collection('users').doc(decodedToken.uid).get();
        if (userRecord.exists) {
          resolvedUserId = userRecord.id;
          resolvedUserName = userRecord.data()?.name;
        }
      } catch (e) {
        console.warn('Session verification failed:', e?.message);
      }
    }

    // Development/explicit override: allow body-provided identity only if enabled
    if (!resolvedUserId && process.env.ALLOW_UNAUTH_INTERVIEW === 'true') {
      resolvedUserId = body.userId || null;
      resolvedUserName = body.userName || null;
      console.log('Using body-provided identity under ALLOW_UNAUTH_INTERVIEW');
    }

    if (!resolvedUserId) {
      return Response.json({ success: false, message: "Unauthenticated" }, { status: 401 });
    }
    console.log('Resolved user for interview generation:', { userId: resolvedUserId, userName: resolvedUserName });

    // Handle both direct calls and Vapi tool calls
    const { role, level, techstack, type, amount, userName: requestedUserName } = body;

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
      userId: resolvedUserId, // enforce authenticated userId
      userName: requestedUserName || resolvedUserName,
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
