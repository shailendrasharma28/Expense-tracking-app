const express = require('express');
const app = express();
const cors = require("cors");
const db = require('./config/db-connection');
const expenseRoutes = require('./routes/expenseRoutes');

// Port Defined...
const port = 3000;
app.use(express.static('public'));
app.use(express.json());
app.use(cors({
  origin: "*"
}));

app.use("/expenses", expenseRoutes);

// Middleware which logs the method of request and Url
app.use((req, res, next) => {
  const method = req.method;
  const url = req.url;
  console.log(`${method} request made to ${url}`);
  next();
})

db.sync({alter: true}).then(() => {
  // Listening server on port...
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
})
.catch((err) => {
  console.log("Unable to connect with databse!", err);
})
