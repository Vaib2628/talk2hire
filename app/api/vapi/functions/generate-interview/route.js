export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Tool call received:', body);

    const { role, level, techstack, type, userid, username, amount } = body;

    if (!role || !level || !techstack || !type || !userid) {
      return Response.json({ 
        success: false, 
        message: "Missing required fields" 
      }, { status: 400 });
    }

    const { text: questions } = await generateText({
      model: google('gemini-2.0-flash-001'),
      prompt: `
        Prepare ${amount || 10} interview questions.
        Role: ${role}
        Level: ${level}
        Tech Stack: ${techstack}
        Type: ${type === 'Technical' ? 'mostly technical' : type === 'Behavioral' ? 'mostly behavioral' : 'mixed'}
        Return ONLY a JSON array like: ["Q1", "Q2", ...]
        No extra text. No markdown. No numbering.
      `
    });

    let parsedQuestions;
    try {
      parsedQuestions = JSON.parse(questions);
    } catch (e) {
      console.error("Failed to parse AI response:", questions);
      parsedQuestions = questions.split('\n').filter(q => q.trim()).slice(0, amount || 10);
    }

    const interview = {
      role,
      type,
      level,
      techstack: techstack.split(",").map(t => t.trim()),
      questions: parsedQuestions,
      finalized: true,
      userId: userid,
      userName: username,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection("interviews").add(interview);

    // === ONLY SPEAK THE MESSAGE, QUESTIONS ARE SILENT ===
    return Response.json({
      success: true,
      message: "Got it! Starting your interview now...",  // ← SPOKEN
      questions: parsedQuestions  // ← SILENT, used by Vapi logic
    });

  } catch (error) {
    console.error("Error:", error);
    return Response.json({
      success: false,
      message: "Failed to generate interview"
    }, { status: 500 });
  }
}