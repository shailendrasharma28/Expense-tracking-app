const express = require('express');
const path = require("path");
const fs = require("fs");
const app = express();
const cors = require("cors");
const userRoutes = require('./backend/routes/userRoutes');
const forgetPassRoutes = require('./backend/routes/forgetPassRoutes');
const expenseRoutes = require('./backend/routes/expenseRoutes');
const paymentRoutes = require('./backend/routes/paymentRoutes');
const premiumRoutes = require('./backend/routes/premiumRoutes');
const compression = require('compression');
const morgan = require('morgan');
const connectMongo = require('./backend/config/mongo_db_connect');

require("dotenv").config({ quiet: true })
// Port Defined...
const PORT = process.env.PORT;
app.use(express.static(path.join(__dirname, "public/src")));
app.use(express.static(path.join(__dirname, "frontend")));
app.use(express.static(path.join(__dirname, "frontend/pages")));
app.use(express.json());
app.use(cors({
  origin: "*"
}));

const accessLogs = fs.createWriteStream(path.join(__dirname, `access.log`), {flags: `a`})
// app.use(helmet());
app.use(compression());
app.use(morgan('combined', {stream: accessLogs}))

app.use("/users", userRoutes);
app.use("/password", forgetPassRoutes);
app.use("/expenses", expenseRoutes);
app.use("/payment", paymentRoutes);
app.use("/premium", premiumRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"))
});
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"))
});
app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "/frontend/pages/signup.html"))
});
app.get("/forget-password", (req, res) => {
  res.sendFile(path.join(__dirname, "/frontend/pages/forgetPass.html"))
});
app.get("/reset-password", (req, res) => {
  res.sendFile(path.join(__dirname, "/frontend/pages/resetPass.html"))
});
app.get("/expense/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "/frontend/pages/expense.html"))
});
app.get("/expense/leaderboard", (req, res) => {
  res.sendFile(path.join(__dirname, "/frontend/pages/leaderboard.html"))
});
app.get("/expense/reports", (req, res) => {
  res.sendFile(path.join(__dirname, "/frontend/pages/reports.html"))
});
app.get("/payment/order/:orderId", (req, res) => {
  setTimeout(() => {
    res.sendFile(path.join(__dirname, "/frontend/pages/expense.html"))
  },4000);
});

// Middleware which logs the method of request and Url
app.use((req, res, next) => {
  const method = req.method;
  const url = req.url;
  console.log(`${method} request made to ${url}`);
  next();
})

connectMongo();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
