import { FaTrash, FaEdit, FaWindowClose } from "react-icons/fa";
import { useEffect, useState } from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import { publicRequest } from "./requestMethods";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();

  const [addExpense, setAddExpense] = useState(false);
  const [showChats, setShowChats] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [update, setUpdate] = useState(false);
  const [label, setLabel] = useState("");
  const [amount, setValue] = useState("");
  const [date, setDate] = useState("");
  const [updatedId, setUpdatedID] = useState(null);
  const [updatedLabel, setUpdatedLabel] = useState("");
  const [updatedAmount, setUpdatedAmount] = useState("");
  const [updatedDate, setUpdatedDate] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("all");
  const [confirmLogout, setConfirmLogout] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const handleAddExpense = () => setAddExpense(!addExpense);
  const handleShowChart = () => setShowChats(!showChats);

  const validateLabel = (label) => {
    if (!label || label.trim().length === 0) {
      return "Label is required";
    }
    if (label.trim().length < 2) {
      return "Label must be at least 2 characters long";
    }
    if (label.trim().length > 50) {
      return "Label must be less than 50 characters";
    }
    if (!/^[a-zA-Z0-9\s\-_.,!@#$%^&*()]+$/.test(label.trim())) {
      return "Label contains invalid characters";
    }
    return null;
  };

  const validateAmount = (amount) => {
    if (!amount || amount.toString().trim() === "") {
      return "Amount is required";
    }
    const numAmount = Number(amount);
    if (isNaN(numAmount)) {
      return "Amount must be a valid number";
    }
    if (numAmount <= 0) {
      return "Amount must be greater than zero";
    }
    if (numAmount > 999999999) {
      return "Amount is too large";
    }
    if (!/^\d+(\.\d{1,2})?$/.test(amount.toString())) {
      return "Amount can have maximum 2 decimal places";
    }
    return null;
  };

  const validateDate = (date) => {
    if (!date) {
      return "Date is required";
    }
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (isNaN(selectedDate.getTime())) {
      return "Invalid date format";
    }
    if (selectedDate > today) {
      return "Future dates are not allowed";
    }

    const minDate = new Date("1900-01-01");
    if (selectedDate < minDate) {
      return "Date cannot be before 1900";
    }
    return null;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleUpdate = (id) => {
    setUpdatedID(id);
    const expense = expenses.find((e) => e._id === id);
    if (expense) {
      setUpdatedLabel(expense.label);
      setUpdatedAmount(expense.value);
      setUpdatedDate(expense.date);
    }
    setUpdate(true);
  };

  const handleExpense = async () => {
    const labelError = validateLabel(label);
    if (labelError) return toast.error(labelError);

    const amountError = validateAmount(amount);
    if (amountError) return toast.error(amountError);

    const dateError = validateDate(date);
    if (dateError) return toast.error(dateError);

    const token = localStorage.getItem("token");

    try {
      const res = await publicRequest.post(
        "/expenses",
        { label, date, value: Number(amount) },
        { headers: { token } }
      );
      setExpenses((prev) => [...prev, res.data]);
      toast.success("Expense added successfully");
      setLabel("");
      setValue("");
      setDate("");
      setAddExpense(false);
    } catch (error) {
      console.log("Error adding expense:", error);
      toast.error("Failed to add expense");
    }
  };

  useEffect(() => {
    const getExpenses = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await publicRequest.get("/expenses", {
          headers: { token },
        });
        setExpenses(res.data);
      } catch (error) {
        console.log("Error fetching expenses:", error);
      }
    };
    getExpenses();
  }, []);

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setConfirmDelete(true);
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await publicRequest.delete(`/expenses/${id}`, {
        headers: { token },
      });
      setExpenses((prev) => prev.filter((expense) => expense._id !== id));
      toast.success("Expense deleted successfully");
      setConfirmDelete(false);
    } catch (error) {
      console.log("Error deleting expense:", error);
      toast.error("Failed to delete expense");
    }
  };

  const updateExpense = async () => {
    const labelError = validateLabel(updatedLabel);
    if (labelError) return toast.error(labelError);

    const amountError = validateAmount(updatedAmount);
    if (amountError) return toast.error(amountError);

    const dateError = validateDate(updatedDate);
    if (dateError) return toast.error(dateError);

    const token = localStorage.getItem("token");

    try {
      const res = await publicRequest.put(
        `/expenses/${updatedId}`,
        {
          label: updatedLabel.trim(),
          date: updatedDate,
          value: Number(updatedAmount),
        },
        { headers: { token } }
      );
      setExpenses((prev) =>
        prev.map((expense) => (expense._id === updatedId ? res.data : expense))
      );
      toast.success("Expense updated successfully");
      setUpdate(false);
    } catch (error) {
      console.log("Error updating expense:", error);
      toast.error("Failed to update expense");
    }
  };

  const filteredExpenses = expenses
    .filter((expense) =>
      expense.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOption === "high") return b.value - a.value;
      if (sortOption === "low") return a.value - b.value;
      if (sortOption === "recent") return new Date(b.date) - new Date(a.date);
      if (sortOption === "old") return new Date(a.date) - new Date(b.date);
      return 0;
    });

  const totalSum = filteredExpenses.reduce((acc, curr) => acc + curr.value, 0);

  const handleLogout = () => {
    setConfirmLogout(true);
  };

  const confirmLogoutYes = () => {
    localStorage.removeItem("token");
    setConfirmLogout(false);
    toast.success("Logout successful");
    setTimeout(() => navigate("/login"), 1000);
  };

  const chartData = filteredExpenses.map((expense, index) => ({
    id: index,
    value: expense.value,
    label: expense.label,
  }));

  return (
    <div>
      <div className="flex flex-col justify-center items-center mt-[3%] w-[80%] mx-[5%] relative">
        <button
          className="absolute top-0 right-0 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          onClick={handleLogout}
        >
          Logout
        </button>

        <h1 className="text-4xl font-medium text-[#444]">Expense Tracker</h1>

        <div className="relative flex items-center justify-between mt-5 w-full">
          <div className="relative flex items-center gap-3">
            <button
              className="bg-red-500 p-[10px] text-white rounded hover:bg-red-600"
              onClick={handleAddExpense}
            >
              Add Expense
            </button>
            <button
              className="bg-blue-500 p-[10px] text-white rounded hover:bg-blue-600"
              onClick={handleShowChart}
            >
              Expenses Report
            </button>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="p-[10px] border border-[#444] rounded bg-[#eee] text-[#333] font-medium"
            >
              <option value="all">Sort By</option>
              <option value="high">High to Low</option>
              <option value="low">Low to High</option>
              <option value="recent">Recent First</option>
              <option value="old">Oldest First</option>
            </select>
          </div>

          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Search"
              className="p-2 w-[150px] border-2 border-[#444] rounded"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-5 p-4 bg-gray-100 rounded-lg w-full">
          <h2 className="text-2xl font-semibold text-center">
            Total Expenses: ₹{totalSum.toFixed(2)}
          </h2>
        </div>

        <div className="mt-5 w-full">
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No expenses found</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredExpenses.map((expense) => (
                <div
                  key={expense._id}
                  className="grid grid-cols-4 items-center gap-1 p-4 bg-amber-50 border border-gray-300 rounded-lg shadow-sm"
                >
                  <div>
                    <h3 className="font-semibold text-lg text-black">
                      {expense.label}
                    </h3>
                  </div>
                  <div>
                    <p className="font-semibold text-lg text-black">
                      {formatDate(expense.date)}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-lg text-black">
                      ₹{expense.value}
                    </span>
                  </div>
                  <div className="flex justify-end">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(expense._id)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(expense._id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {addExpense && (
          <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-96">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Add New Expense</h2>
                <button
                  onClick={() => setAddExpense(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaWindowClose size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Expense Label"
                  value={label}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 50) {
                      setLabel(value);
                    }
                  }}
                  maxLength="50"
                  className="w-full p-3 border border-gray-300 rounded"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (
                      value === "" ||
                      (!isNaN(value) &&
                        Number(value) >= 0 &&
                        Number(value) <= 999999999)
                    ) {
                      setValue(value);
                    }
                  }}
                  step="0.01"
                  min="0"
                  max="999999999"
                  className="w-full p-3 border border-gray-300 rounded"
                />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min="1900-01-01"
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full p-3 border border-gray-300 rounded"
                />
                <button
                  onClick={handleExpense}
                  className="w-full bg-green-500 text-white p-3 rounded hover:bg-green-600"
                >
                  Add Expense
                </button>
              </div>
            </div>
          </div>
        )}

        {update && (
          <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-96">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Update Expense</h2>
                <button
                  onClick={() => setUpdate(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaWindowClose size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Expense Label"
                  value={updatedLabel}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 50) {
                      setUpdatedLabel(value);
                    }
                  }}
                  maxLength="50"
                  className="w-full p-3 border border-gray-300 rounded"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={updatedAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (
                      value === "" ||
                      (!isNaN(value) &&
                        Number(value) >= 0 &&
                        Number(value) <= 999999999)
                    ) {
                      setUpdatedAmount(value);
                    }
                  }}
                  step="0.01"
                  min="0"
                  max="999999999"
                  className="w-full p-3 border border-gray-300 rounded"
                />
                <input
                  type="date"
                  value={updatedDate}
                  onChange={(e) => setUpdatedDate(e.target.value)}
                  min="1900-01-01"
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full p-3 border border-gray-300 rounded"
                />
                <button
                  onClick={updateExpense}
                  className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600"
                >
                  Update Expense
                </button>
              </div>
            </div>
          </div>
        )}

        {confirmDelete && (
          <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <p className="text-lg font-medium mb-4">
                Are you sure you want to delete this expense?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showChats && (
          <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-[600px] max-h-[80vh] overflow-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Expenses Report</h2>
                <div className="text-lg font-semibold text-gray-700">
                  Total: ₹{totalSum.toFixed(2)}
                </div>
                <button
                  onClick={() => setShowChats(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaWindowClose size={20} />
                </button>
              </div>
              {chartData.length > 0 ? (
                <div className="flex justify-center">
                  <PieChart
                    series={[
                      {
                        data: chartData,
                        highlightScope: {
                          faded: "global",
                          highlighted: "item",
                        },
                        faded: {
                          innerRadius: 30,
                          additionalRadius: -30,
                          color: "gray",
                        },
                      },
                    ]}
                    width={500}
                    height={300}
                  />
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No data available for chart</p>
                </div>
              )}
            </div>
          </div>
        )}

        {confirmLogout && (
          <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <p className="text-lg font-medium mb-4">
                Are you sure you want to logout?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={confirmLogoutYes}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Yes
                </button>
                <button
                  onClick={() => setConfirmLogout(false)}
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <ToastContainer position="top-center" />
      </div>
    </div>
  );
}

export default App;
