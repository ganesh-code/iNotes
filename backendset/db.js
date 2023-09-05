// Import the mongoose library for MongoDB interaction
const mongoose = require("mongoose");

// Define the MongoDB connection URI
const mongoURI = "mongodb+srv://ganesh:7vpobKjupQwJgXUf@cluster0.kyaw8ee.mongodb.net/";

// Define an asynchronous function to connect to the MongoDB database
async function connectToMongo() {
    try {
        // Use the mongoose.connect() method to establish a connection to MongoDB
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true, // Use new URL parser
            useUnifiedTopology: true, // Use new Server Discovery and Monitoring engine
        });

        // console.log('Connected to MongoDB'); // Log a success message if the connection is successful
    } catch (error) {
        // If an error occurs during the connection attempt, handle the error
        console.error('Error connecting to MongoDB:', error.message);
    }
}

// Export the connectToMongo function to be used in other parts of your application
module.exports = connectToMongo;
