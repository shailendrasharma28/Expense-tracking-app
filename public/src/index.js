const baseUrl = "http://localhost:4000";

const signupForm = document.getElementById("signup-form");
const loginForm = document.getElementById("login-form");
const expenseForm = document.getElementById("expense-form");
const expenseAmount = document.getElementById("expense-amount");
const expenseType = document.getElementById("expense-type");
const categories = document.getElementById("categories");
const expensesDiv = document.getElementById("expenses");

let expenses = [];
let editingId = null;

// Initial load
window.addEventListener("DOMContentLoaded", async () => {
  try {
    const token = localStorage.getItem("jwt")
    const res = await axios.get(`${baseUrl}/expenses`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expenses = res.data;
    renderExpenses();
  } catch (err) {
    console.error("Error fetching expenses:", err);
  }
});


if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const data = { name, email, password };

    try {
      const createUser = await axios.post(`${baseUrl}/users/signup`, data);
      const res = createUser.data.message;
      if (createUser.data.success === false) {
        showToast(res, "error");
        signupForm.reset();
      } else {
        showToast(res, "success");
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMsg =
        error?.response?.data?.message || "Something went wrong!";
      showToast(errorMsg, "error");
    }

    signupForm.reset();
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    const data = { email, password };

    try {
      const login = await axios.post(`${baseUrl}/users/login`, data);
      const res = login.data.message;
      if (login.data.success === false) {
        showToast(res, "error");
      } else {
        showToast(res, "success");
        localStorage.setItem("user", true);
        localStorage.setItem("jwt", login.data.token)
        window.location.href = "/frontend/pages/expense.html"
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMsg =
        error?.response?.data?.message || "Something went wrong!";
      showToast(errorMsg, "error");
    }

    loginForm.reset();
  });
}

if(expenseForm){
  expenseForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const expense = {
      expenseAmount: expenseAmount.value,
      description: expenseType.value,
      category: categories.value,
    };

    try {
      if (editingId) {
        const res = await axios.put(`${baseUrl}/expenses/${editingId}`, expense);
        expenses = expenses.map((exp) =>
          exp.id === editingId ? res.data : exp
        );
        editingId = null;
      } else {
        const token = localStorage.getItem("jwt")
        const res = await axios.post(`${baseUrl}/expenses`, expense, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        expenses.push(res.data);
      }

      renderExpenses();
      expenseForm.reset();
    } catch (err) {
      console.error("Error saving expense:", err);
    }
  });
}


function renderExpenses() {
  expensesDiv.innerHTML = "";

  expenses.forEach((exp) => {
    const expenseItem = document.createElement("div");
    expenseItem.innerHTML = `
        <h2>₹${exp.expenseAmount}</h2>
        <h2>${exp.description}</h2>
        <h2>${exp.category}</h2>
        <button onclick="deleteExpense(${exp.id})">Delete</button>
    `;
    expensesDiv.appendChild(expenseItem);
  });
}

// Delete
window.deleteExpense = async function (id) {
  try {
    const token = localStorage.getItem("jwt")
    await axios.delete(`${baseUrl}/expenses/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    expenses = expenses.filter((exp) => exp.id !== id);
    renderExpenses();
  } catch (err) {
    console.error("Error deleting expense:", err);
  }
};


function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.className = `toast show ${type}`;

  // Show toast for 3 seconds
  setTimeout(() => {
    toast.className = `toast hidden`;
  }, 5000);
}
