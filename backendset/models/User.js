// Import the mongoose library
const mongoose = require('mongoose');
// Destructure the Schema class from mongoose
const { Schema } = mongoose;

// Define a new schema for the user
const UserSchema = new Schema({
  // Define the 'name' field
  name: {
    type: String, // Field data type is String
    required: [true, 'Name is Required'] // Name is required, and an error message is provided if missing
  },
  // Define the 'email' field
  email: {
    type: String, // Field data type is String
    required: [true, 'Email is Required'], // Email is required, and an error message is provided if missing
    unique: true // Ensures that email values are unique in the collection
  },
  // Define the 'password' field
  password: {
    type: String || Number, // Field data type is either String or Number
    required: [true, 'Password is Required'] // Password is required, and an error message is provided if missing
  },
});

// Export the User model based on the UserSchema
module.exports = mongoose.model("user", UserSchema);