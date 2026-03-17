import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";
import dbConnect, { colletionNameObj } from "@/lib/dbConnect";
import { authOptions } from "@/lib/authOptions";

const normalizeIdString = (value) => {
  if (typeof value !== "string") return value;
  const decoded = decodeURIComponent(value).trim();
  const objectIdMatch = decoded.match(/ObjectId\((["'])([0-9a-fA-F]{24})\1\)/);
  if (objectIdMatch) return objectIdMatch[2];
  const jsonOidMatch = decoded.match(/^\{\s*"\$oid"\s*:\s*"([0-9a-fA-F]{24})"\s*\}$/);
  if (jsonOidMatch) return jsonOidMatch[1];
  return decoded;
};

const buildIdFilter = (id) => {
  if (!id) return null;
  const normalized = normalizeIdString(id);
  const filters = [{ _id: normalized }];
  if (normalized !== id) {
    filters.push({ _id: id });
  }
  if (typeof normalized === "string" && ObjectId.isValid(normalized)) {
    const objectId = new ObjectId(normalized);
    filters.push({ _id: objectId });
    filters.push({ _id: `ObjectId("${normalized}")` });
  }
  return { $or: filters };
};

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const requireAdmin = async () => {
  const session = await getServerSession(authOptions);
  const role = session?.user?.dbUser?.role;
  return role === "admin";
};

export const GET = async () => {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.dbUser?.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userCollection = await dbConnect(colletionNameObj.userColletion);

    const users = await userCollection
      .find({}, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .limit(200) // 🔥 safety limit
      .toArray();

    const payload = users.map((user) => ({
      _id: user._id?.toString?.() || user._id,
      name: user.name || user.fullName || "Unnamed",
      email: user.email || "",
      photo: user.photo || user.image || null,
      role: user.role || "user",
      createdAt: user.createdAt || null,
      verified:
        user.verified ??
        user.emailVerified ??
        user.isVerified ??
        user.isEmailVerified ??
        null,
    }));

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        "Cache-Control": "private, max-age=30", // 🔥 small cache
      },
    });
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json(
      { message: "Failed to load users" },
      { status: 500 }
    );
  }
};

export const PATCH = async (request) => {
  try {
    const isAdmin = await requireAdmin();
    if (!isAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const id = body?.id;
    const email = body?.email;
    const role = body?.role;

    if ((!id && !email) || !role) {
      return NextResponse.json(
        { message: "User id (or email) and role are required" },
        { status: 400 }
      );
    }

    if (!["admin", "user"].includes(role)) {
      return NextResponse.json(
        { message: "Role must be admin or user" },
        { status: 400 }
      );
    }

    const filter = id ? buildIdFilter(id) : null;

    const userCollection = await dbConnect(colletionNameObj.userColletion);
    let result = null;
    if (filter) {
      result = await userCollection.findOneAndUpdate(
        filter,
        { $set: { role, updatedAt: new Date() } },
        { returnDocument: "after", projection: { password: 0 } }
      );
    }

    if (!result?.value && email) {
      result = await userCollection.findOneAndUpdate(
        { email },
        { $set: { role, updatedAt: new Date() } },
        { returnDocument: "after", projection: { password: 0 } }
      );
    }

    if (!result?.value && email) {
      const normalizedEmail = String(email).trim().toLowerCase();
      const emailRegex = new RegExp(`^${escapeRegex(normalizedEmail)}$`, "i");
      result = await userCollection.findOneAndUpdate(
        { email: emailRegex },
        { $set: { role, updatedAt: new Date() } },
        { returnDocument: "after", projection: { password: 0 } }
      );
    }

    if (!result?.value) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "Role updated",
        user: {
          _id: result.value._id?.toString?.() || result.value._id,
          name: result.value.name || result.value.fullName || "Unnamed",
          email: result.value.email || "",
          photo: result.value.photo || result.value.image || null,
          role: result.value.role || role,
          createdAt: result.value.createdAt || null,
          verified:
            result.value.verified ??
            result.value.emailVerified ??
            result.value.isVerified ??
            result.value.isEmailVerified ??
            null,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH /api/users error:", error);
    return NextResponse.json(
      { message: "Failed to update role", error: error?.message || "unknown" },
      { status: 500 }
    );
  }
};
