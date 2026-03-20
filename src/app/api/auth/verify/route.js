import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect, { colletionNameObj } from "@/lib/dbConnect";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token missing" }, { status: 400 });
  }

  try {
    // ✅ 1. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const email = decoded.email;

    // ✅ 2. Connect DB
    const userCollection = await dbConnect(colletionNameObj.userColletion);

    // ✅ 3. Update user as verified
    const result = await userCollection.updateOne(
      { email },
      { $set: { emailVerified: true } }
    );

    return NextResponse.json({ message: "Email verified successfully" });

  } catch (error) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }
}