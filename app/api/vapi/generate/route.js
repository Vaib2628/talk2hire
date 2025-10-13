import { auth, db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { cookies } from "next/headers";

export async function GET(){
    return Response.json({success : true , message:"Hey this api is working fine." } , {status : 200});

}

//Now building the post requests handler

export async function POST(request) {

    const {type , role , level , techstack , amount } = await request.json() ;

    try {
        // Derive authenticated user from session cookie
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('session')?.value;
        if (!sessionCookie) {
            return Response.json({ success: false, message: "Unauthenticated" }, { status: 401 });
        }
        const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
        const userRecord = await db.collection('users').doc(decodedToken.uid).get();
        if (!userRecord.exists) {
            return Response.json({ success: false, message: "User not found" }, { status: 401 });
        }
        const { id: userId } = { id: userRecord.id };
        const { name: userName } = userRecord.data();

        //now we have to generate the texts with generate texts
        if (!type || !role || !level || !techstack) {
            return Response.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }
        const { text : questions } = await generateText ({
            model : google('gemini-2.0-flash-001') ,
            prompt : `
            Prepare questions for job interview ...
            The job role is : ${role} .
            The job experience is : ${level} .
            The tech stack used in the job is : ${techstack} .
            The focus between the behaviourial and technical questions should be lean towards : ${type} .
            Please return only the questions without any additional texts .
            The questions are going be read by the a voice assistant so do not use "/"/" or "*" or any other special characters that might break the voice assistant .
            Return the questions formatted like this .
            ["Question 1" , "Question 2" , "Question 3"]
            Thank you !. 
            `
        })

        const interview = {
            role , type , level , 
            techstack : techstack.split(","),
            questions : JSON.parse(questions) , 
            finalized : true , 
            userId : userId,
            userName: userName,
            amount: amount || 10,
            coverImage : getRandomInterviewCover(),
            createdAt : new Date().toISOString()
        }

        await db.collection("interviews").add(interview)

        return Response.json({success : true , message : "Successfully stored the interviews"} , {status : 200}) ;
        
    } catch (error) {
        console.error(error);
        return Response.json({status : false , error} , {status : 500});
    }
}