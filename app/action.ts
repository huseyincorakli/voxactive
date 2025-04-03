"use server";

export async function generateQuestion(formData:any) {
  const userLevel = formData.get("userLevel");
  const topic = formData.get("topic");
  const targetGrammerTopic = formData.get("targetGrammerTopic");
  const difficulty = formData.get("difficulty");
  const userLanguage = formData.get("userLanguage");
  
  // Build the query string
  const params = new URLSearchParams({
    userLevel,
    topic,
    targetGrammerTopic,
    difficulty,
    userLanguage
  });
  
  // Get the base URL - this works in production and development
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const host = process.env.VERCEL_URL || "localhost:3000";
  const baseUrl = `${protocol}://${host}`;
  
  // Call the API route
  const response = await fetch(`${baseUrl}/api/question/generateQuestion?${params}`, {
    method: "GET",
    cache: "no-store"
  });
  
 
  return response.json();
}


