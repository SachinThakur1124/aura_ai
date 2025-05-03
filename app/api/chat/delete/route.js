import chatModel from "@/models/chat/Chat";
import { getAuth } from "@clerk/nextjs/server";
import connectionDB from "@/context/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    const { chatId } = await req.json();
    if (!chatId) {
      return NextResponse.json(
        { success: false, message: "Chat ID is required" },
        { status: 400 }
      );
    }
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized!!" },
        { status: 401 }
      );
    }
    // Connect to the database
    await connectionDB();
    // Find and delete the chat by ID
    await chatModel.findOneAndDelete({ _id: chatId, userId });
    // Return success response
    return NextResponse.json(
      { success: true, message: "Chat deleted successfully!!" },
      { status: 200 }
    );
  } catch (error) {
    // Handle any errors that occur during the process
    // console.error("Error fetching chats:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
