// app/api/generateinterview/route.js
import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export async function POST(request) {
  try {
    const body = await request.json();
    console.log("Tool call received:", body);

    const { role, level, techstack, type, userid, username, amount } = body;

    // === VALIDATE ALL REQUIRED FIELDS ===
    if (!role || !level || !techstack || !type || !userid || !amount) {
      console.error("Missing fields:", { role, level, techstack, type, userid, amount });
      return Response.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // === GENERATE QUESTIONS WITH GEMINI ===
    const { text: rawQuestions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `
        Generate exactly ${amount} interview questions.
        Role: ${role}
        Level: ${level}
        Tech Stack: ${techstack}
        Type: ${type === "Technical" ? "mostly technical" : type === "Behavioral" ? "mostly behavioral" : "mixed"}
        
        RETURN ONLY A VALID JSON ARRAY OF STRINGS:
        ["Question 1 text", "Question 2 text", ...]
        
        NO markdown, NO numbering, NO extra text.
      `,
    });

    console.log("Gemini raw output:", rawQuestions);

    // === PARSE QUESTIONS (ROBUST) ===
    let questions = [];
    const cleaned = rawQuestions.trim().replace(/```json|```/g, "").trim();
    try {
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.every(q => typeof q === "string")) {
        questions = parsed.slice(0, Number(amount));
      }
    } catch (e) {
      console.warn("JSON parse failed, using fallback:", e);
      questions = rawQuestions
        .split("\n")
        .map(line => line.replace(/^\d+\.\s*/, "").trim())
        .filter(line => line && line.length > 10)
        .slice(0, Number(amount));
    }

    if (questions.length === 0) {
      return Response.json(
        { success: false, message: "No valid questions generated" },
        { status: 500 }
      );
    }

    // === SAVE TO FIREBASE ===
    const interview = {
      role,
      level,
      techstack: techstack.split(",").map(t => t.trim()),
      type,
      amount: Number(amount),
      questions,
      userId: userid,
      userName: username,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
      finalized: true,
    };

    const docRef = await db.collection("interviews").add(interview);
    console.log("Interview saved with ID:", docRef.id);

    // === RETURN ONLY WHAT VAPI SHOULD SPEAK + ID ===
    return Response.json({
      success: true,
      message: "Your interview is ready! Redirecting you now...",
      interviewId: docRef.id,
    });

  } catch (error) {
    console.error("Generate interview error:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to generate interview",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}