const connectToMongo = require("./db");
const express = require('express')
const app = express()
const port = 5500;
connectToMongo();

// respond with "hello world" when a GET request is made to the homepage
app.get('/', (req, res) => {
  res.send('hello ganesh')
})

app.use(express.json()) //middleware

//routes
app.use("/api/auth", require("./routes/userAut"));
app.use("/api/notes", require("./routes/notes"));

app.listen(port, ()=>{
 console.log(`Example app listening at http://localhost:${port}`)
});