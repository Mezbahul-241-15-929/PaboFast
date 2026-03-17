import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import dbConnect, { colletionNameObj } from "@/lib/dbConnect";

// ✅ Normalize ObjectId string
const normalizeId = (value) => {
  if (typeof value !== "string") return value;
  const match = value.match(/ObjectId\("([0-9a-fA-F]{24})"\)/);
  return match ? match[1] : value;
};

// ✅ Convert to ObjectId if possible
const toObjectIdIfPossible = (value) => {
  const normalized = normalizeId(value);
  if (typeof normalized === "string" && ObjectId.isValid(normalized)) {
    return new ObjectId(normalized);
  }
  return normalized;
};

// ✅ GET ALL PRODUCTS
export const GET = async () => {
  try {
    const productCollection = await dbConnect(
      colletionNameObj.productCollection
    );

    const products = await productCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const formatted = products.map((p) => ({
      ...p,
      _id: p._id.toString(),
      category_id:
        typeof p.category_id === "object"
          ? p.category_id.toString()
          : p.category_id,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to load products", error: error.message },
      { status: 500 }
    );
  }
};

// ✅ CREATE PRODUCT
export const POST = async (req) => {
  try {
    const body = await req.json();

    const productCollection = await dbConnect(
      colletionNameObj.productCollection
    );

    const doc = {
      sku: body.sku?.trim(),
      name: body.name?.trim(),
      description: body.description?.trim(),
      price: Number(body.price),
      stock: Number(body.stock),
      category_id: toObjectIdIfPossible(body.category_id),
      images: Array.isArray(body.images) ? body.images : [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await productCollection.insertOne(doc);

    return NextResponse.json(
      {
        ...doc,
        _id: result.insertedId.toString(),
        category_id: body.category_id,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Create failed", error: error.message },
      { status: 500 }
    );
  }
};