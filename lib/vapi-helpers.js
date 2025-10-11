// Helper functions for Vapi integration

export const getInterviewContext = (userName, userId, type) => {
  // This will be used to provide context to the Assistant
  // The Assistant will need to ask for these details or we can pass them via function calls
  
  return {
    userName: userName || "Candidate",
    userId: userId || "unknown",
    interviewType: type || "Mixed",
    // Add any other context you want to pass
  };
};

export const createInterviewPrompt = (context) => {
  return `
    You are conducting an interview for a candidate named ${context.userName}.
    The interview type is: ${context.interviewType}.
    User ID: ${context.userId}.
    
    Please start by calling the generate_interview function to get the appropriate questions for this interview.
    You'll need to ask the candidate about their role, experience level, and tech stack first.
  `;
};
