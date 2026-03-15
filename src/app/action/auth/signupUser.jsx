"use server";

import bcrypt from "bcrypt";
import dbConnect, { colletionNameObj } from "@/lib/dbConnect";

export const signupUser = async (playload) => {
    const userCollection = dbConnect(colletionNameObj.userColletion);
    const { email, password } = playload;

    if (!email || !password) {
        return null;
    }

    const user = await userCollection.findOne({ email: playload.email });

    if (!user) {
        const hashedPassword = await bcrypt.hash(password, 10);
        playload.password = hashedPassword;

        // Add role, verified flag, createdAt, and updatedAt fields
        playload.role = "user";
        playload.verified = false; // user is not verified by default
        playload.createdAt = new Date();
        playload.updatedAt = new Date();

        const result = await userCollection.insertOne(playload);

        result.insertedId = result.insertedId.toString();
        console.log("post api result", result);
        return result;
    }
   
};
