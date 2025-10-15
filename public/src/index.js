const baseUrl = "http://localhost:4000";

const signupForm = document.getElementById("signup-form");
const loginForm = document.getElementById("login-form");

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
        loginForm.reset();
      } else {
        showToast(res, "success");
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

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.className = `toast show ${type}`;

  // Show toast for 3 seconds
  setTimeout(() => {
    toast.className = `toast hidden`;
  }, 5000);
}
