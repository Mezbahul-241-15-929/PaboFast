import dbConnect, { colletionNameObj } from "@/lib/dbConnect";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return new Response(JSON.stringify({ error: "Missing email" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const userCollection = await dbConnect(colletionNameObj.userColletion);
  const user = await userCollection.findOne({ email });

  return new Response(JSON.stringify({ exists: !!user }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
