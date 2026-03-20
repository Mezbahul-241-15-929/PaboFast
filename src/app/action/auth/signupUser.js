"use server";

import bcrypt from "bcrypt";
import dbConnect, { colletionNameObj } from "@/lib/dbConnect";

// ✅ NEW imports
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "@/lib/sendVerificationEmail";

export const signupUser = async (playload) => {
    const userCollection = await dbConnect(colletionNameObj.userColletion);
    const { email, password } = playload;

    if (!email || !password) {
        return null;
    }

    const user = await userCollection.findOne({ email: playload.email });

    if (!user) {
        const hashedPassword = await bcrypt.hash(password, 10);
        playload.password = hashedPassword;

        // Add role, createdAt, and updatedAt fields
        playload.role = "user";
        playload.emailVerified = false;
        playload.createdAt = new Date();
        playload.updatedAt = new Date();

        const result = await userCollection.insertOne(playload);

        result.insertedId = result.insertedId.toString();
        console.log("post api result", result);

        // ✅ NEW: Generate verification token
        const token = jwt.sign(
            { email: playload.email },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // ✅ NEW: Send verification email using your existing function
        await sendVerificationEmail(playload.email, token);

        return result;
    }
};