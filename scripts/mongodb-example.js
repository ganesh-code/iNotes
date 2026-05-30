#!/usr/bin/env node
/**
 * MongoDB Atlas beginner CRUD example.
 *
 *   node scripts/mongodb-example.js
 *
 * Reads MONGO_URL / MONGODB_URI from the repository root `.env`.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
require(path.join(ROOT, 'backendset/config/loadEnv')).loadRootEnvFile();

const { MongoClient, ObjectId } = require(path.join(ROOT, 'backendset/node_modules/mongodb'));

function getMongoUri() {
  if (process.env.MONGODB_URI?.trim()) return process.env.MONGODB_URI.trim();
  if (process.env.MONGO_URL?.trim()) return process.env.MONGO_URL.trim();

  const configPath = path.join(__dirname, 'mongodb.config.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (config.MONGODB_URI?.trim()) return String(config.MONGODB_URI).trim();
  }

  throw new Error(
    'MONGO_URL / MONGODB_URI not found. Set MONGO_URL in the root .env (see .env.example).'
  );
}

async function run() {
  const uri = getMongoUri();
  const client = new MongoClient(uri);

  const dbName = 'inotes_app';
  const collectionName = 'notes';

  try {
    console.log('1) Connecting to MongoDB Atlas...');
    await client.connect();
    console.log('   Connected successfully.');

    const db = client.db(dbName);
    const notes = db.collection(collectionName);

    console.log('2) Inserting 10 realistic note documents...');
    const now = Date.now();
    const docs = [
      {
        userId: 'user_1001',
        title: 'Project kickoff checklist',
        content: 'Finalize goals, timeline, and owner list for sprint 1.',
        tags: ['work', 'planning'],
        isArchived: false,
        createdAt: new Date(now - 1000 * 60 * 60 * 48),
      },
      {
        userId: 'user_1001',
        title: 'Grocery list',
        content: 'Milk, eggs, spinach, yogurt, and coffee beans.',
        tags: ['personal', 'shopping'],
        isArchived: false,
        createdAt: new Date(now - 1000 * 60 * 60 * 36),
      },
      {
        userId: 'user_1002',
        title: 'Interview prep',
        content: 'Review Node streams, event loop, and MongoDB indexing basics.',
        tags: ['career', 'learning'],
        isArchived: false,
        createdAt: new Date(now - 1000 * 60 * 60 * 30),
      },
      {
        userId: 'user_1003',
        title: 'Travel packing',
        content: 'Passport, charger, adapter, medicines, and print itinerary.',
        tags: ['travel'],
        isArchived: false,
        createdAt: new Date(now - 1000 * 60 * 60 * 24),
      },
      {
        userId: 'user_1002',
        title: 'Backend bug notes',
        content: 'Investigate duplicate requests caused by retry middleware.',
        tags: ['work', 'debug'],
        isArchived: false,
        createdAt: new Date(now - 1000 * 60 * 60 * 20),
      },
      {
        userId: 'user_1004',
        title: 'Workout log',
        content: 'Push: bench 60kg, shoulder press 25kg, triceps dips.',
        tags: ['health'],
        isArchived: false,
        createdAt: new Date(now - 1000 * 60 * 60 * 14),
      },
      {
        userId: 'user_1001',
        title: 'Reading highlights',
        content: 'Atomic Habits: make good habits obvious and easy.',
        tags: ['books'],
        isArchived: false,
        createdAt: new Date(now - 1000 * 60 * 60 * 9),
      },
      {
        userId: 'user_1003',
        title: 'Client meeting summary',
        content: 'Approved wireframes, requested dashboard export in CSV.',
        tags: ['work', 'meetings'],
        isArchived: false,
        createdAt: new Date(now - 1000 * 60 * 60 * 6),
      },
      {
        userId: 'user_1005',
        title: 'Recipe idea',
        content: 'Try paneer tikka wrap with mint yogurt sauce.',
        tags: ['food'],
        isArchived: false,
        createdAt: new Date(now - 1000 * 60 * 60 * 3),
      },
      {
        userId: 'user_1002',
        title: 'Tomorrow priorities',
        content: 'Finish auth flow, write tests, and deploy staging build.',
        tags: ['work', 'todo'],
        isArchived: false,
        createdAt: new Date(now - 1000 * 60 * 30),
      },
    ];

    const insertResult = await notes.insertMany(docs);
    console.log(`   Inserted ${insertResult.insertedCount} documents.`);

    console.log('3) Reading 5 most recent full documents...');
    const recentFive = await notes.find({}).sort({ createdAt: -1 }).limit(5).toArray();
    console.log(JSON.stringify(recentFive, null, 2));

    const firstInsertedId = insertResult.insertedIds[0];
    console.log(`4) Reading one full document by _id (${firstInsertedId})...`);
    const oneDoc = await notes.findOne({ _id: new ObjectId(firstInsertedId) });
    console.log(JSON.stringify(oneDoc, null, 2));
  } catch (err) {
    console.error('MongoDB example failed:', err.message);
    process.exitCode = 1;
  } finally {
    console.log('5) Closing MongoDB connection...');
    await client.close();
    console.log('   Connection closed.');
  }
}

run();
