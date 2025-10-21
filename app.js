const express = require('express');
const path = require("path");
const fs = require("fs");
const app = express();
const cors = require("cors");
const db = require('./backend/config/db-connection');
const userRoutes = require('./backend/routes/userRoutes');
const forgetPassRoutes = require('./backend/routes/forgetPassRoutes');
const expenseRoutes = require('./backend/routes/expenseRoutes');
const paymentRoutes = require('./backend/routes/paymentRoutes');
const premiumRoutes = require('./backend/routes/premiumRoutes');
const User = require('./backend/models/userModel');
const Expenses = require('./backend/models/expenseModel');
const Payment = require('./backend/models/paymentModel');
const ForgetPasswordRequest = require('./backend/models/forgetPasswordRequests');
const { default: helmet } = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

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


User.hasMany(Expenses, {foreignKey: "user_id", onDelete: "CASCADE"});
Expenses.belongsTo(User, {foreignKey: "user_id"});

User.hasMany(Payment, {foreignKey: "user_id", onDelete: "CASCADE"});
Payment.belongsTo(User, {foreignKey: "user_id"});

User.hasMany(ForgetPasswordRequest, {foreignKey: "user_id", onDelete: "CASCADE"});
ForgetPasswordRequest.belongsTo(User, {foreignKey: "user_id"});

// Middleware which logs the method of request and Url
app.use((req, res, next) => {
  const method = req.method;
  const url = req.url;
  console.log(`${method} request made to ${url}`);
  next();
})

db.sync({alter: true}).then(() => {
  // Listening server on port...
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
})
.catch((err) => {
  console.log("Unable to connect with databse!", err);
})
