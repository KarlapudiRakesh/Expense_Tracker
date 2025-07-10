const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const expenseRoute = require("./routes/expense");
const authRoute = require("./routes/auth");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoute);
app.use("/api/expenses", expenseRoute);

mongoose
  .connect(process.env.DB_CONNECTION)
  .then(() => console.log("DB connection is successful"))
  .catch((e) => console.log(e));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
