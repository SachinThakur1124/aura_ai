import { Webhook } from "svix";
import connectionDB from "@/context/db";
import userModel from "@/models/user/user";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  const wh = new Webhook(process.env.SIGNING_SECRET);
  const headerPayload = await headers();
  const svixHeaders = {
    "svix-id": headerPayload.get("svix-id"),
    "svix-signature": headerPayload.get("svix-signature"),
  };
  // GET the payload and verify it...
  const payload = await req.json();
  const body = JSON.stringify(payload);
  const { data, type } = wh.verify(body, svixHeaders);
  //Prepare the user data to save...
  const userData = {
    _id: data.id,
    email: data.email_addresses[0].email_address,
    name: `${data.first_name} ${data.last_name}`,
    image: data.image_url,
  };

  await connectionDB();

  switch (type) {
    case "user.created":
      await userModel.create(userData);
      break;
    case "user.updated":
      await userModel.findByIdAndUpdate(data.id, userData);
      break;
    case "user.deleted":
      await userModel.findByIdAndDelete(data.id);
      break;
    default:
      break;
  }

  return NextResponse.json({ message: "Event Recieved" });
};
