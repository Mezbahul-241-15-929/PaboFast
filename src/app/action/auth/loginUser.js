import dbConnect, { colletionNameObj } from "@/lib/dbConnect";
import bcrypt from "bcrypt";

export const loginUser = async (credentials) => {
    const { email, password } = credentials;

    const userCollection = await dbConnect(colletionNameObj.userColletion);

    const user = await userCollection.findOne({ email });

    if (!user) return null;

    const isPasswordOK = await bcrypt.compare(password, user.password);

    if (!isPasswordOK) {
        return null;
    }

    return user;
};
