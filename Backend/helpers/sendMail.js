const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const Expense = require("../models/Expense");

dotenv.config();

function createTransporter(config) {
  const transporter = nodemailer.createTransport(config);
  return transporter;
}

let configurations = {
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  requireTLS: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
};

const sendMail = async (messageoption) => {
  try {
    const transporter = createTransporter(configurations);
    await transporter.verify();
    console.log("Email transporter verified");

    const info = await transporter.sendMail(messageoption);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error.message);
  }
};

const expenseEmail = async (userId) => {
  try {
    const expenses = await Expense.find({ userId });

    const totalExpense = expenses.reduce(
      (acc, expense) => acc + expense.value,
      0
    );

    if (totalExpense > 10000) {
      const messageOption = {
        from: process.env.EMAIL,
        to: process.env.ADMIN_EMAIL,
        subject: "Warning: High Expenses",
        text: `Your total expenses have exceeded ₹10,000. Please review your spending.`,
      };

      await sendMail(messageOption);
    }
  } catch (err) {
    console.error("Error in expenseEmail:", err.message);
  }
};

module.exports = {
  sendMail,
  expenseEmail,
};
