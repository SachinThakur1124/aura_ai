import chatModel from "@/models/chat/Chat";
import { getAuth } from "@clerk/nextjs/server";
import connectionDB from "@/context/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized !!" },
        { status: 401 }
      );
    }

    //  Connect to the database here
    await connectionDB();
    const { chatId, name } = await req.json();
    // Connect to the database and fetch all chats for the user
    const chat = await chatModel.findOneAndUpdate(
      { _id: chatId, userId },
      { name }
    );
    if (!chat) {
      return NextResponse.json(
        { success: false, message: "Chat not found" },
        { status: 404 }
      );
    }
    // Return the updated chat as a JSON response
    return NextResponse.json(
      { success: true, message: "Chat Renamed !!" },
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
