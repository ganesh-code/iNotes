#!/usr/bin/env node
/**
 * MongoDB Atlas connectivity check.
 *
 *   node scripts/mongodb-ping.js
 *
 * Reads MONGO_URL / MONGODB_URI from the repository root `.env`.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
require(path.join(ROOT, 'backendset/config/loadEnv')).loadRootEnvFile();

const { MongoClient } = require(path.join(ROOT, 'backendset/node_modules/mongodb'));

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

async function runPingCheck() {
  let client;

  try {
    console.log('1) Reading MongoDB connection settings...');
    const uri = getMongoUri();
    console.log('   Connection string source found.');

    console.log('2) Connecting to MongoDB Atlas...');
    client = new MongoClient(uri);
    await client.connect();
    console.log('   Connected.');

    console.log('3) Sending ping command...');
    await client.db('admin').command({ ping: 1 });

    console.log('4) Success: MongoDB Atlas connection is working.');
  } catch (error) {
    console.error('Connection check failed:', error.message);
    process.exitCode = 1;
  } finally {
    if (client) {
      console.log('5) Closing MongoDB connection...');
      await client.close();
      console.log('   Connection closed.');
    }
  }
}

runPingCheck();
