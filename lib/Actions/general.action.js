"use server"
import { feedbackSchema } from "@/constants";
import { db } from "@/firebase/admin";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

export async function getInterviewsByUserId(userId, limit = 50) {
  if (!userId) return [];
  
  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();
  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function getLatestInterviews(params = {}) {
    const { userId, limit = 20 } = params;
  
    // If no userId provided, return empty array instead of throwing
    if (!userId) {
      return [];
    }
  
    // Get more than needed to ensure we have `limit` after filtering
    const extra = limit * 2;
    const snapshot = await db
      .collection("interviews")
      .where("finalized", "==", true)
      .orderBy("createdAt", "desc")
      .limit(extra)
      .get();
  
    const filtered = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(i => i.userId !== userId)
      .slice(0, limit); // Take only `limit` results
  
    return filtered;
  }

//to get the single interview by id

export async function getInterviewById(id) {
  if (!id) return null;
  
  try {
    const interview = await db.collection("interviews").doc(id).get();
    if (!interview.exists) return null;
    
    return {
      id: interview.id,
      ...interview.data(),
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching interview:", error);
    }
    return null;
  }
}

//to generate the feedback with the help of google gemini

export async function createFeedback(params = {}) {
    const { interviewId, userId, transcript } = params;
  
    if (!interviewId || !userId || !transcript?.length) {
      return { success: false, message: "Missing required fields" };
    }
  
    try {
      const formattedTranscript = transcript
        .map((sentence) => `- ${sentence.role}: ${sentence.content}`)
        .join("\n");
  
      const FeedbackZodSchema = z.object({
        totalScore: z.number().int().min(0).max(100),
        categoryScores: z.array(
          z.object({
            name: z.string(),
            score: z.number().int().min(0).max(100),
            comment: z.string(),
          })
        ),
        strengths: z.array(z.string()),
        areasForImprovement: z.array(z.string()),
        finalAssessment: z.string(),
      });
  
      const { object } = await generateObject({
        model: google("gemini-2.0-flash-001"), // Using your working model
        schema: FeedbackZodSchema,
        prompt: `
          You are a professional, critical AI interviewer analyzing a mock interview.
          Be thorough and honest — do NOT be lenient.
  
          Transcript:
          ${formattedTranscript}
  
          Score the candidate from 0 to 100 in these EXACT categories only:
          - Communication Skills
          - Technical Knowledge
          - Problem-Solving
          - Cultural & Role Fit
          - Confidence & Clarity
  
          Provide detailed, actionable feedback.
        `,
        system: "You are a senior interviewer evaluating candidates for technical roles.",
      });
  
      const {
        totalScore,
        categoryScores,
        strengths,
        areasForImprovement,
        finalAssessment,
      } = object;
  
      const feedbackRef = await db.collection("feedback").add({
        interviewId,
        userId,
        totalScore,
        categoryScores,
        strengths,
        areasForImprovement,
        finalAssessment,
        createdAt: new Date().toISOString(),
      });
  
      return {
        success: true,
        feedbackId: feedbackRef.id,
      };
    } catch (error) {
      console.error("Error in createFeedback:", error);
      return {
        success: false,
        message: "Failed to generate feedback. Please try again.",
      };
    }
  }
export async function getFeedbackByInterviewId(params = {}) {
  const { interviewId, userId } = params;

  if (!interviewId) {
    return null;
  }

  try {
    let queryRef = db.collection("feedback").where("interviewId", "==", interviewId);

    if (userId) {
      queryRef = queryRef.where("userId", "==", userId);
    }

    let querySnapshot = await queryRef.limit(1).get();

    if (querySnapshot.empty && userId) {
      querySnapshot = await db
        .collection("feedback")
        .where("interviewId", "==", interviewId)
        .limit(1)
        .get();
    }

    if (querySnapshot.empty) return null;

    const feedbackDoc = querySnapshot.docs[0];
    return { id: feedbackDoc.id, ...feedbackDoc.data() };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching feedback:", error);
    }
    return null;
  }
}