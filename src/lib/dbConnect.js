import { MongoClient, ServerApiVersion } from "mongodb";

export const colletionNameObj={
    servicescoll: "services",
    userColletion: "users",
    categoryCollection: "categories",
    productCollection: "products",
    cartCollection: "carts",
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

if (!global._mongoClientPromise) {
  global._mongoClientPromise = null;
}

async function getClient() {
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }

  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });
    global._mongoClientPromise = client.connect();
  }

  return global._mongoClientPromise;
}

async function dbConnect(collectionName) {
  if (!dbName) {
    throw new Error("DB_NAME is not set");
  }
  const client = await getClient();
  return client.db(dbName).collection(collectionName);
}

export default dbConnect;
