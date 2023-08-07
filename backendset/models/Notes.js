// Import the mongoose library
const mongoose = require('mongoose');
// Destructure the Schema class from mongoose
const { Schema } = mongoose;

// Define a new schema for the notes
const NotesSchema = new Schema({
  // Define the 'title' field
  title: {
    type: String, // Field data type is String
    required: [true, 'Title is Required'] // Title is required, and an error message is provided if missing
  },
  // Define the 'description' field
  description: {
    type: String // Field data type is String
  },
  // Define the 'tag' field
  tag: {
    type: String, // Field data type is String
    default: "General", // Default value is "General"
    required: [true, 'Tag is required'] // Tag is required, and an error message is provided if missing
  },
  // Define the 'date' field
  date: {
    type: Date, // Field data type is Date
    default: Date.now // Default value is the current date and time
  }
});

// Export the notes model based on the NotesSchema
module.exports = mongoose.model("notes", NotesSchema);
