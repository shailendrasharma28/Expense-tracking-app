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
const nextPage = document.getElementById("next-page");
const prevPage = document.getElementById("prev-page");

let currentPath = window.location.pathname;
let expenses = {};
let editingId = null;
let limit = null;
let currentPage = 1;

// Initial load
window.addEventListener("DOMContentLoaded", reloadPage());

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
        window.location.href = "/expense/dashboard"
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
        expenses.rows.unshift(res.data);
        location.reload();
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
    limit = selectedValue;
    localStorage.setItem("limit", selectedValue)
    location.reload();
  } )
}

if(nextPage){
  nextPage.addEventListener("click", (e) => {
    e.preventDefault();
    if(currentPage < expenses.totalPages) {
      currentPage = Number(currentPage) + 1;
      localStorage.setItem("currentPage", currentPage)
      location.reload()
    } else if (currentPage >= expenses.totalPages) {
      nextPage.disabled = true
    }
  })
}

if(prevPage){
  prevPage.addEventListener("click", (e) => {
    e.preventDefault();
    if(currentPage > 1 && currentPage <= expenses.totalPages){
      currentPage = Number(currentPage) - 1;
      localStorage.setItem("currentPage", currentPage);
      location.reload();
    } else if (currentPage <= 1){
      prevPage.disabled = true;
    }
  })
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
    window.location.href = "/expense/leaderboard";
  });
}

if (reportsBtn) {
  reportsBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    // Now redirect
    window.location.href = "/expense/reports";
  });
}

if (payBtn) {
  const cashfree = Cashfree({
    mode: "sandbox",
  });
  payBtn.addEventListener("click", async () => {
     const user = localStorage.getItem("user-details");
    const userJson = JSON.parse(user);
    if(userJson.isPremium === true){
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
      redirectTarget: "_blank"
    };
    await cashfree.checkout(checkoutOptions);
  })
}

function renderExpenses() {
  expensesDiv.innerHTML = "<h1 id='myexpense-heading'>My Expenses</h1>";
  const pagesUl = document.getElementById("pages-ul");
  pagesUl.innerHTML = ""
  const totalPages = expenses.totalPages || 1;

  const paginationPageItem = document.createElement("li");
  paginationPageItem.textContent = `Page: ${currentPage}`;
  paginationPageItem.setAttribute("value", currentPage);
  paginationPageItem.classList.add("page-item");

  pagesUl.appendChild(paginationPageItem);

  const totalPagesCount = document.createElement("li");
  totalPagesCount.textContent = `Total pages: ${totalPages}`;
  totalPagesCount.classList.add("page-count-total");

  pagesUl.appendChild(totalPagesCount);
 

  expenses.rows.forEach((exp) => {
    const expenseItem = document.createElement("div");
    expenseItem.classList.add("expense-item");
    console.log(exp);
    
    expenseItem.innerHTML = `
        <h2>₹${exp.amount}</h2>
        <h2>${exp.description}</h2>
        <h2>${exp.category}</h2>
        <button onclick="deleteExpense('${exp._id}')">Delete</button>
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
    location.reload();
  } catch (err) {
    console.error("Error deleting expense:", err);
  }
};

if(sendMailForm){
  document.getElementById("sendMail-btn").addEventListener("click", async(e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    
    const sendOTP = await axios.post(`${baseUrl}/password/send-mail`, {email});
    const res = sendOTP.data
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
    window.location.href = "/login"
  })
}

if(newPassForm){
  newPassForm.addEventListener("submit", async(e) => {
    e.preventDefault();

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token'); 
    
    const new_password = document.getElementById("new_pass").value;
    
    const createNewPassword = await axios.post(`${baseUrl}/password/forgotpassword`, {new_password, token});
    const res = createNewPassword.data;
    
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
    window.location.href = "/login"
  })
}

async function reloadPage() {
  try {
    const token = localStorage.getItem("jwt");
    if (!token) {
      const allowPath = ["/login", "/signup", "/forget-password", "/reset-password"]
      if ( !allowPath.includes(window.location.pathname)) {
        window.location.href = "/login";
        return;
      }
    }
    if (expenseForm) {
      const token = localStorage.getItem("jwt");
      const updates = await axios.get(`${baseUrl}/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      localStorage.setItem("user-details", JSON.stringify(updates.data.user));
      const user = localStorage.getItem("user-details")
      const userJson = JSON.parse(user);
      if (userJson.isPremium === true) {
        premiumDiv.classList.remove("hidden");
      }
      pageLimit.value = localStorage.getItem("limit") || 5
      limit = localStorage.getItem("limit") || pageLimit.value || 10;
      currentPage = localStorage.getItem("currentPage") || 1;
      const res = await axios.get(`${baseUrl}/expenses?limit=${limit}&page=${currentPage}`, {
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
