// Import the mongoose library for MongoDB interaction
const mongoose = require("mongoose");
const mongoURI = process.env.MONGO_URL;

// Define an asynchronous function to connect to the MongoDB database
async function connectToMongo() {
    const mongoURI = process.env.MONGO_URL;

    if (!mongoURI) {
        throw new Error("MONGO_URL not configured");
    }

    await mongoose.connect(mongoURI);

    console.log("Connected to MongoDB");
}

// Export the connectToMongo function to be used in other parts of your application
module.exports = connectToMongo;
