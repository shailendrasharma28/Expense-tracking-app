const express = require('express');
const path = require("path");
const app = express();
const cors = require("cors");
const db = require('./backend/config/db-connection');
const userRoutes = require('./backend/routes/userRoutes');
const expenseRoutes = require('./backend/routes/expenseRoutes');
const paymentRoutes = require('./backend/routes/paymentRoutes');
const User = require('./backend/models/userModel');
const Expenses = require('./backend/models/expenseModel');
const Payment = require('./backend/models/paymentModel');

// Port Defined...
const port = 4000;
app.use(express.static(path.join(__dirname, "public/src")));
app.use(express.static(path.join(__dirname, "frontend")));
app.use(express.static(path.join(__dirname, "frontend/pages")));
app.use(express.json());
app.use(cors({
  origin: "*"
}));

app.use("/users", userRoutes);
app.use("/expenses", expenseRoutes);
app.use("/payment", paymentRoutes);

User.hasMany(Expenses, {foreignKey: "user_id", onDelete: "CASCADE"});
Expenses.belongsTo(User, {foreignKey: "user_id"});

User.hasMany(Payment, {foreignKey: "user_id", onDelete: "CASCADE"});
Payment.belongsTo(User, {foreignKey: "user_id"});

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
