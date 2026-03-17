import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import dbConnect, { colletionNameObj } from "@/lib/dbConnect";

// ✅ Normalize ID
const normalizeId = (value) => {
  if (typeof value !== "string") return value;
  const match = value.match(/ObjectId\("([0-9a-fA-F]{24})"\)/);
  return match ? match[1] : value;
};

// ✅ Extract ID from params/url
const extractId = (request, params) => {
  let id = params?.id;

  if (!id && request?.url) {
    const parts = new URL(request.url).pathname.split("/");
    id = parts.pop();
  }

  return normalizeId(id);
};

// ✅ Convert to ObjectId
const toObjectId = (id) => {
  return ObjectId.isValid(id) ? new ObjectId(id) : id;
};

// ✅ GET SINGLE
export const GET = async (req, { params }) => {
  try {
    const productCollection = await dbConnect(
      colletionNameObj.productCollection
    );

    const id = extractId(req, params);
    if (!id) {
      return NextResponse.json({ message: "ID required" }, { status: 400 });
    }

    const product = await productCollection.findOne({
      _id: toObjectId(id),
    });

    if (!product) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...product,
      _id: product._id.toString(),
      category_id:
        typeof product.category_id === "object"
          ? product.category_id.toString()
          : product.category_id,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed", error: error.message },
      { status: 500 }
    );
  }
};

// ✅ UPDATE PRODUCT (FIXED 🔥)
export const PUT = async (req, { params }) => {
  try {
    const productCollection = await dbConnect(
      colletionNameObj.productCollection
    );

    const id = extractId(req, params);
    if (!id) {
      return NextResponse.json({ message: "ID required" }, { status: 400 });
    }

    const body = await req.json();

    const updateDoc = {
      ...(body.sku && { sku: body.sku.trim() }),
      ...(body.name && { name: body.name.trim() }),
      ...(body.description && { description: body.description.trim() }),
      ...(body.price !== undefined && { price: Number(body.price) }),
      ...(body.stock !== undefined && { stock: Number(body.stock) }),
      ...(body.category_id && {
        category_id: toObjectId(body.category_id),
      }),
      ...(body.images && { images: body.images }),
      updatedAt: new Date(),
    };

    const filter = { _id: toObjectId(id) };

    // ✅ updateOne + findOne (stable)
    const updateRes = await productCollection.updateOne(filter, {
      $set: updateDoc,
    });

    if (updateRes.matchedCount === 0) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    const updated = await productCollection.findOne(filter);

    return NextResponse.json({
      message: "Updated successfully",
      product: {
        ...updated,
        _id: updated._id.toString(),
        category_id:
          typeof updated.category_id === "object"
            ? updated.category_id.toString()
            : updated.category_id,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Update failed", error: error.message },
      { status: 500 }
    );
  }
};

// ✅ DELETE
export const DELETE = async (req, { params }) => {
  try {
    const productCollection = await dbConnect(
      colletionNameObj.productCollection
    );

    const id = extractId(req, params);

    const result = await productCollection.deleteOne({
      _id: toObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: "Delete failed", error: error.message },
      { status: 500 }
    );
  }
};