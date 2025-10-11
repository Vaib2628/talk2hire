import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Tool call received:', body);

    // Handle both direct calls and Vapi tool calls
    const { role, level, techstack, type, userId, userName, amount } = body;

    // Validate required fields
    if (!role || !level || !techstack || !type || !userId) {
      console.error('Missing required fields:', { role, level, techstack, type, userId });
      return Response.json({ 
        success: false, 
        message: "Missing required fields: role, level, techstack, type, userId" 
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
      userId: userId,
      userName: userName,
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
