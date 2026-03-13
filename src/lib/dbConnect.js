import { MongoClient, ServerApiVersion } from "mongodb";

export const colletionNameObj={
    servicescoll: "services",
    userColletion: "users",
}

const uri = process.env.MONGODB_URI;

function dbConnect(collectionName) {

    const client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    });

    return client
        .db(process.env.DB_NAME)
        .collection(collectionName);
}

export default dbConnect;