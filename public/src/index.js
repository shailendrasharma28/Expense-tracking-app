const baseUrl = "http://localhost:4000";

const signupForm = document.getElementById("signup-form");
const loginForm = document.getElementById("login-form");
const expenseForm = document.getElementById("expense-form");
const expenseAmount = document.getElementById("expense-amount");
const expenseType = document.getElementById("expense-type");
const categories = document.getElementById("categories");
const expensesDiv = document.getElementById("expenses");
const paginationUl = document.getElementById("pagination-ui");
const payBtn = document.getElementById("pay-btn");
const premiumDiv = document.getElementById("premium-div");
const leaderboardBtn = document.getElementById("leaderboard-btn");
const reportsBtn = document.getElementById("reports-btn");
const sendMailForm = document.getElementById("sendMail-form");
const backToLoginForm = document.getElementById("back-to-login-form");
const newPassForm = document.getElementById("newPass-form");
const backToLoginAfterPassForm = document.getElementById("back-to-login-after-pass-form");
const pageLimit = document.getElementById("limit-select");

let expenses = {};
let editingId = null;

// Initial load
window.addEventListener("DOMContentLoaded", async () => {
  try {
    const token = localStorage.getItem("jwt");
    if (!token) {
      if (window.location.pathname !== "/index.html") {
        window.location.href = "/index.html";
        return;
      }
    }
    if (expenseForm) {
      const user = localStorage.getItem("user-details");

      const userJson = JSON.parse(user);
      if (userJson.is_premium === true) {
        premiumDiv.classList.remove("hidden");
      }
      const res = await axios.get(`${baseUrl}/expenses?limit=5&page=1`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      expenses = res.data;
      renderExpenses();
    }
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
    localStorage.clear()
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
        localStorage.setItem("user-details", JSON.stringify(login.data.user));
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
        expenses.rows.push(res.data);
      }

      renderExpenses();
      expenseForm.reset();
    } catch (err) {
      console.error("Error saving expense:", err);
    }
  });
}

if(pageLimit){
  pageLimit.addEventListener("change", (e) => {
    const selectedValue = e.target.value;
  } )
}

if (leaderboardBtn) {
  leaderboardBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("jwt");
    const leaderboardData = await axios.get(`${baseUrl}/premium/leaderboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Save data temporarily before redirecting
    localStorage.setItem(
      "leaderboardData",
      JSON.stringify(leaderboardData.data.leaderboard)
    );

    // Now redirect
    window.location.href = "/frontend/pages/leaderboard.html";
  });
}

if (reportsBtn) {
  reportsBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("jwt");
    const leaderboardData = await axios.get(`${baseUrl}/premium/leaderboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Save data temporarily before redirecting
    localStorage.setItem(
      "leaderboardData",
      JSON.stringify(leaderboardData.data.leaderboard)
    );

    // Now redirect
    window.location.href = "/frontend/pages/leaderboard.html";
  });
}

if (payBtn) {
  const cashfree = Cashfree({
    mode: "sandbox",
  });
  payBtn.addEventListener("click", async () => {
     const user = localStorage.getItem("user-details");
    const userJson = JSON.parse(user);
    if(userJson.is_premium === true){
      showToast("You are already a premium user!", "success");
      return
    }
    const token = localStorage.getItem("jwt");
    const createPayment = await axios.post(
      `${baseUrl}/payment/create`,
      { },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const paymentSessionId = createPayment.data.sessionId;
    let checkoutOptions = {
      paymentSessionId: paymentSessionId,
    };
    await cashfree.checkout(checkoutOptions);
  })
}

function renderExpenses() {
  expensesDiv.innerHTML = "<h1 id='myexpense-heading'>My Expenses</h1>";

  const pagesUl = document.getElementById("pages-ul");
  const totalPages = expenses.totalPages || 7;
  console.log("Total Pages:", totalPages);

  for (let i = 1; i <= totalPages; i++) {
    const paginationPageItem = document.createElement("li");
    paginationPageItem.textContent = i; 
    paginationPageItem.setAttribute("value", i); 
    paginationPageItem.classList.add("page-item");

    pagesUl.appendChild(paginationPageItem);
  }

  expenses.rows.forEach((exp) => {
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
    expenses.rows = expenses.rows.filter((exp) => exp.id !== id);
    renderExpenses();
  } catch (err) {
    console.error("Error deleting expense:", err);
  }
};

if(sendMailForm){
  document.getElementById("sendMail-btn").addEventListener("click", async(e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    console.log(email);
    
    const sendOTP = await axios.post(`${baseUrl}/password/send-mail`, {email});
    const res = sendOTP.data
    console.log(res);
    
    if(res.success === false){
      showToast(res.message, error);
      return
    }
    localStorage.setItem("userId", res.userId)
    showToast(res.message, "success");
    sendMailForm.classList.add("hidden");
    backToLoginForm.classList.remove("hidden");
  })
}

if(backToLoginForm){
  const createNewPassword = document.getElementById("back-to-login-btn");
  createNewPassword.addEventListener("click", async (e) => {
    e.preventDefault();
    window.location.href = "/index.html"
  })
}

if(newPassForm){
  newPassForm.addEventListener("submit", async(e) => {
    e.preventDefault();

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token'); 
    console.log(token);
    
    const new_password = document.getElementById("new_pass").value;
    console.log(new_password);
    
    const createNewPassword = await axios.post(`${baseUrl}/password/forgotpassword`, {new_password, token});
    const res = createNewPassword.data
    console.log(res);
    
    if(res.success === false){
      showToast(res.message, error);
      return
    }
    localStorage.setItem("userId", res.userId)
    showToast(res.message, "success");
    newPassForm.classList.add("hidden");
    backToLoginAfterPassForm.classList.remove("hidden");
  })
}

if(backToLoginAfterPassForm){
  const createNewPassword = document.getElementById("back-to-login-after-pass-btn");
  createNewPassword.addEventListener("click", async (e) => {
    e.preventDefault();
    window.location.href = "/index.html"
  })
}

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.className = `toast show ${type}`;

  // Show toast for 3 seconds
  setTimeout(() => {
    toast.className = `toast hidden`;
  }, 5000);
}
