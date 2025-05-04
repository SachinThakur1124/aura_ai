export const maxDuration = 60;
import OpenAI from "openai";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import chatModel from "@/models/chat/Chat";
import connectionDB from "@/context/db";

// Initialize OpenAI client with your API key
const client = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.CHAT_GPT_API_KEY,
});

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    // Extract the Chat ID and prompt from the request body
    const { chatId, prompt } = await req.json();
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized !!" },
        { status: 401 }
      );
    }
    // Connect to the database and fetch all chats for the user
    await connectionDB();
    const chat = await chatModel.findOne({ userId, _id: chatId });
    if (!chat) {
      return NextResponse.json(
        { success: false, message: "Chat not found" },
        { status: 404 }
      );
    }
    // create a new chat response
    const userPrompt = {
      role: "user",
      content: prompt,
      timestamp: Date.now(),
    };

    chat.messages.push(userPrompt);
    // call the OpenAI API to get the response
    const response = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [{ role: "user", content: prompt }],
      store: true,
    });

    const message = response.choices[0].message;
    message.timestamp = Date.now();
    chat.messages.push(message);
    // Save the updated chat to the database
    await chat.save();
    // Return the updated chat as a JSON response
    return NextResponse.json({ success: true, data: message }, { status: 200 });
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error fetching chats:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
