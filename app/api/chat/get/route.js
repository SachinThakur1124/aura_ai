import connectionDB from "@/context/db";
import chatModel from "@/models/chat/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    // Connect to the database and fetch all chats for the user
    await connectionDB();
    const chats = await chatModel.find({ userId });
    // Return the fetched chats as a JSON response
    return NextResponse.json({ success: true, data: chats }, { status: 200 });
  } catch (error) {
    // Handle any errors that occur during the process
    // console.error("Error fetching chats:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
