import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
    if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb };
    }

    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    await client.connect();
    const db = client.db('diwali'); // Replace with your database name
    cachedClient = client;
    cachedDb = db;

    return { client, db };
}

export default async (req, res) => {
    const { method } = req;

    if (method === 'GET') {
        const { db } = await connectToDatabase();
        const likesCollection = db.collection('likes');
        const likesDoc = await likesCollection.findOne({});
        
        res.status(200).json({ count: likesDoc?.count || 0 });
    } else if (method === 'POST') {
        const { db } = await connectToDatabase();
        const likesCollection = db.collection('likes');
        const { increment } = req.body;

        const update = increment ? { $inc: { count: 1 } } : { $inc: { count: -1 } };
        await likesCollection.updateOne({}, update, { upsert: true });
        
        const updatedLikesDoc = await likesCollection.findOne({});
        res.status(200).json({ count: updatedLikesDoc.count });
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
};
