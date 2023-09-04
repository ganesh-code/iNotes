const connectToMongo = require("./db");
const express = require('express')
const app = express()
const cors = require('cors')
const port = 5500;

connectToMongo();

app.use(cors({
  origin: "http://localhost:3000",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Add the necessary HTTP methods
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  optionsSuccessStatus: 204 // Set the response status for successful preflight requests
}));
app.use(express.json()) //middleware


//routes
app.use("/api/auth", require("./routes/userAut"));
app.use("/api/notes", require("./routes/notes"));

app.listen(port, ()=>{
//  console.log(`Example app listening at http://localhost:${port}`)
});