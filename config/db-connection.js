const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("test", "root", "", {
  host: "localhost",
  dialect: "mysql",
  logging: false
})

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.log("Unable to connect to the database!", error);
  }
}

testConnection();

module.exports = sequelize;


// const mysql = require("mysql2");

// const connection = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "mydb",
// });

// connection.connect((err) => {
//   if (err) {
//     console.log(err);
//   }
//   console.log("Connection established Successfully!");
// });

// module.exports = connection;
