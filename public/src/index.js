const baseUrl = "http://localhost:3000/expenses";

const form = document.getElementById("form");
const expenseAmount = document.getElementById("expense-amount");
const expenseType = document.getElementById("expense-type");
const categories = document.getElementById("categories");
const expensesDiv = document.getElementById("expenses");

let expenses = [];
let editingId = null;

// Initial load
window.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await axios.get(`${baseUrl}/`);
    expenses = res.data;
    renderExpenses();
  } catch (err) {
    console.error("Error fetching expenses:", err);
  }
});

// Form submit
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const expense = {
    expenseAmount: expenseAmount.value,
    description: expenseType.value,
    category: categories.value,
  };

  try {
    if (editingId) {
      const res = await axios.put(`${baseUrl}/${editingId}`, expense);
      expenses = expenses.map((exp) => (exp.id === editingId ? res.data : exp));
      editingId = null;
    } else {
      const res = await axios.post(`${baseUrl}/`, expense);
      expenses.push(res.data);
    }

    renderExpenses();
    form.reset();
  } catch (err) {
    console.error("Error saving expense:", err);
  }
});

// Render UI
function renderExpenses() {
  expensesDiv.innerHTML = "";

  expenses.forEach((exp) => {
    const expenseItem = document.createElement("div");
    expenseItem.classList.add("expense-item"); // 👈 main container

    expenseItem.innerHTML = `
      <div class="expense-details">
        <h2 class="expense-amount">₹${exp.expenseAmount}</h2>
        <h2 class="expense-description">${exp.description}</h2>
        <h2 class="expense-category">${exp.category}</h2>
      </div>
      <div class="expense-actions">
        <button class="delete-btn" onclick="deleteExpense(${exp.id})">Delete</button>
        <button class="edit-btn" onclick="editExpense(${exp.id})">Edit</button>
      </div>
    `;

    expensesDiv.appendChild(expenseItem);
  });
}

// Delete
window.deleteExpense = async function (id) {
  try {
    await axios.delete(`${baseUrl}/${id}`);
    expenses = expenses.filter((exp) => exp.id !== id);
    renderExpenses();
  } catch (err) {
    console.error("Error deleting expense:", err);
  }
};

// Edit
window.editExpense = function (id) {
  const exp = expenses.find((e) => e.id === id);

  expenseAmount.value = exp.expenseAmount;
  expenseType.value = exp.description;
  categories.value = exp.category;

  editingId = id;
};
