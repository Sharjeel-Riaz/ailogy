import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { GoogleGenAI } from "@google/genai";
import { MemoryManager, TutorKey } from "@/lib/memory";
import { rateLimit } from "@/lib/rate-limit";
import { db } from "@/utils/db";
import { Tutor, Message } from "@/utils/schema";
import { eq } from "drizzle-orm";

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  const isTestMode = process.env.NEXT_PUBLIC_APP_TEST_MODE === "true";

  // Get the current user
  const user = await currentUser();

  if (!user || !user.firstName || !user.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (isTestMode) {
    // In test mode, create a static response and save it in the database
    const testMessage = "Hi, how are you? (Test Mode)";

    // Store both the user prompt and the test message in the database
    await db.insert(Message).values({
      content: "Test mode initiated", // Example user prompt for test mode
      role: "user",
      userId: user.id,
      tutorId: params.chatId,
    });

    await db.insert(Message).values({
      content: testMessage,
      role: "system",
      userId: user.id,
      tutorId: params.chatId,
    });

    // Return the test message as the API response
    return NextResponse.json({ response: testMessage });
  }

  try {
    const { prompt } = await request.json();

    const identifier = request.url + "-" + user.id;
    const { success } = await rateLimit(identifier);

    if (!success) {
      return new NextResponse("Rate limit exceeded", { status: 429 });
    }

    // Fetch tutor data
    const tutor = await db
      .select()
      .from(Tutor)
      .where(eq(Tutor.id, params.chatId))
      .limit(1);

    if (!tutor || tutor.length === 0) {
      return new NextResponse("Tutor not found", { status: 404 });
    }

    const tutorData = tutor[0];
    const tutorKey: TutorKey = {
      tutorName: tutorData.name ?? "Unknown Tutor",
      userId: user.id,
      modelName: "gemini-1.5-flash",
    };

    const memoryManager = await MemoryManager.getInstance();

    // Read chat history
    const chatHistory = await memoryManager.readLatestHistory(tutorKey);

    // Perform vector search
    const similarDocs = await memoryManager.vectorSearch(
      chatHistory,
      tutorData.name + ".txt"
    );

    let relevantHistory = "";
    if (similarDocs && similarDocs.length > 0) {
      relevantHistory = similarDocs.map((doc) => doc.pageContent).join("\n");
    }

    // Build the system prompt with tutor context
    const systemPrompt = `You are ${tutorData.name}, a friendly and engaging tutor. Your personality is ${tutorData.description}. Please respond in a casual, approachable manner, as if speaking to a student you know well. Here are your instructions: ${tutorData.instructions}

Relevant past information:
${relevantHistory}

Recent chat history:
${chatHistory}`;

    // Save user message to database
    await db.insert(Message).values({
      content: prompt,
      role: "user",
      userId: user.id,
      tutorId: params.chatId,
    });

    // Send message to Gemini using new @google/genai SDK
    const fullPrompt = `${systemPrompt}\n\nUser: ${prompt}`;
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: fullPrompt,
      config: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 1000,
      },
    });

    const responseText = response.text ?? "";
    console.log("Response from AI:", responseText); // Log the response
    await memoryManager.writeToHistory(`User: ${prompt}\n`, tutorKey);
    await memoryManager.writeToHistory(`Tutor: ${responseText}\n`, tutorKey);

    // Save AI response to database
    await db.insert(Message).values({
      content: responseText,
      role: "system",
      userId: user.id,
      tutorId: params.chatId,
    });

    return NextResponse.json({ response: responseText });
  } catch (error) {
    console.error("[CHAT_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
