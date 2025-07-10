const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const verifyToken = require("../middleware/verifyToken");
const { expenseEmail } = require("../helpers/sendMail");

router.post("/", verifyToken, async (req, res) => {
  const newExpense = new Expense({ ...req.body, userId: req.user.id });

  try {
    const expense = await newExpense.save();

    await expenseEmail(req.user.id);

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/", verifyToken, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.put("/:id", verifyToken, async (req, res) => {
  try {
    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    await expenseEmail(req.user.id);

    res.status(200).json(updatedExpense);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const deletedExpense = await Expense.findByIdAndDelete(req.params.id);

    await expenseEmail(req.user.id);

    res.status(200).json("Expense has been successfully deleted");
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
