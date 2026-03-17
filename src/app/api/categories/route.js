import { NextResponse } from "next/server";
import dbConnect, { colletionNameObj } from "@/lib/dbConnect";

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

export const GET = async () => {
  try {
    const categoryCollection = await dbConnect(colletionNameObj.categoryCollection);
    const categories = await categoryCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const payload = categories.map((cat) => ({
      ...cat,
      _id: cat._id.toString(),
    }));

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to load categories" },
      { status: 500 }
    );
  }
};

export const POST = async (request) => {
  try {
    const body = await request.json();
    const name = body?.name?.trim();
    if (!name) {
      return NextResponse.json(
        { message: "Category name is required" },
        { status: 400 }
      );
    }

    const slug = body?.slug?.trim() || slugify(name);
    const description = body?.description?.trim() || "";

    const categoryCollection = await dbConnect(colletionNameObj.categoryCollection);
    const existing = await categoryCollection.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { message: "Category already exists", categoryId: existing._id.toString() },
        { status: 200 }
      );
    }

    const now = new Date();
    const result = await categoryCollection.insertOne({
      name,
      slug,
      description,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json(
      {
        _id: result.insertedId.toString(),
        name,
        slug,
        description,
        createdAt: now,
        updatedAt: now,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to create category" },
      { status: 500 }
    );
  }
};
