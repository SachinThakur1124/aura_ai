import connectionDB from "@/context/db";
import chatModel from "@/models/chat/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    // Prepare chat data to be saved
    const chatData = {
      userId,
      messages: [],
      name:"New Chat"
    };
    // Create a new chat instance
    await connectionDB();
    await chatModel.create(chatData);
    // Return success response
    return NextResponse.json(
      { success: true, message: "Chat created successfully" },
      { status: 200 }
    );
  } catch (error) {
    // console.error("Error creating chat:", error );
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
