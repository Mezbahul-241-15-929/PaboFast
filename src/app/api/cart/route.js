import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import dbConnect, { colletionNameObj } from "@/lib/dbConnect";

const normalizeId = (value) => {
  if (typeof value !== "string") return value;
  const match = value.match(/ObjectId\("([0-9a-fA-F]{24})"\)/);
  return match ? match[1] : value;
};

const toObjectIdIfPossible = (value) => {
  const normalized = normalizeId(value);
  if (typeof normalized === "string" && ObjectId.isValid(normalized)) {
    return new ObjectId(normalized);
  }
  return normalized;
};

const buildIdentityQuery = (userId, email) => {
  const query = {};
  if (userId) {
    query.user_id = toObjectIdIfPossible(userId);
  }
  if (email) {
    query.email = email;
  }
  return query;
};

export const POST = async (req) => {
  try {
    const body = await req.json();
    const { user_id, email, product_id, productId, items, quantity } = body || {};

    if (!user_id && !email) {
      return NextResponse.json(
        { message: "user_id or email is required" },
        { status: 400 }
      );
    }

    const resolvedProductId = product_id || productId;
    if (!resolvedProductId && !Array.isArray(items)) {
      return NextResponse.json(
        { message: "product_id or items is required" },
        { status: 400 }
      );
    }

    const qty = Number(quantity ?? 1);
    if (resolvedProductId) {
      if (!Number.isFinite(qty) || qty <= 0) {
        return NextResponse.json(
          { message: "quantity must be a positive number" },
          { status: 400 }
        );
      }
    }

    const cartCollection = await dbConnect(
      colletionNameObj.cartCollection
    );

    const identityQuery = buildIdentityQuery(user_id, email);
    const resolvedDbProductId = resolvedProductId
      ? toObjectIdIfPossible(resolvedProductId)
      : null;

    const existingCart = await cartCollection.findOne(identityQuery);

    if (!existingCart) {
      const initialItems = Array.isArray(items)
        ? items
            .filter((item) => item?.productId || item?.product_id)
            .map((item) => ({
              product_id: toObjectIdIfPossible(
                item.product_id || item.productId
              ),
              quantity: Number(item.quantity ?? 1),
            }))
        : resolvedDbProductId
        ? [{ product_id: resolvedDbProductId, quantity: qty }]
        : [];

      const doc = {
        user_id: user_id ? toObjectIdIfPossible(user_id) : null,
        email: email || null,
        items: initialItems,
        updatedAt: new Date(),
      };

      const result = await cartCollection.insertOne(doc);
      return NextResponse.json(
        { ...doc, _id: result.insertedId.toString() },
        { status: 201 }
      );
    }

    if (Array.isArray(items)) {
      for (const item of items) {
        const itemProductId = toObjectIdIfPossible(
          item?.product_id || item?.productId
        );
        if (!itemProductId) continue;
        const itemQty = Number(item?.quantity ?? 1);
        if (!Number.isFinite(itemQty) || itemQty <= 0) continue;

        const exists = (existingCart.items || []).find(
          (entry) => String(entry.product_id) === String(itemProductId)
        );

        if (exists) {
          await cartCollection.updateOne(
            { _id: existingCart._id, "items.product_id": exists.product_id },
            {
              $inc: { "items.$.quantity": itemQty },
              $set: { updatedAt: new Date() },
            }
          );
        } else {
          await cartCollection.updateOne(
            { _id: existingCart._id },
            {
              $push: {
                items: { product_id: itemProductId, quantity: itemQty },
              },
              $set: { updatedAt: new Date() },
            }
          );
        }
      }
    } else if (resolvedDbProductId) {
      const existingItem = (existingCart.items || []).find(
        (item) => String(item.product_id) === String(resolvedDbProductId)
      );

      if (existingItem) {
        await cartCollection.updateOne(
          { _id: existingCart._id, "items.product_id": existingItem.product_id },
          {
            $inc: { "items.$.quantity": qty },
            $set: { updatedAt: new Date() },
          }
        );
      } else {
        await cartCollection.updateOne(
          { _id: existingCart._id },
          {
            $push: { items: { product_id: resolvedDbProductId, quantity: qty } },
            $set: { updatedAt: new Date() },
          }
        );
      }
    }

    const updated = await cartCollection.findOne({ _id: existingCart._id });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to update cart", error: error.message },
      { status: 500 }
    );
  }
};

export const GET = async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");
    const email = searchParams.get("email");

    const cartCollection = await dbConnect(
      colletionNameObj.cartCollection
    );

    const identityQuery = buildIdentityQuery(user_id, email);
    if (!Object.keys(identityQuery).length) {
      return NextResponse.json(
        { message: "Provide user_id or email" },
        { status: 400 }
      );
    }

    const cart = await cartCollection.findOne(identityQuery);
    return NextResponse.json(cart || null);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to load cart", error: error.message },
      { status: 500 }
    );
  }
};

export const DELETE = async (req) => {
  try {
    const body = await req.json();
    const { user_id, email, product_id, productId } = body || {};

    if (!user_id && !email) {
      return NextResponse.json(
        { message: "user_id or email is required" },
        { status: 400 }
      );
    }

    const cartCollection = await dbConnect(
      colletionNameObj.cartCollection
    );

    const identityQuery = buildIdentityQuery(user_id, email);
    const resolvedProductId = product_id || productId;

    if (resolvedProductId) {
      const productObjectId = toObjectIdIfPossible(resolvedProductId);
      await cartCollection.updateOne(identityQuery, {
        $pull: { items: { product_id: productObjectId } },
        $set: { updatedAt: new Date() },
      });
    } else {
      await cartCollection.updateOne(identityQuery, {
        $set: { items: [], updatedAt: new Date() },
      });
    }

    const updated = await cartCollection.findOne(identityQuery);
    return NextResponse.json(updated || null);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to remove item", error: error.message },
      { status: 500 }
    );
  }
};

export const PUT = async (req) => {
  try {
    const body = await req.json();
    const { user_id, email, product_id, productId, quantity } = body || {};

    if (!user_id && !email) {
      return NextResponse.json(
        { message: "user_id or email is required" },
        { status: 400 }
      );
    }

    const resolvedProductId = product_id || productId;
    if (!resolvedProductId) {
      return NextResponse.json(
        { message: "product_id is required" },
        { status: 400 }
      );
    }

    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty < 1) {
      return NextResponse.json(
        { message: "quantity must be at least 1" },
        { status: 400 }
      );
    }

    const cartCollection = await dbConnect(
      colletionNameObj.cartCollection
    );
    const identityQuery = buildIdentityQuery(user_id, email);
    const productObjectId = toObjectIdIfPossible(resolvedProductId);

    await cartCollection.updateOne(
      { ...identityQuery, "items.product_id": productObjectId },
      {
        $set: { "items.$.quantity": qty, updatedAt: new Date() },
      }
    );

    const updated = await cartCollection.findOne(identityQuery);
    return NextResponse.json(updated || null);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to update quantity", error: error.message },
      { status: 500 }
    );
  }
};
