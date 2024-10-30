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
    if (req.method === 'POST') {
        const { db } = await connectToDatabase();
        const wishesCollection = db.collection('wishes');
        const { userId, name, message } = req.body;

        await wishesCollection.insertOne({
            userId,
            name,
            message,
            timestamp: new Date(),
        });

        res.status(201).json({ message: 'Wish saved successfully!' });
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};
