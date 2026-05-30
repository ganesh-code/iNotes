/**
 * MongoDB Atlas connectivity check (Node.js).
 *
 * Install and run:
 *   npm install mongodb && MONGODB_URI="your-atlas-uri" node mongodbPing.js
 *
 * This script checks if Atlas is reachable by sending a lightweight "ping"
 * command. It avoids hardcoding secrets and reads MONGODB_URI from environment
 * variables first, then from mongodb.config.json as a beginner-friendly fallback.
 */

const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

function getMongoUri() {
  // Environment variables are the safest default for credentials.
  if (process.env.MONGODB_URI && process.env.MONGODB_URI.trim()) {
    return process.env.MONGODB_URI.trim();
  }

  // Fallback file helps first-time users run quickly without shell env setup.
  const configPath = path.join(__dirname, "mongodb.config.json");
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      if (config.MONGODB_URI && String(config.MONGODB_URI).trim()) {
        return String(config.MONGODB_URI).trim();
      }
    } catch (error) {
      throw new Error(`Could not parse mongodb.config.json: ${error.message}`);
    }
  }

  throw new Error(
    "MONGODB_URI not found. Set it in environment or mongodb.config.json."
  );
}

async function runPingCheck() {
  let client;

  try {
    console.log("1) Reading MongoDB connection settings...");
    const uri = getMongoUri();
    console.log("   Connection string source found.");

    console.log("2) Connecting to MongoDB Atlas...");
    client = new MongoClient(uri);
    await client.connect();
    console.log("   Connected.");

    console.log("3) Sending ping command...");
    // Ping is a lightweight server command used to verify connectivity quickly.
    await client.db("admin").command({ ping: 1 });

    console.log("4) Success: MongoDB Atlas connection is working.");
  } catch (error) {
    console.error("Connection check failed:", error.message);
    process.exitCode = 1;
  } finally {
    if (client) {
      console.log("5) Closing MongoDB connection...");
      await client.close();
      console.log("   Connection closed.");
    }
  }
}

runPingCheck();
